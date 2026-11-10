<template>
  <div
    ref="container"
    class="sansa-scene"
    data-testid="sansatemple-scene"
    :data-quality="activeQuality"
    tabindex="0"
    aria-label="3D temple"
  />
</template>

<script setup lang="ts">
import * as THREE from 'three'
import type { SansaAction, SansaCushionState, SansaIncenseState, SansaPeerState } from '~~/server/utils/sansatemple/types'

export type SansaQuality = 'high' | 'medium' | 'low'

const props = defineProps<{
  peers: Record<string, SansaPeerState>
  selfId: string
  cushions: SansaCushionState[]
  incense: SansaIncenseState[]
  quality: SansaQuality | 'auto'
  reducedMotion: boolean
}>()

const emit = defineEmits<{
  ready: []
  failed: []
  moved: [state: { x: number; z: number; rotation: number; action: SansaAction }]
  arrivedAtCushion: []
  reverence: []
  beads: []
  pray: []
  info: [payload: { quality: SansaQuality; calls: number; triangles: number; textures: number }]
}>()

const container = ref<HTMLDivElement>()
const activeQuality = ref<SansaQuality>('high')

type AvatarParts = {
  group: import('three').Group
  body: import('three').Mesh
  head: import('three').Mesh
  armLeft: import('three').Mesh
  armRight: import('three').Mesh
  label: import('three').Sprite
}

let renderer: import('three').WebGLRenderer | null = null
let scene: import('three').Scene | null = null
let camera: import('three').PerspectiveCamera | null = null
let ground: import('three').Mesh | null = null
let raycaster: import('three').Raycaster | null = null
let disposed = false
let frameId = 0
let clock: import('three').Clock | null = null
let resizeObserver: ResizeObserver | null = null

let avatar: AvatarParts | null = null
let selfId = ''
let selfState = { x: 0, z: 25, rotation: Math.PI, action: 'walking' as SansaAction, targetX: 0, targetZ: 25 }
let cushionTargets: SansaCushionState[] = []
let seekingCushion = false
let incenseMeshes = new Map<string, import('three').Group>()
let remoteAvatars = new Map<string, AvatarParts>()
let staticDecor: import('three').Object3D[] = []
let lampLights: import('three').PointLight[] = []

let yaw = Math.PI
let pitch = 0.16
let distance = 7.4
let dragging = false
let dragMoved = 0
let lastPointer = { x: 0, y: 0 }
let pinchDistance = 0
const keys = new Set<string>()

defineExpose({
  beginPray,
  cancelPray,
  meditate,
  stopMeditate,
  setAction,
  teleportTo,
  isInHall,
  isNearAltar,
  rendererInfo,
})

onMounted(() => {
  if (!container.value || !window.WebGLRenderingContext || !hasWebGL()) {
    emit('failed')
    return
  }

  const width = container.value.clientWidth || 640
  const height = container.value.clientHeight || 480
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x7cb5ec)
  scene.fog = new THREE.Fog(0xa8cdec, 22, 68)

  camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100)
  raycaster = new THREE.Raycaster()
  clock = new THREE.Clock()
  renderer = new THREE.WebGLRenderer({ antialias: activeQuality.value !== 'low', powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.02
  renderer.setSize(width, height)
  renderer.domElement.classList.add('sansa-canvas')
  container.value.appendChild(renderer.domElement)

  activeQuality.value = props.quality === 'auto' ? autoQuality() : props.quality
  applyQuality()
  buildWorld()
  buildMapLandmarks()
  avatar = createAvatar('你')
  scene.add(avatar.group)
  bindEvents()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container.value)
  animate()
  emit('ready')
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  renderer?.domElement.remove()
  scene?.traverse((object) => {
    const mesh = object as import('three').Mesh
    mesh.geometry?.dispose?.()
    const material = mesh.material
    if (Array.isArray(material)) material.forEach(item => item.dispose())
    else material?.dispose?.()
    const sprite = object as import('three').Sprite
    sprite.material?.map?.dispose()
    sprite.material?.dispose()
  })
  renderer?.dispose()
  renderer = null
  scene = null
  camera = null
})

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function autoQuality(): SansaQuality {
  const width = window.innerWidth
  return width < 700 || navigator.hardwareConcurrency <= 4 ? 'low' : width < 1200 ? 'medium' : 'high'
}

function applyQuality() {
  if (!renderer || !scene) return
  const pixelRatio = activeQuality.value === 'high' ? Math.min(devicePixelRatio, 2) : activeQuality.value === 'medium' ? Math.min(devicePixelRatio, 1.25) : 1
  renderer.setPixelRatio(pixelRatio)
  renderer.shadowMap.enabled = activeQuality.value === 'high'
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  lampLights.forEach((light) => {
    light.visible = activeQuality.value !== 'low'
    light.castShadow = false
  })
  staticDecor.forEach((object) => {
    const detail = object.userData.qualityDetail as 'high' | 'medium' | undefined
    if (!detail) return
    object.visible = detail === 'high' ? activeQuality.value === 'high' : activeQuality.value !== 'low'
  })
  const remoteLimit = activeQuality.value === 'high' ? 30 : activeQuality.value === 'medium' ? 20 : 10
  const visibleIds = Object.keys(props.peers).filter(id => id !== selfId).slice(0, remoteLimit)
  for (const [id, parts] of remoteAvatars) {
    const visible = visibleIds.includes(id)
    parts.group.visible = visible
  }
}

