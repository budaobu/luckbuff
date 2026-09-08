import { toolCategories } from '~/composables/useToolCategories'

export type SharePosterCategoryId =
  | 'paipan'
  | 'fortune-telling'
  | 'astrology'
  | 'fengshui'
  | 'shuangren-hepan'
  | 'auspicious-datetime'
  | 'seeking'
  | 'naming'
  | 'cezi'
  | 'draw-a-lot'
  | 'psychological-test'
  | 'numeric-energy'
  | 'prophet'

export interface SharePosterContext {
  categoryId: SharePosterCategoryId
  titleKey: string
  descriptionKey: string
  categoryTitleKey: string
}

export interface SharePosterRenderOptions {
  categoryId?: SharePosterCategoryId
  title: string
  subtitle: string
  category: string
  features?: [string, string, string, string]
  url: string
}

const POSTER_WIDTH = 1024
const POSTER_HEIGHT = 1536
const INK = '#27364d'
const GOLD = '#b7892e'
const GOLD_SOFT = 'rgba(183, 137, 46, 0.36)'
const NAVY_SOFT = 'rgba(39, 54, 77, 0.18)'
const PAPER_SOFT = 'rgba(251, 247, 238, 0.84)'

function normalizeSharePath(pathname: string) {
  return pathname
    .replace(/^\/(?:en|zh-TW)(?=\/|$)/, '')
    .replace(/\/$/, '') || '/'
}

