/**
 * 玄空飞星排盘共享库
 *
 * 从 server/api/tools/xuankong-fengshui/calc.post.ts 抽取为可复用模块：
 * 二十四山映射、三元九运、洛书顺飞/逆飞、运盘/山星盘/向星盘构建、格局判定。
 * 玄空风水工具与风水摆件工具共用同一份起盘逻辑，避免两份实现漂移。
 */

import { normalizeDegree } from './bazhai'

export interface Mountain {
  name: string
  palace: string
  palaceNumber: number
  yin: boolean
}

export interface XuanKongPalace {
  name: string
  direction: string
  palaceNumber: number
  periodStar: number
  mountainStar: number
  facingStar: number
}

export interface XuanKongPeriod {
  number: number
  name: string
  startYear: number
  endYear: number
}

export interface XuanKongPattern {
  key: string
  name: string
  description: string
}

export interface XuanKongChart {
  direction: number
  year: number
  period: XuanKongPeriod
  sittingMountain: Mountain
  facingMountain: Mountain
  sittingLabel: string
  facingLabel: string
  pattern: XuanKongPattern | null
  palaces: XuanKongPalace[]
  warning: string | null
}

// 二十四山：名称、对应宫位、宫位洛书数、阴阳
// 每山 15°，中心点按 0°/360° 起每 15° 递增
const MOUNTAINS: Array<{
  name: string
  start: number
  end: number
  palace: string
  palaceNumber: number
  yin: boolean
}> = [
  // 坎卦（北）
  { name: '壬', start: 337.5, end: 352.5, palace: '坎', palaceNumber: 1, yin: false },
  { name: '子', start: 352.5, end: 7.5, palace: '坎', palaceNumber: 1, yin: false },
  { name: '癸', start: 7.5, end: 22.5, palace: '坎', palaceNumber: 1, yin: true },
  // 艮卦（东北）
  { name: '丑', start: 22.5, end: 37.5, palace: '艮', palaceNumber: 8, yin: true },
  { name: '艮', start: 37.5, end: 52.5, palace: '艮', palaceNumber: 8, yin: false },
  { name: '寅', start: 52.5, end: 67.5, palace: '艮', palaceNumber: 8, yin: false },
  // 震卦（东）
  { name: '甲', start: 67.5, end: 82.5, palace: '震', palaceNumber: 3, yin: false },
  { name: '卯', start: 82.5, end: 97.5, palace: '震', palaceNumber: 3, yin: true },
  { name: '乙', start: 97.5, end: 112.5, palace: '震', palaceNumber: 3, yin: true },
  // 巽卦（东南）
  { name: '辰', start: 112.5, end: 127.5, palace: '巽', palaceNumber: 4, yin: false },
  { name: '巽', start: 127.5, end: 142.5, palace: '巽', palaceNumber: 4, yin: true },
  { name: '巳', start: 142.5, end: 157.5, palace: '巽', palaceNumber: 4, yin: true },
  // 离卦（南）
  { name: '丙', start: 157.5, end: 172.5, palace: '离', palaceNumber: 9, yin: false },
  { name: '午', start: 172.5, end: 187.5, palace: '离', palaceNumber: 9, yin: false },
  { name: '丁', start: 187.5, end: 202.5, palace: '离', palaceNumber: 9, yin: true },
  // 坤卦（西南）
  { name: '未', start: 202.5, end: 217.5, palace: '坤', palaceNumber: 2, yin: true },
  { name: '坤', start: 217.5, end: 232.5, palace: '坤', palaceNumber: 2, yin: true },
  { name: '申', start: 232.5, end: 247.5, palace: '坤', palaceNumber: 2, yin: false },
  // 兑卦（西）
  { name: '庚', start: 247.5, end: 262.5, palace: '兑', palaceNumber: 7, yin: false },
  { name: '酉', start: 262.5, end: 277.5, palace: '兑', palaceNumber: 7, yin: true },
  { name: '辛', start: 277.5, end: 292.5, palace: '兑', palaceNumber: 7, yin: true },
  // 乾卦（西北）
  { name: '戌', start: 292.5, end: 307.5, palace: '乾', palaceNumber: 6, yin: false },
  { name: '乾', start: 307.5, end: 322.5, palace: '乾', palaceNumber: 6, yin: false },
  { name: '亥', start: 322.5, end: 337.5, palace: '乾', palaceNumber: 6, yin: true },
]

