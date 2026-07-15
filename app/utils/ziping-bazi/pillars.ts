import type { ZipingBaziChart, ZipingPillar } from '~/types/ziping-bazi'
import type { DiZhi, TianGan } from '~/types/user'
import {
  TIAN_GAN,
  DI_ZHI,
  ZHI_CANGGAN,
} from './constants'
import {
  getYearPillar,
  getMonthPillar,
  getDayPillar,
  getHourPillar,
} from './calendar'
import { getShiShen, calcZipingWuxingScore, calcZipingRiZhuStrength, calcZipingXiYongJiShen, calcZipingGeJu } from './analysis'
import { getMonthZhiIndex } from './calendar'
import { calcDaYun } from './dayun'

export function calcZipingPillars(
  year: number,
  month: number,
  day: number,
  hour: number | null,
  gender: 'male' | 'female',
): {
  year: ZipingPillar
  month: ZipingPillar
  day: ZipingPillar
  hour: ZipingPillar | null
  riZhu: TianGan
} {
  const yPillar = getYearPillar(year, month, day)
  const mPillar = getMonthPillar(yPillar.gan, year, month, day)
  const dPillar = getDayPillar(year, month, day)

  const yearPillar: ZipingPillar = {
    gan: yPillar.gan as TianGan,
    zhi: yPillar.zhi as DiZhi,
    shishen: getShiShen(dPillar.gan, yPillar.gan),
    canggan: ZHI_CANGGAN[yPillar.zhi]!.map(c => ({
      gan: c.gan as TianGan,
      type: c.type,
    })),
  }

  const monthPillar: ZipingPillar = {
    gan: mPillar.gan as TianGan,
    zhi: mPillar.zhi as DiZhi,
    shishen: getShiShen(dPillar.gan, mPillar.gan),
    canggan: ZHI_CANGGAN[mPillar.zhi]!.map(c => ({
      gan: c.gan as TianGan,
      type: c.type,
    })),
  }

  const dayPillar: ZipingPillar = {
    gan: dPillar.gan as TianGan,
    zhi: dPillar.zhi as DiZhi,
    shishen: '日主',
    canggan: ZHI_CANGGAN[dPillar.zhi]!.map(c => ({
      gan: c.gan as TianGan,
      type: c.type,
    })),
  }

  let hourPillar: ZipingPillar | null = null
  if (hour !== null) {
    let effectiveDayGan = dPillar.gan
    if (hour >= 23) {
      const dayGanIdx = TIAN_GAN.indexOf(dPillar.gan as never)
      effectiveDayGan = TIAN_GAN[(dayGanIdx + 1) % 10]!
    }
    const hPillar = getHourPillar(effectiveDayGan, hour)

    hourPillar = {
      gan: hPillar.gan as TianGan,
      zhi: hPillar.zhi as DiZhi,
      shishen: getShiShen(dPillar.gan, hPillar.gan),
      canggan: ZHI_CANGGAN[hPillar.zhi]!.map(c => ({
        gan: c.gan as TianGan,
        type: c.type,
      })),
    }
  }

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    riZhu: dPillar.gan as TianGan,
  }
}

export function calcZipingChart(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHourDizhi: string | null,
  gender: 'male' | 'female',
): ZipingBaziChart {
  const hourMap: Record<string, number> = {
    子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
    午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
  }
  const hour = birthHourDizhi ? hourMap[birthHourDizhi] ?? null : null

  const pillars = calcZipingPillars(birthYear, birthMonth, birthDay, hour, gender)

  const chartPartial: ZipingBaziChart = {
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
    currentAge: new Date().getFullYear() - birthYear,
    currentDaYun: null,
  }

  const wuxingScore = calcZipingWuxingScore(chartPartial)
  const riZhuStrength = calcZipingRiZhuStrength(pillars.riZhu, pillars.month.zhi, wuxingScore)

  chartPartial.wuxingScore = wuxingScore
  chartPartial.riZhuStrength = riZhuStrength

  const { xiyong, jishen } = calcZipingXiYongJiShen(pillars.riZhu, riZhuStrength, wuxingScore)
  chartPartial.xiyong = xiyong
  chartPartial.jishen = jishen

  chartPartial.geju = calcZipingGeJu(chartPartial)

  const { index: monthZhiIdx } = getMonthZhiIndex(birthYear, birthMonth, birthDay)
  const { dayuns, qiyunAge } = calcDaYun(
    pillars.year.gan,
    pillars.month.gan,
    pillars.month.zhi,
    gender,
    birthYear,
    birthMonth,
    birthDay,
    monthZhiIdx,
  )

  chartPartial.dayuns = dayuns
  chartPartial.qiyunAge = qiyunAge

  const currentAge = chartPartial.currentAge
  chartPartial.currentDaYun = dayuns.find(
    d => d.ageRange[0] <= currentAge && d.ageRange[1] >= currentAge,
  ) ?? null

  return chartPartial
}
