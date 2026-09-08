<template>
  <div ref="sceneRef" class="luopan-scene" :class="{ 'is-showcase': variant === 'showcase' }" />
</template>

<script setup lang="ts">
import * as THREE from 'three'
import {
  EARTHLY_BRANCHES,
  TRIGRAMS,
  TWENTY_FOUR_MOUNTAINS,
} from '~/utils/fengshui-luopan/constants'
import { angularDifference, normalizeDegrees } from '~/utils/fengshui-luopan/heading'
import type { LuopanRingId, LuopanSample, LuopanStatus } from '~/types/fengshui-luopan'

interface Props {
  variant: 'live' | 'showcase'
  status: LuopanStatus
  visibleRings: LuopanRingId[]
}

interface RingVisual {
  group: THREE.Group
  material: THREE.MeshBasicMaterial
  texture: THREE.CanvasTexture
}

const props = defineProps<Props>()
const sceneRef = ref<HTMLDivElement>()

let renderer: THREE.WebGLRenderer | null = null
let resizeObserver: ResizeObserver | null = null
let documentVisible = true
let disposed = false
let dragPointerId: number | null = null
let dragStartHeading = 0
let dragStartX = 0
const disposables: Array<{ dispose: () => void }> = []
const sceneListeners: Array<() => void> = []
const rings = new Map<LuopanRingId, RingVisual>()
let pointerGroup: THREE.Group | null = null
let rootGroup: THREE.Group | null = null
let sceneCamera: THREE.PerspectiveCamera | null = null
let spread = 0
let targetSpread = 0.16
let currentHeading = 0
let targetHeading = 0
let hasHeading = false
let calibrationPulse = 0
let lastFrameTime = performance.now()

const ringGeometry = new THREE.PlaneGeometry(4.6, 4.6)
disposables.push(ringGeometry)

function drawRing(
  canvas: HTMLCanvasElement,
  inner: number,
  outer: number,
  labels: string[],
  inkColor: string,
  surfaceColor: string,
  offsetDegrees = 0,
) {
  const context = canvas.getContext('2d')
  if (!context) return
  const center = canvas.width / 2
  const scale = center / 2.3
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = surfaceColor
  context.beginPath()
  context.arc(center, center, outer * scale, 0, Math.PI * 2)
  context.arc(center, center, inner * scale, 0, Math.PI * 2, true)
  context.fill()

  context.strokeStyle = 'rgba(70, 48, 28, 0.30)'
  context.lineWidth = 1.2
  context.beginPath()
  context.arc(center, center, inner * scale, 0, Math.PI * 2)
  context.moveTo(center + outer * scale, center)
  context.arc(center, center, outer * scale, 0, Math.PI * 2)
  context.stroke()

  context.fillStyle = inkColor
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '600 44px "Noto Serif SC", "Songti SC", "SimSun", serif'
  const radius = (inner + outer) / 2 * scale

  labels.forEach((label, index) => {
    const angle = index * Math.PI * 2 / labels.length - Math.PI / 2 + offsetDegrees * Math.PI / 180
    const x = center + Math.cos(angle) * radius
    const y = center + Math.sin(angle) * radius
    context.save()
    context.translate(x, y)
    context.rotate(angle + Math.PI / 2)
    context.fillText(label, 0, 0)
    context.restore()
  })
}

function createRing(
  id: LuopanRingId,
  index: number,
  inner: number,
  outer: number,
  labels: string[],
  inkColor: string,
  offsetDegrees = 0,
) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const surfaceColor = id === 'mountains' ? '#f5ecd7' : id === 'trigrams' ? '#e9d9ba' : '#fbf5e6'
  drawRing(canvas, inner, outer, labels, inkColor, surfaceColor, offsetDegrees)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() ?? 4, 4)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(ringGeometry, material)
  mesh.position.z = 0.085 + index * 0.005
  mesh.renderOrder = 2 + index

  const group = new THREE.Group()
  group.add(mesh)
  disposables.push(texture, material)
  rings.set(id, { group, material, texture })
  rootGroup?.add(group)
}

