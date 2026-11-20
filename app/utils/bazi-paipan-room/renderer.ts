import type * as THREE from 'three'
import type { BaziRoomPillar } from './model'
import type { BaziRoomSceneModel } from './model'
import { makeSoftCharacter, restSittingPose, type SoftCharacterRig } from './character'
import {
  makeBrush,
  makeBrushRack,
  makeCoin,
  makeDeskCup,
  makeDeskTeapot,
  makeInkstone,
  makePaperweight,
  makeSeal,
} from './desk-props'

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
  currentDayun: string
  reading: string
  chenyu: string
  readingWaiting: string
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
  onBackgroundClick?: () => void
  onKeeperAnchor?: (xPercent: number, yPercent: number) => void
  onReady?: (stats: BaziRoomRendererStats) => void
  onError?: (message: string) => void
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
  const { canvas, context } = canvas2d(128, 768)
  if (context) {
    context.fillStyle = title.includes('滴天') ? '#7b3528' : title.includes('穷通') ? '#5c4b2a' : title.includes('三命') ? '#2e5548' : '#6b3a30'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'rgba(28, 17, 9, 0.35)'
    context.fillRect(8, 18, canvas.width - 16, canvas.height - 36)
    context.fillStyle = '#ffeab5'
    context.font = '700 64px "Noto Serif SC", "Songti SC", serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    title.split('').forEach((character, index) => {
      context.fillText(character, canvas.width / 2, 116 + index * 124)
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
  renderer.toneMappingExposure = 1.3
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x05080f)
  scene.fog = new THREE.Fog(0x05080f, 12, 32)
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30)
  const raycaster = new THREE.Raycaster()
  const keeperAnchorVector = new THREE.Vector3()
  const cupWorldQuaternion = new THREE.Quaternion()
  const handWorldPosition = new THREE.Vector3()
  const cameraTarget = new THREE.Vector3(0.12, 1.44, -0.2)
  const orbit = { yaw: -0.42, pitch: 0.07, targetYaw: -0.42, targetPitch: 0.07, distance: 9.4, targetDistance: 8.7 }
  let reducedMotion = options.reducedMotion
  const key = new THREE.DirectionalLight(0xffe2ab, 2.05)
  key.position.set(2.8, 4.6, 3.1)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 1
  key.shadow.camera.far = 18
  key.shadow.camera.left = -8
  key.shadow.camera.right = 8
  key.shadow.camera.top = 6
  key.shadow.camera.bottom = -4
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.018
  const rim = new THREE.DirectionalLight(0x74a9ff, 0.72)
  rim.position.set(-3.2, 2.4, -2.4)
  const frontFill = new THREE.DirectionalLight(0xf5e7cd, 1.05)
  frontFill.position.set(2.2, 2.8, 7)
  scene.add(new THREE.AmbientLight(0xdcecff, 0.82), key, rim, frontFill)

  const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = []
  const room = new THREE.Group()
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(26, 0.2, 17),
    new THREE.MeshStandardMaterial({ color: 0x111820, roughness: 0.84, metalness: 0.06 }),
  )
  floor.position.y = -0.1
  const carpet = new THREE.Mesh(
    new THREE.BoxGeometry(10.4, 0.04, 7.2),
    new THREE.MeshStandardMaterial({ color: 0x5d2a31, roughness: 0.88 }),
  )
  carpet.position.set(0, 0.02, 0.35)
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(26, 7.4, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x141d29, roughness: 0.92 }),
  )
  backWall.position.set(0, 3, -4.3)
  const wallPanel = new THREE.Mesh(
    new THREE.BoxGeometry(11.4, 5.4, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x23160d, roughness: 0.72 }),
  )
  wallPanel.position.set(0, 2.5, -4.14)
  room.add(floor, carpet, backWall, wallPanel)
  floor.receiveShadow = true
  carpet.receiveShadow = true
  backWall.receiveShadow = true
  wallPanel.receiveShadow = true

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
  const SHELF_Y = [0.12, 0.88, 1.62, 2.14]
  const BOOK_HEIGHT = 0.6
  const BOOK_SHELF_Y = 0.88
  const shelfBack = new THREE.Mesh(new THREE.BoxGeometry(1.66, 2.2, 0.08), woodDark)
  shelfBack.position.set(0, 1.1, -0.55)
  bookshelf.add(shelfBack)
  const shelfSideLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 1.22), woodDark)
  shelfSideLeft.position.set(-0.82, 1.1, 0)
  const shelfSideRight = shelfSideLeft.clone()
  shelfSideRight.position.x = 0.82
  bookshelf.add(shelfSideLeft, shelfSideRight)
  SHELF_Y.forEach((y) => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.07, 1.14), woodMid)
    shelf.position.y = y
    bookshelf.add(shelf)
  })
  CLASSIC_BOOKS.forEach((title, index) => {
    const texture = new THREE.CanvasTexture(bookSpineTexture(title))
    texture.colorSpace = THREE.SRGBColorSpace
    disposables.push(texture)
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.095, BOOK_HEIGHT, 0.46),
      new THREE.MeshStandardMaterial({ color: 0x7b402e, roughness: 0.72 }),
    )
    const spine = new THREE.Mesh(new THREE.PlaneGeometry(0.092, 0.58), new THREE.MeshBasicMaterial({ map: texture }))
    spine.rotation.y = 0
    spine.position.z = 0.243
    book.add(spine)
    book.position.set(
      -0.56 + index * 0.19,
      BOOK_SHELF_Y + 0.035 + 0.012 + BOOK_HEIGHT / 2,
      -0.28 + (index % 2) * 0.08,
    )
    book.rotation.z = index === 3 ? -0.16 : 0
    bookshelf.add(book)
  })
  bookshelf.position.set(-5.8, 0, -3.55)
  bookshelf.scale.setScalar(1.55)
  bookshelf.rotation.y = 0.58

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
    new THREE.MeshStandardMaterial({ map: compassMap, roughness: 0.38, metalness: 0.08, emissive: 0x372813, emissiveIntensity: 0.34 }),
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
  compass.scale.setScalar(0.24)
  compass.position.set(0.42, 2.346, 0.22)
  compass.rotation.set(1.08, 0, 0)
  const compassSupport = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.055, 0.16), woodMid)
  compassSupport.position.set(0.42, 2.2025, 0.34)
  bookshelf.add(compass, compassSupport)

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

  const inkMaterial = new THREE.MeshStandardMaterial({ color: 0x12100f, roughness: 0.18 })
  const inkstone = makeInkstone(woodDark, inkMaterial)
  inkstone.position.set(0.04, 0.995, -0.44)
  inkstone.rotation.y = -0.08
  objects.add(inkstone)
  const paperStack = new THREE.Group()
  for (let index = 0; index < 3; index += 1) {
    const sheet = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.003, 0.29),
      new THREE.MeshStandardMaterial({ color: 0xe6dcc5, roughness: 0.82 }),
    )
    sheet.position.set(-0.73, 1.0 + index * 0.004, -0.31)
    sheet.rotation.y = -0.16 + index * 0.05
    paperStack.add(sheet)
  }
  const curledPaper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.43, 20, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xeee5cf, roughness: 0.84, side: THREE.DoubleSide }),
  )
  curledPaper.rotation.set(Math.PI / 2, 0, Math.PI / 2)
  curledPaper.position.set(-0.62, 1.05, -0.16)
  objects.add(paperStack, curledPaper)

  const glaze = new THREE.MeshPhysicalMaterial({ color: 0xe8ece8, roughness: 0.18, metalness: 0.03, clearcoat: 0.65, clearcoatRoughness: 0.12 })
  const lidGlaze = new THREE.MeshStandardMaterial({ color: 0x536872, roughness: 0.24, metalness: 0.06 })
  const teapot = makeDeskTeapot(THREE, glaze, lidGlaze)
  teapot.position.set(-1.47, 0.995, -0.31)
  objects.add(teapot)
  const pourStream = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.01, 1, 16),
    new THREE.MeshStandardMaterial({
      color: 0x8d4d20,
      emissive: 0x2f1607,
      transparent: true,
      opacity: 0,
      roughness: 0.16,
      depthWrite: false,
      depthTest: false,
    }),
  )
  pourStream.renderOrder = 12
  pourStream.position.set(-1.09, 1.085, -0.285)
  objects.add(pourStream)
  const teapotSpoutTip = teapot.getObjectByName('bazi-room-teapot-spout-tip')
  const cupTeaMaterial = new THREE.MeshStandardMaterial({ color: 0xa2662e, transparent: true, opacity: 0, roughness: 0.22 })
  const cupBuild = makeDeskCup(THREE, glaze, cupTeaMaterial)
  const visitorCup = cupBuild.cup
  const cupTea = cupBuild.tea
  const cupSteam = cupBuild.steam
  visitorCup.position.set(-1.11, 0.995, -0.29)
  const restingCupPosition = visitorCup.position.clone()
  objects.add(visitorCup)
  const keeperCupBuild = makeDeskCup(THREE, glaze, cupTeaMaterial.clone())
  keeperCupBuild.cup.scale.setScalar(0.94)
  keeperCupBuild.cup.position.set(-0.7, 0.998, 0.12)
  keeperCupBuild.cup.rotation.y = 0.5
  objects.add(keeperCupBuild.cup)

  const brushHandles = new THREE.MeshStandardMaterial({ color: 0x2d1d14, roughness: 0.48 })
  const ferrule = new THREE.MeshStandardMaterial({ color: 0xc8b891, roughness: 0.35, metalness: 0.35 })
  const bristles = new THREE.MeshStandardMaterial({ color: 0x5a3d27, roughness: 0.82 })
  const brushRack = makeBrushRack(woodDark, [
    makeBrush(brushHandles, ferrule, bristles),
    makeBrush(brushHandles, ferrule, bristles),
  ])
  brushRack.position.set(1.64, 0.995, -0.41)
  brushRack.rotation.y = -0.12
  objects.add(brushRack)
  const brushPotProfile = [
    new THREE.Vector2(0.001, 0), new THREE.Vector2(0.064, 0),
    new THREE.Vector2(0.075, 0.012), new THREE.Vector2(0.082, 0.084),
    new THREE.Vector2(0.072, 0.155), new THREE.Vector2(0.076, 0.168),
  ]
  const brushPot = new THREE.Mesh(new THREE.LatheGeometry(brushPotProfile, 30), ceramic)
  brushPot.position.set(2.03, 0.995, -0.43)
  objects.add(brushPot)
  ;[-0.18, 0, 0.17].forEach((rotation, index) => {
    const brush = makeBrush(brushHandles, ferrule, bristles)
    brush.position.set(2.03 + index * 0.015, 1.16, -0.43 + (index % 2) * 0.014)
    brush.rotation.set(rotation * 0.5, 0, rotation)
    objects.add(brush)
  })

  const coinMaterial = brass.clone()
  for (let index = 0; index < 5; index += 1) {
    const coin = makeCoin(coinMaterial)
    coin.position.set(-0.33 + (index % 3) * 0.055, 0.993 + Math.floor(index / 3) * 0.006, 0.07 + Math.floor(index / 3) * 0.05)
    coin.rotation.set(Math.PI / 2 + (index % 2) * 0.05, index * 0.45, index * 0.1)
    objects.add(coin)
  }
  const paperweight = makePaperweight(woodDark, new THREE.MeshStandardMaterial({ color: 0xb3372d, roughness: 0.42 }))
  paperweight.position.set(-1.73, 0.995, 0.07)
  paperweight.rotation.y = 0.08
  objects.add(paperweight)
  const sealMaterial = new THREE.MeshStandardMaterial({ color: 0x733323, roughness: 0.48 })
  const sealPaste = new THREE.MeshStandardMaterial({ color: 0xb63a30, roughness: 0.28 })
  const seal = makeSeal(sealMaterial, sealPaste)
  seal.position.set(1.89, 0.995, 0.03)
  seal.rotation.y = -0.22
  objects.add(seal)
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
  keeperChair.position.set(-1.18, 0, -0.86)
  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.06, 0.6), woodMid)
  chairSeat.position.y = 0.62
  const chairCushion = new THREE.Mesh(new THREE.SphereGeometry(0.315, 24, 18), new THREE.MeshStandardMaterial({ color: 0x663a2c, roughness: 0.85 }))
  chairCushion.scale.set(1, 0.2, 0.92)
  chairCushion.position.y = 0.65
  const chairBackPanel = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.66, 0.06), woodMid)
  chairBackPanel.position.set(0, 1.03, -0.28)
  chairBackPanel.rotation.x = -0.05
  const chairBackRail = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.58, 12), woodDark)
  chairBackRail.rotation.z = Math.PI / 2
  chairBackRail.position.set(0, 1.34, -0.28)
  keeperChair.add(chairSeat, chairCushion, chairBackPanel, chairBackRail)
  const keeperChairLegs: Array<[number, number]> = [
    [-0.28, -0.25], [0.28, -0.25], [-0.28, 0.25], [0.28, 0.25],
  ]
  keeperChairLegs.forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.62, 12), woodDark)
    leg.position.set(x, 0.31, z)
    keeperChair.add(leg)
  })
  const chairStretchers: Array<[number, number]> = [[0.24, 0], [-0.24, 0]]
  chairStretchers.forEach(([x]) => {
    const stretcher = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.56, 10), woodDark)
    stretcher.rotation.z = Math.PI / 2
    stretcher.position.set(x, 0.19, 0)
    keeperChair.add(stretcher)
  })

  const visitorStool = new THREE.Group()
  visitorStool.position.set(1.1, 0, 1.1)
  const stoolTop = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.06, 28), woodMid)
  stoolTop.position.y = 0.58
  const stoolCushion = new THREE.Mesh(new THREE.SphereGeometry(0.285, 24, 18), new THREE.MeshStandardMaterial({ color: 0x516073, roughness: 0.85 }))
  stoolCushion.scale.set(1, 0.2, 1)
  stoolCushion.position.y = 0.61
  visitorStool.add(stoolTop, stoolCushion)
  const visitorStoolLegs: Array<[number, number]> = [
    [-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22],
  ]
  visitorStoolLegs.forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.024, 0.58, 12), woodDark)
    leg.position.set(x, 0.29, z)
    visitorStool.add(leg)
  })

  const keeper = makeSoftCharacter(THREE, { kind: 'keeper', position: [-1.18, 0.03, -0.78], rotationY: 0.2 })
  const visitor = makeSoftCharacter(THREE, { kind: 'visitor', position: [1.1, 0.01, 1.08], rotationY: Math.PI - 0.22 })
  restSittingPose(keeper)
  restSittingPose(visitor)
  room.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = true
    mesh.receiveShadow = true
  })
  floor.castShadow = false
  backWall.castShadow = false
  projectionScreen.castShadow = false
  projectionFrame.castShadow = false
  room.add(
    roomSign, desk, bookshelf, objects,
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
  let currentFlowStage = options.initialModel.flowStage
  let stageStartedAt = performance.now()
  let lastProjectionDraw = Number.NEGATIVE_INFINITY
  let slideTransitionStartedAt = Number.NEGATIVE_INFINITY
  let slideTransitionUntil = Number.NEGATIVE_INFINITY

  function drawPillarCard(
    context: CanvasRenderingContext2D,
    x: number, y: number, width: number, height: number,
    label: string, value: string, highlighted: boolean, valueSize = 44,
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
    context.font = `700 ${valueSize}px "Noto Serif SC", "Songti SC", serif`
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

  const elementColors: Record<string, string> = {
    木: '#65a66d', 火: '#d1544a', 土: '#c08a48', 金: '#d9c47c', 水: '#5a8dc0',
  }

  function drawVisualPillars(
    context: CanvasRenderingContext2D,
    pillars: BaziRoomPillar[],
    x: number,
    y: number,
    width: number,
    height: number,
    progress = 1,
  ) {
    const visible = pillars.slice(0, 5)
    const cardWidth = Math.min(150, (width - (visible.length - 1) * 12) / Math.max(visible.length, 1))
    const totalWidth = visible.length * cardWidth + (visible.length - 1) * 12
    visible.forEach((pillar, index) => {
      drawPillarCard(
        context,
        x + (width - totalWidth) / 2 + index * (cardWidth + 12),
        y,
        cardWidth,
        height,
        pillar.label,
        `${pillar.gan}${pillar.zhi}`,
        pillar.highlighted,
        visible.length > 4 ? 28 : visible.length > 3 ? 33 : 42,
      )
    })
  }

  function drawHorizontalBars(
    context: CanvasRenderingContext2D,
    items: Array<{ label: string, percent: number }>,
    x: number,
    y: number,
    width: number,
    progress = 1,
  ) {
    context.textAlign = 'left'
    context.textBaseline = 'middle'
    items.slice(0, 5).forEach((item, index) => {
      const rowY = y + index * 35
      context.fillStyle = 'rgba(226,237,249,.76)'
      context.font = '600 19px "Noto Sans SC", "PingFang SC", sans-serif'
      context.fillText(item.label, x, rowY + 9)
      const trackX = x + 44
      const trackWidth = width - 88
      context.fillStyle = 'rgba(233,238,250,.1)'
      context.beginPath()
      context.roundRect(trackX, rowY, trackWidth, 18, 9)
      context.fill()
      const fillWidth = trackWidth * Math.min(1, Math.max(0.02, item.percent / 100)) * progress
      context.fillStyle = elementColors[item.label] ?? '#d9b45d'
      context.beginPath()
      context.roundRect(trackX, rowY, fillWidth, 18, 9)
      context.fill()
      context.fillStyle = 'rgba(242,247,255,.88)'
      context.font = '700 15px "Noto Sans SC", "PingFang SC", sans-serif'
      context.textAlign = 'right'
      context.fillText(`${item.percent}%`, x + width, rowY + 9)
      context.textAlign = 'left'
    })
  }

  function drawLensCards(
    context: CanvasRenderingContext2D,
    fields: Array<{ label: string, value: string, evidence?: string }>,
    x: number,
    y: number,
    width: number,
    height: number,
    progress = 1,
  ) {
    const visible = fields.slice(0, 3)
    if (!visible.length) return
    const gap = 15
    const cardWidth = (width - gap * (visible.length - 1)) / visible.length
    visible.forEach((field, index) => {
      const cardX = x + index * (cardWidth + gap)
      const reveal = Math.min(1, Math.max(0, progress * 1.7 - index * 0.2))
      context.save()
      context.globalAlpha = reveal
      context.translate(0, (1 - reveal) * 12)
      context.fillStyle = 'rgba(9,21,34,.94)'
      context.strokeStyle = 'rgba(212,175,109,.34)'
      context.lineWidth = 2
      context.beginPath()
      context.roundRect(cardX, y, cardWidth, height, 10)
      context.fill()
      context.stroke()
      context.textAlign = 'center'
      context.fillStyle = 'rgba(242,217,152,.9)'
      context.font = '700 20px "Noto Sans SC", "PingFang SC", sans-serif'
      context.fillText(field.label, cardX + cardWidth / 2, y + 28)
      context.fillStyle = '#f4f7ff'
      context.font = '800 31px "Noto Serif SC", "Songti SC", serif'
      drawWrappedText(context, field.value.slice(0, 18), cardX + cardWidth / 2, y + 68, cardWidth - 30, 3, 34)
      if (field.evidence) {
        context.fillStyle = 'rgba(226,237,249,.52)'
        context.font = '400 14px "Noto Sans SC", "PingFang SC", sans-serif'
        drawWrappedText(context, field.evidence, cardX + cardWidth / 2, y + height - 58, cardWidth - 28, 3, 19)
      }
      context.restore()
    })
  }

  function drawTodayVisual(context: CanvasRenderingContext2D, model: BaziRoomSceneModel, progress: number) {
    const today = model.topicLens?.today
    const centerX = 340
    const centerY = 212
    const radius = 95
    context.save()
    context.strokeStyle = 'rgba(212,175,109,.34)'
    context.lineWidth = 7
    context.beginPath()
    context.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, progress))
    context.stroke()
    context.fillStyle = 'rgba(9,21,34,.94)'
    context.beginPath()
    context.arc(centerX, centerY, radius - 15, 0, Math.PI * 2)
    context.fill()
    context.textAlign = 'center'
    context.fillStyle = 'rgba(226,237,249,.58)'
    context.font = '500 17px "Noto Sans SC", "PingFang SC", sans-serif'
    context.fillText(today?.date || options.labels.today, centerX, centerY - 30)
    context.fillStyle = '#f4f7ff'
    context.font = '800 44px "Noto Serif SC", "Songti SC", serif'
    context.fillText(today?.ganzhi || options.labels.currentBazi, centerX, centerY + 5)
    context.fillStyle = '#f2d998'
    context.font = '700 18px "Noto Sans SC", "PingFang SC", sans-serif'
    context.fillText(today?.tenGod || '', centerX, centerY + 42)

    context.textAlign = 'left'
    context.fillStyle = 'rgba(226,237,249,.82)'
    context.font = '700 20px "Noto Sans SC", "PingFang SC", sans-serif'
    context.fillText(options.labels.today, 502, 134)
    drawLensCards(context, (model.topicLens?.todayFields ?? []).slice(0, 2), 492, 156, 340, 168, progress)
    const tags = [
      ...(today?.relations ?? []).map(item => item.value),
      ...(model.topicLens?.todayFields ?? []).slice(2).map(item => item.value),
      ...(model.topicLens?.nobleHints ?? []),
    ].filter(Boolean).slice(0, 5)
    context.fillStyle = 'rgba(233,238,250,.62)'
    context.font = '500 15px "Noto Sans SC", "PingFang SC", sans-serif'
    if (!tags.length) {
      drawWrappedText(context, model.slideDetail, 502, 358, 330, 3, 21)
    }
    else {
      tags.forEach((tag, index) => {
        const width = Math.min(150, 34 + tag.length * 13)
        if (context.measureText(tag).width > width - 20) return
        const row = Math.floor(index / 2)
        const column = index % 2
        const x = 492 + column * 172
        const y = 350 + row * 39
        context.fillStyle = 'rgba(45,32,14,.62)'
        context.strokeStyle = 'rgba(212,175,109,.3)'
        context.lineWidth = 1.5
        context.beginPath()
        context.roundRect(x, y, width, 30, 7)
        context.fill()
        context.stroke()
        context.fillStyle = 'rgba(242,217,152,.88)'
        context.textAlign = 'center'
        context.fillText(tag.slice(0, 9), x + width / 2, y + 15)
        context.textAlign = 'left'
      })
    }
    context.restore()
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
      context.textAlign = 'left'
      context.fillText(`${currentModel.slideIndex + 1} / ${currentModel.slideCount}`, 72, 452)
      context.textAlign = 'center'
      const progressWidth = (width - 144) * ((currentModel.slideIndex + 1) / currentModel.slideCount)
      context.fillStyle = 'rgba(233, 238, 250, 0.12)'
      context.fillRect(72, 470, width - 144, 3)
      context.fillStyle = '#d9b45d'
      context.fillRect(72, 470, progressWidth, 3)
      context.fillStyle = '#f2d998'
    }

    if (isResult) {
      const reveal = Math.min(1, Math.max(0, (performance.now() - slideTransitionStartedAt) / 420))
      context.save()
      context.globalAlpha = 0.22 + reveal * 0.78
      context.translate((1 - reveal) * 52, (1 - reveal) * 5)
      if (currentModel.slideId === 'full-chart') {
        drawVisualPillars(context, currentModel.pillars, 260, 148, width - 520, 168, reveal)
      }
      else if (currentModel.slideId === 'natal') {
        drawVisualPillars(context, currentModel.pillars.filter(pillar => pillar.key !== 'today'), 250, 128, 348, 158, reveal)
        const currentDayun = currentModel.chart?.dayuns.find(dayun => dayun.isCurrent) ?? currentModel.chart?.dayuns[0]
        context.textAlign = 'left'
        context.fillStyle = 'rgba(226,237,249,.56)'
        context.font = '500 16px "Noto Sans SC", "PingFang SC", sans-serif'
        context.fillText(options.labels.currentDayun, 252, 334)
        context.fillStyle = '#f2d998'
        context.font = '800 27px "Noto Serif SC", "Songti SC", serif'
        context.fillText(currentDayun ? `${currentDayun.ganzhi} · ${currentDayun.startAge}-${currentDayun.endAge}` : currentModel.slideDetail, 336, 334)
        context.fillStyle = 'rgba(226,237,249,.72)'
        context.font = '600 18px "Noto Sans SC", "PingFang SC", sans-serif'
        context.fillText('五行', 686, 132)
        drawHorizontalBars(
          context,
          (currentModel.chart?.energy.wuxing ?? []).map(item => ({ label: item.label, percent: item.percent })),
          676, 156, 276, reveal,
        )
      }
      else if (currentModel.slideId === 'topic-current') {
        drawTodayVisual(context, currentModel, reveal)
      }
      else if (currentModel.slideId === 'reading') {
        const sealText = currentModel.slideDetail.split('。')[0] || options.labels.reading
        const readingBody = currentModel.slideDetail.slice(sealText.length + 1) || currentModel.slideDetail
        context.fillStyle = 'rgba(9,21,34,.94)'
        context.strokeStyle = 'rgba(212,175,109,.42)'
        context.lineWidth = 3
        context.beginPath()
        context.roundRect(72, 126, 288, 264, 12)
        context.fill()
        context.stroke()
        context.strokeStyle = 'rgba(212,175,109,.16)'
        context.lineWidth = 2
        context.beginPath()
        context.moveTo(412, 146)
        context.lineTo(412, 370)
        context.stroke()
        context.textAlign = 'center'
        context.fillStyle = 'rgba(242,217,152,.78)'
        context.font = '600 18px "Noto Sans SC", "PingFang SC", sans-serif'
        context.fillText(options.labels.chenyu, 216, 160)
        context.fillStyle = '#f4f7ff'
        context.font = '800 40px "Noto Serif SC", "Songti SC", serif'
        drawWrappedText(context, sealText, 216, 236, 232, 3, 48)
        context.textAlign = 'left'
        context.fillStyle = 'rgba(226,237,249,.56)'
        context.font = '600 17px "Noto Sans SC", "PingFang SC", sans-serif'
        context.fillText(`${options.labels.today} · 解读`, 452, 134)
        context.fillStyle = 'rgba(238,244,252,.9)'
        context.font = '400 21px "Noto Sans SC", "PingFang SC", sans-serif'
        drawWrappedText(context, readingBody || options.labels.readingWaiting, 452, 172, 500, 8, 34)
        if (currentModel.flowStage === 'slideshow' && reveal < 1) {
          context.fillStyle = 'rgba(217,180,93,.72)'
          context.fillRect(452, 418, Math.min(500, reveal * 500), 2)
        }
      }
      else {
        drawLensCards(
          context,
          currentModel.topicLens?.natal ?? [],
          220,
          128,
          width - 440,
          230,
          reveal,
        )
      }
      context.restore()
    }
    else {
      const bootCards: BaziRoomPillar[] = currentModel.currentPillars.length
        ? currentModel.currentPillars
        : ([
            { label: options.labels.flowYear, gan: '—', zhi: '—', highlighted: false },
            { label: options.labels.flowMonth, gan: '—', zhi: '—', highlighted: false },
            { label: options.labels.flowDay, gan: '—', zhi: '—', highlighted: false },
            { label: options.labels.flowHour, gan: '—', zhi: '—', highlighted: false },
          ] as BaziRoomPillar[])
      const cards = isResult && currentModel.slideId === 'natal'
        ? currentModel.pillars.filter(pillar => pillar.key !== 'today')
        : bootCards
      const visibleCards = cards.slice(0, 5)
      drawVisualPillars(context, visibleCards, 224, 138, width - 448, 194)
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
      context.globalAlpha = 0.12
      context.fillStyle = '#9adfff'
      context.fillRect(48, (isResult ? 488 : 400) + sweep * (isResult ? 12 : 68), width - 96, 2)
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
    camera.fov = camera.aspect < 0.8 ? 54 : 34
    cameraTarget.x = camera.aspect < 0.8 ? 0.72 : 0.16
    cameraTarget.y = camera.aspect < 0.8 ? 1.55 : 1.42
    const portraitProjection = camera.aspect < 0.8
    projectionFrame.scale.set(portraitProjection ? 1.08 : 1, portraitProjection ? 1.28 : 1, 1)
    projectionScreen.scale.copy(projectionFrame.scale)
    projector.scale.setScalar(portraitProjection ? 0.72 : 1)
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
  const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 }
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
      orbit.targetPitch = THREE.MathUtils.clamp(orbit.targetPitch + deltaY * 0.0025, 0.025, 0.2)
      dirty = true
    }
    else {
      const rect = canvas.getBoundingClientRect()
      parallax.targetX = (((event.clientX - rect.left) / rect.width) - 0.5) * 0.5
      parallax.targetY = (0.5 - ((event.clientY - rect.top) / rect.height)) * 0.26
      canvas.style.cursor = pickRoomRole(event.clientX, event.clientY) ? 'pointer' : 'grab'
    }
  }
  function pointerLeave() {
    parallax.targetX = 0
    parallax.targetY = 0
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
    else options.onBackgroundClick?.()
  }
  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointermove', pointerMove)
  canvas.addEventListener('pointerup', pointerUp)
  canvas.addEventListener('pointercancel', pointerUp)
  canvas.addEventListener('pointerleave', pointerLeave)
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
    parallax.x += (parallax.targetX - parallax.x) * 0.045
    parallax.y += (parallax.targetY - parallax.y) * 0.045
    const lookX = cameraTarget.x + parallax.x
    const lookY = cameraTarget.y + parallax.y
    const x = lookX + orbit.distance * Math.sin(orbit.yaw) * Math.cos(orbit.pitch) + parallax.x * 0.45
    const y = lookY + orbit.distance * Math.sin(orbit.pitch) + parallax.y * 0.25
    const z = cameraTarget.z + orbit.distance * Math.cos(orbit.yaw) * Math.cos(orbit.pitch)
    camera.position.set(x, y, z)
    camera.lookAt(lookX, lookY, cameraTarget.z)
  }
  function updateKeeper(elapsed: number, stageSeconds: number) {
    const gesture = currentModel.keeperGesture
    const serving = (currentModel.flowStage === 'start' || currentModel.flowStage === 'question') && stageSeconds < 4
    const npcDrinkCycle = currentModel.flowStage === 'slideshow' ? (stageSeconds % 12) : Number.POSITIVE_INFINITY
    const npcDrinking = npcDrinkCycle > 7.2 && npcDrinkCycle < 10.6
    const breathing = Math.sin(elapsed * 0.72)
    keeper.root.rotation.y = 0.2 + Math.sin(elapsed * 0.42) * 0.022
    keeper.hips.rotation.set(breathing * 0.008, 0, 0)
    keeper.spine.rotation.set(0.11 + breathing * 0.012, 0, Math.sin(elapsed * 0.31) * 0.012)
    keeper.chest.rotation.set(0.035 + breathing * 0.01, 0, Math.sin(elapsed * 0.37) * 0.01)
    keeper.head.rotation.x = gesture === 'calculating' ? 0.22 : -0.03 + Math.sin(elapsed * 0.65) * 0.018
    keeper.head.rotation.y = gesture === 'present' ? -0.1 : Math.sin(elapsed * 0.29) * 0.045

    if (serving) {
      const reach = THREE.MathUtils.smoothstep(stageSeconds, 0.25, 1)
      const pour = THREE.MathUtils.smoothstep(stageSeconds, 1.15, 1.75) * (1 - THREE.MathUtils.smoothstep(stageSeconds, 3.15, 3.65))
      const returnToRest = THREE.MathUtils.smoothstep(stageSeconds, 3.65, 4.3)
      const forwardReach = reach - returnToRest
      keeper.rightArm.shoulder.rotation.set(
        0.02 - forwardReach * 0.82,
        0,
        -0.1 + forwardReach * 0.04,
      )
      keeper.rightArm.elbow.rotation.set(-0.02 + forwardReach * -0.08 - pour * 0.08, 0, -0.02)
      keeper.rightArm.wrist.rotation.set(-0.08 - pour * 0.3, 0, -0.02)
      keeper.leftArm.shoulder.rotation.set(-0.42 + breathing * 0.02, 0, 0.08 + pour * 0.04)
      keeper.leftArm.elbow.rotation.set(-0.34, 0, 0.04)
      keeper.leftArm.wrist.rotation.set(-0.12, 0, 0)
    }
    else if (gesture === 'invite') {
      const wave = Math.sin(elapsed * 2.5) * 0.11
      keeper.rightArm.shoulder.rotation.set(0.26, 0, 1.7 + wave)
      keeper.rightArm.elbow.rotation.set(-0.1, 0, -1.45)
      keeper.rightArm.wrist.rotation.set(-0.24 + wave * 0.7, 0, -0.08)
      keeper.leftArm.shoulder.rotation.set(-0.42 + breathing * 0.02, 0, 0.08)
      keeper.leftArm.elbow.rotation.set(-0.34, 0, 0.04)
      keeper.leftArm.wrist.rotation.set(-0.12, 0, 0)
    }
    else if (npcDrinking) {
      const lift = THREE.MathUtils.smoothstep(npcDrinkCycle, 7.2, 7.9) * (1 - THREE.MathUtils.smoothstep(npcDrinkCycle, 10.1, 10.6))
      keeper.leftArm.shoulder.rotation.set(-0.52 - lift * 1.0, 0, 0.1 + lift * 0.09)
      keeper.leftArm.elbow.rotation.set(-0.28 - lift * 0.16, 0, 0.03)
      keeper.leftArm.wrist.rotation.set(-0.06 - lift * 0.24, 0, 0)
      keeper.rightArm.shoulder.rotation.set(-0.38 - lift * 0.04, 0, -0.08)
      keeper.rightArm.elbow.rotation.set(-0.32, 0, -0.03)
      keeper.rightArm.wrist.rotation.set(-0.12, 0, 0)
      keeper.neck.rotation.set(-0.02 - lift * 0.09, 0, 0)
    }
    else if (gesture === 'calculating') {
      const motion = Math.sin(elapsed * 3.2)
      keeper.rightArm.shoulder.rotation.set(-0.46, 0, -0.06 + motion * 0.035)
      keeper.rightArm.elbow.rotation.set(-0.28 + motion * 0.04, 0, -0.06)
      keeper.rightArm.wrist.rotation.set(-0.34, 0, 0)
      keeper.leftArm.shoulder.rotation.set(-0.44 + motion * 0.02, 0, 0.1)
      keeper.leftArm.elbow.rotation.set(-0.32, 0, 0.04)
      keeper.leftArm.wrist.rotation.set(-0.24, 0, 0)
    }
    else {
      const wave = Math.sin(elapsed * 2.2) * 0.07
      const presenting = gesture === 'present'
      keeper.rightArm.shoulder.rotation.set(presenting ? -0.4 : -0.44, 0, presenting ? 1.28 + wave : -0.1 + Math.sin(elapsed * 0.7) * 0.03)
      keeper.rightArm.elbow.rotation.set(presenting ? -0.22 : -0.34, 0, presenting ? 0.05 : -0.08)
      keeper.rightArm.wrist.rotation.set(presenting ? -0.2 : -0.12, 0, presenting ? 0.08 : 0)
      keeper.leftArm.shoulder.rotation.set(-0.42 + breathing * 0.02, 0, presenting ? 0.16 : 0.08)
      keeper.leftArm.elbow.rotation.set(presenting ? -0.28 : -0.34, 0, 0.04)
      keeper.leftArm.wrist.rotation.set(presenting ? -0.18 : -0.12, 0, 0)
    }
  }
  function updateVisitor(elapsed: number, stageSeconds: number) {
    const watching = currentModel.flowStage === 'calculating' || currentModel.flowStage === 'slideshow'
    const greeting = currentModel.flowStage === 'boot' && stageSeconds < 3.2
    const reaching = (currentModel.flowStage === 'start' || currentModel.flowStage === 'question') && stageSeconds > 4
    const drinkCycle = currentModel.flowStage === 'slideshow' ? (stageSeconds % 9) : Number.POSITIVE_INFINITY
    const drinking = drinkCycle > 3.5 && drinkCycle < 6.6
    const npcDrinkCycle = currentModel.flowStage === 'slideshow' ? (stageSeconds % 12) : Number.POSITIVE_INFINITY
    const npcDrinking = npcDrinkCycle > 7.2 && npcDrinkCycle < 10.6
    const breathing = Math.sin(elapsed * 0.68)
    visitor.root.rotation.y = Math.PI - (watching ? 0.52 : 0.2)
    visitor.hips.rotation.set(breathing * 0.006, 0, 0)
    visitor.spine.rotation.set((watching ? 0.16 : 0.11) + breathing * 0.012, 0, Math.sin(elapsed * 0.33) * 0.01)
    visitor.chest.rotation.set((watching ? 0.06 : 0.035) + breathing * 0.01, 0, 0)

    if (greeting) {
      const wave = Math.sin(elapsed * 2.6) * 0.12
      visitor.rightArm.shoulder.rotation.set(-0.2, 0, -1.68 + wave)
      visitor.rightArm.elbow.rotation.set(-0.12, 0, 1.42)
      visitor.rightArm.wrist.rotation.set(-0.2 + wave * 0.7, 0, 0.08)
      visitor.leftArm.shoulder.rotation.set(-0.42, 0, 0.09)
      visitor.leftArm.elbow.rotation.set(-0.34, 0, 0.03)
      visitor.leftArm.wrist.rotation.set(-0.12, 0, 0)
      visitor.neck.rotation.set(-0.04 + Math.sin(elapsed * 1.3) * 0.02, Math.sin(elapsed * 0.7) * 0.06, 0)
    }
    else if (reaching) {
      const reach = THREE.MathUtils.smoothstep(stageSeconds - 4, 0.25, 1.15)
      visitor.rightArm.shoulder.rotation.set(-0.3 - reach * 0.28, 0, -0.08 - reach * 0.02)
      visitor.rightArm.elbow.rotation.set(-0.16 - reach * 0.16, 0, -0.02)
      visitor.rightArm.wrist.rotation.set(-0.08 - reach * 0.2, 0, 0)
      visitor.spine.rotation.set(0.11 - reach * 0.05, reach * 0.08, 0)
      visitor.neck.rotation.set(-0.05 - reach * 0.05, reach * 0.08, 0)
      visitor.leftArm.shoulder.rotation.set(-0.42, 0, 0.09)
      visitor.leftArm.elbow.rotation.set(-0.34, 0, 0.03)
      visitor.leftArm.wrist.rotation.set(-0.12, 0, 0)
    }
    else if (drinking) {
      const lift = THREE.MathUtils.smoothstep(drinkCycle, 3.5, 4.15) * (1 - THREE.MathUtils.smoothstep(drinkCycle, 6.1, 6.6))
      visitor.rightArm.shoulder.rotation.set(-0.62 - lift * 0.76, 0, -0.08 - lift * 0.08)
      visitor.rightArm.elbow.rotation.set(-0.34 - lift * 0.1, 0, -0.03)
      visitor.rightArm.wrist.rotation.set(-0.06 - lift * 0.24, 0, 0)
      visitor.spine.rotation.set(0.16 + lift * 0.035, 0, 0)
      visitor.neck.rotation.set(-0.04 - lift * 0.08, 0, 0)
      visitor.leftArm.shoulder.rotation.set(-0.4, 0, 0.09)
      visitor.leftArm.elbow.rotation.set(-0.3, 0, 0.03)
      visitor.leftArm.wrist.rotation.set(-0.14, 0, 0)
    }
    else {
      const gazeCycle = Math.sin(elapsed * 0.28)
      const focus = watching ? 1 : 0.35
      visitor.rightArm.shoulder.rotation.set((watching ? -0.4 : -0.38) + breathing * 0.015, 0, -0.08 + breathing * 0.015)
      visitor.rightArm.elbow.rotation.set(watching ? -0.34 : -0.32, 0, -0.03)
      visitor.rightArm.wrist.rotation.set(-0.18, 0, 0)
      visitor.leftArm.shoulder.rotation.set((watching ? -0.44 : -0.42) + breathing * 0.015, 0, 0.09 + breathing * 0.015)
      visitor.leftArm.elbow.rotation.set(watching ? -0.36 : -0.34, 0, 0.03)
      visitor.leftArm.wrist.rotation.set(-0.16, 0, 0)
      visitor.neck.rotation.set(
        watching ? -0.16 + Math.sin(elapsed * 0.42) * 0.015 : -0.04 + Math.sin(elapsed * 0.5) * 0.02,
        gazeCycle * (watching ? 0.22 : 0.1) + focus * 0.04,
        gazeCycle * (watching ? 0.035 : 0.015),
      )
    }
  }
  function updateTea(elapsed: number, stageSeconds: number) {
    const drinkCycle = currentModel.flowStage === 'slideshow' ? (stageSeconds % 9) : Number.POSITIVE_INFINITY
    const drinking = drinkCycle > 3.5 && drinkCycle < 6.6
    const npcDrinkCycle = currentModel.flowStage === 'slideshow' ? (stageSeconds % 12) : Number.POSITIVE_INFINITY
    const npcDrinking = npcDrinkCycle > 7.2 && npcDrinkCycle < 10.6
    const serving = currentModel.flowStage === 'start' || currentModel.flowStage === 'question'
    const filled = currentModel.flowStage === 'birth' || currentModel.flowStage === 'calculating' || currentModel.flowStage === 'slideshow'
    const pour = serving && stageSeconds > 1.15 && stageSeconds < 3.65
      ? Math.sin((THREE.MathUtils.clamp(stageSeconds - 1.15, 0, 2.5) / 2.5) * Math.PI)
      : 0

    if (serving && stageSeconds > 0.55 && stageSeconds < 4.15) {
      if (teapot.parent !== keeper.rightArm.hand) {
        objects.remove(teapot)
        keeper.rightArm.hand.add(teapot)
      }
      teapot.position.set(-0.01, 0.036, 0.132)
    }
    else if (teapot.parent !== objects) {
      keeper.rightArm.hand.remove(teapot)
      objects.add(teapot)
      teapot.position.set(-1.47, 0.995, -0.31)
    }
    teapot.rotation.set(pour * 0.58, -0.86, -pour * 0.22)
    if (teapotSpoutTip) {
      teapotSpoutTip.updateWorldMatrix(true, false)
      teapotSpoutTip.getWorldPosition(handWorldPosition)
      const cupMouth = restingCupPosition.clone().setY(restingCupPosition.y + 0.045)
      const streamDirection = cupMouth.clone().sub(handWorldPosition)
      const streamLength = Math.max(0.02, streamDirection.length())
      pourStream.position.copy(handWorldPosition).add(cupMouth).multiplyScalar(0.5)
      pourStream.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        streamDirection.normalize(),
      )
      pourStream.scale.set(1, Math.max(0.18, streamLength), 1)
    }
    else {
      pourStream.position.set(-1.09, 1.075 + pour * 0.035, -0.285)
      pourStream.scale.set(1, Math.max(0.05, pour), 1)
    }
    ;(pourStream.material as THREE.MeshStandardMaterial).opacity = pour > 0.06 ? 0.58 + pour * 0.22 : 0
    cupTeaMaterial.opacity = filled || (serving && stageSeconds > 1.8) ? 0.86 : Math.max(0, pour * 0.14)
    const teaScale = filled || (serving && stageSeconds > 1.8) ? 1 : Math.max(0.02, pour * 0.28)
    cupTea.scale.y = teaScale
    cupSteam.material.opacity = filled ? 0.12 + Math.sin(elapsed * 1.7) * 0.045 : 0
    cupSteam.rotation.y = elapsed * 0.7

    const holdCup = filled
      || ((currentModel.flowStage === 'start' || currentModel.flowStage === 'question') && stageSeconds > 4.25)
    if (holdCup) {
      if (visitorCup.parent !== visitor.rightArm.hand) {
        objects.remove(visitorCup)
        visitor.rightArm.hand.add(visitorCup)
      }
      visitorCup.position.set(drinking ? 0.185 : 0.098, -0.026, drinking ? 0.066 : 0.094)
      visitorCup.rotation.set(0, 0, 0)
    }
    else if (visitorCup.parent !== objects) {
      visitor.rightArm.hand.remove(visitorCup)
      objects.add(visitorCup)
      visitorCup.position.copy(restingCupPosition)
      visitorCup.rotation.set(0, 0, 0)
    }
    if (holdCup && drinking) {
      visitor.rightArm.hand.getWorldQuaternion(cupWorldQuaternion)
      visitorCup.quaternion.copy(cupWorldQuaternion).invert()
    }
    if (npcDrinking) {
      if (keeperCupBuild.cup.parent !== keeper.leftArm.hand) {
        objects.remove(keeperCupBuild.cup)
        keeper.leftArm.hand.add(keeperCupBuild.cup)
      }
      keeperCupBuild.cup.position.set(-0.088, -0.028, 0.074)
      keeperCupBuild.cup.rotation.set(0, 0, 0)
    }
    else if (keeperCupBuild.cup.parent !== objects) {
      keeper.leftArm.hand.remove(keeperCupBuild.cup)
      objects.add(keeperCupBuild.cup)
      keeperCupBuild.cup.position.set(-0.7, 0.998, 0.12)
      keeperCupBuild.cup.rotation.set(0, 0.5, 0)
    }
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
    if (now - lastProjectionDraw >= 100 || now < slideTransitionUntil) {
      lastProjectionDraw = now
      drawProjection(elapsed)
    }
    compass.rotation.z += currentModel.compassSpeed * 0.00055
    redLine.rotation.y = 0.22 + Math.sin(elapsed * 0.25) * 0.08
    const stageSeconds = Math.max(0, (performance.now() - stageStartedAt) / 1000)
    updateKeeper(elapsed, stageSeconds)
    updateVisitor(elapsed, stageSeconds)
    updateTea(elapsed, stageSeconds)
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
      if (model.flowStage !== currentFlowStage) {
        currentFlowStage = model.flowStage
        stageStartedAt = performance.now()
      }
      drawProjection(0)
      const instant = quality === 'low' || reducedMotion
      slideTransitionStartedAt = instant ? performance.now() - 1000 : performance.now()
      slideTransitionUntil = instant ? Number.NEGATIVE_INFINITY : performance.now() + 460
      orbit.targetDistance = model.flowStage === 'boot'
        ? 8.7
        : model.flowStage === 'calculating'
          ? 7.8
          : model.flowStage === 'slideshow'
            ? 8.0
            : 8.2
      if (camera.aspect < 0.8) orbit.targetDistance += 2.35
      dirty = true
      if (quality === 'low' || reducedMotion) {
        updateKeeper(0, 0)
        updateVisitor(0, 0)
        updateTea(0, 0)
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
        updateKeeper(0, 0)
        updateVisitor(0, 0)
        updateTea(0, 0)
        dirty = true
        renderCurrent()
      }
      else if (quality !== 'low') frame = requestAnimationFrame(tick)
    },
    resetView() {
      orbit.targetYaw = -0.42
      orbit.targetPitch = 0.07
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
      canvas.removeEventListener('pointerleave', pointerLeave)
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
