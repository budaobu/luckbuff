import {
  TIAN_GAN,
  DI_ZHI,
  MONTH_ZHI,
} from './constants'

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

export function getDaysInMonth(year: number, month: number): number {
  const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month === 2 && isLeapYear(year)) return 29
  return days[month]!
}

export function dayOfYear(year: number, month: number, day: number): number {
  const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (isLeapYear(year)) days[2] = 29
  let result = 0
  for (let m = 1; m < month; m++) result += days[m]!
  return result + day
}

// 12 个节（月建之节）的近似日期
// 索引: 0=立春 1=惊蛰 2=清明 3=立夏 4=芒种 5=小暑 6=立秋 7=白露 8=寒露 9=立冬 10=大雪 11=小寒
export function getJieDayOfYear(year: number, jieIndex: number): number {
  const jieMonth = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1][jieIndex]
  const jieDay = [4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 7, 6][jieIndex]

  let offset = 0
  if (jieIndex === 0) {
    const y = year
    const early3 = new Set([
      1903, 1907, 1911, 1915, 1919, 1923, 1927, 1931, 1935, 1939, 1943, 1947,
      1951, 1955, 1959, 1963, 1967, 1971, 1975, 1979, 1983, 1987, 1991, 1995,
      1999, 2003, 2007, 2011, 2015, 2019, 2023, 2027, 2031, 2035, 2039, 2043,
      2047, 2051, 2055, 2059, 2063, 2067, 2071, 2075, 2079, 2083, 2087, 2091,
      2095, 2099,
    ])
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

  const base = dayOfYear(year, jieMonth!, jieDay!)
  return base + offset
}

export function getMonthZhiIndex(year: number, month: number, day: number): {
  index: number
  isJieBorder: boolean
} {
  const currentDayOfYear = dayOfYear(year, month, day)

  let jieIndex = 11
  for (let i = 0; i < 12; i++) {
    const jieDay = getJieDayOfYear(year, i)
    if (currentDayOfYear >= jieDay) {
      jieIndex = i
    }
  }

  const daXueDay = getJieDayOfYear(year, 10)
  if (jieIndex === 11 && currentDayOfYear > daXueDay) {
    jieIndex = 10
  }

  const currentJieDay = getJieDayOfYear(year, jieIndex)
  const isJieBorder = Math.abs(currentDayOfYear - currentJieDay) <= 1

  return { index: jieIndex, isJieBorder }
}

export function getYearPillar(year: number, month: number, day: number): {
  gan: string
  zhi: string
  isLiChunBorder: boolean
} {
  const lichenDay = getJieDayOfYear(year, 0)
  const currentDay = dayOfYear(year, month, day)

  let effectiveYear = year
  if (currentDay < lichenDay) {
    effectiveYear = year - 1
  }

  const ganIndex = (effectiveYear - 4) % 10
  const zhiIndex = (effectiveYear - 4) % 12

  return {
    gan: TIAN_GAN[ganIndex < 0 ? ganIndex + 10 : ganIndex]!,
    zhi: DI_ZHI[zhiIndex < 0 ? zhiIndex + 12 : zhiIndex]!,
    isLiChunBorder: Math.abs(currentDay - lichenDay) <= 1,
  }
}

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
  const zhi = MONTH_ZHI[jieIndex]!

  const ganStartIndex: Record<string, number> = {
    甲: 2, 己: 2, 乙: 4, 庚: 4, 丙: 6, 辛: 6, 丁: 8, 壬: 8, 戊: 0, 癸: 0,
  }

  const ganIndex = ((ganStartIndex[yearGan] ?? 0) + jieIndex) % 10
  const gan = TIAN_GAN[ganIndex]!

  return { gan, zhi, isJieBorder }
}

export function getDayPillar(year: number, month: number, day: number): {
  gan: string
  zhi: string
} {
  const y = year - 1
  const d = dayOfYear(year, month, day)
  const g = (y * 5 + Math.floor(y / 4) + d) % 60

  return {
    gan: TIAN_GAN[g % 10]!,
    zhi: DI_ZHI[g % 12]!,
  }
}

export function getHourPillar(
  dayGan: string,
  hour: number,
): {
  gan: string
  zhi: string
  isZiShiBorder: boolean
} {
  let zhiIndex: number
  let isZiShiBorder = false

  if (hour >= 23) {
    zhiIndex = 0
    isZiShiBorder = true
  } else if (hour >= 1) {
    zhiIndex = Math.floor((hour - 1) / 2) + 1
  } else {
    zhiIndex = 0
  }

  const zhi = DI_ZHI[zhiIndex]!

  const ganStartIndex: Record<string, number> = {
    甲: 0, 己: 0, 乙: 2, 庚: 2, 丙: 4, 辛: 4, 丁: 6, 壬: 6, 戊: 8, 癸: 8,
  }

  const ganIndex = ((ganStartIndex[dayGan] ?? 0) + zhiIndex) % 10
  const gan = TIAN_GAN[ganIndex]!

  return { gan, zhi, isZiShiBorder }
}
