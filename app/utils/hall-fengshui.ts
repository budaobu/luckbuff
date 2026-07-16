/**
 * 厅堂风水布局计算引擎（客厅 / 待客厅堂）
 *
 * 参考资料：
 * - 姜群《八宅风水实用教学篇》（网易）
 * - time.actor《东西四命精密计算》
 * - 《八宅明镜》大游年歌诀
 * - 客厅财位：传统形势派"明财位"，位于进门对角线区域（进门后斜对角处）；
 *   同时结合八宅理气派"生气"、"延年"方作为动财位/聚气位。
 *   参考《阳宅三要》《住宅风水设计》等通行客厅布局原则。
 * - 沙发摆放：宜背靠实墙、面向吉方，忌背对大门或正对通道直冲；
 *   参考八宅吉凶方位与现代客厅动线设计。
 *
 * 命卦计算以立春为年度分界；1900–1999 与 2000 年后使用不同公式；
 * 余数 5 男归坤、女归艮。
 */

import {
  calcBazhaiPalaces,
  calcMingGuaNumber,
  findMountain24,
  findNearestMountain24Center,
  getGuaByNumber,
  isDongSi,
  normalizeDegree,
  type BazhaiResult,
  type Direction,
  type Gender,
  type Gua,
  type Mountain24,
  type Star,
} from './bazhai'
import { getYearPillar } from './bazi/calendar'
import { TIAN_GAN } from './bazi/constants'

export type EntrywayFlow = 'straight' | 'curved' | 'open'

export interface SofaSuggestion {
  bestDirections: Direction[]
  avoidDirections: Direction[]
  note: string
}

export interface HallWealthPosition {
  direction: Direction
  star: Star
  note: string
  diagonalArea: string
}

export interface HallFengshuiInput {
  direction: number
  sofaDirection: number
  entrywayFlow: EntrywayFlow
  birthYear: number
  birthMonth: number
  birthDay: number
  gender: Gender
  locale?: string
}

export interface HallFengshuiResult extends BazhaiResult {
  birthMonth: number
  birthDay: number
  yearGan: string
  sofaDirection: number
  entrywayFlow: EntrywayFlow
  sofaStar: Star
  sofaStarLevel: string
  sofaAuspicious: boolean
  sofa: SofaSuggestion
  wealth: HallWealthPosition
}

function calcBazhaiInternal(params: {
  direction: number
  mountain: Mountain24 | null
  sittingMountain: Mountain24 | null
  birthYear: number
  gender: Gender
  locale: string
}): BazhaiResult {
  const { direction, mountain, sittingMountain, birthYear, gender, locale } = params
  const mingGuaNumber = calcMingGuaNumber(birthYear, gender)
  const mingGua = getGuaByNumber(mingGuaNumber)
  const dongSiMing: '东四命' | '西四命' = isDongSi(mingGua) ? '东四命' : '西四命'

  const zhaiGua = sittingMountain?.palace ?? mingGua
  const dongSiZhai: '东四宅' | '西四宅' = isDongSi(zhaiGua) ? '东四宅' : '西四宅'

  const palaces = calcBazhaiPalaces(mingGua)

  const auspicious = palaces
    .filter(p => p.auspicious)
    .map(p => ({ star: p.star, direction: p.direction, level: p.level }))

  const inauspicious = palaces
    .filter(p => !p.auspicious)
    .map(p => ({ star: p.star, direction: p.direction, level: p.level }))

  return {
    direction,
    mountain,
    sittingMountain,
    birthYear,
    gender,
    mingGua,
    mingGuaNumber,
    dongSiMing,
    dongSiZhai,
    palaces,
    auspicious,
    inauspicious,
    locale,
  }
}

// 根据大门朝向（向首）反推入户后的"对角线区域"描述
function getDiagonalArea(entryDirection: Direction): string {
  const map: Record<Direction, string> = {
    北: '西南角',
    东北: '西南角',
    东: '西北角',
    东南: '西北角',
    南: '东北角',
    西南: '东北角',
    西: '东南角',
    西北: '东南角',
  }
  return map[entryDirection] ?? '对角线区域'
}

