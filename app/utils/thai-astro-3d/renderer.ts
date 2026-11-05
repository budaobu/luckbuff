import type { ThaiAstroChartResult } from '~~/server/utils/tools/thai-astro-paipan'
import type { ThaiAstro3DSelection } from './model'
import { buildThaiAstro3DScene, CHART_RADIUS, longitudeToPoint } from './model'

export interface ThaiAstro3DHover {
  selection: ThaiAstro3DSelection
  x: number
  y: number
}

export interface ThaiAstro3DCallbacks {
  onHover: (hover: ThaiAstro3DHover | null) => void
  onSelect: (selection: ThaiAstro3DSelection) => void
  onReady?: () => void
  onError?: (message: string) => void
}

export interface ThaiAstro3DMount {
  dispose: () => void
  resetView: () => void
  setAnimating: (enabled: boolean) => void
  showTruePositions: () => void
}

type Disposable = { dispose?: () => void }

const BODY_COLORS: Record<string, number> = {
  Sun: 0xf59e0b,
  Moon: 0xbfdbfe,
  Mars: 0xef4444,
  Mercury: 0x86efac,
  Jupiter: 0xfbbf24,
  Venus: 0xf9a8d4,
  Saturn: 0xa3b3cc,
  Rahu: 0x9ca3af,
  ThaiKetu: 0x94a3b8,
  Uranus: 0x67e8f9,
}

function disposeTree(root: any) {
  root?.traverse?.((child: any) => {
    child.geometry?.dispose?.()
    const material = child.material
    if (Array.isArray(material)) material.forEach(item => item?.dispose?.())
    else material?.dispose?.()
  })
}

function fallbackMount(callbacks: ThaiAstro3DCallbacks): ThaiAstro3DMount {
  callbacks.onError?.('WebGL is unavailable')
  return {
    dispose: () => undefined,
    resetView: () => undefined,
    setAnimating: () => undefined,
    showTruePositions: () => undefined,
  }
}

function normalizedDegrees(value: number) {
  return ((value % 360) + 360) % 360
}

