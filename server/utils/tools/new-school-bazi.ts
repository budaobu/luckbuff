import type {
  NewSchoolBaziChart,
  NewSchoolInteraction,
  NewSchoolMissingWord,
  NewSchoolPillar,
} from '~/types/new-school-bazi'
import {
  dayOfYear,
  getHourPillar,
  getJieDayOfYear,
  getMonthPillar,
  getMonthZhiIndex,
  getYearPillar,
} from '~/utils/bazi/calendar'

export type NewSchoolGender = 'male' | 'female'

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

const GAN_WUXING = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
} as const

const GAN_YANG = {
  甲: true, 乙: false, 丙: true, 丁: false, 戊: true,
  己: false, 庚: true, 辛: false, 壬: true, 癸: false,
} as const

const ZHI_WUXING = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
} as const

const ZHI_BEN_QI = {
  子: '癸', 丑: '己', 寅: '甲', 卯: '乙', 辰: '戊', 巳: '丙',
  午: '丁', 未: '己', 申: '庚', 酉: '辛', 戌: '戊', 亥: '壬',
} as const

const WUXING_SHENG: Record<string, string> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
}

const WUXING_KE: Record<string, string> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
}

const WUXING_KEYS = ['木', '火', '土', '金', '水'] as const

function getShiShen(riGan: string, targetGan: string): string {
  const riWuxing = GAN_WUXING[riGan as keyof typeof GAN_WUXING]!
  const targetWuxing = GAN_WUXING[targetGan as keyof typeof GAN_WUXING]!
  const samePolarity = GAN_YANG[riGan as keyof typeof GAN_YANG] === GAN_YANG[targetGan as keyof typeof GAN_YANG]

  if (riWuxing === targetWuxing) return samePolarity ? '比肩' : '劫财'
  if (WUXING_SHENG[riWuxing] === targetWuxing) return samePolarity ? '食神' : '伤官'
  if (WUXING_KE[riWuxing] === targetWuxing) return samePolarity ? '偏财' : '正财'
  if (WUXING_SHENG[targetWuxing] === riWuxing) return samePolarity ? '偏印' : '正印'
  return samePolarity ? '七杀' : '正官'
}

function makePillar(gan: string, zhi: string, riGan: string, showShiShen = true): NewSchoolPillar {
  const benQi = ZHI_BEN_QI[zhi as keyof typeof ZHI_BEN_QI]!
  return {
    gan: gan as NewSchoolPillar['gan'],
    zhi: zhi as NewSchoolPillar['zhi'],
    shishen: showShiShen ? getShiShen(riGan, gan) : '日主',
    zhiBenQiGan: benQi as NewSchoolPillar['zhiBenQiGan'],
    zhiBenQiShiShen: getShiShen(riGan, benQi),
  }
}

type Relation = NewSchoolInteraction['relation']
type Effect = NewSchoolInteraction['effect']

function relationToDay(dayWuxing: string, sourceWuxing: string): Relation {
  if (sourceWuxing === dayWuxing) return '同我'
  if (WUXING_SHENG[sourceWuxing] === dayWuxing) return '生我'
  if (WUXING_SHENG[dayWuxing] === sourceWuxing) return '我生'
  if (WUXING_KE[sourceWuxing] === dayWuxing) return '克我'
  return '我克'
}

function effectOf(relation: Relation): Effect {
  if (relation === '同我' || relation === '生我') return 'support'
  if (relation === '我生' || relation === '我克' || relation === '克我') return 'weaken'
  return 'neutral'
}

function interaction(from: string, fromWuxing: string, to: string, dayWuxing: string, weight: number): NewSchoolInteraction {
  const relation = relationToDay(dayWuxing, fromWuxing)
  return { from, to, relation, weight, effect: effectOf(relation) }
}

function normalizeScores(scores: Record<string, number>) {
  const total = WUXING_KEYS.reduce((sum, key) => sum + scores[key]!, 0)
  if (total === 0) return { 木: 20, 火: 20, 土: 20, 金: 20, 水: 20 } as NewSchoolBaziChart['wuxingScore']
  return Object.fromEntries(WUXING_KEYS.map(key => [key, Math.round((scores[key]! / total) * 100)])) as NewSchoolBaziChart['wuxingScore']
}

function relationPower(sourceWuxing: string, targetWuxing: string): 'support' | 'weaken' | 'neutral' {
  return effectOf(relationToDay(targetWuxing, sourceWuxing))
}

