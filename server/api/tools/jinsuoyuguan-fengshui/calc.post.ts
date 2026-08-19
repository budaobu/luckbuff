type PalaceKey = 'kan' | 'kun' | 'zhen' | 'xun' | 'qian' | 'dui' | 'gen' | 'li'
type ElementKey =
  | 'door'
  | 'window'
  | 'balcony'
  | 'bathroom'
  | 'kitchen'
  | 'tallFurniture'
  | 'appliance'
  | 'aquarium'

interface CalcInput {
  direction: number
  layout?: Record<string, string[]>
  usage?: 'residential' | 'office' | 'shop'
  locale?: string
}

interface PalaceResult {
  key: PalaceKey
  wants: 'sha' | 'shui'
  theme: string
  elements: ElementKey[]
  score: number
  status: 'ji' | 'xiong' | 'ping'
  /** 反局类型，供前端按 i18n 模板渲染改善建议；仅凶宫非空 */
  fixKeys: string[]
}

// 金锁玉关（过路阴阳）通行口诀：一（坎）二（坤）三（震）四（巽）要砂，
// 六（乾）七（兑）八（艮）九（离）要水。砂=高实阳（灶、柜、电器），水=低空阴（门、窗、阳台、水景）。
const PALACE_DEFS: Array<{
  key: PalaceKey
  wants: 'sha' | 'shui'
  theme: string
  start: number // 该宫方位起始角（含），每宫 45°
  end: number // 结束角（不含）
}> = [
  { key: 'kan', wants: 'sha', theme: 'caiku', start: 337.5, end: 22.5 },
  { key: 'gen', wants: 'shui', theme: 'cuiding', start: 22.5, end: 67.5 },
  { key: 'zhen', wants: 'sha', theme: 'jinqi', start: 67.5, end: 112.5 },
  { key: 'xun', wants: 'sha', theme: 'kuixing', start: 112.5, end: 157.5 },
  { key: 'li', wants: 'shui', theme: 'wangcai', start: 157.5, end: 202.5 },
  { key: 'kun', wants: 'sha', theme: 'wenbing', start: 202.5, end: 247.5 },
  { key: 'dui', wants: 'shui', theme: 'tuiqi', start: 247.5, end: 292.5 },
  { key: 'qian', wants: 'shui', theme: 'guangui', start: 292.5, end: 337.5 },
]

// 要素砂水属性；卫生间属水但为浊水，得分单列
const ELEMENT_ATTR: Record<ElementKey, 'sha' | 'shui'> = {
  door: 'shui',
  window: 'shui',
  balcony: 'shui',
  bathroom: 'shui',
  aquarium: 'shui',
  kitchen: 'sha',
  tallFurniture: 'sha',
  appliance: 'sha',
}

const ELEMENT_KEYS = Object.keys(ELEMENT_ATTR) as ElementKey[]
const PALACE_KEYS = PALACE_DEFS.map(p => p.key)

function normalizeDegree(d: number): number {
  let deg = d % 360
  if (deg < 0) deg += 360
  return deg
}

function findPalace(deg: number): PalaceKey {
  for (const p of PALACE_DEFS) {
    if (p.start < p.end) {
      if (deg >= p.start && deg < p.end) return p.key
    }
    else if (deg >= p.start || deg < p.end) {
      return p.key
    }
  }
  return 'kan'
}

function scorePalace(wants: 'sha' | 'shui', elements: ElementKey[]): number {
  let score = 0
  for (const el of elements) {
    const matched = ELEMENT_ATTR[el] === wants
    if (el === 'bathroom') {
      // 浊水：水位得浊水仅小吉，砂位见污水主病，凶性加重
      score += matched ? 3 : -16
    }
    else {
      score += matched ? 10 : -10
    }
  }
  return score
}

// 凶宫的改善方向：按反局类型给出结构化原因，文案由前端 i18n 模板渲染
function fixKeysFor(wants: 'sha' | 'shui', elements: ElementKey[], score: number): string[] {
  if (score >= 0 || elements.length === 0) return []
  const keys: string[] = []
  const has = (el: ElementKey) => elements.includes(el)
  if (wants === 'sha') {
    if (has('bathroom')) keys.push('turbidInSha')
    if (elements.some(el => el !== 'bathroom' && ELEMENT_ATTR[el] === 'shui')) keys.push('shuiInSha')
  }
  else {
    if (elements.some(el => ELEMENT_ATTR[el] === 'sha')) keys.push('shaInShui')
    if (has('bathroom')) keys.push('turbidInShui')
  }
  return keys
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CalcInput>(event)

  if (body == null || typeof body.direction !== 'number' || Number.isNaN(body.direction)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid direction' })
  }

  const direction = normalizeDegree(body.direction)
  const locale = body.locale || 'zh-CN'

  const layout = (body.layout ?? {}) as Record<string, string[]>
  const palaces: PalaceResult[] = PALACE_DEFS.map((def) => {
    const raw = Array.isArray(layout[def.key]) ? layout[def.key]! : []
    const elements = [...new Set(raw.filter((e): e is ElementKey => ELEMENT_KEYS.includes(e as ElementKey)))].slice(0, 8)
    const score = scorePalace(def.wants, elements)
    return {
      key: def.key,
      wants: def.wants,
      theme: def.theme,
      elements,
      score,
      status: elements.length === 0 || score === 0 ? 'ping' : score > 0 ? 'ji' : 'xiong',
      fixKeys: fixKeysFor(def.wants, elements, score),
    }
  })

  const rawTotal = palaces.reduce((sum, p) => sum + p.score, 0)
  const score = Math.min(97, Math.max(5, 50 + Math.round(rawTotal * 1.2)))
  const grade: 'daji' | 'ji' | 'ping' | 'xiong' | 'daxiong'
    = score >= 80 ? 'daji' : score >= 62 ? 'ji' : score >= 42 ? 'ping' : score >= 26 ? 'xiong' : 'daxiong'

  const evaluated = palaces.filter(p => p.elements.length > 0)
  const best = evaluated.filter(p => p.score > 0).sort((a, b) => b.score - a.score)[0]?.key ?? null
  const worst = evaluated.filter(p => p.score < 0).sort((a, b) => a.score - b.score)[0]?.key ?? null

  const facing = findPalace(direction)
  const sitting = findPalace(normalizeDegree(direction + 180))

  return {
    direction: Math.round(direction),
    facing,
    sitting,
    usage: body.usage,
    palaces,
    score,
    grade,
    best,
    worst,
    locale,
  }
})
