/**
 * 风水摆件工具 · 计算引擎
 *
 * 设计文档：2026-07-17-fengshui-bajian-design.md
 *
 * 分两层输出：
 * - 环境层（不依赖使用者）：房间九宫切分（45 度角辐射法）、玄空宅飞星、
 *   紫白流年叠加（太岁/五黄/三煞/暗建煞打标）、五行缺口判定。
 * - 逐人层（每个使用者一条记录）：命卦 → 八宅游星分布；
 *   日主/年支 → 文昌位、桃花位（三合局）、天乙贵人位，标注是否命中房间。
 *
 * 起盘以房间自身为独立单位，不建模整栋房屋。
 */

import { toLunar } from 'lunar'
import {
  buildXuanKongChart,
  flyForward,
  type XuanKongChart,
} from '~/utils/xuankong-flystar'
import {
  calcBazhaiPalaces,
  calcMingGuaNumber,
  getGuaByNumber,
  normalizeDegree,
  type Direction,
  type Gender,
  type Gua,
  type Star,
} from '~/utils/bazhai'
import { getDayPillar, getYearPillar } from '~/utils/bazi/calendar'
import type { ElementGap } from '~/utils/ornament-rules'

// ============================================================
// 类型
// ============================================================

export type RoomTypeKey = 'bedroom' | 'study' | 'office' | 'hall' | 'shop'

export type IrregularSpot = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

export interface OrnamentUser {
  nickname: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour?: number | null
  gender: Gender
}

export interface FengshuiOrnamentCalcInput {
  roomType: RoomTypeKey
  direction: number
  year: number
  lengthM: number
  widthM: number
  doorDirection: Direction
  irregular?: Array<{ spot: IrregularSpot; type: 'missing' | 'protruding' }>
  users: OrnamentUser[]
  locale?: string
}

export type YouXingKey =
  | 'shengqi'
  | 'tianyi'
  | 'yannian'
  | 'fuwei'
  | 'wugui'
  | 'liusha'
  | 'huohai'
  | 'jueming'

export interface EnvironmentPalace {
  direction: Direction | '中宫'
  mountainStar: number
  facingStar: number
  periodStar: number
  yearStar: number
  isTaiSui: boolean
  isWuHuang: boolean
  isSanSha: boolean
  isAnJianSha: boolean
  isDoor: boolean
  hasIrregularCorner: boolean
  elementGap: ElementGap
  gapReasons: string[]
}

export interface PerPersonResult {
  nickname: string
  gender: Gender
  mingGua: Gua
  mingGuaNumber: number
  dongSiMing: '东四命' | '西四命'
  dayGan: string
  yearZhi: string
  baguaAssignment: Partial<Record<Direction, YouXingKey>>
  roomFacingStar: { direction: Direction; star: Star; auspicious: boolean }
  matchedPositions: {
    wenchang: boolean
    taohua: boolean
    guiren: boolean
  }
  wenchangDirection: Direction | null
  taohuaDirection: Direction | null
  guirenDirections: Direction[]
}

export interface FengshuiOrnamentCalcResult {
  roomType: RoomTypeKey
  direction: number
  year: number
  roomGeometry: {
    lengthM: number
    widthM: number
    doorDirection: Direction
    sectorNote: string
    irregular?: Array<{ direction: Direction; type: 'missing' | 'protruding' }>
  }
  xuankong: {
    period: XuanKongChart['period']
    sittingLabel: string
    facingLabel: string
    pattern: XuanKongChart['pattern']
    warning: string | null
  }
  liunian: {
    ganzhiYear: string
    yearCenter: number
    taiSuiDirection: Direction
    suiPoDirection: Direction
    sanShaDirection: Direction
  }
  environment: {
    palaces: EnvironmentPalace[]
  }
  perPerson: PerPersonResult[]
  locale: string
}

// ============================================================
// 常量表
// ============================================================

export const EIGHT_DIRECTIONS: Direction[] = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

