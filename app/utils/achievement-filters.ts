/**
 * Pure client-side image filter engine for the Life Achievement Generator.
 * Stylized, high-impact filters (ASCII / dot-matrix / voxel / glyph / terminal /
 * arcade / 16-bit / glitch / static / prism / acid / phantom / ink / crystal).
 * Each filter reduces the source to its own restricted palette and renders onto a
 * fresh background, so the effect stays visible even at low opacity. No network.
 */
import type { FilterId, FilterParams } from '~/data/achievement-generator'

const ASCII_RAMP = '@%#*+=-:. '
const GLYPH_RAMP = '龍龜鼎山川木火土金水日月星辰云气靈'
const TERMINAL_RAMP = '█▓▒░ '

function clamp(v: number, min = 0, max = 255) {
  return v < min ? min : v > max ? max : v
}

function lum(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function seededRand(seed0: number) {
  let s = seed0 >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

/** Draw source image into a fresh canvas at a capped working size. */
function rasterize(
  img: HTMLImageElement | ImageBitmap,
  maxSide = 1600,
): { canvas: HTMLCanvasElement; w: number; h: number } {
  const iw = img.width
  const ih = img.height
  const scale = Math.min(1, maxSide / Math.max(iw, ih))
  const w = Math.max(1, Math.round(iw * scale))
  const h = Math.max(1, Math.round(ih * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, w, h)
  return { canvas, w, h }
}

function makeOffscreen(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

/* ----------------------------- filters ----------------------------- */

/**
 * Shared character-grid renderer. The source is contrast-stretched, sampled per
 * cell, reduced through `tint` to the filter palette, then drawn with the given
 * ramp. `bg` is the paper color so light cells blend into the page.
 */
function renderCharGrid(
  src: ImageData,
  w: number,
  h: number,
  p: FilterParams,
  ramp: string,
  bg: string,
  tint: (r: number, g: number, b: number) => [number, number, number],
  fontFamily = 'ui-monospace, SFMono-Regular, Menlo, monospace',
  glyphScale = 1,
) {
  const cols = Math.max(12, Math.round(p.density))
  const cellW = w / cols
  const rows = Math.max(12, Math.round(h / cellW))
  const cellH = h / rows
  const out = makeOffscreen(w, h)
  const octx = out.getContext('2d')!
  octx.fillStyle = bg
  octx.fillRect(0, 0, w, h)
  const fontSize = Math.max(4, Math.round(Math.min(cellW * 1.05, cellH * 1.2) * (p.charSize / 10) * glyphScale))
  octx.font = `${fontSize}px ${fontFamily}`
  octx.textAlign = 'center'
  octx.textBaseline = 'middle'
  const data = src.data
  const n = ramp.length
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = Math.min(w - 1, Math.round(x * cellW + cellW / 2))
      const py = Math.min(h - 1, Math.round(y * cellH + cellH / 2))
      const i = (py * w + px) * 4
      let r = data[i] ?? 0
      let g = data[i + 1] ?? 0
      let b = data[i + 2] ?? 0
      // contrast stretch to make flat photos pop
      r = clamp((r - 128) * 1.28 + 128)
      g = clamp((g - 128) * 1.28 + 128)
      b = clamp((b - 128) * 1.28 + 128)
      const [tr, tg, tb] = tint(r, g, b)
      const l = clamp(lum(r, g, b)) / 255
      const idx = Math.min(n - 1, Math.floor((1 - l) * (n - 0.001)))
      const ch = ramp[idx] ?? ' '
      if (ch === ' ') continue
      octx.fillStyle = `rgb(${tr | 0},${tg | 0},${tb | 0})`
      octx.fillText(ch, x * cellW + cellW / 2, y * cellH + cellH / 2)
    }
  }
  return out
}

function filterAscii(src: ImageData, w: number, h: number, p: FilterParams) {
  return renderCharGrid(src, w, h, p, ASCII_RAMP, '#0a0c10', (r, g, b) => [r, g, b])
}

function filterAncient(src: ImageData, w: number, h: number, p: FilterParams) {
  return renderCharGrid(
    src, w, h, p, GLYPH_RAMP, '#f3ead8',
    (r, g, b) => {
      const l = lum(r, g, b)
      return [clamp(l * 0.42 + 24), clamp(l * 0.3 + 16), clamp(l * 0.16 + 8)]
    },
    '"Songti SC","STSong","Noto Serif SC",serif',
    0.9,
  )
}

function filterTerminal(src: ImageData, w: number, h: number, p: FilterParams) {
  const out = renderCharGrid(
    src, w, h, p, TERMINAL_RAMP, '#040805',
    (r, g, b) => {
      const l = lum(r, g, b)
      return [clamp(l * 0.1), clamp(l * 0.92), clamp(l * 0.26)]
    },
    'ui-monospace, SFMono-Regular, Menlo, monospace',
    0.85,
  )
  const octx = out.getContext('2d')!
  octx.fillStyle = 'rgba(0,20,5,0.28)'
  for (let y = 0; y < h; y += 4) octx.fillRect(0, y, w, 2)
  return out
}

function filterDots(src: ImageData, w: number, h: number, p: FilterParams) {
  const cols = Math.max(10, Math.round(p.density))
  const step = w / cols
  const rows = Math.max(10, Math.round(h / step))
  const out = makeOffscreen(w, h)
  const octx = out.getContext('2d')!
  octx.fillStyle = '#fbf8f2'
  octx.fillRect(0, 0, w, h)
  const data = src.data
  const maxR = step * 0.62 * (p.charSize / 10)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = Math.min(w - 1, Math.round(x * step + step / 2))
      const py = Math.min(h - 1, Math.round(y * step + step / 2))
      const i = (py * w + px) * 4
      const r = data[i] ?? 0
      const g = data[i + 1] ?? 0
      const b = data[i + 2] ?? 0
      const l = clamp((lum(r, g, b) - 128) * 1.3 + 128) / 255
      const radius = Math.max(0.4, Math.pow(1 - l, 0.8) * maxR)
      octx.beginPath()
      octx.fillStyle = `rgb(${clamp(r * 0.75) | 0},${clamp(g * 0.72) | 0},${clamp(b * 0.7) | 0})`
      octx.arc(x * step + step / 2, y * step + step / 2, radius, 0, Math.PI * 2)
      octx.fill()
    }
  }
  return out
}

