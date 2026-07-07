import type { DiZhi } from '~/types/user'
import type { BaziChart } from '~/types/bazi'
import type { ChildActivityInterestCalcResult, ChildActivityInterestChart } from '~/types/child-activity-interest'
import { calcPillars } from '~/utils/bazi/pillars'
import { calcWuxingScore, calcRiZhuStrength, calcXiYongJiShen, calcGeJu } from '~/utils/bazi/analysisCalc'
import { getMonthZhiIndex } from '~/utils/bazi/calendar'
import { calcDaYun } from '~/utils/bazi/dayun'
import { getShiShenFull, countShiShen } from '~/utils/bazi/shishen'
import {
  computeActivityDimensionScores,
  buildPortrait,
} from '~/data/child-activity-interest'

interface CalcInput {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi | null
  name?: string
  locale?: string
}

const SHISHEN_ALL = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印']

function parseDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: `Invalid birthDate: ${dateStr}` })
  }
  return { year, month, day }
}

function hourDiZhiToHour(dizhi?: DiZhi | null): number | null {
  if (!dizhi) return null
  const hourMap: Record<DiZhi, number> = {
    子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
    午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
  }
  return hourMap[dizhi] ?? null
}

function computeChildChart(person: CalcInput): ChildActivityInterestChart {
  const { year, month, day } = parseDate(person.birthDate)
  const hour = hourDiZhiToHour(person.birthHour)

  const pillars = calcPillars(year, month, day, hour, person.gender)

  const partialChart: BaziChart = {
    year: pillars.year,
    month: pillars.month,
    day: pillars.day,
    hour: pillars.hour,
    riZhu: pillars.riZhu,
    riZhuStrength: '身弱',
    wuxingScore: { 木: 20, 火: 20, 土: 20, 金: 20, 水: 20 },
    geju: '',
    xiyong: '',
    jishen: '',
    dayuns: [],
    qiyunAge: 0,
    currentAge: new Date().getFullYear() - year,
    currentDaYun: null,
  }

  const wuxingScore = calcWuxingScore(partialChart)
  const riZhuStrength = calcRiZhuStrength(pillars.riZhu, pillars.month.zhi, wuxingScore)
  partialChart.wuxingScore = wuxingScore
  partialChart.riZhuStrength = riZhuStrength

  const { xiyong, jishen } = calcXiYongJiShen(pillars.riZhu, riZhuStrength, wuxingScore)
  partialChart.xiyong = xiyong
  partialChart.jishen = jishen

  const geju = calcGeJu(partialChart)
  partialChart.geju = geju

  const { index: monthZhiIdx } = getMonthZhiIndex(year, month, day)
  const { dayuns, qiyunAge } = calcDaYun(
    pillars.year.gan,
    pillars.month.gan,
    pillars.month.zhi,
    person.gender,
    year,
    month,
    day,
    monthZhiIdx,
  )
  partialChart.dayuns = dayuns
  partialChart.qiyunAge = qiyunAge

  const pillarList = [pillars.year, pillars.month, pillars.day, pillars.hour].filter(Boolean)
  const shishenCounts = countShiShen(pillars.riZhu, pillarList as Array<{ gan: string; zhi: string }>)
  for (const shishen of SHISHEN_ALL) {
    if (shishenCounts[shishen] === undefined) {
      shishenCounts[shishen] = 0
    }
  }

  const enrichPillar = (p: typeof pillars.year) => ({
    gan: p.gan,
    zhi: p.zhi,
    shishen: p.shishen || getShiShenFull(pillars.riZhu, p.gan),
    canggan: p.canggan.map(cg => ({
      gan: cg.gan,
      type: cg.type,
      shishen: getShiShenFull(pillars.riZhu, cg.gan),
    })),
  })

  return {
    profile: {
      name: person.name || '',
      birthDate: person.birthDate,
      birthHour: person.birthHour || undefined,
      gender: person.gender,
    },
    pillars: {
      year: enrichPillar(pillars.year),
      month: enrichPillar(pillars.month),
      day: enrichPillar(pillars.day),
      hour: pillars.hour ? enrichPillar(pillars.hour) : null,
    },
    riZhu: pillars.riZhu,
    riZhuStrength,
    wuxingScore,
    geju,
    xiyong,
    jishen,
    shishenCounts,
  }
}

export default defineEventHandler(async (event): Promise<ChildActivityInterestCalcResult> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.gender || !['male', 'female'].includes(body.gender)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid gender' })
  }
  if (!body.birthDate || typeof body.birthDate !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid birthDate' })
  }

  const locale = body.locale || 'zh-CN'
  const chart = computeChildChart(body)

  const dimensionScores = computeActivityDimensionScores(chart.shishenCounts)
  const sorted = Object.entries(dimensionScores).sort((a, b) => b[1] - a[1])
  const dominantDimension = sorted[0]![0] as ChildActivityInterestCalcResult['dominantDimension']
  const secondaryDimension = sorted[1] && sorted[1][1] >= sorted[0]![1] * 0.75
    ? sorted[1][0] as NonNullable<ChildActivityInterestCalcResult['secondaryDimension']>
    : undefined

  const portrait = buildPortrait(dimensionScores, locale)

  return {
    profile: chart.profile,
    chart,
    dimensionScores,
    dominantDimension,
    secondaryDimension,
    portrait,
    generatedAt: new Date().toISOString(),
  }
})
