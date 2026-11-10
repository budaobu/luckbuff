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
let selfState = { x: 0, z: 22, rotation: Math.PI, action: 'walking' as SansaAction, targetX: 0, targetZ: 22 }
let cushionTargets: SansaCushionState[] = []
let seekingCushion = false
let incenseMeshes = new Map<string, import('three').Group>()
let remoteAvatars = new Map<string, AvatarParts>()
let staticDecor: import('three').Object3D[] = []
let lampLights: import('three').PointLight[] = []

let yaw = Math.PI
let pitch = 0.28
let distance = 7
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
  scene.background = new THREE.Color(0x101623)
  scene.fog = new THREE.Fog(0x101623, 16, 54)

  camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100)
  raycaster = new THREE.Raycaster()
  clock = new THREE.Clock()
  renderer = new THREE.WebGLRenderer({ antialias: activeQuality.value !== 'low', powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  renderer.setSize(width, height)
  renderer.domElement.classList.add('sansa-canvas')
  container.value.appendChild(renderer.domElement)

  activeQuality.value = props.quality === 'auto' ? autoQuality() : props.quality
  applyQuality()
  buildWorld()
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
  scene.add(new THREE.AmbientLight(0x6d7fa6, 0.48))
  scene.add(new THREE.HemisphereLight(0x9db7ff, 0x241a12, 0.55))
  const moon = new THREE.DirectionalLight(0xc6d4ff, 1.05)
  moon.position.set(-8, 18, 18)
  moon.castShadow = activeQuality.value === 'high'
  moon.shadow.mapSize.set(1024, 1024)
  moon.shadow.camera.left = -18
  moon.shadow.camera.right = 18
  moon.shadow.camera.top = 24
  moon.shadow.camera.bottom = -8
  scene.add(moon)

  const groundGeometry = new THREE.PlaneGeometry(52, 70)
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x233024, roughness: 0.9, metalness: 0.02 })
  ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.z = 4
  ground.receiveShadow = activeQuality.value === 'high'
  scene.add(ground)

  const stoneGeometry = new THREE.BoxGeometry(2.2, 0.12, 1.5)
  const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x7c8189, roughness: 0.76 })
  for (let row = 8; row <= 26; row += 2) {
    for (let side = -1; side <= 1; side += 2) {
      for (let lane = 0; lane < 2; lane += 1) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial)
        stone.position.set(side * (0.68 + lane * 1.28), 0.08, row + lane * 0.75)
        stone.rotation.y = lane * 0.02 * side
        stone.receiveShadow = activeQuality.value === 'high'
        scene.add(stone)
        staticDecor.push(stone)
      }
    }
  }

  const poleGeometry = new THREE.CylinderGeometry(0.07, 0.09, 2.2, 10)
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x493121, roughness: 0.68 })
  const lampGeometry = new THREE.SphereGeometry(0.34, 16, 14)
  const lampMaterial = new THREE.MeshStandardMaterial({ color: 0xffb467, emissive: 0xf78f37, emissiveIntensity: 0.55, roughness: 0.35 })
  const capGeometry = new THREE.ConeGeometry(0.48, 0.28, 12)
  const capMaterial = new THREE.MeshStandardMaterial({ color: 0x302222, roughness: 0.6 })
  for (let index = 0; index < 10; index += 1) {
    const side = index % 2 === 0 ? -1 : 1
    const z = 10 + Math.floor(index / 2) * 3.2
    const lamp = new THREE.Group()
    const pole = new THREE.Mesh(poleGeometry, poleMaterial)
    pole.position.y = 1.1
    const shade = new THREE.Mesh(lampGeometry, lampMaterial)
    shade.position.y = 2.3
    const cap = new THREE.Mesh(capGeometry, capMaterial)
    cap.position.y = 2.7
    lamp.add(pole, shade, cap)
    lamp.position.set(side * 4.1, 0, z)
    scene.add(lamp)
    staticDecor.push(lamp)
    if (index < 6) {
      const point = new THREE.PointLight(0xffab5f, 2.2, 7, 1.7)
      point.position.set(side * 4.1, 2.3, z)
      scene.add(point)
      lampLights.push(point)
    }
  }

  const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x1a2a20, roughness: 0.95 })
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
  const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x1d3b26, roughness: 0.88 })
  const treePositions: Array<[number, number]> = [
    [-9, 4], [9, 6], [-10, 11], [10, 14], [-11, 19], [11, 22], [-9, 0], [9, -2],
    [-15, 7], [16, 10], [-16, 18], [17, 24], [-7, 27], [8, 27],
  ]
  treePositions.forEach(([x, z]) => {
    const tree = new THREE.Group()
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 0.9
    const crown = new THREE.Mesh(crownGeometry, crownMaterial)
    crown.position.y = 2.7
    crown.scale.set(1, 1.25, 1)
    tree.add(trunk, crown)
    tree.position.set(x, 0, z)
    tree.rotation.y = x * 0.3
    tree.userData.qualityDetail = activeQuality.value === 'low' ? 'medium' : undefined
    scene?.add(tree)
    staticDecor.push(tree)
  })

  const hallMaterial = new THREE.MeshStandardMaterial({ color: 0x69402c, roughness: 0.65 })
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x2b2b30, roughness: 0.5, metalness: 0.08 })
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd8cbb4, roughness: 0.82 })
  const floor = new THREE.Mesh(new THREE.BoxGeometry(24, 0.2, 17), wallMaterial)
  floor.position.set(0, 0.12, 1)
  floor.receiveShadow = activeQuality.value === 'high'
  scene.add(floor)

  for (let index = 0; index < 6; index += 1) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.38, 5, 12), hallMaterial)
    column.position.set(-9.5 + index * 3.8, 2.5, -5)
    if (index > 0 && index < 5) column.position.set(index === 1 ? -8.5 : index === 2 ? 8.5 : column.position.x, 2.5, index === 3 ? 7 : 7)
    column.castShadow = activeQuality.value === 'high'
    scene.add(column)
  }

  const roof = new THREE.Mesh(new THREE.CylinderGeometry(18, 14, 1.4, 4, 1), roofMaterial)
  roof.position.set(0, 6.5, 1)
  roof.rotation.y = Math.PI / 4
  roof.scale.set(0.78, 1, 0.5)
  scene.add(roof)

  const eave = new THREE.Mesh(new THREE.BoxGeometry(20, 0.28, 15), roofMaterial)
  eave.position.set(0, 5.25, 1)
  scene.add(eave)

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.4, 0.65, 28), new THREE.MeshStandardMaterial({ color: 0x8f7c63, roughness: 0.7 }))
  pedestal.position.set(0, 0.55, -3)
  scene.add(pedestal)
  const lotus = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 18, 0, Math.PI * 2, Math.PI * 0.38, Math.PI * 0.45), new THREE.MeshStandardMaterial({ color: 0xd9ad68, roughness: 0.42 }))
  lotus.position.set(0, 1.5, -3)
  scene.add(lotus)
  const statue = new THREE.Mesh(new THREE.ConeGeometry(0.78, 2.25, 18), new THREE.MeshStandardMaterial({ color: 0xe8d3a2, roughness: 0.35, metalness: 0.12 }))
  statue.position.set(0, 2.6, -3)
  statue.castShadow = activeQuality.value === 'high'
  scene.add(statue)
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 8, 36), new THREE.MeshStandardMaterial({ color: 0xf8d38b, emissive: 0xffd18b, emissiveIntensity: 0.35 }))
  halo.position.set(0, 3.4, -3.2)
  scene.add(halo)
  const statueLight = new THREE.PointLight(0xffd392, 2, 12, 1.6)
  statueLight.position.set(0, 3, -1)
  scene.add(statueLight)

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
    mesh.castShadow = activeQuality.value === 'high'
    mesh.receiveShadow = activeQuality.value === 'high'
    scene?.add(mesh)
    staticDecor.push(mesh)
  }
}

