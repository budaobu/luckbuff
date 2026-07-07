import { createHash, randomBytes } from 'node:crypto'

const MAJORS = [
  '愚者', '魔术师', '女祭司', '女皇', '皇帝', '教皇', '恋人', '战车',
  '力量', '隐士', '命运之轮', '正义', '倒吊人', '死神', '节制', '恶魔',
  '高塔', '星星', '月亮', '太阳', '审判', '世界',
]

const SUITS: Record<string, string> = { 权杖: '火', 圣杯: '水', 宝剑: '风', 星币: '土' }
const RANKS = ['Ace', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍从', '骑士', '皇后', '国王']

const MINORS: string[] = []
for (const suit of Object.keys(SUITS)) {
  for (const rank of RANKS) {
    MINORS.push(`${suit}${rank}`)
  }
}

const ELEMENTS: Record<string, string> = {
  愚者: '风', 魔术师: '风', 女祭司: '水', 女皇: '土', 皇帝: '火', 教皇: '土',
  恋人: '风', 战车: '水', 力量: '火', 隐士: '土', 命运之轮: '火', 正义: '风',
  倒吊人: '水', 死神: '水', 节制: '火', 恶魔: '土', 高塔: '火', 星星: '风',
  月亮: '水', 太阳: '火', 审判: '火', 世界: '土',
}
for (const card of MINORS) {
  const suit = card.slice(0, 2)
  ELEMENTS[card] = SUITS[suit]!
}

const CARDS = [...MAJORS, ...MINORS]

interface SpreadPosition {
  name: string
  key: number
  upright: number
}

const SPREADS: Record<string, { name: string; positions: SpreadPosition[] }> = {
  single: {
    name: '单张牌',
    positions: [{ name: '当前指引', key: 1, upright: 0 }],
  },
  three: {
    name: '三牌阵',
    positions: [
      { name: '过去', key: 0, upright: 0 },
      { name: '现在', key: 1, upright: 0 },
      { name: '未来', key: 0, upright: 1 },
    ],
  },
  diamond: {
    name: '五牌阵',
    positions: [
      { name: '核心', key: 1, upright: 0 },
      { name: '根源', key: 0, upright: 0 },
      { name: '阻力', key: 0, upright: 0 },
      { name: '潜力', key: 0, upright: 0 },
      { name: '建议', key: 1, upright: 1 },
    ],
  },
  moon: {
    name: '月亮牌阵',
    positions: [
      { name: '新月', key: 1, upright: 0 },
      { name: '上弦', key: 0, upright: 0 },
      { name: '满月', key: 1, upright: 0 },
      { name: '下弦', key: 0, upright: 0 },
    ],
  },
  horseshoe: {
    name: '马蹄形',
    positions: [
      { name: '远期过去', key: 0, upright: 0 },
      { name: '近期过去', key: 0, upright: 0 },
      { name: '当前', key: 1, upright: 0 },
      { name: '近期未来', key: 0, upright: 0 },
      { name: '外部影响', key: 1, upright: 0 },
      { name: '建议', key: 0, upright: 1 },
      { name: '结果', key: 1, upright: 1 },
    ],
  },
  celtic: {
    name: '凯尔特十字',
    positions: [
      { name: '核心', key: 1, upright: 0 },
      { name: '交叉', key: 0, upright: 0 },
      { name: '意识目标', key: 0, upright: 0 },
      { name: '根基过去', key: 0, upright: 0 },
      { name: '近期过去', key: 1, upright: 0 },
      { name: '近期未来', key: 0, upright: 0 },
      { name: '自我', key: 0, upright: 0 },
      { name: '环境', key: 0, upright: 0 },
      { name: '希望与恐惧', key: 0, upright: 0 },
      { name: '结果', key: 1, upright: 1 },
    ],
  },
}

const TIME_FACTORS: Record<string, string[]> = {
  morning: ['火', '风'],
  afternoon: ['水', '土'],
  night: ['major'],
}

function getTimeFactor(hour?: number): string {
  const h = hour ?? new Date().getHours()
  if (h >= 6 && h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'night'
}

function makeSeed(question: string): number {
  const data = randomBytes(32).toString('hex') + Date.now().toString() + question
  const hash = createHash('sha256').update(data).digest('hex')
  return Number.parseInt(hash.slice(0, 16), 16)
}

// Simple seeded random number generator (mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function weight(card: string, key: number, boosted: string[]): number {
  const isMajor = MAJORS.includes(card)
  const base = key * (isMajor ? 60 / 28 : 1)
  const hit = (boosted.includes('major') && isMajor ? 1 : 0) + (boosted.includes(ELEMENTS[card]!) ? 1 : 0)
  return base * (hit > 0 ? 1.08 : 1)
}

function seededChoice(rng: () => number, pool: string[], weights: number[]): string {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]!
    if (r <= 0) return pool[i]!
  }
  return pool[pool.length - 1]!
}

interface TarotCard {
  position: string
  card: string
  orientation: string
  is_major: boolean
  element: string
}

interface TarotDrawResult {
  seed: number
  spread: string
  spread_name: string
  question: string
  time_factor: string
  cards: TarotCard[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    spread?: string
    question?: string
    gender?: string
    seed?: number
    time_factor?: string
  }>(event)

  const spreadKey = body?.spread || 'three'
  if (!SPREADS[spreadKey]) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid spread' })
  }

  const question = body?.question || ''
  const finalSeed = body?.seed ?? makeSeed(question)
  const finalFactor = body?.time_factor || getTimeFactor()
  const spread = SPREADS[spreadKey]
  const boosted = TIME_FACTORS[finalFactor] || TIME_FACTORS.night!

  const rng = mulberry32(finalSeed)
  const pool = [...CARDS]
  const cards: TarotCard[] = []

  for (const pos of spread.positions) {
    const weights = pool.map((c) => weight(c, pos.key, boosted))
    const picked = seededChoice(rng, pool, weights)
    const idx = pool.indexOf(picked)
    if (idx === -1) continue
    pool.splice(idx, 1)

    const uprightProb = pos.upright ? 0.7 : 0.6
    cards.push({
      position: pos.name,
      card: picked,
      orientation: rng() < uprightProb ? '正位' : '逆位',
      is_major: MAJORS.includes(picked),
      element: ELEMENTS[picked] || '',
    })
  }

  return {
    seed: finalSeed,
    spread: spreadKey,
    spread_name: spread.name,
    question,
    gender: body?.gender || '',
    time_factor: finalFactor,
    cards,
  } as TarotDrawResult
})
