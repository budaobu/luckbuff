<template>
  <div
    ref="sceneRef"
    class="today-calendar-scene"
    :class="{ 'is-dragging': dragging, 'is-disabled': disabled }"
  >
    <div class="scene-hint">
      <UIcon name="i-lucide-hand" class="w-4 h-4" />
      <span>{{ t('todayAlmanac.tearHint') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import type { TodayAlmanac } from '~/types/today-almanac'

interface Props {
  day: TodayAlmanac | null
  nextDay: TodayAlmanac | null
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ advance: []; settled: [] }>()
const { t, locale } = useI18n()
const sceneRef = ref<HTMLDivElement>()

const dragging = ref(false)
let renderer: THREE.WebGLRenderer | null = null
let resizeObserver: ResizeObserver | null = null
let animationFrame: number | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let calendarGroup: THREE.Group | null = null
let frontPivot: THREE.Group | null = null
let frontMaterial: THREE.MeshStandardMaterial | null = null
let rearMaterial: THREE.MeshStandardMaterial | null = null
let frontTexture: THREE.CanvasTexture | null = null
let rearTexture: THREE.CanvasTexture | null = null
let frontGeometry: THREE.PlaneGeometry | null = null
let remnantMaterial: THREE.MeshStandardMaterial | null = null
let tearBottomMask: THREE.CanvasTexture | null = null
let tearTopMask: THREE.CanvasTexture | null = null
let frontTextureKey = ''
let rearTextureKey = ''
let pointerId: number | null = null
let dragStartY = 0
let progress = 0
let targetProgress = 0
let fallProgress = 0
let phase: 'idle' | 'falling' = 'idle'
let fallStart = 0
const disposables: Array<{ dispose: () => void }> = []

const weekdayLabels = computed(() => locale.value === 'en'
  ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'])

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function createCanvasTexture(day: TodayAlmanac | null) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1440
  drawAlmanacPage(canvas, day)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() ?? 4, 4)
  disposables.push(texture)
  return texture
}

function createTearMasks() {
  const path: number[] = []
  const segments = 36
  for (let i = 0; i <= segments; i += 1) {
    const base = 78 + Math.sin(i * 1.4) * 8
    path.push(base + Math.random() * 34)
  }

  const createMaskCanvas = (visibleTop: boolean) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1440
    const context = canvas.getContext('2d')
    if (!context) return canvas

    context.fillStyle = visibleTop ? '#ffffff' : '#000000'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = visibleTop ? '#000000' : '#ffffff'
    context.beginPath()
    context.moveTo(0, path[0]!)
    path.forEach((y, index) => {
      context.lineTo((index / segments) * canvas.width, y)
    })
    context.lineTo(canvas.width, canvas.height)
    context.lineTo(0, canvas.height)
    context.closePath()
    context.fill()

    context.strokeStyle = visibleTop ? '#000000' : '#ffffff'
    context.lineWidth = 5
    context.lineCap = 'round'
    for (let i = 0; i < 180; i += 1) {
      const x = Math.random() * canvas.width
      const nearest = path[Math.round((x / canvas.width) * segments)] ?? 96
      const y = nearest + (visibleTop ? -1 : 1) * (Math.random() * 18)
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x + (Math.random() - 0.5) * 10, y + (visibleTop ? 1 : -1) * Math.random() * 16)
      context.stroke()
    }
    return canvas
  }

  const bottomTexture = new THREE.CanvasTexture(createMaskCanvas(false))
  const topTexture = new THREE.CanvasTexture(createMaskCanvas(true))
  bottomTexture.colorSpace = THREE.NoColorSpace
  topTexture.colorSpace = THREE.NoColorSpace
  disposables.push(bottomTexture, topTexture)
  tearBottomMask = bottomTexture
  tearTopMask = topTexture
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 2) {
  const lines: string[] = []
  let current = ''
  for (const char of text) {
    if (context.measureText(current + char).width > maxWidth) {
      lines.push(current)
      current = char
      if (lines.length === maxLines) break
    }
    else {
      current += char
    }
  }
  if (lines.length < maxLines && current) lines.push(current)
  if (lines.length === maxLines && current && lines[maxLines - 1] !== current) {
    lines[maxLines - 1] = `${lines[maxLines - 1]!.slice(0, -1)}…`
  }
  return lines
}