const DIRECTION_CENTER_DEG: { [K in Direction]: number } = {
  北: 0,
  东北: 45,
  东: 90,
  东南: 135,
  南: 180,
  西南: 225,
  西: 270,
  西北: 315,
}

// 地支 → 方位（用于太岁/岁破/文昌/桃花/贵人换算）
const ZHI_DIRECTION: Record<string, Direction> = {
  子: '北', 午: '南', 卯: '东', 酉: '西',
  丑: '东北', 寅: '东北',
  辰: '东南', 巳: '东南',
  未: '西南', 申: '西南',
  戌: '西北', 亥: '西北',
}

const DI_ZHI_LIST = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const TIAN_GAN_LIST = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 年干/日干 → 文昌地支（甲乙巳午报君知，丙戊申宫丁己鸡；庚猪辛鼠壬逢虎，癸人见卯入云梯）
const WENCHANG_ZHI: Record<string, string> = {
  甲: '巳', 乙: '午', 丙: '申', 戊: '申', 丁: '酉',
  己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯',
}

// 天乙贵人（甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢马虎）
const TIANYI_ZHI: Record<string, string[]> = {
  甲: ['丑', '未'], 戊: ['丑', '未'], 庚: ['丑', '未'],
  乙: ['子', '申'], 己: ['子', '申'],
  丙: ['亥', '酉'], 丁: ['亥', '酉'],
  壬: ['卯', '巳'], 癸: ['卯', '巳'],
  辛: ['午', '寅'],
}

// 桃花（三合局）：寅午戌见卯，申子辰见酉，巳酉丑见午，亥卯未见子
const TAOHUA_ZHI: Record<string, string> = {
  寅: '卯', 午: '卯', 戌: '卯',
  申: '酉', 子: '酉', 辰: '酉',
  巳: '午', 酉: '午', 丑: '午',
  亥: '子', 卯: '子', 未: '子',
}

// 九星五行
const STAR_ELEMENT: Record<number, 'water' | 'earth' | 'wood' | 'metal' | 'fire'> = {
  1: 'water', 2: 'earth', 3: 'wood', 4: 'wood', 5: 'earth',
  6: 'metal', 7: 'metal', 8: 'earth', 9: 'fire',
}

// 八星 → 游星 key
const STAR_TO_YOUXING: { [K in Star]: YouXingKey } = {
  生气: 'shengqi',
  天医: 'tianyi',
  延年: 'yannian',
  伏位: 'fuwei',
  五鬼: 'wugui',
  六煞: 'liusha',
  祸害: 'huohai',
  绝命: 'jueming',
}

// ============================================================
// 流年层（复用紫白飞星年星公式）
// ============================================================

function mod9(n: number): number {
  return ((n - 1) % 9 + 9) % 9 + 1
}

// 年紫白入中星：三元甲子通用公式，与 zibaifeixing/calc.post.ts 一致
// 验证：1984 → 7；2024 → 3；2025 → 2；2026 → 1
function getYearCenterStar(year: number): number {
  return mod9(11 - (year % 9))
}

// 三煞方位：申子辰年煞在南，寅午戌年煞在北，巳酉丑年煞在东，亥卯未年煞在西
function getSanShaDirection(yearZhi: string): Direction {
  if (['申', '子', '辰'].includes(yearZhi)) return '南'
  if (['寅', '午', '戌'].includes(yearZhi)) return '北'
  if (['巳', '酉', '丑'].includes(yearZhi)) return '东'
  return '西'
}

// ============================================================
// 五行缺口判定（规则库）
// ============================================================

const ELEMENT_CN: Record<string, string> = {
  water: '水', earth: '土', wood: '木', metal: '金', fire: '火',
}

interface GapJudgeInput {
  mountainStar: number
  facingStar: number
  yearStar: number
  periodNumber: number
  isTaiSui: boolean
  isWuHuang: boolean
  isSanSha: boolean
  isAnJianSha: boolean
  hasMissing: boolean
  isCenter: boolean
}

