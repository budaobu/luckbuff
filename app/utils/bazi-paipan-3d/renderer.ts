import { watch } from 'vue'
import type * as ThreeNamespace from 'three'
import type { Pass } from 'three/examples/jsm/postprocessing/Pass.js'
import type { BaziPaipan3DState } from '~/composables/useBaziPaipan3D'
import type { BaziPaipan3DModel } from './model'
import { ELEMENT_KEYS, type ElementKey } from './model'

type ThreeObject = { dispose: () => void }
type EffectComposerLike = {
  addPass: (pass: Pass) => void
  setSize: (width: number, height: number) => void
  render: () => void
}

const ELEMENT_COLORS: Record<ElementKey, string> = {
  wood: '#5fd895',
  fire: '#ff7f68',
  earth: '#e8b665',
  metal: '#c7d3e5',
  water: '#5d9bff',
}

const ELEMENT_POSITIONS: Record<ElementKey, [number, number, number]> = {
  wood: [0, 0.3, -3.05],
  fire: [2.9, 0.08, -0.94],
  earth: [1.79, -0.14, 2.46],
  metal: [-1.79, -0.1, 2.46],
  water: [-2.9, 0.18, -0.94],
}

const GENERATION_ORDER: ElementKey[] = ['wood', 'fire', 'earth', 'metal', 'water']

interface MountOptions {
  root: HTMLElement
  state: BaziPaipan3DState
  model: BaziPaipan3DModel
  reducedMotion: boolean
}

function qualityDpr(quality: 'high' | 'mid' | 'low') {
  if (quality === 'high') return Math.min(window.devicePixelRatio || 1, 2)
  return quality === 'mid' ? Math.min(window.devicePixelRatio || 1, 1.35) : 1
}

function detectQuality(): 'high' | 'mid' | 'low' {
  const requested = new URLSearchParams(window.location.search).get('bazi3dQuality')
  if (requested === 'high' || requested === 'mid' || requested === 'low') return requested

  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number }
  const cores = navigator.hardwareConcurrency || 4
  if (cores <= 2 || (navigatorWithMemory.deviceMemory ?? 8) <= 2) return 'low'
  if (cores <= 4 || (navigatorWithMemory.deviceMemory ?? 8) <= 4 || window.innerWidth < 640) return 'mid'
  return 'high'
}

function radialGlow(THREE: typeof ThreeNamespace, resources: ThreeObject[]) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.92)')
    gradient.addColorStop(0.32, 'rgba(255, 255, 255, 0.34)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  resources.push(texture)
  return texture
}

function flowMaterial(
  THREE: typeof ThreeNamespace,
  resources: ThreeObject[],
  color: string,
  baseOpacity: number,
) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uActive: { value: 1 },
      uBaseOpacity: { value: baseOpacity },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uActive;
      uniform float uBaseOpacity;
      varying vec2 vUv;
      void main() {
        float stream = pow(max(0.0, 1.0 - abs(fract(vUv.x * 3.0 - uTime * 0.62) - 0.5) * 3.2), 4.0);
        float pulse = 0.38 + stream * 0.62;
        gl_FragColor = vec4(uColor * (0.66 + stream * 0.9), uBaseOpacity * pulse * uActive);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  resources.push(material)
  return material
}

function curvedPoints(
  THREE: typeof ThreeNamespace,
  from: [number, number, number],
  to: [number, number, number],
  kind: 'generates' | 'controls',
) {
  const start = new THREE.Vector3(...from)
  const end = new THREE.Vector3(...to)
  const middle = start.clone().add(end).multiplyScalar(0.5)
  const outward = middle.clone().setY(0).normalize().multiplyScalar(kind === 'generates' ? 0.58 : 1.08)
  middle.add(outward)
  middle.y += kind === 'generates' ? 0.46 : 0.14

  if (kind === 'generates') return [start, middle, end]

  const along = end.clone().sub(start).normalize()
  const side = new THREE.Vector3().crossVectors(along, new THREE.Vector3(0, 1, 0)).normalize()
  const points = [start]
  for (let index = 1; index < 5; index += 1) {
    const point = start.clone().lerp(end, index / 5)
    point.addScaledVector(side, (index % 2 === 0 ? -1 : 1) * (0.16 - index * 0.018))
    point.y += Math.sin(index * 2.1) * 0.08
    points.push(point)
  }
  points.push(end)
  return points
}

