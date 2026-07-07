// server/utils/bazi.ts
// 今日运势专用八字/干支工具（简化版）
// TODO: 当前未做真太阳时校正，也未处理节气换月边界精确到小时的情况

import {
  TIAN_GAN,
  DI_ZHI,
  GAN_WUXING,
  WUXING_SHENG,
  WUXING_KE,
  ZI_SHI_GAN_INDEX,
  MONTH_ZHI,
} from '~/utils/bazi/constants'
import { solarToGanZhi, getMonthZhiIndex, getJieDayOfYear, dayOfYear, getDayPillar as _getDayPillar } from '~/utils/bazi/calendar'

export type TianGan = typeof TIAN_GAN[number]
export type DiZhi = typeof DI_ZHI[number]

export interface Pillar {
  gan: TianGan
  zhi: DiZhi
}

// 十二生肖
export const SHENG_XIAO: Record<DiZhi, string> = {
  子: '鼠',
  丑: '牛',
  寅: '虎',
  卯: '兔',
  辰: '龙',
  巳: '蛇',
  午: '马',
  未: '羊',
  申: '猴',
  酉: '鸡',
  戌: '狗',
  亥: '猪',
}

// 时辰时间范围
export const SHI_CHEN_RANGE: Record<DiZhi, string> = {
  子: '23:00-01:00',
  丑: '01:00-03:00',
  寅: '03:00-05:00',
  卯: '05:00-07:00',
  辰: '07:00-09:00',
  巳: '09:00-11:00',
  午: '11:00-13:00',
  未: '13:00-15:00',
  申: '15:00-17:00',
  酉: '17:00-19:00',
  戌: '19:00-21:00',
  亥: '21:00-23:00',
}

// 地支关系
const LIU_HE: Array<[DiZhi, DiZhi]> = [
  ['子', '丑'],
  ['寅', '亥'],
  ['卯', '戌'],
  ['辰', '酉'],
  ['巳', '申'],
  ['午', '未'],
]

const LIU_CHONG: Array<[DiZhi, DiZhi]> = [
  ['子', '午'],
  ['丑', '未'],
  ['寅', '申'],
  ['卯', '酉'],
  ['辰', '戌'],
  ['巳', '亥'],
]

const LIU_HAI: Array<[DiZhi, DiZhi]> = [
  ['子', '未'],
  ['丑', '午'],
  ['寅', '巳'],
  ['卯', '辰'],
  ['申', '亥'],
  ['酉', '戌'],
]

const SAN_XING: DiZhi[][] = [
  ['寅', '巳', '申'],
  ['丑', '戌', '未'],
  ['子', '卯'],
]

function hasPair(pairs: Array<[DiZhi, DiZhi]>, a: DiZhi, b: DiZhi): boolean {
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
}

function hasSanXing(group: DiZhi[], a: DiZhi, b: DiZhi): boolean {
  return group.includes(a) && group.includes(b)
}

/**
 * 计算用户四柱
 * birthHourDizhi 为 undefined 时返回的时柱为 null
 */
export function getUserPillars(
  birthDate: string,
  birthHourDizhi?: DiZhi | null,
): {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar | null
} {
  const [year, month, day] = birthDate.split('-').map(Number)
  if (!year || !month || !day) {
    throw new Error('Invalid birthDate')
  }

  // 把出生时辰地支转换为小时数（取中间值）
  const hourMap: Record<DiZhi, number> = {
    子: 0,
    丑: 2,
    寅: 4,
    卯: 6,
    辰: 8,
    巳: 10,
    午: 12,
    未: 14,
    申: 16,
    酉: 18,
    戌: 20,
    亥: 22,
  }
  const hour = birthHourDizhi ? hourMap[birthHourDizhi] : null

  const result = solarToGanZhi(year, month, day, hour)
  return {
    year: { gan: result.year.gan as TianGan, zhi: result.year.zhi as DiZhi },
    month: { gan: result.month.gan as TianGan, zhi: result.month.zhi as DiZhi },
    day: { gan: result.day.gan as TianGan, zhi: result.day.zhi as DiZhi },
    hour: result.hour
      ? { gan: result.hour.gan as TianGan, zhi: result.hour.zhi as DiZhi }
      : null,
  }
}

/**
 * 计算指定日期的日柱
 */