function drawAlmanacPage(canvas: HTMLCanvasElement, day: TodayAlmanac | null) {
  const context = canvas.getContext('2d')
  if (!context) return
  const serif = '"Noto Serif SC", "Songti SC", "SimSun", serif'
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#fffdf4'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.globalAlpha = 0.028
  for (let i = 0; i < 180; i += 1) {
    context.fillStyle = i % 3 === 0 ? '#6b553d' : '#9a7c55'
    context.beginPath()
    context.arc((i * 137) % canvas.width, (i * 271) % canvas.height, i % 4 === 0 ? 1.4 : 0.8, 0, Math.PI * 2)
    context.fill()
  }
  context.globalAlpha = 1

  context.fillStyle = '#8b2b25'
  context.fillRect(0, 0, canvas.width, 176)
  context.fillStyle = 'rgba(255,255,255,0.16)'
  context.fillRect(0, 156, canvas.width, 20)

  context.fillStyle = '#fffdf4'
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.font = `500 38px ${serif}`
  context.fillText(t('todayAlmanac.title'), 56, 66)

  context.font = `700 66px ${serif}`
  context.fillText(day?.date.replace(/-/g, ' / ') || '---- / -- / --', 54, 126)
  context.textAlign = 'right'
  context.font = `400 32px ${serif}`
  context.fillText(weekdayLabels.value[day?.weekday ?? 0] || '', canvas.width - 54, 126)

  for (const holeX of [150, 874]) {
    context.fillStyle = '#fffdf4'
    context.beginPath()
    context.arc(holeX, 54, 16, 0, Math.PI * 2)
    context.fill()
    context.strokeStyle = 'rgba(70,45,25,0.28)'
    context.lineWidth = 3
    context.stroke()
  }

  context.textAlign = 'center'
  context.fillStyle = '#8b2b25'
  context.font = `700 132px ${serif}`
  const lunarLabel = day ? `${day.lunar.monthInChinese}月${day.lunar.dayInChinese}` : '—'
  context.fillText(lunarLabel, canvas.width / 2, 278)

  context.fillStyle = '#544431'
  context.font = `500 34px ${serif}`
  const ganzhi = day ? `${day.lunar.yearGanZhi}年 · ${day.lunar.monthGanZhi}月 · ${day.lunar.dayGanZhi}日` : ''
  context.fillText(ganzhi, canvas.width / 2, 362)

  context.fillStyle = '#7a6a52'
  context.font = `400 28px ${serif}`
  const jianChuLabel = day ? `${t('todayAlmanac.jianChu')} ${day.jianChu} · ${day.tianShen} ${day.tianShenLuck} · ${t('todayAlmanac.nineStar')} ${day.nineStar}` : ''
  context.fillText(jianChuLabel, canvas.width / 2, 412)

  const columns: Array<{ title: string; values: string[]; ink: string; edge: string }> = [
    { title: t('todayAlmanac.yi'), values: day?.yi.slice(0, 4) || [], ink: '#2f6a45', edge: 'rgba(47,106,69,.3)' },
    { title: t('todayAlmanac.ji'), values: day?.ji.slice(0, 4) || [], ink: '#9a3428', edge: 'rgba(154,52,40,.3)' },
  ]
  columns.forEach((column, columnIndex) => {
    const x = 74 + columnIndex * 458
    const width = 418
    context.strokeStyle = column.edge
    context.lineWidth = 3
    context.strokeRect(x, 466, width, 292)
    context.fillStyle = column.ink
    context.font = `700 42px ${serif}`
    context.fillText(column.title, x + width / 2, 524)
    context.font = `400 30px ${serif}`
    column.values.forEach((value, valueIndex) => {
      const text = `${valueIndex + 1}. ${value}`
      const lines = wrapText(context, text, width - 44, 1)
      context.fillText(lines[0] || '', x + width / 2, 596 + valueIndex * 38)
    })
  })

  context.fillStyle = '#544431'
  context.font = `700 34px ${serif}`
  context.textAlign = 'left'
  context.fillText(t('todayAlmanac.luckyHours'), 78, 836)
  context.textAlign = 'right'
  context.fillText(t('todayAlmanac.directions'), canvas.width - 78, 836)

  context.font = `400 27px ${serif}`
  context.textAlign = 'left'
  const luckyHours = day?.hours.filter(hour => hour.luck === '吉').slice(0, 3) || []
  luckyHours.forEach((hour, index) => {
    context.fillText(`${hour.startTime}-${hour.endTime} ${hour.tianShen}`, 78, 892 + index * 38)
  })

  const directions = day
    ? [
        `${t('todayAlmanac.xiDirection')} ${day.positions.xi}`,
        `${t('todayAlmanac.caiDirection')} ${day.positions.cai}`,
        `${t('todayAlmanac.fuDirection')} ${day.positions.fu}`,
      ]
    : []
  context.textAlign = 'right'
  directions.forEach((value, index) => {
    context.fillText(value, canvas.width - 78, 892 + index * 38)
  })

  context.beginPath()
  context.strokeStyle = 'rgba(123,102,73,.24)'
  context.lineWidth = 2
  context.moveTo(72, 1028)
  context.lineTo(canvas.width - 72, 1028)
  context.stroke()

  context.textAlign = 'left'
  context.fillStyle = '#6a5842'
  context.font = `400 25px ${serif}`
  if (day) {
    context.fillText(`${t('todayAlmanac.chongSha')} ${day.chongDesc} · ${day.sha}`, 76, 1084)
    context.fillText(`${t('todayAlmanac.luckyColor')} ${day.colors.daJi.colors.join(' / ')}`, 76, 1132)
    context.fillText(`${t('todayAlmanac.avoidColor')} ${day.colors.buYi.colors.join(' / ')}`, 76, 1180)
    context.fillText(`${t('todayAlmanac.jieQi')} ${day.season.jieQi || day.season.nextJieQi.name} · ${day.season.wuHou}`, 76, 1228)
    if (day.festivals.length) {
      context.fillText(day.festivals.slice(0, 2).join(' · '), 76, 1276)
    }
  }

  context.textAlign = 'right'
  context.fillStyle = 'rgba(107,85,61,.55)'
  context.font = `500 22px ${serif}`
  context.fillText('ososn', canvas.width - 76, 1352)
}

