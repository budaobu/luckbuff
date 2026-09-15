import { createHash, randomBytes } from 'node:crypto'
import cardsJson from '../../data/thai-tarot/cards.json'

export type ThaiTarotSpreadKey =
  | 'single'
  | 'past-present-future'
  | 'situation-challenge-advice'
  | 'relationship'
  | 'decision-compass'
  | 'cross'
  | 'celtic-cross'

export type ThaiTarotSuit = 'Wands' | 'Cups' | 'Swords' | 'Pentacles'
export type ThaiTarotOrientation = 'upright' | 'reversed'

export interface ThaiTarotSpreadPosition {
  key: string
  labelZh: string
  labelEn: string
  labelTh: string
}

export interface ThaiTarotSpread {
  key: ThaiTarotSpreadKey
  nameZh: string
  nameEn: string
  nameTh: string
  positions: ThaiTarotSpreadPosition[]
}

export interface ThaiTarotCardData {
  id: string
  key: string
  title: string
  englishName: string
  thaiName: string
  numberLabel: string
  rank: number
  ordinal: number
  group: string
  isMajor: boolean
  suit: ThaiTarotSuit | null
  element: string
  astrology: string
  season: string
  direction: string
  meaning: string
  upright: string
  reversed: string
  keywords: string[]
  places: { major: string, minor: string }
  occupations: string
  person: string
  love: string
  work: string
  money: string
  health: string
  advice: string
  yesNo: 'Yes' | 'No' | 'Maybe'
  timing: string
  rwsSymbols: string[]
  journalQuestions: string[]
}

export interface ThaiTarotDrawnCard extends ThaiTarotCardData {
  position: ThaiTarotSpreadPosition
  orientation: ThaiTarotOrientation
}

export interface ThaiTarotInput {
  question: string
  spread: ThaiTarotSpreadKey
  includeReversed?: boolean
  seed?: number
}

export interface ThaiTarotSummary {
  majorCount: number
  minorCount: number
  uprightCount: number
  reversedCount: number
  suitCounts: Array<{ suit: ThaiTarotSuit, count: number }>
  yesNoCounts: Array<{ value: 'Yes' | 'No' | 'Maybe', count: number }>
}

export interface ThaiTarotResult {
  question: string
  spread: ThaiTarotSpread
  includeReversed: boolean
  seed: number
  cards: ThaiTarotDrawnCard[]
  summary: ThaiTarotSummary
  methodology: {
    system: string
    deckCoverage: string
    reversalPolicy: string
    randomness: string
  }
  source: {
    attribution: string
    repository: string
    license: string
    disclaimer: string
  }
}

export const THAI_TAROT_CARDS = cardsJson as ThaiTarotCardData[]

const SUITS: ThaiTarotSuit[] = ['Wands', 'Cups', 'Swords', 'Pentacles']
const YES_NO_VALUES = ['Yes', 'No', 'Maybe'] as const