export async function mountBaziPaipan3D(options: MountOptions) {
  const { root, state, model, reducedMotion } = options
  const quality = detectQuality()
  state.quality.value = quality

  if (quality === 'low' || typeof WebGLRenderingContext === 'undefined') {
    state.state.value = 'static'
    return () => undefined
  }

  let disposed = false
  const resources: ThreeObject[] = []
  const texts: ThreeNamespace.Mesh<ThreeNamespace.BufferGeometry, ThreeNamespace.ShaderMaterial>[] = []
  let renderer: ThreeNamespace.WebGLRenderer
  let scene: ThreeNamespace.Scene
  let camera: ThreeNamespace.PerspectiveCamera
  let composer: EffectComposerLike | null = null
  let bloomPass: Pass | null = null
  let resizeObserver: ResizeObserver | null = null
  let handlePointerMove: ((event: PointerEvent) => void) | null = null
  let handleClearHover: (() => void) | null = null
  let handleWheel: ((event: WheelEvent) => void) | null = null
  let handlePointerDown: ((event: PointerEvent) => void) | null = null
  let handlePointerUp: ((event: PointerEvent) => void) | null = null
  let tunnelDragPointerId: number | null = null
  let tunnelDragLastY = 0

  try {
    const THREE = await import('three')
    const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js')
    const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js')
    const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js')
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js')
    const { KTX2Loader } = await import('three/examples/jsm/loaders/KTX2Loader.js')
    const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')

    const width = Math.max(root.clientWidth, 1)
    const height = Math.max(root.clientHeight, 1)
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setClearColor(0x05070e, 1)
    renderer.setPixelRatio(qualityDpr(quality))
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.92
    root.appendChild(renderer.domElement)
    resources.push(renderer)

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
    scene = new THREE.Scene()
    scene.environment = environment
    scene.environmentIntensity = 0.52
    resources.push(pmremGenerator, environment)

    const atlasTexture = await new THREE.TextureLoader().loadAsync('/assets/bazi-paipan-3d/bazi-glyphs-sdf.png')
    atlasTexture.colorSpace = THREE.NoColorSpace
    atlasTexture.generateMipmaps = true
    atlasTexture.minFilter = THREE.LinearMipmapLinearFilter
    atlasTexture.magFilter = THREE.LinearFilter
    atlasTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
    resources.push(atlasTexture)

    scene.fog = new THREE.FogExp2(0x05070e, 0.055)
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
    camera.position.set(0, 0.5, 9.2)
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.HemisphereLight(0x7f8ea8, 0x150b05, 0.28))
    const keyLight = new THREE.DirectionalLight(0xffd8a5, 1.65)
    keyLight.position.set(3.2, 4.2, 4.8)
    const backLight = new THREE.DirectionalLight(0x7fa2ff, 0.78)
    backLight.position.set(-3.8, 1.5, -4.2)
    scene.add(backLight)
    scene.add(keyLight)

    const galaxy = new THREE.Group()
    galaxy.visible = false
    scene.add(galaxy)

    const glowTexture = radialGlow(THREE, resources)
    const glyphOrder = [...new Set('甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥')]

    function createGlyphMesh(char: string, color: string, size = 0.56) {
      const glyphIndex = glyphOrder.indexOf(char)
      const glyphGeometry = new THREE.PlaneGeometry(size, size)
      const uvAttribute = glyphGeometry.getAttribute('uv')
      const column = glyphIndex % 6
      const row = Math.floor(glyphIndex / 6)
      for (let uvIndex = 0; uvIndex < uvAttribute.count; uvIndex += 1) {
        uvAttribute.setXY(
          uvIndex,
          (column + uvAttribute.getX(uvIndex)) / 6,
          1 - (row + 1 - uvAttribute.getY(uvIndex)) / 4,
        )
      }
      resources.push(glyphGeometry)

      const mesh = new THREE.Mesh(glyphGeometry, new THREE.ShaderMaterial({
        uniforms: {
          uAtlas: { value: atlasTexture },
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uAtlas;
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            float distance = texture2D(uAtlas, vUv).r;
            float alpha = smoothstep(0.46, 0.54, distance);
            gl_FragColor = vec4(uColor, alpha * uOpacity);
          }
        `,
        transparent: true,
        depthWrite: false,
      }))
      resources.push(mesh.material)
      return mesh as ThreeNamespace.Mesh<ThreeNamespace.PlaneGeometry, ThreeNamespace.ShaderMaterial>
    }

    const particleMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      size: quality === 'high' ? 0.058 : 0.075,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    resources.push(particleMaterial)

    const clusterParticles: { points: ThreeNamespace.Points, elementKey: ElementKey }[] = []
    for (const elementKey of ELEMENT_KEYS) {
      const cluster = model.clusters.find(item => item.elementKey === elementKey)
      if (!cluster) continue
      const count = quality === 'high' ? 420 : 130
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      const center = new THREE.Vector3(...ELEMENT_POSITIONS[elementKey])
      const color = new THREE.Color(ELEMENT_COLORS[elementKey])
      const clusterScale = 0.66 + Math.sqrt(cluster.percent / 100) * 1.28

      for (let index = 0; index < count; index += 1) {
        const angle = Math.random() * Math.PI * 2
        const elevation = (Math.random() - 0.5) * Math.PI
        const radius = clusterScale * (0.24 + Math.cbrt(Math.random()) * 0.76)
        positions[index * 3] = center.x + Math.cos(angle) * Math.cos(elevation) * radius
        positions[index * 3 + 1] = center.y + Math.sin(elevation) * radius * 0.64
        positions[index * 3 + 2] = center.z + Math.sin(angle) * Math.cos(elevation) * radius
        const variance = 0.66 + Math.random() * 0.5
        colors[index * 3] = color.r * variance
        colors[index * 3 + 1] = color.g * variance
        colors[index * 3 + 2] = color.b * variance
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      resources.push(geometry)
      const points = new THREE.Points(geometry, particleMaterial)
      points.userData = { elementKey, clusterScale }
      galaxy.add(points)
      clusterParticles.push({ points, elementKey })
    }

    const starGeometry = new THREE.SphereGeometry(1, 24, 18)
    resources.push(starGeometry)
    const starMaterials: ThreeNamespace.MeshBasicMaterial[] = []
    const starMeshes: ThreeNamespace.Object3D[] = []
    const raycastMeshes: ThreeNamespace.Mesh[] = []
    const glowMaterials: { material: ThreeNamespace.SpriteMaterial, elementKey: ElementKey }[] = []
    const characterPositions = new Map<string, ThreeNamespace.Vector3>()

    for (const elementKey of ELEMENT_KEYS) {
      const members = model.characters.filter(character => character.elementKey === elementKey)
      members.forEach((character, memberIndex) => {
        const center = new THREE.Vector3(...ELEMENT_POSITIONS[elementKey])
        const angle = (memberIndex / Math.max(members.length, 1)) * Math.PI * 2 + 0.5
        const radius = 0.86 + (memberIndex % 2) * 0.22
        center.x += Math.cos(angle) * radius
        center.y += Math.sin(angle) * 0.44
        center.z += Math.sin(angle) * radius

        const material = new THREE.MeshBasicMaterial({
          color: character.isDayMaster ? '#ffd884' : ELEMENT_COLORS[elementKey],
          transparent: true,
          opacity: 0.98,
        })
        resources.push(material)
        starMaterials.push(material)

        const star = new THREE.Mesh(starGeometry, material)
        star.position.copy(center)
        star.scale.setScalar(character.isDayMaster ? 0.17 : 0.14)
        star.userData = { characterId: character.id, elementKey, baseScale: star.scale.x }
        galaxy.add(star)
        starMeshes.push(star)
        raycastMeshes.push(star)
        characterPositions.set(character.id, center.clone())

        const glow = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTexture,
          color: character.isDayMaster ? '#ffd884' : ELEMENT_COLORS[elementKey],
          transparent: true,
          opacity: character.isDayMaster ? 0.9 : 0.58,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }))
        resources.push(glow.material)
        glowMaterials.push({ material: glow.material, elementKey })
        glow.position.copy(center)
        glow.scale.setScalar(character.isDayMaster ? 0.95 : 0.66)
        glow.userData = { characterId: character.id, baseOpacity: glow.material.opacity }
        galaxy.add(glow)
        starMeshes.push(glow)

        const text = createGlyphMesh(character.char, character.isDayMaster ? '#fff2ce' : '#f4f8ff')
        text.material.uniforms.uOpacity!.value = 1
        text.position.copy(center).add(new THREE.Vector3(0, 0.3, 0))
        text.userData = { characterId: character.id, elementKey }
        galaxy.add(text)
        texts.push(text)
      })
    }

    const relationLines: { mesh: ThreeNamespace.Mesh, material: ThreeNamespace.ShaderMaterial, relationId: string }[] = []
    for (const relation of model.relations) {
      const from = ELEMENT_POSITIONS[relation.from]
      const to = ELEMENT_POSITIONS[relation.to]
      const points = curvedPoints(THREE, from, to, relation.kind)
      const curve = new THREE.CatmullRomCurve3(points)
      const geometry = new THREE.TubeGeometry(curve, quality === 'high' ? 84 : 44, relation.kind === 'generates' ? 0.024 : 0.018, 6, false)
      const material = flowMaterial(
        THREE,
        resources,
        relation.kind === 'generates' ? ELEMENT_COLORS[relation.to] : '#ff5f7e',
        relation.kind === 'generates' ? 0.46 : 0.34,
      )
      resources.push(geometry)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.userData = { relationId: relation.id }
      galaxy.add(mesh)
      relationLines.push({ mesh, material, relationId: relation.id })
    }

    const compass = new THREE.Group()
    scene.add(compass)
    const dracoLoader = new DRACOLoader()
      .setDecoderPath('/assets/bazi-paipan-3d/decoders/draco/')
    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath('/assets/bazi-paipan-3d/decoders/basis/')
      .detectSupport(renderer)
    const instrumentLoader = new GLTFLoader()
      .setDRACOLoader(dracoLoader)
      .setKTX2Loader(ktx2Loader)
    const instrumentGltf = await instrumentLoader.loadAsync('/assets/bazi-paipan-3d/instrument.glb')
    const instrumentRoot = instrumentGltf.scene
    instrumentRoot.name = 'instrumentRoot'
    const instrumentRings: ThreeNamespace.Mesh[] = []
    instrumentRoot.traverse((object) => {
      const mesh = object as ThreeNamespace.Mesh
      if (mesh.isMesh !== true) return
      resources.push(mesh.geometry)
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        resources.push(material)
        for (const texture of Object.values(material).filter(value => value?.isTexture === true)) {
          resources.push(texture as ThreeObject)
        }
      }
      if (mesh.name.startsWith('ring_')) {
        mesh.rotation.x = Math.PI / 2
        instrumentRings.push(mesh)
      }
      if (mesh.name === 'instrument_base') {
        mesh.rotation.x = Math.PI / 2
        mesh.position.z = -0.38
        mesh.scale.setScalar(0.72)
      }
    })
    compass.add(instrumentRoot)
    dracoLoader.dispose()
    ktx2Loader.dispose()
    const compassRings: {
      mesh: ThreeNamespace.Mesh<ThreeNamespace.TorusGeometry, ThreeNamespace.MeshBasicMaterial>
      labels: ThreeNamespace.Mesh<ThreeNamespace.PlaneGeometry, ThreeNamespace.ShaderMaterial>[]
      targetOpacity: number
    }[] = []
    const plaqueGroups: ThreeNamespace.Group[] = []
    const plaqueTargets: [number, number][] = [
      [-1.06, 0.52],
      [1.06, 0.52],
      [-1.06, -0.48],
      [1.06, -0.48],
    ]
    const plaqueLabels: ThreeNamespace.Mesh<ThreeNamespace.PlaneGeometry, ThreeNamespace.ShaderMaterial>[][] = []
    const plaqueMaterials: ThreeNamespace.MeshPhysicalMaterial[] = []
    const plaqueHitMeshes: ThreeNamespace.Mesh[] = []
    const tunnelHitMeshes: ThreeNamespace.Mesh[] = []
    const compassRadii = [2.35, 1.85, 1.35, 0.88]

    for (let index = 0; index < 4; index += 1) {
      const gan = model.characters[index * 2]
      const zhi = model.characters[index * 2 + 1]
      if (!gan || !zhi) continue

      const ringGeometry = new THREE.TorusGeometry(compassRadii[index]!, 0.018, 10, 128)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: index === 2 ? '#ffd884' : '#8ba0c8',
        transparent: true,
        opacity: 0,
      })
      resources.push(ringGeometry, ringMaterial)
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      compass.add(ring)

      const plaqueGroup = new THREE.Group()
      const [targetX, targetY] = plaqueTargets[index]!
      plaqueGroup.position.set(targetX, targetY, 0.28)
      const plaqueMaterial = new THREE.MeshPhysicalMaterial({
        color: index === 2 ? '#2f7d5a' : '#226048',
        roughness: 0.2,
        metalness: 0,
        clearcoat: 0.74,
        clearcoatRoughness: 0.13,
        emissive: new THREE.Color(index === 2 ? '#39a374' : '#267a58'),
        emissiveIntensity: index === 2 ? 0.2 : 0.1,
        transparent: true,
        opacity: 0,
      })
      resources.push(plaqueMaterial)
      plaqueMaterials.push(plaqueMaterial)
      const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.82, 0.05), plaqueMaterial)
      resources.push(plaque.geometry)
      plaque.name = `plaque_${gan.pillarKey}`
      plaque.userData = { pillarKey: gan.pillarKey }
      plaqueGroup.add(plaque)
      plaqueHitMeshes.push(plaque)

      const plaqueGlyphs = [
        { character: gan, offsetX: -0.145 },
        { character: zhi, offsetX: 0.145 },
      ].map(({ character, offsetX }, glyphIndex) => {
        const isDayMasterStem = index === 2 && glyphIndex === 0
        const label = createGlyphMesh(character.char, isDayMasterStem ? '#fff8dd' : '#eefaf2', 0.3)
        label.position.set(offsetX, -0.02, 0.042)
        label.material.uniforms.uOpacity!.value = 0
        plaqueGroup.add(label)
        return label
      })

      compass.add(plaqueGroup)
      plaqueGroups.push(plaqueGroup)
      plaqueLabels.push(plaqueGlyphs)
      const labels: ThreeNamespace.Mesh<ThreeNamespace.PlaneGeometry, ThreeNamespace.ShaderMaterial>[] = []

      compassRings.push({ mesh: ring, labels, targetOpacity: index === 2 ? 0.96 : 0.78 })
    }
    for (const ring of compassRings) ring.mesh.visible = false
    const shockwaveGeometry = new THREE.TorusGeometry(0.82, 0.014, 8, 128)
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
      color: '#ffd884',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    resources.push(shockwaveGeometry, shockwaveMaterial)
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial)
    shockwave.visible = false
    compass.add(shockwave)

    const tunnel = new THREE.Group()
    tunnel.visible = false
    scene.add(tunnel)
    const tunnelSpacing = 4.3
    const gateCount = model.dayuns.length
    const gateGeometry = new THREE.TorusGeometry(1.32, 0.026, 12, 128)
    const gateMaterial = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      metalness: 0.84,
      roughness: 0.26,
      envMapIntensity: 0.72,
    })
    const gateRings = new THREE.InstancedMesh(gateGeometry, gateMaterial, gateCount)
    gateRings.instanceMatrix.setUsage(THREE.StaticDrawUsage)
    resources.push(gateGeometry, gateMaterial, gateRings)
    tunnel.add(gateRings)
    const currentGateGeometry = new THREE.TorusGeometry(0.18, 0.022, 10, 128)
    const currentGateMaterial = new THREE.MeshBasicMaterial({
      color: '#c07818',
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      depthWrite: false,
    })
    const currentGateMarker = new THREE.Mesh(currentGateGeometry, currentGateMaterial)
    currentGateMarker.renderOrder = 10
    currentGateMarker.visible = false
    resources.push(currentGateGeometry, currentGateMaterial)
    tunnel.add(currentGateMarker)

    const tickGeometry = new THREE.BoxGeometry(0.018, 0.095, 0.018)
    const tickMaterial = new THREE.MeshStandardMaterial({
      color: '#b9c7dd',
      metalness: 0.52,
      roughness: 0.32,
    })
    const gateTicks = new THREE.InstancedMesh(tickGeometry, tickMaterial, gateCount * 10)
    gateTicks.instanceMatrix.setUsage(THREE.StaticDrawUsage)
    resources.push(tickGeometry, tickMaterial, gateTicks)
    tunnel.add(gateTicks)
    const gateHitGeometry = new THREE.TorusGeometry(1.32, 0.14, 8, 72)
    const gateHitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    const gateHitMesh = new THREE.InstancedMesh(gateHitGeometry, gateHitMaterial, gateCount)
    gateHitMesh.userData = { dayunIndexes: model.dayuns.map(dayun => dayun.index) }
    resources.push(gateHitGeometry, gateHitMaterial, gateHitMesh)
    tunnel.add(gateHitMesh)
    tunnelHitMeshes.push(gateHitMesh)
    const tunnelLabels: { dayunIndex: number, labels: ThreeNamespace.Mesh<ThreeNamespace.PlaneGeometry, ThreeNamespace.ShaderMaterial>[] }[] = []

    const gateDummy = new THREE.Object3D()
    model.dayuns.forEach((dayun, gateIndex) => {
      gateDummy.position.set(0, 0, -gateIndex * tunnelSpacing)
      gateDummy.rotation.set(0, 0, 0)
      gateDummy.scale.setScalar(1)
      gateDummy.updateMatrix()
      gateRings.setMatrixAt(gateIndex, gateDummy.matrix)
      gateHitMesh.setMatrixAt(gateIndex, gateDummy.matrix)
      gateRings.setColorAt(gateIndex, new THREE.Color(dayun.isCurrent ? '#ffd884' : '#667795'))

      for (let yearIndex = 0; yearIndex < 10; yearIndex++) {
        const angle = Math.PI * 2 * yearIndex / 10 + Math.PI / 10
        gateDummy.position.set(
          Math.cos(angle) * 1.32,
          Math.sin(angle) * 1.32,
          -gateIndex * tunnelSpacing,
        )
        gateDummy.rotation.set(0, 0, angle + Math.PI / 2)
        gateDummy.scale.setScalar(1)
        gateDummy.updateMatrix()
        gateTicks.setMatrixAt(gateIndex * 10 + yearIndex, gateDummy.matrix)
      }

      const [gan, zhi] = [...dayun.ganzhi]
      const labels = [
        { character: gan, angle: -Math.PI / 5 },
        { character: zhi, angle: Math.PI / 5 },
      ].filter(item => item.character).map(({ character, angle }) => {
        const label = createGlyphMesh(character!, dayun.isCurrent ? '#fff2ce' : '#dce5f4', 0.3)
        label.material.uniforms.uOpacity!.value = 0.96
        label.position.set(Math.cos(angle) * 1.32, Math.sin(angle) * 1.32, -gateIndex * tunnelSpacing)
        tunnel.add(label)
        return label
      })
      tunnelLabels.push({ dayunIndex: dayun.index, labels })
    })
    gateRings.instanceMatrix.needsUpdate = true
    gateHitMesh.instanceMatrix.needsUpdate = true
    if (gateRings.instanceColor) gateRings.instanceColor.needsUpdate = true
    gateTicks.instanceMatrix.needsUpdate = true

    const cameraTarget = new THREE.Vector3()
    let timelineTime = state.introCompleted.value ? 6 : 0
    let timelinePaused = false
    let replayToken = 0

    function applyScene(mode: 'compass' | 'galaxy' | 'tunnel') {
      compass.visible = mode === 'compass'
      galaxy.visible = mode === 'galaxy'
      tunnel.visible = mode === 'tunnel'
      if (mode === 'compass' && timelinePaused) return
      if (mode === 'compass') {
        if (state.introCompleted.value && !timelinePaused) {
          timelineTime = 6
          state.lifecycle.value = 'settled'
        }
        camera.position.set(0, 0, timelineTime >= 6 ? 7 : 8.4)
      }
      else if (mode === 'galaxy') {
        camera.position.set(0, 0.5, 9.2)
        clusterParticles.forEach(particle => particle.points.visible = true)
        relationLines.forEach(line => line.mesh.visible = true)
        starMeshes.forEach(object => object.visible = true)
        texts.forEach(text => text.visible = true)
      }
    }

    watch(() => state.scene.value, (mode) => {
      if (mode !== 'compass') state.introCompleted.value = true
      applyScene(mode)
    }, { immediate: true })

    if (quality === 'high') {
      const nextComposer = new EffectComposer(renderer)
      nextComposer.addPass(new RenderPass(scene, camera))
      bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.22, 0.48, 0.86)
      nextComposer.addPass(bloomPass)
      composer = nextComposer
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    function relatedElementKeys(hoveredId: string | null) {
      const hovered = model.characters.find(character => character.id === hoveredId)
      if (!hovered) return null
      return new Set([
        hovered.elementKey,
        GENERATION_ORDER[(GENERATION_ORDER.indexOf(hovered.elementKey) + 1) % GENERATION_ORDER.length]!,
        GENERATION_ORDER[(GENERATION_ORDER.indexOf(hovered.elementKey) + 4) % GENERATION_ORDER.length]!,
        GENERATION_ORDER[(GENERATION_ORDER.indexOf(hovered.elementKey) + 2) % GENERATION_ORDER.length]!,
        GENERATION_ORDER[(GENERATION_ORDER.indexOf(hovered.elementKey) + 3) % GENERATION_ORDER.length]!,
      ])
    }

    function setPointer(event: PointerEvent) {
      const bounds = root.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    }

    function hoverFromPointer(event: PointerEvent) {
      if (tunnelDragPointerId !== null) {
        moveTunnelDrag(event)
        return
      }
      setPointer(event)
      raycaster.setFromCamera(pointer, camera)
      if (state.scene.value === 'tunnel') {
        state.hoveredCharacterId.value = null
        if (event.type !== 'click') return
        const tunnelHits = raycaster.intersectObjects(tunnelHitMeshes, false)
        const hit = tunnelHits[0]
        const dayunIndexes = hit?.object.userData.dayunIndexes as number[] | undefined
        const dayunIndex = hit?.instanceId !== undefined
          ? dayunIndexes?.[hit.instanceId]
          : hit?.object.userData.dayunIndex as number | undefined
        if (dayunIndex !== undefined) state.selectedDayunIndex.value = dayunIndex
        return
      }
      if (state.scene.value === 'compass') {
        const plaqueHits = raycaster.intersectObjects(plaqueHitMeshes, false)
        const pillarKey = plaqueHits[0]?.object.userData.pillarKey as string | undefined
        state.hoveredPillarKey.value = pillarKey ?? null
        if (event.type === 'click') {
          state.selectedPillarKey.value = pillarKey ?? null
          if (!pillarKey) state.selectedElementKey.value = null
        }
        return
      }
      const hits = raycaster.intersectObjects(raycastMeshes, false)
      const characterId = hits[0]?.object.userData.characterId as string | undefined
      state.hoveredCharacterId.value = characterId ?? null
    }

    function clearHover() {
      state.hoveredCharacterId.value = null
      state.hoveredPillarKey.value = null
    }

    function tunnelWheel(event: WheelEvent) {
      if (state.scene.value !== 'tunnel') return
      event.preventDefault()
      state.tunnelProgress.value = Math.min(Math.max(state.tunnelProgress.value + event.deltaY / 1800, 0), 1)
    }

    function tunnelCameraPosition(progress: number) {
      const station = progress * Math.max(gateCount - 1, 0)
      return new THREE.Vector3(0, 0, 1 - station * tunnelSpacing)
    }

    function moveTunnelDrag(event: PointerEvent) {
      if (tunnelDragPointerId !== event.pointerId) return
      const bounds = root.getBoundingClientRect()
      const delta = event.clientY - tunnelDragLastY
      tunnelDragLastY = event.clientY
      state.tunnelProgress.value = Math.min(
        Math.max(state.tunnelProgress.value + delta / (bounds.height * 0.68), 0),
        1,
      )
      const nearestGate = Math.round(state.tunnelProgress.value * Math.max(gateCount - 1, 0))
      state.selectedDayunIndex.value = model.dayuns[nearestGate]?.index ?? state.selectedDayunIndex.value
    }

    function tunnelPointerDown(event: PointerEvent) {
      if (state.scene.value !== 'tunnel' || !event.isPrimary) return
      tunnelDragPointerId = event.pointerId
      tunnelDragLastY = event.clientY
      root.setPointerCapture(event.pointerId)
    }

    function tunnelPointerUp(event: PointerEvent) {
      if (tunnelDragPointerId !== event.pointerId) return
      tunnelDragPointerId = null
      root.releasePointerCapture(event.pointerId)
      const nearestGate = Math.round(state.tunnelProgress.value * Math.max(gateCount - 1, 0))
      state.selectedDayunIndex.value = model.dayuns[nearestGate]?.index ?? state.selectedDayunIndex.value
    }

    function resize() {
      if (disposed || !root.clientWidth || !root.clientHeight) return
      const nextWidth = root.clientWidth
      const nextHeight = root.clientHeight
      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setSize(nextWidth, nextHeight)
      composer?.setSize(nextWidth, nextHeight)
      bloomPass?.setSize(nextWidth, nextHeight)
    }

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(root)
    handlePointerMove = hoverFromPointer
    handleClearHover = clearHover
    handleWheel = tunnelWheel
    handlePointerDown = tunnelPointerDown
    handlePointerUp = tunnelPointerUp
    root.addEventListener('pointermove', handlePointerMove)
    root.addEventListener('pointerleave', handleClearHover)
    root.addEventListener('click', handlePointerMove)
    root.addEventListener('wheel', handleWheel, { passive: false })
    root.addEventListener('pointerdown', handlePointerDown)
    root.addEventListener('pointerup', handlePointerUp)

    camera.position.set(0, 0, 7)
    let hoverMix = 0
    let interactionMix = 0
    let previousFrameTime = performance.now()

    function easeOutCubic(value: number) {
      return 1 - (1 - value) ** 3
    }

    function phaseProgress(time: number, start: number, end: number) {
      return easeOutCubic(Math.min(Math.max((time - start) / (end - start), 0), 1))
    }

    function applyInstrumentTimeline() {
      const time = timelineTime
      const startup = phaseProgress(time, 0, 1.5)
      state.timelineProgress.value = Math.min(time / 6, 1)
      state.lifecycle.value = state.scene.value === 'tunnel'
        ? 'tunnel'
        : time >= 6 ? 'settled' : 'playing'
      const instrumentScale = 0.86 + startup * 0.14
      instrumentRoot.scale.setScalar(instrumentScale)
      instrumentRings.forEach((ring, index) => {
        const speed = 0.16 + index * 0.07
        const direction = index % 2 === 0 ? 1 : -1
        const settle = phaseProgress(time, 4.5 + index * 0.08, 5.7 + index * 0.08)
        ring.rotation.z = reducedMotion ? 0 : direction * time * speed * (1 - settle * 0.88)
      })

      plaqueGroups.forEach((group, index) => {
        const [targetX, targetY] = plaqueTargets[index]!
        const entrance = phaseProgress(time, 1.5 + index * 0.16, 2.45 + index * 0.16)
        group.position.set(
          targetX,
          targetY - (1 - entrance) * 0.52,
          0.28 + (1 - entrance) * 0.34,
        )
        group.rotation.x = (1 - entrance) * -0.16
        group.scale.setScalar(0.86 + entrance * 0.14)
        plaqueMaterials[index]!.opacity = Math.min(startup + 0.18, 1) * (0.34 + entrance * 0.66)
        plaqueLabels[index]!.forEach((label) => {
          label.material.uniforms.uOpacity!.value = Math.min(startup * 0.8, entrance)
        })
      })

      galaxy.visible = state.scene.value === 'compass' && time >= 3 && time < 5.2
      const showGalaxyEffects = galaxy.visible
      const showGalaxyIdentity = state.scene.value === 'galaxy'
      clusterParticles.forEach((particle) => {
        particle.points.visible = showGalaxyEffects || showGalaxyIdentity
      })
      relationLines.forEach((line) => {
        line.mesh.visible = showGalaxyEffects || showGalaxyIdentity
      })
      starMeshes.forEach((object) => {
        object.visible = showGalaxyIdentity
      })
      texts.forEach((text) => {
        text.visible = showGalaxyIdentity
      })
      const shock = phaseProgress(time, 4.5, 5.55)
      shockwave.visible = shock > 0 && shock < 1
      shockwave.scale.setScalar(0.9 + shock * 2.5)
      shockwaveMaterial.opacity = (1 - shock) * 0.38

      const cameraZ = time < 1.5
        ? 8.4 - phaseProgress(time, 0, 1.5) * 0.7
        : time < 4.5
          ? 7.7 - phaseProgress(time, 1.5, 4.5) * 0.35
          : 7.35 - phaseProgress(time, 4.5, 6) * 0.35
      camera.position.set(
        reducedMotion ? 0 : Math.sin(time * 0.22) * 0.08 * (1 - phaseProgress(time, 4.5, 6)),
        reducedMotion ? 0 : 0.18 * (1 - phaseProgress(time, 4.5, 6)),
        cameraZ,
      )

      if (time >= 6 && !state.introCompleted.value) state.introCompleted.value = true
    }

    state.timelineControl = {
      seek: (seconds) => {
        renderer.setAnimationLoop(null)
        timelineTime = Math.min(Math.max(seconds, 0), 6)
        timelinePaused = true
        state.introCompleted.value = timelineTime >= 6
        state.scene.value = 'compass'
        applyScene('compass')
        applyInstrumentTimeline()
        if (composer) composer.render()
        else renderer.render(scene, camera)
        renderer.setAnimationLoop(frame)
      },
      replay: () => {
        timelineTime = 0
        timelinePaused = false
        state.introCompleted.value = false
        state.scene.value = 'compass'
        state.lifecycle.value = 'playing'
        applyScene('compass')
        applyInstrumentTimeline()
        renderer.setAnimationLoop(frame)
      },
      restoreOverview: () => {
        timelinePaused = false
        timelineTime = 6
        state.introCompleted.value = true
        applyScene('compass')
        applyInstrumentTimeline()
        renderer.setAnimationLoop(frame)
      },
    }
    if (import.meta.dev) {
      ;(window as unknown as { __bazi3dTimelineControl?: unknown }).__bazi3dTimelineControl = state.timelineControl
    }

    if (import.meta.dev) {
      ;(window as unknown as { __bazi3dSeekTimeline?: (seconds: number) => void }).__bazi3dSeekTimeline = seconds => state.timelineControl?.seek(seconds)
    }

    if (import.meta.dev) {
      ;(window as unknown as { __bazi3dDebug?: () => unknown }).__bazi3dDebug = () => JSON.parse(JSON.stringify({
        characters: model.characters,
        clusters: model.clusters,
        pillars: model.pillars.map(pillar => ({
          key: pillar.key,
          ganzhi: pillar.ganzhi,
          shishenGan: pillar.shishenGan,
          hiddenStems: pillar.hiddenStems,
          nayin: pillar.nayin,
          position: plaqueGroups[model.pillars.findIndex(item => item.key === pillar.key)]?.position.toArray(),
        })),
        selectedPillarKey: state.selectedPillarKey.value,
        selectedElementKey: state.selectedElementKey.value,
        dayuns: model.dayuns.map(dayun => ({
          index: dayun.index,
          ganzhi: dayun.ganzhi,
          isCurrent: dayun.isCurrent,
          liunianCount: dayun.liunianCount,
        })),
        tunnel: {
          gateCount,
          tickCount: gateTicks.count,
          particleCount: clusterParticles.reduce(
            (total, particle) => total + Number(particle.points.geometry.getAttribute('position').count),
            0,
          ),
          entryProgress: state.tunnelEntryProgress.value,
          progress: state.tunnelProgress.value,
          currentGate: model.dayuns.find(dayun => dayun.isCurrent)?.index ?? null,
        },
        rendererInfo: {
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
          calls: renderer.info.render.calls,
        },
      }))
    }

    function frame() {
      if (disposed) return
      const frameTime = performance.now()
      const delta = Math.min((frameTime - previousFrameTime) / 1000, 1 / 24)
      const elapsed = frameTime / 1000
      previousFrameTime = frameTime
      if (state.replayRequested.value !== replayToken) {
        replayToken = state.replayRequested.value
        timelineTime = 0
        timelinePaused = false
        state.scene.value = 'compass'
        state.lifecycle.value = 'playing'
      }
      const hoveredId = state.hoveredCharacterId.value
      const hovered = model.characters.find(character => character.id === hoveredId) ?? null
      const relatedKeys = relatedElementKeys(hoveredId)
      hoverMix += ((hovered ? 1 : 0) - hoverMix) * Math.min(delta * 9, 1)

      if (!reducedMotion) {
        if (galaxy.visible) galaxy.rotation.y = Math.sin(elapsed * 0.09) * 0.07
      }

      if (tunnel.visible) {
        if (state.tunnelEntryProgress.value < 1) {
          const next = Math.min(1, state.tunnelEntryProgress.value + delta / 1.5)
          state.tunnelEntryProgress.value = next
          const progress = phaseProgress(next, 0, 1)
          if (progress < 0.48) {
            camera.position.set(
              THREE.MathUtils.lerp(0, 0, phaseProgress(progress, 0, 0.48)),
              THREE.MathUtils.lerp(0.18, 0, phaseProgress(progress, 0, 0.48)),
              THREE.MathUtils.lerp(7, 0.65, phaseProgress(progress, 0, 0.48)),
            )
            cameraTarget.set(0, 0, -2)
          }
          else {
            const target = tunnelCameraPosition(state.tunnelProgress.value)
            camera.position.copy(target.clone().lerp(new THREE.Vector3(0, 0, 0.65), 1 - phaseProgress(progress, 0.48, 1)))
            cameraTarget.set(0, 0, camera.position.z - 3)
          }
          if (next >= 1) state.lifecycle.value = 'tunnel'
        }
        else {
          camera.position.copy(tunnelCameraPosition(state.tunnelProgress.value))
          cameraTarget.set(0, 0, camera.position.z - 3)
        }
        state.lifecycle.value = 'tunnel'

        model.dayuns.forEach((dayun, gateIndex) => {
          const selected = dayun.index === state.selectedDayunIndex.value
          gateDummy.position.set(0, 0, -gateIndex * tunnelSpacing)
          gateDummy.rotation.set(0, 0, 0)
          gateDummy.scale.setScalar(selected ? 1.07 : dayun.isCurrent ? 1.035 : 1)
          gateDummy.updateMatrix()
          gateRings.setMatrixAt(gateIndex, gateDummy.matrix)
          gateRings.setColorAt(
            gateIndex,
            new THREE.Color(dayun.isCurrent ? '#ffb43c' : selected ? '#d8ecff' : '#667795'),
          )
        })
        gateRings.instanceMatrix.needsUpdate = true
        if (gateRings.instanceColor) gateRings.instanceColor.needsUpdate = true
        const currentGateIndex = model.dayuns.findIndex(dayun => dayun.isCurrent)
        currentGateMarker.visible = currentGateIndex >= 0
        if (currentGateIndex >= 0) {
          currentGateMarker.position.set(0, 0, -currentGateIndex * tunnelSpacing - 0.6)
          currentGateMarker.scale.setScalar(reducedMotion ? 1 : 1 + Math.sin(elapsed * 2.1) * 0.014)
        }
      }
      else {
        cameraTarget.set(0, 0, 0)
      }

      if (state.scene.value !== 'tunnel') {
        if ((reducedMotion || state.introCompleted.value) && !timelinePaused) timelineTime = 6
        else if (state.scene.value === 'compass' && !timelinePaused) timelineTime = Math.min(6, timelineTime + delta)
        else timelineTime = 6
        applyInstrumentTimeline()

        const selectedPillarIndex = model.pillars.findIndex(
          pillar => pillar.key === state.selectedPillarKey.value,
        )
        interactionMix += ((selectedPillarIndex >= 0 ? 1 : 0) - interactionMix) * Math.min(delta * 7, 1)
        if (selectedPillarIndex >= 0) {
          const focus = plaqueGroups[selectedPillarIndex]!.position
          camera.position.x = THREE.MathUtils.lerp(camera.position.x, focus.x * 0.34, interactionMix)
          camera.position.y = THREE.MathUtils.lerp(camera.position.y, focus.y * 0.3 + 0.04, interactionMix)
          camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5.1, interactionMix)
          cameraTarget.lerp(focus, interactionMix)
        }

        plaqueGroups.forEach((group, index) => {
          const selected = index === selectedPillarIndex
          const hovered = model.pillars[index]?.key === state.hoveredPillarKey.value
          const targetZ = selected ? 0.64 : hovered ? 0.4 : 0.28
          group.position.z += (targetZ - group.position.z) * Math.min(delta * 8, 1)
          group.rotation.x += (selected ? -0.1 : 0 - group.rotation.x) * Math.min(delta * 8, 1)
          const material = plaqueMaterials[index]!
          material.opacity = selected
            ? Math.max(material.opacity, 0.98)
            : hovered ? Math.max(material.opacity, 0.82) : selectedPillarIndex >= 0 ? Math.max(material.opacity * 0.995, 0.46) : material.opacity
          material.emissiveIntensity = selected ? 0.36 : hovered ? 0.22 : index === 2 ? 0.2 : 0.1
        })

        const selectedElement = state.selectedElementKey.value
        if (state.scene.value === 'compass' && selectedElement) {
          galaxy.visible = true
          clusterParticles.forEach((particle) => {
            particle.points.visible = particle.elementKey === selectedElement
          })
          relationLines.forEach((line) => {
            line.mesh.visible = line.relationId.includes(selectedElement)
          })
          starMeshes.forEach(object => object.visible = false)
          texts.forEach(text => text.visible = false)
        }

        if (selectedPillarIndex >= 0 && timelineTime >= 6) state.lifecycle.value = 'interactive'
      }

      for (const ring of compassRings) {
        for (const label of ring.labels) label.quaternion.copy(camera.quaternion)
      }
      camera.lookAt(cameraTarget)

      for (const particle of clusterParticles) {
        const cluster = model.clusters.find(item => item.elementKey === particle.elementKey)
        if (!cluster) continue
        const active = !relatedKeys || relatedKeys.has(particle.elementKey)
        const targetOpacity = active ? 0.78 : 0.055
        particlePointsOpacity(particle.points, targetOpacity, delta)
        const baseScale = Number(particle.points.userData.clusterScale ?? 1)
        const pulse = reducedMotion ? 1 : 1 + Math.sin(elapsed * 0.8 + particle.elementKey.length) * 0.015
        particle.points.scale.setScalar(baseScale * pulse)
      }

      for (const material of starMaterials) {
        const mesh = starMaterials.indexOf(material)
        const elementKey = model.characters[mesh]?.elementKey
        const active = !relatedKeys || (elementKey ? relatedKeys.has(elementKey) : true)
        material.opacity += ((active ? 0.98 : 0.08) - material.opacity) * Math.min(delta * 9, 1)
      }

      for (const object of starMeshes) {
        const mesh = object as ThreeNamespace.Mesh
        if (mesh.isMesh !== true) continue
        const elementKey = mesh.userData.elementKey as ElementKey
        const active = !relatedKeys || relatedKeys.has(elementKey)
        const baseScale = Number(mesh.userData.baseScale ?? 0.14)
        mesh.scale.setScalar(baseScale * (hovered?.elementKey === elementKey ? 1.16 : active ? 1 : 0.92))
      }

      for (const glow of glowMaterials) {
        const active = !relatedKeys || relatedKeys.has(glow.elementKey)
        const baseOpacity = Number(glow.material.userData.baseOpacity ?? 0.58)
        glow.material.opacity += ((active ? baseOpacity : 0.04) - glow.material.opacity) * Math.min(delta * 9, 1)
      }

      for (const text of texts) {
        const elementKey = text.userData.elementKey as ElementKey
        const active = !relatedKeys || relatedKeys.has(elementKey)
        text.material.opacity += ((active ? 1 : 0.07) - text.material.opacity) * Math.min(delta * 9, 1)
        text.quaternion.copy(camera.quaternion)
      }

      for (const gate of tunnelLabels) {
        for (const label of gate.labels) label.quaternion.copy(camera.quaternion)
      }

      for (const line of relationLines) {
        const active = !hovered || line.relationId.includes(hovered.elementKey)
        const uniforms = line.material.uniforms
        uniforms.uTime!.value = elapsed
        const target = active ? 1 : 0.05
        uniforms.uActive!.value += (target - uniforms.uActive!.value) * Math.min(delta * 9, 1)
      }

      if (composer) composer.render()
      else renderer.render(scene, camera)

      state.rendererStats.value = {
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        programs: renderer.info.programs?.length ?? 0,
      }
    }

    renderer.setAnimationLoop(frame)
    state.state.value = 'ready'
  }
  catch (error) {
    state.state.value = 'static'
    state.errorMessage.value = error instanceof Error ? error.message : 'WebGL initialization failed'
    dispose()
    return () => undefined
  }

  function dispose() {
    disposed = true
    renderer?.setAnimationLoop(null)
    resizeObserver?.disconnect()
    if (handlePointerMove) root.removeEventListener('pointermove', handlePointerMove)
    if (handleClearHover) root.removeEventListener('pointerleave', handleClearHover)
    if (handlePointerMove) root.removeEventListener('click', handlePointerMove)
    if (handleWheel) root.removeEventListener('wheel', handleWheel)
    if (handlePointerDown) root.removeEventListener('pointerdown', handlePointerDown)
    if (handlePointerUp) root.removeEventListener('pointerup', handlePointerUp)
    resources.slice().reverse().forEach(resource => resource.dispose())
    renderer?.domElement.remove()
  }

  return dispose
}

function particlePointsOpacity(points: ThreeNamespace.Points, target: number, delta: number) {
  const material = points.material as ThreeNamespace.PointsMaterial
  material.opacity += (target - material.opacity) * Math.min(delta * 8, 1)
}
