import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'
import type { BaziPaipan3DState } from '~/composables/useBaziPaipan3D'
import type { BaziPaipan3DModel, ElementKey } from './model'
import type {
  CSS2DObject as CSS2DObjectInstance,
  CSS2DRenderer as CSS2DRendererInstance,
} from 'three/examples/jsm/renderers/CSS2DRenderer.js'

type ThreeObject = { dispose: () => void }
type Three = typeof import('three')
type Vector = import('three').Vector3
type Mesh = import('three').Mesh
type CSS2DObjectConstructor = typeof CSS2DObjectInstance
type CSS2DRendererLike = CSS2DRendererInstance

interface MountOptions {
  root: HTMLElement
  state: BaziPaipan3DState
  result: BaziChartResult
  model: BaziPaipan3DModel
  reducedMotion: boolean
  signal?: AbortSignal
  labels?: Record<string, string>
}

export interface BaziPaipan3DMount {
  dispose: () => void
  resetView: () => void
  setAutoRotate: (enabled: boolean) => void
}

const ELEMENT_COLORS: Record<ElementKey, number> = {
  wood: 0x5fd895,
  fire: 0xff7f68,
  earth: 0xe8b665,
  metal: 0xf1f5f9,
  water: 0x5d9bff,
}

const ELEMENT_HEX: Record<ElementKey, string> = {
  wood: '#4ade80',
  fire: '#fb7185',
  earth: '#fbbf24',
  metal: '#f8fafc',
  water: '#38bdf8',
}

const ELEMENT_ORDER: ElementKey[] = ['metal', 'water', 'wood', 'fire', 'earth']
const PILLAR_KEYS = ['year', 'month', 'day', 'hour'] as const

const GAN_ELEMENTS: Record<string, ElementKey> = {
  甲: 'wood', 乙: 'wood', 丙: 'fire', 丁: 'fire', 戊: 'earth',
  己: 'earth', 庚: 'metal', 辛: 'metal', 壬: 'water', 癸: 'water',
}

const ZHI_ELEMENTS: Record<string, ElementKey> = {
  寅: 'wood', 卯: 'wood', 巳: 'fire', 午: 'fire',
  辰: 'earth', 戌: 'earth', 丑: 'earth', 未: 'earth',
  申: 'metal', 酉: 'metal', 亥: 'water', 子: 'water',
}

const ELEMENT_ZH: Record<ElementKey, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
}

function elementKeyByLabel(label: string): ElementKey {
  return (Object.entries(ELEMENT_ZH) as Array<[ElementKey, string]>)
    .find(([, value]) => value === label)?.[0] ?? 'earth'
}

function ganElement(char = '金'): ElementKey {
  return GAN_ELEMENTS[char] ?? 'metal'
}

function qualityDpr(quality: 'high' | 'mid' | 'low') {
  return quality === 'high' ? Math.min(window.devicePixelRatio || 1, 2)
    : quality === 'mid' ? Math.min(window.devicePixelRatio || 1, 1.35) : 1
}

function detectQuality(): 'high' | 'mid' | 'low' {
  const requested = new URLSearchParams(window.location.search).get('bazi3dQuality')
  if (requested === 'high' || requested === 'mid' || requested === 'low') return requested

  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number }
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean, effectiveType?: string }
  }).connection
  const cores = navigator.hardwareConcurrency || 4
  if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') return 'low'
  if (cores <= 2 || (navigatorWithMemory.deviceMemory ?? 8) <= 2) return 'low'
  if (connection?.effectiveType === '3g') return 'mid'
  if (cores <= 4 || window.innerWidth < 640) return 'mid'
  return 'high'
}

export async function prefetchBaziPaipan3D() {
  if (typeof window === 'undefined' || detectQuality() === 'low') return
  await Promise.all([import('three'), import('~/utils/bazi-paipan-3d/renderer')])
}

function style(element: HTMLElement, rules: Partial<CSSStyleDeclaration>) {
  Object.assign(element.style, rules)
  return element
}

function chip(text: string, color: string, background = 'rgba(2, 6, 23, 0.86)', borderColor = 'rgba(148, 163, 184, 0.38)') {
  const element = document.createElement('div')
  element.className = 'bazi-3d-label'
  element.textContent = text
  return style(element, {
    padding: '3px 7px',
    border: `1px solid ${borderColor}`,
    borderRadius: '5px',
    background,
    color,
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontSize: '10px',
    fontWeight: '600',
    lineHeight: '1.3',
    whiteSpace: 'nowrap',
  })
}

