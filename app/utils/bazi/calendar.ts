import { TIAN_GAN, DI_ZHI, MONTH_ZHI } from './constants'

// 闰年判断
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

// 计算某月的天数
export function getDaysInMonth(year: number, month: number): number {
  const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month === 2 && isLeapYear(year)) return 29
  return days[month]
}

// 计算日期是一年中的第几天
export function dayOfYear(year: number, month: number, day: number): number {
  const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (isLeapYear(year)) days[2] = 29
  let result = 0
  for (let m = 1; m < month; m++) result += days[m]
  return result + day
}

// 12 个节（月建之节）的近似日期
// 索引: 0=立春 1=惊蛰 2=清明 3=立夏 4=芒种 5=小暑 6=立秋 7=白露 8=寒露 9=立冬 10=大雪 11=小寒
// 返回各节在一年中的第几天（近似值，可能有 ±1 天误差）
export function getJieDayOfYear(year: number, jieIndex: number): number {
  const jieMonth = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1][jieIndex]
  // 基准日期（大多数年份）
  const jieDay = [4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 7, 6][jieIndex]

  // 基于年份的微调（使用一个简化的偏移表，覆盖 1900-2100）
  // 立春偏移：部分年份提前或延后 1 天
  let offset = 0
  if (jieIndex === 0) {
    // 立春微调：基于年份对特定模数的余数
    const y = year
    // 这个简化规则覆盖了大部分 1900-2100 的情况
    // 2月3日的年份（提前1天）
    const early3 = new Set([
      1903, 1907, 1911, 1915, 1919, 1923, 1927, 1931, 1935, 1939, 1943, 1947,
      1951, 1955, 1959, 1963, 1967, 1971, 1975, 1979, 1983, 1987, 1991, 1995,
      1999, 2003, 2007, 2011, 2015, 2019, 2023, 2027, 2031, 2035, 2039, 2043,
      2047, 2051, 2055, 2059, 2063, 2067, 2071, 2075, 2079, 2083, 2087, 2091,
      2095, 2099,
    ])
    // 2月5日的年份（延后1天）
    const late5 = new Set([
      1900, 1904, 1908, 1912, 1916, 1920, 1924, 1928, 1932, 1936, 1940, 1944,
      1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992,
      1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024, 2028, 2032, 2036, 2040,
      2044, 2048, 2052, 2056, 2060, 2064, 2068, 2072, 2076, 2080, 2084, 2088,
      2092, 2096, 2100,
    ])
    if (early3.has(y)) offset = -1
    else if (late5.has(y)) offset = 1
    else offset = 0
  }

  const base = dayOfYear(year, jieMonth, jieDay)
  return base + offset
}

// 判断某日期是否在指定节之后（用于确定月柱）
// 返回该日期所属的节索引（0-11），以及是否在节气交界日
export function getMonthZhiIndex(year: number, month: number, day: number): {
  index: number
  isJieBorder: boolean
} {
  const currentDayOfYear = dayOfYear(year, month, day)

  // 确定当前日期落在哪个节区间
  let jieIndex = 11 // 默认小寒（上年）到立春前 = 丑月
  for (let i = 0; i < 12; i++) {
    const jieDay = getJieDayOfYear(year, i)
    if (currentDayOfYear >= jieDay) {
      jieIndex = i
    }
  }

  // 修复：getJieDayOfYear 对索引11（小寒）返回的是当年1月6日左右的日期（dayOfYear~6）
  // 对于12月的日期（dayOfYear > 340），currentDayOfYear >= 6 恒成立，导致 jieIndex 被错误更新为11（丑月）
  // 但12月在大雪（12月7日）之后、次年小寒（1月6日）之前，应该是子月（jieIndex=10）
  const daXueDay = getJieDayOfYear(year, 10) // 大雪
  if (jieIndex === 11 && currentDayOfYear > daXueDay) {
    jieIndex = 10 // 子月
  }

  // 检查是否在节气交界日（前后1天）
  const currentJieDay = getJieDayOfYear(year, jieIndex)
  const isJieBorder = Math.abs(currentDayOfYear - currentJieDay) <= 1

  return { index: jieIndex, isJieBorder }
}