function buildWorld() {
  if (!scene) return
  scene.add(new THREE.AmbientLight(0xfff4dd, 0.58))
  scene.add(new THREE.HemisphereLight(0xbfe4ff, 0xb98a5c, 0.78))
  const sun = new THREE.DirectionalLight(0xfff3d5, 1.35)
  sun.position.set(-10, 18, 14)
  sun.castShadow = activeQuality.value === 'high'
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.left = -18
  sun.shadow.camera.right = 18
  sun.shadow.camera.top = 24
  sun.shadow.camera.bottom = -8
  scene.add(sun)

  const groundGeometry = new THREE.PlaneGeometry(58, 76)
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xb98a5c, roughness: 0.92, metalness: 0.01 })
  ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.z = 4
  ground.receiveShadow = activeQuality.value === 'high'
  scene.add(ground)

  const stoneCanvas = document.createElement('canvas')
  stoneCanvas.width = 256
  stoneCanvas.height = 256
  const stoneContext = stoneCanvas.getContext('2d')!
  stoneContext.fillStyle = '#898f96'
  stoneContext.fillRect(0, 0, 256, 256)
  for (let row = 0; row < 8; row += 1) {
    const shift = row % 2 * 32
    for (let column = -1; column < 5; column += 1) {
      const shade = 128 + Math.floor(Math.random() * 26)
      stoneContext.fillStyle = `rgb(${shade},${shade + 3},${shade + 9})`
      stoneContext.fillRect(column * 64 + shift + 2, row * 32 + 2, 60, 28)
      stoneContext.fillStyle = 'rgba(255,255,255,.07)'
      stoneContext.fillRect(column * 64 + shift + 4, row * 32 + 4, 56, 5)
    }
  }
  const stoneTexture = new THREE.CanvasTexture(stoneCanvas)
  stoneTexture.colorSpace = THREE.SRGBColorSpace
  stoneTexture.wrapS = THREE.RepeatWrapping
  stoneTexture.wrapT = THREE.RepeatWrapping
  stoneTexture.repeat.set(3, 7)
  const stoneRoad = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.14, 25), new THREE.MeshStandardMaterial({ map: stoneTexture, roughness: 0.78 }))
  stoneRoad.position.set(0, 0.07, 17)
  stoneRoad.receiveShadow = activeQuality.value === 'high'
  scene.add(stoneRoad)
  const entryApron = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.13, 42), stoneRoad.material)
  entryApron.position.set(0, 0.06, 2)
  entryApron.receiveShadow = activeQuality.value === 'high'
  scene.add(entryApron)

  const gateMaterial = new THREE.MeshStandardMaterial({ color: 0x5b3a26, roughness: 0.62 })
  for (const x of [-4.4, 4.4]) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.31, 4.3, 12), gateMaterial)
    column.position.set(x, 2.15, 20)
    column.castShadow = activeQuality.value === 'high'
    scene.add(column)
    staticDecor.push(column)
  }
  const gateBeam = new THREE.Mesh(new THREE.BoxGeometry(11, 0.42, 1.2), gateMaterial)
  gateBeam.position.set(0, 4.15, 20)
  scene.add(gateBeam)
  const gateRoof = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.32, 2.6), new THREE.MeshStandardMaterial({ color: 0x333741, roughness: 0.45 }))
  gateRoof.position.set(0, 4.55, 20)
  gateRoof.rotation.x = 0.05
  scene.add(gateRoof)
  const plaqueCanvas = document.createElement('canvas')
  plaqueCanvas.width = 256
  plaqueCanvas.height = 72
  const plaqueContext = plaqueCanvas.getContext('2d')!
  plaqueContext.fillStyle = '#2e5342'
  plaqueContext.fillRect(0, 0, 256, 72)
  plaqueContext.strokeStyle = '#e6d7ae'
  plaqueContext.lineWidth = 4
  plaqueContext.strokeRect(8, 8, 240, 56)
  plaqueContext.fillStyle = '#f5ecd6'
  plaqueContext.font = '38px serif'
  plaqueContext.textAlign = 'center'
  plaqueContext.fillText('在线寺庙', 128, 50)
  const plaqueTexture = new THREE.CanvasTexture(plaqueCanvas)
  plaqueTexture.colorSpace = THREE.SRGBColorSpace
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.74), new THREE.MeshStandardMaterial({ map: plaqueTexture, roughness: 0.6 }))
  plaque.position.set(0, 4.15, 19.4)
  plaque.userData.qualityDetail = 'medium'
  scene.add(plaque)

  const lanternPoleGeometry = new THREE.CylinderGeometry(0.09, 0.12, 4, 8)
  const lanternPoleMaterial = new THREE.MeshStandardMaterial({ color: 0x4d3524, roughness: 0.7 })
  const lanternGeometry = new THREE.SphereGeometry(0.12, 10, 8)
  const lanternMaterial = new THREE.MeshStandardMaterial({ color: 0xf6d3c0, roughness: 0.42 })
  const hangingLanterns = new THREE.InstancedMesh(lanternGeometry, lanternMaterial, 28)
  const lanternMatrix = new THREE.Matrix4()
  let lanternIndex = 0
  for (const z of [11, 15, 19, 23]) {
    for (let index = 0; index < 7; index += 1) {
      lanternMatrix.makeTranslation(-3.6 + index * 1.2, 3.2 + Math.sin((index + z) * 0.7) * 0.12, z)
      hangingLanterns.setMatrixAt(lanternIndex, lanternMatrix)
      lanternIndex += 1
    }
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 8.6, 5), lanternPoleMaterial)
    wire.rotation.z = Math.PI / 2
    wire.position.set(0, 4.1, z)
    wire.userData.qualityDetail = 'medium'
    scene.add(wire)
  }
  hangingLanterns.instanceMatrix.needsUpdate = true
  scene.add(hangingLanterns)
  for (const x of [-7.8, 7.8]) {
    const pole = new THREE.Mesh(lanternPoleGeometry, lanternPoleMaterial)
    pole.position.set(x, 2, 22.5)
    pole.castShadow = activeQuality.value === 'high'
    scene.add(pole)
  }

  const stoneLampBase = new THREE.BoxGeometry(0.58, 0.22, 0.58)
  const stoneLampPost = new THREE.BoxGeometry(0.2, 0.72, 0.2)
  const stoneLampHouse = new THREE.BoxGeometry(0.54, 0.48, 0.54)
  const stoneLampCap = new THREE.ConeGeometry(0.48, 0.28, 4)
  const stoneLampMaterial = new THREE.MeshStandardMaterial({ color: 0x666a6f, roughness: 0.72 })
  const stoneLampGlass = new THREE.MeshStandardMaterial({ color: 0xf8ecd6, emissive: 0xfff3cf, emissiveIntensity: 0.08 })
  for (const [x, z] of [[-5.6, 12], [-5.9, 17], [-5.5, 22], [5.7, 14], [6.1, 19], [5.6, 24]] as Array<[number, number]>) {
    const lamp = new THREE.Group()
    const base = new THREE.Mesh(stoneLampBase, stoneLampMaterial)
    base.position.y = 0.11
    const post = new THREE.Mesh(stoneLampPost, stoneLampMaterial)
    post.position.y = 0.58
    const house = new THREE.Mesh(stoneLampHouse, stoneLampGlass)
    house.position.y = 1.18
    const cap = new THREE.Mesh(stoneLampCap, stoneLampMaterial)
    cap.position.y = 1.54
    cap.rotation.y = Math.PI / 4
    lamp.add(base, post, house, cap)
    lamp.position.set(x, 0, z)
    lamp.userData.qualityDetail = 'medium'
    scene.add(lamp)
    staticDecor.push(lamp)
  }

  const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x4e7d68, roughness: 0.95 })
  for (let index = 0; index < 7; index += 1) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(7 + index, 12 + index * 2, 18), mountainMaterial)
    cone.position.set(-24 + index * 8, 3, -16 - (index % 2) * 5)
    cone.userData.qualityDetail = 'medium'
    scene.add(cone)
    staticDecor.push(cone)
  }

  const trunkGeometry = new THREE.CylinderGeometry(0.13, 0.2, 1.8, 8)
  const crownGeometry = new THREE.IcosahedronGeometry(1.25, activeQuality.value === 'low' ? 0 : 1)
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x39271a, roughness: 0.8 })
  const crownMaterials = [
    new THREE.MeshStandardMaterial({ color: 0xbf4b25, roughness: 0.82 }),
    new THREE.MeshStandardMaterial({ color: 0xd97a2b, roughness: 0.82 }),
    new THREE.MeshStandardMaterial({ color: 0xe3a83c, roughness: 0.82 }),
    new THREE.MeshStandardMaterial({ color: 0x77652e, roughness: 0.84 }),
  ]
  const treePositions: Array<[number, number]> = [
    [-10, 6], [11, 7], [-11, 12], [12, 16], [-12, 21], [12, 22], [-10, -1], [10, -2],
    [-17, 8], [18, 11], [-24, 20], [19, 24], [-8, 28], [9, 28], [-14, 2], [16, 3],
  ]
  treePositions.forEach(([x, z], treeIndex) => {
    const tree = new THREE.Group()
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 1.1
    tree.add(trunk)
    for (let crownIndex = 0; crownIndex < 3; crownIndex += 1) {
      const crown = new THREE.Mesh(crownGeometry, crownMaterials[(treeIndex + crownIndex) % crownMaterials.length]!)
      crown.position.set((crownIndex - 1) * 0.42, 2.3 + crownIndex * 0.26, crownIndex * 0.14)
      crown.rotation.set(crownIndex, treeIndex + crownIndex, crownIndex * 0.5)
      crown.scale.setScalar(1.05 + (crownIndex === 1 ? 0.4 : 0))
      tree.add(crown)
    }
    tree.position.set(x, 0, z)
    tree.rotation.y = x * 0.3
    tree.userData.qualityDetail = treeIndex % 2 === 0 ? 'high' : 'medium'
    scene?.add(tree)
    staticDecor.push(tree)
  })

  const hallMaterial = new THREE.MeshStandardMaterial({ color: 0x5e3a26, roughness: 0.58 })
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x333741, roughness: 0.42, metalness: 0.06 })
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.66 })
  const latticeMaterial = new THREE.MeshStandardMaterial({ color: 0xdfd3b6, roughness: 0.7 })
  const floor = new THREE.Mesh(new THREE.BoxGeometry(24, 0.2, 17), new THREE.MeshStandardMaterial({ color: 0x8e7257, roughness: 0.85 }))
  floor.position.set(0, 0.12, 1)
  floor.receiveShadow = activeQuality.value === 'high'
  scene.add(floor)

  for (let index = 0; index < 6; index += 1) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 3.8, 12), hallMaterial)
    column.position.set(-9.5 + index * 3.8, 1.9, -5)
    if (index > 0 && index < 5) column.position.set(index === 1 ? -8.5 : index === 2 ? 8.5 : column.position.x, 2.5, index === 3 ? 7 : 7)
    column.castShadow = activeQuality.value === 'high'
    scene.add(column)
  }

  const roof = new THREE.Mesh(new THREE.CylinderGeometry(18, 14, 1.4, 4, 1), roofMaterial)
  roof.position.set(0, 5.0, 1)
  roof.rotation.y = Math.PI / 4
  roof.scale.set(0.78, 1, 0.5)
  scene.add(roof)

  const eave = new THREE.Mesh(new THREE.BoxGeometry(21, 0.32, 16), roofMaterial)
  eave.position.set(0, 4.1, 1)
  scene.add(eave)

  for (const x of [-7.5, -3.2, 3.2, 7.5]) {
    const window = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), latticeMaterial)
    window.position.set(x, 2.3, 9.5)
    window.userData.qualityDetail = 'medium'
    scene.add(window)
  }
  const innerGlow = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 2.3), new THREE.MeshBasicMaterial({ color: 0xf3d9a2 }))
  innerGlow.position.set(0, 2.2, 8.4)
  scene.add(innerGlow)
  for (const x of [-1.1, 1.1]) {
    const buddha = new THREE.Mesh(new THREE.CapsuleGeometry(0.44, 0.75, 4, 14), new THREE.MeshStandardMaterial({ color: 0xe9bf6c, roughness: 0.36, metalness: 0.16 }))
    buddha.position.set(x, 1.3, 7)
    scene.add(buddha)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 14), (buddha.material as THREE.MeshStandardMaterial))
    head.position.set(x, 2.0, 7)
    scene.add(head)
  }

  const pagodaBase = new THREE.MeshStandardMaterial({ color: 0xa9a49b, roughness: 0.72 })
  for (let tier = 0; tier < 4; tier += 1) {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.8 - tier * 0.24, 2 - tier * 0.24, 1, 8), pagodaBase)
    body.position.set(-14, 0.8 + tier * 1.15, 8)
    body.castShadow = activeQuality.value === 'high'
    scene.add(body)
    const eaveTier = new THREE.Mesh(new THREE.CylinderGeometry(2.4 - tier * 0.2, 2.4 - tier * 0.2, 0.16, 8), roofMaterial)
    eaveTier.position.set(-14, 1.35 + tier * 1.15, 8)
    scene.add(eaveTier)
  }

  const pond = new THREE.Mesh(new THREE.CircleGeometry(4.4, 42), new THREE.MeshStandardMaterial({ color: 0x4b91b7, roughness: 0.22, metalness: 0.08 }))
  pond.rotation.x = -Math.PI / 2
  pond.position.set(13.5, 0.11, 15)
  scene.add(pond)
  for (const [x, z] of [[11.7, 14.2], [13.2, 16.1], [15.3, 14.6], [14.5, 12.8]] as Array<[number, number]>) {
    const lotusLeaf = new THREE.Mesh(new THREE.CircleGeometry(0.35, 18), new THREE.MeshStandardMaterial({ color: 0x3d7a44, roughness: 0.75 }))
    lotusLeaf.rotation.x = -Math.PI / 2
    lotusLeaf.position.set(x, 0.16, z)
    scene.add(lotusLeaf)
    const lotusFlower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshStandardMaterial({ color: 0xf3c7cd, roughness: 0.5 }))
    lotusFlower.position.set(x, 0.24, z)
    scene.add(lotusFlower)
  }

  const benchMaterial = new THREE.MeshStandardMaterial({ color: 0x634329, roughness: 0.66 })
  for (const [x, z] of [[8.5, 10], [8.8, 14], [8.5, 18]] as Array<[number, number]>) {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 0.54), benchMaterial)
    seat.position.set(x, 0.58, z)
    scene.add(seat)
    for (const offset of [-0.65, 0.65]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.52, 0.1), benchMaterial)
      leg.position.set(x + offset, 0.26, z)
      scene.add(leg)
    }
  }

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.4, 0.65, 28), new THREE.MeshStandardMaterial({ color: 0xa1917a, roughness: 0.68 }))
  pedestal.position.set(0, 0.55, -3)
  scene.add(pedestal)
  const lotus = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 18, 0, Math.PI * 2, Math.PI * 0.38, Math.PI * 0.45), new THREE.MeshStandardMaterial({ color: 0xd9ad68, roughness: 0.42 }))
  lotus.position.set(0, 1.5, -3)
  scene.add(lotus)
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 8, 36), new THREE.MeshStandardMaterial({ color: 0xf8d38b, emissive: 0xffd18b, emissiveIntensity: 0.35 }))
  halo.position.set(0, 3.4, -3.2)
  scene.add(halo)

  const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 1), hallMaterial)
  table.position.set(0, 1, 7.5)
  table.rotation.y = Math.PI
  table.castShadow = activeQuality.value === 'high'
  scene.add(table)
  for (const x of [-1.3, 1.3]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1, 0.14), hallMaterial)
    leg.position.set(x, 0.5, 7.5)
    scene.add(leg)
  }
  const censer = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.34, 0.48, 18), new THREE.MeshStandardMaterial({ color: 0x696b71, roughness: 0.38, metalness: 0.58 }))
  censer.position.set(0, 1.33, 7.5)
  scene.add(censer)

  cushionTargets = props.cushions
  const cushionGeometry = new THREE.CylinderGeometry(0.78, 0.82, 0.22, 20)
  const cushionMaterial = new THREE.MeshStandardMaterial({ color: 0x5b5147, roughness: 0.86 })
  for (const cushion of cushionTargets) {
    const mesh = new THREE.Mesh(cushionGeometry, cushionMaterial)
    mesh.position.set(cushion.x, 0.33, cushion.z)
    const cushionIndex = Number.parseInt(cushion.id.split('-').pop() ?? '0', 10)
    if (cushionIndex % 3 !== 1) mesh.userData.qualityDetail = 'medium'
    mesh.castShadow = activeQuality.value === 'high'
    mesh.receiveShadow = activeQuality.value === 'high'
    scene?.add(mesh)
    staticDecor.push(mesh)
  }

  const visitorPositions = [
    [-2.4, 19, 0.3], [-3.1, 14, 0.1], [2.8, 17, -0.2], [3.4, 12, -0.4],
    [-1.5, 6, 0.1], [1.8, 5, -0.1], [-4.4, 8, 0.2], [4.7, 20, -0.3],
  ] as Array<[number, number, number]>
  visitorPositions.forEach(([x, z, rotation], index) => {
    const visitor = createAvatar('', false)
    visitor.group.position.set(x, 0, z)
    visitor.group.rotation.y = rotation
    visitor.group.userData.qualityDetail = 'high'
    scene?.add(visitor.group)
    staticDecor.push(visitor.group)
  })
}

