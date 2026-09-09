<template>
  <div
    ref="sceneRef"
    class="today-calendar-scene"
    :class="{ 'is-dragging': dragging, 'is-disabled': disabled }"
  >
    <div class="scene-hint">
      <UIcon name="i-lucide-hand" class="w-4 h-4" />
      <span>{{ t('todayAlmanac.flipHint') }}</span>
    </div>

    <div ref="menuRef" class="scene-menu">
      <button
        type="button"
        class="menu-trigger"
        :aria-expanded="menuOpen"
        :disabled="disabled"
        @click.stop="menuOpen = !menuOpen"
        @pointerdown.stop
      >
        <UIcon name="i-lucide-book-open" class="w-4 h-4" />
        <span>{{ t('todayAlmanac.pageMenu') }}</span>
      </button>

      <Transition name="menu-pop">
        <div v-if="menuOpen" class="menu-panel" role="menu" @pointerdown.stop>
          <button
            type="button"
            role="menuitem"
            :disabled="disabled || !day || !nextDay"
            @click.stop="startFlip('left')"
          >
            <UIcon name="i-lucide-corner-up-left" class="w-4 h-4" />
            {{ t('todayAlmanac.flipLeft') }}
          </button>
          <button
            type="button"
            role="menuitem"
            :disabled="disabled"
            @click.stop="backToToday"
          >
            <UIcon name="i-lucide-calendar-check" class="w-4 h-4" />
            {{ t('todayAlmanac.backToday') }}
          </button>
          <button
            type="button"
            role="menuitem"
            :disabled="disabled || !day || !nextDay"
            @click.stop="startFlip('right')"
          >
            <UIcon name="i-lucide-corner-up-right" class="w-4 h-4" />
            {{ t('todayAlmanac.flipRight') }}
          </button>
        </div>
      </Transition>
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
const emit = defineEmits<{ advance: []; settled: []; today: [] }>()
const { t, locale } = useI18n()
const sceneRef = ref<HTMLDivElement>()
const menuRef = ref<HTMLElement>()

const dragging = ref(false)
const menuOpen = ref(false)

const PAGE_WIDTH = 4.5
const PAGE_HEIGHT = 6.2
const PAGE_PIVOT_Y = PAGE_HEIGHT / 2
const CANVAS_WIDTH = 1400
const CANVAS_HEIGHT = 1960

let renderer: THREE.WebGLRenderer | null = null
let resizeObserver: ResizeObserver | null = null
let animationFrame: number | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let calendarGroup: THREE.Group | null = null
let frontPivot: THREE.Group | null = null
let frontMaterial: THREE.MeshStandardMaterial | null = null
let rearMaterial: THREE.MeshStandardMaterial | null = null
let remnantMaterial: THREE.MeshStandardMaterial | null = null
let frontGeometry: THREE.PlaneGeometry | null = null
let basePagePositions: Float32Array | null = null
let paperBumpTexture: THREE.CanvasTexture | null = null
let frontTexture: THREE.CanvasTexture | null = null
let rearTexture: THREE.CanvasTexture | null = null
let frontTextureKey = ''
let rearTextureKey = ''
let tearBottomMask: THREE.CanvasTexture | null = null
let tearTopMask: THREE.CanvasTexture | null = null
let pointerId: number | null = null
let pointerStartY = 0
let pointerLastY = 0
let flip = 0
let flipTarget = 0
let flipSide: 'left' | 'right' = 'right'
let commitFlip = false
let phase: 'idle' | 'turning' = 'idle'
let startTime = performance.now()
const disposables: Array<{ dispose: () => void }> = []

const weekdayLabels = computed(() => locale.value === 'en'
  ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'])

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function createPaperBumpTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')
  if (!context) return null

  context.fillStyle = '#808080'
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < 5200; i += 1) {
    const gray = 112 + Math.random() * 62
    context.fillStyle = `rgb(${gray},${gray},${gray})`
    context.globalAlpha = Math.random() * 0.42
    context.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3.2, Math.random() * 2.1)
  }
  context.globalAlpha = 1

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 4)
  texture.colorSpace = THREE.NoColorSpace
  disposables.push(texture)
  return texture
}

function createRollTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) return null

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#e5d7b8')
  gradient.addColorStop(0.32, '#fffdf4')
  gradient.addColorStop(0.62, '#f3ead4')
  gradient.addColorStop(1, '#c8b58e')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 1500; i += 1) {
    context.globalAlpha = Math.random() * 0.07
    context.fillStyle = Math.random() > 0.85 ? '#8b2b25' : '#725d3d'
    context.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 22, 1)
  }
  context.globalAlpha = 1

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  disposables.push(texture)
  return texture
}

function createCanvasTexture(day: TodayAlmanac | null) {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  drawAlmanacPage(canvas, day)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() ?? 4, 4)
  disposables.push(texture)
  return texture
}

function createTearMasks() {
  const segments = 48
  const path: number[] = []
  for (let i = 0; i <= segments; i += 1) {
    const base = 108 + Math.sin(i * 0.9) * 13
    path.push(base + Math.random() * 36)
  }

  const createMaskCanvas = (visibleTop: boolean) => {
    const canvas = document.createElement('canvas')
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    const context = canvas.getContext('2d')
    if (!context) return canvas

    context.fillStyle = visibleTop ? '#ffffff' : '#000000'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = visibleTop ? '#000000' : '#ffffff'
    context.beginPath()
    context.moveTo(0, path[0]!)
    path.forEach((y, index) => context.lineTo((index / segments) * canvas.width, y))
    context.lineTo(canvas.width, canvas.height)
    context.lineTo(0, canvas.height)
    context.closePath()
    context.fill()

    context.strokeStyle = visibleTop ? '#000000' : '#ffffff'
    context.lineWidth = 6
    context.lineCap = 'round'
    for (let i = 0; i < 240; i += 1) {
      const x = Math.random() * canvas.width
      const nearest = path[Math.round((x / canvas.width) * segments)] ?? 120
      const y = nearest + (visibleTop ? -1 : 1) * Math.random() * 24
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x + (Math.random() - 0.5) * 14, y + (visibleTop ? 1 : -1) * Math.random() * 22)
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

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 3) {
  const lines: string[] = []
  let current = ''
  for (const char of text) {
    if (context.measureText(current + char).width > maxWidth && current) {
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
    let last = lines[maxLines - 1] ?? ''
    while (last && context.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1)
      lines[maxLines - 1] = last
    }
    lines[maxLines - 1] = `${lines[maxLines - 1]}…`
  }
  return lines
}

function drawPaper(context: CanvasRenderingContext2D) {
  context.fillStyle = '#fffdf4'
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  for (let i = 0; i < 2600; i += 1) {
    context.globalAlpha = Math.random() * 0.035
    context.fillStyle = i % 4 === 0 ? '#9a7c55' : '#6b553d'
    context.fillRect(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, Math.random() * 4, Math.random() * 2)
  }

  for (let i = 0; i < 10; i += 1) {
    const x = Math.random() * CANVAS_WIDTH
    const y = Math.random() * CANVAS_HEIGHT
    const radius = 30 + Math.random() * 100
    const stain = context.createRadialGradient(x, y, 0, x, y, radius)
    stain.addColorStop(0, 'rgba(150,120,70,0.035)')
    stain.addColorStop(1, 'rgba(150,120,70,0)')
    context.globalAlpha = 1
    context.fillStyle = stain
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
  context.globalAlpha = 1
}

function drawCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  lines: string[],
  accent: string,
) {
  context.strokeStyle = accent
  context.lineWidth = 5
  context.strokeRect(x, y, width, height)
  context.lineWidth = 1.5
  context.strokeRect(x + 9, y + 9, width - 18, height - 18)

  context.fillStyle = accent
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '700 37px "Noto Serif SC", "Songti SC", "SimSun", serif'
  context.fillText(title, x + width / 2, y + 48)
  context.strokeStyle = `${accent}55`
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(x + 32, y + 80)
  context.lineTo(x + width - 32, y + 80)
  context.stroke()

  context.fillStyle = '#4b3a29'
  context.font = '400 25px "Noto Sans SC", ui-sans-serif, sans-serif'
  lines.forEach((line, index) => {
    const wrapped = wrapText(context, line, width - 45, 2)
    wrapped.forEach((text, lineIndex) => {
      context.fillText(text, x + width / 2, y + 118 + index * 54 + lineIndex * 29)
    })
  })
}

function drawVerticalText(context: CanvasRenderingContext2D, text: string, x: number, startY: number, color: string) {
  context.fillStyle = color
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '600 36px "Noto Serif SC", "Songti SC", "SimSun", serif'
  Array.from(text).forEach((char, index) => context.fillText(char, x, startY + index * 47))
}

function drawAlmanacPage(canvas: HTMLCanvasElement, day: TodayAlmanac | null) {
  const context = canvas.getContext('2d')
  if (!context) return
  drawPaper(context)
  const crimson = '#b4231d'
  const green = '#256d47'
  const ink = '#4b3a29'
  const softInk = 'rgba(75,58,41,.72)'

  // Reference-style folio frame.
  context.strokeStyle = crimson
  context.lineWidth = 12
  context.strokeRect(28, 26, CANVAS_WIDTH - 56, CANVAS_HEIGHT - 52)
  context.lineWidth = 2
  context.strokeRect(56, 54, CANVAS_WIDTH - 112, CANVAS_HEIGHT - 108)
  context.lineWidth = 4
  context.strokeRect(74, 72, CANVAS_WIDTH - 148, CANVAS_HEIGHT - 144)

  // Header: solar month + year in a formal plaque.
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = crimson
  context.font = '500 31px "Noto Serif SC", "Songti SC", serif'
  context.fillText('·ososn·', CANVAS_WIDTH / 2, 110)
  context.font = '700 92px "Noto Serif SC", "Songti SC", serif'
  const solarMonth = day
    ? new Date(`${day.date}T12:00:00Z`).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'zh-CN', { month: 'long' }).toUpperCase()
    : '———'
  context.fillText(`${solarMonth} ${day?.date.slice(0, 4) ?? ''}`, CANVAS_WIDTH / 2, 194)
  context.font = '600 42px "Noto Serif SC", "Songti SC", serif'
  context.fillText(day ? `农历${day.lunar.monthInChinese}月` : '', CANVAS_WIDTH / 2, 266)
  context.strokeStyle = 'rgba(180,35,29,.48)'
  context.lineWidth = 4
  context.beginPath()
  context.moveTo(112, 316)
  context.lineTo(CANVAS_WIDTH - 112, 316)
  context.stroke()

  // Vertical side notes, like printed couplets on an old tear-off calendar.
  if (day) {
    drawVerticalText(context, `喜神${day.positions.xi}`, 134, 430, green)
    drawVerticalText(context, `财神${day.positions.cai}`, 184, 430, ink)
    drawVerticalText(context, `福神${day.positions.fu}`, CANVAS_WIDTH - 134, 430, green)
    drawVerticalText(context, `阳贵${day.positions.yangGui}`, CANVAS_WIDTH - 184, 430, ink)
  }

  // Giant solar day number is the dominant glyph.
  const solarDay = day ? String(Number(day.date.slice(-2))) : '—'
  context.save()
  context.globalAlpha = 0.06
  context.fillStyle = crimson
  context.font = '700 580px "Noto Serif SC", "Songti SC", serif'
  context.fillText(day?.lunar.shengXiao || '', CANVAS_WIDTH / 2, 720)
  context.restore()

  context.fillStyle = crimson
  context.font = `700 ${solarDay.length > 1 ? 540 : 700}px "Noto Serif SC", "Songti SC", serif`
  context.shadowColor = 'rgba(180,35,29,.18)'
  context.shadowBlur = 34
  context.fillText(solarDay, CANVAS_WIDTH / 2, 700)
  context.shadowBlur = 0

  // Central triptych: lunar day, builder star, weekday.
  drawCell(context, 205, 1015, 315, 165, day?.lunar.dayInChinese ? `${day.lunar.dayInChinese}日` : '—', [day ? `${day.lunar.yearGanZhi}年` : ''], crimson)
  drawCell(context, 543, 1015, 315, 165, day?.jianChu || '—', [day ? `${day.tianShen} ${day.tianShenLuck}` : ''], green)
  drawCell(context, 881, 1015, 315, 165, weekdayLabels.value[day?.weekday ?? 0] || '—', [day ? day.lunar.dayGanZhi : ''], crimson)

  // Main 宜 / 忌 block.
  drawCell(
    context,
    92,
    1225,
    585,
    325,
    t('todayAlmanac.yi'),
    (day?.yi.slice(0, 5) || []).map((item, index) => `${index + 1}. ${item}`),
    green,
  )
  drawCell(
    context,
    723,
    1225,
    585,
    325,
    t('todayAlmanac.ji'),
    (day?.ji.slice(0, 5) || []).map((item, index) => `${index + 1}. ${item}`),
    crimson,
  )

  // Three practical columns.
  const luckyHours = day?.hours.filter(hour => hour.luck === '吉').slice(0, 3) || []
  drawCell(
    context,
    92,
    1585,
    395,
    240,
    t('todayAlmanac.luckyHours'),
    luckyHours.map(hour => `${hour.startTime} ${hour.tianShen}`),
    green,
  )
  drawCell(
    context,
    502,
    1585,
    395,
    240,
    t('todayAlmanac.directions'),
    day
      ? [
          `${t('todayAlmanac.xiDirection')} ${day.positions.xi}`,
          `${t('todayAlmanac.caiDirection')} ${day.positions.cai}`,
          `${t('todayAlmanac.fuDirection')} ${day.positions.fu}`,
        ]
      : ['—'],
    crimson,
  )
  drawCell(
    context,
    912,
    1585,
    395,
    240,
    t('todayAlmanac.colorTitle'),
    day
      ? [
          day.colors.daJi.colors.slice(0, 2).join(' '),
          day.colors.buYi.colors.slice(0, 2).join(' '),
        ]
      : ['—'],
    ink,
  )

  // Dense base line, preserving the traditional almanac feel.
  context.textAlign = 'left'
  context.fillStyle = ink
  context.font = '400 25px "Noto Sans SC", ui-sans-serif, sans-serif'
  context.fillText(day ? `${t('todayAlmanac.jiShen')} ${day.jiShen.slice(0, 5).join(' ')}` : '', 92, 1868)
  context.fillText(day ? `${t('todayAlmanac.xiongSha')} ${day.xiongSha.slice(0, 5).join(' ')}` : '', 92, 1904)
  context.textAlign = 'right'
  context.fillText(day ? `${t('todayAlmanac.nineStar')} ${day.nineStar}` : '', CANVAS_WIDTH - 92, 1868)
  context.fillText(day ? day.pengZuGan : '', CANVAS_WIDTH - 92, 1904)
  context.textAlign = 'center'
  context.fillStyle = softInk
  context.font = '500 24px "Noto Sans SC", ui-sans-serif, sans-serif'
  context.fillText(`ososn · ${day?.timezone || 'UTC+8'}`, CANVAS_WIDTH / 2, 1930)
}

