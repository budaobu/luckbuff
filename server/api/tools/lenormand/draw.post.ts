import { createHash, randomBytes } from 'node:crypto'

// 雷诺曼36张牌
const CARDS = [
  { id: 1, name: '骑手', nameEn: 'Rider', keyword: '消息·动态·新闻' },
  { id: 2, name: '三叶草', nameEn: 'Clover', keyword: '幸运·小确幸·短暂好运' },
  { id: 3, name: '船', nameEn: 'Ship', keyword: '旅行·商业·远方·冒险' },
  { id: 4, name: '房子', nameEn: 'House', keyword: '家庭·安全感·稳定·房产' },
  { id: 5, name: '树', nameEn: 'Tree', keyword: '健康·成长·时间·生命力' },
  { id: 6, name: '云', nameEn: 'Clouds', keyword: '困惑·混乱·不确定性' },
  { id: 7, name: '蛇', nameEn: 'Snake', keyword: '诱惑·背叛·智慧·曲折' },
  { id: 8, name: '棺材', nameEn: 'Coffin', keyword: '结束·转化·疾病·低谷' },
  { id: 9, name: '花束', nameEn: 'Bouquet', keyword: '礼物·快乐·社交·美好' },
  { id: 10, name: '镰刀', nameEn: 'Scythe', keyword: '突然·切割·危险·收获' },
  { id: 11, name: '鞭子', nameEn: 'Whip', keyword: '冲突·争论·重复·运动' },
  { id: 12, name: '鸟', nameEn: 'Birds', keyword: '沟通·焦虑·八卦·闲聊' },
  { id: 13, name: '孩子', nameEn: 'Child', keyword: '新生·纯真·开始·小规模' },
  { id: 14, name: '狐狸', nameEn: 'Fox', keyword: '狡猾·工作·欺骗·警惕' },
  { id: 15, name: '熊', nameEn: 'Bear', keyword: '力量·财富·权威·母亲' },
  { id: 16, name: '星星', nameEn: 'Stars', keyword: '希望·指引·梦想·网络' },
  { id: 17, name: '鹳', nameEn: 'Stork', keyword: '改变·搬家·进步·提升' },
  { id: 18, name: '狗', nameEn: 'Dog', keyword: '忠诚·友谊·信任·陪伴' },
  { id: 19, name: '塔', nameEn: 'Tower', keyword: '孤独·权威·隔离·机构' },
  { id: 20, name: '花园', nameEn: 'Garden', keyword: '社交·公众·聚会·网络' },
  { id: 21, name: '山', nameEn: 'Mountain', keyword: '障碍·延迟·挑战·停滞' },
  { id: 22, name: '十字路口', nameEn: 'Crossroads', keyword: '选择·决定·多重路径' },
  { id: 23, name: '老鼠', nameEn: 'Mice', keyword: '消耗·焦虑·损失·侵蚀' },
  { id: 24, name: '心', nameEn: 'Heart', keyword: '爱情·感情·热情·浪漫' },
  { id: 25, name: '戒指', nameEn: 'Ring', keyword: '承诺·合同·循环·绑定' },
  { id: 26, name: '书', nameEn: 'Book', keyword: '知识·秘密·教育·隐藏' },
  { id: 27, name: '信', nameEn: 'Letter', keyword: '消息·文件·沟通·文字' },
  { id: 28, name: '男人', nameEn: 'Man', keyword: '男性·主动方·提问者' },
  { id: 29, name: '女人', nameEn: 'Woman', keyword: '女性·被动方·提问者' },
  { id: 30, name: '百合', nameEn: 'Lilies', keyword: '纯洁·老年·智慧·和平' },
  { id: 31, name: '太阳', nameEn: 'Sun', keyword: '成功·活力·清晰·能量' },
  { id: 32, name: '月亮', nameEn: 'Moon', keyword: '声誉·直觉·情绪·认可' },
  { id: 33, name: '钥匙', nameEn: 'Key', keyword: '答案·解决·命运·重要性' },
  { id: 34, name: '鱼', nameEn: 'Fish', keyword: '财富·商业·丰富·自由' },
  { id: 35, name: '锚', nameEn: 'Anchor', keyword: '稳定·长期·工作·安全' },
  { id: 36, name: '十字架', nameEn: 'Cross', keyword: '负担·命运·痛苦·信仰' },
]

interface SpreadPosition {
  name: string
}

const SPREADS: Record<string, { name: string; positions: SpreadPosition[] }> = {
  single: {
    name: '单张牌',
    positions: [{ name: '核心指引' }],
  },
  three: {
    name: '三张牌',
    positions: [
      { name: '过去/根源' },
      { name: '现在/核心' },
      { name: '未来/走向' },
    ],
  },
  five: {
    name: '五张牌阵',
    positions: [
      { name: '过去' },
      { name: '现在' },
      { name: '未来' },
      { name: '建议' },
      { name: '结果' },
    ],
  },
  nine: {
    name: '九宫格',
    positions: [
      { name: '整体主题' },
      { name: '挑战/障碍' },
      { name: ' subconscious/隐藏' },
      { name: '过去基础' },
      { name: '核心/现在' },
      { name: '未来趋势' },
      { name: '自我认知' },
      { name: '环境影响' },
      { name: '希望与结果' },
    ],
  },
  grand: {
    name: '大桌牌阵',
    positions: [
      { name: '骑手' }, { name: '三叶草' }, { name: '船' }, { name: '房子' },
      { name: '树' }, { name: '云' }, { name: '蛇' }, { name: '棺材' },
      { name: '花束' }, { name: '镰刀' }, { name: '鞭子' }, { name: '鸟' },
      { name: '孩子' }, { name: '狐狸' }, { name: '熊' }, { name: '星星' },
      { name: '鹳' }, { name: '狗' }, { name: '塔' }, { name: '花园' },
      { name: '山' }, { name: '十字路口' }, { name: '老鼠' }, { name: '心' },
      { name: '戒指' }, { name: '书' }, { name: '信' }, { name: '男人' },
      { name: '女人' }, { name: '百合' }, { name: '太阳' }, { name: '月亮' },
      { name: '钥匙' }, { name: '鱼' }, { name: '锚' }, { name: '十字架' },
    ],
  },
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

interface LenormandCard {
  position: string
  id: number
  name: string
  nameEn: string
  keyword: string
}

interface LenormandDrawResult {
  seed: number
  spread: string
  spread_name: string
  question: string
  gender: string
  birthYear: number | null
  cards: LenormandCard[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    spread?: string
    question?: string
    gender?: string
    birthYear?: number
    seed?: number
  }>(event)

  const spreadKey = body?.spread || 'three'
  if (!SPREADS[spreadKey]) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid spread' })
  }

  const question = body?.question || ''
  const finalSeed = body?.seed ?? makeSeed(question)
  const spread = SPREADS[spreadKey]

  const rng = mulberry32(finalSeed)
  const pool = [...CARDS]
  const cards: LenormandCard[] = []

  for (const pos of spread.positions) {
    const idx = Math.floor(rng() * pool.length)
    const picked = pool[idx]
    if (!picked) continue
    pool.splice(idx, 1)

    cards.push({
      position: pos.name,
      id: picked.id,
      name: picked.name,
      nameEn: picked.nameEn,
      keyword: picked.keyword,
    })
  }

  return {
    seed: finalSeed,
    spread: spreadKey,
    spread_name: spread.name,
    question,
    gender: body?.gender || '',
    birthYear: body?.birthYear || null,
    cards,
  } as LenormandDrawResult
})