export function calcHallFengshui(input: HallFengshuiInput): HallFengshuiResult {
  const {
    direction,
    sofaDirection,
    entrywayFlow,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    locale = 'zh-CN',
  } = input

  const normalizedDir = normalizeDegree(direction)
  const normalizedSofaDir = normalizeDegree(sofaDirection)
  const mountain: Mountain24 | null = findMountain24(normalizedDir)
    ?? findNearestMountain24Center(normalizedDir)
  const sittingDeg = normalizeDegree(normalizedDir + 180)
  const sittingMountain: Mountain24 | null = findMountain24(sittingDeg)
    ?? findNearestMountain24Center(sittingDeg)

  const yearPillar = getYearPillar(birthYear, birthMonth, birthDay)
  const yearGan = yearPillar.gan

  // 有效年份按立春调整
  const effectiveYear = (() => {
    let y = birthYear
    const ganIndex = (birthYear - 4) % 10
    const expectedGan = TIAN_GAN[ganIndex < 0 ? ganIndex + 10 : ganIndex]!
    if (yearPillar.gan !== expectedGan) {
      y = birthYear - 1
    }
    return y
  })()

  const bazhaiResult = calcBazhaiInternal({
    direction: normalizedDir,
    mountain,
    sittingMountain,
    birthYear: effectiveYear,
    gender,
    locale,
  })

  // 沙发/待客区所在方位的星曜
  const sofaMountain = findMountain24(normalizedSofaDir)
    ?? findNearestMountain24Center(normalizedSofaDir)
  const sofaPalace = bazhaiResult.palaces.find(p => p.name === sofaMountain?.palace)
  const sofaStar = sofaPalace?.star ?? '伏位'
  const sofaStarLevel = sofaPalace?.level ?? '小吉'
  const sofaAuspicious = sofaPalace?.auspicious ?? true

  // 沙发朝向建议：优先面向生气（聚财纳气）、延年（贵人和谐），其次天医、伏位；避开绝命、五鬼
  const shengqi = bazhaiResult.palaces.find(p => p.star === '生气')
  const yannian = bazhaiResult.palaces.find(p => p.star === '延年')
  const tianyi = bazhaiResult.palaces.find(p => p.star === '天医')
  const fuwei = bazhaiResult.palaces.find(p => p.star === '伏位')
  const wugui = bazhaiResult.palaces.find(p => p.star === '五鬼')
  const jueming = bazhaiResult.palaces.find(p => p.star === '绝命')

  const bestDirections: Direction[] = []
  if (shengqi) bestDirections.push(shengqi.direction)
  if (yannian) bestDirections.push(yannian.direction)
  if (tianyi && bestDirections.length < 3) bestDirections.push(tianyi.direction)
  if (fuwei && bestDirections.length < 3) bestDirections.push(fuwei.direction)

  const avoidDirections: Direction[] = []
  if (jueming) avoidDirections.push(jueming.direction)
  if (wugui && !avoidDirections.includes(wugui.direction)) avoidDirections.push(wugui.direction)

  const flowNote: Record<EntrywayFlow, string> = {
    straight: '玄关处气流较直，建议用矮柜、屏风或绿植稍作回旋，避免财气直出直进。',
    curved: '玄关动线有回旋，利于聚气，沙发宜背靠实墙形成稳定靠山。',
    open: '入户即见厅，气场开阔，沙发宜以"U"型或"L"型围合，增强向心力。',
  }

  const sofa: SofaSuggestion = {
    bestDirections,
    avoidDirections,
    note: `沙发/待客区宜背靠实墙、面向吉方，主待客和睦与家宅纳气；${flowNote[entrywayFlow]}实际布局以门窗动线与建筑结构为准。`,
  }

  // 财位：以生气方为理气财位，同时给出形势派"入门对角线"明财位区域
  const wealthStar = shengqi ?? yannian
  const entryDirection = bazhaiResult.palaces.find(p => p.name === mountain?.palace)?.direction
    ?? bazhaiResult.palaces.find(p => p.name === sittingMountain?.palace)?.direction
    ?? '北'
  const wealth: HallWealthPosition = {
    direction: wealthStar?.direction ?? (shengqi?.direction ?? '东'),
    star: wealthStar?.star ?? '生气',
    note: `客厅以${wealthStar?.star ?? '生气'}方为理气财位，宜保持整洁、光线充足、气流和缓；明财位则在入门后的${getDiagonalArea(entryDirection)}，可放置绿植、聚宝盆或台灯强化聚财意象。`,
    diagonalArea: getDiagonalArea(entryDirection),
  }

  return {
    ...bazhaiResult,
    birthMonth,
    birthDay,
    yearGan,
    sofaDirection: normalizedSofaDir,
    entrywayFlow,
    sofaStar,
    sofaStarLevel,
    sofaAuspicious,
    sofa,
    wealth,
  }
}