function formatDate(date: string) {
  return date.replace(/-/g, ' / ')
}

function setTexture(texture: THREE.CanvasTexture | null, material: THREE.MeshStandardMaterial | null) {
  if (!material) return
  material.map = texture
  material.needsUpdate = true
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

function applyPageTurn(amount: number, side: 'left' | 'right') {
  if (!frontGeometry || !basePagePositions) return
  const position = frontGeometry.attributes.position
  if (!position) return
  const geometryWidth = PAGE_WIDTH - 0.08
  const originX = side === 'left' ? -geometryWidth / 2 : geometryWidth / 2
  const originY = -PAGE_HEIGHT / 2
  const targetX = -originX
  const targetY = PAGE_HEIGHT / 2
  const diagonalX = targetX - originX
  const diagonalY = targetY - originY
  const diagonalLength = Math.hypot(diagonalX, diagonalY)
  const diagonalUX = diagonalX / diagonalLength
  const diagonalUY = diagonalY / diagonalLength
  const perpendicularUX = -diagonalUY
  const perpendicularUY = diagonalUX
  const curlFront = amount * diagonalLength * 1.08
  const radius = PAGE_HEIGHT * (0.16 + amount * 0.09)
  const sideDirection = side === 'left' ? -1 : 1

  for (let i = 0; i < position.count; i += 1) {
    const baseX = basePagePositions[i * 3]!
    const baseY = basePagePositions[(i * 3) + 1]!
    const relativeX = baseX - originX
    const relativeY = baseY - originY
    const alongDiagonal = relativeX * diagonalUX + relativeY * diagonalUY
    const acrossDiagonal = relativeX * perpendicularUX + relativeY * perpendicularUY
    let nextX = baseX
    let nextY = baseY
    let nextZ = Math.sin(baseX * 2.2 + relativeY * 1.6) * 0.005

    if (alongDiagonal < curlFront) {
      const angle = clamp((curlFront - alongDiagonal) / radius, 0, Math.PI * 1.72)
      const rolledDistance = curlFront - Math.sin(angle) * radius
      const lift = (1 - Math.cos(angle)) * radius
      nextX = originX + diagonalUX * rolledDistance + perpendicularUX * acrossDiagonal
      nextY = originY + diagonalUY * rolledDistance + perpendicularUY * acrossDiagonal
      nextZ += lift + Math.sin(angle * 5.4 + baseX * 2.1) * amount * 0.014
    }

    position.setXYZ(i, nextX, nextY, nextZ)
  }
  position.needsUpdate = true
  frontGeometry.computeVertexNormals()

  if (!frontPivot || !frontMaterial) return
  frontPivot.rotation.x = -0.035 - easeInOutCubic(amount) * 1.48
  frontPivot.rotation.z = amount * 0.05 * sideDirection
  frontPivot.rotation.y = amount * 0.045 * sideDirection
  frontPivot.position.z = 0.095 + amount * 0.16
  frontMaterial.opacity = clamp(1 - Math.max(0, amount - 0.92) * 9, 0, 1)

  if (calendarGroup) {
    calendarGroup.rotation.z = amount * 0.018 * sideDirection
    calendarGroup.rotation.y = -0.05 + Math.sin((performance.now() - startTime) * 0.0004) * 0.008
  }
}

function resetPage() {
  phase = 'idle'
  flip = 0
  flipTarget = 0
  commitFlip = false
  applyPageTurn(0, flipSide)
}

function startFlip(side: 'left' | 'right'): boolean {
  if (phase !== 'idle' || !props.day || !props.nextDay) return false
  pointerId = null
  dragging.value = false
  menuOpen.value = false
  flipSide = side
  flipTarget = 1
  commitFlip = true
  phase = 'turning'
  emit('advance')
  return true
}

function backToToday() {
  menuOpen.value = false
  emit('today')
}

function onDocumentPointerDown(event: PointerEvent) {
  if (menuOpen.value && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    menuOpen.value = false
  }
}

function onPointerDown(event: PointerEvent) {
  const container = sceneRef.value
  if (!container || props.disabled || phase !== 'idle' || !props.day) return
  const rect = container.getBoundingClientRect()
  const xRatio = (event.clientX - rect.left) / rect.width
  const yRatio = (event.clientY - rect.top) / rect.height
  if (yRatio < 0.5 || (xRatio > 0.42 && xRatio < 0.58)) return

  flipSide = xRatio <= 0.42 ? 'left' : 'right'
  pointerId = event.pointerId
  pointerStartY = event.clientY
  pointerLastY = event.clientY
  dragging.value = true
  container.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== pointerId || phase !== 'idle') return
  const container = sceneRef.value
  if (!container) return
  const upwardDistance = pointerStartY - event.clientY
  flipTarget = clamp(upwardDistance / (container.clientHeight * 0.42), 0, 0.88)
  pointerLastY = event.clientY
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== pointerId) return
  if (sceneRef.value?.hasPointerCapture(pointerId)) sceneRef.value.releasePointerCapture(pointerId)
  pointerId = null
  dragging.value = false
  if (flipTarget > 0.26) {
    flipTarget = 1
    commitFlip = true
    phase = 'turning'
    emit('advance')
  }
  else {
    flipTarget = 0
  }
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
  camera.position.set(0, 0.08, aspect < 0.62 ? 13.6 : aspect < 1 ? 12.8 : 12.2)
  calendarGroup?.scale.setScalar(aspect < 0.62 ? 0.8 : 1)
  camera.updateProjectionMatrix()
}

