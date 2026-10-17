import type { BaziChartResult, BaziDaYun } from '~~/server/utils/tools/bazi-chart'

const WIDTH = 1024
const HEIGHT = 1536

export interface BaziPaipanPosterInput {
  result: BaziChartResult
  currentDayun: BaziDaYun | null
  siteName: string
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

export async function createBaziPaipanInstrumentPoster({ result, currentDayun, siteName }: BaziPaipanPosterInput) {
  if (typeof document === 'undefined') return null
  if (document.fonts?.ready) await document.fonts.ready

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  background.addColorStop(0, '#070b15')
  background.addColorStop(0.55, '#05070e')
  background.addColorStop(1, '#0d111f')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const glow = ctx.createRadialGradient(WIDTH / 2, 590, 30, WIDTH / 2, 590, 390)
  glow.addColorStop(0, 'rgba(120, 150, 220, 0.15)')
  glow.addColorStop(1, 'rgba(5, 7, 14, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 220, WIDTH, 740)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '500 22px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = '#b7892e'
  ctx.fillText('BAZI · EASTERN INSTRUMENT', WIDTH / 2, 82)
  ctx.font = '700 68px "Noto Serif SC", "Songti SC", serif'
  ctx.fillStyle = '#f4f7ff'
  ctx.fillText('八字天机仪', WIDTH / 2, 154)

  const centerX = WIDTH / 2
  const centerY = 590
  ;[232, 181, 131, 86].forEach((radius, index) => {
    ctx.strokeStyle = index % 2 ? 'rgba(212, 175, 109, 0.82)' : 'rgba(154, 176, 218, 0.48)'
    ctx.lineWidth = index === 2 ? 5 : 3
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(index % 2 ? 0.2 : -0.14)
    for (let tick = 0; tick < 36; tick++) {
      const angle = Math.PI * 2 * tick / 36
      const inner = radius - (tick % 6 === 0 ? 18 : 9)
      ctx.strokeStyle = tick % 6 === 0 ? '#d4af6d' : 'rgba(154, 176, 218, 0.44)'
      ctx.lineWidth = tick % 6 === 0 ? 3 : 2
      ctx.beginPath()
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
      ctx.stroke()
    }
    ctx.restore()
  })

  const plaquePositions = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const
  result.pillars.forEach((pillar, index) => {
    const [horizontal, vertical] = plaquePositions[index] ?? [0, 0]
    const x = centerX + horizontal * 108 - 49
    const y = centerY + vertical * 82 - 65
    ctx.fillStyle = index === 2 ? 'rgba(47, 125, 90, 0.94)' : 'rgba(34, 96, 72, 0.92)'
    roundRect(ctx, x, y, 98, 130, 12)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 216, 132, 0.38)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = '#f4f8ff'
    ctx.font = '700 38px "Noto Serif SC", "Songti SC", serif'
    ctx.fillText(pillar.gan, x + 28, y + 45)
    ctx.fillText(pillar.zhi, x + 70, y + 45)
    ctx.font = '400 18px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(233, 238, 250, 0.68)'
    ctx.fillText(pillar.label, x + 49, y + 96)
  })

  const currentDayunText = currentDayun
    ? `${currentDayun.startYear}-${currentDayun.endYear} ${currentDayun.ganzhi}`
    : '—'
  ctx.fillStyle = 'rgba(10, 14, 24, 0.86)'
  roundRect(ctx, 84, 1030, WIDTH - 168, 210, 24)
  ctx.fill()
  ctx.strokeStyle = 'rgba(212, 175, 109, 0.38)'
  ctx.stroke()

  ctx.fillStyle = '#d4af6d'
  ctx.font = '600 22px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
  ctx.fillText('当前大运', 140, 1082)
  ctx.fillStyle = '#f4f7ff'
  ctx.font = '700 38px "Noto Serif SC", "Songti SC", serif'
  ctx.fillText(currentDayunText, 140, 1136)

  ctx.textAlign = 'left'
  ctx.font = '500 22px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
  result.energy.wuxing.forEach((item, index) => {
    const x = 556
    const y = 1084 + index * 32
    ctx.fillStyle = 'rgba(233, 238, 250, 0.78)'
    ctx.fillText(`${item.label} ${item.percent}%`, x, y)
  })

  ctx.textAlign = 'center'
  ctx.font = '700 34px "Noto Serif SC", "Songti SC", serif'
  ctx.fillStyle = '#f4f7ff'
  ctx.fillText(result.pillars.map(pillar => pillar.ganzhi).join('  '), WIDTH / 2, 1296)
  ctx.font = '400 22px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(233, 238, 250, 0.70)'
  ctx.fillText(`${result.birth.solarText} · ${result.birth.trueSolarText} · ${result.energy.strength}`, WIDTH / 2, 1340)
  ctx.font = '500 20px "Noto Sans SC", ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(233, 238, 250, 0.52)'
  ctx.fillText(`${siteName} · www.ososn.com`, WIDTH / 2, 1442)

  return canvas.toDataURL('image/png')
}