export const THAI_TAROT_SPREADS: Record<ThaiTarotSpreadKey, ThaiTarotSpread> = {
  single: {
    key: 'single',
    nameZh: '单张牌',
    nameEn: 'One Card',
    nameTh: 'ไพ่หนึ่งใบ',
    positions: [
      { key: 'focus', labelZh: '当前关注', labelEn: 'Main focus', labelTh: 'สิ่งที่ควรใส่ใจ' },
    ],
  },
  'past-present-future': {
    key: 'past-present-future',
    nameZh: '过去·现在·未来',
    nameEn: 'Past / Present / Future',
    nameTh: 'อดีต · ปัจจุบัน · อนาคต',
    positions: [
      { key: 'past', labelZh: '仍有影响的过去', labelEn: 'Influential past', labelTh: 'อดีตที่ยังมีอิทธิพล' },
      { key: 'present', labelZh: '当前状态', labelEn: 'Present state', labelTh: 'สภาพปัจจุบัน' },
      { key: 'future', labelZh: '当前路径的趋势', labelEn: 'Current trajectory', labelTh: 'แนวโน้มหากยังเดินแบบเดิม' },
    ],
  },
  'situation-challenge-advice': {
    key: 'situation-challenge-advice',
    nameZh: '情况·挑战·建议',
    nameEn: 'Situation / Challenge / Advice',
    nameTh: 'สถานการณ์ · ความท้าทาย · คำแนะนำ',
    positions: [
      { key: 'situation', labelZh: '情况', labelEn: 'Situation', labelTh: 'สถานการณ์' },
      { key: 'challenge', labelZh: '挑战或盲点', labelEn: 'Challenge or blind spot', labelTh: 'ความท้าทายหรือสิ่งที่มองข้าม' },
      { key: 'advice', labelZh: '有用回应或建议', labelEn: 'Helpful response', labelTh: 'คำแนะนำหรือการตอบสนองที่เป็นประโยชน์' },
    ],
  },
  relationship: {
    key: 'relationship',
    nameZh: '自己·对方·关系动态',
    nameEn: 'You / Other / Dynamic',
    nameTh: 'คุณ · อีกฝ่าย · พลวัต',
    positions: [
      { key: 'you', labelZh: '你的姿态或需求', labelEn: 'Your stance or need', labelTh: 'ท่าทีหรือความต้องการของผู้ถาม' },
      { key: 'other', labelZh: '对方的可见面向', labelEn: 'Observable other', labelTh: 'สิ่งที่สังเกตได้จากอีกฝ่ายหรือบริบทของอีกฝ่าย' },
      { key: 'dynamic', labelZh: '关系动态与沟通', labelEn: 'Relationship dynamic', labelTh: 'พลวัตระหว่างกันและสิ่งที่ควรสื่อสาร' },
    ],
  },
  'decision-compass': {
    key: 'decision-compass',
    nameZh: '决策罗盘',
    nameEn: 'Decision Compass',
    nameTh: 'เข็มทิศการตัดสินใจ',
    positions: [
      { key: 'core', labelZh: '决策核心', labelEn: 'Core decision', labelTh: 'แก่นของการตัดสินใจ' },
      { key: 'support', labelZh: '支持因素', labelEn: 'Support', labelTh: 'สิ่งที่สนับสนุนทางเลือก' },
      { key: 'cost', labelZh: '风险或代价', labelEn: 'Risk or cost', labelTh: 'ความเสี่ยงหรือราคาที่ต้องจ่าย' },
      { key: 'gap', labelZh: '缺失信息或价值', labelEn: 'Missing information', labelTh: 'ข้อมูลหรือคุณค่าที่ขาด' },
      { key: 'next', labelZh: '可试行的下一步', labelEn: 'Testable next step', labelTh: 'ก้าวถัดไปที่ทดลองได้' },
    ],
  },
  cross: {
    key: 'cross',
    nameZh: '五牌十字',
    nameEn: 'Five Card Cross',
    nameTh: 'ผังกากบาทห้าใบ',
    positions: [
      { key: 'present', labelZh: '当前', labelEn: 'Present', labelTh: 'ปัจจุบัน' },
      { key: 'obstacle', labelZh: '障碍', labelEn: 'Obstacle', labelTh: 'อุปสรรค' },
      { key: 'root', labelZh: '根源', labelEn: 'Root', labelTh: 'รากของเรื่อง' },
      { key: 'resource', labelZh: '资源', labelEn: 'Resource', labelTh: 'ทรัพยากรที่มี' },
      { key: 'path', labelZh: '前方路径', labelEn: 'Path ahead', labelTh: 'แนวทางข้างหน้า' },
    ],
  },
  'celtic-cross': {
    key: 'celtic-cross',
    nameZh: '凯尔特十字',
    nameEn: 'Celtic Cross',
    nameTh: 'ผังกากบาทเซลติก',
    positions: [
      { key: 'present', labelZh: '核心情况', labelEn: 'Present', labelTh: 'สถานการณ์แกนกลาง' },
      { key: 'crossing', labelZh: '助力或阻力', labelEn: 'Crossing force', labelTh: 'แรงส่งหรือแรงต้าน' },
      { key: 'foundation', labelZh: '根基', labelEn: 'Foundation', labelTh: 'รากหรือแรงผลักเบื้องล่าง' },
      { key: 'recent-past', labelZh: '近期过去', labelEn: 'Recent past', labelTh: 'สิ่งที่เพิ่งผ่านและยังมีผล' },
      { key: 'conscious-aim', labelZh: '意识目标', labelEn: 'Conscious aim', labelTh: 'เป้าหมายหรือสิ่งที่ผู้ถามรับรู้' },
      { key: 'near-trajectory', labelZh: '近期趋势', labelEn: 'Near trajectory', labelTh: 'แนวโน้มระยะใกล้' },
      { key: 'self', labelZh: '自我姿态', labelEn: 'Self', labelTh: 'ท่าทีและบทบาทของผู้ถาม' },
      { key: 'environment', labelZh: '环境与关系', labelEn: 'Environment', labelTh: 'สภาพแวดล้อมและสิ่งที่สังเกตได้จากผู้อื่น' },
      { key: 'hopes-fears', labelZh: '希望与恐惧', labelEn: 'Hopes and fears', labelTh: 'ความหวังและความกลัว' },
      { key: 'direction', labelZh: '可能方向', labelEn: 'Likely direction', labelTh: 'ทิศทางหากรูปแบบปัจจุบันดำเนินต่อ' },
    ],
  },
}

function makeSeed(question: string) {
  const material = `${randomBytes(32).toString('hex')}${Date.now()}${question}`
  return Number.parseInt(createHash('sha256').update(material).digest('hex').slice(0, 12), 16)
}

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function countBy<T extends string>(values: Array<T | null>, allowed: readonly T[]) {
  return allowed
    .map(value => ({ value, count: values.filter(item => item === value).length }))
    .filter(item => item.count > 0)
}