function filterVoxel(src: ImageData, w: number, h: number, p: FilterParams) {
  const cols = Math.max(10, Math.round(p.density))
  const block = w / cols
  const rows = Math.max(10, Math.round(h / block))
  const out = makeOffscreen(w, h)
  const octx = out.getContext('2d')!
  octx.fillStyle = '#0d1018'
  octx.fillRect(0, 0, w, h)
  const data = src.data
  const s = block * 0.9 * (p.charSize / 10)
  const topH = s * 0.5
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = Math.min(w - 1, Math.round(x * block + block / 2))
      const py = Math.min(h - 1, Math.round(y * block + block / 2))
      const i = (py * w + px) * 4
      const r = data[i] ?? 0
      const g = data[i + 1] ?? 0
      const b = data[i + 2] ?? 0
      const l = lum(r, g, b)
      if (l < 6) continue
      const raise = (l / 255) * block * 1.2
      const cx = x * block + block / 2
      const cy = y * block + block / 2 - raise
      // top face
      octx.beginPath()
      octx.moveTo(cx, cy - topH)
      octx.lineTo(cx + s, cy)
      octx.lineTo(cx, cy + topH)
      octx.lineTo(cx - s, cy)
      octx.closePath()
      octx.fillStyle = `rgb(${clamp(r + 34) | 0},${clamp(g + 34) | 0},${clamp(b + 34) | 0})`
      octx.fill()
      // left face
      octx.beginPath()
      octx.moveTo(cx - s, cy)
      octx.lineTo(cx, cy + topH)
      octx.lineTo(cx, cy + topH + s * 0.55)
      octx.lineTo(cx - s, cy + s * 0.55)
      octx.closePath()
      octx.fillStyle = `rgb(${clamp(r - 22) | 0},${clamp(g - 22) | 0},${clamp(b - 22) | 0})`
      octx.fill()
      // right face
      octx.beginPath()
      octx.moveTo(cx + s, cy)
      octx.lineTo(cx, cy + topH)
      octx.lineTo(cx, cy + topH + s * 0.55)
      octx.lineTo(cx + s, cy + s * 0.55)
      octx.closePath()
      octx.fillStyle = `rgb(${clamp(r - 44) | 0},${clamp(g - 44) | 0},${clamp(b - 44) | 0})`
      octx.fill()
    }
  }
  return out
}