const mapZones = [
  { key: 'entrance', x: 0, z: 25 },
  { key: 'mainHall', x: 0, z: 0 },
  { key: 'coffee', x: -14, z: 25 },
  { key: 'teaHall', x: 14, z: 25 },
  { key: 'forest', x: -19, z: 19 },
  { key: 'pondRest', x: 13, z: 15 },
  { key: 'pagodaWalk', x: -14, z: 8 },
  { key: 'riverside', x: 0, z: -18 },
  { key: 'bamboo', x: 18, z: -6 },
  { key: 'persimmon', x: -18, z: -6 },
  { key: 'bell', x: -10, z: -16 },
  { key: 'workshop', x: 16, z: -16 },
] as const

function buildMapLandmarks() {
  if (!scene) return
  const patchGeometry = new THREE.CircleGeometry(5.2, 28)
  const patchMaterial = new THREE.MeshStandardMaterial({ color: 0xc49c68, roughness: 0.9 })
  const zonePatches = new THREE.InstancedMesh(patchGeometry, patchMaterial, mapZones.length)
  const patchMatrix = new THREE.Matrix4()
  const flatQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
  mapZones.forEach((zone, index) => {
    patchMatrix.compose(new THREE.Vector3(zone.x, 0.08, zone.z), flatQuaternion, new THREE.Vector3(1, 1, 1))
    zonePatches.setMatrixAt(index, patchMatrix)
  })
  zonePatches.instanceMatrix.needsUpdate = true
  zonePatches.userData.qualityDetail = 'high'
  scene.add(zonePatches)
  staticDecor.push(zonePatches)

  const markerGeometry = new THREE.CylinderGeometry(0.06, 0.08, 2.2, 6)
  const markerMaterial = new THREE.MeshStandardMaterial({ color: 0x5d3f2a, roughness: 0.65 })
  const zoneMarkers = new THREE.InstancedMesh(markerGeometry, markerMaterial, mapZones.length)
  mapZones.forEach((zone, index) => {
    patchMatrix.makeTranslation(zone.x, 1.1, zone.z)
    zoneMarkers.setMatrixAt(index, patchMatrix)
  })
  zoneMarkers.instanceMatrix.needsUpdate = true
  zoneMarkers.userData.qualityDetail = 'high'
  scene.add(zoneMarkers)
  staticDecor.push(zoneMarkers)

  const clothMaterial = new THREE.MeshStandardMaterial({ color: 0xf0e6d2, roughness: 0.72 })
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x634329, roughness: 0.62 })
  const tileMaterial = new THREE.MeshStandardMaterial({ color: 0x495057, roughness: 0.45 })

  const coffee = new THREE.Group()
  const coffeeRoof = new THREE.Mesh(new THREE.BoxGeometry(5, 0.18, 4.2), clothMaterial)
  coffeeRoof.position.y = 3
  coffee.add(coffeeRoof)
  for (const [x, z] of [[-2, -1.5], [2, -1.5], [-2, 1.5], [2, 1.5]] as Array<[number, number]>) {
    const post = new THREE.Mesh(markerGeometry, woodMaterial)
    post.position.set(x, 1.1, z)
    coffee.add(post)
  }
  for (const [x, z] of [[-1.2, 0], [1.2, 0]] as Array<[number, number]>) {
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 18), woodMaterial)
    table.position.set(x, 0.74, z)
    coffee.add(table)
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.7, 8), woodMaterial)
    stem.position.set(x, 0.35, z)
    coffee.add(stem)
  }
  coffee.position.set(-14, 0, 25)
  coffee.userData.qualityDetail = 'high'
  scene.add(coffee)
  staticDecor.push(coffee)

  const teaHall = new THREE.Group()
  const teaFloor = new THREE.Mesh(new THREE.BoxGeometry(7, 0.18, 6), new THREE.MeshStandardMaterial({ color: 0x8e7257, roughness: 0.84 }))
  teaFloor.position.y = 0.16
  teaHall.add(teaFloor)
  const teaRoof = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5, 0.7, 4, 1), tileMaterial)
  teaRoof.position.y = 3.5
  teaRoof.rotation.y = Math.PI / 4
  teaHall.add(teaRoof)
  for (const [x, z] of [[-2.5, -2], [2.5, -2], [-2.5, 2], [2.5, 2]] as Array<[number, number]>) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 3, 10), woodMaterial)
    column.position.set(x, 1.5, z)
    teaHall.add(column)
  }
  teaHall.position.set(14, 0, 25)
  teaHall.userData.qualityDetail = 'high'
  scene.add(teaHall)
  staticDecor.push(teaHall)

  const forest = new THREE.Group()
  const forestPath = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 16), new THREE.MeshStandardMaterial({ color: 0xa98258, roughness: 0.92 }))
  forestPath.rotation.x = -Math.PI / 2
  forestPath.position.y = 0.1
  forest.add(forestPath)
  const bambooGeometry = new THREE.CylinderGeometry(0.08, 0.1, 5.2, 6)
  const bambooMaterial = new THREE.MeshStandardMaterial({ color: 0x6f8f4c, roughness: 0.68 })
  const bamboo = new THREE.InstancedMesh(bambooGeometry, bambooMaterial, 36)
  let bambooIndex = 0
  for (let row = 0; row < 12; row += 1) {
    for (const side of [-1, 1]) {
      patchMatrix.makeTranslation(side * (2 + Math.random() * 0.7), 2.6, -7 + row * 1.2)
      bamboo.setMatrixAt(bambooIndex, patchMatrix)
      bambooIndex += 1
    }
  }
  bamboo.instanceMatrix.needsUpdate = true
  forest.add(bamboo)
  forest.position.set(-19, 0, 19)
  forest.userData.qualityDetail = 'high'
  scene.add(forest)
  staticDecor.push(forest)

  const riverside = new THREE.Group()
  const river = new THREE.Mesh(new THREE.PlaneGeometry(30, 6), new THREE.MeshStandardMaterial({ color: 0x4b91b7, roughness: 0.24, metalness: 0.06 }))
  river.rotation.x = -Math.PI / 2
  river.position.y = 0.12
  riverside.add(river)
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 8), woodMaterial)
  bridge.position.y = 0.6
  riverside.add(bridge)
  for (const [x, z] of [[-1, -3], [1, -3], [-1, 3], [1, 3]] as Array<[number, number]>) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.2), woodMaterial)
    pier.position.set(x, 0.3, z)
    riverside.add(pier)
  }
  riverside.position.set(0, 0, -18)
  riverside.userData.qualityDetail = 'high'
  scene.add(riverside)
  staticDecor.push(riverside)

  const persimmon = new THREE.Group()
  for (const axis of [-2.2, 0, 2.2]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(5, 0.14, 0.14), woodMaterial)
    beam.position.set(0, 2, axis)
    persimmon.add(beam)
  }
  const persimmonGeometry = new THREE.SphereGeometry(0.16, 10, 8)
  const persimmonMaterial = new THREE.MeshStandardMaterial({ color: 0xe8722d, roughness: 0.55 })
  const fruits = new THREE.InstancedMesh(persimmonGeometry, persimmonMaterial, 42)
  let fruitIndex = 0
  for (const axis of [-2.2, 0, 2.2]) {
    for (let index = 0; index < 14; index += 1) {
      patchMatrix.makeTranslation(-2.2 + (index % 7) * 0.72, 2.24 + (index % 2) * 0.1, axis)
      fruits.setMatrixAt(fruitIndex, patchMatrix)
      fruitIndex += 1
    }
  }
  fruits.instanceMatrix.needsUpdate = true
  persimmon.add(fruits)
  persimmon.position.set(-18, 0, -6)
  persimmon.userData.qualityDetail = 'high'
  scene.add(persimmon)
  staticDecor.push(persimmon)

  const bell = new THREE.Group()
  const bellRoof = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.1, 0.55, 4, 1), tileMaterial)
  bellRoof.position.y = 3.3
  bellRoof.rotation.y = Math.PI / 4
  bell.add(bellRoof)
  for (const [x, z] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]] as Array<[number, number]>) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 3, 8), woodMaterial)
    column.position.set(x, 1.5, z)
    bell.add(column)
  }
  const bellBody = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.05, 1.35, 20), new THREE.MeshStandardMaterial({ color: 0x7b6f52, roughness: 0.35, metalness: 0.42 }))
  bellBody.position.y = 1.9
  bell.add(bellBody)
  bell.position.set(-10, 0, -16)
  bell.userData.qualityDetail = 'high'
  scene.add(bell)
  staticDecor.push(bell)

  const workshop = new THREE.Group()
  for (const [x, z] of [[-1.6, -1], [1.6, -1]] as Array<[number, number]>) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.2, 0.18), woodMaterial)
    frame.position.set(x, 1.6, z)
    workshop.add(frame)
    const brace = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.16, 0.16), woodMaterial)
    brace.position.set(0, 3, z)
    workshop.add(brace)
  }
  const roofTiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.12, 0.7), tileMaterial, 24)
  for (let index = 0; index < 24; index += 1) {
    patchMatrix.makeTranslation(-0.5 + (index % 6) * 0.22, 0.25 + Math.floor(index / 6) * 0.14, -1 + (index % 3) * 0.8)
    roofTiles.setMatrixAt(index, patchMatrix)
  }
  roofTiles.instanceMatrix.needsUpdate = true
  workshop.add(roofTiles)
  workshop.position.set(16, 0, -16)
  workshop.userData.qualityDetail = 'high'
  scene.add(workshop)
  staticDecor.push(workshop)
}