// 洛书九宫顺飞顺序：中 5 → 乾 6 → 兑 7 → 艮 8 → 离 9 → 坎 1 → 坤 2 → 震 3 → 巽 4
const LUOSHU_ORDER = [5, 6, 7, 8, 9, 1, 2, 3, 4]
// 逆飞顺序：中 5 → 巽 4 → 震 3 → 坤 2 → 坎 1 → 离 9 → 艮 8 → 兑 7 → 乾 6
const LUOSHU_REVERSE_ORDER = [5, 4, 3, 2, 1, 9, 8, 7, 6]

// 宫位元信息（上南下北布局）
const PALACE_META: Array<{ palaceNumber: number; name: string; direction: string }> = [
  { palaceNumber: 4, name: '巽', direction: '东南' },
  { palaceNumber: 9, name: '离', direction: '南' },
  { palaceNumber: 2, name: '坤', direction: '西南' },
  { palaceNumber: 3, name: '震', direction: '东' },
  { palaceNumber: 5, name: '中', direction: '中宫' },
  { palaceNumber: 7, name: '兑', direction: '西' },
  { palaceNumber: 8, name: '艮', direction: '东北' },
  { palaceNumber: 1, name: '坎', direction: '北' },
  { palaceNumber: 6, name: '乾', direction: '西北' },
]

export function findMountain(deg: number): Mountain | null {
  for (const m of MOUNTAINS) {
    if (m.start < m.end) {
      if (deg >= m.start && deg < m.end) {
        return { name: m.name, palace: m.palace, palaceNumber: m.palaceNumber, yin: m.yin }
      }
    } else {
      // 跨越 0°/360°，如子山 352.5°–7.5°
      if (deg >= m.start || deg < m.end) {
        return { name: m.name, palace: m.palace, palaceNumber: m.palaceNumber, yin: m.yin }
      }
    }
  }
  return null
}

function findBoundaryWarning(deg: number): string | null {
  // 所有山交界点
  const boundaries = Array.from(new Set(MOUNTAINS.flatMap(m => [m.start, m.end]))).sort((a, b) => a - b)
  for (const b of boundaries) {
    const diff = Math.abs(normalizeDegree(deg - b))
    const minDiff = Math.min(diff, 360 - diff)
    if (minDiff <= 2) {
      return `度数 ${deg}° 接近 ${b}° 山界，可能存在兼向，替星逻辑待实现（TODO）`
    }
  }
  return null
}

function getPeriod(year: number): { number: number; startYear: number; endYear: number } {
  // 下元七运 1984–2003、下元八运 2004–2023、下元九运 2024–2043
  if (year >= 1984 && year <= 2003) return { number: 7, startYear: 1984, endYear: 2003 }
  if (year >= 2004 && year <= 2023) return { number: 8, startYear: 2004, endYear: 2023 }
  if (year >= 2024 && year <= 2043) return { number: 9, startYear: 2024, endYear: 2043 }
  // 超出范围时按最近元运处理
  if (year < 1984) return { number: 7, startYear: 1984, endYear: 2003 }
  return { number: 9, startYear: 2024, endYear: 2043 }
}

function nextStar(n: number): number {
  return n >= 9 ? 1 : n + 1
}

function prevStar(n: number): number {
  return n <= 1 ? 9 : n - 1
}

// 顺飞：按 LUOSHU_ORDER 依次递增
export function flyForward(center: number): Record<number, number> {
  const chart: Record<number, number> = {}
  let star = center
  for (const palace of LUOSHU_ORDER) {
    chart[palace] = star
    star = nextStar(star)
  }
  return chart
}

// 逆飞：按 LUOSHU_REVERSE_ORDER 依次递减
export function flyBackward(center: number): Record<number, number> {
  const chart: Record<number, number> = {}
  let star = center
  for (const palace of LUOSHU_REVERSE_ORDER) {
    chart[palace] = star
    star = prevStar(star)
  }
  return chart
}