function filterPixelate(src: ImageData, w: number, h: number, p: FilterParams, palette: number[][]) {
  // chunky retro blocks: density 12..160 maps to roughly 8..108 columns
  const cw = Math.max(6, Math.round(6 + (p.density / 160) * 96))
  const cell = Math.max(3, w / cw)
  const ch = Math.max(6, Math.round(h / cell))
  const small = makeOffscreen(cw, ch)
  const sctx = small.getContext('2d')!
  const srcCanvas = makeOffscreen(w, h)
  srcCanvas.getContext('2d')!.putImageData(src, 0, 0)
  sctx.imageSmoothingEnabled = false
  sctx.drawImage(srcCanvas, 0, 0, w, h, 0, 0, cw, ch)
  const sd = sctx.getImageData(0, 0, cw, ch)
  const d = sd.data
  for (let i = 0; i < d.length; i += 4) {
    const r = clamp(((d[i] ?? 0) - 128) * 1.25 + 128)
    const g = clamp(((d[i + 1] ?? 0) - 128) * 1.25 + 128)
    const b = clamp(((d[i + 2] ?? 0) - 128) * 1.25 + 128)
    let best = palette[0]!
    let bestD = Infinity
    for (const c of palette) {
      const dr = r - c[0]!
      const dg = g - c[1]!
      const db = b - c[2]!
      const dd = dr * dr + dg * dg + db * db
      if (dd < bestD) { bestD = dd; best = c }
    }
    d[i] = best[0]!
    d[i + 1] = best[1]!
    d[i + 2] = best[2]!
  }
  sctx.putImageData(sd, 0, 0)
  const out = makeOffscreen(w, h)
  const octx = out.getContext('2d')!
  octx.imageSmoothingEnabled = false
  octx.drawImage(small, 0, 0, cw, ch, 0, 0, w, h)
  return out
}

function filterGlitch(src: ImageData, w: number, h: number, p: FilterParams) {
  const out = makeOffscreen(w, h)
  const octx = out.getContext('2d')!
  octx.putImageData(src, 0, 0)
  const base = octx.getImageData(0, 0, w, h)
  const data = base.data
  const shift = Math.round(6 + (p.charSize / 10) * 16 + (p.density / 100) * 14)
  const shifted = octx.createImageData(w, h)
  const sd = shifted.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const rx = Math.min(w - 1, Math.max(0, x + shift))
      const bx = Math.min(w - 1, Math.max(0, x - shift))
      sd[i] = data[(y * w + rx) * 4] ?? 0
      sd[i + 1] = data[i + 1] ?? 0
      sd[i + 2] = data[(y * w + bx) * 4 + 2] ?? 0
      sd[i + 3] = 255
    }
  }
  octx.putImageData(shifted, 0, 0)
  const rand = seededRand(20260611)
  const slices = Math.max(6, Math.round(p.density / 7))
  for (let s = 0; s < slices; s++) {
    const sy = Math.floor(rand() * h)
    const sh = Math.max(2, Math.round(rand() * (p.charSize * 2.4)))
    const dx = Math.round((rand() - 0.5) * p.charSize * 10)
    octx.drawImage(out, 0, sy, w, sh, dx, sy, w, sh)
    if (rand() > 0.5) {
      octx.globalAlpha = 0.5
      octx.fillStyle = rand() > 0.5 ? '#ff2d55' : '#00ffd5'
      octx.fillRect(0, sy, w, 2)
      octx.globalAlpha = 1
    }
  }
  return out
}