function teleportTo(x: number, z: number) {
  selfState.x = THREE.MathUtils.clamp(x, -20, 20)
  selfState.z = THREE.MathUtils.clamp(z, -20, 32)
  selfState.targetX = selfState.x
  selfState.targetZ = selfState.z
  seekingCushion = false
  if (selfState.action !== 'meditating') selfState.action = 'idle'
  avatar?.group.position.set(selfState.x, selfState.z > 8 ? 0.22 : 0, selfState.z)
  emit('moved', { x: selfState.x, z: selfState.z, rotation: selfState.rotation, action: selfState.action })
}

function createAvatar(label: string, showLabel = true): AvatarParts {
  const group = new THREE.Group()
  const robe = new THREE.MeshStandardMaterial({ color: 0xe7eaea, roughness: 0.68 })
  const sash = new THREE.MeshStandardMaterial({ color: 0xf6d370, roughness: 0.58 })
  const skin = new THREE.MeshStandardMaterial({ color: 0xf0cdaf, roughness: 0.46 })
  const face = new THREE.MeshStandardMaterial({ color: 0x3f3630, roughness: 0.35 })
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.31, 0.52, 4, 14), robe)
  body.position.y = 0.64
  body.castShadow = activeQuality.value === 'high'
  const apron = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.04), sash)
  apron.position.set(-0.03, 0.64, 0.3)
  apron.rotation.set(0.14, 0, 0.16)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.37, 24, 20), skin)
  head.position.y = 1.09
  const armGeometry = new THREE.CapsuleGeometry(0.08, 0.3, 3, 8)
  const armLeft = new THREE.Mesh(armGeometry, robe)
  armLeft.position.set(-0.38, 0.74, 0)
  armLeft.rotation.z = 0.06
  const armRight = new THREE.Mesh(armGeometry, robe)
  armRight.position.set(0.38, 0.74, 0)
  armRight.rotation.z = -0.06
  const leftFoot = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.08, 3, 8), robe)
  leftFoot.position.set(-0.15, 0.06, 0.03)
  const rightFoot = new THREE.Mesh(leftFoot.geometry, robe)
  rightFoot.position.set(0.15, 0.06, 0.03)
  const eyeLeft = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), face)
  eyeLeft.position.set(-0.14, 1.13, 0.36)
  const eyeRight = new THREE.Mesh(eyeLeft.geometry, face)
  eyeRight.position.set(0.14, 1.13, 0.36)
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.016, 6, 12, Math.PI), face)
  smile.position.set(0, 0.99, 0.35)
  smile.rotation.set(0, 0, Math.PI)
  group.add(body, apron, head, armLeft, armRight, leftFoot, rightFoot, eyeLeft, eyeRight, smile)
  group.position.set(0, 0, 22)

  let labelSprite: import('three').Sprite
  if (showLabel) {
    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 42
    const context = canvas.getContext('2d')!
    context.fillStyle = 'rgba(248,245,238,.88)'
    context.roundRect?.(4, 2, 152, 38, 10)
    context.fill()
    context.fillStyle = '#4a4038'
    context.font = '18px system-ui, sans-serif'
    context.textAlign = 'center'
    context.fillText(label, 80, 27)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }))
    labelSprite.name = 'label'
    labelSprite.scale.set(0.82, 0.21, 1)
    labelSprite.position.y = 1.64
    group.add(labelSprite)
  } else {
    labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true }))
    labelSprite.visible = false
    labelSprite.position.y = 1.76
  }

  group.userData = { body, head, armLeft, armRight, label: labelSprite, phase: Math.random() * 6 }
  return { group, body, head, armLeft, armRight, label: labelSprite }
}

