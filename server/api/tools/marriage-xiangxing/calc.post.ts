import type { DiZhi } from '~/types/user'
import type { BaziChart } from '~/types/bazi'
import type { MarriageXiangxingCalcResult, MarriageXiangxingChart } from '~/types/marriage-xiangxing'
import { calcPillars } from '~/utils/bazi/pillars'
import { calcWuxingScore, calcRiZhuStrength, calcXiYongJiShen, calcGeJu } from '~/utils/bazi/analysisCalc'
import { getMonthZhiIndex } from '~/utils/bazi/calendar'
import { calcDaYun } from '~/utils/bazi/dayun'
import { getShiShenFull, countShiShen } from '~/utils/bazi/shishen'
import {
  getDayMasterRelation,
  getPersonPortrait,
  findFrictionRule,
  DEFAULT_FRICTION,
} from '~/data/marriage-xiangxing'

interface PersonInput {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi | null
  name?: string
}

interface CalcInput {
  personA: PersonInput
  personB: PersonInput
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

function computeSingleChart(person: PersonInput): MarriageXiangxingChart {
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

export default defineEventHandler(async (event): Promise<MarriageXiangxingCalcResult> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.personA || !body?.personB) {
    throw createError({ statusCode: 400, statusMessage: 'Missing personA or personB info' })
  }
  for (const [role, person] of Object.entries({ personA: body.personA, personB: body.personB })) {
    if (!['male', 'female'].includes(person.gender)) {
      throw createError({ statusCode: 400, statusMessage: `Missing or invalid ${role} gender` })
    }
    if (!person.birthDate || typeof person.birthDate !== 'string') {
      throw createError({ statusCode: 400, statusMessage: `Missing or invalid ${role} birthDate` })
    }
  }

  const chartA = computeSingleChart(body.personA)
  const chartB = computeSingleChart(body.personB)

  const aToBShiShen = getShiShenFull(chartB.riZhu, chartA.riZhu)
  const bToAShiShen = getShiShenFull(chartA.riZhu, chartB.riZhu)
  const { relation: dayMasterRelation, label: dayMasterRelationLabel } = getDayMasterRelation(
    chartA.riZhu,
    chartB.riZhu,
  )

  const portraitA = getPersonPortrait(chartA.shishenCounts)
  const portraitB = getPersonPortrait(chartB.shishenCounts)
  const matchedRule = findFrictionRule(aToBShiShen, portraitB.shishen)

  const friction = matchedRule
    ? {
        key: matchedRule.key,
        title: matchedRule.title,
        conflict: matchedRule.conflict,
        actions: matchedRule.actions,
      }
    : {
        key: 'default',
        title: DEFAULT_FRICTION.title,
        conflict: DEFAULT_FRICTION.conflict,
        actions: DEFAULT_FRICTION.actions,
      }

  return {
    personA: chartA,
    personB: chartB,
    relation: {
      aToBShiShen,
      bToAShiShen,
      dayMasterRelation,
      dayMasterRelationLabel,
    },
    portraitA,
    portraitB,
    friction,
    generatedAt: new Date().toISOString(),
  }
})
