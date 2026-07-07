import type { DiZhi } from '~/types/user'
import type { BaziChart } from '~/types/bazi'
import type { BaziPersonalityMapCalcResult } from '~/types/bazi-personality-map'
import { calcPillars } from '~/utils/bazi/pillars'
import { calcWuxingScore, calcRiZhuStrength, calcXiYongJiShen, calcGeJu } from '~/utils/bazi/analysisCalc'
import { getMonthZhiIndex } from '~/utils/bazi/calendar'
import { calcDaYun } from '~/utils/bazi/dayun'
import { getShiShenFull, countShiShen } from '~/utils/bazi/shishen'
import { ZHI_CANGGAN } from '~/utils/bazi/constants'
import {
  SHISHEN_DIMENSION_MAP,
  DIMENSION_ORDER,
  computeDimensionScores,
  determineArchetype,
} from '~/data/bazi-personality-map'

interface CalcInput {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi | null
  name?: string
  locale?: string
}

export default defineEventHandler(async (event): Promise<BaziPersonalityMapCalcResult> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.gender || !['male', 'female'].includes(body.gender)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid gender' })
  }
  if (!body?.birthDate || typeof body.birthDate !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid birthDate' })
  }

  const [year, month, day] = body.birthDate.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate format' })
  }

  const locale = body.locale || 'zh-CN'

  // 时辰地支转小时数（取中间值），与 useBaziCalc 保持一致
  const hourMap: Record<DiZhi, number> = {
    子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
    午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
  }
  const hour = body.birthHour ? hourMap[body.birthHour] ?? null : null

  // 排四柱
  const pillars = calcPillars(year, month, day, hour, body.gender)

  // 五行分析
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

  // 大运（复用 useBaziCalc 逻辑，计算后不使用，但保持 BaziChart 完整）
  const { index: monthZhiIdx } = getMonthZhiIndex(year, month, day)
  const { dayuns, qiyunAge } = calcDaYun(
    pillars.year.gan,
    pillars.month.gan,
    pillars.month.zhi,
    body.gender,
    year,
    month,
    day,
    monthZhiIdx,
  )
  partialChart.dayuns = dayuns
  partialChart.qiyunAge = qiyunAge

  // 十神统计
  const pillarList = [pillars.year, pillars.month, pillars.day, pillars.hour].filter(Boolean)
  const shishenCounts = countShiShen(pillars.riZhu, pillarList as Array<{ gan: string; zhi: string }>)

  // 确保每个十神都有计数
  for (const shishen of Object.keys(SHISHEN_DIMENSION_MAP)) {
    if (shishenCounts[shishen] === undefined) {
      shishenCounts[shishen] = 0
    }
  }

  const dimensions = computeDimensionScores(shishenCounts)
  const archetype = determineArchetype(dimensions, locale)

  // 组装带十神的柱信息
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
      name: body.name || '',
      birthDate: body.birthDate,
      birthHour: body.birthHour || undefined,
      gender: body.gender,
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
    dimensions,
    dimensionOrder: DIMENSION_ORDER,
    archetype,
  }
})
