import type * as THREE from 'three'
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
  currentBazi: string
  flowYear: string
  flowMonth: string
  flowDay: string
  flowHour: string
  pillars: string
  reading: string
  fullChart: string
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
  onKeeperAnchor?: (xPercent: number, yPercent: number) => void
  onReady?: (stats: BaziRoomRendererStats) => void
  onError?: (message: string) => void
}

interface ArmRig {
  shoulder: THREE.Group
  elbow: THREE.Group
  wrist: THREE.Group
  palm: THREE.Group
}

interface LegRig {
  hip: THREE.Group
  knee: THREE.Group
  ankle: THREE.Group
}

interface CharacterRig {
  root: THREE.Group
  head: THREE.Group
  leftArm: ArmRig
  rightArm: ArmRig
  legs: LegRig[]
}

const MOUNTAINS = [
  '壬', '子', '癸', '丑', '艮', '寅', '甲', '卯',
  '乙', '辰', '巽', '巳', '丙', '午', '丁', '未',
  '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥',
]
const TRIGRAMS = ['震', '巽', '离', '坤', '兑', '乾', '坎', '艮']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const ZODIACS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const CLASSIC_BOOKS = ['渊海子平', '三命通会', '滴天髓', '穷通宝鉴']

function canvas2d(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return { canvas, context: canvas.getContext('2d') }
}

function bookSpineTexture(title: string) {
  const { canvas, context } = canvas2d(96, 512)
  if (context) {
    context.fillStyle = '#7b402e'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'rgba(28, 17, 9, 0.35)'
    context.fillRect(8, 18, canvas.width - 16, canvas.height - 36)
    context.fillStyle = '#f0d79b'
    context.font = '700 44px "Noto Serif SC", "Songti SC", serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    title.split('').forEach((character, index) => {
      context.fillText(character, canvas.width / 2, 92 + index * 88)
    })
  }
  return canvas
}

function compassTexture() {
  const { canvas, context } = canvas2d(1024, 1024)
  if (context) {
    context.fillStyle = '#24180c'
    context.fillRect(0, 0, 1024, 1024)
    context.translate(512, 512)
    for (const [radius, color, width] of [
      [462, '#d8b160', 7], [408, '#8a683d', 4], [340, '#d8b160', 5],
      [268, '#8a683d', 4], [196, '#d8b160', 5], [124, '#8a683d', 4], [68, '#d8b160', 6],
    ] as Array<[number, string, number]>) {
      context.beginPath()
      context.arc(0, 0, radius, 0, Math.PI * 2)
      context.strokeStyle = color
      context.lineWidth = width
      context.stroke()
    }
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = '#f2d998'
    context.font = '700 31px "Noto Serif SC", "Songti SC", serif'
    MOUNTAINS.forEach((label, index) => {
      const angle = (index / MOUNTAINS.length) * Math.PI * 2 - Math.PI / 2
      context.save()
      context.translate(Math.cos(angle) * 436, Math.sin(angle) * 436)
      context.rotate(angle + Math.PI / 2)
      context.fillText(label, 0, 0)
      context.restore()
    })
    context.fillStyle = '#dceaf8'
    context.font = '600 39px "Noto Serif SC", "Songti SC", serif'
    TRIGRAMS.forEach((label, index) => {
      const angle = (index / TRIGRAMS.length) * Math.PI * 2 - Math.PI / 2 + Math.PI / 8
      context.fillText(label, Math.cos(angle) * 368, Math.sin(angle) * 368)
    })
    context.fillStyle = '#f2d998'
    context.font = '600 42px "Noto Serif SC", "Songti SC", serif'
    BRANCHES.forEach((label, index) => {
      const angle = (index / BRANCHES.length) * Math.PI * 2 - Math.PI / 2
      context.fillText(label, Math.cos(angle) * 296, Math.sin(angle) * 296)
    })
    context.fillStyle = '#dceaf8'
    context.font = '500 37px "Noto Sans SC", "PingFang SC", sans-serif'
    ZODIACS.forEach((label, index) => {
      const angle = (index / ZODIACS.length) * Math.PI * 2 - Math.PI / 2
      context.fillText(label, Math.cos(angle) * 224, Math.sin(angle) * 224)
    })
    context.beginPath()
    context.arc(0, 0, 59, 0, Math.PI * 2)
    context.fillStyle = '#101c22'
    context.fill()
    context.strokeStyle = '#d8b160'
    context.lineWidth = 6
    context.stroke()
    context.beginPath()
    context.moveTo(-46, 0)
    context.lineTo(46, 0)
    context.moveTo(0, -46)
    context.lineTo(0, 46)
    context.strokeStyle = '#c8382f'
    context.lineWidth = 5
    context.stroke()
  }
  return canvas
}

function signTexture(title: string, subtitle: string) {
  const { canvas, context } = canvas2d(1024, 256)
  if (context) {
    context.fillStyle = '#201408'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = '#d4af6d'
    context.lineWidth = 10
    context.strokeRect(16, 16, canvas.width - 32, canvas.height - 32)
    context.fillStyle = '#f2d998'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = '700 90px "Noto Serif SC", "Songti SC", serif'
    context.fillText(title, canvas.width / 2, 100)
    context.font = '400 36px "Noto Sans SC", "PingFang SC", sans-serif'
    context.fillStyle = 'rgba(242, 217, 152, 0.68)'
    context.fillText(subtitle, canvas.width / 2, 194)
  }
  return canvas
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.geometry.dispose()
    const material = mesh.material
    if (Array.isArray(material)) material.forEach(item => item.dispose())
    else material.dispose()
  })
}