// 计算年柱
// 年柱以立春为界，立春前属上一年
export function getYearPillar(year: number, month: number, day: number): {
  gan: string
  zhi: string
  isLiChunBorder: boolean
} {
  const lichenDay = getJieDayOfYear(year, 0) // 立春
  const currentDay = dayOfYear(year, month, day)

  let effectiveYear = year
  if (currentDay < lichenDay) {
    effectiveYear = year - 1
  }

  const ganIndex = (effectiveYear - 4) % 10
  const zhiIndex = (effectiveYear - 4) % 12

  return {
    gan: TIAN_GAN[ganIndex < 0 ? ganIndex + 10 : ganIndex],
    zhi: DI_ZHI[zhiIndex < 0 ? zhiIndex + 12 : zhiIndex],
    isLiChunBorder: Math.abs(currentDay - lichenDay) <= 1,
  }
}

// 计算月柱
export function getMonthPillar(
  yearGan: string,
  year: number,
  month: number,
  day: number,
): {
  gan: string
  zhi: string
  isJieBorder: boolean
} {
  const { index: jieIndex, isJieBorder } = getMonthZhiIndex(year, month, day)
  const zhi = MONTH_ZHI[jieIndex]

  // 年上起月法（五虎遁）
  const ganStartIndex =
    {
      甲: 2, 己: 2, 乙: 4, 庚: 4, 丙: 6, 辛: 6, 丁: 8, 壬: 8, 戊: 0, 癸: 0,
    }[yearGan] ?? 0

  const ganIndex = (ganStartIndex + jieIndex) % 10
  const gan = TIAN_GAN[ganIndex]

  return { gan, zhi, isJieBorder }
}

// 计算日柱
// 使用标准公式：(年份 - 1) * 5 + floor((年份 - 1) / 4) + 当年第几天
// 基准：1900-01-01 = 甲戌（序号10）
export function getDayPillar(year: number, month: number, day: number): {
  gan: string
  zhi: string
} {
  const y = year - 1
  const d = dayOfYear(year, month, day)
  const g = (y * 5 + Math.floor(y / 4) + d) % 60

  const ganIndex = g % 10
  const zhiIndex = g % 12

  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex],
  }
}

// 计算时柱
// birthHour: 0-23，支持早晚子时
export function getHourPillar(
  dayGan: string,
  hour: number,
): {
  gan: string
  zhi: string
  isZiShiBorder: boolean
} {
  // 时辰索引：0=子, 1=丑, ..., 11=亥
  // 早晚子时：23:00-24:00 属次日（日柱+1），0:00-1:00 属当日
  let zhiIndex: number
  let isZiShiBorder = false

  if (hour >= 23) {
    zhiIndex = 0 // 子时
    isZiShiBorder = true
  } else if (hour >= 1) {
    zhiIndex = Math.floor((hour - 1) / 2) + 1
  } else {
    zhiIndex = 0 // 0:00-1:00 早子时
  }

  const zhi = DI_ZHI[zhiIndex]

  // 日上起时法（五鼠遁）
  const ganStartIndex =
    {
      甲: 0, 己: 0, 乙: 2, 庚: 2, 丙: 4, 辛: 4, 丁: 6, 壬: 6, 戊: 8, 癸: 8,
    }[dayGan] ?? 0

  const ganIndex = (ganStartIndex + zhiIndex) % 10
  const gan = TIAN_GAN[ganIndex]

  return { gan, zhi, isZiShiBorder }
}

// 公历日期转完整干支（年、月、日、时）
export function solarToGanZhi(
  year: number,
  month: number,
  day: number,
  hour: number | null,
): {
  year: { gan: string; zhi: string }
  month: { gan: string; zhi: string; isJieBorder: boolean }
  day: { gan: string; zhi: string }
  hour: { gan: string; zhi: string; isZiShiBorder: boolean } | null
  liChunBorder: boolean
} {
  const yearPillar = getYearPillar(year, month, day)
  const monthPillar = getMonthPillar(yearPillar.gan, year, month, day)
  const dayPillar = getDayPillar(year, month, day)

  let hourPillar: { gan: string; zhi: string; isZiShiBorder: boolean } | null = null
  if (hour !== null) {
    // 早晚子时：23:00-24:00 日柱进一
    let effectiveDayGan = dayPillar.gan
    if (hour >= 23) {
      // 日柱进一
      const dayGanIdx = TIAN_GAN.indexOf(dayPillar.gan as never)
      const dayZhiIdx = DI_ZHI.indexOf(dayPillar.zhi as never)
      effectiveDayGan = TIAN_GAN[(dayGanIdx + 1) % 10]
    }
    hourPillar = getHourPillar(effectiveDayGan, hour)
  }

  return {
    year: { gan: yearPillar.gan, zhi: yearPillar.zhi },
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    liChunBorder: yearPillar.isLiChunBorder,
  }
}
