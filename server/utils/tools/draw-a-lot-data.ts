import guanyinLotData from '../../../app/data/guanyin-lots-100.json'
import guandiLotData from '../../../app/data/guandi-lots-100.json'
import wongTaiSinLotData from '../../../app/data/wong-tai-sin-lots-100.json'
import wenshuLotData from '../../../app/data/wenshu-lots-100.json'
import dizangLotData from '../../../app/data/dizang-lots-60.json'
import wealthGodLotData from '../../../app/data/wealth-god-lots-100.json'
import sanshanLotData from '../../../app/data/sanshan-lots-61.json'
import mazuLotData from '../../../app/data/mazu-lots-60.json'
import tudigongLotData from '../../../app/data/tudigong-lots-32.json'

export interface FortuneLot {
  number: number
  title: Record<string, string>
  level: Record<string, string>
  levelCode: 'upper' | 'upper-middle' | 'middle' | 'lower-middle' | 'lower' | 'unranked'
  poem: Record<string, string>
  explanation: Record<string, string>
  advice: Record<string, string>
  allusion?: Record<string, string>
  sacredMeaning?: Record<string, string>
}

export interface DrawALotCalcResult {
  lotType: {
    id: string
    name: string
    count: number
  }
  fortune: {
    number: number
    title: string
    level: string
    levelCode: FortuneLot['levelCode']
    poem: string
    explanation: string
    advice: string
    allusion?: string
    sacredMeaning?: string
  }
}

export interface LotType {
  id: string
  name: Record<string, string>
  count: number
  fortunes: FortuneLot[]
}

const LEVELS: Record<string, { label: Record<string, string>; code: FortuneLot['levelCode'] }> = {
  upper: {
    label: { 'zh-CN': '上签', 'zh-TW': '上簽', en: `Upper Fortune` },
    code: 'upper',
  },
  upperMiddle: {
    label: { 'zh-CN': '上平签', 'zh-TW': '上平簽', en: `Above Average` },
    code: 'upper-middle',
  },
  middle: {
    label: { 'zh-CN': '中签', 'zh-TW': '中簽', en: `Middle Fortune` },
    code: 'middle',
  },
  lowerMiddle: {
    label: { 'zh-CN': '下平签', 'zh-TW': '下平簽', en: `Below Average` },
    code: 'lower-middle',
  },
  lower: {
    label: { 'zh-CN': '下签', 'zh-TW': '下簽', en: `Lower Fortune` },
    code: 'lower',
  },
  unranked: {
    label: { 'zh-CN': '无固定吉凶', 'zh-TW': '無固定吉凶', en: `Unranked` },
    code: 'unranked',
  },
}

function makeFortune(
  number: number,
  levelKey: keyof typeof LEVELS,
  title: Record<string, string>,
  poem: Record<string, string>,
  explanation: Record<string, string>,
  advice: Record<string, string>,
  customLevel?: Record<string, string>,
  allusion?: Record<string, string>,
  sacredMeaning?: Record<string, string>,
): FortuneLot {
  return {
    number,
    title,
    level: customLevel ?? LEVELS[levelKey]!.label,
    levelCode: LEVELS[levelKey]!.code,
    poem,
    explanation,
    advice,
    allusion,
    sacredMeaning,
  }
}

// 观音灵签：100 签完整数据，源文件见 app/data/guanyin-lots-100.json

const guanyinFortunes: FortuneLot[] = guanyinLotData.map(item => makeFortune(
  item.id,
  item.levelCode as FortuneLot['levelCode'],
  item.title,
  item.poetry,
  item.meaning,
  item.explanation,
))

// 五路财神签：完整 100 签，源文件见 app/data/wealth-god-lots-100.json

const wealthGodFortunes: FortuneLot[] = wealthGodLotData.map(item => makeFortune(
  item.id,
  item.levelCode as FortuneLot['levelCode'],
  item.title,
  item.poem,
  item.explanation,
  item.advice,
  item.customLevel,
))

// 三山国王灵签：61 签完整数据，源文件见 app/data/sanshan-lots-61.json

const sanshanFortunes: FortuneLot[] = sanshanLotData.map(item => makeFortune(
  item.id,
  item.levelCode as FortuneLot['levelCode'],
  { 'zh-CN': item.title, 'zh-TW': item.title, en: item.title },
  { 'zh-CN': item.poem, 'zh-TW': item.poem, en: item.poem },
  { 'zh-CN': item.explanation, 'zh-TW': item.explanation, en: item.explanation },
  { 'zh-CN': item.advice, 'zh-TW': item.advice, en: item.advice },
  item.customLevel,
))

// 妈祖灵签：60 签完整数据，源文件见 app/data/mazu-lots-60.json

const mazuFortunes: FortuneLot[] = mazuLotData.map(item => makeFortune(
  item.id,
  item.levelCode as FortuneLot['levelCode'],
  { 'zh-CN': item.title, 'zh-TW': item.title, en: item.title },
  { 'zh-CN': item.poem, 'zh-TW': item.poem, en: item.poem },
  { 'zh-CN': item.explanation, 'zh-TW': item.explanation, en: item.explanation },
  { 'zh-CN': item.advice, 'zh-TW': item.advice, en: item.advice },
  item.customLevel,
))

// 关帝灵签：Wikisource 清刊本百签事实层，源文件见 app/data/guandi-lots-100.json

