import type { TodayAlmanac } from '~/types/today-almanac'

export interface TodayAlmanacPosterLabels {
  title: string
  yi: string
  ji: string
  jianChu: string
  nineStar: string
  luckyHours: string
  directions: string
  xiDirection: string
  caiDirection: string
  fuDirection: string
  chongSha: string
  colorTitle: string
  luckyColor: string
  avoidColor: string
  jieQi: string
  timezone: string
}

export interface TodayAlmanacPosterOptions {
  day: TodayAlmanac
  labels: TodayAlmanacPosterLabels
  url: string
}

const WIDTH = 1024
const HEIGHT = 1536
const INK = '#4b3a29'
const CRIMSON = '#8b2b25'
const GOLD = '#cfa453'

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 2) {
  const lines: string[] = []
  let current = ''

  for (const char of text) {
    if (ctx.measureText(current + char).width > maxWidth && current) {
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
    while (last && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1)
      lines[maxLines - 1] = last
    }
    lines[maxLines - 1] = `${lines[maxLines - 1]}…`
  }
  return lines
}

function drawTornEdge(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, seed = 3) {
  ctx.save()
  ctx.shadowColor = 'rgba(38, 22, 12, 0.30)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 9
  ctx.beginPath()
  ctx.moveTo(x, y)
  const steps = 38
  for (let i = 1; i <= steps; i += 1) {
    const progress = i / steps
    const wave = Math.sin(progress * Math.PI * 7 + seed) * 15
    const noise = Math.sin(i * 17.3 + seed) * 9 + Math.sin(i * 7.1) * 6
    ctx.lineTo(x + progress * width, y + wave + noise)
  }
  ctx.lineTo(x + width, y + 64)
  ctx.lineTo(x, y + 64)
  ctx.closePath()
  ctx.fillStyle = '#fffdf4'
  ctx.fill()
  ctx.restore()

  ctx.strokeStyle = 'rgba(107,85,61,.30)'
  ctx.lineWidth = 1.5
  for (let i = 0; i < 52; i += 1) {
    const progress = (i + 0.5) / 52
    const px = x + progress * width
    const py = y + Math.sin(progress * Math.PI * 7 + seed) * 15
      + Math.sin(i * 17.3 + seed) * 9
      + Math.sin(i * 7.1) * 6
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(px + Math.sin(i * 3.7) * 7, py + 6 + (i % 3) * 3)
    ctx.stroke()
  }
}

function drawPaperTexture(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.clip()
  for (let i = 0; i < 240; i += 1) {
    const px = x + ((i * 137) % width)
    const py = y + ((i * 271) % height)
    ctx.globalAlpha = 0.025
    ctx.fillStyle = i % 3 ? '#6b553d' : '#9a7c55'
    ctx.beginPath()
    ctx.arc(px, py, i % 5 ? 0.8 : 1.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

async function drawQrCode(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, size: number) {
  const QRCode = await import('qrcode')
  const dataUrl = await QRCode.default.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 0,
    width: size * 2,
    color: { dark: '#40311fff', light: '#fffdf4ff' },
  })

  const image = new Image()
  image.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('QR code image failed to load'))
    image.src = dataUrl
  })
  ctx.drawImage(image, x, y, size, size)
}