function createScene() {
  const container = sceneRef.value
  if (!container) return
  const width = container.clientWidth
  const height = Math.max(container.clientHeight, 1)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50)
  camera.position.set(0, 0.08, 12.2)
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

  scene.add(new THREE.AmbientLight(0xfff4df, 1.16))
  const key = new THREE.DirectionalLight(0xffe9c4, 1.55)
  key.position.set(3.1, 3.8, 4.4)
  const fill = new THREE.DirectionalLight(0xd8e3d2, 0.34)
  fill.position.set(-4, 0.8, 2)
  const rim = new THREE.DirectionalLight(0xffd2a8, 0.28)
  rim.position.set(-2, 2.5, -3)
  scene.add(key, fill, rim)

  paperBumpTexture = createPaperBumpTexture()
  calendarGroup = new THREE.Group()
  calendarGroup.rotation.set(-0.035, -0.05, 0)
  scene.add(calendarGroup)

  const backingGeometry = new THREE.BoxGeometry(PAGE_WIDTH + 0.12, PAGE_HEIGHT + 0.1, 0.035)
  const backingMaterial = new THREE.MeshStandardMaterial({ color: 0x8b2b25, roughness: 0.68 })
  const backing = new THREE.Mesh(backingGeometry, backingMaterial)
  backing.position.z = -0.38
  calendarGroup.add(backing)

  const stackGeometry = new THREE.BoxGeometry(PAGE_WIDTH + 0.05, PAGE_HEIGHT + 0.03, 0.3)
  const stackMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2e8cf,
    roughness: 0.84,
    bumpMap: paperBumpTexture,
    bumpScale: 0.024,
  })
  const stack = new THREE.Mesh(stackGeometry, stackMaterial)
  stack.position.set(0, -0.02, -0.12)
  calendarGroup.add(stack)

  const rollTexture = createRollTexture()
  const rollGeometry = new THREE.CylinderGeometry(0.34, 0.34, PAGE_WIDTH + 0.06, 72, 1, false)
  const rollMaterial = new THREE.MeshStandardMaterial({
    map: rollTexture,
    bumpMap: paperBumpTexture,
    bumpScale: 0.028,
    roughness: 0.76,
  })
  const paperRoll = new THREE.Mesh(rollGeometry, rollMaterial)
  paperRoll.rotation.z = Math.PI / 2
  paperRoll.position.set(0, PAGE_PIVOT_Y + 0.1, 0.045)
  calendarGroup.add(paperRoll)

  const sheetGeometry = new THREE.PlaneGeometry(PAGE_WIDTH - 0.06, PAGE_HEIGHT, 24, 12)
  const rearPivot = new THREE.Group()
  rearPivot.position.set(0, PAGE_PIVOT_Y, 0.048)
  rearMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.82,
    bumpMap: paperBumpTexture,
    bumpScale: 0.015,
    side: THREE.DoubleSide,
  })
  const rearSheet = new THREE.Mesh(sheetGeometry, rearMaterial)
  rearSheet.position.y = -PAGE_PIVOT_Y
  rearPivot.add(rearSheet)
  calendarGroup.add(rearPivot)

  frontPivot = new THREE.Group()
  frontPivot.position.set(0, PAGE_PIVOT_Y, 0.095)
  frontMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.74,
    metalness: 0.01,
    bumpMap: paperBumpTexture,
    bumpScale: 0.022,
    side: THREE.DoubleSide,
    transparent: true,
  })
  frontGeometry = new THREE.PlaneGeometry(PAGE_WIDTH - 0.08, PAGE_HEIGHT, 52, 82)
  const initialPositions = frontGeometry.attributes.position?.array
  if (!initialPositions) throw new Error('Unable to initialize calendar page geometry')
  basePagePositions = Float32Array.from(initialPositions as Float32Array)
  const frontSheet = new THREE.Mesh(frontGeometry, frontMaterial)
  frontSheet.position.y = -PAGE_PIVOT_Y
  frontPivot.add(frontSheet)
  calendarGroup.add(frontPivot)

  remnantMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.75,
    bumpMap: paperBumpTexture,
    bumpScale: 0.018,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  })
  remnantMaterial.visible = false
  const remnantSheet = new THREE.Mesh(sheetGeometry, remnantMaterial)
  remnantSheet.position.set(0, 0, 0.072)
  calendarGroup.add(remnantSheet)

  disposables.push(
    backingGeometry,
    backingMaterial,
    stackGeometry,
    stackMaterial,
    rollGeometry,
    rollMaterial,
    sheetGeometry,
    frontGeometry,
    frontMaterial,
    rearMaterial,
    remnantMaterial,
  )
  updateTextures()
  applyPageTurn(0, flipSide)

  container.addEventListener('pointerdown', onPointerDown)
  container.addEventListener('pointermove', onPointerMove)
  container.addEventListener('pointerup', onPointerUp)
  container.addEventListener('pointercancel', onPointerUp)
  document.addEventListener('pointerdown', onDocumentPointerDown)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  resize()
  animate()
}

