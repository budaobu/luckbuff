import type { ZipingBaziChart } from '~/types/ziping-bazi'
import { calcZipingChart } from '~/utils/ziping-bazi/pillars'

export function useZipingBaziCalc() {
  function calc(
    birthYear: number,
    birthMonth: number,
    birthDay: number,
    birthHourDizhi: string | null,
    gender: 'male' | 'female',
  ): ZipingBaziChart {
    return calcZipingChart(birthYear, birthMonth, birthDay, birthHourDizhi, gender)
  }

  function dateToGanZhi(year: number, month: number, day: number): string {
    const chart = calcZipingChart(year, month, day, null, 'male')
    return `${chart.year.gan}${chart.year.zhi}年 ${chart.month.gan}${chart.month.zhi}月 ${chart.day.gan}${chart.day.zhi}日`
  }

  return { calc, dateToGanZhi }
}