function calcDaYun(
  yearGan: string,
  monthGan: string,
  monthZhi: string,
  gender: NewSchoolGender,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  monthZhiIndex: number,
) {
  const yangYear = GAN_YANG[yearGan as keyof typeof GAN_YANG]!
  const forward = gender === 'male' ? yangYear : !yangYear
  const birthDayOfYear = dayOfYear(birthYear, birthMonth, birthDay)
  const adjacentJieIndex = forward
    ? (monthZhiIndex + 1) % 12
    : (monthZhiIndex - 1 + 12) % 12
  const adjacentJieDay = getJieDayOfYear(birthYear, adjacentJieIndex)
  const daysToJie = forward
    ? adjacentJieDay >= birthDayOfYear
      ? adjacentJieDay - birthDayOfYear
      : dayOfYear(birthYear, 12, 31) - birthDayOfYear + adjacentJieDay
    : birthDayOfYear >= adjacentJieDay
      ? birthDayOfYear - adjacentJieDay
      : birthDayOfYear + dayOfYear(birthYear - 1, 12, 31) - adjacentJieDay
  const qiyunAge = Math.max(0, Math.round(daysToJie / 3))
  let ganIndex = TIAN_GAN.indexOf(monthGan as never)
  let zhiIndex = DI_ZHI.indexOf(monthZhi as never)
  const dayuns = Array.from({ length: 10 }, (_, index) => {
    ganIndex = forward ? (ganIndex + 1) % 10 : (ganIndex - 1 + 10) % 10
    zhiIndex = forward ? (zhiIndex + 1) % 12 : (zhiIndex - 1 + 12) % 12
    const startAge = index * 10 + 1
    return {
      index: index + 1,
      ageRange: [startAge, startAge + 9] as [number, number],
      gan: TIAN_GAN[ganIndex]!,
      zhi: DI_ZHI[zhiIndex]!,
    }
  })
  return { dayuns, qiyunAge }
}

