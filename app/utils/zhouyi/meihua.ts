import type { GuaResult } from '~/types/zhouyi'
import { LIUSHISI_GUA, getYaoArray, findGuaByYao } from './constants'
import { getGuaStrategy } from './strategy'
import { toLunar } from 'lunar'
import cnchar from 'cnchar'

// ==================== 先天八卦数 ====================
// 乾1 兑2 离3 震4 巽5 坎6 艮7 坤8
// Python 二进制（从上往下）：乾111 兑011 离101 震001 巽110 坎010 艮100 坤000
const BAGUA_WUXING: Record<number, string> = {
  1: '金', 2: '金', 3: '火', 4: '木',
  5: '木', 6: '水', 7: '土', 8: '土',
}

const BAGUA_NAMES = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']

// ==================== 地支序数 ====================
const DIZHI_SEQ: Record<string, number> = {
  '子': 1, '丑': 2, '寅': 3, '卯': 4,
  '辰': 5, '巳': 6, '午': 7, '未': 8,
  '申': 9, '酉': 10, '戌': 11, '亥': 12,
}
const DIZHI_LIST = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// ==================== 五行生克 ====================
const WUXING_SHENG: Record<string, string> = {
  '金': '水', '水': '木', '木': '火', '火': '土', '土': '金',
}
const WUXING_KE: Record<string, string> = {
  '金': '木', '木': '土', '土': '水', '水': '火', '火': '金',
}

// ==================== 季节旺衰 ====================
const SEASON_WUXING: Record<number, string> = {
  0: '水', 1: '水', 2: '木', 3: '木', 4: '火', 5: '火',
  6: '土', 7: '土', 8: '金', 9: '金', 10: '水', 11: '水',
}

// ==================== 爻位系数（统计分析）====================
const POSITION_COEFFICIENTS: Record<number, number> = {
  5: 0.422,   // 九五之尊 最佳
  2: 0.344,   // 得中 佳
  4: 0.266,   // 中
  1: 0.234,   // 中
  6: 0.031,   // 差
  3: -0.219,  // 三多凶 最差
}

const POSITION_YINYANG_COEFFICIENTS: Record<string, number> = {
  '1,true': 0.281, '1,false': 0.188,
  '2,true': 0.312, '2,false': 0.375,
  '3,true': -0.375, '3,false': -0.062,
  '4,true': 0.281, '4,false': 0.250,
  '5,true': 0.344, '5,false': 0.500,
  '6,true': 0.000, '6,false': 0.062,
}

// ==================== 策略下一步建议 ====================
const STRATEGY_NEXT_STEPS: Record<string, string> = {
  '留': '维持现状，不宜改变。目前位置有利，变动反而损失。',
  '走': '积极改变，离开当前状态。此位置不利久留，宜主动求变。',
  '守': '稳守不动，静观其变。位置尚可，不主动出击，等待时机。',
  '变': '必须改变，不变则困。当前困境需主动突破，犹豫更糟。',
  '慎': '谨慎行事，小心陷阱。周围环境不佳，任何动作都要三思。',
  '观': '观察局势，再做决定。情况中等，需要更多信息才能判断。',
}

// ==================== 公共类型 ====================
export interface MeihuaResult extends GuaResult {
  shangGuaId: number
  xiaGuaId: number
  huGuaId: number
  tiGuaId: number
  yongGuaId: number
  tiWuxing: string
  yongWuxing: string
  shengkeRelation: string
  shengkeResult: string
  seasonWuxing: string
  tiWangshuai: string
  yongWangshuai: string
  strategyType?: string
  strategyAction?: string
  strategyNextStep?: string
  jiRate?: number
  changePath?: string
  positionRisk?: {
    coefficient: number
    riskLevel: string
    warning: string | null
  }
  timeLevels: {
    yongGua: string
    huGua: string
    bianGua: string
  }
  lunarDate?: { year: number; month: number; day: number; isLeap: boolean; dizhi: string; dizhiNum: number }
}

// ==================== 工具函数 ====================

function numToGua(n: number): number {
  const r = n % 8
  return r === 0 ? 8 : r
}

function numToYao(n: number): number {
  const r = n % 6
  return r === 0 ? 6 : r
}