function judgeElementGap(input: GapJudgeInput): { gap: ElementGap; reasons: string[] } {
  const reasons: string[] = []
  const stars = [input.mountainStar, input.facingStar]

  // 最高优先级：当年煞位或缺角方位 → 只化不催（设计文档 4.1）
  if (input.isTaiSui) reasons.push('流年太岁坐镇，宜静不宜动')
  if (input.isSanSha) reasons.push('流年三煞方，只宜化解')
  if (input.isWuHuang) reasons.push('流年五黄凶星飞临，不可催动')
  if (input.isAnJianSha) reasons.push('流年暗建煞（太岁飞宫）所到，忌动土催动')
  if (input.hasMissing) reasons.push('该方位有缺角，气场受损，先补缺再谈催旺')
  if (reasons.length > 0) return { gap: 'avoid_only', reasons }

  // 宅盘二黑/五黄病符坐镇 → 金泄土
  if (stars.includes(5)) reasons.push('宅盘五黄土星坐镇，宜以金泄其土气')
  if (stars.includes(2)) reasons.push('宅盘二黑病符土星坐镇，宜以金泄其土气')
  if (stars.includes(5) || stars.includes(2)) return { gap: 'metal_drain', reasons }

  // 当运旺星被克 → 以克星所生之五行通关泄克、间接扶旺
  const facingEl = STAR_ELEMENT[input.facingStar]!
  const mountainEl = STAR_ELEMENT[input.mountainStar]!
  // 五行相克：木克土、土克水、水克火、火克金、金克木
  const CONTROLS: Record<string, string> = {
    wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood',
  }
  // 五行相生（X 生 Y）：金生水、水生木、木生火、火生土、土生金
  const GENERATES: Record<string, string> = {
    metal: 'water', water: 'wood', wood: 'fire', fire: 'earth', earth: 'metal',
  }

  const prosperousFacing = input.facingStar === input.periodNumber
  const prosperousMountain = input.mountainStar === input.periodNumber

  if (prosperousFacing && CONTROLS[mountainEl] === facingEl) {
    reasons.push(`当运向星${input.facingStar}（${ELEMENT_CN[facingEl]}）受山星${input.mountainStar}（${ELEMENT_CN[mountainEl]}）所克，宜以${ELEMENT_CN[GENERATES[mountainEl]!]}通关泄克`)
    return { gap: `${GENERATES[mountainEl]}_boost` as ElementGap, reasons }
  }
  if (prosperousMountain && CONTROLS[facingEl] === mountainEl) {
    reasons.push(`当运山星${input.mountainStar}（${ELEMENT_CN[mountainEl]}）受向星${input.facingStar}（${ELEMENT_CN[facingEl]}）所克，宜以${ELEMENT_CN[GENERATES[facingEl]!]}通关泄克`)
    return { gap: `${GENERATES[facingEl]}_boost` as ElementGap, reasons }
  }

  // 旺星得位 → 顺势催旺其本气
  if (prosperousFacing) {
    reasons.push(`当运向星${input.facingStar}到方，财星得位，顺势催旺`)
    return { gap: `${STAR_ELEMENT[input.facingStar]}_boost` as ElementGap, reasons }
  }
  if (prosperousMountain) {
    reasons.push(`当运山星${input.mountainStar}到方，丁星得位，顺势催旺`)
    return { gap: `${STAR_ELEMENT[input.mountainStar]}_boost` as ElementGap, reasons }
  }

  // 流年煞星叠加 → 泄其凶性
  if (input.yearStar === 5 || input.yearStar === 2) {
    reasons.push(`流年${input.yearStar === 5 ? '五黄' : '二黑'}飞临此方，宜以金泄土`)
    return { gap: 'metal_drain', reasons }
  }
  if (input.yearStar === 7) {
    reasons.push('流年七赤破军飞临，宜以水泄金气')
    return { gap: 'water_boost', reasons }
  }
  if (input.yearStar === 3) {
    reasons.push('流年三碧是非星飞临，宜以火泄木气')
    return { gap: 'fire_boost', reasons }
  }

  if (input.isCenter) {
    reasons.push('中宫太极位，宜留白静守，不安放催旺类摆件')
    return { gap: 'neutral', reasons }
  }

  reasons.push('星曜组合平和，无明确缺口')
  return { gap: 'neutral', reasons }
}

