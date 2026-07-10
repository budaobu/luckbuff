import type { DiZhi } from '~/types/user'
import type { BaziChart } from '~/types/bazi'
import type { BztiBirthdayPersonalityCalcResult } from '~/data/bzti-birthday-personality'
import { calcPillars } from '~/utils/bazi/pillars'
import { calcWuxingScore, calcRiZhuStrength, calcXiYongJiShen, calcGeJu } from '~/utils/bazi/analysisCalc'
import { getMonthZhiIndex } from '~/utils/bazi/calendar'
import { calcDaYun } from '~/utils/bazi/dayun'
import { getShiShenFull, countShiShen } from '~/utils/bazi/shishen'
import { ZHI_CANGGAN, ZHI_WUXING } from '~/utils/bazi/constants'
import { computeBztiStructuralSignals, determineBztiType } from '~/data/bzti-birthday-personality'

interface CalcInput {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi | null
  name?: string
  birthProvince?: string
  locale?: string
}

export default defineEventHandler(async (event): Promise<BztiBirthdayPersonalityCalcResult> => {
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

  const pillarList = [pillars.year, pillars.month, pillars.day, pillars.hour].filter(Boolean)
  const shishenCounts = countShiShen(pillars.riZhu, pillarList as Array<{ gan: string; zhi: string }>)

  for (const shishen of ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印']) {
    if (shishenCounts[shishen] === undefined) {
      shishenCounts[shishen] = 0
    }
  }

  const monthWuxing = ZHI_WUXING[pillars.month.zhi] ?? '木'

  const signals = computeBztiStructuralSignals(
    pillarList.filter(Boolean).map(p => ({ gan: p!.gan, zhi: p!.zhi })),
    pillars.riZhu,
    pillars.month.zhi,
    monthWuxing,
    riZhuStrength,
    geju,
    { ...wuxingScore },
    shishenCounts,
    !!pillars.hour,
  )

  const bztiType = determineBztiType(signals)

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
      birthProvince: body.birthProvince || undefined,
    },
    type: bztiType,
    code: bztiType.code,
    rarity: bztiType.rarity,
    signals,
    pillars: {
      year: enrichPillar(pillars.year),
      month: enrichPillar(pillars.month),
      day: enrichPillar(pillars.day),
      hour: pillars.hour ? enrichPillar(pillars.hour) : null,
    },
    riZhu: pillars.riZhu,
    riZhuStrength,
    geju,
    wuxingScore: { ...wuxingScore },
    shishenCounts,
  }
})