function getYearDizhi(lunarYear: number): { num: number; name: string } {
  let num = ((lunarYear - 1900) % 12) + 1
  if (num === 13) num = 1
  return { num, name: DIZHI_LIST[num - 1]! }
}

function getShichen(hour: number): { num: number; name: string } {
  const map: Record<number, [number, string]> = {
    0: [1, '子'], 1: [2, '丑'], 2: [2, '丑'],
    3: [3, '寅'], 4: [3, '寅'], 5: [4, '卯'],
    6: [4, '卯'], 7: [5, '辰'], 8: [5, '辰'],
    9: [6, '巳'], 10: [6, '巳'], 11: [7, '午'],
    12: [7, '午'], 13: [8, '未'], 14: [8, '未'],
    15: [9, '申'], 16: [9, '申'], 17: [10, '酉'],
    18: [10, '酉'], 19: [11, '戌'], 20: [11, '戌'],
    21: [12, '亥'], 22: [12, '亥'], 23: [1, '子'],
  }
  const [n, name] = map[hour] || [1, '子']
  return { num: n, name }
}

function getWangshuai(wuxing: string, seasonWuxing: string): string {
  if (wuxing === seasonWuxing) return '旺'
  const shengWuxing = Object.entries(WUXING_SHENG).find(([, v]) => v === wuxing)?.[0]
  if (shengWuxing === seasonWuxing) return '相'
  if (WUXING_SHENG[wuxing]! === seasonWuxing) return '休'
  if (WUXING_KE[seasonWuxing]! === wuxing) return '囚'
  return '死'
}

function analyzeWuxing(tiElement: string, yongElement: string): { relation: string; result: string } {
  if (tiElement === yongElement) return { relation: '比和', result: '吉' }
  if (WUXING_SHENG[yongElement]! === tiElement) return { relation: '用生体', result: '大吉' }
  if (WUXING_SHENG[tiElement]! === yongElement) return { relation: '体生用', result: '泄耗' }
  if (WUXING_KE[tiElement]! === yongElement) return { relation: '体克用', result: '吉' }
  if (WUXING_KE[yongElement]! === tiElement) return { relation: '用克体', result: '凶' }
  return { relation: '未知', result: '平' }
}

function getPositionRisk(position: number, isYang: boolean) {
  const key = `${position},${isYang}`
  const coef = POSITION_YINYANG_COEFFICIENTS[key] || 0

  if (position === 3 && isYang) {
    return { coefficient: coef, riskLevel: '高风险', warning: '三位阳爻是全表最凶的组合' }
  }
  if (position === 5) return { coefficient: coef, riskLevel: '最佳', warning: null }
  if (position === 2) return { coefficient: coef, riskLevel: '佳', warning: null }
  if (coef < 0) return { coefficient: coef, riskLevel: '较差', warning: `爻位系数为负值 (${coef.toFixed(3)})` }
  return { coefficient: coef, riskLevel: '中等', warning: null }
}

// ==================== 核心分析 ====================