function bindEvents() {
  const element = renderer?.domElement
  if (!element || !camera) return
  element.addEventListener('pointerdown', (event) => {
    dragging = true
    dragMoved = 0
    lastPointer = { x: event.clientX, y: event.clientY }
    element.setPointerCapture(event.pointerId)
  })
  element.addEventListener('pointermove', (event) => {
    if (!dragging) return
    const dx = event.clientX - lastPointer.x
    const dy = event.clientY - lastPointer.y
    dragMoved += Math.abs(dx) + Math.abs(dy)
    if (!props.reducedMotion) {
      yaw -= dx * 0.006
      pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, -0.1, 0.85)
    }
    lastPointer = { x: event.clientX, y: event.clientY }
  })
  element.addEventListener('pointerup', (event) => {
    dragging = false
    if (dragMoved < 6) handleClick(event)
  })
  element.addEventListener('wheel', (event) => {
    event.preventDefault()
    distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.008, 3, 13)
  }, { passive: false })
  element.addEventListener('touchmove', (event) => {
    if (event.touches.length !== 2) return
    const current = Math.hypot(event.touches[0]!.clientX - event.touches[1]!.clientX, event.touches[0]!.clientY - event.touches[1]!.clientY)
    if (pinchDistance) distance = THREE.MathUtils.clamp(distance * (pinchDistance / current), 3, 13)
    pinchDistance = current
  }, { passive: true })
  element.addEventListener('touchend', () => { pinchDistance = 0 })
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
}

