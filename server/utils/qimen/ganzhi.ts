// ============================================================
// 干支历计算
// ============================================================

import { TIAN_GAN, DI_ZHI, JIEQI_TABLE, JIAZI_60, XUN_SHOU, GAN_INDEX, ZHI_INDEX } from './constants'
import type { JieqiInfo } from './constants'

/**
 * 计算年干支（以立春为界）
 */
export function getYearGanZhi(date: Date): string {
  const year = date.getFullYear()
  // 简化为以立春(2月4日)为界
  const isBeforeLichun = date.getMonth() < 1 || (date.getMonth() === 1 && date.getDate() < 4)
  const ganZhiYear = isBeforeLichun ? year - 1 : year
  // 1984年是甲子年
  const offset = (ganZhiYear - 1984 + 60) % 60
  return JIAZI_60[offset] || '甲子'
}

/**
 * 计算月干支
 * 正月建寅，月干由年干决定
 */
export function getMonthGanZhi(date: Date, yearGanZhi: string): string {
  const yearGan = yearGanZhi.charAt(0)
  const yearGanIdx = GAN_INDEX[yearGan] ?? 0
  // 月干起点：甲己年正月起丙寅，乙庚年正月起戊寅，丙辛年正月起庚寅，丁壬年正月起壬寅，戊癸年正月起甲寅
  const monthGanStart: Record<number, number> = {
    0: 2, // 甲→丙
    5: 2, // 己→丙
    1: 4, // 乙→戊
    6: 4, // 庚→戊
    2: 6, // 丙→庚
    7: 6, // 辛→庚
    3: 8, // 丁→壬
    8: 8, // 壬→壬
    4: 0, // 戊→甲
    9: 0, // 癸→甲
  }
  const startGanIdx = monthGanStart[yearGanIdx] ?? 2

  // 计算月份（正月=寅=2）
  const month = date.getMonth() // 0-11
  // 正月(1月)建寅，二月建卯...
  const zhiIdx = (month + 2) % 12 // 寅=2, 卯=3, ..., 丑=1
  const ganIdx = (startGanIdx + month) % 10

  return (TIAN_GAN[ganIdx] || '') + (DI_ZHI[zhiIdx] || '')
}

/**
 * 计算日干支（简化公式，基于1900年1月31日=甲子日）
 */
export function getDayGanZhi(date: Date): string {
  // 1900年1月31日是甲子日（儒略日2415021）
  const baseDate = new Date(1900, 0, 31)
  const diffMs = date.getTime() - baseDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const offset = ((diffDays % 60) + 60) % 60
  return JIAZI_60[offset] || '甲子'
}

/**
 * 计算时干支
 * 子时：23-1点，丑时：1-3点...
 */
export function getHourGanZhi(date: Date, dayGanZhi: string): string {
  const hour = date.getHours()
  // 时辰索引：子=0, 丑=1, ..., 亥=11
  let zhiIdx: number
  if (hour >= 23 || hour < 1) {
    zhiIdx = 0 // 子
  } else {
    zhiIdx = Math.floor((hour - 1) / 2) + 1
  }

  // 时干由日干决定
  // 甲己日起甲子，乙庚日起丙子，丙辛日起戊子，丁壬日起庚子，戊癸日起壬子
  const dayGan = dayGanZhi.charAt(0)
  const dayGanIdx = GAN_INDEX[dayGan] ?? 0
  const hourGanStart: Record<number, number> = {
    0: 0, // 甲→甲
    5: 0, // 己→甲
    1: 2, // 乙→丙
    6: 2, // 庚→丙
    2: 4, // 丙→戊
    7: 4, // 辛→戊
    3: 6, // 丁→庚
    8: 6, // 壬→庚
    4: 8, // 戊→壬
    9: 8, // 癸→壬
  }
  const startGanIdx = hourGanStart[dayGanIdx] ?? 0
  const ganIdx = (startGanIdx + zhiIdx) % 10

  return (TIAN_GAN[ganIdx] || '') + (DI_ZHI[zhiIdx] || '')
}

/**
 * 查找当前节气
 * 返回当前所处的节气（从列表中找到最后一个不大于当前日期的节气）
 */
export function getCurrentJieqi(date: Date): JieqiInfo {
  const month = date.getMonth() + 1
  const day = date.getDate()

  // 将日期转换为年内天数（简化，忽略闰年差异）
  const monthDays = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const year = date.getFullYear()
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  if (isLeap) monthDays[2] = 29

  let currentDayOfYear = 0
  for (let m = 1; m < month; m++) currentDayOfYear += monthDays[m] || 0
  currentDayOfYear += day

  // 找到当前节气
  let currentJieqi: JieqiInfo | undefined = undefined
  for (const jq of JIEQI_TABLE) {
    let jqDayOfYear = 0
    for (let m = 1; m < jq.month; m++) jqDayOfYear += monthDays[m]!
    jqDayOfYear += jq.day

    if (jqDayOfYear <= currentDayOfYear) {
      currentJieqi = jq
    }
  }

  // 如果当前日期在年内第一个节气之前，取去年的最后一个节气（冬至）
  if (!currentJieqi) {
    currentJieqi = JIEQI_TABLE[JIEQI_TABLE.length - 1]!
  }

  return currentJieqi
}

/**
 * 确定局数（上中下元）
 * 由日干支的旬首决定
 */
export function determineJuNumber(jieqi: JieqiInfo, dayGanZhi: string): { juShu: number; yinYang: 'yang' | 'yin' } {
  // 查找日干支属于哪一旬
  let xunIdx = -1
  for (let i = 0; i < XUN_SHOU.length; i++) {
    const xunStart = XUN_SHOU[i]!
    const startIdx = JIAZI_60.indexOf(xunStart)
    // 每旬10个
    for (let j = 0; j < 10; j++) {
      if (JIAZI_60[(startIdx + j) % 60] === dayGanZhi) {
        xunIdx = i
        break
      }
    }
    if (xunIdx >= 0) break
  }

  // 上元：甲子、甲午(旬首0,2) => 下标0,2
  // 中元：甲戌、甲辰(旬首1,4) => 下标1,4
  // 下元：甲申、甲寅(旬首3,5) => 下标3,5
  let yuanIdx: number
  if (xunIdx === 0 || xunIdx === 2) {
    yuanIdx = 0 // 上元
  } else if (xunIdx === 1 || xunIdx === 4) {
    yuanIdx = 1 // 中元
  } else {
    yuanIdx = 2 // 下元
  }

  if (jieqi.isYang) {
    return { juShu: jieqi.yangDun[yuanIdx] || 1, yinYang: 'yang' }
  } else {
    return { juShu: jieqi.yinDun[yuanIdx] || 1, yinYang: 'yin' }
  }
}

/**
 * 获取旬首
 */
export function getXunShou(ganZhi: string): string {
  const idx = JIAZI_60.indexOf(ganZhi)
  if (idx < 0) return '甲子'
  const xunIdx = Math.floor(idx / 10)
  return XUN_SHOU[xunIdx] || '甲子'
}

/**
 * 查找时干支在六十甲子中的位置
 */
export function getJiaZiIndex(ganZhi: string): number {
  return JIAZI_60.indexOf(ganZhi)
}