function createAvatar(label: string): AvatarParts {
  const group = new THREE.Group()
  const robe = new THREE.MeshStandardMaterial({ color: 0xa55a35, roughness: 0.72 })
  const skin = new THREE.MeshStandardMaterial({ color: 0xdcc0a0, roughness: 0.52 })
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.44, 1.25, 16), robe)
  body.position.y = 0.75
  body.castShadow = activeQuality.value === 'high'
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), skin)
  head.position.y = 1.62
  const armGeometry = new THREE.CapsuleGeometry(0.07, 0.45, 3, 7)
  const armLeft = new THREE.Mesh(armGeometry, robe)
  armLeft.position.set(-0.33, 1.02, 0)
  armLeft.rotation.z = 0.22
  const armRight = new THREE.Mesh(armGeometry, robe)
  armRight.position.set(0.33, 1.02, 0)
  armRight.rotation.z = -0.22
  group.add(body, head, armLeft, armRight)
  group.position.set(0, 0, 22)

  const canvas = document.createElement('canvas')
  canvas.width = 160
  canvas.height = 42
  const context = canvas.getContext('2d')!
  context.fillStyle = 'rgba(16, 22, 35, 0.72)'
  context.roundRect?.(4, 2, 152, 38, 10)
  context.fill()
  context.fillStyle = '#f4efe6'
  context.font = '18px system-ui, sans-serif'
  context.textAlign = 'center'
  context.fillText(label, 80, 27)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }))
  labelSprite.scale.set(1.35, 0.35, 1)
  labelSprite.position.y = 2.15
  group.add(labelSprite)

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
  return Math.hypot(selfState.x, selfState.z - 7.5) < 2
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
    selfState.x = THREE.MathUtils.clamp(selfState.x, -2.9, 2.9)
    selfState.z = THREE.MathUtils.clamp(selfState.z, 8, 27.5)
  } else {
    selfState.x = THREE.MathUtils.clamp(selfState.x, -10, 10)
    selfState.z = THREE.MathUtils.clamp(selfState.z, -5.5, 8)
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
    parts.group.position.y += Math.abs(Math.sin(phase * 7)) * 0.035
    parts.armLeft.rotation.x = Math.sin(phase * 7) * 0.45
    parts.armRight.rotation.x = -Math.sin(phase * 7) * 0.45
  } else if (action === 'praying') {
    const cycle = (phase * 0.55) % 1
    const kneel = cycle < 0.45 ? cycle / 0.45 : cycle < 0.7 ? 1 : 1 - (cycle - 0.7) / 0.3
    parts.group.position.y += -kneel * 0.42
    parts.group.rotation.x = kneel * 0.62
    parts.armLeft.rotation.set(-1.1, 0, 0.42)
    parts.armRight.rotation.set(-1.1, 0, -0.42)
  } else if (action === 'meditating') {
    parts.group.position.y -= 0.42
    parts.group.rotation.x = 0
    parts.armLeft.rotation.set(-0.78, 0, 0.78)
    parts.armRight.rotation.set(-0.78, 0, -0.78)
    const breath = Math.sin(phase * 0.8) * 0.012
    parts.head.position.y = 1.34 + breath
    parts.head.scale.setScalar(1)
  } else {
    parts.group.rotation.x = 0
    parts.head.position.y = action === 'idle' ? 1.62 : 1.62 + Math.sin(phase) * 0.004
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
    selfState.x + Math.sin(yaw) * distance * Math.cos(pitch),
    3.6 + Math.sin(pitch) * distance,
    selfState.z + Math.cos(yaw) * distance * Math.cos(pitch),
  )
  const lookAt = new THREE.Vector3(selfState.x, 1.2, selfState.z)
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