function animate() {
  const tick = () => {
    flip += (flipTarget - flip) * (commitFlip ? 0.075 : 0.13)
    applyPageTurn(flip, flipSide)

    if (commitFlip && flip > 0.965) {
      resetPage()
      renderer?.render(scene!, camera!)
      emit('settled')
    }
    else if (!commitFlip && flipTarget === 0 && flip < 0.002) {
      resetPage()
    }

    renderer?.render(scene!, camera!)
    animationFrame = requestAnimationFrame(tick)
  }
  animationFrame = requestAnimationFrame(tick)
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - (-2 * value + 2) ** 3 / 2
}

watch(() => [props.day?.date, props.nextDay?.date], () => {
  if (phase === 'idle') updateTextures()
})

defineExpose({ startFlip })

onMounted(createScene)

onBeforeUnmount(() => {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  sceneRef.value?.removeEventListener('pointerdown', onPointerDown)
  sceneRef.value?.removeEventListener('pointermove', onPointerMove)
  sceneRef.value?.removeEventListener('pointerup', onPointerUp)
  sceneRef.value?.removeEventListener('pointercancel', onPointerUp)
  document.removeEventListener('pointerdown', onDocumentPointerDown)
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
  height: min(76vh, 780px);
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
  left: max(18px, env(safe-area-inset-left));
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

.scene-menu {
  position: absolute;
  right: max(18px, env(safe-area-inset-right));
  bottom: max(18px, env(safe-area-inset-bottom));
  z-index: 2;
}

.menu-trigger,
.menu-panel button {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  border: 1px solid rgba(255, 253, 244, 0.2);
  color: rgba(255, 253, 244, 0.88);
  background: rgba(35, 26, 20, 0.76);
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: border-color 160ms ease, background-color 160ms ease;
}

.menu-trigger {
  justify-content: center;
  gap: 7px;
  padding: 8px 13px;
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
}

.menu-trigger:hover,
.menu-panel button:hover:not(:disabled) {
  border-color: rgba(230, 189, 120, 0.54);
  background: rgba(64, 45, 32, 0.86);
}

.menu-panel {
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid rgba(255, 253, 244, 0.14);
  border-radius: 14px;
  background: rgba(28, 20, 15, 0.88);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.26);
  backdrop-filter: blur(16px);
}

.menu-panel button {
  padding: 11px 14px;
  border-width: 0 0 1px;
  border-color: rgba(255, 253, 244, 0.08);
  border-radius: 0;
  font-size: 13px;
}

.menu-panel button:last-child {
  border-bottom: 0;
}

.menu-panel button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
}

@media (max-width: 640px) {
  .today-calendar-scene {
    height: min(66vh, 600px);
  }

  .scene-hint,
  .menu-trigger {
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .today-calendar-scene {
    cursor: default;
  }
}
</style>
