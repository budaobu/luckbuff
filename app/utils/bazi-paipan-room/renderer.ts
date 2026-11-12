import type * as THREE from 'three'
import { BAZI_ROOM_ASSET_MANIFEST } from './manifest'
import type { BaziRoomSceneModel } from './model'

export type BaziRoomQuality = 'high' | 'mid' | 'low'

export interface BaziRoomRendererStats {
  quality: BaziRoomQuality
  sampleFrameMs: number
  renderer: { geometries: number, textures: number, programs: number }
}

export interface BaziRoomMount {
  setScene: (model: BaziRoomSceneModel) => void
  setReducedMotion: (value: boolean) => void
  resetView: () => void
  dispose: () => void
}

interface MountOptions {
  root: HTMLElement
  initialModel: BaziRoomSceneModel
  reducedMotion: boolean
  qualityOverride?: BaziRoomQuality | null
  freeze?: boolean
  onSelect?: (target: 'keeper' | 'visitor') => void
  onReady?: (stats: BaziRoomRendererStats) => void
  onError?: (message: string) => void
}

const LINK_COLORS: Record<string, number> = {
  combine: 0x63d49b,
  clash: 0xe26868,
  generates: 0x6aa7df,
  controls: 0xd7a54a,
  harm: 0x9c86c8,
}

function canvasLabel(lines: string[], accent = '#f2d998') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256)
    ctx.fillStyle = 'rgba(10, 16, 27, 0.84)'
    ctx.fillRect(0, 0, 256, 256)
    ctx.strokeStyle = accent
    ctx.lineWidth = 6
    ctx.strokeRect(8, 8, 240, 240)
    ctx.fillStyle = '#f5f8ff'
    ctx.font = '700 92px "Noto Serif SC", "Songti SC", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    lines.forEach((line, index) => ctx.fillText(line, 128, 84 + index * 94))
  }
  return canvas
}

function roomSignTexture(title: string, subtitle: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#201408'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#d4af6d'
    ctx.lineWidth = 10
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32)
    ctx.fillStyle = '#f2d998'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '700 96px "Noto Serif SC", "Songti SC", serif'
    ctx.fillText(title, canvas.width / 2, 108)
    ctx.font = '400 38px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(242, 217, 152, 0.68)'
    ctx.fillText(subtitle, canvas.width / 2, 196)
  }
  return canvas
}

