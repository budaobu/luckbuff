import type { DaYun } from '~/types/ziping-bazi'
import { TIAN_GAN, DI_ZHI, GAN_YANG } from './constants'
import { getJieDayOfYear, dayOfYear, isLeapYear } from './calendar'

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

export function isForward(yearGan: string, gender: 'male' | 'female'): boolean {
  const yang = GAN_YANG[yearGan] ?? false
  if (gender === 'male') return yang
  return !yang
}

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
    const nextJieIndex = (monthZhiIndex + 1) % 12
    const nextJieDay = getJieDayOfYear(year, nextJieIndex)

    if (nextJieDay > birthDay) {
      daysDiff = nextJieDay - birthDay
    } else {
      const daysInYear = isLeapYear(year) ? 366 : 365
      daysDiff = (daysInYear - birthDay) + nextJieDay
    }
  } else {
    const prevJieIndex = (monthZhiIndex - 1 + 12) % 12
    const prevJieDay = getJieDayOfYear(year, prevJieIndex)

    if (prevJieDay < birthDay) {
      daysDiff = birthDay - prevJieDay
    } else {
      const daysInPrevYear = isLeapYear(year - 1) ? 366 : 365
      daysDiff = birthDay + (daysInPrevYear - prevJieDay)
    }
  }

  const years = Math.round(daysDiff / 3)
  return Math.max(0, years)
}

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
      gan: currentGan,
      zhi: currentZhi,
    })
  }

  return { dayuns, qiyunAge }
}