function addPointer() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0.66)
  shape.lineTo(0.09, 0.22)
  shape.lineTo(-0.09, 0.22)
  shape.closePath()
  const northGeometry = new THREE.ShapeGeometry(shape)
  const southGeometry = northGeometry.clone()
  const northMaterial = new THREE.MeshStandardMaterial({ color: 0xa5362a, roughness: 0.35, metalness: 0.15 })
  const southMaterial = new THREE.MeshStandardMaterial({ color: 0x35302b, roughness: 0.5, metalness: 0.1 })
  const north = new THREE.Mesh(northGeometry, northMaterial)
  const south = new THREE.Mesh(southGeometry, southMaterial)
  south.scale.y = -0.68
  south.position.y = -0.02

  const pivotGeometry = new THREE.CircleGeometry(0.075, 32)
  const pivotMaterial = new THREE.MeshStandardMaterial({ color: 0xd3a04d, roughness: 0.25, metalness: 0.65 })
  const pivot = new THREE.Mesh(pivotGeometry, pivotMaterial)

  pointerGroup = new THREE.Group()
  pointerGroup.add(north, south, pivot)
  pointerGroup.position.z = 0.118
  pointerGroup.renderOrder = 9
  disposables.push(northGeometry, southGeometry, northMaterial, southMaterial, pivotGeometry, pivotMaterial)
  rootGroup?.add(pointerGroup)
}

function applySpread(value: number) {
  let ringIndex = 0
  rings.forEach((ring, id) => {
    const offset = (ringIndex - 2) * value * 0.13
    ring.group.position.z = offset
    ring.group.rotation.x = offset * 0.24
    ring.group.visible = props.visibleRings.includes(id)
    ringIndex += 1
  })

  if (pointerGroup) pointerGroup.position.z = 0.12 + value * 0.03
}

function applyRingVisibility() {
  rings.forEach((ring, id) => {
    ring.group.visible = props.visibleRings.includes(id)
  })
}

function resize() {
  const container = sceneRef.value
  if (!container || !renderer) return
  const width = container.clientWidth
  const height = container.clientHeight
  if (!width || !height) return
  renderer.setSize(width, height)

  if (sceneCamera) {
    sceneCamera.aspect = width / height
    sceneCamera.updateProjectionMatrix()
  }
}

