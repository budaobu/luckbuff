import { toGregorian } from 'lunar'
import { TIAN_GAN, DI_ZHI } from '~/utils/bazi/constants'

/**
 * 默认目标流年：下一个农历正月初一所在的公历年份。
 * 今天已过当年春节 → 下一年；否则 → 当年（春节还没到，生肖年未开始）。
 */
export function getNextZodiacYear(now: Date = new Date()): number {
  const y = now.getFullYear()
  try {
    const { date } = toGregorian({ year: y, month: 1, day: 1 })
    const cny = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    return today >= cny ? y + 1 : y
  }
  catch {
    return y + 1
  }
}

/** 流年干支：以农历生肖年（正月初一换年）口径取公历年份干支 */
export function getYearGanZhi(year: number): { gan: string, zhi: string } {
  const ganIndex = (((year - 4) % 10) + 10) % 10
  const zhiIndex = (((year - 4) % 12) + 12) % 12
  return { gan: TIAN_GAN[ganIndex]!, zhi: DI_ZHI[zhiIndex]! }
}

export type LiunianGrade = 'daji' | 'ji' | 'ping' | 'xiong' | 'daxiong'

export function scoreToGrade(score: number): LiunianGrade {
  if (score >= 80) return 'daji'
  if (score >= 65) return 'ji'
  if (score >= 50) return 'ping'
  if (score >= 35) return 'xiong'
  return 'daxiong'
}