function analyzeHexagram(
  upperGua: number,
  lowerGua: number,
  dongYao: number,
): MeihuaResult {
  const benGua = LIUSHISI_GUA.find(g => g.shangGua === upperGua && g.xiaGua === lowerGua)
  if (!benGua) throw new Error(`无法找到对应卦象：上卦${upperGua} 下卦${lowerGua}`)

  const benYao = getYaoArray(benGua)

  // 变卦
  const bianYao = [...benYao]
  bianYao[dongYao - 1] = bianYao[dongYao - 1] === 1 ? 0 : 1
  const bianGua = findGuaByYao(bianYao)
  if (!bianGua) throw new Error('无法找到变卦')

  // 互卦（2-3-4爻为下互，3-4-5爻为上互）
  const huXia = [benYao[1]!, benYao[2]!, benYao[3]!]
  const huShang = [benYao[2]!, benYao[3]!, benYao[4]!]
  const huGua = findGuaByYao([...huXia, ...huShang])
  if (!huGua) throw new Error('无法找到互卦')

  // 体用判定（按 SKILL.md 标准）
  // 动爻>3（上卦）→ 下卦为体，上卦为用
  // 动爻≤3（下卦）→ 上卦为体，下卦为用
  let tiGuaId: number
  let yongGuaId: number
  let tiPos: string
  let yongPos: string

  if (dongYao > 3) {
    tiGuaId = lowerGua
    yongGuaId = upperGua
    tiPos = '下卦'
    yongPos = '上卦'
  } else {
    tiGuaId = upperGua
    yongGuaId = lowerGua
    tiPos = '上卦'
    yongPos = '下卦'
  }

  const tiWuxing = BAGUA_WUXING[tiGuaId]!
  const yongWuxing = BAGUA_WUXING[yongGuaId]!
  const sk = analyzeWuxing(tiWuxing, yongWuxing)

  // 季节旺衰（用公历月份判断）
  const now = new Date()
  const seasonWuxing = SEASON_WUXING[now.getMonth()] || '土'
  const tiWangshuai = getWangshuai(tiWuxing, seasonWuxing)
  const yongWangshuai = getWangshuai(yongWuxing, seasonWuxing)

  // 策略建议
  const strategy = getGuaStrategy(benGua.id)

  // 爻位风险
  const isYang = benYao[dongYao - 1] === 1
  const risk = getPositionRisk(dongYao, isYang)

  return {
    benGuaId: benGua.id,
    bianGuaId: bianGua.id,
    dongYao,
    methodName: '',
    calcDetail: '',

    shangGuaId: upperGua,
    xiaGuaId: lowerGua,
    huGuaId: huGua.id,
    tiGuaId,
    yongGuaId,
    tiWuxing,
    yongWuxing,
    shengkeRelation: sk.relation,
    shengkeResult: sk.result,
    seasonWuxing,
    tiWangshuai,
    yongWangshuai,

    strategyType: strategy?.type,
    strategyAction: strategy?.strategy,
    strategyNextStep: strategy?.nextStep,
    jiRate: strategy?.jilv,
    changePath: strategy?.nextStep?.match(/变第\d爻可达.*?（吉率\d+%）/)?.[0] || undefined,

    positionRisk: risk,
    timeLevels: {
      yongGua: '近期（事情起始、当前状态）',
      huGua: '中期（发展过程、中间变化）',
      bianGua: '远期（最终结果、长远趋势）',
    },
  }
}

// ==================== 时间起卦 ====================

export function calcMeihuaByTime(
  gregorianYear: number,
  gregorianMonth: number,
  gregorianDay: number,
  hour: number,
): MeihuaResult {
  // 公历转农历
  const lunarResult = toLunar(new Date(gregorianYear, gregorianMonth - 1, gregorianDay))
  const lunar = lunarResult.lunar

  const yearDizhi = getYearDizhi(lunar.year)
  const shichen = getShichen(hour)

  // 上卦 = (年支序数 + 农历月 + 农历日) % 8
  const upperSum = yearDizhi.num + lunar.month + lunar.day
  const upperGua = numToGua(upperSum)

  // 下卦 = (年支序数 + 农历月 + 农历日 + 时辰序数) % 8
  const lowerSum = upperSum + shichen.num
  const lowerGua = numToGua(lowerSum)

  // 动爻 = (年支序数 + 农历月 + 农历日 + 时辰序数) % 6
  const dongYao = numToYao(lowerSum)

  const result = analyzeHexagram(upperGua, lowerGua, dongYao)

  result.methodName = '梅花易数·时间起卦'
  result.calcDetail =
    `公历 ${gregorianYear}年${gregorianMonth}月${gregorianDay}日 → ` +
    `农历 ${lunar.year}年${lunar.isLeapMonth ? '闰' : ''}${lunar.month}月${lunar.day}日\n` +
    `年支：${yearDizhi.name}（${yearDizhi.num}）` +
    ` 月：${lunar.month} 日：${lunar.day} 时辰：${shichen.name}（${shichen.num}）\n` +
    `上卦：${upperSum} ÷ 8 余 ${upperGua}（${BAGUA_NAMES[upperGua - 1]}·${BAGUA_WUXING[upperGua]!}）\n` +
    `下卦：${lowerSum} ÷ 8 余 ${lowerGua}（${BAGUA_NAMES[lowerGua - 1]}·${BAGUA_WUXING[lowerGua]!}）\n` +
    `动爻：${lowerSum} ÷ 6 余 ${dongYao}（第${dongYao}爻）\n` +
    `体用：${result.shengkeRelation}（${result.shengkeResult}）`

  result.lunarDate = {
    year: lunar.year,
    month: lunar.month,
    day: lunar.day,
    isLeap: lunar.isLeapMonth,
    dizhi: yearDizhi.name,
    dizhiNum: yearDizhi.num,
  }

  return result
}

