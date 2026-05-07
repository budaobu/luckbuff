import type { BaziChart } from '~/types/bazi'
import { calcPillars } from '~/utils/bazi/pillars'
import { calcDaYun, isForward } from '~/utils/bazi/dayun'
import { getMonthZhiIndex } from '~/utils/bazi/calendar'
import { calcWuxingScore, calcRiZhuStrength, calcXiYongJiShen, calcGeJu } from '~/utils/bazi/analysisCalc'

export function useBaziCalc() {
  function calc(
    birthYear: number,
    birthMonth: number,
    birthDay: number,
    birthHourDizhi: string | null,
    gender: 'male' | 'female',
  ): BaziChart {
    // 时辰地支转小时数（取中间值）
    const hourMap: Record<string, number> = {
      子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
      午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
    }
    const hour = birthHourDizhi ? hourMap[birthHourDizhi] ?? null : null

    // 排四柱
    const pillars = calcPillars(birthYear, birthMonth, birthDay, hour, gender)

    // 五行分析
    const chartPartial: BaziChart = {
      year: pillars.year,
      month: pillars.month,
      day: pillars.day,
      hour: pillars.hour,
      riZhu: pillars.riZhu,
      riZhuStrength: '身弱', // 临时值，下面会重新计算
      wuxingScore: { 木: 20, 火: 20, 土: 20, 金: 20, 水: 20 },
      geju: '',
      xiyong: '',
      jishen: '',
      dayuns: [],
      qiyunAge: 0,
      currentAge: new Date().getFullYear() - birthYear,
      currentDaYun: null,
    }

    const wuxingScore = calcWuxingScore(chartPartial)
    const riZhuStrength = calcRiZhuStrength(pillars.riZhu, pillars.month.zhi, wuxingScore)

    chartPartial.riZhuStrength = riZhuStrength
    chartPartial.wuxingScore = wuxingScore

    const { xiyong, jishen } = calcXiYongJiShen(pillars.riZhu, riZhuStrength, wuxingScore)
    chartPartial.xiyong = xiyong
    chartPartial.jishen = jishen

    const geju = calcGeJu(chartPartial)
    chartPartial.geju = geju

    // 大运
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

    // 当前大运
    const currentAge = chartPartial.currentAge
    const currentDaYun = dayuns.find(
      d => d.ageRange[0] <= currentAge && d.ageRange[1] >= currentAge,
    ) ?? null
    chartPartial.currentDaYun = currentDaYun

    return chartPartial
  }

  // 供表单实时显示干支（如"甲子年 丙寅月 戊辰日"）
  function dateToGanZhi(year: number, month: number, day: number): string {
    const { year: y, month: m, day: d } = calcPillars(year, month, day, null, 'male')
    return `${y.gan}${y.zhi}年 ${m.gan}${m.zhi}月 ${d.gan}${d.zhi}日`
  }

  return { calc, dateToGanZhi }
}
