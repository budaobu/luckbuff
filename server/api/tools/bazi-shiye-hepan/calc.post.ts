import type { DiZhi } from '~/types/user'
import type { BaziChart } from '~/types/bazi'
import { calcPillars } from '~/utils/bazi/pillars'
import { calcWuxingScore, calcRiZhuStrength, calcXiYongJiShen, calcGeJu } from '~/utils/bazi/analysisCalc'
import { getMonthZhiIndex } from '~/utils/bazi/calendar'
import { calcDaYun } from '~/utils/bazi/dayun'

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

function computeBaziChart(person: PersonInput): BaziChart {
  const [year, month, day] = person.birthDate.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate format' })
  }

  const hourMap: Record<DiZhi, number> = {
    子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
    午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
  }
  const hour = person.birthHour ? hourMap[person.birthHour] ?? null : null

  const pillars = calcPillars(year, month, day, hour, person.gender)

  const partial: BaziChart = {
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

  const wuxingScore = calcWuxingScore(partial)
  const riZhuStrength = calcRiZhuStrength(pillars.riZhu, pillars.month.zhi, wuxingScore)
  partial.wuxingScore = wuxingScore
  partial.riZhuStrength = riZhuStrength

  const { xiyong, jishen } = calcXiYongJiShen(pillars.riZhu, riZhuStrength, wuxingScore)
  partial.xiyong = xiyong
  partial.jishen = jishen

  partial.geju = calcGeJu(partial)

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
  partial.dayuns = dayuns
  partial.qiyunAge = qiyunAge

  const currentAge = partial.currentAge
  partial.currentDaYun = dayuns.find(d => d.ageRange[0] <= currentAge && d.ageRange[1] >= currentAge) ?? null

  return partial
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CalcInput>(event)

  if (!body?.personA || !body?.personB) {
    throw createError({ statusCode: 400, statusMessage: 'Missing personA or personB' })
  }

  for (const key of ['personA', 'personB'] as const) {
    const person = body[key]
    if (!['male', 'female'].includes(person.gender)) {
      throw createError({ statusCode: 400, statusMessage: `Missing or invalid gender for ${key}` })
    }
    if (!person.birthDate || typeof person.birthDate !== 'string') {
      throw createError({ statusCode: 400, statusMessage: `Missing or invalid birthDate for ${key}` })
    }
  }

  const chartA = computeBaziChart(body.personA)
  const chartB = computeBaziChart(body.personB)

  return {
    chartA,
    chartB,
    nameA: body.personA.name || '',
    nameB: body.personB.name || '',
    locale: body.locale || 'zh-CN',
  }
})
