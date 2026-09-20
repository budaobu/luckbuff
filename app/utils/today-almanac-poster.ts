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
const RED = '#a5161b'
const PAPER = '#fbf7ef'

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  let value = text
  while (value && ctx.measureText(value).width > maxWidth) {
    value = value.slice(0, -1)
  }
  return value
}

function drawPaperTexture(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.clip()
  for (let i = 0; i < 300; i += 1) {
    const px = x + ((i * 137) % width)
    const py = y + ((i * 271) % height)
    ctx.globalAlpha = 0.018
    ctx.fillStyle = i % 3 ? '#8a6b50' : '#a5161b'
    ctx.beginPath()
    ctx.arc(px, py, i % 7 ? 0.7 : 1.3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function englishMonth(date: string) {
  const month = Number(date.split('-')[1])
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ]
  return months[month - 1] || ''
}

function chineseWeekday(weekday: number) {
  return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][weekday] || ''
}

function englishWeekday(weekday: number) {
  return ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][weekday] || ''
}

function monthLengthMark(date: string) {
  const [year, month] = date.split('-').map(Number)
  if (!year || !month) return ''
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return days === 31 ? '大' : '小'
}

function drawVerticalText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.save()
  ctx.fillStyle = color
  ctx.font = `700 ${size}px "Noto Serif SC", "Songti SC", serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  Array.from(text).forEach((char, index) => {
    ctx.fillText(char, x, y + index * (size + 8))
  })
  ctx.restore()
}

function drawHeaderCell(
  ctx: CanvasRenderingContext2D,
  value: string,
  subValue: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const centerX = x + width / 2
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = RED
  ctx.font = '700 31px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(fitText(ctx, value, width - 14), centerX, y + (subValue ? height / 2 - 12 : height / 2))
  if (subValue) {
    ctx.font = '700 17px "Noto Serif SC", "Songti SC", serif'
    ctx.fillText(fitText(ctx, subValue, width - 14), centerX, y + height / 2 + 18)
  }
}

function drawActivityColumn(
  ctx: CanvasRenderingContext2D,
  title: string,
  values: string[],
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const centerX = x + width / 2
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = RED
  ctx.font = '800 50px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(title, centerX, y + 38)

  ctx.font = '700 22px "Noto Serif SC", "Songti SC", serif'
  values.slice(0, 4).forEach((value, index) => {
    ctx.fillText(fitText(ctx, value, width - 10), centerX, y + 98 + index * 32)
  })

  ctx.beginPath()
  ctx.moveTo(x + width, y)
  ctx.lineTo(x + width, y + height)
  ctx.stroke()
}

function drawHourGrid(
  ctx: CanvasRenderingContext2D,
  title: string,
  hours: TodayAlmanac['hours'],
  x: number,
  y: number,
) {
  const cellWidth = 70
  const cellHeight = 72
  const gridWidth = cellWidth * 6 + 5 * 2
  const centerX = x + gridWidth / 2

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = RED
  ctx.font = '700 23px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(title, centerX, y + 10)

  hours.slice(0, 12).forEach((hour, index) => {
    const col = index % 6
    const row = Math.floor(index / 6)
    const cellX = x + col * (cellWidth + 2)
    const cellY = y + 30 + row * (cellHeight + 12)
    const isLucky = hour.luck === '吉'

    if (isLucky) {
      ctx.fillStyle = RED
      ctx.fillRect(cellX, cellY, cellWidth, cellHeight)
    }
    else {
      ctx.strokeStyle = RED
      ctx.lineWidth = 2
      ctx.strokeRect(cellX, cellY, cellWidth, cellHeight)
    }

    ctx.fillStyle = isLucky ? PAPER : RED
    ctx.font = '800 27px "Noto Serif SC", "Songti SC", serif'
    ctx.fillText(hour.zhi, cellX + cellWidth / 2, cellY + 23)
    ctx.font = '700 17px "Noto Serif SC", "Songti SC", serif'
    ctx.fillText(hour.startTime.slice(0, 2), cellX + cellWidth / 2, cellY + 52)
  })
}

async function drawQrCode(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, size: number) {
  const QRCode = await import('qrcode')
  const dataUrl = await QRCode.default.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 0,
    width: size * 2,
    color: { dark: '#7f0d12ff', light: '#fbf7efff' },
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

  const backdrop = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  backdrop.addColorStop(0, '#717176')
  backdrop.addColorStop(0.68, '#4f4f54')
  backdrop.addColorStop(1, '#313135')
  ctx.fillStyle = backdrop
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const paperX = 92
  const paperY = 168
  const paperWidth = 840
  const paperHeight = 1078
  ctx.save()
  ctx.shadowColor = 'rgba(12,12,14,.36)'
  ctx.shadowBlur = 34
  ctx.shadowOffsetY = 18
  ctx.fillStyle = PAPER
  ctx.fillRect(paperX, paperY, paperWidth, paperHeight)
  ctx.restore()
  drawPaperTexture(ctx, paperX, paperY, paperWidth, paperHeight)

  const railX = 60
  const railY = 72
  const railWidth = 904
  const railHeight = 72
  const railGradient = ctx.createLinearGradient(railX, railY, railX, railY + railHeight)
  railGradient.addColorStop(0, '#fbfbf9')
  railGradient.addColorStop(0.58, '#dcdcd9')
  railGradient.addColorStop(1, '#b9b9b6')
  ctx.save()
  ctx.shadowColor = 'rgba(10,10,12,.22)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 6
  ctx.fillStyle = railGradient
  roundRect(ctx, railX, railY, railWidth, railHeight, 15)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = RED
  roundRect(ctx, paperX + 20, railY + 55, paperWidth - 40, 14, 4)
  ctx.fill()
  for (const gripX of [railX + 118, railX + railWidth - 182]) {
    const gripGradient = ctx.createLinearGradient(gripX, railY + 28, gripX + 64, railY + 42)
    gripGradient.addColorStop(0, '#94949a')
    gripGradient.addColorStop(0.5, '#e6e6e4')
    gripGradient.addColorStop(1, '#8a8a90')
    ctx.fillStyle = gripGradient
    roundRect(ctx, gripX, railY + 28, 64, 14, 7)
    ctx.fill()
  }
  ctx.fillStyle = '#85868b'
  ctx.beginPath()
  ctx.arc(WIDTH / 2, railY + railHeight / 2, 13, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f3f3f1'
  ctx.beginPath()
  ctx.arc(WIDTH / 2, railY + railHeight / 2 - 2, 7, 0, Math.PI * 2)
  ctx.fill()

  const padding = 52
  const left = paperX + padding
  const right = paperX + paperWidth - padding
  const center = WIDTH / 2
  ctx.textBaseline = 'middle'
  ctx.fillStyle = RED
  ctx.textAlign = 'left'
  ctx.font = '800 56px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(options.day.date.slice(0, 4), left, paperY + 66)
  ctx.font = '700 22px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(options.day.lunar.yearInChinese, left, paperY + 105)

  ctx.textAlign = 'center'
  ctx.font = '800 46px "Noto Serif SC", Georgia, serif'
  ctx.fillText(englishMonth(options.day.date), center, paperY + 70)

  ctx.textAlign = 'right'
  ctx.font = '800 48px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(`${options.day.lunar.monthInChinese}月${monthLengthMark(options.day.date)}`, right, paperY + 66)

  ctx.fillStyle = RED
  ctx.beginPath()
  ctx.arc(left + 18, paperY + 172, 18, 0, Math.PI * 2)
  ctx.fill()
  drawVerticalText(ctx, '一帆风顺人安康', left + 18, paperY + 222, 23, RED)

  ctx.save()
  ctx.fillStyle = RED
  roundRect(ctx, right - 58, paperY + 142, 58, 148, 5)
  ctx.fill()
  drawVerticalText(ctx, '旺丁旺财', right - 29, paperY + 160, 24, PAPER)
  ctx.restore()

  ctx.textAlign = 'center'
  ctx.fillStyle = RED
  const dayNumber = Number(options.day.date.split('-')[2])
  ctx.font = '800 245px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(String(dayNumber), center, paperY + 265)

  const gridX = paperX + 58
  const gridY = paperY + 438
  const gridWidth = paperWidth - 116
  ctx.strokeStyle = RED
  ctx.lineWidth = 3
  ctx.strokeRect(gridX, gridY, gridWidth, 496)

  const headerHeight = 88
  const headerWidths = [168, 162, 242, 168]
  let headerX = gridX
  const headerItems = [
    { value: options.day.lunar.yearGanZhi, subValue: '' },
    { value: `${options.day.lunar.monthInChinese}月${monthLengthMark(options.day.date)}`, subValue: '' },
    { value: `${options.day.lunar.dayInChinese}日`, subValue: '' },
    { value: chineseWeekday(options.day.weekday), subValue: englishWeekday(options.day.weekday) },
  ]
  headerItems.forEach((item, index) => {
    const width = headerWidths[index] ?? 0
    drawHeaderCell(ctx, item.value, item.subValue, headerX, gridY, width, headerHeight)
    if (index > 0) {
      ctx.beginPath()
      ctx.moveTo(headerX, gridY)
      ctx.lineTo(headerX, gridY + headerHeight)
      ctx.stroke()
    }
    headerX += width
  })
  ctx.beginPath()
  ctx.moveTo(gridX, gridY + headerHeight)
  ctx.lineTo(gridX + gridWidth, gridY + headerHeight)
  ctx.stroke()

  const bodyY = gridY + headerHeight
  const bodyHeight = 252
  const sideWidth = 138
  const hoursX = gridX + sideWidth + 24
  const hoursY = bodyY + 22
  drawActivityColumn(ctx, options.labels.yi, options.day.yi, gridX, bodyY, sideWidth, bodyHeight)
  drawActivityColumn(ctx, options.labels.ji, options.day.ji, gridX + gridWidth - sideWidth, bodyY, sideWidth, bodyHeight)
  drawHourGrid(ctx, options.labels.luckyHours, options.day.hours, hoursX, hoursY)

  const clashWidth = 102
  const clashHeight = 34
  ctx.fillStyle = RED
  roundRect(ctx, center - clashWidth / 2, bodyY + bodyHeight - clashHeight - 4, clashWidth, clashHeight, 3)
  ctx.fill()
  ctx.fillStyle = PAPER
  ctx.font = '800 22px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(`冲${options.day.chongShengXiao}`, center, bodyY + bodyHeight - clashHeight / 2 - 4)

  const detailY = bodyY + bodyHeight
  const detailHeight = 76
  const details = [
    options.day.lunar.dayGanZhi,
    options.day.colors.dayWuxing,
    options.day.xiu.name,
    options.day.jianChu,
  ]
  const detailWidth = gridWidth / details.length
  details.forEach((value, index) => {
    drawHeaderCell(ctx, value, '', gridX + index * detailWidth, detailY, detailWidth, detailHeight)
    if (index > 0) {
      ctx.beginPath()
      ctx.moveTo(gridX + index * detailWidth, detailY)
      ctx.lineTo(gridX + index * detailWidth, detailY + detailHeight)
      ctx.stroke()
    }
  })
  ctx.beginPath()
  ctx.moveTo(gridX, detailY)
  ctx.lineTo(gridX + gridWidth, detailY)
  ctx.stroke()

  const directionY = detailY + detailHeight
  const directionHeight = 80
  const directionTexts = [
    `${options.labels.caiDirection.replace('方位', '')}${options.day.positions.cai}`,
    `${options.labels.xiDirection.replace('方位', '')}${options.day.positions.xi}`,
    `煞${options.day.sha}`,
  ]
  const directionWidth = gridWidth / directionTexts.length
  directionTexts.forEach((value, index) => {
    drawHeaderCell(ctx, value, '', gridX + index * directionWidth, directionY, directionWidth, directionHeight)
    if (index > 0) {
      ctx.beginPath()
      ctx.moveTo(gridX + index * directionWidth, directionY)
      ctx.lineTo(gridX + index * directionWidth, directionY + directionHeight)
      ctx.stroke()
    }
  })

  const footerY = paperY + paperHeight - 84
  ctx.textAlign = 'left'
  ctx.fillStyle = RED
  ctx.font = '700 27px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(`【${options.day.lunar.shengXiao}】年`, left, footerY)
  ctx.font = '500 22px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText('百業興旺家富裕', left + 130, footerY)
  ctx.fillStyle = RED
  roundRect(ctx, right - 84, footerY - 24, 84, 48, 4)
  ctx.fill()
  ctx.fillStyle = PAPER
  ctx.textAlign = 'center'
  ctx.font = '800 27px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText('通勝', right - 42, footerY)

  const qrSize = 96
  const qrY = paperY + paperHeight + 34
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,.24)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 5
  ctx.fillStyle = PAPER
  roundRect(ctx, center - qrSize / 2 - 8, qrY - 8, qrSize + 16, qrSize + 16, 8)
  ctx.fill()
  ctx.restore()
  await drawQrCode(ctx, options.url, center - qrSize / 2, qrY, qrSize)

  ctx.textBaseline = 'top'
  ctx.fillStyle = 'rgba(251,247,239,.78)'
  ctx.font = '700 22px "Noto Sans SC", ui-sans-serif, sans-serif'
  ctx.fillText('ososn · www.ososn.com', center, qrY + qrSize + 26)
  ctx.fillStyle = 'rgba(251,247,239,.42)'
  ctx.font = '400 18px "Noto Sans SC", ui-sans-serif, sans-serif'
  ctx.fillText(options.labels.timezone, center, qrY + qrSize + 56)

  return canvas.toDataURL('image/png')
}