function makeArm(THREE: typeof import('three'), side: -1 | 1, sleeveColor: number, skinColor: number): ArmRig {
  const shoulder = new THREE.Group()
  shoulder.position.set(side * 0.235, 0.325, 0)
  const sleeveMaterial = new THREE.MeshStandardMaterial({ color: sleeveColor, roughness: 0.75 })
  const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.23, 4, 10), sleeveMaterial)
  upperArm.position.y = -0.15
  shoulder.add(upperArm)

  const elbow = new THREE.Group()
  elbow.position.y = -0.3
  const lowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.047, 0.21, 4, 10), sleeveMaterial)
  lowerArm.position.y = -0.14
  elbow.add(lowerArm)
  shoulder.add(elbow)

  const wrist = new THREE.Group()
  wrist.position.y = -0.29
  elbow.add(wrist)
  const palm = new THREE.Group()
  const handMaterial = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.62 })
  palm.add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.038), handMaterial))
  wrist.add(palm)
  for (let index = 0; index < 4; index += 1) {
    const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.048, 2, 6), handMaterial)
    finger.position.set(-0.03 + index * 0.02, -0.078, 0)
    finger.rotation.x = -0.18
    palm.add(finger)
  }
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.042, 2, 6), handMaterial)
  thumb.position.set(side * 0.047, -0.04, 0.012)
  thumb.rotation.z = side * -0.65
  palm.add(thumb)
  return { shoulder, elbow, wrist, palm }
}

function makeLeg(THREE: typeof import('three'), side: -1 | 1, pantColor: number, shoeColor: number): LegRig {
  const hip = new THREE.Group()
  hip.position.set(side * 0.105, 0, 0)
  const pantMaterial = new THREE.MeshStandardMaterial({ color: pantColor, roughness: 0.78 })
  const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.24, 4, 10), pantMaterial)
  thigh.position.y = -0.17
  hip.add(thigh)
  const knee = new THREE.Group()
  knee.position.y = -0.34
  const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.23, 4, 10), pantMaterial)
  shin.position.y = -0.16
  knee.add(shin)
  hip.add(knee)
  const ankle = new THREE.Group()
  ankle.position.y = -0.32
  const shoe = new THREE.Mesh(
    new THREE.BoxGeometry(0.105, 0.068, 0.21),
    new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.48 }),
  )
  shoe.position.set(0, -0.032, 0.042)
  ankle.add(shoe)
  knee.add(ankle)
  hip.rotation.x = -1.42
  knee.rotation.x = 1.38
  ankle.rotation.x = 0.14
  return { hip, knee, ankle }
}

function makeKeeper(THREE: typeof import('three')): CharacterRig {
  const root = new THREE.Group()
  root.userData.roomRole = 'keeper'
  root.position.set(-1.2, 0, -0.82)
  root.rotation.y = 0.24
  const skin = 0xd8b294
  const robeColor = 0x365f56
  const legs = [makeLeg(THREE, -1, 0x2b4039, 0x24170f), makeLeg(THREE, 1, 0x2b4039, 0x24170f)]
  const pelvis = new THREE.Group()
  pelvis.position.y = 0.67
  legs.forEach(leg => pelvis.add(leg.hip))
  root.add(pelvis)

  const torso = new THREE.Group()
  torso.position.y = 0.67
  const robe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.31, 0.58, 18),
    new THREE.MeshStandardMaterial({ color: robeColor, roughness: 0.76 }),
  )
  robe.position.y = 0.27
  const shoulderBlock = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.18, 0.24, 6, 14),
    new THREE.MeshStandardMaterial({ color: robeColor, roughness: 0.72 }),
  )
  shoulderBlock.position.y = 0.51
  torso.add(robe, shoulderBlock)
  for (let index = 0; index < 5; index += 1) {
    const button = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xd8b160, roughness: 0.3, metalness: 0.55 }),
    )
    button.position.set(0.025, 0.47 - index * 0.095, 0.215)
    torso.add(button)
  }
  root.add(torso)

  const leftArm = makeArm(THREE, -1, 0x3f6b60, skin)
  const rightArm = makeArm(THREE, 1, 0x3f6b60, skin)
  torso.add(leftArm.shoulder, rightArm.shoulder)

  const head = new THREE.Group()
  head.position.y = 0.72
  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(0.155, 22, 18),
    new THREE.MeshStandardMaterial({ color: skin, roughness: 0.62 }),
  )
  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(0.158, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: 0x23160d, roughness: 0.55 }),
  )
  crown.position.y = 0.035
  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.175, 0.175, 0.018, 24),
    new THREE.MeshStandardMaterial({ color: 0x1c1109, roughness: 0.5 }),
  )
  hatBrim.position.y = 0.04
  const beard = new THREE.Mesh(
    new THREE.ConeGeometry(0.088, 0.2, 14),
    new THREE.MeshStandardMaterial({ color: 0xe8eef7, roughness: 0.78 }),
  )
  beard.position.set(0, -0.115, 0.112)
  beard.rotation.x = 0.24
  head.add(skull, crown, hatBrim, beard)
  const glassesMaterial = new THREE.MeshStandardMaterial({ color: 0xc9ab68, roughness: 0.25, metalness: 0.72 })
  ;[-0.062, 0.062].forEach((x) => {
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.041, 0.007, 8, 22), glassesMaterial)
    lens.position.set(x, 0.015, 0.135)
    head.add(lens)
  })
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.01), glassesMaterial)
  bridge.position.set(0, 0.018, 0.142)
  head.add(bridge)
  torso.add(head)
  return { root, head, leftArm, rightArm, legs }
}

