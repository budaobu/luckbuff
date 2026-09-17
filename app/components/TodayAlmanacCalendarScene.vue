<template>
  <div
    ref="sceneRef"
    class="today-calendar-scene"
    :class="{ 'is-dragging': dragging, 'is-disabled': disabled }"
  >
    <div class="scene-menu">
      <button
        type="button"
        class="back-trigger"
        :disabled="disabled"
        :aria-label="t('todayAlmanac.backToday')"
        @pointerdown.stop
        @click.stop="backToToday"
      >
        <UIcon name="i-lucide-calendar-check" class="w-4 h-4" />
        <span>{{ t('todayAlmanac.backToday') }}</span>
      </button>
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

const dragging = ref(false)

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
let frontMaterial: THREE.MeshPhysicalMaterial | null = null
let rearMaterial: THREE.MeshPhysicalMaterial | null = null
let remnantMaterial: THREE.MeshPhysicalMaterial | null = null
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
  gradient.addColorStop(0, '#d9dad2')
  gradient.addColorStop(0.30, '#fdfdf9')
  gradient.addColorStop(0.62, '#f4f5ee')
  gradient.addColorStop(1, '#cdcfc4')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 1500; i += 1) {
    context.globalAlpha = Math.random() * 0.07
    context.fillStyle = Math.random() > 0.86 ? '#037a4a' : '#8e8a7c'
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
  context.globalAlpha = 1
  context.fillStyle = '#fcfdf8'
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  for (let i = 0; i < 2600; i += 1) {
    context.globalAlpha = Math.random() * 0.022
    context.fillStyle = i % 3 === 0 ? '#c9d2c8' : '#d8ddd3'
    context.fillRect(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, Math.random() * 4, Math.random() * 2)
  }

  for (let i = 0; i < 10; i += 1) {
    const x = Math.random() * CANVAS_WIDTH
    const y = Math.random() * CANVAS_HEIGHT
    const radius = 30 + Math.random() * 100
    const stain = context.createRadialGradient(x, y, 0, x, y, radius)
    stain.addColorStop(0, 'rgba(164,178,166,0.024)')
    stain.addColorStop(1, 'rgba(164,178,166,0)')
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
  const compact = height < 180
  context.fillStyle = 'rgba(255, 255, 252, 0.86)'
  context.fillRect(x, y, width, height)
  context.strokeStyle = accent
  context.lineWidth = 3
  context.strokeRect(x + 1, y + 1, width - 2, height - 2)

  context.strokeStyle = `${accent}9c`
  context.lineWidth = 4
  const mark = compact ? 24 : 34
  context.beginPath()
  context.moveTo(x + 12, y + 12 + mark)
  context.lineTo(x + 12, y + 12)
  context.lineTo(x + 12 + mark, y + 12)
  context.moveTo(x + width - 12 - mark, y + height - 12)
  context.lineTo(x + width - 12, y + height - 12)
  context.lineTo(x + width - 12, y + height - 12 - mark)
  context.stroke()

  context.fillStyle = accent
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `700 ${compact ? 38 : 33}px "Noto Serif SC", "Songti SC", "SimSun", serif`
  context.fillText(title, x + width / 2, compact ? y + 36 : y + 42)
  context.strokeStyle = `${accent}30`
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(x + 30, compact ? y + 62 : y + 70)
  context.lineTo(x + width - 30, compact ? y + 62 : y + 70)
  context.stroke()

  context.fillStyle = '#303430'
  context.font = `400 ${compact ? 34 : 30}px "Noto Sans SC", ui-sans-serif, sans-serif`
  lines.forEach((line, index) => {
    const wrapped = wrapText(context, line, compact ? width - 30 : width - 50, 2)
    wrapped.forEach((text, lineIndex) => {
      const baseY = compact ? y + 92 : y + 114
      const spacing = compact ? 42 : 46
      context.fillText(text, x + width / 2, baseY + index * spacing + lineIndex * (compact ? 33 : 38))
    })
  })
}

function drawTinyPanel(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  subtitle: string,
  color: string,
) {
  context.fillStyle = '#fffefa'
  context.fillRect(x, y, width, height)
  context.strokeStyle = color
  context.lineWidth = 3
  context.strokeRect(x + 1, y + 1, width - 2, height - 2)

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = color
  context.font = '700 54px "Noto Serif SC", "Songti SC", serif'
  context.fillText(title, x + width / 2, y + height / 2 - 30)
  context.fillStyle = '#303430'
  context.font = '400 32px "Noto Sans SC", ui-sans-serif, sans-serif'
  context.fillText(subtitle, x + width / 2, y + height / 2 + 34)
}

function drawHorizontalRegister(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  items: string[],
  accent: string,
) {
  context.fillStyle = 'rgba(255, 255, 252, 0.9)'
  context.fillRect(x, y, width, height)
  context.strokeStyle = accent
  context.lineWidth = 3
  context.strokeRect(x + 1, y + 1, width - 2, height - 2)

  const plaqueWidth = 148
  context.fillStyle = `${accent}14`
  context.fillRect(x + 18, y + 20, plaqueWidth, height - 40)
  context.strokeStyle = `${accent}72`
  context.lineWidth = 2
  context.strokeRect(x + 18, y + 20, plaqueWidth, height - 40)

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = accent
  context.font = '700 54px "Noto Serif SC", "Songti SC", "SimSun", serif'
  context.fillText(title, x + 18 + plaqueWidth / 2, y + height / 2)

  const contentX = x + plaqueWidth + 58
  const contentWidth = x + width - contentX - 42
  let text = items.filter(Boolean).slice(0, 6).join(' · ') || '—'
  let fontSize = 48
  context.fillStyle = '#303430'
  while (fontSize > 26 && context.measureText(text).width > contentWidth) {
    fontSize -= 2
    context.font = `400 ${fontSize}px "Noto Sans SC", ui-sans-serif, sans-serif`
  }

  while (context.measureText(`${text}…`).width > contentWidth && text.length > 1) {
    text = text.slice(0, -1)
  }
  if (text !== items.filter(Boolean).slice(0, 6).join(' · ')) text = `${text}…`

  context.font = `400 ${fontSize}px "Noto Sans SC", ui-sans-serif, sans-serif`
  context.fillText(text, contentX + contentWidth / 2, y + height / 2)
}

function drawAlmanacPage(canvas: HTMLCanvasElement, day: TodayAlmanac | null) {
  const context = canvas.getContext('2d')
  if (!context) return
  drawPaper(context)
  const crimson = '#bf2026'
  const green = '#037a4a'
  const ink = '#303430'

  context.strokeStyle = green
  context.lineWidth = 6
  context.strokeRect(28, 26, CANVAS_WIDTH - 56, CANVAS_HEIGHT - 52)
  context.lineWidth = 2
  context.strokeRect(56, 54, CANVAS_WIDTH - 112, CANVAS_HEIGHT - 108)

  // Month masthead: English solar label, Arabic year and month size.
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = green
  context.font = '600 26px "Noto Sans SC", ui-sans-serif, sans-serif'
  context.fillText('ososn', CANVAS_WIDTH / 2, 96)

  const solarDate = day ? new Date(`${day.date}T12:00:00Z`) : null
  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
  const monthName = monthNames[solarDate?.getUTCMonth() ?? 0] || '———'
  const largeMonths = [1, 3, 5, 7, 8, 10, 12]
  const monthSize = largeMonths.includes((solarDate?.getUTCMonth() ?? 0) + 1) ? '大' : '小'
  const chineseSolarMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const localMonthLabel = locale.value === 'en'
    ? `${monthName} ${monthSize === '大' ? 'LARGE' : 'SMALL'}`
    : `${chineseSolarMonths[solarDate?.getUTCMonth() ?? 0] || '—'}${monthSize}`
  const solarDay = day ? String(Number(day.date.slice(-2))) : '—'

  context.fillStyle = green
  context.font = '700 66px Georgia, "Noto Serif SC", "Songti SC", serif'
  context.fillText(monthName, 310, 176)
  context.font = '800 82px "Arial Black", Arial, "Noto Sans SC", sans-serif'
  context.fillText(day ? day.date.slice(0, 4) : '———', 700, 178)
  context.font = '700 47px "Noto Serif SC", "Songti SC", serif'
  context.fillText(localMonthLabel, 1110, 180)
  context.strokeStyle = `${green}66`
  context.lineWidth = 2
  context.strokeRect(78, 122, CANVAS_WIDTH - 156, 112)

  if (day) {
    const glyphCanvas = document.createElement('canvas')
    glyphCanvas.width = 1180
    glyphCanvas.height = 740
    const glyphContext = glyphCanvas.getContext('2d')
    if (glyphContext) {
      glyphContext.textAlign = 'center'
      glyphContext.textBaseline = 'middle'
      glyphContext.font = `800 ${solarDay.length > 1 ? 610 : 690}px "Arial Black", Arial, "Noto Sans SC", sans-serif`
      glyphContext.fillStyle = green
      glyphContext.fillText(solarDay, glyphCanvas.width / 2, glyphCanvas.height / 2 + 22)
      glyphContext.globalCompositeOperation = 'source-in'
      const glyphGradient = glyphContext.createLinearGradient(0, 70, 0, glyphCanvas.height - 50)
      glyphGradient.addColorStop(0, '#11a363')
      glyphGradient.addColorStop(0.48, '#04794a')
      glyphGradient.addColorStop(1, '#026139')
      glyphContext.fillStyle = glyphGradient
      glyphContext.fillRect(0, 0, glyphCanvas.width, glyphCanvas.height)
      glyphContext.globalCompositeOperation = 'source-atop'
      context.drawImage(glyphCanvas, (CANVAS_WIDTH - glyphCanvas.width) / 2, 258)
    }
  }

  context.textAlign = 'center'
  context.fillStyle = green
  context.font = '700 32px "Noto Serif SC", "Songti SC", serif'
  context.fillText(weekdayLabels.value[day?.weekday ?? 0] || '', CANVAS_WIDTH - 154, 554)
  context.fillText(day ? `农历${day.lunar.monthInChinese}月` : '', 154, 554)

  // Summary row immediately below the numeral.
  drawTinyPanel(context, 80, 1005, 370, 150, day?.lunar.yearGanZhi || '———', t('todayAlmanac.yearGanZhi'), green)
  drawTinyPanel(context, 515, 1005, 370, 150, day?.lunar.monthGanZhi || '———', t('todayAlmanac.monthGanZhi'), green)
  drawTinyPanel(context, 950, 1005, 370, 150, day?.lunar.dayGanZhi || '———', t('todayAlmanac.dayGanZhi'), crimson)

  // One horizontal line each: avoid stacked vertical text.
  drawHorizontalRegister(context, 80, 1190, 1240, 170, t('todayAlmanac.yi'), day?.yi.slice(0, 6) || [], green)
  drawHorizontalRegister(context, 80, 1375, 1240, 170, t('todayAlmanac.ji'), day?.ji.slice(0, 6) || [], crimson)

  // Six supplementary registers, deliberately larger and sparser.
  drawCell(context, 80, 1560, 390, 150, t('todayAlmanac.dayLu'), day ? [day.dayLu || '—'] : ['—'], ink)
  drawCell(context, 505, 1560, 390, 150, t('todayAlmanac.taiShen'), day ? [day.taiShen || '—'] : ['—'], crimson)
  drawCell(
    context,
    930,
    1560,
    390,
    150,
    t('todayAlmanac.nobleHours'),
    day ? [day.nobleHours.map(hour => hour.label).join(' / ') || '—'] : ['—'],
    green,
  )
  drawCell(context, 80, 1730, 390, 150, t('todayAlmanac.chongZodiac'), day ? [day.chongShengXiao || '—'] : ['—'], crimson)
  drawCell(
    context,
    505,
    1730,
    390,
    150,
    t('todayAlmanac.luckyZodiacs'),
    day ? [day.luckyZodiacs.map(item => item.zodiac).join(' ') || '—'] : ['—'],
    green,
  )
  drawCell(
    context,
    930,
    1730,
    390,
    150,
    t('todayAlmanac.luckyNumbers'),
    day ? [day.luckyNumbers.join(' · ') || '—'] : ['—'],
    ink,
  )
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
    frontTexture?.dispose()
    frontTexture = null
    frontTexture = createCanvasTexture(props.day)
    frontTextureKey = dayKey
    setTexture(frontTexture, frontMaterial)
  }
  if (nextKey !== rearTextureKey) {
    rearTexture?.dispose()
    rearTexture = null
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
  flipSide = side
  flipTarget = 1
  commitFlip = true
  phase = 'turning'
  emit('advance')
  return true
}

function backToToday() {
  emit('today')
}

function onPointerDown(event: PointerEvent) {
  const container = sceneRef.value
  if (!container || props.disabled || phase !== 'idle' || !props.day) return
  const rect = container.getBoundingClientRect()
  const xRatio = (event.clientX - rect.left) / rect.width

  flipSide = xRatio < 0.5 ? 'left' : 'right'
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
  camera.position.set(0, 0.34, aspect < 0.62 ? 13.8 : aspect < 1 ? 12.9 : 12.3)
  camera.lookAt(0, -0.08, 0)
  calendarGroup?.scale.setScalar(aspect < 0.62 ? 0.7 : 1)
  camera.updateProjectionMatrix()
}

function createScene() {
  const container = sceneRef.value
  if (!container) return
  const width = container.clientWidth
  const height = Math.max(container.clientHeight, 1)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50)
  camera.position.set(0, 0.34, 12.3)
  camera.lookAt(0, -0.08, 0)

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: window.devicePixelRatio < 2,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 1.14))
  const key = new THREE.DirectionalLight(0xffffff, 1.42)
  key.position.set(3.1, 3.8, 4.4)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 1
  key.shadow.camera.far = 20
  key.shadow.camera.left = -6
  key.shadow.camera.right = 6
  key.shadow.camera.top = 6
  key.shadow.camera.bottom = -6
  key.shadow.bias = -0.0005
  key.shadow.normalBias = 0.015
  const fill = new THREE.DirectionalLight(0xf7f9ff, 0.28)
  fill.position.set(-4, 0.8, 2)
  const rim = new THREE.DirectionalLight(0xfff2e2, 0.22)
  rim.position.set(-2, 2.5, -3)
  scene.add(key, fill, rim)

  const groundGeometry = new THREE.PlaneGeometry(22, 12)
  const groundMaterial = new THREE.ShadowMaterial({ color: 0x39200f, opacity: 0.15 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.set(0, -3.28, 0.06)
  ground.receiveShadow = true
  scene.add(ground)

  paperBumpTexture = createPaperBumpTexture()
  calendarGroup = new THREE.Group()
  calendarGroup.rotation.set(-0.045, -0.09, 0.012)
  scene.add(calendarGroup)

  const backingGeometry = new THREE.BoxGeometry(PAGE_WIDTH + 0.12, PAGE_HEIGHT + 0.1, 0.035)
  const backingMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf6f4ea,
    roughness: 0.58,
    clearcoat: 0.07,
    clearcoatRoughness: 0.55,
  })
  const backing = new THREE.Mesh(backingGeometry, backingMaterial)
  backing.position.z = -0.38
  backing.castShadow = true
  backing.receiveShadow = true
  calendarGroup.add(backing)

  const stackGeometry = new THREE.BoxGeometry(PAGE_WIDTH + 0.10, PAGE_HEIGHT + 0.24, 0.68)
  const stackMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfaf8f1,
    roughness: 0.92,
    sheen: 0.24,
    sheenRoughness: 0.78,
    sheenColor: 0xfff4dc,
    bumpMap: paperBumpTexture,
    bumpScale: 0.024,
  })
  const stack = new THREE.Mesh(stackGeometry, stackMaterial)
  stack.position.set(0, -0.09, -0.34)
  stack.castShadow = true
  stack.receiveShadow = true
  calendarGroup.add(stack)

  const rollTexture = createRollTexture()
  const rollGeometry = new THREE.CylinderGeometry(0.29, 0.29, PAGE_WIDTH + 0.34, 72, 1, false)
  const rollMaterial = new THREE.MeshPhysicalMaterial({
    map: rollTexture,
    bumpMap: paperBumpTexture,
    bumpScale: 0.028,
    roughness: 0.76,
    sheen: 0.2,
    sheenColor: 0xffffff,
  })
  const paperRoll = new THREE.Mesh(rollGeometry, rollMaterial)
  paperRoll.rotation.z = Math.PI / 2
  paperRoll.position.set(0, PAGE_PIVOT_Y + 0.05, 0.035)
  paperRoll.castShadow = true
  calendarGroup.add(paperRoll)

  const sheetGeometry = new THREE.PlaneGeometry(PAGE_WIDTH - 0.06, PAGE_HEIGHT, 24, 12)
  const rearPivot = new THREE.Group()
  rearPivot.position.set(0, PAGE_PIVOT_Y, 0.048)
  rearMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.82,
    sheen: 0.28,
    sheenRoughness: 0.76,
    sheenColor: 0xffffff,
    bumpMap: paperBumpTexture,
    bumpScale: 0.015,
    side: THREE.DoubleSide,
  })
  const rearSheet = new THREE.Mesh(sheetGeometry, rearMaterial)
  rearSheet.position.y = -PAGE_PIVOT_Y
  rearSheet.castShadow = true
  rearSheet.receiveShadow = true
  rearPivot.add(rearSheet)
  calendarGroup.add(rearPivot)

  frontPivot = new THREE.Group()
  frontPivot.position.set(0, PAGE_PIVOT_Y, 0.095)
  frontMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.74,
    metalness: 0.01,
    sheen: 0.34,
    sheenRoughness: 0.68,
    sheenColor: 0xffffff,
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
  frontSheet.castShadow = true
  frontSheet.receiveShadow = true
  frontPivot.add(frontSheet)
  calendarGroup.add(frontPivot)

  remnantMaterial = new THREE.MeshPhysicalMaterial({
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
    groundGeometry,
    groundMaterial,
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

onMounted(() => {
  createScene()
})

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
  height: min(70vh, 690px);
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

.scene-menu {
  position: absolute;
  right: max(18px, env(safe-area-inset-right));
  bottom: max(18px, env(safe-area-inset-bottom));
  z-index: 2;
}

.back-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 13px;
  border: 1px solid rgba(84, 58, 39, 0.16);
  border-radius: 999px;
  color: rgba(63, 45, 31, 0.9);
  background: rgba(255, 250, 238, 0.76);
  backdrop-filter: blur(12px);
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  transition: border-color 160ms ease, background-color 160ms ease;
}

.back-trigger:hover:not(:disabled) {
  border-color: rgba(156, 66, 56, 0.36);
  background: rgba(255, 252, 243, 0.9);
}

.back-trigger:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .today-calendar-scene {
    height: min(62vh, 540px);
  }

  .back-trigger {
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .today-calendar-scene {
    cursor: default;
  }
}
</style>
