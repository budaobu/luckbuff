import type { DaYun } from '~/types/bazi'
import type { TianGan, DiZhi } from '~/types/user'
import { TIAN_GAN, DI_ZHI, GAN_YANG } from './constants'
import { getJieDayOfYear, dayOfYear, isLeapYear } from './calendar'

/**
 * 大运计算
 * 规则：
 * 1. 阳年男、阴年女：顺排（月柱干支向后推）
 * 2. 阴年男、阳年女：逆排（月柱干支向前推）
 * 3. 起运年龄：
 *    - 顺排：从出生日到下一个"节"的天数 ÷ 3（四舍五入）
 *    - 逆排：从出生日到上一个"节"的天数 ÷ 3（四舍五入）
 * 4. 每步大运管 10 年
 */

function nextGan(gan: string): string {
  const idx = TIAN_GAN.indexOf(gan as never)
  return TIAN_GAN[(idx + 1) % 10]!
}

function prevGan(gan: string): string {
  const idx = TIAN_GAN.indexOf(gan as never)
  return TIAN_GAN[(idx - 1 + 10) % 10]!
}

function nextZhi(zhi: string): string {
  const idx = DI_ZHI.indexOf(zhi as never)
  return DI_ZHI[(idx + 1) % 12]!
}

function prevZhi(zhi: string): string {
  const idx = DI_ZHI.indexOf(zhi as never)
  return DI_ZHI[(idx - 1 + 12) % 12]!
}

// 判断年干阴阳
function isYangYear(gan: string): boolean {
  return GAN_YANG[gan] ?? false
}

// 判断大运方向：true=顺排, false=逆排
export function isForward(
  yearGan: string,
  gender: 'male' | 'female',
): boolean {
  const yang = isYangYear(yearGan)
  if (gender === 'male') return yang
  return !yang
}

// 计算从出生日到目标节气的天数
function daysToJie(
  year: number,
  month: number,
  day: number,
  jieIndex: number,
): number {
  const birthDayOfYear = dayOfYear(year, month, day)
  const jieDayOfYear = getJieDayOfYear(year, jieIndex)
  return jieDayOfYear - birthDayOfYear
}

// 计算起运年龄
export function calcQiYunAge(
  year: number,
  month: number,
  day: number,
  yearGan: string,
  gender: 'male' | 'female',
  monthZhiIndex: number,
): number {
  const forward = isForward(yearGan, gender)
  const birthDay = dayOfYear(year, month, day)

  let daysDiff: number

  if (forward) {
    // 顺排：从出生日到下一个节的天数
    const nextJieIndex = (monthZhiIndex + 1) % 12
    const nextJieDay = getJieDayOfYear(year, nextJieIndex)

    if (nextJieDay > birthDay) {
      // 下一个节在今年（日期上在生日之后）
      daysDiff = nextJieDay - birthDay
    } else {
      // 下一个节在明年（跨年了）
      const daysInYear = isLeapYear(year) ? 366 : 365
      daysDiff = (daysInYear - birthDay) + nextJieDay
    }
  } else {
    // 逆排：从出生日到上一个节的天数
    const prevJieIndex = (monthZhiIndex - 1 + 12) % 12
    const prevJieDay = getJieDayOfYear(year, prevJieIndex)

    if (prevJieDay < birthDay) {
      // 上一个节在今年（日期上在生日之前）
      daysDiff = birthDay - prevJieDay
    } else {
      // 上一个节在去年（跨年了）
      const daysInPrevYear = isLeapYear(year - 1) ? 366 : 365
      daysDiff = birthDay + (daysInPrevYear - prevJieDay)
    }
  }

  // 天数 ÷ 3 = 起运年数（四舍五入）
  // 3天 = 1岁，1天 = 4个月
  const years = Math.round(daysDiff / 3)
  return Math.max(0, years)
}

// 生成大运列表
// ageRange 固定为 0~9, 10~19, ..., 90~99，覆盖完整 0~100 岁人生运势
export function calcDaYun(
  yearGan: string,
  monthGan: string,
  monthZhi: string,
  gender: 'male' | 'female',
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  monthZhiIndex: number,
): { dayuns: DaYun[]; qiyunAge: number } {
  const forward = isForward(yearGan, gender)
  const qiyunAge = calcQiYunAge(birthYear, birthMonth, birthDay, yearGan, gender, monthZhiIndex)

  const dayuns: DaYun[] = []
  let currentGan = monthGan
  let currentZhi = monthZhi

  // 排10步大运，固定每步10年，从1岁开始，覆盖1~100岁
  for (let i = 0; i < 10; i++) {
    const startAge = i * 10 + 1
    const endAge = (i + 1) * 10

    if (forward) {
      currentGan = nextGan(currentGan)
      currentZhi = nextZhi(currentZhi)
    } else {
      currentGan = prevGan(currentGan)
      currentZhi = prevZhi(currentZhi)
    }

    dayuns.push({
      index: i + 1,
      ageRange: [startAge, endAge] as [number, number],
      gan: currentGan as TianGan,
      zhi: currentZhi as DiZhi,
    })
  }

  return { dayuns, qiyunAge }
}