// ==================== 数字起卦 ====================

export function calcMeihuaByNumbers(
  num1: number,
  num2: number,
  num3?: number,
): MeihuaResult {
  const upperGua = numToGua(num1)
  const lowerGua = numToGua(num2)
  const dongYao = num3 !== undefined ? numToYao(num3) : numToYao(num1 + num2)

  const result = analyzeHexagram(upperGua, lowerGua, dongYao)

  result.methodName = '梅花易数·数字起卦'
  result.calcDetail =
    `第一数：${num1} ÷ 8 余 ${upperGua}（${BAGUA_NAMES[upperGua - 1]}·${BAGUA_WUXING[upperGua]!}）\n` +
    `第二数：${num2} ÷ 8 余 ${lowerGua}（${BAGUA_NAMES[lowerGua - 1]}·${BAGUA_WUXING[lowerGua]!}）\n` +
    `动爻：${num3 !== undefined ? `${num3} ÷ 6 余 ${dongYao}` : `(${num1}+${num2})=${num1 + num2} ÷ 6 余 ${dongYao}`}（第${dongYao}爻）\n` +
    `体用：${result.shengkeRelation}（${result.shengkeResult}）`

  return result
}

// ==================== 测字起卦 ====================

export function calcMeihuaByCharacter(
  char: string,
): MeihuaResult {
  if (!char || char.length === 0) throw new Error('请提供一个汉字')

  // 获取笔画数
  const strokeCount = cnchar.stroke(char)
  const firstCharStrokes = Array.isArray(strokeCount) ? strokeCount[0] : strokeCount

  if (!firstCharStrokes || firstCharStrokes <= 0) {
    throw new Error(`无法获取「${char}」的笔画数`)
  }

  let upperGua: number
  let lowerGua: number
  let dongYao: number

  if (char.length === 1) {
    // 单字：笔画数÷8=卦象（上下卦相同），笔画数÷6=动爻
    upperGua = numToGua(firstCharStrokes)
    lowerGua = upperGua
    dongYao = numToYao(firstCharStrokes)
  } else {
    // 双字：第一字笔画÷8=上卦，第二字笔画÷8=下卦，两字笔画和÷6=动爻
    const secondCharStrokes = Array.isArray(strokeCount) ? strokeCount[1] : firstCharStrokes
    upperGua = numToGua(firstCharStrokes)
    lowerGua = numToGua(secondCharStrokes || firstCharStrokes)
    dongYao = numToYao(firstCharStrokes + (secondCharStrokes || firstCharStrokes))
  }

  const result = analyzeHexagram(upperGua, lowerGua, dongYao)

  result.methodName = '梅花易数·测字起卦'
  result.calcDetail =
    `汉字：${char}\n` +
    `笔画数：${firstCharStrokes}${char.length > 1 ? `, ${Array.isArray(strokeCount) ? strokeCount[1] : firstCharStrokes}` : ''}\n` +
    `上卦：${upperGua}（${BAGUA_NAMES[upperGua - 1]}·${BAGUA_WUXING[upperGua]!}）\n` +
    `下卦：${lowerGua}（${BAGUA_NAMES[lowerGua - 1]}·${BAGUA_WUXING[lowerGua]!}）\n` +
    `动爻：第${dongYao}爻\n` +
    `体用：${result.shengkeRelation}（${result.shengkeResult}）`

  return result
}

// ==================== 兼容旧接口 ====================

export interface MeihuaInput {
  year: number
  month: number
  day: number
  hour?: number
  query?: string
}

/** 兼容旧接口（时间起卦） */
export function calcMeihua(input: MeihuaInput): MeihuaResult {
  return calcMeihuaByTime(
    input.year,
    input.month,
    input.day,
    input.hour ?? new Date().getHours(),
  )
}

// ==================== 策略下一步建议 getter ====================
export function getStrategyNextStep(strategyAction: string): string {
  return STRATEGY_NEXT_STEPS[strategyAction] || '观察局势，再做决定。'
}

// ==================== 爻位系数 getter ====================
export function getPositionCoefficient(position: number): number {
  return POSITION_COEFFICIENTS[position] || 0
}
