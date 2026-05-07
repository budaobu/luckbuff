import type { ZwdsChart } from '~/types/zwds'
import type { DiZhi } from '~/types/user'
import { calcZwdsPan, dateToYearGanZhi } from '~/utils/zwds/pan'

export function useZwdsCalc() {
  function calc(
    birthYear: number,
    birthMonth: number,
    birthDay: number,
    birthHourDizhi: DiZhi | null,
    gender: 'male' | 'female',
  ): ZwdsChart {
    return calcZwdsPan(birthYear, birthMonth, birthDay, birthHourDizhi, gender)
  }

  /** 供表单实时显示年干支 */
  function dateToGanZhi(year: number, month: number, day: number): string {
    return dateToYearGanZhi(year, month, day)
  }

  return { calc, dateToGanZhi }
}