export function getDayPillar(year: number, month: number, day: number): Pillar {
  const result = _getDayPillar(year, month, day)
  return {
    gan: result.gan as TianGan,
    zhi: result.zhi as DiZhi,
  }
}

/**
 * 计算指定日期的日柱（起卦日柱）
 */
export function getDivinationDayPillar(date: Date): Pillar {
  const result = _getDayPillar(date.getFullYear(), date.getMonth() + 1, date.getDate())
  return {
    gan: result.gan as TianGan,
    zhi: result.zhi as DiZhi,
  }
}

/**
 * 简化喜用神算法
 * 喜用 = 生日干之五行；忌神 = 克日干之五行
 * TODO: 完整喜用神需结合月令、五行力量、日主强弱，后续迭代
 */
export function getSimplifiedXiYongJiShen(riGan: TianGan): { xiyong: string; jishen: string } {
  const wx = GAN_WUXING[riGan]
  // 生我者为喜用：找 x 使得 x 生 wx
  let xiyong = ''
  for (const [k, v] of Object.entries(WUXING_SHENG)) {
    if (v === wx) {
      xiyong = k
      break
    }
  }
  // 克我者为忌神：找 x 使得 x 克 wx
  let jishen = ''
  for (const [k, v] of Object.entries(WUXING_KE)) {
    if (v === wx) {
      jishen = k
      break
    }
  }
  return { xiyong: xiyong || '木', jishen: jishen || '金' }
}

export type DiZhiRelation = '合' | '冲' | '害' | '刑'

export interface RelationResult {
  relations: DiZhiRelation[]
  score: number
}

/**
 * 计算两个地支间的关系与加权分数
 */
export function getDiZhiRelation(a: DiZhi, b: DiZhi): RelationResult {
  if (a === b) {
    return { relations: [], score: 0 }
  }

  const relations: DiZhiRelation[] = []
  if (hasPair(LIU_HE, a, b)) relations.push('合')
  if (hasPair(LIU_CHONG, a, b)) relations.push('冲')
  if (hasPair(LIU_HAI, a, b)) relations.push('害')
  if (SAN_XING.some(g => hasSanXing(g, a, b))) relations.push('刑')

  const score = relations.reduce((sum, r) => {
    if (r === '合') return sum + 2
    if (r === '冲') return sum - 2
    if (r === '害') return sum - 1
    if (r === '刑') return sum - 1
    return sum
  }, 0)

  return { relations, score }
}

/**
 * 以起卦日支为轴，计算 12 生肖地支的宜忌分数
 */
export function getZodiacRelations(ruZhi: DiZhi): Array<{
  dizhi: DiZhi
  shengxiao: string
} & RelationResult> {
  return DI_ZHI.map((z) => {
    const r = getDiZhiRelation(ruZhi, z)
    return {
      dizhi: z,
      shengxiao: SHENG_XIAO[z],
      relations: r.relations,
      score: r.score,
    }
  })
}

/**
 * 以起卦日干为基准，返回十二时辰的时干支
 */
export function getShiChenGanZhi(riGan: TianGan): Array<{ dizhi: DiZhi; gan: TianGan; ganZhi: string }> {
  const startIdx = ZI_SHI_GAN_INDEX[riGan] ?? 0
  return DI_ZHI.map((z, idx) => {
    const gan = TIAN_GAN[(startIdx + idx) % 10]!
    return { dizhi: z, gan, ganZhi: `${gan}${z}` }
  })
}

export type GanRelation = '生我' | '我生' | '克我' | '我克' | '同我'

/**
 * 日干与时干的关系及基础分数
 */
export function getGanRelation(riGan: TianGan, shiGan: TianGan): { relation: GanRelation; score: number } {
  const riWx = GAN_WUXING[riGan]!
  const shiWx = GAN_WUXING[shiGan]!

  if (riWx === shiWx) return { relation: '同我', score: 0 }
  if (WUXING_SHENG[shiWx] === riWx) return { relation: '生我', score: 2 }
  if (WUXING_SHENG[riWx] === shiWx) return { relation: '我生', score: -1 }
  if (WUXING_KE[shiWx] === riWx) return { relation: '克我', score: -2 }
  if (WUXING_KE[riWx] === shiWx) return { relation: '我克', score: -1 }

  return { relation: '同我', score: 0 }
}

