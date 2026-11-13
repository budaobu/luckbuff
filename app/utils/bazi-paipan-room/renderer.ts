import type * as THREE from 'three'
import { BAZI_ROOM_ASSET_MANIFEST } from './manifest'
import type { BaziRoomSceneModel } from './model'

export type BaziRoomQuality = 'high' | 'mid' | 'low'

export interface BaziRoomRendererStats {
  quality: BaziRoomQuality
  sampleFrameMs: number
  renderer: { geometries: number, textures: number, programs: number }
}

export interface BaziRoomRendererLabels {
  room: string
  chart: string
  idle: string
  calculating: string
  revealed: string
  today: string
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
  labels: BaziRoomRendererLabels
  reducedMotion: boolean
  qualityOverride?: BaziRoomQuality | null
  freeze?: boolean
  onSelect?: (target: 'keeper' | 'visitor') => void
  onReady?: (stats: BaziRoomRendererStats) => void
  onError?: (message: string) => void
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

function ganzhiDiskTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const center = 256
    ctx.fillStyle = '#201408'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.translate(center, center)
    for (let radius = 232; radius >= 96; radius -= 44) {
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.strokeStyle = radius % 88 === 0 ? '#d9b45d' : '#8a683d'
      ctx.lineWidth = radius === 232 ? 14 : 7
      ctx.stroke()
    }
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    ctx.fillStyle = '#f2d998'
    ctx.font = '700 32px "Noto Serif SC", "Songti SC", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    stems.forEach((stem, index) => {
      const angle = (index / stems.length) * Math.PI * 2 - Math.PI / 2
      ctx.fillText(stem, Math.cos(angle) * 188, Math.sin(angle) * 188)
    })
    ctx.fillStyle = '#dfe8f7'
    branches.forEach((branch, index) => {
      const angle = (index / branches.length) * Math.PI * 2 - Math.PI / 2
      ctx.fillText(branch, Math.cos(angle) * 122, Math.sin(angle) * 122)
    })
    ctx.beginPath()
    ctx.arc(0, 0, 46, 0, Math.PI * 2)
    ctx.fillStyle = '#2e2115'
    ctx.fill()
    ctx.strokeStyle = '#d9b45d'
    ctx.lineWidth = 8
    ctx.stroke()
    ctx.fillStyle = '#f2d998'
    ctx.fillText('命', 0, 2)
  }
  return canvas
}

function createProjectionCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
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
  const cameraTarget = new THREE.Vector3(0.15, 1.95, -0.45)
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
    new THREE.BoxGeometry(9.2, 4.4, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x23160d, roughness: 0.72, metalness: 0.06 }),
  )
  wallPanel.position.set(0, 2.45, -4.14)
  const wallTrim = new THREE.Mesh(
    new THREE.BoxGeometry(9.8, 0.16, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x6d4f2d, roughness: 0.42, metalness: 0.36 }),
  )
  wallTrim.position.set(0, 4.45, -4.11)
  const wallBase = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.28, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.66 }),
  )
  wallBase.position.set(0.45, 0.8, -4.12)
  const signTexture = new THREE.CanvasTexture(roomSignTexture(options.labels.room, options.labels.chart))
  signTexture.colorSpace = THREE.SRGBColorSpace
  disposables.push(signTexture)
  const roomSign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 0.6),
    new THREE.MeshBasicMaterial({ map: signTexture }),
  )
  roomSign.position.set(0, 5.05, -4.1)
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
  scene.add(room, floor, carpet, backWall, wallPanel, wallTrim, wallBase, roomSign, counter, counterTop, counterFront, incenseBowl, incense, book, lanternGroup)

  const ganzhiDisk = new THREE.Group()
  const diskBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.52, 0.07, 64),
    new THREE.MeshStandardMaterial({ color: 0x5d3f25, roughness: 0.36, metalness: 0.38 }),
  )
  const diskFaceTexture = new THREE.CanvasTexture(ganzhiDiskTexture())
  diskFaceTexture.colorSpace = THREE.SRGBColorSpace
  const diskFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.88, 0.88),
    new THREE.MeshStandardMaterial({ map: diskFaceTexture, roughness: 0.48, metalness: 0.08 }),
  )
  diskFace.rotation.x = -Math.PI / 2
  diskFace.position.y = 0.041
  const diskDial = new THREE.Mesh(
    new THREE.TorusGeometry(0.44, 0.016, 10, 72),
    new THREE.MeshStandardMaterial({ color: 0xd9b45d, roughness: 0.24, metalness: 0.82 }),
  )
  diskDial.rotation.x = Math.PI / 2
  diskDial.position.y = 0.05
  ganzhiDisk.add(diskBase, diskFace, diskDial)
  ganzhiDisk.position.set(1.45, 1.02, 0.02)

  const fiveElements = new THREE.Group()
  const elementsTray = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 0.05, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x4b3524, roughness: 0.54, metalness: 0.16 }),
  )
  fiveElements.add(elementsTray)
  const elementSpecs = [
    { geometry: new THREE.CylinderGeometry(0.028, 0.038, 0.09, 10), color: 0x4e8a58, emissive: 0x143020 },
    { geometry: new THREE.ConeGeometry(0.038, 0.1, 12), color: 0xd45d3b, emissive: 0x591708 },
    { geometry: new THREE.BoxGeometry(0.08, 0.08, 0.08), color: 0xb38644, emissive: 0x3c2a0c },
    { geometry: new THREE.OctahedronGeometry(0.052), color: 0xcfd5de, emissive: 0x2e353d },
    { geometry: new THREE.SphereGeometry(0.048, 18, 14), color: 0x517bd1, emissive: 0x13244d },
  ]
  elementSpecs.forEach((spec, index) => {
    const element = new THREE.Mesh(
      spec.geometry,
      new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.emissive, roughness: 0.34, metalness: 0.2 }),
    )
    element.position.set(-0.3 + index * 0.15, 0.075, 0)
    element.rotation.y = index * 0.4
    fiveElements.add(element)
  })
  fiveElements.position.set(-0.98, 1.02, 0.03)

  const deskComputer = new THREE.Group()
  const computerDeck = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.025, 0.34),
    new THREE.MeshStandardMaterial({ color: 0x28313f, roughness: 0.46, metalness: 0.34 }),
  )
  const computerKeyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.012, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x1d2530, roughness: 0.68 }),
  )
  computerKeyboard.position.y = 0.017
  const computerScreenTexture = new THREE.CanvasTexture(roomSignTexture(options.labels.room, options.labels.today))
  computerScreenTexture.colorSpace = THREE.SRGBColorSpace
  const computerScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.26),
    new THREE.MeshBasicMaterial({ map: computerScreenTexture }),
  )
  computerScreen.position.set(0, 0.16, -0.14)
  computerScreen.rotation.x = -0.18
  const computerLid = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.31, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x222b36, roughness: 0.42, metalness: 0.38 }),
  )
  computerLid.position.set(0, 0.16, -0.16)
  computerLid.rotation.x = -0.18
  deskComputer.add(computerDeck, computerKeyboard, computerLid, computerScreen)
  deskComputer.position.set(-0.42, 1.03, -0.48)
  deskComputer.rotation.y = 0.14
  book.position.set(-1.86, 1, -0.48)
  book.rotation.y = 0.2
  scene.add(ganzhiDisk, fiveElements, deskComputer)

  const projectionFrame = new THREE.Mesh(
    new THREE.BoxGeometry(7.6, 3.7, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x181f2a, roughness: 0.38, metalness: 0.5 }),
  )
  projectionFrame.position.set(1.35, 2.42, -4.02)
  const projectionCanvas = createProjectionCanvas()
  const projectionContext = projectionCanvas.getContext('2d')
  const projectionTexture = new THREE.CanvasTexture(projectionCanvas)
  projectionTexture.colorSpace = THREE.SRGBColorSpace
  projectionTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  projectionTexture.generateMipmaps = false
  projectionTexture.minFilter = THREE.LinearFilter
  projectionTexture.magFilter = THREE.LinearFilter
  const projectionScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 3.3),
    new THREE.MeshBasicMaterial({ map: projectionTexture, fog: false }),
  )
  projectionScreen.position.set(1.35, 2.42, -3.88)
  const projector = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 0.18, 24),
    new THREE.MeshStandardMaterial({ color: 0x313a46, roughness: 0.42, metalness: 0.62 }),
  )
  projector.position.set(0, 4.78, -0.35)
  projector.rotation.x = 0.85
  disposables.push(diskFaceTexture, computerScreenTexture, projectionTexture)
  scene.add(projectionFrame, projectionScreen, projector)

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
  let currentModel = options.initialModel

  function rebuildDynamic() {
    for (const child of [...dynamicGroup.children]) {
      dynamicGroup.remove(child)
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        const material = child.material
        if (!Array.isArray(material) && material.map) material.map.dispose()
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

  }

  const PROJECTION_COLORS: Record<string, string> = {
    combine: '#63d49b',
    clash: '#e26868',
    generates: '#6aa7df',
    controls: '#d7a54a',
    harm: '#9c86c8',
  }
  let lastProjectionDraw = Number.NEGATIVE_INFINITY

  function drawProjection(elapsed = 0) {
    if (!projectionContext) return
    const model = currentModel
    const width = projectionCanvas.width / 2
    const height = projectionCanvas.height / 2
    projectionContext.setTransform(2, 0, 0, 2, 0, 0)
    projectionContext.fillStyle = '#072033'
    projectionContext.fillRect(0, 0, width, height)
    const glow = projectionContext.createRadialGradient(width / 2, height / 2, 70, width / 2, height / 2, 610)
    glow.addColorStop(0, 'rgba(74, 147, 193, 0.16)')
    glow.addColorStop(1, 'rgba(5, 16, 27, 0)')
    projectionContext.fillStyle = glow
    projectionContext.fillRect(0, 0, width, height)
    projectionContext.strokeStyle = 'rgba(212, 175, 109, 0.38)'
    projectionContext.lineWidth = 7
    projectionContext.strokeRect(20, 20, width - 40, height - 40)
    projectionContext.fillStyle = '#f2d998'
    projectionContext.font = '700 44px "Noto Serif SC", "Songti SC", serif'
    projectionContext.textAlign = 'center'
    projectionContext.textBaseline = 'middle'
    projectionContext.fillText(options.labels.chart, width / 2, 72)
    const cards = model.pillars.slice(0, 5).map((pillar, index) => ({
      ...pillar,
      x: 85 + index * 176,
      y: 148,
    }))
    if (model.phase === 'revealed') {
      for (const link of model.links) {
        const from = cards.find(card => card.key === link.from)
        const to = cards.find(card => card.key === link.to)
        if (!from || !to) continue
        projectionContext.beginPath()
        projectionContext.moveTo(from.x + 72, from.y + 100)
        projectionContext.quadraticCurveTo((from.x + to.x) / 2 + 72, 106, to.x + 72, to.y + 100)
        projectionContext.strokeStyle = PROJECTION_COLORS[link.type] ?? '#8fa8c0'
        projectionContext.globalAlpha = 0.62
        projectionContext.lineWidth = link.type === 'clash' ? 4 : 3
        if (link.type === 'clash') projectionContext.setLineDash([11, 9])
        else if (link.type === 'combine') projectionContext.setLineDash([4, 5])
        else projectionContext.setLineDash([13, 6])
        projectionContext.stroke()
        projectionContext.setLineDash([])
        projectionContext.globalAlpha = 1
        projectionContext.fillStyle = PROJECTION_COLORS[link.type] ?? '#8fa8c0'
        projectionContext.font = '500 17px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
        projectionContext.textAlign = 'center'
        projectionContext.fillText(link.label, (from.x + to.x) / 2 + 72, 112)
      }
    }

    for (const card of cards) {
      const highlighted = model.phase !== 'idle' && card.highlighted
      projectionContext.fillStyle = card.key === 'today' ? 'rgba(9, 49, 38, 0.94)' : 'rgba(12, 23, 36, 0.92)'
      projectionContext.fillRect(card.x, card.y, 144, 190)
      projectionContext.strokeStyle = highlighted ? '#ffd879' : 'rgba(180, 204, 224, 0.32)'
      projectionContext.lineWidth = highlighted ? 4 : 2
      projectionContext.strokeRect(card.x, card.y, 144, 190)
      projectionContext.textAlign = 'center'
      projectionContext.textBaseline = 'middle'
      projectionContext.fillStyle = highlighted ? '#ffd879' : 'rgba(209, 225, 240, 0.52)'
      projectionContext.font = '500 18px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
      projectionContext.fillText(card.label, card.x + 72, card.y + 28)
      projectionContext.fillStyle = card.key === 'today' ? '#9df5cf' : '#f4f8ff'
      projectionContext.font = '700 42px "Noto Serif SC", "Songti SC", serif'
      projectionContext.fillText(card.gan, card.x + 72, card.y + 92)
      projectionContext.fillText(card.zhi, card.x + 72, card.y + 152)
      if (card.key === 'today') {
        projectionContext.fillStyle = 'rgba(100, 224, 170, 0.24)'
        projectionContext.fillRect(card.x, card.y, 144, 5)
      }
    }

    if (model.phase === 'calculating') {
      projectionContext.save()
      projectionContext.translate(width / 2, height / 2)
      projectionContext.rotate(elapsed * 1.7)
      projectionContext.strokeStyle = 'rgba(217, 180, 93, 0.72)'
      projectionContext.lineWidth = 6
      projectionContext.setLineDash([38, 30])
      projectionContext.beginPath()
      projectionContext.arc(0, 0, 118, 0, Math.PI * 2)
      projectionContext.stroke()
      projectionContext.restore()
    }
    else {
      const sweep = (elapsed * 0.17) % 1
      projectionContext.globalAlpha = model.phase === 'revealed' ? 0.24 : 0.13
      projectionContext.fillStyle = '#9adfff'
      projectionContext.fillRect(40, 392 + sweep * 76, width - 80, 2)
      projectionContext.globalAlpha = 1
    }
    projectionTexture.needsUpdate = true
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
  rebuildDynamic()
  drawProjection(0)
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
    const [{ EffectComposer }, { RenderPass }, { OutputPass }] = await Promise.all([
      import('three/examples/jsm/postprocessing/EffectComposer.js'),
      import('three/examples/jsm/postprocessing/RenderPass.js'),
      import('three/examples/jsm/postprocessing/OutputPass.js'),
    ])
    const effectComposer = new EffectComposer(renderer)
    effectComposer.addPass(new RenderPass(scene, camera))
    effectComposer.addPass(new OutputPass())
    composer = effectComposer
  }
  renderer.setPixelRatio(quality === 'high' ? Math.min(window.devicePixelRatio, 2) : quality === 'mid' ? Math.min(window.devicePixelRatio, 1.5) : 1)
  resize()

  if (Object.values(BAZI_ROOM_ASSET_MANIFEST.assets).some(asset => asset.glb)) {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    const loader = new GLTFLoader()
    const loadGltf = (glb: string | null, parent: THREE.Object3D) => (
      glb ? loader.loadAsync(glb).then(gltf => parent.add(gltf.scene)) : Promise.resolve()
    )
    const assets = BAZI_ROOM_ASSET_MANIFEST.assets
    await Promise.all([
      loadGltf(assets.instrument.glb, instrumentGroup),
      loadGltf(assets.keeper.glb, keeper),
      loadGltf(assets.ganzhiDisk.glb, ganzhiDisk),
      loadGltf(assets.fiveElements.glb, fiveElements),
      loadGltf(assets.deskComputer.glb, deskComputer),
      loadGltf(assets.projectionScreen.glb, scene),
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

  function tick(now: number) {
    frame = requestAnimationFrame(tick)
    if (!visible || document.visibilityState === 'hidden') return
    if (reducedMotion || quality === 'low') {
      if (dirty) renderCurrent()
      return
    }

    const elapsed = now / 1000
    if (now - lastProjectionDraw >= 100) {
      lastProjectionDraw = now
      drawProjection(elapsed)
    }
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
      rebuildDynamic()
      drawProjection(0)
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
