import { toLunar, formatLunar } from 'lunar'

export function useLunar() {
  /**
   * 将阳历日期转换为农历字符串
   * @param year 阳历年份
   * @param month 阳历月份 (1-12)
   * @param day 阳历日期 (1-31)
   * @returns 农历格式化字符串，如 "农历甲辰年正月初一"
   */
  function solarToLunar(year: number, month: number, day: number): string {
    try {
      const { lunar } = toLunar({ year, month, day })
      return formatLunar(lunar)
    } catch {
      return ''
    }
  }

  return { solarToLunar }
}