export async function generateTodayAlmanacPoster(options: TodayAlmanacPosterOptions) {
  if (typeof document === 'undefined') {
    throw new Error('Poster generation requires a browser')
  }

  if ('fonts' in document) await document.fonts.ready
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is unavailable')

  const backdrop = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  backdrop.addColorStop(0, '#302116')
  backdrop.addColorStop(0.52, '#211611')
  backdrop.addColorStop(1, '#140e0b')
  ctx.fillStyle = backdrop
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const glow = ctx.createRadialGradient(180, 140, 30, 180, 140, 620)
  glow.addColorStop(0, 'rgba(255, 221, 168, 0.11)')
  glow.addColorStop(1, 'rgba(255, 221, 168, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, WIDTH, 760)

  const ember = ctx.createRadialGradient(890, 360, 30, 890, 360, 480)
  ember.addColorStop(0, 'rgba(139, 43, 37, 0.16)')
  ember.addColorStop(1, 'rgba(139, 43, 37, 0)')
  ctx.fillStyle = ember
  ctx.fillRect(360, 0, WIDTH - 360, 880)

  const boardX = 58
  const boardY = 88
  const boardWidth = WIDTH - 116
  const boardHeight = 1110
  ctx.fillStyle = '#4b3424'
  roundRect(ctx, boardX, boardY, boardWidth, boardHeight, 32)
  ctx.fill()

  const railGradient = ctx.createLinearGradient(boardX, boardY - 24, boardX + boardWidth, boardY + 12)
  railGradient.addColorStop(0, '#8d6134')
  railGradient.addColorStop(0.45, '#e6bd6f')
  railGradient.addColorStop(1, '#8d6134')
  ctx.fillStyle = railGradient
  roundRect(ctx, boardX + 26, boardY - 26, boardWidth - 52, 42, 21)
  ctx.fill()

  const paperX = boardX + 27
  const paperY = boardY + 26
  const paperWidth = boardWidth - 54
  const paperHeight = boardHeight - 150
  ctx.save()
  roundRect(ctx, paperX, paperY, paperWidth, paperHeight, 10)
  ctx.clip()
  ctx.fillStyle = '#fffdf4'
  ctx.fillRect(paperX, paperY, paperWidth, paperHeight)
  drawPaperTexture(ctx, paperX, paperY, paperWidth, paperHeight)

  ctx.fillStyle = CRIMSON
  ctx.fillRect(paperX, paperY, paperWidth, 150)
  ctx.fillStyle = 'rgba(255,255,255,.15)'
  ctx.fillRect(paperX, paperY + 130, paperWidth, 20)

  for (const holeX of [paperX + 210, paperX + paperWidth - 210]) {
    ctx.fillStyle = '#fffdf4'
    ctx.beginPath()
    ctx.arc(holeX, paperY + 42, 13, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(70,45,25,.3)'
    ctx.lineWidth = 3
    ctx.stroke()
  }

  const left = paperX + 46
  const center = paperX + paperWidth / 2
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fffdf4'
  ctx.textAlign = 'left'
  ctx.font = '500 28px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(options.labels.title, left, paperY + 50)
  ctx.textAlign = 'left'
  ctx.font = '700 48px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(options.day.date.replace(/-/g, ' / '), left, paperY + 110)

  ctx.textAlign = 'center'
  ctx.fillStyle = CRIMSON
  ctx.font = '700 112px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(`${options.day.lunar.monthInChinese}月${options.day.lunar.dayInChinese}`, center, paperY + 250)

  ctx.fillStyle = INK
  ctx.font = '500 29px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(`${options.day.lunar.yearGanZhi}年 · ${options.day.lunar.monthGanZhi}月 · ${options.day.lunar.dayGanZhi}日`, center, paperY + 322)

  ctx.fillStyle = '#7a6a52'
  ctx.font = '400 23px "Noto Sans SC", ui-sans-serif, sans-serif'
  ctx.fillText(`${options.labels.jianChu} ${options.day.jianChu} · ${options.day.tianShen} ${options.day.tianShenLuck} · ${options.labels.nineStar} ${options.day.nineStar}`, center, paperY + 368)

  const columns = [
    { title: options.labels.yi, values: options.day.yi.slice(0, 4), color: '#2f6a45' },
    { title: options.labels.ji, values: options.day.ji.slice(0, 4), color: '#9a3428' },
  ]
  columns.forEach((column, index) => {
    const width = 371
    const x = paperX + 44 + index * (width + 24)
    ctx.strokeStyle = column.color === '#2f6a45' ? 'rgba(47,106,69,.3)' : 'rgba(154,52,40,.3)'
    ctx.lineWidth = 2
    roundRect(ctx, x, paperY + 410, width, 224, 12)
    ctx.stroke()
    ctx.fillStyle = column.color
    ctx.font = '700 33px "Noto Serif SC", "Songti SC", serif'
    ctx.fillText(column.title, x + width / 2, paperY + 452)
    ctx.fillStyle = INK
    ctx.font = '400 24px "Noto Sans SC", ui-sans-serif, sans-serif'
    column.values.forEach((value, valueIndex) => {
      const lines = wrapText(ctx, `${valueIndex + 1}. ${value}`, width - 44, 1)
      ctx.fillText(lines[0] ?? '', x + width / 2, paperY + 508 + valueIndex * 31)
    })
  })

  ctx.textAlign = 'left'
  ctx.fillStyle = INK
  ctx.font = '700 28px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(options.labels.luckyHours, left, paperY + 692)
  ctx.font = '400 23px "Noto Sans SC", ui-sans-serif, sans-serif'
  options.day.hours.filter(hour => hour.luck === '吉').slice(0, 3).forEach((hour, index) => {
    ctx.fillText(`${hour.startTime}-${hour.endTime} ${hour.tianShen}`, left, paperY + 738 + index * 34)
  })

  ctx.textAlign = 'right'
  ctx.font = '700 28px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(options.labels.directions, paperX + paperWidth - 46, paperY + 692)
  ctx.font = '400 23px "Noto Sans SC", ui-sans-serif, sans-serif'
  const directions = [
    `${options.labels.xiDirection} ${options.day.positions.xi}`,
    `${options.labels.caiDirection} ${options.day.positions.cai}`,
    `${options.labels.fuDirection} ${options.day.positions.fu}`,
  ]
  directions.forEach((value, index) => {
    ctx.fillText(value, paperX + paperWidth - 46, paperY + 738 + index * 34)
  })

  ctx.strokeStyle = 'rgba(123,102,73,.26)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(left, paperY + 860)
  ctx.lineTo(paperX + paperWidth - 46, paperY + 860)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = '#6a5842'
  ctx.font = '400 23px "Noto Sans SC", ui-sans-serif, sans-serif'
  ctx.fillText(`${options.labels.chongSha} ${options.day.chongDesc} · ${options.day.sha}`, left, paperY + 905)
  ctx.fillText(`${options.labels.luckyColor} ${options.day.colors.daJi.colors.join(' / ')}`, left, paperY + 948)
  ctx.fillText(`${options.labels.avoidColor} ${options.day.colors.buYi.colors.join(' / ')}`, left, paperY + 991)
  const season = options.day.season.jieQi || options.day.season.nextJieQi.name
  ctx.fillText(`${options.labels.jieQi} ${season} · ${options.day.season.wuHou}`, left, paperY + 1034)
  ctx.restore()

  drawTornEdge(ctx, paperX, paperY + paperHeight - 12, paperWidth, Number(options.day.date.slice(-2)))

  ctx.strokeStyle = 'rgba(230,189,111,.30)'
  ctx.lineWidth = 2
  roundRect(ctx, paperX + 3, paperY, paperWidth - 6, paperHeight, 10)
  ctx.stroke()

  await drawQrCode(ctx, options.url, WIDTH / 2 - 50, 1252, 100)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'rgba(255,253,244,.62)'
  ctx.font = '500 22px "Noto Sans SC", ui-sans-serif, sans-serif'
  ctx.fillText('ososn · www.ososn.com', WIDTH / 2, 1378)
  ctx.fillStyle = 'rgba(255,253,244,.36)'
  ctx.font = '400 19px "Noto Sans SC", ui-sans-serif, sans-serif'
  ctx.fillText(options.labels.timezone, WIDTH / 2, 1416)

  return canvas.toDataURL('image/png')
}