function filterStatic(src: ImageData, w: number, h: number, p: FilterParams) {
  const out = makeOffscreen(w, h)
  const octx = out.getContext('2d')!
  octx.putImageData(src, 0, 0)
  const img = octx.getImageData(0, 0, w, h)
  const data = img.data
  const grain = 60 + (p.charSize / 10) * 180
  const density = 0.4 + p.density / 100
  const rand = seededRand(424242)
  for (let i = 0; i < data.length; i += 4) {
    const l = lum(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0)
    const n = (rand() - 0.5) * grain * density
    const v = clamp(l + n) | 0
    data[i] = v
    data[i + 1] = v
    data[i + 2] = v
  }
  octx.putImageData(img, 0, 0)
  octx.fillStyle = 'rgba(0,0,0,0.22)'
  for (let y = 0; y < h; y += 3) octx.fillRect(0, y, w, 1)
  octx.fillStyle = 'rgba(255,255,255,0.04)'
  for (let y = 0; y < h; y += 7) octx.fillRect(0, y, w, 1)
  return out
}

function filterPrism(src: ImageData, w: number, h: number, p: FilterParams) {
  const out = makeOffscreen(w, h)
  const octx = out.getContext('2d')!
  const srcCanvas = makeOffscreen(w, h)
  srcCanvas.getContext('2d')!.putImageData(src, 0, 0)
  const amt = Math.round(8 + (p.charSize / 10) * 20 + (p.density / 100) * 14)
  octx.globalCompositeOperation = 'screen'
  const split = (dx: number, color: string) => {
    const c = makeOffscreen(w, h)
    const cx = c.getContext('2d')!
    cx.drawImage(srcCanvas, dx, 0)
    cx.globalCompositeOperation = 'source-in'
    cx.fillStyle = color
    cx.fillRect(0, 0, w, h)
    return c
  }
  octx.fillStyle = '#000'
  octx.fillRect(0, 0, w, h)
  octx.globalAlpha = 0.5
  octx.drawImage(split(-amt, '#f00'), 0, 0)
  octx.drawImage(split(0, '#0f0'), 0, 0)
  octx.drawImage(split(amt, '#00f'), 0, 0)
  octx.globalAlpha = 1
  octx.globalCompositeOperation = 'source-over'
  // glass refraction streaks
  octx.globalAlpha = 0.05
  octx.fillStyle = '#fff'
  for (let x = 0; x < w; x += Math.max(30, 140 - p.density)) octx.fillRect(x, 0, 3, h)
  octx.globalAlpha = 1
  return out
}

function filterAcid(src: ImageData, w: number, h: number, p: FilterParams) {
  const out = makeOffscreen(w, h)
  const octx = out.getContext('2d')!
  octx.putImageData(src, 0, 0)
  const img = octx.getImageData(0, 0, w, h)
  const data = img.data
  const waveAmp = 6 + (p.charSize / 10) * 26
  const waveFreq = 0.008 + (p.density / 100) * 0.04
  const copy = new Uint8ClampedArray(data)
  for (let y = 0; y < h; y++) {
    const dx = Math.round(Math.sin(y * waveFreq) * waveAmp)
    for (let x = 0; x < w; x++) {
      const sx = Math.min(w - 1, Math.max(0, x + dx))
      const i = (y * w + x) * 4
      const si = (y * w + sx) * 4
      const l = lum(copy[si] ?? 0, copy[si + 1] ?? 0, copy[si + 2] ?? 0)
      data[i] = clamp(l * 0.18 + 8)
      data[i + 1] = clamp(l * 1.05 + 12)
      data[i + 2] = clamp(l * 0.24 + 4)
    }
  }
  octx.putImageData(img, 0, 0)
  const rand = seededRand(987654)
  octx.globalAlpha = 0.5
  for (let x = 0; x < w; x += Math.max(8, Math.round(46 - p.density / 3))) {
    const dh = rand() * (60 + p.charSize * 8) + 16
    const grad = octx.createLinearGradient(0, 0, 0, dh)
    grad.addColorStop(0, 'rgba(124,255,0,0.55)')
    grad.addColorStop(1, 'rgba(124,255,0,0)')
    octx.fillStyle = grad
    octx.fillRect(x, 0, 3, dh)
  }
  octx.globalAlpha = 1
  return out
}