export async function mountBaziPaipanRoom(options: MountOptions): Promise<BaziRoomMount> {
  const THREE = await import('three')
  const root = options.root
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.className = 'bazi-room-canvas'
  root.appendChild(canvas)

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    })
  }
  catch (error) {
    options.onError?.(error instanceof Error ? error.message : 'WebGL unavailable')
    canvas.remove()
    throw error
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x05080f)
  scene.fog = new THREE.Fog(0x05080f, 6.4, 13.5)

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30)
  const raycaster = new THREE.Raycaster()
  const cameraTarget = new THREE.Vector3(0.15, 1.75, -0.45)
  const orbit = { yaw: 0, pitch: 0.085, targetYaw: 0, targetPitch: 0.085, distance: 5.35, targetDistance: 4.9 }
  let reducedMotion = options.reducedMotion

  const ambient = new THREE.AmbientLight(0xdcecff, 0.55)
  const key = new THREE.DirectionalLight(0xffe4ab, 1.5)
  key.position.set(2.4, 4.5, 3.2)
  const rim = new THREE.DirectionalLight(0x74a9ff, 0.8)
  rim.position.set(-3.2, 2.2, -2.5)
  scene.add(ambient, key, rim)

  const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = []

  const room = new THREE.Group()
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: 0x111820, roughness: 0.82, metalness: 0.08 }),
  )
  floor.position.set(0, -0.1, 0)
  const carpet = new THREE.Mesh(
    new THREE.BoxGeometry(7.4, 0.04, 5.8),
    new THREE.MeshStandardMaterial({ color: 0x5f2a31, roughness: 0.88 }),
  )
  carpet.position.set(0, 0.02, 0.35)
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(18, 6.2, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x141d29, roughness: 0.92, metalness: 0.04 }),
  )
  backWall.position.set(0, 2.9, -4.3)
  const wallPanel = new THREE.Mesh(
    new THREE.BoxGeometry(9.6, 3.1, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x23160d, roughness: 0.72, metalness: 0.06 }),
  )
  wallPanel.position.set(0.45, 2.35, -4.14)
  const wallTrim = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.12, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x6d4f2d, roughness: 0.42, metalness: 0.36 }),
  )
  wallTrim.position.set(0.45, 3.94, -4.11)
  const wallBase = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.28, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.66 }),
  )
  wallBase.position.set(0.45, 0.8, -4.12)
  const signTexture = new THREE.CanvasTexture(roomSignTexture('命盘室', '八字 · 问事 · 今日'))
  signTexture.colorSpace = THREE.SRGBColorSpace
  disposables.push(signTexture)
  const roomSign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 0.6),
    new THREE.MeshBasicMaterial({ map: signTexture }),
  )
  roomSign.position.set(0.45, 3.55, -4.1)
  const pillarFrame = new THREE.Mesh(
    new THREE.BoxGeometry(3.1, 1.85, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x3f2c1c, roughness: 0.58, metalness: 0.12 }),
  )
  pillarFrame.position.set(0.45, 1.12, -2.7)
  const pillarFrameTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.3, 0.12, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x6d4f2d, roughness: 0.4, metalness: 0.34 }),
  )
  pillarFrameTop.position.set(0.45, 1.95, -2.68)
  const pillarFrameBase = new THREE.Mesh(
    new THREE.BoxGeometry(3.3, 0.16, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x4b3524, roughness: 0.5, metalness: 0.2 }),
  )
  pillarFrameBase.position.set(0.45, 0.32, -2.66)
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.86, 1.05),
    new THREE.MeshStandardMaterial({ color: 0x3a291c, roughness: 0.68 }),
  )
  counter.position.set(-0.15, 0.43, -0.35)
  const counterTop = new THREE.Mesh(
    new THREE.BoxGeometry(5.45, 0.1, 1.18),
    new THREE.MeshStandardMaterial({ color: 0x5b4530, roughness: 0.42, metalness: 0.22 }),
  )
  counterTop.position.set(-0.15, 0.91, -0.35)
  const counterFront = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.08, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x7a5a31, roughness: 0.35, metalness: 0.4 }),
  )
  counterFront.position.set(-0.15, 0.58, 0.17)
  const incenseBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.12, 0.16, 24),
    new THREE.MeshStandardMaterial({ color: 0x6a6f7a, roughness: 0.34, metalness: 0.66 }),
  )
  incenseBowl.position.set(1.95, 1.04, -0.45)
  const incense = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.34, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a2f24, roughness: 0.9 }),
  )
  incense.position.set(1.95, 1.28, -0.45)
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.08, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x8a4c33, roughness: 0.7 }),
  )
  book.position.set(-1.05, 1, -0.3)
  const lanternGroup = new THREE.Group()
  const lanternMaterial = new THREE.MeshStandardMaterial({
    color: 0xa4312d,
    emissive: 0x661a18,
    emissiveIntensity: 0.48,
    roughness: 0.42,
  })
  const lanternCapMaterial = new THREE.MeshStandardMaterial({ color: 0xd9b45d, roughness: 0.28, metalness: 0.62 })
  ;([[-2.55, 3.25, -2.05], [2.75, 3.15, -2.05]] as Array<[number, number, number]>).forEach((position) => {
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 20), lanternMaterial)
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 18), lanternCapMaterial)
    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.035, 0.22, 10), lanternCapMaterial)
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.62, 8), lanternCapMaterial)
    lantern.position.set(position[0], position[1], position[2])
    cap.position.set(position[0], position[1] + 0.23, position[2])
    tassel.position.set(position[0], position[1] - 0.25, position[2])
    cord.position.set(position[0], position[1] + 0.58, position[2])
    lanternGroup.add(lantern, cap, tassel, cord)
  })
  scene.add(room, floor, carpet, backWall, wallPanel, wallTrim, wallBase, roomSign, pillarFrame, pillarFrameTop, pillarFrameBase, counter, counterTop, counterFront, incenseBowl, incense, book, lanternGroup)

  const instrumentGroup = new THREE.Group()
  instrumentGroup.position.set(0.55, 1.02, -0.35)
  const instrumentBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.66, 0.11, 64),
    new THREE.MeshStandardMaterial({ color: 0x654b2c, roughness: 0.46, metalness: 0.48 }),
  )
  const rings: THREE.Mesh[] = []
  ;[0.54, 0.38, 0.24].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, index === 1 ? 0.032 : 0.02, 12, 96),
      new THREE.MeshStandardMaterial({
        color: index === 1 ? 0xd9b45d : 0x7d97bd,
        emissive: index === 1 ? 0x634a19 : 0x1b2a40,
        roughness: 0.28,
        metalness: 0.72,
      }),
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.08 + index * 0.045
    rings.push(ring)
    instrumentGroup.add(ring)
  })
  const instrumentCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.13, 1),
    new THREE.MeshStandardMaterial({ color: 0xd9b45d, emissive: 0x675019, roughness: 0.2, metalness: 0.9 }),
  )
  instrumentCore.position.y = 0.18
  instrumentGroup.add(instrumentBase, instrumentCore)
  scene.add(instrumentGroup)

  const keeper = new THREE.Group()
  keeper.userData.roomRole = 'keeper'
  keeper.position.set(-1.35, 1.02, -0.92)
  keeper.rotation.y = 0.14
  const robe = new THREE.Mesh(
    new THREE.ConeGeometry(0.38, 1.05, 24),
    new THREE.MeshStandardMaterial({ color: 0x354f47, roughness: 0.76 }),
  )
  robe.position.y = -0.12
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.035, 10, 32),
    new THREE.MeshStandardMaterial({ color: 0xd9b45d, roughness: 0.34, metalness: 0.42 }),
  )
  collar.rotation.x = Math.PI / 2
  collar.position.y = 0.34
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.18, 0.34, 6, 14),
    new THREE.MeshStandardMaterial({ color: 0x3a5f56, roughness: 0.72 }),
  )
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0xd8b294, roughness: 0.62 }),
  )
  head.position.y = 0.57
  const hat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.22, 0.1, 24),
    new THREE.MeshStandardMaterial({ color: 0x23160d, roughness: 0.54 }),
  )
  hat.position.y = 0.74
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x201a15 })
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), eyeMaterial)
  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), eyeMaterial)
  leftEye.position.set(-0.06, 0.6, 0.16)
  rightEye.position.set(0.06, 0.6, 0.16)
  const leftArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.05, 0.36, 4, 10),
    new THREE.MeshStandardMaterial({ color: 0x35554d, roughness: 0.72 }),
  )
  leftArm.position.set(-0.26, 0.2, 0.05)
  const rightArm = leftArm.clone()
  rightArm.position.set(0.26, 0.22, 0.02)
  keeper.add(robe, collar, torso, head, hat, leftEye, rightEye, leftArm, rightArm)
  scene.add(keeper)

  const visitor = new THREE.Group()
  visitor.userData.roomRole = 'visitor'
  visitor.position.set(1.15, 0.64, 1.62)
  visitor.scale.setScalar(0.82)
  visitor.rotation.y = Math.PI
  const seat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.38, 0.24, 32),
    new THREE.MeshStandardMaterial({ color: 0x523525, roughness: 0.72 }),
  )
  const jacket = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.24, 0.4, 8, 18),
    new THREE.MeshStandardMaterial({ color: 0x3c4d67, roughness: 0.74 }),
  )
  jacket.position.y = 0.36
  const visitorHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0xcaa27e, roughness: 0.62 }),
  )
  visitorHead.position.y = 0.76
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.175, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.58),
    new THREE.MeshStandardMaterial({ color: 0x241c17, roughness: 0.72 }),
  )
  hair.position.copy(visitorHead.position)
  hair.rotation.x = -0.24
  visitor.add(seat, jacket, visitorHead, hair)
  scene.add(visitor)

  const dynamicGroup = new THREE.Group()
  scene.add(dynamicGroup)
  const pickTargets = [keeper, visitor]

  function roomRoleFromObject(object: THREE.Object3D): 'keeper' | 'visitor' | null {
    let current: THREE.Object3D | null = object
    while (current) {
      const role = current.userData.roomRole
      if (role === 'keeper' || role === 'visitor') return role
      current = current.parent
    }
    return null
  }

  function pickRoomRole(clientX: number, clientY: number): 'keeper' | 'visitor' | null {
    const rect = canvas.getBoundingClientRect()
    const pointer = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(pickTargets, true)[0]
    return hit ? roomRoleFromObject(hit.object) : null
  }
  let dirty = true

  function labelTexture(pillar: BaziRoomSceneModel['pillars'][number]) {
    const texture = new THREE.CanvasTexture(canvasLabel([pillar.gan, pillar.zhi], pillar.highlighted ? '#ffd879' : '#b9c6d8'))
    texture.colorSpace = THREE.SRGBColorSpace
    disposables.push(texture)
    return texture
  }

  function rebuildDynamic(model: BaziRoomSceneModel) {
    for (const child of [...dynamicGroup.children]) {
      dynamicGroup.remove(child)
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        const material = child.material
        if (Array.isArray(material)) material.forEach(item => item.dispose())
        else material.dispose()
      }
      else if (child instanceof THREE.Line) {
        child.geometry.dispose()
        const material = child.material
        if (Array.isArray(material)) material.forEach(item => item.dispose())
        else material.dispose()
      }
    }

    for (const pillar of model.pillars) {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.68, 0.05),
        new THREE.MeshStandardMaterial({
          color: pillar.key === 'today' ? 0x1d5344 : 0x243346,
          emissive: pillar.highlighted ? (pillar.key === 'today' ? 0x1d7a5b : 0x2e4a71) : 0x080d14,
          emissiveIntensity: pillar.highlighted ? 0.85 : 0.14,
          roughness: 0.48,
          metalness: 0.16,
        }),
      )
      plate.position.set(...pillar.position)
      plate.lookAt(0.5, pillar.position[1] + 0.08, 3.0)

      const face = new THREE.Mesh(
        new THREE.PlaneGeometry(0.36, 0.58),
        new THREE.MeshBasicMaterial({ map: labelTexture(pillar), transparent: true }),
      )
      face.position.copy(plate.position)
      face.quaternion.copy(plate.quaternion)
      face.translateZ(0.035)

      if (pillar.highlighted) {
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.27, 0.33, 32),
          new THREE.MeshBasicMaterial({ color: pillar.key === 'today' ? 0x64e0aa : 0x86b8ff, transparent: true, opacity: 0.48, side: THREE.DoubleSide }),
        )
        halo.position.copy(plate.position)
        halo.quaternion.copy(plate.quaternion)
        halo.translateZ(-0.035)
        dynamicGroup.add(halo)
      }
      dynamicGroup.add(plate, face)
    }

    for (const link of model.links) {
      const from = model.pillars.find(pillar => pillar.key === link.from)
      const to = model.pillars.find(pillar => pillar.key === link.to)
      if (!from || !to) continue
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...from.position),
        new THREE.Vector3(
          (from.position[0] + to.position[0]) / 2,
          Math.max(from.position[1], to.position[1]) + 0.16,
          (from.position[2] + to.position[2]) / 2,
        ),
        new THREE.Vector3(...to.position),
      ])
      const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({
        color: LINK_COLORS[link.type] ?? 0x9aa8b8,
        linewidth: 2,
        dashSize: link.type === 'clash' ? 0.045 : link.type === 'controls' ? 0.09 : 0.07,
        gapSize: link.type === 'combine' ? 0.015 : 0.05,
        transparent: true,
        opacity: 0.9,
      }))
      line.computeLineDistances()
      dynamicGroup.add(line)
    }
  }

  function resize() {
    const width = root.clientWidth || 1
    const height = root.clientHeight || 1
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    markDirty()
  }

  const observer = new ResizeObserver(resize)
  observer.observe(root)

  let pointerActive = false
  let lastX = 0
  let lastY = 0
  let pointerStartedAt = 0
  let pointerMovedFar = false
  function pointerDown(event: PointerEvent) {
    pointerActive = true
    lastX = event.clientX
    lastY = event.clientY
    pointerStartedAt = performance.now()
    pointerMovedFar = false
    canvas.setPointerCapture(event.pointerId)
  }
  function pointerMove(event: PointerEvent) {
    if (!pointerActive) return
    const deltaX = event.clientX - lastX
    const deltaY = event.clientY - lastY
    if (Math.hypot(deltaX, deltaY) >= 7) pointerMovedFar = true
    lastX = event.clientX
    lastY = event.clientY
    orbit.targetYaw = THREE.MathUtils.clamp(orbit.targetYaw - deltaX * 0.0035, -THREE.MathUtils.degToRad(25), THREE.MathUtils.degToRad(25))
    orbit.targetPitch = THREE.MathUtils.clamp(orbit.targetPitch + deltaY * 0.0028, 0.03, THREE.MathUtils.degToRad(10) + 0.03)
    markDirty()
  }
  function pointerUp(event: PointerEvent) {
    pointerActive = false
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    void event
  }
  canvas.style.touchAction = 'pan-y'
  const handleCanvasClick = (event: MouseEvent) => {
    if (pointerMovedFar || performance.now() - pointerStartedAt >= 700) return
    const role = pickRoomRole(event.clientX, event.clientY)
    if (role) options.onSelect?.(role)
  }
  const updatePointerCursor = (event: PointerEvent) => {
    if (pointerActive) return
    canvas.style.cursor = pickRoomRole(event.clientX, event.clientY) ? 'pointer' : 'grab'
  }
  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointermove', pointerMove)
  canvas.addEventListener('pointermove', updatePointerCursor)
  canvas.addEventListener('pointerup', pointerUp)
  canvas.addEventListener('pointercancel', pointerUp)
  canvas.addEventListener('click', handleCanvasClick)

  let visible = true
  const intersection = new IntersectionObserver((entries) => {
    visible = entries.some(entry => entry.isIntersecting)
    if (visible) markDirty()
  })
  intersection.observe(root)
  const visibility = () => {
    if (document.visibilityState === 'visible') markDirty()
  }
  document.addEventListener('visibilitychange', visibility)

  let composer: { render: () => void, setSize: (width: number, height: number) => void } | null = null
  let quality: BaziRoomQuality = 'mid'
  let sampleFrameMs = 0
  rebuildDynamic(options.initialModel)
  resize()

  const samples: number[] = []
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  for (let index = 0; index < 8; index += 1) {
    const started = performance.now()
    renderer.render(scene, camera)
    samples.push(performance.now() - started)
  }
  sampleFrameMs = samples.slice(2).reduce((sum, value) => sum + value, 0) / Math.max(1, samples.length - 2)
  quality = options.reducedMotion || options.freeze
    ? 'low'
    : options.qualityOverride
      ?? (sampleFrameMs <= 10 ? 'high' : sampleFrameMs <= 24 ? 'mid' : 'low')

  if (quality === 'high' && !options.freeze) {
    const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
      import('three/examples/jsm/postprocessing/EffectComposer.js'),
      import('three/examples/jsm/postprocessing/RenderPass.js'),
      import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
      import('three/examples/jsm/postprocessing/OutputPass.js'),
    ])
    const effectComposer = new EffectComposer(renderer)
    effectComposer.addPass(new RenderPass(scene, camera))
    effectComposer.addPass(new UnrealBloomPass(new THREE.Vector2(root.clientWidth, root.clientHeight), 0.22, 0.65, 0.86))
    effectComposer.addPass(new OutputPass())
    composer = effectComposer
  }
  renderer.setPixelRatio(quality === 'high' ? Math.min(window.devicePixelRatio, 2) : quality === 'mid' ? Math.min(window.devicePixelRatio, 1.5) : 1)
  resize()

  if (BAZI_ROOM_ASSET_MANIFEST.assets.instrument.glb || BAZI_ROOM_ASSET_MANIFEST.assets.keeper.glb) {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    const loader = new GLTFLoader()
    await Promise.all([
      BAZI_ROOM_ASSET_MANIFEST.assets.instrument.glb
        ? loader.loadAsync(BAZI_ROOM_ASSET_MANIFEST.assets.instrument.glb).then(gltf => instrumentGroup.add(gltf.scene))
        : Promise.resolve(),
      BAZI_ROOM_ASSET_MANIFEST.assets.keeper.glb
        ? loader.loadAsync(BAZI_ROOM_ASSET_MANIFEST.assets.keeper.glb).then(gltf => keeper.add(gltf.scene))
        : Promise.resolve(),
    ])
  }

  let frame = 0
  function markDirty() {
    dirty = true
  }

  function updateCamera() {
    orbit.yaw += (orbit.targetYaw - orbit.yaw) * 0.08
    orbit.pitch += (orbit.targetPitch - orbit.pitch) * 0.08
    orbit.distance += (orbit.targetDistance - orbit.distance) * 0.035
    const focusX = 0.15 + currentModel.focusX * 0.2
    cameraTarget.x += (focusX - cameraTarget.x) * 0.06
    const x = cameraTarget.x + orbit.distance * Math.sin(orbit.yaw) * Math.cos(orbit.pitch)
    const y = cameraTarget.y + orbit.distance * Math.sin(orbit.pitch)
    const z = cameraTarget.z + orbit.distance * Math.cos(orbit.yaw) * Math.cos(orbit.pitch)
    camera.position.set(x, y, z)
    camera.lookAt(cameraTarget)
  }

  function renderCurrent() {
    updateCamera()
    if (composer) composer.render()
    else renderer.render(scene, camera)
    dirty = false
  }

  let currentModel = options.initialModel
  function tick(now: number) {
    frame = requestAnimationFrame(tick)
    if (!visible || document.visibilityState === 'hidden') return
    if (reducedMotion || quality === 'low') {
      if (dirty) renderCurrent()
      return
    }

    const elapsed = now / 1000
    rings.forEach((ring, index) => {
      ring.rotation.z += currentModel.instrumentSpeed * (index % 2 ? 0.0012 : -0.0009)
    })
    instrumentCore.rotation.y = elapsed * currentModel.instrumentSpeed * 0.35
    keeper.rotation.y = Math.sin(elapsed * 0.55) * 0.06
    leftArm.rotation.z = currentModel.keeperGesture === 'idle'
      ? Math.sin(elapsed * 0.9) * 0.08
      : currentModel.keeperGesture === 'calculating'
        ? Math.sin(elapsed * 7) * 0.34
        : -0.7 + Math.sin(elapsed * 1.2) * 0.05
    rightArm.rotation.z = -leftArm.rotation.z
    renderCurrent()
  }

  function onContextLost(event: Event) {
    event.preventDefault()
    cancelAnimationFrame(frame)
    options.onError?.('WebGL context lost')
  }
  canvas.addEventListener('webglcontextlost', onContextLost)
  canvas.addEventListener('webglcontextrestored', () => {
    markDirty()
    if (quality !== 'low' && !reducedMotion) frame = requestAnimationFrame(tick)
  })

  renderCurrent()
  if (quality !== 'low' && !reducedMotion) frame = requestAnimationFrame(tick)
  options.onReady?.({
    quality,
    sampleFrameMs: Math.round(sampleFrameMs * 100) / 100,
    renderer: {
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
      programs: renderer.info.programs?.length ?? 0,
    },
  })

  return {
    setScene(model: BaziRoomSceneModel) {
      currentModel = model
      rebuildDynamic(model)
      orbit.targetDistance = model.phase === 'idle' ? 6.15 : model.phase === 'topic' ? 5.7 : model.phase === 'calculating' ? 5.35 : 4.85
      markDirty()
      if (quality === 'low' || reducedMotion) renderCurrent()
    },
    setReducedMotion(value: boolean) {
      reducedMotion = value
      if (value && quality !== 'low') {
        quality = 'low'
        composer = null
        renderer.setPixelRatio(1)
        resize()
      }
      if (value) {
        cancelAnimationFrame(frame)
        markDirty()
      }
      else if (quality !== 'low') frame = requestAnimationFrame(tick)
    },
    resetView() {
      orbit.targetYaw = 0
      orbit.targetPitch = 0.13
      markDirty()
    },
    dispose() {
      cancelAnimationFrame(frame)
      observer.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('pointermove', pointerMove)
      canvas.removeEventListener('pointermove', updatePointerCursor)
      canvas.removeEventListener('pointerup', pointerUp)
      canvas.removeEventListener('pointercancel', pointerUp)
      canvas.removeEventListener('click', handleCanvasClick)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      disposables.forEach(item => item.dispose())
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose()
          const material = object.material
          if (Array.isArray(material)) material.forEach(item => item.dispose())
          else material.dispose()
        }
      })
      composer = null
      renderer.dispose()
      canvas.remove()
    },
  }
}