function setTexture(texture: THREE.CanvasTexture | null, material: THREE.MeshStandardMaterial | null) {
  if (!material) return
  material.map = texture
  material.needsUpdate = true
}

function prepareTearMaterials() {
  if (!frontMaterial || !remnantMaterial) return
  if (!tearBottomMask || !tearTopMask) createTearMasks()
  frontMaterial.alphaMap = tearBottomMask
  frontMaterial.alphaTest = 0.08
  frontMaterial.needsUpdate = true

  remnantMaterial.map = frontTexture
  remnantMaterial.alphaMap = tearTopMask
  remnantMaterial.alphaTest = 0.08
  remnantMaterial.opacity = 1
  remnantMaterial.visible = true
  remnantMaterial.needsUpdate = true
}

function clearTearMaterials() {
  if (frontMaterial) {
    frontMaterial.alphaMap = null
    frontMaterial.alphaTest = 0
    frontMaterial.needsUpdate = true
  }
  if (remnantMaterial) {
    remnantMaterial.visible = false
    remnantMaterial.opacity = 0
  }
}

function updateTextures() {
  const dayKey = props.day?.date || ''
  const nextKey = props.nextDay?.date || ''
  if (dayKey !== frontTextureKey) {
    frontTexture = createCanvasTexture(props.day)
    frontTextureKey = dayKey
    setTexture(frontTexture, frontMaterial)
  }
  if (nextKey !== rearTextureKey) {
    rearTexture = createCanvasTexture(props.nextDay)
    rearTextureKey = nextKey
    setTexture(rearTexture, rearMaterial)
  }
}

function applyPageTransform() {
  if (!frontPivot || !frontGeometry || !frontMaterial) return
  const position = frontGeometry.attributes.position
  if (!position) return
  const crumple = phase === 'falling' ? 0.55 + fallProgress * 0.75 : progress
  for (let i = 0; i < position.count; i += 1) {
    const normalizedY = (position.getY(i) + 3.05) / 6.1
    const x = position.getX(i)
    const bend = Math.sin(normalizedY * Math.PI) * progress * 0.22
    const ripple = Math.sin(x * 3.1 + normalizedY * 8.4) * crumple * 0.05
      + Math.sin(x * 7.6 - normalizedY * 5.2) * (phase === 'falling' ? fallProgress : progress) * 0.035
    position.setZ(i, bend + ripple)
  }
  position.needsUpdate = true
  frontGeometry.computeVertexNormals()

  const tearRotation = phase === 'falling' ? 0.38 + fallProgress * 0.24 : progress * 0.38
  frontPivot.rotation.x = -tearRotation
  frontPivot.rotation.z = phase === 'falling' ? 0.025 + fallProgress * 0.17 : progress * -0.012
  frontPivot.position.y = phase === 'falling' ? 3.05 - fallProgress * 4.2 : 3.05
  frontPivot.position.z = phase === 'falling' ? 0.018 + fallProgress * 1.1 : 0.018
  frontPivot.scale.setScalar(phase === 'falling' ? 1 + fallProgress * 0.015 : 1)
  frontMaterial.opacity = phase === 'falling' ? clamp(1 - fallProgress * 0.92, 0, 1) : 1
  if (remnantMaterial) {
    remnantMaterial.opacity = phase === 'falling'
      ? clamp(1 - Math.max(0, fallProgress - 0.24) * 1.85, 0, 1)
      : 0
    remnantMaterial.visible = phase === 'falling' && remnantMaterial.opacity > 0.01
  }
  if (calendarGroup) {
    calendarGroup.rotation.z = phase === 'falling' ? fallProgress * 0.04 : progress * -0.015
  }
}