function createScene() {
  const container = sceneRef.value
  if (!container) return
  sceneListeners.forEach(remove => remove())
  sceneListeners.length = 0
  const width = container.clientWidth
  const height = Math.max(container.clientHeight, 1)
  sceneCamera = new THREE.PerspectiveCamera(34, width / height, 0.1, 20)
  sceneCamera.position.set(0, 0.28, props.variant === 'showcase' ? 7.1 : 6.5)
  sceneCamera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: window.devicePixelRatio < 2,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.add(new THREE.AmbientLight(0xfff2d8, 1.15))
  const keyLight = new THREE.DirectionalLight(0xffe9bd, 1.5)
  keyLight.position.set(2.4, 3.4, 3.2)
  const fillLight = new THREE.DirectionalLight(0x8fb3a4, 0.38)
  fillLight.position.set(-3, 1.2, 1.8)
  scene.add(keyLight, fillLight)

  rootGroup = new THREE.Group()
  rootGroup.rotation.x = props.variant === 'showcase' ? -0.16 : -0.08
  scene.add(rootGroup)

  const bodyGeometry = new THREE.CylinderGeometry(2.24, 2.34, 0.17, 96, 1, false)
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4f3524, roughness: 0.62, metalness: 0.08 })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.rotation.x = Math.PI / 2
  body.position.z = -0.062
  const bezelGeometry = new THREE.TorusGeometry(2.2, 0.065, 12, 96)
  const bezelMaterial = new THREE.MeshStandardMaterial({ color: 0xcfa453, roughness: 0.23, metalness: 0.72 })
  const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial)
  bezel.position.z = 0.032
  disposables.push(bodyGeometry, bodyMaterial, bezelGeometry, bezelMaterial)
  rootGroup.add(body, bezel)

  createRing('trigrams', 0, 0.52, 0.73, TRIGRAMS.map(item => item.label), '#5b3b25')
  createRing('mountains', 1, 0.75, 1.01, TWENTY_FOUR_MOUNTAINS.map(item => item.label), '#7d2016', -7.5)
  createRing('branches', 2, 1.03, 1.28, EARTHLY_BRANCHES.map(item => item.label), '#4c3721')
  createRing('stems', 3, 1.3, 1.52, ['壬癸', '', '甲乙', '', '丙丁', '', '庚辛', ''], '#3f5548')
  createRing('elements', 4, 1.54, 1.82, TRIGRAMS.map(item => item.element), '#41536f')
  addPointer()
  applySpread(0)
  applyRingVisibility()

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) {
    spread = targetSpread
    applySpread(spread)
  }

  const startDrag = (event: PointerEvent) => {
    if (props.variant !== 'showcase' || dragPointerId !== null) return
    dragPointerId = event.pointerId
    dragStartHeading = targetHeading
    dragStartX = event.clientX
  }

  const moveDrag = (event: PointerEvent) => {
    if (event.pointerId !== dragPointerId) return
    targetHeading = normalizeDegrees(dragStartHeading - (event.clientX - dragStartX) * 0.55)
  }

  const endDrag = (event: PointerEvent) => {
    if (event.pointerId === dragPointerId) dragPointerId = null
  }

  container.addEventListener('pointerdown', startDrag)
  window.addEventListener('pointermove', moveDrag)
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  const removeResize = () => {
    resizeObserver?.disconnect()
    resizeObserver = null
  }

  const visibilityHandler = () => {
    documentVisible = !document.hidden
    if (!documentVisible) renderer?.setAnimationLoop(null)
    else if (!disposed) renderer?.setAnimationLoop(tick)
  }
  document.addEventListener('visibilitychange', visibilityHandler)
  const removeVisibility = () => document.removeEventListener('visibilitychange', visibilityHandler)
  const removePointer = () => {
    container.removeEventListener('pointerdown', startDrag)
    window.removeEventListener('pointermove', moveDrag)
    window.removeEventListener('pointerup', endDrag)
    window.removeEventListener('pointercancel', endDrag)
  }
  sceneListeners.push(removeResize, removeVisibility, removePointer)

  function tick() {
    if (disposed || !documentVisible || !renderer) return
    const activeCamera = sceneCamera
    if (!activeCamera) return
    const now = performance.now()
    const delta = Math.min((now - lastFrameTime) / 1000, 0.05)
    lastFrameTime = now

    spread += (targetSpread - spread) * Math.min(delta * 4, 1)
    applySpread(spread)

    const responsiveness = props.variant === 'showcase' ? 0.08 : props.status === 'active' ? 0.17 : 0.1
    const headingStep = angularDifference(currentHeading, targetHeading) * Math.min(delta * responsiveness * 60, 0.55)
    currentHeading = normalizeDegrees(currentHeading + headingStep)

    const pulseTarget = props.status === 'calibrating' ? 0.014 : 0
    calibrationPulse += (pulseTarget - calibrationPulse) * Math.min(delta * 3, 1)
    if (rootGroup) {
      const baseTilt = props.variant === 'showcase' ? -0.16 : -0.08
      rootGroup.rotation.x = baseTilt + Math.sin(now * 0.00042) * calibrationPulse
      rootGroup.rotation.y = Math.sin(now * 0.00031) * calibrationPulse * 0.8
      if (props.variant === 'showcase' && dragPointerId === null) {
        currentHeading = normalizeDegrees(currentHeading + delta * 0.7)
        targetHeading = currentHeading
      }
      rootGroup.rotation.z = currentHeading * Math.PI / 180
    }

    renderer.render(scene, activeCamera)
  }

  renderer.setAnimationLoop(tick)
}

function setHeading(sample: LuopanSample) {
  if (props.variant !== 'live') return
  const heading = normalizeDegrees(sample.heading)
  if (!hasHeading) {
    currentHeading = normalizeDegrees(heading + 360)
    hasHeading = true
  }
  targetHeading = heading
}

onMounted(() => {
  createScene()
})

onBeforeUnmount(() => {
  disposed = true
  renderer?.setAnimationLoop(null)
  resizeObserver?.disconnect()
  resizeObserver = null
  sceneListeners.forEach(remove => remove())
  sceneListeners.length = 0
  renderer?.dispose()
  renderer?.domElement.remove()
  renderer = null
  rings.clear()
  pointerGroup = null
  rootGroup = null
  sceneCamera = null
  disposables.forEach(item => item.dispose())
  disposables.length = 0
})

watch(() => props.visibleRings, applyRingVisibility, { deep: true })

watch(() => props.status, (status) => {
  if (status === 'calibrating') targetSpread = 0.2
  else if (status === 'active') targetSpread = 0.07
  else targetSpread = 0.16
}, { immediate: true })

defineExpose({ setHeading })
</script>

<style scoped>
.luopan-scene {
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: pan-y;
}

.luopan-scene.is-showcase {
  cursor: grab;
}

.luopan-scene.is-showcase:active {
  cursor: grabbing;
}

.luopan-scene :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