export function isValidThaiTarotResult(value: unknown): value is ThaiTarotResult {
  if (!value || typeof value !== 'object') return false
  const result = value as Partial<ThaiTarotResult>
  return Boolean(
    result.question
    && result.spread
    && Array.isArray(result.cards)
    && result.cards.length > 0
    && result.cards.every(card => Boolean(card?.id && card?.englishName && card?.position?.key)),
  )
}

export function buildThaiTarotContext(result: ThaiTarotResult) {
  const cards = result.cards.map((card, index) => {
    const canonical = THAI_TAROT_CARDS.find(item => item.id === card.id)
    if (!canonical) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid Thai tarot card' })
    }
    card = { ...canonical, position: card.position, orientation: card.orientation }
    const meaning = card.orientation === 'reversed' ? card.reversed : card.upright
    return [
      `${index + 1}. ${card.position.labelZh}/${card.position.labelEn}`,
      `牌：${card.englishName} / ${card.thaiName}；${card.isMajor ? '大阿卡纳' : `小阿卡纳 ${card.suit}`}`,
      `方位：${card.orientation === 'reversed' ? '逆位' : '正位'}；元素：${card.element}；占星对应：${card.astrology}`,
      `关键词：${card.keywords.join('、')}`,
      `核心：${card.meaning}；本位意义：${meaning}`,
      `建议：${card.advice}；Yes/No：${card.yesNo}；时间提示：${card.timing}`,
      `现实层：爱情=${card.love} 工作=${card.work} 金钱=${card.money} 健康=${card.health}`,
    ].join('\n')
  }).join('\n\n')

  return [
    `体系：泰语语境 Rider-Waite-Smith 塔罗（78/78 张）`,
    `牌阵：${result.spread.nameZh} / ${result.spread.nameTh}`,
    `问题：${result.question || '（未填写）'}`,
    `正逆位：${result.includeReversed ? '启用' : '仅正位'}；Seed：${result.seed}`,
    `统计：大阿卡纳 ${result.summary.majorCount}，小阿卡纳 ${result.summary.minorCount}，逆位 ${result.summary.reversedCount}`,
    `花色：${result.summary.suitCounts.map(item => `${item.suit} ${item.count}`).join('、') || '无'}`,
    '抽到的牌：',
    cards,
  ].join('\n')
}

export function drawThaiTarot(input: ThaiTarotInput): ThaiTarotResult {
  const question = input.question?.trim() ?? ''
  if (!question) {
    throw createError({ statusCode: 400, statusMessage: '请填写要反思的问题' })
  }
  if (question.length > 500) {
    throw createError({ statusCode: 400, statusMessage: '问题请控制在 500 字以内' })
  }

  const spread = THAI_TAROT_SPREADS[input.spread]
  if (!spread) {
    throw createError({ statusCode: 400, statusMessage: '无效的牌阵' })
  }

  const includeReversed = input.includeReversed ?? true
  const seed = Number.isFinite(input.seed) && Number(input.seed) >= 0
    ? Math.floor(Number(input.seed))
    : makeSeed(question)
  const rng = mulberry32(seed)
  const deck = [...THAI_TAROT_CARDS]
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j]!, deck[i]!]
  }

  const cards = spread.positions.map((position, index) => {
    const card = deck[index]!
    const reversed = includeReversed && rng() < 0.36
    return {
      ...card,
      position,
      orientation: reversed ? 'reversed' : 'upright',
    } satisfies ThaiTarotDrawnCard
  })

  return {
    question,
    spread,
    includeReversed,
    seed,
    cards,
    summary: {
      majorCount: cards.filter(card => card.isMajor).length,
      minorCount: cards.filter(card => !card.isMajor).length,
      uprightCount: cards.filter(card => card.orientation === 'upright').length,
      reversedCount: cards.filter(card => card.orientation === 'reversed').length,
      suitCounts: countBy(
        cards.map(card => card.suit),
        SUITS,
      ).map(({ value, count }) => ({ suit: value, count })),
      yesNoCounts: countBy(
        cards.map(card => card.yesNo),
        YES_NO_VALUES,
      ),
    },
    methodology: {
      system: 'Thai-language Rider-Waite-Smith tarot',
      deckCoverage: '78/78 cards',
      reversalPolicy: includeReversed ? 'upright and reversed' : 'upright only',
      randomness: 'seeded Fisher-Yates shuffle',
    },
    source: {
      attribution: 'Card meanings adapted from iamlamure/thai-tarot-rws-skill; RWS framework by A. E. Waite and Pamela Colman Smith.',
      repository: 'https://github.com/iamlamure/thai-tarot-rws-skill',
      license: 'MIT',
      disclaimer: 'Symbolic reflection only; not medical, legal, financial, or safety advice.',
    },
  }
}