export function calcNewSchoolBazi(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHourDizhi: string | null,
  gender: NewSchoolGender,
): NewSchoolBaziChart {
  const hourIndex = birthHourDizhi ? DI_ZHI.indexOf(birthHourDizhi as never) : -1
  if (birthHourDizhi && hourIndex < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthHour' })
  }

  const yearRaw = getYearPillar(birthYear, birthMonth, birthDay)
  const monthRaw = getMonthPillar(yearRaw.gan, birthYear, birthMonth, birthDay)
  const dayRaw = getDayPillar(birthYear, birthMonth, birthDay)
  const hourRaw = hourIndex >= 0 ? getHourPillar(dayRaw.gan, hourIndex * 2) : null
  const riGan = dayRaw.gan

  const year = makePillar(yearRaw.gan, yearRaw.zhi, riGan)
  const month = makePillar(monthRaw.gan, monthRaw.zhi, riGan)
  const day = makePillar(dayRaw.gan, dayRaw.zhi, riGan, false)
  const hour = hourRaw ? makePillar(hourRaw.gan, hourRaw.zhi, riGan) : null

  // 本气计分：天干 18，地支本气 18，月令另加 20。
  const rawScores: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  const pillars = [year, month, day, hour].filter(Boolean) as NewSchoolPillar[]
  for (const pillar of pillars) {
    rawScores[GAN_WUXING[pillar.gan]]! += 18
    rawScores[ZHI_WUXING[pillar.zhi]]! += 18
  }
  rawScores[ZHI_WUXING[month.zhi]]! += 20
  const wuxingScore = normalizeScores(rawScores)

  const dayWuxing = GAN_WUXING[riGan]!
  const monthZhiWuxing = ZHI_WUXING[month.zhi]!
  const monthGanWuxing = GAN_WUXING[month.gan]!
  const dayZhiWuxing = ZHI_WUXING[day.zhi]!
  const yearZhiWuxing = ZHI_WUXING[year.zhi]!

  const interactions: NewSchoolInteraction[] = [
    interaction(`${month.zhi}→日干`, monthZhiWuxing, '日干', dayWuxing, 50),
    interaction(`${day.zhi}→日干`, dayZhiWuxing, '日干', dayWuxing, 25),
    interaction(`${month.gan}→日干`, monthGanWuxing, '日干', dayWuxing, 15),
  ]
  if (hour) {
    interactions.push(interaction(`${hour.gan}→日干`, GAN_WUXING[hour.gan]!, '日干', dayWuxing, 10))
  }

  // 年支/年干只先作用于相邻月支/月干，不隔位直达日干。
  let monthZhiWeight = interactions[0]!.weight
  if (relationPower(yearZhiWuxing, monthZhiWuxing) === 'support') monthZhiWeight *= 1.15
  else if (relationPower(yearZhiWuxing, monthZhiWuxing) === 'weaken') monthZhiWeight *= 0.8
  interactions[0]!.weight = Math.round(monthZhiWeight)

  let weightedSupport = 0
  let weightedWeaken = 0
  for (const item of interactions) {
    if (item.effect === 'support') weightedSupport += item.weight
    else if (item.effect === 'weaken') weightedWeaken += item.weight
  }
  const totalWeight = interactions.reduce((sum, item) => sum + item.weight, 0)
  const supportScore = totalWeight ? Math.round((weightedSupport / totalWeight) * 100) : 0
  const weakenScore = totalWeight ? Math.round((weightedWeaken / totalWeight) * 100) : 0

  let riZhuStrength: NewSchoolBaziChart['riZhuStrength']
  if (supportScore <= 10 && weakenScore >= 70) riZhuStrength = '从弱'
  else if (weakenScore <= 10 && supportScore >= 70) riZhuStrength = '从旺'
  else if (supportScore >= 55) riZhuStrength = '身旺'
  else riZhuStrength = '身弱'

  const useSupport = riZhuStrength === '从旺' || riZhuStrength === '身弱'
  const xiyong = useSupport
    ? `${dayWuxing}、${WUXING_SHENG[dayWuxing]!}`
    : `${Object.entries(WUXING_KE).find(([, value]) => value === dayWuxing)?.[0] ?? ''}、${WUXING_KE[dayWuxing]!}`
  const jishen = useSupport
    ? `${Object.entries(WUXING_KE).find(([, value]) => value === dayWuxing)?.[0] ?? ''}、${WUXING_KE[dayWuxing]!}`
    : `${dayWuxing}、${WUXING_SHENG[dayWuxing]!}`

  const missingWords: NewSchoolMissingWord[] = WUXING_KEYS
    .filter(wuxing => (wuxingScore[wuxing] ?? 0) === 0)
    .map((wuxing) => {
      const gan = TIAN_GAN.find(item => GAN_WUXING[item] === wuxing)!
      return {
        gan,
        wuxing,
        shishen: getShiShen(riGan, gan),
        treatment: 'xushi-note-only' as const,
      }
    })

  const { dayuns, qiyunAge } = calcDaYun(
    year.gan,
    month.gan,
    month.zhi,
    gender,
    birthYear,
    birthMonth,
    birthDay,
    getMonthZhiIndex(birthYear, birthMonth, birthDay),
  )
  const currentAge = Math.max(0, new Date().getFullYear() - birthYear)
  const currentDaYun = dayuns.find(item => item.ageRange[0]! <= currentAge && item.ageRange[1]! >= currentAge) ?? null

  return {
    year,
    month,
    day,
    hour,
    riZhu: riGan as NewSchoolBaziChart['riZhu'],
    riZhuStrength,
    geju: `${riZhuStrength}格`,
    supportScore,
    wuxingScore,
    interactions,
    xiyong,
    jishen,
    missingWords,
    xushiRule: '命局缺字按新派虚实论标注为虚字，本工具不改判原局旺衰。',
    dayuns,
    qiyunAge,
    currentAge,
    currentDaYun,
  }
}

export function buildNewSchoolPromptData(chart: NewSchoolBaziChart): string {
  const pillar = (item: NewSchoolPillar | null) => item ? `${item.gan}${item.zhi}` : '未知'
  const interactionText = chart.interactions
    .map(item => `${item.from}:${item.relation}(${item.effect},${item.weight})`)
    .join('；')
  const wuxingText = Object.entries(chart.wuxingScore).map(([key, value]) => `${key}${value}%`).join(' ')
  const missingText = chart.missingWords.length
    ? chart.missingWords.map(item => `${item.wuxing}/${item.gan}（${item.shishen}）`).join('、')
    : '无'

  return [
    `四柱：年${pillar(chart.year)} 月${pillar(chart.month)} 日${pillar(chart.day)} 时${pillar(chart.hour)}`,
    `日主：${chart.riZhu}；新派旺衰：${chart.riZhuStrength}；简化格局：${chart.geju}`,
    `邻位作用：${interactionText}`,
    `本气五行：${wuxingText}`,
    `喜用：${chart.xiyong}；忌神：${chart.jishen}`,
    `命局缺字/虚字：${missingText}`,
    `虚实处理：${chart.xushiRule}`,
    `起运：${chart.qiyunAge}岁；当前${chart.currentAge}岁；当前大运${chart.currentDaYun ? `${chart.currentDaYun.gan}${chart.currentDaYun.zhi}(${chart.currentDaYun.ageRange[0]}-${chart.currentDaYun.ageRange[1]})` : '未起运'}`,
  ].join('\n')
}