function characterLabel(char: string, color: string, size = 30, glow: 'gold' | 'cyan' = 'gold') {
  const element = document.createElement('div')
  element.className = 'bazi-3d-label'
  element.textContent = char
  return style(element, {
    color,
    fontFamily: '"Noto Serif SC", "Songti SC", serif',
    fontSize: `${size}px`,
    fontWeight: '900',
    lineHeight: '1',
    textShadow: glow === 'cyan'
      ? '0 0 12px rgba(56, 189, 248, 0.6), 0 3px 10px rgba(0, 0, 0, 0.86)'
      : '0 0 12px rgba(245, 158, 11, 0.48), 0 3px 10px rgba(0, 0, 0, 0.86)',
  })
}

function disposeResources(resources: ThreeObject[]) {
  resources.slice().reverse().forEach((resource) => {
    try {
      resource.dispose()
    }
    catch {
      // Disposal is best-effort during an aborted or failed mount.
    }
  })
  resources.length = 0
}

export async function mountBaziPaipan3D(options: MountOptions): Promise<BaziPaipan3DMount> {
  const { root, state, result, model, reducedMotion, signal, labels = {} } = options
  const quality = detectQuality()
  state.quality.value = quality
  if (quality === 'low' || typeof WebGLRenderingContext === 'undefined') {
    state.state.value = 'static'
    return { dispose: () => undefined, resetView: () => undefined, setAutoRotate: () => undefined }
  }

  const resources: ThreeObject[] = []
  const clickable: Mesh[] = []
  const nodes = new Map<string, Mesh>()
  let disposed = false
  let renderer: import('three').WebGLRenderer | null = null
  let labelRenderer: CSS2DRendererLike | null = null
  let controls: import('three/examples/jsm/controls/OrbitControls.js').OrbitControls | null = null
  let stopSelectedWatcher: (() => void) | null = null
  let resizeObserver: ResizeObserver | null = null
  let intersectionObserver: IntersectionObserver | null = null
  let animationEnabled = false
  let cameraAnimating = false
  let autoRotateEnabled = !reducedMotion
  let autoRotateResume = 0
  let currentYearMesh: Mesh | null = null
  let handlePointerMove: ((event: PointerEvent) => void) | null = null
  let handlePointerLeave: (() => void) | null = null
  let handleClick: ((event: MouseEvent) => void) | null = null
  let handleContextLost: ((event: Event) => void) | null = null
  let handleVisibilityChange: (() => void) | null = null
  let resetViewAction: () => void = () => undefined

  const defaultCameraPosition = new (await import('three')).Vector3()
  const defaultCameraTarget = new (await import('three')).Vector3()
  const targetCameraPosition = new (await import('three')).Vector3()
  const targetCameraTarget = new (await import('three')).Vector3()

  const throwIfAborted = () => {
    if (signal?.aborted) throw new DOMException('Bazi 3D mount aborted', 'AbortError')
  }

  function dispose() {
    disposed = true
    stopSelectedWatcher?.()
    stopSelectedWatcher = null
    renderer?.setAnimationLoop(null)
    if (autoRotateResume) window.clearTimeout(autoRotateResume)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
    if (handlePointerMove && renderer) renderer.domElement.removeEventListener('pointermove', handlePointerMove)
    if (handlePointerLeave && renderer) renderer.domElement.removeEventListener('pointerleave', handlePointerLeave)
    if (handleClick && renderer) renderer.domElement.removeEventListener('click', handleClick)
    if (handleContextLost && renderer) renderer.domElement.removeEventListener('webglcontextlost', handleContextLost)
    if (handleVisibilityChange) document.removeEventListener('visibilitychange', handleVisibilityChange)
    controls?.dispose()
    disposeResources(resources)
    renderer?.domElement.remove()
    labelRenderer?.domElement.remove()
    controls = null
    renderer = null
    labelRenderer = null
  }

  try {
    throwIfAborted()
    const THREE = await import('three')
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
    const { CSS2DRenderer, CSS2DObject } = await import('three/examples/jsm/renderers/CSS2DRenderer.js')
    const { watch } = await import('vue')
    defaultCameraPosition.set(0, 18, 38)
    defaultCameraTarget.set(0, 1, 0)
    targetCameraPosition.copy(defaultCameraPosition)
    targetCameraTarget.copy(defaultCameraTarget)
    throwIfAborted()

    const width = Math.max(root.clientWidth, 1)
    const height = Math.max(root.clientHeight, 1)
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x03050b)
    scene.fog = new THREE.FogExp2(0x03050b, 0.0025)
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.copy(defaultCameraPosition)

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(qualityDpr(quality))
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.style.cursor = 'grab'
    root.appendChild(renderer.domElement)
    resources.push(renderer)

    labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(width, height)
    style(labelRenderer.domElement, { position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '1' })
    root.appendChild(labelRenderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = true
    controls.autoRotate = autoRotateEnabled
    controls.autoRotateSpeed = 0.6
    controls.minDistance = 12
    controls.maxDistance = 90
    controls.maxPolarAngle = Math.PI / 2 + 0.05
    controls.target.copy(defaultCameraTarget)

    scene.add(new THREE.AmbientLight(0x1e1b4b, 1.2))
    const centerLight = new THREE.PointLight(0xf59e0b, 2.5, 60)
    centerLight.position.set(0, 15, 0)
    scene.add(centerLight)
    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2)
    dirLight.position.set(20, 30, 20)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.set(2048, 2048)
    scene.add(dirLight)
    const rimLight = new THREE.PointLight(0xf43f5e, 2, 50)
    rimLight.position.set(-20, 10, -20)
    scene.add(rimLight)

    const starCount = quality === 'high' ? 4000 : 1600
    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)
    for (let index = 0; index < starCount; index += 1) {
      const radius = 100 + Math.random() * 150
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      starPositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
      starPositions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      starPositions[index * 3 + 2] = radius * Math.cos(phi)
      const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.25, 0.8, 0.6 + Math.random() * 0.4)
      starColors[index * 3] = color.r
      starColors[index * 3 + 1] = color.g
      starColors[index * 3 + 2] = color.b
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
    const starMaterial = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const stars = new THREE.Points(starGeometry, starMaterial)
    resources.push(starGeometry, starMaterial)
    scene.add(stars)

    const floatCount = quality === 'high' ? 800 : 280
    const floatGeometry = new THREE.BufferGeometry()
    const floatPositions = new Float32Array(floatCount * 3)
    for (let index = 0; index < floatPositions.length; index += 1) {
      floatPositions[index] = index % 3 === 0 ? (Math.random() - 0.5) * 60
        : index % 3 === 1 ? (Math.random() - 0.5) * 35 : (Math.random() - 0.5) * 60
    }
    floatGeometry.setAttribute('position', new THREE.BufferAttribute(floatPositions, 3))
    const floatMaterial = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x818cf8,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const floatParticles = new THREE.Points(floatGeometry, floatMaterial)
    resources.push(floatGeometry, floatMaterial)
    scene.add(floatParticles)

    const floorGroup = new THREE.Group()
    floorGroup.position.y = -3.5
    scene.add(floorGroup)
    const wxPositions = new Map<ElementKey, Vector>()
    ELEMENT_ORDER.forEach((key, index) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / 5
      wxPositions.set(key, new THREE.Vector3(Math.cos(angle) * 11, 0, Math.sin(angle) * 11))
    })
    const floorGeometry = new THREE.CylinderGeometry(13.5, 14, 0.4, 64)
    const floorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x090d16,
      roughness: 0.2,
      metalness: 0.9,
      clearcoat: 1,
      reflectivity: 0.8,
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.position.y = -0.2
    floor.receiveShadow = true
    resources.push(floorGeometry, floorMaterial)
    floorGroup.add(floor)
    const trimGeometry = new THREE.TorusGeometry(13.4, 0.08, 16, 100)
    const trimMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xb45309,
      emissiveIntensity: 0.3,
    })
    const trim = new THREE.Mesh(trimGeometry, trimMaterial)
    trim.rotation.x = Math.PI / 2
    resources.push(trimGeometry, trimMaterial)
    floorGroup.add(trim)

    const elementCount = (key: ElementKey) => {
      const item = result.energy.wuxing.find(candidate => elementKeyByLabel(candidate.key) === key)
      return item ? item.visibleCount : 0
    }
    const shengParticles: Array<{ mesh: Mesh, curve: import('three').QuadraticBezierCurve3, offset: number }> = []
    ELEMENT_ORDER.forEach((key, index) => {
      const position = wxPositions.get(key)!
      const count = elementCount(key)
      const group = new THREE.Group()
      group.position.copy(position)
      const sphereGeometry = new THREE.SphereGeometry(0.6 + count * 0.15, quality === 'high' ? 32 : 18, quality === 'high' ? 24 : 12)
      const sphereMaterial = new THREE.MeshPhysicalMaterial({
        color: ELEMENT_COLORS[key],
        emissive: ELEMENT_COLORS[key],
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.8,
        clearcoat: 1,
        transparent: true,
        opacity: 0.95,
      })
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.castShadow = true
      sphere.userData.nodeId = `element:${key}`
      resources.push(sphereGeometry, sphereMaterial)
      group.add(sphere)
      clickable.push(sphere)
      nodes.set(`element:${key}`, sphere)

      const auraGeometry = new THREE.SphereGeometry(1 + count * 0.18, 16, 12)
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: ELEMENT_COLORS[key],
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      })
      resources.push(auraGeometry, auraMaterial)
      group.add(new THREE.Mesh(auraGeometry, auraMaterial))

      const label = new CSS2DObject(chip(`${ELEMENT_ZH[key]} ${count}`, ELEMENT_HEX[key]))
      label.position.set(0, 1.8 + count * 0.1, 0)
      group.add(label)
      floorGroup.add(group)

      const nextKey = ELEMENT_ORDER[(index + 1) % 5]!
      const next = wxPositions.get(nextKey)!
      const mid = position.clone().add(next).multiplyScalar(0.5)
      const control = mid.clone().add(mid.clone().normalize().multiplyScalar(4))
      const curve = new THREE.QuadraticBezierCurve3(position, control, next)
      const curveGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50))
      const curveMaterial = new THREE.LineBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.45 })
      resources.push(curveGeometry, curveMaterial)
      floorGroup.add(new THREE.Line(curveGeometry, curveMaterial))

      const dotCount = quality === 'high' ? 6 : 3
      for (let dotIndex = 0; dotIndex < dotCount; dotIndex += 1) {
        const dotGeometry = new THREE.SphereGeometry(0.12, 10, 8)
        const dotMaterial = new THREE.MeshBasicMaterial({
          color: 0x4ade80,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        const dot = new THREE.Mesh(dotGeometry, dotMaterial)
        resources.push(dotGeometry, dotMaterial)
        floorGroup.add(dot)
        shengParticles.push({ mesh: dot, curve, offset: dotIndex / dotCount })
      }

      const overcomeKey = ELEMENT_ORDER[(index + 2) % 5]!
      const overcomeGeometry = new THREE.BufferGeometry().setFromPoints([position, wxPositions.get(overcomeKey)!])
      const overcomeMaterial = new THREE.LineDashedMaterial({
        color: 0xf43f5e,
        dashSize: 0.5,
        gapSize: 0.3,
        transparent: true,
        opacity: 0.5,
      })
      const overcomeLine = new THREE.Line(overcomeGeometry, overcomeMaterial)
      overcomeLine.computeLineDistances()
      resources.push(overcomeGeometry, overcomeMaterial)
      floorGroup.add(overcomeLine)
    })

    const pillarGroup = new THREE.Group()
    scene.add(pillarGroup)
    const pillarCoordinates: Vector[] = []
    const pillarX = [-7.5, -2.5, 2.5, 7.5]
    model.pillars.forEach((pillar, index) => {
      const ganKey = GAN_ELEMENTS[pillar.gan] ?? elementKeyByLabel(pillar.ganWuxing)
      const zhiKey = ZHI_ELEMENTS[pillar.zhi] ?? elementKeyByLabel(pillar.zhiWuxing)
      const x = pillarX[index] ?? 0
      const group = new THREE.Group()
      group.position.set(x, 0, 0)
      pillarCoordinates[index] = new THREE.Vector3(x, 1.8, 0)

      const bodyGeometry = new THREE.CylinderGeometry(0.7, 0.9, 8.5, quality === 'high' ? 24 : 14)
      const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: ELEMENT_COLORS[ganKey],
        emissive: ELEMENT_COLORS[ganKey],
        emissiveIntensity: pillar.key === 'day' ? 0.4 : 0.2,
        roughness: 0.1,
        metalness: 0.5,
        clearcoat: 1,
        transparent: true,
        opacity: 0.35,
      })
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
      body.position.y = 1
      body.castShadow = true
      body.userData.nodeId = `pillar:${pillar.key}`
      resources.push(bodyGeometry, bodyMaterial)
      group.add(body)
      clickable.push(body)
      nodes.set(`pillar:${pillar.key}`, body)

      const baseGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.5, 8)
      const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
      const base = new THREE.Mesh(baseGeometry, baseMaterial)
      base.position.y = -3.2
      base.receiveShadow = true
      resources.push(baseGeometry, baseMaterial)
      group.add(base)

      const ganGeometry = new THREE.SphereGeometry(0.9, quality === 'high' ? 32 : 18, quality === 'high' ? 24 : 12)
      const ganMaterial = new THREE.MeshPhysicalMaterial({
        color: ELEMENT_COLORS[ganKey],
        emissive: ELEMENT_COLORS[ganKey],
        emissiveIntensity: pillar.key === 'day' ? 1.2 : 0.7,
        roughness: 0.1,
        metalness: 0.9,
        clearcoat: 1,
      })
      const ganSphere = new THREE.Mesh(ganGeometry, ganMaterial)
      ganSphere.position.y = 4.8
      ganSphere.userData.nodeId = `pillar:${pillar.key}`
      resources.push(ganGeometry, ganMaterial)
      group.add(ganSphere)
      clickable.push(ganSphere)

      const zhiGeometry = new THREE.SphereGeometry(0.8, quality === 'high' ? 32 : 18, quality === 'high' ? 24 : 12)
      const zhiMaterial = new THREE.MeshPhysicalMaterial({
        color: ELEMENT_COLORS[zhiKey],
        emissive: ELEMENT_COLORS[zhiKey],
        emissiveIntensity: 0.7,
        roughness: 0.15,
        metalness: 0.8,
        clearcoat: 1,
      })
      const zhiSphere = new THREE.Mesh(zhiGeometry, zhiMaterial)
      zhiSphere.position.y = 1.8
      zhiSphere.userData.nodeId = `pillar:${pillar.key}`
      resources.push(zhiGeometry, zhiMaterial)
      group.add(zhiSphere)
      clickable.push(zhiSphere)

      if (pillar.key === 'day') {
        const crownGeometry = new THREE.TorusGeometry(1.3, 0.05, 16, 60)
        const crownMaterial = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        const crown = new THREE.Mesh(crownGeometry, crownMaterial)
        crown.rotation.x = Math.PI / 2
        crown.position.y = 4.8
        crown.userData.isCrown = true
        resources.push(crownGeometry, crownMaterial)
        group.add(crown)
      }

      const labelHost = style(document.createElement('div'), {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '5px',
        textAlign: 'center',
      })
      labelHost.className = 'bazi-3d-label'
      labelHost.append(
        chip(pillar.label, '#a5b4fc', 'rgba(15, 23, 42, 0.9)', 'rgba(99, 102, 241, 0.5)'),
        characterLabel(pillar.gan, ELEMENT_HEX[ganKey]),
        characterLabel(pillar.zhi, ELEMENT_HEX[zhiKey], 24, 'cyan'),
        chip(pillar.shishenGan, '#fbbf24', 'rgba(15, 23, 42, 0.84)', 'rgba(245, 158, 11, 0.5)'),
      )
      const label = new CSS2DObject(labelHost)
      label.position.set(0, 3.2, 0)
      group.add(label)
      pillarGroup.add(group)
    })

    const signalGroup = new THREE.Group()
    scene.add(signalGroup)
    const signalParticles: Array<{ mesh: Mesh, p1: Vector, p2: Vector, offset: number }> = []
    const seenSignals = new Set<string>()
    result.relations
      .filter(relation => relation.group === '地支' && relation.positions.length >= 2)
      .filter((relation) => {
        const id = `${relation.value}${relation.type}`
        if (seenSignals.has(id)) return false
        seenSignals.add(id)
        return true
      })
      .slice(0, 2)
      .forEach((relation) => {
        const points = relation.positions
          .map(label => PILLAR_KEYS.findIndex(key => result.pillars.find(pillar => pillar.key === key)?.label === label))
          .filter(index => index >= 0)
          .map(index => pillarCoordinates[index]!.clone())
        if (points.length < 2) return
        const supportive = /合|会/.test(relation.type)
        const color = supportive ? 0x22c55e : 0xf43f5e
        for (let index = 0; index < points.length - 1; index += 1) {
          const p1 = points[index]!
          const p2 = points[index + 1]!
          const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2])
          const material = new THREE.LineDashedMaterial({ color, dashSize: 0.4, gapSize: 0.2 })
          const line = new THREE.Line(geometry, material)
          line.computeLineDistances()
          resources.push(geometry, material)
          signalGroup.add(line)

          const particleCount = quality === 'high' ? 4 : 2
          for (let particleIndex = 0; particleIndex < particleCount; particleIndex += 1) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8)
            const particleMaterial = new THREE.MeshBasicMaterial({ color })
            const mesh = new THREE.Mesh(particleGeometry, particleMaterial)
            resources.push(particleGeometry, particleMaterial)
            signalGroup.add(mesh)
            signalParticles.push({ mesh, p1, p2, offset: particleIndex / particleCount })
          }
        }

        const labelHost = chip(
          `${relation.value}${relation.type}`,
          supportive ? '#6ee7b7' : '#fda4af',
          supportive ? 'rgba(6, 30, 23, 0.88)' : 'rgba(44, 6, 18, 0.88)',
          supportive ? 'rgba(34, 197, 94, 0.6)' : 'rgba(244, 63, 94, 0.6)',
        )
        const label = new CSS2DObject(labelHost)
        label.position.copy(points[0]!.clone().add(points[points.length - 1]!).multiplyScalar(0.5).setY(2.5))
        signalGroup.add(label)
      })

    const dayunGroup = new THREE.Group()
    scene.add(dayunGroup)
    const dayunZ = 8.5
    const dayunY = -4.5
    const dayunStartX = -15
    const dayunStep = Math.min(3.8, 34 / Math.max(result.dayuns.length - 1, 1))
    const riverPoints: Vector[] = []
    for (let index = 0; index <= 30; index += 1) {
      const t = index / 30
      riverPoints.push(new THREE.Vector3(dayunStartX - 2 + t * 34, dayunY + Math.sin(t * Math.PI * 2) * 0.4, dayunZ))
    }
    const riverCurve = new THREE.CatmullRomCurve3(riverPoints)
    const riverGeometry = new THREE.TubeGeometry(riverCurve, 64, 0.08, 8, false)
    const riverMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    resources.push(riverGeometry, riverMaterial)
    dayunGroup.add(new THREE.Mesh(riverGeometry, riverMaterial))

    result.dayuns.forEach((dayun) => {
      const x = dayunStartX + dayun.index * dayunStep
      const key = ganElement(dayun.ganzhi[0])
      const group = new THREE.Group()
      group.position.set(x, dayunY + 0.6, dayunZ)
      const steleGeometry = new THREE.BoxGeometry(0.65, 1.5, 0.3)
      const steleMaterial = new THREE.MeshPhysicalMaterial({
        color: ELEMENT_COLORS[key],
        emissive: ELEMENT_COLORS[key],
        emissiveIntensity: dayun.isCurrent ? 1 : 0.3,
        roughness: 0.1,
        metalness: 0.8,
        clearcoat: 1,
      })
      const stele = new THREE.Mesh(steleGeometry, steleMaterial)
      stele.position.y = 0.75
      stele.castShadow = true
      stele.userData.nodeId = `dayun:${dayun.index}`
      resources.push(steleGeometry, steleMaterial)
      group.add(stele)
      clickable.push(stele)
      nodes.set(`dayun:${dayun.index}`, stele)

      if (dayun.isCurrent) {
        const ringGeometry = new THREE.TorusGeometry(0.75, 0.04, 12, 32)
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9 })
        const ring = new THREE.Mesh(ringGeometry, ringMaterial)
        ring.rotation.x = Math.PI / 2
        ring.position.y = 1.6
        ring.userData.isCurrentRing = true
        resources.push(ringGeometry, ringMaterial)
        group.add(ring)
      }

      const age = document.createElement('div')
      age.textContent = `${dayun.startAge}-${dayun.endAge}`
      style(age, { color: '#94a3b8', fontSize: '9px' })
      const ganzhi = document.createElement('div')
      ganzhi.textContent = dayun.ganzhi
      style(ganzhi, { color: dayun.isCurrent ? '#fcd34d' : '#e2e8f0', fontSize: '13px', fontWeight: '800' })
      const tenGod = document.createElement('div')
      tenGod.textContent = dayun.shishenGan
      style(tenGod, { color: '#a5b4fc', fontSize: '9px' })
      const labelHost = style(document.createElement('div'), {
        padding: '4px 6px',
        border: dayun.isCurrent ? '1px solid rgba(251, 191, 36, 0.85)' : '1px solid rgba(30, 41, 59, 0.9)',
        borderRadius: '6px',
        background: dayun.isCurrent ? 'rgba(48, 24, 3, 0.92)' : 'rgba(2, 6, 23, 0.84)',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        textAlign: 'center',
      })
      labelHost.className = 'bazi-3d-label'
      labelHost.append(age, ganzhi, tenGod)
      const label = new CSS2DObject(labelHost)
      label.position.set(0, 2.3, 0)
      group.add(label)
      dayunGroup.add(group)
    })

    const currentDayun = result.dayuns.find(dayun => dayun.isCurrent)
    const currentYear = currentDayun?.liunian.find(year => year.isCurrent)
    if (currentDayun && currentYear) {
      const x = dayunStartX + currentDayun.index * dayunStep
      const position = new THREE.Vector3(x, dayunY + 3, dayunZ + 2.5)
      const geometry = new THREE.SphereGeometry(0.55, 32, 24)
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        emissive: 0xf43f5e,
        emissiveIntensity: 1.5,
        roughness: 0.1,
        metalness: 0.5,
        clearcoat: 1,
      })
      currentYearMesh = new THREE.Mesh(geometry, material)
      currentYearMesh.position.copy(position)
      currentYearMesh.userData.nodeId = `liunian:${currentYear.year}`
      resources.push(geometry, material)
      dayunGroup.add(currentYearMesh)
      clickable.push(currentYearMesh)
      nodes.set(`liunian:${currentYear.year}`, currentYearMesh)

      const linkGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, dayunY + 1.5, dayunZ),
        position,
      ])
      const linkMaterial = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 })
      resources.push(linkGeometry, linkMaterial)
      dayunGroup.add(new THREE.Line(linkGeometry, linkMaterial))

      const caption = document.createElement('div')
      caption.textContent = `${currentYear.year}`
      style(caption, { color: '#fecdd3', fontSize: '9px', fontWeight: '700' })
      const ganzhi = document.createElement('div')
      ganzhi.textContent = currentYear.ganzhi
      style(ganzhi, { color: '#fcd34d', fontSize: '13px', fontWeight: '900' })
      const labelHost = style(document.createElement('div'), {
        padding: '5px 8px',
        border: '1px solid rgba(244, 63, 94, 0.75)',
        borderRadius: '6px',
        background: 'rgba(52, 7, 20, 0.92)',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        textAlign: 'center',
      })
      labelHost.className = 'bazi-3d-label'
      labelHost.append(caption, ganzhi)
      const label = new CSS2DObject(labelHost)
      label.position.set(position.x, position.y + 1.2, position.z)
      dayunGroup.add(label)
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    function pickNode(event: MouseEvent) {
      if (!renderer || event.target !== renderer.domElement) return null
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      return raycaster.intersectObjects(clickable, false)[0]?.object.userData.nodeId as string | undefined ?? null
    }

    function moveCamera(position: Vector, target: Vector) {
      targetCameraPosition.copy(position)
      targetCameraTarget.copy(target)
      cameraAnimating = true
    }

    function focusNode(nodeId: string) {
      const object = nodes.get(nodeId)
      if (!object || !controls) return
      const focus = object.getWorldPosition(new THREE.Vector3())
      if (nodeId.startsWith('pillar:')) moveCamera(new THREE.Vector3(focus.x, 6, 14), focus)
      else if (nodeId.startsWith('element:')) moveCamera(new THREE.Vector3(focus.x, 2, focus.z + 12), focus)
      else if (nodeId.startsWith('dayun:') || nodeId.startsWith('liunian:')) moveCamera(new THREE.Vector3(focus.x, -1, focus.z + 10), focus)
      else moveCamera(new THREE.Vector3(focus.x, focus.y + 2, focus.z + 12), focus)
    }

    function resetView() {
      state.selectedNodeId.value = 'overview'
      moveCamera(defaultCameraPosition, defaultCameraTarget)
    }
    resetViewAction = resetView

    handlePointerMove = (event) => {
      const nodeId = pickNode(event)
      state.hoveredNodeId.value = nodeId
      if (renderer) renderer.domElement.style.cursor = nodeId ? 'pointer' : 'grab'
    }
    handlePointerLeave = () => {
      state.hoveredNodeId.value = null
      if (renderer) renderer.domElement.style.cursor = 'grab'
    }
    handleClick = (event) => {
      state.selectedNodeId.value = pickNode(event) ?? 'overview'
    }
    handleContextLost = (event) => {
      event.preventDefault()
      animationEnabled = false
      renderer?.setAnimationLoop(null)
      state.state.value = 'static'
      state.errorMessage.value = 'WebGL context lost'
    }

    renderer.domElement.addEventListener('pointermove', handlePointerMove)
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave)
    renderer.domElement.addEventListener('click', handleClick)
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost)
    controls.addEventListener('start', () => {
      controls!.autoRotate = false
      if (autoRotateResume) window.clearTimeout(autoRotateResume)
    })
    controls.addEventListener('end', () => {
      if (autoRotateResume) window.clearTimeout(autoRotateResume)
      autoRotateResume = window.setTimeout(() => {
        controls!.autoRotate = autoRotateEnabled && (!state.selectedNodeId.value || state.selectedNodeId.value === 'overview')
      }, 3200)
    })

    stopSelectedWatcher = watch(() => state.selectedNodeId.value, (nodeId) => {
      if (controls) controls.autoRotate = autoRotateEnabled && (!nodeId || nodeId === 'overview')
      if (!nodeId || nodeId === 'overview') moveCamera(defaultCameraPosition, defaultCameraTarget)
      else focusNode(nodeId)
    })

    function resize() {
      if (disposed || !root.clientWidth || !root.clientHeight || !renderer || !labelRenderer || !controls) return
      camera.aspect = root.clientWidth / root.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(root.clientWidth, root.clientHeight)
      labelRenderer.setSize(root.clientWidth, root.clientHeight)
    }
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(root)

    function updateAnimationLoop() {
      if (disposed || !renderer) return
      const shouldRender = animationEnabled && document.visibilityState === 'visible' && !signal?.aborted
      renderer.setAnimationLoop(shouldRender ? frame : null)
    }

    intersectionObserver = new IntersectionObserver((entries) => {
      animationEnabled = entries.some(entry => entry.isIntersecting)
      updateAnimationLoop()
    }, { threshold: 0 })
    intersectionObserver.observe(root)
    handleVisibilityChange = () => updateAnimationLoop()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const clock = new THREE.Clock()
    function frame() {
      if (disposed || !renderer || !controls || !labelRenderer) return
      const delta = clock.getDelta()
      const elapsed = clock.getElapsedTime()
      if (!reducedMotion) {
        stars.rotation.y = elapsed * 0.015
        floatParticles.rotation.y = elapsed * 0.02
      }
      shengParticles.forEach((particle) => {
        particle.mesh.position.copy(particle.curve.getPoint((elapsed * 0.25 + particle.offset) % 1))
      })
      signalParticles.forEach((particle) => {
        particle.mesh.position.lerpVectors(particle.p1, particle.p2, (elapsed * 0.5 + particle.offset) % 1)
      })
      pillarGroup.traverse((object) => {
        if (object.userData.isCrown === true) object.rotation.z += delta * 1.5
      })
      dayunGroup.traverse((object) => {
        if (object.userData.isCurrentRing === true) object.rotation.z += delta * 1.5
      })
      if (currentYearMesh && !reducedMotion) currentYearMesh.scale.setScalar(1 + Math.sin(elapsed * 3.5) * 0.08)
      if (cameraAnimating) {
        camera.position.lerp(targetCameraPosition, 0.06)
        controls.target.lerp(targetCameraTarget, 0.06)
        if (camera.position.distanceTo(targetCameraPosition) < 0.1) cameraAnimating = false
      }
      controls.update()
      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
    }

    state.state.value = 'ready'
    state.lifecycle.value = reducedMotion ? 'settled' : 'playing'
    animationEnabled = true
    updateAnimationLoop()
    state.selectedNodeId.value = 'overview'
  }
  catch (error) {
    dispose()
    if (!signal?.aborted) {
      state.state.value = 'static'
      state.errorMessage.value = error instanceof Error ? error.message : 'WebGL initialization failed'
    }
    return { dispose: () => undefined, resetView: () => undefined, setAutoRotate: () => undefined }
  }

  return {
    dispose,
    resetView: resetViewAction,
    setAutoRotate: (enabled: boolean) => {
      autoRotateEnabled = enabled && !reducedMotion
      if (controls) controls.autoRotate = autoRotateEnabled
    },
  }
}