export function resolveSharePosterContext(pathname: string): SharePosterContext | null {
  const path = normalizeSharePath(pathname)
  const categories = toolCategories

  for (const category of categories) {
    const tool = category.tools.find(item => item.path === path)
    if (!tool) continue

    return {
      categoryId: category.id as SharePosterCategoryId,
      titleKey: tool.titleKey,
      descriptionKey: tool.descKey,
      categoryTitleKey: category.titleKey,
    }
  }

  return null
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Unable to load ${src}`))
    image.src = src
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const paragraphs = text.split(/\n+/)
  const lines: string[] = []

  for (const paragraph of paragraphs) {
    let current = ''
    for (const char of paragraph) {
      const next = current + char
      if (ctx.measureText(next).width > maxWidth && current) {
        lines.push(current)
        current = char
        if (lines.length === maxLines) break
      }
      else {
        current = next
      }
    }

    if (lines.length === maxLines) break
    if (current) lines.push(current)
  }

  if (lines.length > maxLines) lines.length = maxLines
  if (lines.length === maxLines && lines[maxLines - 1] !== text) {
    let last = lines[maxLines - 1] ?? ''
    while (last && ctx.measureText(`${last}...`).width > maxWidth) {
      last = last.slice(0, -1)
    }
    lines[maxLines - 1] = `${last}...`
  }

  return lines
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number, preferred: number, minimum: number) {
  for (let size = preferred; size >= minimum; size -= 4) {
    ctx.font = `700 ${size}px 'Noto Serif SC', 'Songti SC', 'Times New Roman', serif`
    if (wrapText(ctx, text, maxWidth, maxLines).length <= maxLines) return size
  }
  return minimum
}

function drawCenteredText(ctx: CanvasRenderingContext2D, text: string, centerX: number, y: number, maxWidth: number, maxLines: number, preferred: number, minimum: number, color = INK) {
  const fontSize = fitFont(ctx, text, maxWidth, maxLines, preferred, minimum)
  const lines = wrapText(ctx, text, maxWidth, maxLines)
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  lines.forEach((line, index) => {
    ctx.fillText(line, centerX, y + index * fontSize * 1.16)
  })
  return { fontSize, lineCount: lines.length }
}

function drawKicker(ctx: CanvasRenderingContext2D, text: string, centerX: number, y: number) {
  ctx.font = '500 26px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = GOLD
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(`— ${text} —`, centerX, y)
}

function drawDescription(ctx: CanvasRenderingContext2D, text: string, centerX: number, y: number) {
  ctx.font = '400 29px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
  const lines = wrapText(ctx, text, 780, 3)
  ctx.fillStyle = 'rgba(39, 54, 77, 0.68)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  lines.forEach((line, index) => ctx.fillText(line, centerX, y + index * 44))
}

function drawPaipanMotif(ctx: CanvasRenderingContext2D) {
  const y = 718
  const width = 58
  const height = 148
  const gap = 28
  const total = width * 4 + gap * 3
  let x = (POSTER_WIDTH - total) / 2

  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = i % 2 ? NAVY_SOFT : GOLD_SOFT
    ctx.lineWidth = 2
    roundRect(ctx, x, y, width, height, 14)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x + 12, y + 42)
    ctx.lineTo(x + width - 12, y + 42)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 12, y + height - 34)
    ctx.lineTo(x + width - 12, y + height - 34)
    ctx.stroke()
    x += width + gap
  }
}

function drawOrbitMotif(ctx: CanvasRenderingContext2D) {
  const cx = POSTER_WIDTH / 2
  const cy = 796
  ctx.strokeStyle = GOLD_SOFT
  ctx.lineWidth = 2
  ;[46, 84, 124].forEach((radius) => {
    ctx.beginPath()
    ctx.ellipse(cx, cy, radius * 1.22, radius * 0.72, 0, 0, Math.PI * 2)
    ctx.stroke()
  })

  const planets: Array<[number, number]> = [[cx - 108, cy - 10], [cx + 74, cy - 52], [cx + 20, cy + 58]]
  planets.forEach(([x, y], index) => {
    ctx.fillStyle = index === 1 ? GOLD : 'rgba(39, 54, 77, 0.42)'
    ctx.beginPath()
    ctx.arc(x, y, index === 1 ? 9 : 6, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawCompassMotif(ctx: CanvasRenderingContext2D) {
  const cx = POSTER_WIDTH / 2
  const cy = 792
  const radius = 112
  ctx.strokeStyle = NAVY_SOFT
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2)
  ctx.stroke()

  for (let i = 0; i < 16; i++) {
    const angle = Math.PI * 2 * i / 16
    const inner = radius - (i % 4 === 0 ? 24 : 13)
    ctx.strokeStyle = i % 4 === 0 ? GOLD : NAVY_SOFT
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
    ctx.stroke()
  }
}

function drawTwinMotif(ctx: CanvasRenderingContext2D) {
  const cy = 792
  const left = POSTER_WIDTH / 2 - 52
  const right = POSTER_WIDTH / 2 + 52
  ctx.lineWidth = 2
  ctx.strokeStyle = NAVY_SOFT
  ctx.beginPath()
  ctx.arc(left, cy, 82, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = GOLD_SOFT
  ctx.beginPath()
  ctx.arc(right, cy, 82, 0, Math.PI * 2)
  ctx.stroke()
}

function drawCalendarMotif(ctx: CanvasRenderingContext2D) {
  const x = POSTER_WIDTH / 2 - 145
  const y = 708
  const width = 290
  const height = 172
  ctx.strokeStyle = GOLD_SOFT
  ctx.lineWidth = 2
  roundRect(ctx, x, y, width, height, 18)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, y + 48)
  ctx.lineTo(x + width, y + 48)
  ctx.stroke()

  ctx.fillStyle = 'rgba(39, 54, 77, 0.24)'
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 5; col++) {
      ctx.beginPath()
      ctx.arc(x + 52 + col * 46, y + 88 + row * 48, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawDirectionMotif(ctx: CanvasRenderingContext2D) {
  const cx = POSTER_WIDTH / 2
  const cy = 792
  ctx.strokeStyle = GOLD_SOFT
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, 104, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, cy + 58)
  ctx.lineTo(cx - 27, cy + 12)
  ctx.lineTo(cx, cy - 72)
  ctx.lineTo(cx + 27, cy + 12)
  ctx.closePath()
  ctx.stroke()
}

function drawNameMotif(ctx: CanvasRenderingContext2D) {
  const cx = POSTER_WIDTH / 2
  const widths = [220, 148, 252]
  widths.forEach((width, index) => {
    ctx.strokeStyle = index === 1 ? GOLD : NAVY_SOFT
    ctx.lineWidth = index === 2 ? 7 : 5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx - width / 2, 730 + index * 58)
    ctx.lineTo(cx + width / 2, 730 + index * 58)
    ctx.stroke()
  })
  ctx.lineCap = 'butt'
}

function drawTilesMotif(ctx: CanvasRenderingContext2D) {
  const size = 116
  const gap = 30
  let x = (POSTER_WIDTH - size * 3 - gap * 2) / 2
  const y = 734

  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = i === 1 ? GOLD_SOFT : NAVY_SOFT
    ctx.lineWidth = 2
    roundRect(ctx, x, y, size, size, 18)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 22, y + 76)
    ctx.lineTo(x + 74, y + 34)
    ctx.stroke()
    if (i !== 1) {
      ctx.beginPath()
      ctx.moveTo(x + 28, y + 38)
      ctx.lineTo(x + 72, y + 78)
      ctx.stroke()
    }
    x += size + gap
  }
}

function drawLotMotif(ctx: CanvasRenderingContext2D) {
  const cx = POSTER_WIDTH / 2
  const cy = 796
  const cards: Array<[number, number, string]> = [[-66, -0.18, NAVY_SOFT], [0, 0, GOLD_SOFT], [66, 0.18, NAVY_SOFT]]

  cards.forEach(([offset, rotation, color]) => {
    ctx.save()
    ctx.translate(cx + offset, cy)
    ctx.rotate(rotation)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    roundRect(ctx, -52, -92, 104, 184, 16)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-22, -30)
    ctx.lineTo(22, -30)
    ctx.moveTo(-22, 6)
    ctx.lineTo(22, 6)
    ctx.moveTo(-22, 42)
    ctx.lineTo(14, 42)
    ctx.stroke()
    ctx.restore()
  })
}

function drawPersonalityMotif(ctx: CanvasRenderingContext2D) {
  const x = POSTER_WIDTH / 2 - 140
  const baseline = 882
  const heights = [58, 102, 78, 132]

  heights.forEach((height, index) => {
    ctx.fillStyle = index === 3 ? GOLD : 'rgba(39, 54, 77, 0.25)'
    roundRect(ctx, x + index * 74, baseline - height, 42, height, 10)
    ctx.fill()
  })
}

function drawNumberMotif(ctx: CanvasRenderingContext2D) {
  const cx = POSTER_WIDTH / 2
  const cy = 792

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = cx + (col - 1) * 82
      const y = cy + (row - 1) * 66
      ctx.fillStyle = (row + col) % 2 ? 'rgba(39, 54, 77, 0.25)' : GOLD
      ctx.beginPath()
      ctx.arc(x, y, row === 1 && col === 1 ? 10 : 7, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawProphetMotif(ctx: CanvasRenderingContext2D) {
  const cx = POSTER_WIDTH / 2
  const cy = 792
  ctx.strokeStyle = NAVY_SOFT
  ctx.lineWidth = 2
  roundRect(ctx, cx - 168, cy - 68, 112, 136, 18)
  ctx.stroke()
  roundRect(ctx, cx + 56, cy - 68, 112, 136, 18)
  ctx.stroke()
  ctx.strokeStyle = GOLD
  ctx.beginPath()
  ctx.arc(cx, cy, 42, 0, Math.PI * 2)
  ctx.stroke()
}

function drawDefaultMotif(ctx: CanvasRenderingContext2D) {
  const x = POSTER_WIDTH / 2 - 82
  const y = 726
  ctx.strokeStyle = GOLD_SOFT
  ctx.lineWidth = 2
  roundRect(ctx, x, y, 164, 164, 24)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 42, y + 82)
  ctx.lineTo(x + 122, y + 82)
  ctx.stroke()
}

function drawCategoryMotif(ctx: CanvasRenderingContext2D, categoryId: SharePosterCategoryId) {
  ctx.save()
  ctx.globalAlpha = 0.72
  switch (categoryId) {
    case 'paipan': drawPaipanMotif(ctx); break
    case 'astrology': drawOrbitMotif(ctx); break
    case 'fengshui': drawCompassMotif(ctx); break
    case 'shuangren-hepan': drawTwinMotif(ctx); break
    case 'auspicious-datetime': drawCalendarMotif(ctx); break
    case 'seeking': drawDirectionMotif(ctx); break
    case 'naming': drawNameMotif(ctx); break
    case 'cezi': drawTilesMotif(ctx); break
    case 'draw-a-lot': drawLotMotif(ctx); break
    case 'psychological-test': drawPersonalityMotif(ctx); break
    case 'numeric-energy': drawNumberMotif(ctx); break
    case 'prophet': drawProphetMotif(ctx); break
    default: drawFortuneMotif(ctx)
  }
  ctx.restore()
}

function drawFortuneMotif(ctx: CanvasRenderingContext2D) {
  const cx = POSTER_WIDTH / 2
  const cy = 792
  const radius = 104
  ctx.strokeStyle = GOLD_SOFT
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()

  for (let i = 0; i < 8; i++) {
    const angle = Math.PI * 2 * i / 8 + Math.PI / 8
    ctx.beginPath()
    ctx.arc(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, 6, 0, Math.PI * 2)
    ctx.fillStyle = i % 2 ? GOLD : NAVY_SOFT
    ctx.fill()
  }
}

function drawFeatureBand(ctx: CanvasRenderingContext2D, features: [string, string, string, string]) {
  const top = 1008
  const height = 186
  const gradient = ctx.createLinearGradient(0, top - 28, 0, top + height)
  gradient.addColorStop(0, 'rgba(251, 247, 238, 0)')
  gradient.addColorStop(0.28, PAPER_SOFT)
  gradient.addColorStop(1, PAPER_SOFT)
  ctx.fillStyle = gradient
  ctx.fillRect(0, top - 28, POSTER_WIDTH, height + 28)

  const columns = features.length
  const columnWidth = (POSTER_WIDTH - 128 - (columns - 1) * 18) / columns
  features.forEach((feature, index) => {
    const x = 64 + index * (columnWidth + 18) + columnWidth / 2

    ctx.strokeStyle = GOLD
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, top + 38, 27, 0, Math.PI * 2)
    ctx.stroke()
    ctx.font = '600 22px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
    ctx.fillStyle = GOLD
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`0${index + 1}`, x, top + 39)

    ctx.font = '500 25px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
    ctx.fillStyle = INK
    ctx.textBaseline = 'top'
    const lines = wrapText(ctx, feature, columnWidth - 10, 2)
    lines.forEach((line, lineIndex) => {
      ctx.fillText(line, x, top + 88 + lineIndex * 34)
    })

    if (index > 0) {
      ctx.strokeStyle = 'rgba(39, 54, 77, 0.10)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x - columnWidth / 2 - 9, top + 34)
      ctx.lineTo(x - columnWidth / 2 - 9, top + 138)
      ctx.stroke()
    }
  })
}

async function drawQrCode(ctx: CanvasRenderingContext2D, url: string) {
  const QRCode = await import('qrcode')
  const qrDataUrl = await QRCode.default.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 0,
    width: 232,
    color: { dark: '#27364dff', light: '#fff9eeff' },
  })
  const qrImage = await loadImage(qrDataUrl)
  const size = 112
  const x = (POSTER_WIDTH - size) / 2
  const y = 1232

  ctx.fillStyle = '#fff9ee'
  roundRect(ctx, x - 10, y - 10, size + 20, size + 20, 18)
  ctx.fill()
  ctx.drawImage(qrImage, x, y, size, size)
}

export async function generateSharePoster(options: SharePosterRenderOptions) {
  if (typeof document === 'undefined') {
    throw new Error('Share poster generation requires a browser')
  }

  const [background, fontReady] = await Promise.all([
    loadImage('/poster_bg.png'),
    typeof document !== 'undefined' && 'fonts' in document
      ? document.fonts.ready
      : Promise.resolve(),
  ])
  await fontReady

  const canvas = document.createElement('canvas')
  canvas.width = POSTER_WIDTH
  canvas.height = POSTER_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is unavailable')

  ctx.drawImage(background, 0, 0, POSTER_WIDTH, POSTER_HEIGHT)

  const overlay = ctx.createLinearGradient(0, 0, 0, 620)
  overlay.addColorStop(0, 'rgba(250, 246, 237, 0.72)')
  overlay.addColorStop(1, 'rgba(250, 246, 237, 0)')
  ctx.fillStyle = overlay
  ctx.fillRect(0, 0, POSTER_WIDTH, 620)

  drawKicker(ctx, options.category, POSTER_WIDTH / 2, 98)
  const titleMetrics = drawCenteredText(ctx, options.title, POSTER_WIDTH / 2, 166, 824, 2, 86, 46)
  const titleBottom = 166 + titleMetrics.lineCount * titleMetrics.fontSize * 1.16
  drawDescription(ctx, options.subtitle, POSTER_WIDTH / 2, titleBottom + 34)
  drawCategoryMotif(ctx, options.categoryId ?? 'fortune-telling')
  drawFeatureBand(ctx, options.features ?? ['ososn', 'AI Reading', 'Mobile Ready', 'Privacy First'] as [string, string, string, string])
  await drawQrCode(ctx, options.url)

  ctx.font = '500 24px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(39, 54, 77, 0.62)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('ososn · www.ososn.com', POSTER_WIDTH / 2, 1388)

  return canvas.toDataURL('image/png')
}