// ============================================================
// 逐人层
// ============================================================

function isDongSiMing(gua: Gua): boolean {
  return ['坎', '震', '巽', '离'].includes(gua)
}

function calcPerPerson(user: OrnamentUser, facingDeg: number): PerPersonResult {
  const yearPillar = getYearPillar(user.birthYear, user.birthMonth, user.birthDay)
  const dayPillar = getDayPillar(user.birthYear, user.birthMonth, user.birthDay)

  // 有效年份按立春调整（与 office-fengshui 一致）
  let effectiveYear = user.birthYear
  const expectedGan = TIAN_GAN_LIST[((user.birthYear - 4) % 10 + 10) % 10]!
  if (yearPillar.gan !== expectedGan) effectiveYear = user.birthYear - 1

  const mingGuaNumber = calcMingGuaNumber(effectiveYear, user.gender)
  const mingGua = getGuaByNumber(mingGuaNumber)
  const palaces = calcBazhaiPalaces(mingGua)

  const baguaAssignment: Partial<Record<Direction, YouXingKey>> = {}
  for (const p of palaces) {
    baguaAssignment[p.direction] = STAR_TO_YOUXING[p.star]
  }

  // 房间朝向落在该使用者游星体系的哪个位
  let facingDir: Direction = '北'
  let facingMinDiff = Infinity
  for (const dir of EIGHT_DIRECTIONS) {
    const diff = Math.abs(normalizeDegree(facingDeg - DIRECTION_CENTER_DEG[dir]))
    const minDiff = Math.min(diff, 360 - diff)
    if (minDiff < facingMinDiff) {
      facingMinDiff = minDiff
      facingDir = dir
    }
  }
  const facingPalace = palaces.find(p => p.direction === facingDir)!

  // 文昌位（日主查表）
  const wenchangZhi = WENCHANG_ZHI[dayPillar.gan]
  const wenchangDirection = wenchangZhi ? (ZHI_DIRECTION[wenchangZhi] ?? null) : null

  // 桃花位（年支三合局查表）
  const taohuaZhi = TAOHUA_ZHI[yearPillar.zhi]
  const taohuaDirection = taohuaZhi ? (ZHI_DIRECTION[taohuaZhi] ?? null) : null

  // 天乙贵人位（日主查表，两个）
  const guirenZhiList = TIANYI_ZHI[dayPillar.gan] ?? []
  const guirenDirections = guirenZhiList
    .map(z => ZHI_DIRECTION[z])
    .filter((d): d is Direction => Boolean(d))

  const uniqueGuirenDirections = [...new Set(guirenDirections)]

  return {
    nickname: user.nickname,
    gender: user.gender,
    mingGua,
    mingGuaNumber,
    dongSiMing: isDongSiMing(mingGua) ? '东四命' : '西四命',
    dayGan: dayPillar.gan,
    yearZhi: yearPillar.zhi,
    baguaAssignment,
    roomFacingStar: {
      direction: facingDir,
      star: facingPalace.star,
      auspicious: facingPalace.auspicious,
    },
    matchedPositions: {
      wenchang: wenchangDirection !== null,
      taohua: taohuaDirection !== null,
      guiren: uniqueGuirenDirections.length > 0,
    },
    wenchangDirection,
    taohuaDirection,
    guirenDirections: uniqueGuirenDirections,
  }
}

// ============================================================
// 主入口
// ============================================================

const SPOT_TO_DIRECTION: Record<IrregularSpot, Direction> = {
  n: '北', ne: '东北', e: '东', se: '东南', s: '南', sw: '西南', w: '西', nw: '西北',
}