function buildPeriodChart(periodNumber: number): Record<number, number> {
  return flyForward(periodNumber)
}

function buildMountainStarChart(periodChart: Record<number, number>, sitting: Mountain): Record<number, number> {
  const centerStar = periodChart[sitting.palaceNumber]!
  // 坐山：阳顺阴逆
  return sitting.yin ? flyBackward(centerStar) : flyForward(centerStar)
}

function buildFacingStarChart(periodChart: Record<number, number>, facing: Mountain): Record<number, number> {
  const centerStar = periodChart[facing.palaceNumber]!
  // 向首：阴顺阳逆（与坐山相反）
  return facing.yin ? flyForward(centerStar) : flyBackward(centerStar)
}

function determinePattern(
  periodNumber: number,
  sitting: Mountain,
  facing: Mountain,
  mountainChart: Record<number, number>,
  facingChart: Record<number, number>,
): XuanKongPattern | null {
  const msSit = mountainChart[sitting.palaceNumber]
  const msFace = mountainChart[facing.palaceNumber]
  const fsSit = facingChart[sitting.palaceNumber]
  const fsFace = facingChart[facing.palaceNumber]

  if (msSit === periodNumber && fsFace === periodNumber) {
    return {
      key: 'wangshanwangxiang',
      name: '旺山旺向',
      description: '当旺之星到山到向，主丁财两旺，宅运兴隆。',
    }
  }
  if (msFace === periodNumber && fsSit === periodNumber) {
    return {
      key: 'shangshanxiashui',
      name: '上山下水',
      description: '当旺之星颠倒入囚，丁财难聚，需以形势理气化解。',
    }
  }
  if (msFace === periodNumber && fsFace === periodNumber) {
    return {
      key: 'shuangxingdaoxiang',
      name: '双星到向',
      description: '山星与向星同到向首，旺财为主，宜配合后方有靠。',
    }
  }
  if (msSit === periodNumber && fsSit === periodNumber) {
    return {
      key: 'shuangxingdaozuo',
      name: '双星到坐',
      description: '山星与向星同到坐山，旺丁为主，宜前方开阔。',
    }
  }
  return null
}

/**
 * 起玄空宅飞星盘。朝向角度（向首）+ 建成/装修年份 → 定元运 → 运盘/山星盘/向星盘。
 * direction 取值 [0, 360)，与罗盘一致：0°=正北，90°=正东。
 */
export function buildXuanKongChart(direction: number, year: number): XuanKongChart {
  const normalizedDir = normalizeDegree(direction)
  const facing = findMountain(normalizedDir)
  if (!facing) {
    throw new Error('Unable to map direction to 24 mountains')
  }

  const sittingDeg = normalizeDegree(normalizedDir + 180)
  const sitting = findMountain(sittingDeg)
  if (!sitting) {
    throw new Error('Unable to map sitting direction to 24 mountains')
  }

  const period = getPeriod(year)
  const periodChart = buildPeriodChart(period.number)
  const mountainChart = buildMountainStarChart(periodChart, sitting)
  const facingChart = buildFacingStarChart(periodChart, facing)

  const palaces: XuanKongPalace[] = PALACE_META.map(meta => ({
    name: meta.name,
    direction: meta.direction,
    palaceNumber: meta.palaceNumber,
    periodStar: periodChart[meta.palaceNumber]!,
    mountainStar: mountainChart[meta.palaceNumber]!,
    facingStar: facingChart[meta.palaceNumber]!,
  }))

  return {
    direction: normalizedDir,
    year,
    period: {
      number: period.number,
      name: `下元${period.number}运`,
      startYear: period.startYear,
      endYear: period.endYear,
    },
    sittingMountain: sitting,
    facingMountain: facing,
    sittingLabel: `坐${sitting.name}`,
    facingLabel: `向${facing.name}`,
    pattern: determinePattern(period.number, sitting, facing, mountainChart, facingChart),
    palaces,
    warning: findBoundaryWarning(normalizedDir),
  }
}
