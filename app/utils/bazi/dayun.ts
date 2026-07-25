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

// 计算从出生日到目标"节"的天数（非负，按方向取最近的那个节）
// 目标节相对生日的年份由节的月份直接推定，避免年内第几天在跨年时的比较陷阱：
//   - 小寒(1月)：顺排时对任何生日都是"下一个节"；逆排时只有 1 月生日用得到（必在小寒后）
//   - 大雪(12月)：顺排时只有 12 月生日用得到（必在大雪后）；逆排时对 1 月生日是"去年12月"
function daysToJie(
  year: number,
  month: number,
  day: number,
  jieIndex: number,
  forward: boolean,
): number {
  // 节所在月份：0=立春(2月) ... 10=大雪(12月), 11=小寒(1月)
  const jieMonth = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1][jieIndex]!
  const birthDoy = dayOfYear(year, month, day)

  let jieYear: number
  if (jieMonth === month) {
    jieYear = year
  } else if (jieMonth === 1) {
    // 小寒：顺排=次年1月；逆排=当年1月（仅 1 月生日会走到这里）
    jieYear = forward ? year + 1 : year
  } else if (jieMonth === 12 && month === 1) {
    // 1 月生日逆排到去年 12 月的节
    jieYear = year - 1
  } else {
    // 其余情况节与生日同月（上面已覆盖）或同年
    jieYear = year
  }

  const jieDoy = getJieDayOfYear(jieYear, jieIndex)
  if (jieYear === year) return Math.abs(jieDoy - birthDoy)
  if (jieYear === year + 1) return (isLeapYear(year) ? 366 : 365) - birthDoy + jieDoy
  return birthDoy + (isLeapYear(jieYear) ? 366 : 365) - jieDoy
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

  // 顺排数到下一个节，逆排数到本月（当前）的节；daysToJie 已处理跨年，结果恒为 [0, 31] 天
  const targetJieIndex = forward ? (monthZhiIndex + 1) % 12 : monthZhiIndex
  const daysDiff = daysToJie(year, month, day, targetJieIndex, forward)

  // 天数 ÷ 3 = 起运年数（四舍五入）
  // 3天 = 1岁，1天 = 4个月
  const years = Math.round(daysDiff / 3)
  return Math.max(0, years)
}

// 生成大运列表
// 第一步大运从起运年龄开始，每步管 10 年，排 9 步覆盖约 90 年
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

  for (let i = 0; i < 9; i++) {
    const startAge = qiyunAge + i * 10
    const endAge = startAge + 9

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