function resetPage() {
  phase = 'idle'
  progress = 0
  targetProgress = 0
  fallProgress = 0
  clearTearMaterials()
  applyPageTransform()
}

function startTear(): boolean {
  if (phase !== 'idle' || !props.day || !props.nextDay) return false
  pointerId = null
  progress = 0.54
  targetProgress = 0.54
  release(true)
  return true
}

function release(tear: boolean) {
  if (pointerId !== null && sceneRef.value?.hasPointerCapture(pointerId)) {
    sceneRef.value.releasePointerCapture(pointerId)
  }
  pointerId = null
  dragging.value = false
  if (tear || progress > 0.54) {
    prepareTearMaterials()
    phase = 'falling'
    fallStart = performance.now()
    emit('advance')
  }
  else {
    targetProgress = 0
  }
}

function onPointerDown(event: PointerEvent) {
  const container = sceneRef.value
  if (!container || props.disabled || phase !== 'idle' || !props.day || !props.nextDay) return
  pointerId = event.pointerId
  dragStartY = event.clientY
  dragging.value = true
  container.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== pointerId || phase !== 'idle') return
  const container = sceneRef.value
  if (!container) return
  const distance = event.clientY - dragStartY
  progress = clamp(progress + distance * 0.0022, 0, 1)
  dragStartY = event.clientY
  targetProgress = progress
  if (progress > 0.58) release(true)
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== pointerId) return
  release(false)
}

function resize() {
  const container = sceneRef.value
  if (!container || !renderer || !camera) return
  const width = container.clientWidth
  const height = container.clientHeight
  if (!width || !height) return
  renderer.setSize(width, height)
  camera.aspect = width / height
  const aspect = width / height
  camera.position.set(0, 0.12, aspect < 0.62 ? 14.0 : aspect < 1 ? 13.6 : 13.1)
  calendarGroup?.scale.setScalar(aspect < 0.62 ? 0.82 : 1)
  camera.updateProjectionMatrix()
}