function filterPhantom(src: ImageData, w: number, h: number, p: FilterParams) {
  const out = makeOffscreen(w, h)
  const octx = out.getContext('2d')!
  const srcCanvas = makeOffscreen(w, h)
  srcCanvas.getContext('2d')!.putImageData(src, 0, 0)
  octx.fillStyle = '#03040a'
  octx.fillRect(0, 0, w, h)
  const layers = 3 + Math.round((p.density / 100) * 4)
  const spread = 10 + (p.charSize / 10) * 26
  for (let l = 0; l < layers; l++) {
    const t = layers <= 1 ? 0 : l / (layers - 1)
    const dx = Math.sin(t * Math.PI * 2) * spread
    const dy = Math.cos(t * Math.PI * 2) * spread * 0.5
    octx.globalAlpha = 0.14 + t * 0.16
    octx.filter = `blur(${Math.round((1 - t) * 7)}px)`
    octx.drawImage(srcCanvas, dx, dy)
  }
  octx.filter = 'none'
  octx.globalAlpha = 0.9
  octx.drawImage(srcCanvas, 0, 0)
  octx.globalAlpha = 1
  octx.globalCompositeOperation = 'overlay'
  octx.fillStyle = 'rgba(90,130,210,0.3)'
  octx.fillRect(0, 0, w, h)
  octx.globalCompositeOperation = 'source-over'
  return out
}

function filterInk(src: ImageData, w: number, h: number, p: FilterParams) {
  const out = makeOffscreen(w, h)
  const octx = out.getContext('2d')!
  octx.fillStyle = '#f5efe1'
  octx.fillRect(0, 0, w, h)
  const data = src.data
  const cols = Math.max(10, Math.round(p.density))
  const step = w / cols
  const rows = Math.max(10, Math.round(h / step))
  const radius = step * 0.75 * (p.charSize / 10)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = Math.min(w - 1, Math.round(x * step + step / 2))
      const py = Math.min(h - 1, Math.round(y * step + step / 2))
      const i = (py * w + px) * 4
      const l = clamp((lum(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0) - 128) * 1.35 + 128) / 255
      const ink = 1 - l
      if (ink < 0.08) continue
      const cx = x * step + step / 2
      const cy = y * step + step / 2
      const rr = radius * (0.35 + ink)
      const grad = octx.createRadialGradient(cx, cy, 0, cx, cy, rr)
      grad.addColorStop(0, `rgba(16,18,24,${Math.min(0.95, ink * 1.15)})`)
      grad.addColorStop(0.55, `rgba(30,33,42,${ink * 0.55})`)
      grad.addColorStop(1, 'rgba(45,48,58,0)')
      octx.fillStyle = grad
      octx.beginPath()
      octx.arc(cx, cy, rr, 0, Math.PI * 2)
      octx.fill()
    }
  }
  return out
}

function filterCrystal(src: ImageData, w: number, h: number, p: FilterParams) {
  const out = makeOffscreen(w, h)
  const octx = out.getContext('2d')!
  octx.fillStyle = '#0b0d13'
  octx.fillRect(0, 0, w, h)
  const cols = Math.max(5, Math.round(5 + (p.density / 160) * 30))
  const cell = w / cols
  const rows = Math.max(5, Math.round(h / cell))
  const data = src.data
  const rand = seededRand(7919)
  const jitter = cell * 0.55
  const pts: [number, number][] = []
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) {
      const jx = (x === 0 || x === cols) ? 0 : (rand() - 0.5) * jitter
      const jy = (y === 0 || y === rows) ? 0 : (rand() - 0.5) * jitter
      pts.push([x * cell + jx, y * cell + jy])
    }
  }
  const idx = (x: number, y: number) => y * (cols + 1) + x
  const sample = (px: number, py: number) => {
    const sx = Math.min(w - 1, Math.max(0, Math.round(px)))
    const sy = Math.min(h - 1, Math.max(0, Math.round(py)))
    const i = (sy * w + sx) * 4
    return [data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0] as const
  }
  octx.lineWidth = Math.max(0.8, (p.charSize / 10) * 1.4)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const a = pts[idx(x, y)]!
      const b = pts[idx(x + 1, y)]!
      const c = pts[idx(x + 1, y + 1)]!
      const d = pts[idx(x, y + 1)]!
      const tri = (p1: [number, number], p2: [number, number], p3: [number, number]) => {
        const cx = (p1[0] + p2[0] + p3[0]) / 3
        const cy = (p1[1] + p2[1] + p3[1]) / 3
        const [r, g, bb] = sample(cx, cy)
        octx.beginPath()
        octx.moveTo(p1[0], p1[1])
        octx.lineTo(p2[0], p2[1])
        octx.lineTo(p3[0], p3[1])
        octx.closePath()
        octx.fillStyle = `rgb(${r | 0},${g | 0},${bb | 0})`
        octx.fill()
        octx.strokeStyle = 'rgba(255,255,255,0.22)'
        octx.stroke()
      }
      tri(a, b, c)
      tri(a, c, d)
    }
  }
  return out
}