function makeVisitor(THREE: typeof import('three')): CharacterRig {
  const root = new THREE.Group()
  root.userData.roomRole = 'visitor'
  root.position.set(1.08, 0, 1.18)
  root.rotation.y = Math.PI - 0.2
  const skin = 0xcaa27e
  const legs = [makeLeg(THREE, -1, 0x39506d, 0xf2f4f7), makeLeg(THREE, 1, 0x39506d, 0xf2f4f7)]
  const pelvis = new THREE.Group()
  pelvis.position.y = 0.62
  legs.forEach(leg => pelvis.add(leg.hip))
  root.add(pelvis)
  const torso = new THREE.Group()
  torso.position.y = 0.62
  const jacket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.23, 0.5, 18),
    new THREE.MeshStandardMaterial({ color: 0xd86d26, roughness: 0.72 }),
  )
  jacket.position.y = 0.28
  const chest = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.16, 0.2, 6, 14),
    new THREE.MeshStandardMaterial({ color: 0xe07d31, roughness: 0.68 }),
  )
  chest.position.y = 0.46
  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.36, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x3c434d, roughness: 0.82 }),
  )
  backpack.position.set(0, 0.34, -0.18)
  torso.add(jacket, chest, backpack)
  root.add(torso)
  const leftArm = makeArm(THREE, -1, 0xd86d26, skin)
  const rightArm = makeArm(THREE, 1, 0xd86d26, skin)
  torso.add(leftArm.shoulder, rightArm.shoulder)
  const head = new THREE.Group()
  head.position.y = 0.7
  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(0.145, 22, 18),
    new THREE.MeshStandardMaterial({ color: skin, roughness: 0.62 }),
  )
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.151, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.56),
    new THREE.MeshStandardMaterial({ color: 0x241c17, roughness: 0.72 }),
  )
  hair.rotation.x = -0.18
  head.add(skull, hair)
  torso.add(head)
  return { root, head, leftArm, rightArm, legs }
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
  renderer.toneMappingExposure = 1.16

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x05080f)
  scene.fog = new THREE.Fog(0x05080f, 7, 14)
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30)
  const raycaster = new THREE.Raycaster()
  const keeperAnchorVector = new THREE.Vector3()
  const cameraTarget = new THREE.Vector3(0.05, 1.28, -0.1)
  const orbit = { yaw: 0, pitch: 0.1, targetYaw: 0, targetPitch: 0.1, distance: 6, targetDistance: 4.95 }
  let reducedMotion = options.reducedMotion
  const key = new THREE.DirectionalLight(0xffe2ab, 1.78)
  key.position.set(2.8, 4.6, 3.1)
  const rim = new THREE.DirectionalLight(0x74a9ff, 0.72)
  rim.position.set(-3.2, 2.4, -2.4)
  scene.add(new THREE.AmbientLight(0xdcecff, 0.7), key, rim)

  const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = []
  const room = new THREE.Group()
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: 0x111820, roughness: 0.84, metalness: 0.06 }),
  )
  floor.position.y = -0.1
  const carpet = new THREE.Mesh(
    new THREE.BoxGeometry(7.6, 0.04, 5.9),
    new THREE.MeshStandardMaterial({ color: 0x5d2a31, roughness: 0.88 }),
  )
  carpet.position.set(0, 0.02, 0.35)
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(18, 6.4, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x141d29, roughness: 0.92 }),
  )
  backWall.position.set(0, 3, -4.3)
  const wallPanel = new THREE.Mesh(
    new THREE.BoxGeometry(9.4, 4.6, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x23160d, roughness: 0.72 }),
  )
  wallPanel.position.set(0, 2.5, -4.14)
  room.add(floor, carpet, backWall, wallPanel)

  const signMap = new THREE.CanvasTexture(signTexture(options.labels.room, options.labels.chart))
  signMap.colorSpace = THREE.SRGBColorSpace
  disposables.push(signMap)
  const roomSign = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.56), new THREE.MeshBasicMaterial({ map: signMap }))
  roomSign.position.set(-2.8, 4.78, -4.05)

  const woodDark = new THREE.MeshStandardMaterial({ color: 0x422c1b, roughness: 0.64, metalness: 0.1 })
  const woodMid = new THREE.MeshStandardMaterial({ color: 0x5c422a, roughness: 0.58, metalness: 0.14 })
  const brass = new THREE.MeshStandardMaterial({ color: 0xd8b160, roughness: 0.26, metalness: 0.78 })
  const ceramic = new THREE.MeshStandardMaterial({ color: 0xd9d3c7, roughness: 0.38, metalness: 0.06 })

  const bookshelf = new THREE.Group()
  const shelfSideLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 1.22), woodDark)
  shelfSideLeft.position.set(-0.82, 1.1, 0)
  const shelfSideRight = shelfSideLeft.clone()
  shelfSideRight.position.x = 0.82
  bookshelf.add(shelfSideLeft, shelfSideRight)
  ;[0.18, 0.76, 1.34, 1.92].forEach((y) => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.07, 1.14), woodMid)
    shelf.position.y = y
    bookshelf.add(shelf)
  })
  CLASSIC_BOOKS.forEach((title, index) => {
    const texture = new THREE.CanvasTexture(bookSpineTexture(title))
    texture.colorSpace = THREE.SRGBColorSpace
    disposables.push(texture)
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, 0.52, 0.36),
      new THREE.MeshStandardMaterial({ color: 0x7b402e, roughness: 0.72 }),
    )
    const spine = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.5), new THREE.MeshBasicMaterial({ map: texture }))
    spine.rotation.y = -Math.PI / 2
    spine.position.x = -0.039
    book.add(spine)
    book.position.set(-0.52 + index * 0.13, 1.08, -0.28 + (index % 2) * 0.06)
    book.rotation.z = index === 3 ? -0.16 : 0
    bookshelf.add(book)
  })
  bookshelf.position.set(-3.95, 0, -3.1)
  bookshelf.rotation.y = 0.25

  const desk = new THREE.Group()
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.1, 1.28), woodMid)
  deskTop.position.y = 0.94
  const deskFront = new THREE.Mesh(new THREE.BoxGeometry(4.82, 0.74, 0.09), woodDark)
  deskFront.position.set(0, 0.56, 0.61)
  const deskLeft = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.74, 1.1), woodDark)
  deskLeft.position.set(-2.31, 0.56, 0)
  const deskRight = deskLeft.clone()
  deskRight.position.x = 2.31
  desk.add(deskTop, deskFront, deskLeft, deskRight)

  const compass = new THREE.Group()
  const compassMap = new THREE.CanvasTexture(compassTexture())
  compassMap.colorSpace = THREE.SRGBColorSpace
  compassMap.anisotropy = renderer.capabilities.getMaxAnisotropy()
  disposables.push(compassMap)
  const compassBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.58, 0.045, 56), woodDark)
  const compassFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.53, 64),
    new THREE.MeshStandardMaterial({ map: compassMap, roughness: 0.46, metalness: 0.08 }),
  )
  compassFace.rotation.x = -Math.PI / 2
  compassFace.position.y = 0.027
  const compassRim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.017, 10, 72), brass)
  compassRim.rotation.x = Math.PI / 2
  compassRim.position.y = 0.026
  const redLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.86, 0.006, 0.012),
    new THREE.MeshStandardMaterial({ color: 0xc8382f, emissive: 0x43100b, emissiveIntensity: 0.4, roughness: 0.35 }),
  )
  redLine.position.y = 0.034
  redLine.rotation.y = 0.22
  compass.add(compassBase, compassFace, compassRim, redLine)
  compass.position.set(0.8, 1.43, -0.18)
  compass.rotation.x = -0.45
  const compassStand = new THREE.Group()
  ;[-0.25, 0.25].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.032, 0.48, 10), woodDark)
    leg.position.set(x + 0.8, 1.19, -0.04)
    leg.rotation.z = x > 0 ? -0.2 : 0.2
    compassStand.add(leg)
  })
  const compassCrossbar = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.05, 0.09), woodMid)
  compassCrossbar.position.set(0.8, 1.13, -0.09)
  compassStand.add(compassCrossbar)

  const objects = new THREE.Group()
  const lotTube = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.062, 0.25, 18), woodDark)
  lotTube.position.set(-0.16, 1.11, -0.35)
  objects.add(lotTube)
  for (let index = 0; index < 9; index += 1) {
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.31, 5),
      new THREE.MeshStandardMaterial({ color: index % 3 === 0 ? 0xb3372d : 0xc99b62, roughness: 0.68 }),
    )
    const angle = (index / 9) * Math.PI * 2
    stick.position.set(-0.16 + Math.cos(angle) * 0.028, 1.16, -0.35 + Math.sin(angle) * 0.028)
    stick.rotation.z = Math.cos(angle) * 0.1
    stick.rotation.x = Math.sin(angle) * -0.1
    objects.add(stick)
  }
  const brushPot = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.075, 0.18, 20), ceramic)
  brushPot.position.set(1.58, 1.08, -0.44)
  objects.add(brushPot)
  ;[-0.16, 0.04, 0.2].forEach((rotation) => {
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.009, 0.36, 7),
      new THREE.MeshStandardMaterial({ color: 0x2b1c12, roughness: 0.6 }),
    )
    handle.position.set(1.58 + rotation * 0.18, 1.24, -0.44)
    handle.rotation.z = rotation
    objects.add(handle)
  })
  const inkstone = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.045, 0.2), woodDark)
  inkstone.position.set(0.05, 1.01, -0.46)
  const inkPool = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.02, 18),
    new THREE.MeshStandardMaterial({ color: 0x12100f, roughness: 0.24 }),
  )
  inkPool.position.set(0, 1.038, -0.46)
  objects.add(inkstone, inkPool)
  ;[-0.68, -0.54].forEach((x, index) => {
    const paperRoll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.54, 16),
      new THREE.MeshStandardMaterial({ color: 0xe6dcc5, roughness: 0.82 }),
    )
    paperRoll.rotation.z = Math.PI / 2
    paperRoll.rotation.y = index * 0.1
    paperRoll.position.set(x, 1.015, -0.32)
    objects.add(paperRoll)
  })
  const teapot = new THREE.Group()
  const potBody = new THREE.Mesh(new THREE.SphereGeometry(0.092, 20, 16), ceramic)
  const potSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.025, 0.12, 9), ceramic)
  potSpout.position.set(0.09, 0.015, 0)
  potSpout.rotation.z = -0.82
  const potLid = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 10), ceramic)
  potLid.position.y = 0.082
  teapot.add(potBody, potSpout, potLid)
  teapot.position.set(-1.42, 1.05, -0.3)
  objects.add(teapot)
  const cupOffsets: Array<[number, number]> = [[0.26, 0], [0.4, 0.07]]
  cupOffsets.forEach(([x, z]) => {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.028, 0.043, 16), ceramic)
    cup.position.set(-1.42 + x, 1.016, -0.3 + z)
    objects.add(cup)
  })
  for (let index = 0; index < 3; index += 1) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.005, 20), brass)
    coin.position.set(-0.72, 0.975 + index * 0.007, 0.1)
    coin.rotation.x = Math.PI / 2 + index * 0.12 - 0.1
    coin.rotation.z = index * 0.5
    objects.add(coin)
  }
  const incenseBurner = new THREE.Group()
  const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.085, 0.11, 22), brass)
  const burnerFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.025, 16), woodDark)
  burnerFoot.position.y = -0.065
  incenseBurner.add(burner, burnerFoot)
  incenseBurner.position.set(1.92, 1.045, 0.05)
  ;[-0.025, 0, 0.025].forEach((x, index) => {
    const incense = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, 0.3, 5),
      new THREE.MeshStandardMaterial({ color: 0x40342a, roughness: 0.9 }),
    )
    incense.position.set(1.92 + x, 1.21, 0.05)
    incense.rotation.z = 0.08 + index * 0.02
    objects.add(incense)
  })
  objects.add(incenseBurner)

  const projectionFrame = new THREE.Mesh(
    new THREE.BoxGeometry(7.3, 3.55, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x181f2a, roughness: 0.38, metalness: 0.48 }),
  )
  projectionFrame.position.set(0.55, 2.42, -4.02)
  const projectionCanvas = document.createElement('canvas')
  projectionCanvas.width = 2048
  projectionCanvas.height = 1024
  const projectionContext = projectionCanvas.getContext('2d')
  const projectionTexture = new THREE.CanvasTexture(projectionCanvas)
  projectionTexture.colorSpace = THREE.SRGBColorSpace
  projectionTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  projectionTexture.generateMipmaps = false
  projectionTexture.minFilter = THREE.LinearFilter
  projectionTexture.magFilter = THREE.LinearFilter
  disposables.push(projectionTexture)
  const projectionScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(6.9, 3.16),
    new THREE.MeshBasicMaterial({ map: projectionTexture, fog: false }),
  )
  projectionScreen.position.set(0.55, 2.42, -3.88)
  const projector = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.16, 20), brass)
  projector.position.set(0.1, 4.68, -0.4)
  projector.rotation.x = 0.82

  const keeperChair = new THREE.Group()
  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.28, 0.09), woodDark)
  chairBack.position.set(-1.2, 1.16, -1.24)
  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.08, 0.72), woodMid)
  chairSeat.position.set(-1.2, 0.65, -0.86)
  keeperChair.add(chairBack, chairSeat)
  const visitorStool = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.1, 22), woodMid)
  visitorStool.position.set(1.08, 0.56, 1.18)

  const keeper = makeKeeper(THREE)
  const visitor = makeVisitor(THREE)
  room.add(
    roomSign, desk, bookshelf, compass, compassStand, objects,
    projectionFrame, projectionScreen, projector, keeperChair,
    visitorStool, keeper.root, visitor.root,
  )
  scene.add(room)

  const pickTargets = [keeper.root, visitor.root]
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
  let lastProjectionDraw = Number.NEGATIVE_INFINITY

  function drawPillarCard(
    context: CanvasRenderingContext2D,
    x: number, y: number, width: number, height: number,
    label: string, value: string, highlighted: boolean,
  ) {
    context.fillStyle = highlighted ? 'rgba(43, 55, 35, 0.94)' : 'rgba(13, 24, 37, 0.92)'
    context.fillRect(x, y, width, height)
    context.strokeStyle = highlighted ? '#ffd879' : 'rgba(180, 204, 224, 0.3)'
    context.lineWidth = highlighted ? 4 : 2
    context.strokeRect(x, y, width, height)
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = highlighted ? '#ffd879' : 'rgba(209, 225, 240, 0.54)'
    context.font = '500 20px "Noto Sans SC", "PingFang SC", sans-serif'
    context.fillText(label, x + width / 2, y + 30)
    context.fillStyle = highlighted ? '#f4f8ff' : '#dce8f6'
    context.font = '700 44px "Noto Serif SC", "Songti SC", serif'
    context.fillText(value, x + width / 2, y + height / 2 + 18)
  }

  function drawWrappedText(
    context: CanvasRenderingContext2D,
    text: string,
    centerX: number,
    startY: number,
    maxWidth: number,
    maxLines: number,
    lineHeight: number,
  ) {
    let line = ''
    let yPos = startY
    let lineCount = 0
    for (const character of text) {
      const candidate = line + character
      if (context.measureText(candidate).width > maxWidth && line) {
        context.fillText(line, centerX, yPos)
        line = character
        lineCount += 1
        yPos += lineHeight
        if (lineCount >= maxLines - 1) break
      }
      else {
        line = candidate
      }
    }
    if (line && lineCount < maxLines) context.fillText(line, centerX, yPos)
  }

  function drawProjection(elapsed = 0) {
    if (!projectionContext) return
    const context = projectionContext
    const width = projectionCanvas.width / 2
    const height = projectionCanvas.height / 2
    context.setTransform(2, 0, 0, 2, 0, 0)
    context.fillStyle = '#072033'
    context.fillRect(0, 0, width, height)
    const glow = context.createRadialGradient(width / 2, height / 2, 60, width / 2, height / 2, 610)
    glow.addColorStop(0, 'rgba(74, 147, 193, 0.14)')
    glow.addColorStop(1, 'rgba(5, 16, 27, 0)')
    context.fillStyle = glow
    context.fillRect(0, 0, width, height)
    context.strokeStyle = 'rgba(212, 175, 109, 0.36)'
    context.lineWidth = 7
    context.strokeRect(20, 20, width - 40, height - 40)

    const isResult = currentModel.flowStage === 'slideshow'
    const screenTitle = isResult
      ? currentModel.slideTitle || options.labels.revealed
      : currentModel.flowStage === 'calculating'
        ? options.labels.calculating
        : options.labels.currentBazi
    context.fillStyle = '#f2d998'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = '700 42px "Noto Serif SC", "Songti SC", serif'
    context.fillText(screenTitle, width / 2, 74)
    if (isResult) {
      context.font = '500 20px "Noto Sans SC", "PingFang SC", sans-serif'
      context.fillStyle = 'rgba(242, 217, 152, 0.82)'
      context.fillText(`${currentModel.slideIndex + 1} / ${currentModel.slideCount}`, width / 2, 452)
      const progressWidth = (width - 160) * ((currentModel.slideIndex + 1) / currentModel.slideCount)
      context.fillStyle = 'rgba(233, 238, 250, 0.12)'
      context.fillRect(80, 470, width - 160, 3)
      context.fillStyle = '#d9b45d'
      context.fillRect(80, 470, progressWidth, 3)
      context.fillStyle = '#f2d998'
    }

    if (isResult && currentModel.slideId === 'full-chart') {
      context.textAlign = 'left'
      context.fillStyle = 'rgba(226, 237, 249, 0.84)'
      context.font = '400 24px "Noto Sans SC", "PingFang SC", sans-serif'
      drawWrappedText(context, currentModel.slideDetail || options.labels.revealed, 148, 148, 730, 5, 38)
      context.textAlign = 'center'
      context.fillStyle = '#f2d998'
      context.strokeStyle = 'rgba(217, 180, 93, 0.75)'
      context.lineWidth = 3
      context.beginPath()
      context.roundRect(width / 2 - 155, 326, 310, 62, 8)
      context.fill()
      context.stroke()
      context.fillStyle = '#25190a'
      context.font = '700 24px "Noto Sans SC", "PingFang SC", sans-serif'
      context.fillText(options.labels.fullChart, width / 2, 358)
    }
    else if (isResult && (
      currentModel.slideId === 'reading'
      || currentModel.slideId === 'topic-natal'
      || currentModel.slideId === 'topic-extra'
      || currentModel.slideId === 'topic-current'
    )) {
      context.textAlign = 'left'
      context.fillStyle = 'rgba(226, 237, 249, 0.84)'
      context.font = '400 23px "Noto Sans SC", "PingFang SC", sans-serif'
      drawWrappedText(context, currentModel.slideDetail || options.labels.revealed, 148, 146, 730, 8, 36)
      context.textAlign = 'center'
    }
    else {
      const bootCards = currentModel.currentPillars.length
        ? currentModel.currentPillars
        : [
            { label: options.labels.flowYear, gan: '—', zhi: '—', highlighted: false },
            { label: options.labels.flowMonth, gan: '—', zhi: '—', highlighted: false },
            { label: options.labels.flowDay, gan: '—', zhi: '—', highlighted: false },
            { label: options.labels.flowHour, gan: '—', zhi: '—', highlighted: false },
          ]
      const cards = isResult && currentModel.slideId === 'natal'
        ? currentModel.pillars.filter(pillar => pillar.key !== 'today')
        : bootCards
      const visibleCards = cards.slice(0, 5)
      const cardWidth = 156
      const gap = 16
      const totalWidth = visibleCards.length * cardWidth + (visibleCards.length - 1) * gap
      visibleCards.forEach((pillar, index) => {
        const x = (width - totalWidth) / 2 + index * (cardWidth + gap)
        drawPillarCard(
          context, x, 138, cardWidth, 194,
          pillar.label, `${pillar.gan}${pillar.zhi}`,
          isResult ? pillar.highlighted : true,
        )
      })
      if (!isResult) {
        context.fillStyle = 'rgba(226, 237, 249, 0.68)'
        context.font = '400 20px "Noto Sans SC", "PingFang SC", sans-serif'
        drawWrappedText(context, currentModel.slideDetail || options.labels.idle, width / 2, 374, 720, 2, 30)
      }
      else {
        context.fillStyle = 'rgba(226, 237, 249, 0.76)'
        context.font = '400 20px "Noto Sans SC", "PingFang SC", sans-serif'
        drawWrappedText(context, currentModel.slideDetail, width / 2, 366, 720, 2, 30)
      }
    }
    if (currentModel.flowStage === 'calculating') {
      context.save()
      context.translate(width / 2, height / 2)
      context.rotate(elapsed * 1.4)
      context.strokeStyle = 'rgba(217, 180, 93, 0.68)'
      context.lineWidth = 6
      context.setLineDash([34, 28])
      context.beginPath()
      context.arc(0, 0, 108, 0, Math.PI * 2)
      context.stroke()
      context.restore()
    }
    else {
      const sweep = (elapsed * 0.16) % 1
      context.globalAlpha = isResult ? 0.22 : 0.12
      context.fillStyle = '#9adfff'
      context.fillRect(48, 400 + sweep * 68, width - 96, 2)
      context.globalAlpha = 1
    }
    projectionTexture.needsUpdate = true
  }

  function resize() {
    const width = root.clientWidth || 1
    const height = root.clientHeight || 1
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // A portrait viewport sees a horizontally compressed frustum. Widen the
    // lens and nudge the target so the keeper and projection stay in frame.
    camera.fov = camera.aspect < 0.8 ? 52 : 38
    cameraTarget.x = camera.aspect < 0.8 ? -0.18 : 0.05
    camera.updateProjectionMatrix()
    dirty = true
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
    if (pointerActive) {
      const deltaX = event.clientX - lastX
      const deltaY = event.clientY - lastY
      if (Math.hypot(deltaX, deltaY) >= 7) pointerMovedFar = true
      lastX = event.clientX
      lastY = event.clientY
      orbit.targetYaw = THREE.MathUtils.clamp(orbit.targetYaw - deltaX * 0.0032, -0.42, 0.42)
      orbit.targetPitch = THREE.MathUtils.clamp(orbit.targetPitch + deltaY * 0.0025, 0.035, 0.24)
      dirty = true
    }
    else {
      canvas.style.cursor = pickRoomRole(event.clientX, event.clientY) ? 'pointer' : 'grab'
    }
  }
  function pointerUp(event: PointerEvent) {
    pointerActive = false
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
  }
  canvas.style.touchAction = 'pan-y'
  function handleCanvasClick(event: MouseEvent) {
    if (pointerMovedFar || performance.now() - pointerStartedAt >= 700) return
    const role = pickRoomRole(event.clientX, event.clientY)
    if (role) options.onSelect?.(role)
  }
  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointermove', pointerMove)
  canvas.addEventListener('pointerup', pointerUp)
  canvas.addEventListener('pointercancel', pointerUp)
  canvas.addEventListener('click', handleCanvasClick)

  let visible = true
  const intersection = new IntersectionObserver((entries) => {
    visible = entries.some(entry => entry.isIntersecting)
    if (visible) dirty = true
  })
  intersection.observe(root)
  const visibility = () => {
    if (document.visibilityState === 'visible') dirty = true
  }
  document.addEventListener('visibilitychange', visibility)

  let composer: { render: () => void, setSize: (width: number, height: number) => void } | null = null
  let quality: BaziRoomQuality = 'mid'
  let sampleFrameMs = 0
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
    : options.qualityOverride ?? (sampleFrameMs <= 10 ? 'high' : sampleFrameMs <= 24 ? 'mid' : 'low')
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

  let frame = 0
  function markDirty() {
    dirty = true
  }
  function updateCamera() {
    orbit.yaw += (orbit.targetYaw - orbit.yaw) * 0.08
    orbit.pitch += (orbit.targetPitch - orbit.pitch) * 0.08
    orbit.distance += (orbit.targetDistance - orbit.distance) * 0.035
    const x = cameraTarget.x + orbit.distance * Math.sin(orbit.yaw) * Math.cos(orbit.pitch)
    const y = cameraTarget.y + orbit.distance * Math.sin(orbit.pitch)
    const z = cameraTarget.z + orbit.distance * Math.cos(orbit.yaw) * Math.cos(orbit.pitch)
    camera.position.set(x, y, z)
    camera.lookAt(cameraTarget)
  }
  function updateKeeper(elapsed: number) {
    const gesture = currentModel.keeperGesture
    keeper.root.rotation.y = 0.22 + Math.sin(elapsed * 0.42) * 0.025
    keeper.head.rotation.x = gesture === 'calculating' ? 0.31 : 0.05 + Math.sin(elapsed * 0.65) * 0.025
    keeper.head.rotation.y = gesture === 'present' ? -0.12 : Math.sin(elapsed * 0.29) * 0.05
    if (gesture === 'invite') {
      keeper.rightArm.shoulder.rotation.set(0.25, 0, -1.22)
      keeper.rightArm.elbow.rotation.set(0, 0, -0.38)
      keeper.rightArm.wrist.rotation.x = -0.2
      keeper.rightArm.palm.rotation.x = -0.45
    }
    else if (gesture === 'calculating') {
      const motion = Math.sin(elapsed * 3.2)
      keeper.rightArm.shoulder.rotation.set(0.72, 0, -0.58 + motion * 0.05)
      keeper.rightArm.elbow.rotation.set(0, 0, -0.95)
      keeper.rightArm.wrist.rotation.x = -0.35
      keeper.rightArm.palm.rotation.x = -0.52
    }
    else {
      keeper.rightArm.shoulder.rotation.set(0.08, 0, gesture === 'present' ? -0.68 : Math.sin(elapsed * 0.7) * 0.06)
      keeper.rightArm.elbow.rotation.set(0, 0, gesture === 'present' ? -0.72 : 0.58)
      keeper.rightArm.wrist.rotation.x = -0.12
      keeper.rightArm.palm.rotation.x = gesture === 'present' ? -0.38 : -0.18
    }
    keeper.leftArm.shoulder.rotation.set(0.08, 0, -Math.sin(elapsed * 0.7) * 0.06)
    keeper.leftArm.elbow.rotation.set(0, 0, -0.58)
    keeper.leftArm.wrist.rotation.x = -0.12
    keeper.leftArm.palm.rotation.x = -0.18
  }
  function updateVisitor(elapsed: number) {
    const watching = currentModel.flowStage === 'calculating' || currentModel.flowStage === 'slideshow'
    visitor.root.rotation.y = Math.PI - (watching ? 0.62 : 0.2)
    visitor.head.rotation.x = watching ? -0.2 : Math.sin(elapsed * 0.5) * 0.035
    visitor.head.rotation.y = watching ? -0.16 : Math.sin(elapsed * 0.31) * 0.07
    const idle = Math.sin(elapsed * 0.65) * 0.06
    visitor.leftArm.shoulder.rotation.set(0.12, 0, 0.24 + idle)
    visitor.leftArm.elbow.rotation.set(0, 0, 0.68)
    visitor.leftArm.wrist.rotation.x = -0.16
    visitor.leftArm.palm.rotation.x = -0.24
    visitor.rightArm.shoulder.rotation.set(watching ? 0.16 : 0.1, 0, -0.24 - idle)
    visitor.rightArm.elbow.rotation.set(0, 0, watching ? -0.92 : -0.68)
    visitor.rightArm.wrist.rotation.x = -0.16
    visitor.rightArm.palm.rotation.x = -0.24
  }
  function renderCurrent() {
    updateCamera()
    keeper.head.getWorldPosition(keeperAnchorVector).project(camera)
    options.onKeeperAnchor?.(
      Math.round(((keeperAnchorVector.x + 1) / 2) * 1000) / 10,
      Math.round(((1 - keeperAnchorVector.y) / 2) * 1000) / 10,
    )
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
    compass.rotation.z += currentModel.compassSpeed * 0.00055
    redLine.rotation.y = 0.22 + Math.sin(elapsed * 0.25) * 0.08
    updateKeeper(elapsed)
    updateVisitor(elapsed)
    renderCurrent()
  }
  function onContextLost(event: Event) {
    event.preventDefault()
    cancelAnimationFrame(frame)
    options.onError?.('WebGL context lost')
  }
  canvas.addEventListener('webglcontextlost', onContextLost)
  canvas.addEventListener('webglcontextrestored', () => {
    dirty = true
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
      drawProjection(0)
      orbit.targetDistance = model.flowStage === 'boot'
        ? 6.25
        : model.flowStage === 'calculating'
          ? 5.35
          : model.flowStage === 'slideshow'
            ? 5.05
            : 5.65
      dirty = true
      if (quality === 'low' || reducedMotion) {
        updateKeeper(0)
        updateVisitor(0)
        renderCurrent()
      }
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
        updateKeeper(0)
        updateVisitor(0)
        dirty = true
        renderCurrent()
      }
      else if (quality !== 'low') frame = requestAnimationFrame(tick)
    },
    resetView() {
      orbit.targetYaw = 0
      orbit.targetPitch = 0.1
      markDirty()
    },
    dispose() {
      cancelAnimationFrame(frame)
      observer.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('pointermove', pointerMove)
      canvas.removeEventListener('pointerup', pointerUp)
      canvas.removeEventListener('pointercancel', pointerUp)
      canvas.removeEventListener('click', handleCanvasClick)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      disposables.forEach(item => item.dispose())
      disposeObject(scene)
      composer = null
      renderer.dispose()
      canvas.remove()
    },
  }
}
