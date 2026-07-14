import type { DiZhi } from '~/types/user'
import type { BaziChart } from '~/types/bazi'
import type { BaziZhengyuanCalcResult } from '~/types/bazi-zhengyuan'
import { calcPillars } from '~/utils/bazi/pillars'
import { calcWuxingScore, calcRiZhuStrength, calcXiYongJiShen, calcGeJu } from '~/utils/bazi/analysisCalc'
import { getMonthZhiIndex } from '~/utils/bazi/calendar'
import { calcDaYun } from '~/utils/bazi/dayun'

interface CalcInput {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi | null
  name?: string
  locale?: string
}

export default defineEventHandler(async (event): Promise<BaziZhengyuanCalcResult> => {
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

  const hourMap: Record<DiZhi, number> = {
    子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
    午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
  }
  const hour = body.birthHour ? hourMap[body.birthHour] ?? null : null

  const pillars = calcPillars(year, month, day, hour, body.gender)

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
    body.gender,
    year,
    month,
    day,
    monthZhiIdx,
  )
  partialChart.dayuns = dayuns
  partialChart.qiyunAge = qiyunAge

  const currentAge = partialChart.currentAge
  partialChart.currentDaYun = dayuns.find(
    d => d.ageRange[0] <= currentAge && d.ageRange[1] >= currentAge,
  ) ?? null

  return {
    profile: {
      name: body.name || '',
      birthDate: body.birthDate,
      birthHour: body.birthHour || undefined,
      gender: body.gender,
    },
    chart: partialChart,
    riZhu: pillars.riZhu,
    riZhuStrength,
    geju,
    xiyong,
    jishen,
  }
})