function handleKeyDown(event: KeyboardEvent) {
  if (!event.target || (event.target as HTMLElement).closest('input, textarea, select, button')) return
  keys.add(event.key.toLowerCase())
  if (event.key === '1' || event.key === 'e' || event.key === ' ') {
    event.preventDefault()
    emit('pray')
  }
  if (event.key === '2') emit('beads')
  if (event.key === '3') emit('reverence')
}

function handleKeyUp(event: KeyboardEvent) {
  keys.delete(event.key.toLowerCase())
  const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
  if (movementKeys.includes(event.key.toLowerCase())) {
    selfState.targetX = selfState.x
    selfState.targetZ = selfState.z
  }
}

function handleClick(event: PointerEvent) {
  if (!renderer || !camera || !raycaster || !ground) return
  const rectangle = renderer.domElement.getBoundingClientRect()
  const pointer = new THREE.Vector2(
    ((event.clientX - rectangle.left) / rectangle.width) * 2 - 1,
    -((event.clientY - rectangle.top) / rectangle.height) * 2 + 1,
  )
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObject(ground)[0]
  if (!hit) return
  selfState.targetX = hit.point.x
  selfState.targetZ = hit.point.z
  seekingCushion = false
}

function beginPray() {
  const available = cushionTargets.filter(item => !item.peerId)
  const nearest = [...available].sort((a, b) => distanceTo(a) - distanceTo(b))[0]
  if (!nearest) return
  selfState.targetX = nearest.x + 0.5
  selfState.targetZ = nearest.z + 0.5
  seekingCushion = true
}