const guandiFortunes: FortuneLot[] = guandiLotData.map(item => makeFortune(
  item.id,
  (item.levelCode === 'lower-middle' ? 'lowerMiddle' : item.levelCode) as FortuneLot['levelCode'],
  item.title,
  item.poem,
  item.explanation,
  item.advice,
  item.level,
))

// 黄大仙灵签：100 签完整事实层，解释层采用 MIT 许可的配套数据

const wongTaiSinFortunes: FortuneLot[] = wongTaiSinLotData.map(item => makeFortune(
  item.id,
  item.levelCode === 'upper'
    ? 'upper'
    : item.levelCode === 'lower' ? 'lower' : 'middle',
  item.title,
  item.poem,
  item.explanation,
  item.advice,
  item.customLevel,
  item.allusion,
))

// 文殊菩萨灵签：100 签事实层；网页长文解释未采用，指引为自写内容。

const wenshuFortunes: FortuneLot[] = wenshuLotData.map(item => makeFortune(
  item.id,
  item.levelCode as FortuneLot['levelCode'],
  item.title,
  item.poem,
  item.explanation,
  item.advice,
  undefined,
  undefined,
  item.sacredMeaning,
))

// 地藏王菩萨灵签：60 签事实层；该体系不设统一吉凶等级，现代长文解释未搬运。

const dizangFortunes: FortuneLot[] = dizangLotData.map(item => makeFortune(
  item.id,
  'unranked',
  item.title,
  item.poem,
  item.explanation,
  item.advice,
  item.level,
  undefined,
  item.sacredMeaning,
))

// 土地公灵签：32 签事实层，含签号、吉凶、签诗、断曰与米力仙注。

const tudigongFortunes: FortuneLot[] = tudigongLotData.map(item => makeFortune(
  item.id,
  (item.levelCode === 'upper-middle'
    ? 'upperMiddle'
    : item.levelCode === 'lower-middle' ? 'lowerMiddle' : item.levelCode) as keyof typeof LEVELS,
  item.title,
  item.poem,
  item.explanation,
  item.advice,
  item.level,
  undefined,
  item.sacredMeaning,
))


export const LOT_TYPES: LotType[] = [
  {
    id: 'guanyin',
    name: { 'zh-CN': '观音灵签', 'zh-TW': '觀音靈簽', en: `Guanyin Oracle` },
    count: guanyinFortunes.length,
    fortunes: guanyinFortunes,
  },
  {
    id: 'wealth-god',
    name: { 'zh-CN': '五路财神签', 'zh-TW': '五路財神簽', en: `Five Gods of Wealth Lot` },
    count: wealthGodFortunes.length,
    fortunes: wealthGodFortunes,
  },
  {
    id: 'sanshan',
    name: { 'zh-CN': '三山国王灵签', 'zh-TW': '三山國王靈簽', en: `Three Mountain Kings Lot` },
    count: sanshanFortunes.length,
    fortunes: sanshanFortunes,
  },
  {
    id: 'mazu',
    name: { 'zh-CN': '妈祖灵签', 'zh-TW': '媽祖靈簽', en: `Mazu Oracle` },
    count: mazuFortunes.length,
    fortunes: mazuFortunes,
  },
  {
    id: 'guandi',
    name: { 'zh-CN': '关帝灵签', 'zh-TW': '關帝靈簽', en: `Guandi Oracle` },
    count: guandiFortunes.length,
    fortunes: guandiFortunes,
  },
  {
    id: 'wong-tai-sin',
    name: { 'zh-CN': '黄大仙灵签', 'zh-TW': '黃大仙靈籤', en: 'Wong Tai Sin Oracle' },
    count: wongTaiSinFortunes.length,
    fortunes: wongTaiSinFortunes,
  },
  {
    id: 'wenshu',
    name: { 'zh-CN': '文殊菩萨灵签', 'zh-TW': '文殊菩薩靈籤', en: 'Manjushri Oracle' },
    count: wenshuFortunes.length,
    fortunes: wenshuFortunes,
  },
  {
    id: 'dizang',
    name: { 'zh-CN': '地藏王菩萨灵签', 'zh-TW': '地藏王菩薩靈籤', en: 'Dizang Oracle' },
    count: dizangFortunes.length,
    fortunes: dizangFortunes,
  },
  {
    id: 'tudigong',
    name: { 'zh-CN': '土地公灵签', 'zh-TW': '土地公靈籤', en: `Tudigong Oracle` },
    count: tudigongFortunes.length,
    fortunes: tudigongFortunes,
  },
]

export function getLotType(id: string): LotType | undefined {
  return LOT_TYPES.find(t => t.id === id)
}

export function getFortuneByNumber(id: string, number: number, locale: string): {
  lotType: LotType
  fortune: FortuneLot
  locale: string
} {
  const lotType = getLotType(id)
  if (!lotType) throw createError({ statusCode: 400, statusMessage: `Unknown lot type: ${id}` })
  const fortune = lotType.fortunes.find(item => item.number === number)
  if (!fortune) throw createError({ statusCode: 404, statusMessage: `Lot not found: ${number}` })
  return { lotType, fortune, locale: locale || 'zh-CN' }
}

export function drawFortune(id: string, locale: string): { lotType: LotType; fortune: FortuneLot; locale: string } {
  const lotType = getLotType(id)
  if (!lotType) {
    throw createError({ statusCode: 400, statusMessage: `Unknown lot type: ${id}` })
  }
  const number = Math.floor(Math.random() * lotType.count) + 1
  const fortune = lotType.fortunes.find(f => f.number === number)!
  return { lotType, fortune, locale: locale || 'zh-CN' }
}