/**
 * 五行对应方位
 */
export function getWuxingDirection(wuxing: string): string {
  const map: Record<string, string> = {
    木: '东',
    火: '南',
    土: '中',
    金: '西',
    水: '北',
  }
  return map[wuxing] ?? '中'
}

/**
 * 五行能量顺逆定性
 */
export function getWuxingEnergy(
  riGan: TianGan,
  xiyong: string,
  jishen: string,
): {
  wuxing: string
  tendency: 'shun' | 'ni' | 'ping'
  label: string
} {
  const riWx = GAN_WUXING[riGan]!

  let tendency: 'shun' | 'ni' | 'ping'
  let label: string

  if (riWx === xiyong) {
    tendency = 'shun'
    label = '今日能量顺势'
  }
  else if (riWx === jishen) {
    tendency = 'ni'
    label = '今日能量逆势'
  }
  else {
    tendency = 'ping'
    label = '今日能量平稳'
  }

  return { wuxing: riWx, tendency, label }
}

// 十二建除
const JIAN_CHU = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'] as const

/**
 * 计算日建除状态
 * 以月支为基准，月支日为建，顺排十二建除
 */
export function getJianChu(monthZhi: DiZhi, dayZhi: DiZhi): typeof JIAN_CHU[number] {
  const monthIdx = DI_ZHI.indexOf(monthZhi)
  const dayIdx = DI_ZHI.indexOf(dayZhi)
  const offset = (dayIdx - monthIdx + 12) % 12
  return JIAN_CHU[offset]!
}

// 十二节（月建之节），用于判断节气当日或前后
const JIE_QI_NAMES = [
  '立春', '惊蛰', '清明', '立夏', '芒种', '小暑',
  '立秋', '白露', '寒露', '立冬', '大雪', '小寒',
] as const

export interface JieQiInfo {
  name: typeof JIE_QI_NAMES[number] | null
  isToday: boolean
  isNear: boolean
}

/**
 * 获取某公历日期的节气信息
 * 若当日为节气或前后 1 天，返回对应节气名；否则返回 null
 */
export function getJieQiInfo(year: number, month: number, day: number): JieQiInfo {
  const current = dayOfYear(year, month, day)

  for (let i = 0; i < 12; i++) {
    const jieDay = getJieDayOfYear(year, i)
    const diff = current - jieDay
    if (diff === 0) {
      return { name: JIE_QI_NAMES[i]!, isToday: true, isNear: false }
    }
    if (Math.abs(diff) <= 1) {
      return { name: JIE_QI_NAMES[i]!, isToday: false, isNear: true }
    }
  }

  return { name: null, isToday: false, isNear: false }
}

// 十二时辰天神（黄黑道）
const TIAN_SHEN = [
  '青龙', '明堂', '天刑', '朱雀', '金匮', '天德',
  '白虎', '玉堂', '天牢', '玄武', '司命', '勾陈',
] as const

const HUANG_DAO_SHEN = new Set<string>([
  '青龙', '明堂', '金匮', '天德', '玉堂', '司命',
])

export interface ShiChenTianShen {
  dizhi: DiZhi
  timeRange: string
  tianShen: typeof TIAN_SHEN[number]
  type: '黄道' | '黑道'
}

/**
 * 基于日支推算当日十二时辰的黄黑道天神
 * 规则与 lunar_python 一致：青龙起始时辰索引 = (日支索引 * 2 + 10) % 12
 */
export function getShiChenTianShen(riZhi: DiZhi): ShiChenTianShen[] {
  const riIdx = DI_ZHI.indexOf(riZhi)
  const qingLongStart = (riIdx * 2 + 10) % 12

  return DI_ZHI.map((dizhi, idx) => {
    const tianShen = TIAN_SHEN[(idx - qingLongStart + 12) % 12]!
    return {
      dizhi,
      timeRange: SHI_CHEN_RANGE[dizhi],
      tianShen,
      type: HUANG_DAO_SHEN.has(tianShen) ? '黄道' : '黑道',
    }
  })
}

/**
 * 计算指定日期的月支
 */
export function getMonthZhi(year: number, month: number, day: number): DiZhi {
  const { index } = getMonthZhiIndex(year, month, day)
  return MONTH_ZHI[index]!
}