const ARCADE_PALETTE = [
  [8, 10, 20], [24, 32, 72], [52, 60, 148], [168, 64, 180],
  [224, 64, 110], [244, 148, 56], [252, 224, 96], [96, 220, 140],
  [48, 196, 232], [220, 246, 255],
]

const BIT16_PALETTE = [
  [0, 0, 0], [29, 43, 83], [126, 37, 83], [0, 135, 81],
  [171, 82, 54], [95, 87, 79], [194, 195, 199], [255, 241, 232],
  [255, 0, 77], [255, 163, 0], [255, 236, 39], [0, 228, 54],
  [41, 173, 255], [131, 118, 156], [255, 119, 168], [255, 204, 170],
]

/**
 * Render the chosen filter (at filter opacity) composited over the original
 * image (at original strength). Target canvas defines the output resolution.
 */
export function renderFilter(
  target: CanvasRenderingContext2D,
  img: HTMLImageElement | ImageBitmap,
  filter: FilterId,
  params: FilterParams,
) {
  const out = target.canvas
  const w = out.width
  const h = out.height
  const { canvas: srcCanvas } = rasterize(img, Math.max(w, h))
  const base = makeOffscreen(w, h)
  const bctx = base.getContext('2d', { willReadFrequently: true })!
  bctx.drawImage(srcCanvas, 0, 0, w, h)
  const srcData = bctx.getImageData(0, 0, w, h)

  let filtered: HTMLCanvasElement
  switch (filter) {
    case 'ascii': filtered = filterAscii(srcData, w, h, params); break
    case 'ancient': filtered = filterAncient(srcData, w, h, params); break
    case 'terminal': filtered = filterTerminal(srcData, w, h, params); break
    case 'dots': filtered = filterDots(srcData, w, h, params); break
    case 'voxel': filtered = filterVoxel(srcData, w, h, params); break
    case 'arcade': filtered = filterPixelate(srcData, w, h, params, ARCADE_PALETTE); break
    case 'bit16': filtered = filterPixelate(srcData, w, h, params, BIT16_PALETTE); break
    case 'glitch': filtered = filterGlitch(srcData, w, h, params); break
    case 'static': filtered = filterStatic(srcData, w, h, params); break
    case 'prism': filtered = filterPrism(srcData, w, h, params); break
    case 'acid': filtered = filterAcid(srcData, w, h, params); break
    case 'phantom': filtered = filterPhantom(srcData, w, h, params); break
    case 'ink': filtered = filterInk(srcData, w, h, params); break
    case 'crystal': filtered = filterCrystal(srcData, w, h, params); break
    default: filtered = base
  }

  target.clearRect(0, 0, w, h)
  if (params.original > 0) {
    target.globalAlpha = params.original
    target.drawImage(base, 0, 0)
  }
  target.globalAlpha = params.opacity
  target.drawImage(filtered, 0, 0)
  target.globalAlpha = 1
}

/** Load a File into an HTMLImageElement (object URL). Caller should revoke URL. */
export function loadImageFromFile(file: File): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ img, url })
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image-load-failed'))
    }
    img.src = url
  })
}