export async function mountThaiAstro3D(
  root: HTMLElement,
  result: ThaiAstroChartResult,
  callbacks: ThaiAstro3DCallbacks,
): Promise<ThaiAstro3DMount> {
  if (!root.clientWidth || !root.clientHeight) return fallbackMount(callbacks)

  try {
    const THREE = await import('three')
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
    const sceneModel = buildThaiAstro3DScene(result)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(root.clientWidth, root.clientHeight)
    renderer.domElement.dataset.testid = 'thai-astro-3d-canvas'
    root.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x05070d)
    const camera = new THREE.PerspectiveCamera(45, root.clientWidth / root.clientHeight, 0.1, 120)
    const initialCamera = new THREE.Vector3(0, 12, 19)
    camera.position.copy(initialCamera)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.2, 0)
    controls.enableDamping = false
    controls.minDistance = 8
    controls.maxDistance = 38
    controls.maxPolarAngle = Math.PI * 0.78

    scene.add(new THREE.AmbientLight(0x8ba0c0, 1.15))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4)
    keyLight.position.set(8, 12, 7)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0x67e8f9, 0.35)
    fillLight.position.set(-8, 4, -6)
    scene.add(fillLight)

    const chartGroup = new THREE.Group()
    chartGroup.rotation.x = -0.14
    scene.add(chartGroup)

    const starCount = 900
    const starPositions = new Float32Array(starCount * 3)
    for (let index = 0; index < starCount; index += 1) {
      const radius = 42 + Math.random() * 32
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
      starPositions[(index * 3) + 1] = radius * Math.cos(phi)
      starPositions[(index * 3) + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({
      color: 0x9fb4cc,
      size: 0.13,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })))

    function createRing(radius: number, opacity: number) {
      const points: import('three').Vector3[] = []
      for (let index = 0; index <= 180; index += 1) {
        const angle = index / 180 * Math.PI * 2
        points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
      }
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0xd6b468, transparent: true, opacity }),
      )
    }
    chartGroup.add(createRing(CHART_RADIUS + 1.25, 0.48))
    chartGroup.add(createRing(CHART_RADIUS - 1.25, 0.28))

    const pickDisc = new THREE.Mesh(
      new THREE.CircleGeometry(CHART_RADIUS + 1.25, 96),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
    )
    pickDisc.rotation.x = -Math.PI / 2
    chartGroup.add(pickDisc)

    for (let house = 0; house < 12; house += 1) {
      const boundaryLongitude = sceneModel.ascendantLongitude + house * 30
      const start = longitudeToPoint(boundaryLongitude, CHART_RADIUS - 1.25)
      const end = longitudeToPoint(boundaryLongitude, CHART_RADIUS + 1.25)
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(start.x, 0, start.z),
          new THREE.Vector3(end.x, 0, end.z),
        ]),
        new THREE.LineBasicMaterial({ color: 0xd6b468, transparent: true, opacity: 0.2 }),
      )
      chartGroup.add(line)
    }

    function createTextSprite(text: string, color: string, width = 220, height = 76) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (context) {
        context.font = '600 34px ui-sans-serif, system-ui, sans-serif'
        context.fillStyle = color
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(text, width / 2, height / 2)
      }
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
        depthWrite: false,
      }))
      sprite.scale.set(width / 145, height / 145, 1)
      return sprite
    }

    for (let house = 0; house < 12; house += 1) {
      const centerLongitude = sceneModel.ascendantLongitude + house * 30 + 15
      const labelPoint = longitudeToPoint(centerLongitude, CHART_RADIUS + 0.5, 0.15)
      const sprite = createTextSprite(String(house + 1), '#e2c584')
      sprite.position.set(labelPoint.x, labelPoint.y, labelPoint.z)
      chartGroup.add(sprite)
    }

    const ascendantMark = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.05, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
    )
    const ascendantPoint = longitudeToPoint(sceneModel.ascendantLongitude, CHART_RADIUS, 0.08)
    ascendantMark.position.set(ascendantPoint.x, ascendantPoint.y, ascendantPoint.z)
    ascendantMark.rotation.y = sceneModel.ascendantLongitude * Math.PI / 180
    chartGroup.add(ascendantMark)

    interface PlanetObject {
      key: string
      group: import('three').Group
      sphere: import('three').Mesh
      hit: import('three').Mesh
      label: import('three').Sprite
      angle: number
      radius: number
      y: number
    }
    const planetObjects: PlanetObject[] = []
    const symbolByKey: Record<string, string> = {}
    for (const planet of result.planets) symbolByKey[planet.key] = planet.symbol

    for (const placement of sceneModel.planets) {
      const color = BODY_COLORS[placement.key] ?? 0xffffff
      const group = new THREE.Group()
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 24, 24),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.45,
          roughness: 0.35,
          metalness: 0.2,
        }),
      )
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.72, 12, 12),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      )
      group.add(sphere)
      group.add(hit)
      group.position.set(placement.point.x, placement.point.y, placement.point.z)
      group.userData = { planet: placement.key }
      hit.userData = { planet: placement.key }
      chartGroup.add(group)

      const label = createTextSprite(symbolByKey[placement.key] ?? '?', '#f3f5f8', 140, 76)
      label.scale.set(0.92, 0.5, 1)
      label.position.copy(group.position).setY(placement.point.y + 0.78)
      label.userData = { planet: placement.key }
      chartGroup.add(label)

      planetObjects.push({
        key: placement.key,
        group,
        sphere,
        hit,
        label,
        angle: placement.angle,
        radius: placement.radius,
        y: placement.y,
      })
    }

    const pointer = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()
    let downInfo: { x: number, y: number, at: number } | null = null

    function setPointer(event: PointerEvent) {
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      )
      raycaster.setFromCamera(pointer, camera)
    }

    function selectionAtPointer(event: PointerEvent): ThaiAstro3DSelection | null {
      setPointer(event)
      const meshes = planetObjects.flatMap(item => [item.hit, item.sphere])
      const planetHit = raycaster.intersectObjects(meshes)[0]
      if (planetHit) {
        const key = (planetHit.object.userData as { planet?: string }).planet
          ?? (planetHit.object.parent?.userData as { planet?: string }).planet
        if (key) return { kind: 'planet', key }
      }

      const discHit = raycaster.intersectObject(pickDisc)[0]
      if (discHit) {
        const local = chartGroup.worldToLocal(discHit.point.clone())
        const angle = Math.atan2(local.z, local.x)
        const longitude = normalizedDegrees(angle * 180 / Math.PI + 90)
        const house = Math.floor(normalizedDegrees(longitude - sceneModel.ascendantLongitude) / 30) + 1
        return { kind: 'house', number: Math.min(12, house) }
      }
      return null
    }

    function handlePointerMove(event: PointerEvent) {
      const selection = selectionAtPointer(event)
      renderer.domElement.style.cursor = selection ? 'pointer' : 'grab'
      callbacks.onHover(selection ? { selection, x: event.clientX, y: event.clientY } : null)
    }

    function handlePointerLeave() {
      callbacks.onHover(null)
      renderer.domElement.style.cursor = 'grab'
    }

    function handlePointerDown(event: PointerEvent) {
      downInfo = { x: event.clientX, y: event.clientY, at: Date.now() }
    }

    function handlePointerUp(event: PointerEvent) {
      const info = downInfo
      downInfo = null
      if (!info) return
      if (Math.abs(event.clientX - info.x) > 7 || Math.abs(event.clientY - info.y) > 7) return
      if (Date.now() - info.at > 450) return
      const selection = selectionAtPointer(event)
      if (selection) callbacks.onSelect(selection)
    }

    function render() {
      renderer.render(scene, camera)
    }

    const onControlsChange = () => render()
    controls.addEventListener('change', onControlsChange)
    renderer.domElement.addEventListener('pointermove', handlePointerMove)
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave)
    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    renderer.domElement.addEventListener('pointerup', handlePointerUp)

    let lastFrameTime = performance.now()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animationTime = 0
    let disposed = false

    function restorePositions() {
      animationTime = 0
      for (const item of planetObjects) {
        item.group.position.set(Math.cos(item.angle) * item.radius, item.y, Math.sin(item.angle) * item.radius)
        item.label.position.copy(item.group.position).setY(item.y + 0.78)
      }
    }

    function frame() {
      if (disposed) return
      const now = performance.now()
      animationTime += (now - lastFrameTime) / 1000 * 0.55
      lastFrameTime = now
      for (const item of planetObjects) {
        const displayAngle = item.angle + animationTime
        const x = Math.cos(displayAngle) * item.radius
        const z = Math.sin(displayAngle) * item.radius
        const y = item.y + Math.sin(animationTime * 2.2) * 0.08
        item.group.position.set(x, y, z)
        item.label.position.set(x, y + 0.78, z)
        item.sphere.rotation.y += 0.012
      }
      render()
    }

    function setAnimating(enabled: boolean) {
      if (enabled && !reducedMotion) {
        lastFrameTime = performance.now()
        renderer.setAnimationLoop(frame)
        return
      }
      renderer.setAnimationLoop(null)
      restorePositions()
      render()
    }

    const resizeObserver = new ResizeObserver(() => {
      const width = root.clientWidth
      const height = root.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      render()
    })
    resizeObserver.observe(root)

    function dispose() {
      disposed = true
      resizeObserver.disconnect()
      renderer.setAnimationLoop(null)
      controls.removeEventListener('change', onControlsChange)
      renderer.domElement.removeEventListener('pointermove', handlePointerMove)
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave)
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      renderer.domElement.removeEventListener('pointerup', handlePointerUp)
      controls.dispose()
      disposeTree(scene)
      renderer.domElement.remove()
      renderer.dispose()
    }

    restorePositions()
    render()
    callbacks.onReady?.()

    return {
      dispose,
      resetView: () => {
        controls.target.set(0, 0.2, 0)
        camera.position.copy(initialCamera)
        controls.update()
        render()
      },
      setAnimating,
      showTruePositions: () => {
        renderer.setAnimationLoop(null)
        restorePositions()
        render()
      },
    }
  }
  catch (error) {
    console.warn('[thai-astro-3d] renderer failed', error)
    return fallbackMount(callbacks)
  }
}
