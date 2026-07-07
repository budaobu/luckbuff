import { toLunar } from 'lunar'
import type {
  JinkoujueChart,
  JinkoujueDirection,
  JinkoujuePillar,
  JinkoujueRequest,
  JinkoujueResult,
} from '~/types/jinkoujue'

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 月将名，按子…亥顺序
const YUE_JIANG_NAMES = [
  '神后', // 子
  '大吉', // 丑
  '功曹', // 寅
  '太冲', // 卯
  '天罡', // 辰
  '太乙', // 巳
  '胜光', // 午
  '小吉', // 未
  '传送', // 申
  '从魁', // 酉
  '河魁', // 戌
  '登明', // 亥
]

// 贵神顺排序列
const GUI_SHEN_CLOCKWISE = [
  '贵人',
  '腾蛇',
  '朱雀',
  '六合',
  '勾陈',
  '青龙',
  '天空',
  '白虎',
  '太常',
  '玄武',
  '太阴',
  '天后',
]

// 贵神逆排序列
const GUI_SHEN_COUNTER = [
  '贵人',
  '天后',
  '太阴',
  '玄武',
  '太常',
  '白虎',
  '天空',
  '青龙',
  '勾陈',
  '六合',
  '朱雀',
  '腾蛇',
]

const DIRECTION_TO_ZHI: Record<JinkoujueDirection, number> = {
  north: 0, // 子
  northeast: 2, // 寅（东北偏东，取寅）
  east: 3, // 卯
  southeast: 5, // 巳
  south: 6, // 午
  southwest: 7, // 未
  west: 9, // 酉
  northwest: 10, // 戌
  unknown: 0,
}

const DIRECTION_LABELS: Record<JinkoujueDirection, string> = {
  north: '北（子）',
  northeast: '东北（寅）',
  east: '东（卯）',
  southeast: '东南（巳）',
  south: '南（午）',
  southwest: '西南（未）',
  west: '西（酉）',
  northwest: '西北（戌）',
  unknown: '未指定',
}

function normalizeIndex(n: number, mod: number): number {
  return ((n % mod) + mod) % mod
}

function getGan(index: number): string {
  return TIAN_GAN[normalizeIndex(index, 10)]!
}

function getZhi(index: number): string {
  return DI_ZHI[normalizeIndex(index, 12)]!
}

function ganIndex(gan: string): number {
  return TIAN_GAN.indexOf(gan)
}

function zhiIndex(zhi: string): number {
  return DI_ZHI.indexOf(zhi)
}

/**
 * 五虎遁：由年干推正月（寅月）月干
 * 甲己之年丙作首，乙庚之岁戊为头，丙辛之岁寻庚起，丁壬壬位顺行流，戊癸之年何方发，甲寅之上好追求。
 */
function getFirstMonthStem(yearStem: string): string {
  const map: Record<string, string> = {
    甲: '丙',
    己: '丙',
    乙: '戊',
    庚: '戊',
    丙: '庚',
    辛: '庚',
    丁: '壬',
    壬: '壬',
    戊: '甲',
    癸: '甲',
  }
  return map[yearStem] ?? '丙'
}

/**
 * 五鼠遁：由日干推子时干
 * 甲己日起甲子，乙庚日起丙子，丙辛日起戊子，丁壬日起庚子，戊癸日起壬子。
 */
function getZiShiStem(dayStem: string): string {
  const map: Record<string, string> = {
    甲: '甲',
    己: '甲',
    乙: '丙',
    庚: '丙',
    丙: '戊',
    辛: '戊',
    丁: '庚',
    壬: '庚',
    戊: '壬',
    癸: '壬',
  }
  return map[dayStem] ?? '甲'
}

/**
 * 由时支索引求时干：子时干 + 时支偏移
 */
function getHourStem(dayStem: string, hourBranchIndex: number): string {
  const ziStem = getZiShiStem(dayStem)
  const stemIdx = ganIndex(ziStem)
  return getGan(stemIdx + hourBranchIndex)
}

