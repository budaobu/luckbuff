/**
 * Game-style achievement card compositor + PNG export for the Life Achievement Generator.
 * Draws a rounded "achievement unlocked" banner (rarity frame, icon, title, body, brand tag)
 * on top of a base canvas, and composes the three export modes.
 */
import type { ExportMode } from '~/data/achievement-generator'

export interface AchievementText {
  category: string
  title: string
  body: string
  icon: string // emoji or short glyph
  custom?: boolean
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * Draw the achievement card onto the lower portion of the canvas (Xbox/Steam style toast).
 * Returns the canvas for chaining.
 */
export function drawAchievementCard(
  ctx: CanvasRenderingContext2D,
  text: AchievementText,
  brandTag: string,
) {
  const canvas = ctx.canvas
  const w = canvas.width
  const h = canvas.height
  const pad = Math.round(w * 0.04)
  const cardH = Math.round(h * 0.24)
  const cardW = w - pad * 2
  const x = pad
  const y = h - cardH - pad
  const r = Math.round(cardH * 0.16)

  // outer glow
  ctx.save()
  ctx.shadowColor = 'rgba(255, 196, 64, 0.45)'
  ctx.shadowBlur = Math.round(cardH * 0.18)
  roundRect(ctx, x, y, cardW, cardH, r)
  const bg = ctx.createLinearGradient(x, y, x + cardW, y + cardH)
  bg.addColorStop(0, '#1b1f2b')
  bg.addColorStop(1, '#0e1119')
  ctx.fillStyle = bg
  ctx.fill()
  ctx.restore()

  // gold frame
  roundRect(ctx, x, y, cardW, cardH, r)
  const frame = ctx.createLinearGradient(x, y, x + cardW, y)
  frame.addColorStop(0, '#7a5a18')
  frame.addColorStop(0.5, '#ffd45e')
  frame.addColorStop(1, '#7a5a18')
  ctx.lineWidth = Math.max(2, Math.round(w * 0.003))
  ctx.strokeStyle = frame
  ctx.stroke()

  // icon plate
  const plate = Math.round(cardH * 0.62)
  const px = x + Math.round(cardH * 0.22)
  const py = y + (cardH - plate) / 2
  roundRect(ctx, px, py, plate, plate, Math.round(plate * 0.22))
  const plateGrad = ctx.createRadialGradient(px + plate * 0.35, py + plate * 0.3, 4, px + plate / 2, py + plate / 2, plate)
  plateGrad.addColorStop(0, '#ffd45e')
  plateGrad.addColorStop(1, '#b5851f')
  ctx.fillStyle = plateGrad
  ctx.fill()
  ctx.font = `${Math.round(plate * 0.56)}px "Apple Color Emoji","Segoe UI Emoji",serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#1b1f2b'
  ctx.fillText(text.icon || '🏆', px + plate / 2, py + plate / 2 + plate * 0.02)

  // text block
  const tx = px + plate + Math.round(cardH * 0.18)
  const maxTextW = x + cardW - tx - Math.round(cardH * 0.18)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  // eyebrow: ACHIEVEMENT UNLOCKED · category
  ctx.font = `700 ${Math.round(cardH * 0.11)}px ui-monospace, SFMono-Regular, Menlo, monospace`
  ctx.fillStyle = '#ffd45e'
  ctx.fillText(`ACHIEVEMENT UNLOCKED  ·  ${text.category}`, tx, y + Math.round(cardH * 0.16))

  // title
  ctx.font = `800 ${Math.round(cardH * 0.2)}px "Noto Serif SC","Songti SC",serif`
  ctx.fillStyle = '#ffffff'
  const titleLines = wrapText(ctx, text.title, maxTextW)
  let ty = y + Math.round(cardH * 0.34)
  for (const ln of titleLines.slice(0, 2)) {
    ctx.fillText(ln, tx, ty)
    ty += Math.round(cardH * 0.2)
  }

  // body
  ctx.font = `500 ${Math.round(cardH * 0.105)}px "Noto Sans SC",system-ui,sans-serif`
  ctx.fillStyle = 'rgba(226,232,240,0.86)'
  const bodyLines = wrapText(ctx, text.body, maxTextW)
  const startY = Math.max(ty + Math.round(cardH * 0.04), y + Math.round(cardH * 0.66))
  let by = startY
  for (const ln of bodyLines.slice(0, 1)) {
    ctx.fillText(ln, tx, by)
    by += Math.round(cardH * 0.13)
  }

  // brand tag bottom-right corner of canvas
  ctx.font = `600 ${Math.round(w * 0.018)}px ui-monospace, SFMono-Regular, Menlo, monospace`
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(brandTag, w - pad, h - pad * 0.6)
}

/**
 * Compose the final export canvas for a given mode.
 * - filter: just the filtered image (no card)
 * - achievement: original image (unfiltered) + card
 * - both: filtered image + card
 */
export function composeExport(
  filteredCanvas: HTMLCanvasElement,
  originalCanvas: HTMLCanvasElement,
  mode: ExportMode,
  text: AchievementText,
  brandTag: string,
): HTMLCanvasElement {
  const w = filteredCanvas.width
  const h = filteredCanvas.height
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const ctx = out.getContext('2d')!
  if (mode === 'achievement') {
    ctx.drawImage(originalCanvas, 0, 0, w, h)
  } else {
    // filter + both both show the filtered image
    ctx.drawImage(filteredCanvas, 0, 0)
  }
  if (mode === 'achievement' || mode === 'both') {
    drawAchievementCard(ctx, text, brandTag)
  }
  return out
}

export function canvasToPngFile(canvas: HTMLCanvasElement, filename: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('toBlob-failed'))
      resolve(new File([blob], filename, { type: 'image/png' }))
    }, 'image/png')
  })
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