function cancelPray() {
  seekingCushion = false
  if (selfState.action !== 'meditating') setAction('idle')
}

function meditate() {
  setAction('meditating')
}

function stopMeditate() {
  setAction('idle')
}

function setAction(action: SansaAction) {
  selfState.action = action
}

function distanceTo(cushion: { x: number; z: number }) {
  return Math.hypot(cushion.x - selfState.x, cushion.z - selfState.z)
}

function isInHall() {
  return selfState.z < 8.5 && Math.abs(selfState.x) < 10
}

function isNearAltar() {
  return Math.abs(selfState.z - 7.5) < 2.5
}

function animate() {
  if (disposed || !renderer || !scene || !camera || !clock) return
  frameId = requestAnimationFrame(animate)
  const delta = Math.min(clock.getDelta(), 1 / 30)
  const elapsed = clock.elapsedTime
  updateSelf(delta)
  updateRemoteAvatars()
  updateIncense()
  if (avatar) poseAvatar(avatar, selfState.action, elapsed, true)
  updateCamera(delta)
  renderer.render(scene, camera)
  rendererInfo()
}

function updateSelf(delta: number) {
  const speed = 3.1
  let moveX = 0
  let moveZ = 0
  if (keys.has('w') || keys.has('arrowup')) moveZ -= 1
  if (keys.has('s') || keys.has('arrowdown')) moveZ += 1
  if (keys.has('a') || keys.has('arrowleft')) moveX -= 1
  if (keys.has('d') || keys.has('arrowright')) moveX += 1

  if (moveX || moveZ) {
    const forward = new THREE.Vector3(Math.sin(yaw + Math.PI), 0, Math.cos(yaw + Math.PI))
    const right = new THREE.Vector3(forward.z, 0, -forward.x)
    selfState.targetX = selfState.x + (right.x * moveX + forward.x * -moveZ) * 8
    selfState.targetZ = selfState.z + (right.z * moveX + forward.z * -moveZ) * 8
    seekingCushion = false
  }

  const dx = selfState.targetX - selfState.x
  const dz = selfState.targetZ - selfState.z
  const length = Math.hypot(dx, dz)
  const moving = length > 0.16 && selfState.action !== 'meditating' && selfState.action !== 'praying'
  if (moving) {
    const step = Math.min(speed * delta, length)
    selfState.x += dx / length * step
    selfState.z += dz / length * step
    selfState.rotation = Math.atan2(dx, dz)
    selfState.action = 'walking'
  } else if (selfState.action === 'walking') {
    selfState.action = 'idle'
    if (seekingCushion) {
      seekingCushion = false
      emit('arrivedAtCushion')
    }
  }

  if (selfState.z > 8) {
    selfState.x = THREE.MathUtils.clamp(selfState.x, -18, 18)
    selfState.z = THREE.MathUtils.clamp(selfState.z, 8, 31.5)
  } else {
    selfState.x = THREE.MathUtils.clamp(selfState.x, -20, 20)
    selfState.z = THREE.MathUtils.clamp(selfState.z, -20, 8)
  }

  if (avatar) {
    avatar.group.position.set(selfState.x, selfState.z > 8 ? 0.22 : 0, selfState.z)
    avatar.group.rotation.y = selfState.rotation
  }
  emit('moved', { x: selfState.x, z: selfState.z, rotation: selfState.rotation, action: selfState.action })
}