/**
 * 公历 Julian Day Number（正午）
 */
function julianDayNumber(y: number, m: number, d: number): number {
  if (m <= 2) {
    y--
    m += 12
  }
  const A = Math.floor(y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5
}

function getDayPillar(date: Date): JinkoujuePillar {
  // 23:00 之后日柱按次日算
  const effectiveDate = date.getHours() >= 23 ? new Date(date.getTime() + 3600 * 1000) : date
  const jdn = julianDayNumber(
    effectiveDate.getFullYear(),
    effectiveDate.getMonth() + 1,
    effectiveDate.getDate(),
  )
  // 2000-01-01 为戊午日 = 54
  const index = normalizeIndex(Math.floor(jdn + 49), 60)
  return { gan: getGan(index), zhi: getZhi(index) }
}

function getHourBranchIndex(date: Date): number {
  const h = date.getHours()
  // 23-1 子(0)，1-3 丑，…
  return Math.floor(((h + 1) % 24) / 2)
}

function getYearPillar(lunarYear: number): JinkoujuePillar {
  // 1984 甲子，天干地支序号 0
  const offset = lunarYear - 1984
  return { gan: getGan(offset), zhi: getZhi(offset) }
}

function getMonthPillar(yearStem: string, lunarMonth: number): JinkoujuePillar {
  // 正月建寅，寅 index = 2；农历月转月建： lunarMonth + 1
  const monthBranchIndex = normalizeIndex(lunarMonth + 1, 12)
  const firstMonthStemIndex = ganIndex(getFirstMonthStem(yearStem))
  const monthStemIndex = normalizeIndex(firstMonthStemIndex + monthBranchIndex - 2, 10)
  return { gan: getGan(monthStemIndex), zhi: getZhi(monthBranchIndex) }
}

function getYueJiang(lunarMonth: number): { name: string; zhi: string; index: number } {
  const monthBranchIndex = normalizeIndex(lunarMonth + 1, 12)
  // 月将 = (13 - 月建) % 12；正月寅 -> 亥，十二月丑 -> 子
  const index = normalizeIndex(13 - monthBranchIndex, 12)
  return { name: YUE_JIANG_NAMES[index]!, zhi: getZhi(index), index }
}

function getDiFen(payload: JinkoujueRequest): { branchIndex: number; context?: { label: string; value: string } } {
  if (payload.method === 'number') {
    const n = payload.number
    const idx = normalizeIndex(n - 1, 12)
    return {
      branchIndex: idx,
      context: { label: '数字地分', value: `${n} → ${getZhi(idx)}` },
    }
  }

  if (payload.method === 'direction') {
    const idx = DIRECTION_TO_ZHI[payload.direction]
    return {
      branchIndex: idx,
      context: { label: '方位地分', value: DIRECTION_LABELS[payload.direction] },
    }
  }

  // time: 取时支为地分
  const date = payload.datetime ? new Date(payload.datetime) : new Date()
  const idx = getHourBranchIndex(date)
  return {
    branchIndex: idx,
    context: { label: '时辰地分', value: `${getZhi(idx)}时` },
  }
}

/**
 * 将神：月将加时支，然后顺行十二支，看地分落在何支。
 */
function getJiangShen(
  yueJiangIndex: number,
  hourBranchIndex: number,
  diFenIndex: number,
): string {
  // 把 yueJiangIndex 放在 hourBranchIndex 位置，求 diFenIndex 位置的支
  const branchAtDiFen = normalizeIndex(yueJiangIndex + diFenIndex - hourBranchIndex, 12)
  return getZhi(branchAtDiFen)
}

/**
 * 贵人起法：甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，六辛逢马虎。
 * 昼贵取第一个，夜贵取第二个。
 * 简化昼夜：卯时(4)到申时(8)为昼，其余为夜。
 */
function getNobleBranch(dayStem: string, hourBranchIndex: number): string {
  const isDaytime = hourBranchIndex >= 4 && hourBranchIndex <= 8
  const map: Record<string, [string, string]> = {
    甲: ['丑', '未'],
    戊: ['丑', '未'],
    庚: ['丑', '未'],
    乙: ['子', '申'],
    己: ['子', '申'],
    丙: ['亥', '酉'],
    丁: ['亥', '酉'],
    壬: ['巳', '卯'],
    癸: ['巳', '卯'],
    辛: ['午', '寅'],
  }
  const pair = map[dayStem] ?? ['丑', '未']
  return isDaytime ? pair[0] : pair[1]
}

/**
 * 贵神：从贵人起，根据地分顺逆数到地分。
 * 地分在巳午未申酉戌（右半）顺行；在亥子丑寅卯辰（左半）逆行。
 */
function getGuiShen(
  dayStem: string,
  hourBranchIndex: number,
  diFenIndex: number,
): { name: string; nobleBranch: string; isDaytime: boolean; direction: 'clockwise' | 'counterclockwise' } {
  const nobleBranch = getNobleBranch(dayStem, hourBranchIndex)
  const isDaytime = hourBranchIndex >= 4 && hourBranchIndex <= 8
  const clockwise = diFenIndex >= 6 && diFenIndex <= 11
  const nobleIndex = zhiIndex(nobleBranch)
  let steps: number
  if (clockwise) {
    steps = normalizeIndex(diFenIndex - nobleIndex, 12)
  } else {
    steps = normalizeIndex(nobleIndex - diFenIndex, 12)
  }
  const sequence = clockwise ? GUI_SHEN_CLOCKWISE : GUI_SHEN_COUNTER
  return {
    name: sequence[steps]!,
    nobleBranch,
    isDaytime,
    direction: clockwise ? 'clockwise' : 'counterclockwise',
  }
}

/**
 * 人元：日干五鼠遁到地分支。
 */
function getRenYuan(dayStem: string, diFenIndex: number): string {
  const ziStemIndex = ganIndex(getZiShiStem(dayStem))
  return getGan(ziStemIndex + diFenIndex)
}

export function calculateJinkoujue(payload: JinkoujueRequest): JinkoujueResult {
  const date = payload.method === 'time' && payload.datetime
    ? new Date(payload.datetime)
    : new Date()

  const { lunar } = toLunar(date)
  const lunarYear = lunar.year
  const lunarMonth = lunar.month
  const lunarDay = lunar.day

  const year = getYearPillar(lunarYear)
  const month = getMonthPillar(year.gan, lunarMonth)
  const day = getDayPillar(date)
  const hourBranchIndex = getHourBranchIndex(date)
  const hour = {
    gan: getHourStem(day.gan, hourBranchIndex),
    zhi: getZhi(hourBranchIndex),
  }

  const yueJiang = getYueJiang(lunarMonth)
  const diFen = getDiFen(payload)
  const jiangShen = getJiangShen(yueJiang.index, hourBranchIndex, diFen.branchIndex)
  const guiShen = getGuiShen(day.gan, hourBranchIndex, diFen.branchIndex)
  const renYuan = getRenYuan(day.gan, diFen.branchIndex)

  const chart: JinkoujueChart = {
    renYuan,
    guiShen: guiShen.name,
    jiangShen,
    diFen: getZhi(diFen.branchIndex),
  }

  return {
    method: payload.method,
    pillars: { year, month, day, hour },
    yueJiang: { name: yueJiang.name, zhi: yueJiang.zhi },
    chart,
    input: {
      question: payload.question,
      gender: payload.gender,
      birthYear: payload.birthYear,
    },
    diFenContext: diFen.context,
    guiShenContext: {
      nobleBranch: guiShen.nobleBranch,
      isDaytime: guiShen.isDaytime,
      direction: guiShen.direction,
    },
  }
}