function createScene() {
  const container = sceneRef.value
  if (!container) return
  const width = container.clientWidth
  const height = Math.max(container.clientHeight, 1)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50)
  camera.position.set(0, 0.12, 9.6)
  camera.lookAt(0, 0, 0)

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

  scene.add(new THREE.AmbientLight(0xfff4df, 1.2))
  const key = new THREE.DirectionalLight(0xffeccd, 1.45)
  key.position.set(2.8, 3.5, 4)
  const fill = new THREE.DirectionalLight(0x8aa392, 0.32)
  fill.position.set(-3.5, 0.8, 2)
  scene.add(key, fill)

  calendarGroup = new THREE.Group()
  calendarGroup.rotation.set(-0.065, -0.045, 0)
  scene.add(calendarGroup)

  const boardGeometry = new THREE.BoxGeometry(4.78, 6.7, 0.17)
  const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x4b3424, roughness: 0.64, metalness: 0.08 })
  const board = new THREE.Mesh(boardGeometry, boardMaterial)
  board.position.z = -0.13
  calendarGroup.add(board)

  const railGeometry = new THREE.CylinderGeometry(0.13, 0.13, 5.15, 48)
  const railMaterial = new THREE.MeshStandardMaterial({ color: 0xb78546, roughness: 0.23, metalness: 0.74 })
  const rail = new THREE.Mesh(railGeometry, railMaterial)
  rail.rotation.z = Math.PI / 2
  rail.position.set(0, 3.42, 0.09)
  calendarGroup.add(rail)

  for (const ringX of [-1.92, 1.92]) {
    const ringGeometry = new THREE.TorusGeometry(0.12, 0.035, 10, 36)
    const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xd9b166, roughness: 0.2, metalness: 0.78 })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.position.set(ringX, 3.3, 0.06)
    calendarGroup.add(ring)
    disposables.push(ringGeometry, ringMaterial)
  }

  const sheetGeometry = new THREE.PlaneGeometry(4.4, 6.1)
  const stackOffsets = [
    { y: -0.045, z: -0.055, rotation: 0.006 },
    { y: -0.03, z: -0.04, rotation: -0.004 },
    { y: -0.015, z: -0.025, rotation: 0.003 },
  ]
  stackOffsets.forEach((offset) => {
    const material = new THREE.MeshStandardMaterial({ color: 0xf4ecd8, roughness: 0.82, side: THREE.DoubleSide })
    const sheet = new THREE.Mesh(sheetGeometry, material)
    sheet.position.set(0, offset.y, offset.z)
    sheet.rotation.z = offset.rotation
    calendarGroup?.add(sheet)
    disposables.push(material)
  })

  const rearPivot = new THREE.Group()
  rearPivot.position.set(0, 3.05, -0.015)
  rearMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.76,
    metalness: 0.02,
    side: THREE.DoubleSide,
  })
  const rearSheet = new THREE.Mesh(sheetGeometry, rearMaterial)
  rearSheet.position.y = -3.05
  rearPivot.add(rearSheet)
  calendarGroup.add(rearPivot)

  frontPivot = new THREE.Group()
  frontPivot.position.set(0, 3.05, 0.018)
  frontMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
    metalness: 0.02,
    side: THREE.DoubleSide,
    transparent: true,
  })
  frontGeometry = new THREE.PlaneGeometry(4.4, 6.1, 20, 10)
  const frontSheet = new THREE.Mesh(frontGeometry, frontMaterial)
  frontSheet.position.y = -3.05
  frontPivot.add(frontSheet)
  calendarGroup.add(frontPivot)

  remnantMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.02,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  })
  remnantMaterial.visible = false
  const remnantSheet = new THREE.Mesh(sheetGeometry, remnantMaterial)
  remnantSheet.position.set(0, 0, 0.016)
  calendarGroup.add(remnantSheet)

  disposables.push(boardGeometry, boardMaterial, railGeometry, railMaterial, sheetGeometry, frontGeometry, frontMaterial, rearMaterial, remnantMaterial)
  updateTextures()
  applyPageTransform()

  container.addEventListener('pointerdown', onPointerDown)
  container.addEventListener('pointermove', onPointerMove)
  container.addEventListener('pointerup', onPointerUp)
  container.addEventListener('pointercancel', onPointerUp)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  resize()
  animate()
}

function animate() {
  const tick = () => {
    if (phase === 'idle') {
      progress += (targetProgress - progress) * 0.14
    }
    else if (phase === 'falling') {
      fallProgress = clamp((performance.now() - fallStart) / 1450, 0, 1)
      if (fallProgress >= 1) {
        resetPage()
        renderer?.render(scene!, camera!)
        emit('settled')
      }
    }
    applyPageTransform()
    renderer?.render(scene!, camera!)
    animationFrame = requestAnimationFrame(tick)
  }
  animationFrame = requestAnimationFrame(tick)
}

watch(() => [props.day?.date, props.nextDay?.date], () => {
  if (phase === 'idle') updateTextures()
})

defineExpose({ startTear })

onMounted(createScene)

onBeforeUnmount(() => {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  sceneRef.value?.removeEventListener('pointerdown', onPointerDown)
  sceneRef.value?.removeEventListener('pointermove', onPointerMove)
  sceneRef.value?.removeEventListener('pointerup', onPointerUp)
  sceneRef.value?.removeEventListener('pointercancel', onPointerUp)
  renderer?.dispose()
  disposables.forEach(item => item.dispose())
  disposables.length = 0
  renderer?.domElement.remove()
})
</script>

<style scoped>
.today-calendar-scene {
  position: relative;
  width: 100%;
  height: min(74vh, 760px);
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

.today-calendar-scene.is-dragging {
  cursor: grabbing;
}

.today-calendar-scene.is-disabled {
  cursor: not-allowed;
}

.today-calendar-scene :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.scene-hint {
  position: absolute;
  right: max(18px, env(safe-area-inset-right));
  bottom: max(18px, env(safe-area-inset-bottom));
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 11px;
  border: 1px solid rgba(255, 253, 244, 0.18);
  border-radius: 999px;
  background: rgba(31, 25, 20, 0.56);
  color: rgba(255, 253, 244, 0.78);
  font-size: 12px;
  pointer-events: none;
}

@media (max-width: 640px) {
  .today-calendar-scene {
    height: min(64vh, 580px);
  }

  .scene-hint {
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .today-calendar-scene {
    cursor: default;
  }
}
</style>