function updateRemoteAvatars() {
  if (!scene) return
  const qualityLimit = activeQuality.value === 'high' ? 30 : activeQuality.value === 'medium' ? 20 : 10
  const entries = Object.entries(props.peers).filter(([id]) => id !== props.selfId).slice(0, qualityLimit)
  const activeIds = new Set(entries.map(([id]) => id))
  for (const [id, parts] of remoteAvatars) {
    if (!activeIds.has(id)) {
      scene.remove(parts.group)
      remoteAvatars.delete(id)
    }
  }
  for (const [id, peer] of entries) {
    let parts = remoteAvatars.get(id)
    if (!parts) {
      parts = createAvatar(peer.name)
      scene.add(parts.group)
      remoteAvatars.set(id, parts)
    }
    parts.group.position.set(peer.x, peer.z > 8 ? 0.22 : 0, peer.z)
    parts.group.rotation.y = peer.rotation
    poseAvatar(parts, peer.action, clock?.elapsedTime ?? 0, false)
  }
}

function updateIncense() {
  if (!scene) return
  const activeIds = new Set(props.incense.map(item => item.id))
  for (const [id, group] of incenseMeshes) {
    if (!activeIds.has(id)) {
      scene.remove(group)
      incenseMeshes.delete(id)
    }
  }
  for (const item of props.incense) {
    if (incenseMeshes.has(item.id)) continue
    const group = new THREE.Group()
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.42, 6), new THREE.MeshStandardMaterial({ color: 0x7a4a26 }))
    stick.position.y = 0.21
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff6d38, emissive: 0xff4d22, emissiveIntensity: 0.7 }))
    ember.position.y = 0.42
    const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0xdcd7cd, transparent: true, opacity: 0.16 }))
    smoke.position.y = 0.62
    group.add(stick, ember, smoke)
    const angle = Math.random() * Math.PI * 2
    group.position.set(Math.cos(angle) * 0.22, 1.56, 7.5 + Math.sin(angle) * 0.18)
    group.userData.startedAt = item.startedAt
    group.userData.duration = item.duration
    scene.add(group)
    incenseMeshes.set(item.id, group)
  }

  const now = Date.now()
  for (const group of incenseMeshes.values()) {
    const startedAt = group.userData.startedAt as number
    const duration = group.userData.duration as number
    const progress = THREE.MathUtils.clamp((now - startedAt) / duration, 0, 1)
    group.scale.y = 1 - progress * 0.72
    const smoke = group.children[2] as import('three').Mesh
    smoke.position.y = 0.62 + Math.sin(now * 0.001 + group.position.x) * 0.05
    smoke.visible = !props.reducedMotion && progress < 0.98
  }
}

function poseAvatar(parts: AvatarParts, action: SansaAction, elapsed: number, isSelf: boolean) {
  const phase = elapsed * (isSelf ? 1 : 0.8) + (parts.group.userData.phase as number ?? 0)
  parts.group.position.y = parts.group.position.y
  if (action === 'walking') {
    parts.group.position.y += Math.abs(Math.sin(phase * 6)) * 0.025
    parts.armLeft.rotation.x = Math.sin(phase * 6) * 0.22
    parts.armRight.rotation.x = -Math.sin(phase * 6) * 0.22
  } else if (action === 'praying') {
    const cycle = (phase * 0.55) % 1
    const kneel = cycle < 0.45 ? cycle / 0.45 : cycle < 0.7 ? 1 : 1 - (cycle - 0.7) / 0.3
    parts.group.position.y += -kneel * 0.36
    parts.group.rotation.x = kneel * 0.5
    parts.armLeft.rotation.set(-1.1, 0, 0.42)
    parts.armRight.rotation.set(-1.1, 0, -0.42)
  } else if (action === 'meditating') {
    parts.group.position.y -= 0.42
    parts.group.rotation.x = 0
    parts.armLeft.rotation.set(-0.78, 0, 0.78)
    parts.armRight.rotation.set(-0.78, 0, -0.78)
    const breath = Math.sin(phase * 0.8) * 0.012
    parts.head.position.y = 0.82 + breath
    parts.head.scale.setScalar(1)
  } else {
    parts.group.rotation.x = 0
    parts.head.position.y = 1.09 + Math.sin(phase * 0.7) * 0.006
    if (action === 'woodfish' || action === 'incense') {
      const tap = Math.abs(Math.sin(phase * 3.2))
      parts.armRight.rotation.set(-1.4 - tap * 0.3, 0, -0.3)
      parts.armLeft.rotation.set(-0.9, 0, 0.45)
    } else {
      parts.armLeft.rotation.set(Math.sin(phase * 0.6) * 0.03, 0, 0.22)
      parts.armRight.rotation.set(-Math.sin(phase * 0.6) * 0.03, 0, -0.22)
    }
  }
}

function updateCamera(delta: number) {
  if (!camera || !avatar) return
  const desired = new THREE.Vector3(
    selfState.x - Math.sin(yaw) * distance * Math.cos(pitch),
    1.82 + Math.sin(pitch) * distance,
    selfState.z - Math.cos(yaw) * distance * Math.cos(pitch),
  )
  const lookAt = new THREE.Vector3(selfState.x, 1.05, selfState.z)
  const easing = props.reducedMotion ? 1 : Math.min(delta * 4, 0.24)
  camera.position.lerp(desired, easing)
  camera.lookAt(lookAt)
}

function resize() {
  if (!container.value || !renderer || !camera) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  if (!width || !height) return
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function rendererInfo() {
  if (!renderer || !activeQuality.value) return
  const info = renderer.info
  const payload = {
    quality: activeQuality.value,
    calls: info.render.calls,
    triangles: info.render.triangles,
    textures: info.memory.textures,
  }
  emit('info', payload)
}

watch(() => props.peers, applyQuality, { deep: true })
watch(() => props.quality, () => {
  if (props.quality !== 'auto') activeQuality.value = props.quality
  applyQuality()
})
watch(() => props.cushions, (value) => {
  cushionTargets = value
}, { immediate: true })

watch(() => props.peers[props.selfId]?.cushionId, () => {
  applyQuality()
})
</script>

<style scoped>
.sansa-scene {
  width: 100%;
  height: 100%;
  overflow: hidden;
  outline: none;
  touch-action: none;
}

.sansa-scene:focus-visible {
  box-shadow: inset 0 0 0 2px var(--accent-border, #d9ad68);
}

.sansa-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