export function calcFengshuiOrnament(input: FengshuiOrnamentCalcInput): FengshuiOrnamentCalcResult {
  const locale = input.locale || 'zh-CN'
  const direction = normalizeDegree(input.direction)
  const chart = buildXuanKongChart(direction, Math.floor(input.year))

  // ---- 流年层 ----
  const now = new Date()
  const { lunar } = toLunar(now)
  // lunar 包只提供农历日期，干支按 (year-4) 取模推算（4 年为甲子）
  const ganzhiIndex = ((lunar.year - 4) % 60 + 60) % 60
  const yearGanZhi = `${TIAN_GAN_LIST[ganzhiIndex % 10]}${DI_ZHI_LIST[ganzhiIndex % 12]}`
  const yearZhi = yearGanZhi.charAt(1)
  const yearCenter = getYearCenterStar(lunar.year)
  const yearChart = flyForward(yearCenter)

  const taiSuiDirection = ZHI_DIRECTION[yearZhi] ?? '北'
  const suiPoZhi = DI_ZHI_LIST[(DI_ZHI_LIST.indexOf(yearZhi) + 6) % 12]!
  const suiPoDirection = ZHI_DIRECTION[suiPoZhi] ?? '南'
  const sanShaDirection = getSanShaDirection(yearZhi)

  // ---- 缺角/凸出 ----
  const irregular: Array<{ direction: Direction; type: 'missing' | 'protruding' }> = (input.irregular ?? []).map(item => ({
    direction: SPOT_TO_DIRECTION[item.spot],
    type: item.type,
  }))

  // ---- 环境层：八方位扇区 + 中宫 ----
  const palaces: EnvironmentPalace[] = chart.palaces.map(p => {
    const isCenter = p.name === '中'
    const dirLabel = p.direction as Direction | '中宫'
    const yearStar = yearChart[p.palaceNumber]!
    const missingHere = !isCenter && irregular.some(r => r.direction === p.direction && r.type === 'missing')
    const protrudingHere = !isCenter && irregular.some(r => r.direction === p.direction && r.type === 'protruding')

    const flags = {
      isTaiSui: !isCenter && p.direction === taiSuiDirection,
      isWuHuang: !isCenter && yearStar === 5,
      isSanSha: !isCenter && p.direction === sanShaDirection,
      isAnJianSha: !isCenter && yearStar === 1,
      isDoor: !isCenter && p.direction === input.doorDirection,
      hasIrregularCorner: missingHere || protrudingHere,
    }

    const { gap, reasons } = judgeElementGap({
      mountainStar: p.mountainStar,
      facingStar: p.facingStar,
      yearStar,
      periodNumber: chart.period.number,
      isTaiSui: flags.isTaiSui,
      isWuHuang: flags.isWuHuang,
      isSanSha: flags.isSanSha,
      isAnJianSha: flags.isAnJianSha,
      hasMissing: missingHere,
      isCenter,
    })

    return {
      direction: dirLabel,
      mountainStar: p.mountainStar,
      facingStar: p.facingStar,
      periodStar: p.periodStar,
      yearStar,
      ...flags,
      elementGap: gap,
      gapReasons: reasons,
    }
  })

  // ---- 逐人层 ----
  const perPerson = input.users.map(user => calcPerPerson(user, direction))

  return {
    roomType: input.roomType,
    direction,
    year: Math.floor(input.year),
    roomGeometry: {
      lengthM: input.lengthM,
      widthM: input.widthM,
      doorDirection: input.doorDirection,
      sectorNote: '以房间几何中心为太极点，按45度角辐射法切分八方位扇区；中心留白。',
      irregular: irregular.length > 0 ? irregular : undefined,
    },
    xuankong: {
      period: chart.period,
      sittingLabel: chart.sittingLabel,
      facingLabel: chart.facingLabel,
      pattern: chart.pattern,
      warning: chart.warning,
    },
    liunian: {
      ganzhiYear: yearGanZhi,
      yearCenter,
      taiSuiDirection,
      suiPoDirection,
      sanShaDirection,
    },
    environment: { palaces },
    perPerson,
    locale,
  }
}
