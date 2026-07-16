/**
 * 办公室风水布局计算引擎
 *
 * 参考资料：
 * - 姜群《八宅风水实用教学篇》（网易）
 * - time.actor《东西四命精密计算》
 * - 《八宅明镜》大游年歌诀
 * - 文昌位：年上/日干文昌贵人歌诀
 *   "甲乙巳午报君知，丙戊申宫丁己鸡；庚猪辛鼠壬逢虎，癸人见卯入云梯"
 *
 * 命卦计算以立春为年度分界；1900–1999 与 2000 年后使用不同公式；
 * 余数 5 男归坤、女归艮。
 */

import {
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

export type RoomType = 'office' | 'study' | 'bedroom' | 'hall'

export interface WenchangResult {
  type: '本命文昌' | '固定文昌'
  gan?: string
  direction: Direction
  directionName: string
  note: string
}

export interface SeatSuggestion {
  bestDirections: Direction[]
  avoidDirections: Direction[]
  note: string
}

export interface WealthPosition {
  direction: Direction
  star: Star
  note: string
}

export interface OfficeFengshuiInput {
  roomType: RoomType
  direction: number
  birthYear: number
  birthMonth: number
  birthDay: number
  gender: Gender
  locale?: string
}

export interface OfficeFengshuiResult extends BazhaiResult {
  roomType: RoomType
  birthMonth: number
  birthDay: number
  yearGan: string
  wenchang: WenchangResult[]
  seat: SeatSuggestion
  wealth: WealthPosition
}

// 地支到方位（用于文昌位转换）
const ZHI_DIRECTION: Record<string, Direction> = {
  子: '北',
  丑: '东北',
  寅: '东北',
  卯: '东',
  辰: '东南',
  巳: '东南',
  午: '南',
  未: '西南',
  申: '西南',
  酉: '西',
  戌: '西北',
  亥: '西北',
}

// 年干/日干 → 文昌地支
const WENCHANG_ZHI: Record<string, string> = {
  甲: '巳',
  乙: '午',
  丙: '申',
  戊: '申',
  丁: '酉',
  己: '酉',
  庚: '亥',
  辛: '子',
  壬: '寅',
  癸: '卯',
}

// 固定文昌位：按八宅坐向（坐山）
const SITTING_WENCHANG: Record<Gua, Direction> = {
  坎: '东北',
  离: '东南',
  震: '西北',
  巽: '西南',
  乾: '东',
  坤: '西',
  艮: '北',
  兑: '西南',
}

// 保持 Direction 类型一致：把"正东"等映射回标准方位
function normalizeDirection(dir: string): Direction {
  const map: Record<string, Direction> = {
    北: '北',
    东北: '东北',
    东: '东',
    东南: '东南',
    南: '南',
    西南: '西南',
    西: '西',
    西北: '西北',
    正北: '北',
    正东北: '东北',
    正东: '东',
    正东南: '东南',
    正南: '南',
    正西南: '西南',
    正西: '西',
    正西北: '西北',
  }
  return map[dir] ?? '北'
}

function getWenchangByGan(gan: string): Direction | null {
  const zhi = WENCHANG_ZHI[gan]
  if (!zhi) return null
  return ZHI_DIRECTION[zhi] ?? null
}

export function calcOfficeFengshui(input: OfficeFengshuiInput): OfficeFengshuiResult {
  const {
    roomType,
    direction,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    locale = 'zh-CN',
  } = input

  const normalizedDir = normalizeDegree(direction)
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
    // getYearPillar 已按立春调整，若返回的是上一年干支，说明生日在立春前
    const ganIndex = (birthYear - 4) % 10
    const expectedGan = TIAN_GAN[ganIndex < 0 ? ganIndex + 10 : ganIndex]!
    if (yearPillar.gan !== expectedGan) {
      y = birthYear - 1
    }
    return y
  })()

  // 复用八宅引擎计算命卦、宅卦、八方吉凶
  const bazhaiResult = calcBazhaiInternal({
    direction: normalizedDir,
    mountain,
    sittingMountain,
    birthYear: effectiveYear,
    gender,
    locale,
  })

  // 文昌位
  const wenchang: WenchangResult[] = []
  const benmingDir = getWenchangByGan(yearGan)
  if (benmingDir) {
    wenchang.push({
      type: '本命文昌',
      gan: yearGan,
      direction: benmingDir,
      directionName: `${benmingDir}方`,
      note: `以年干「${yearGan}」查文昌贵人，主个人思绪、考运与创意。`,
    })
  }
  const sittingGua = sittingMountain?.palace ?? bazhaiResult.mingGua
  const fixedDir = SITTING_WENCHANG[sittingGua]
  if (fixedDir) {
    wenchang.push({
      type: '固定文昌',
      direction: normalizeDirection(fixedDir),
      directionName: `${normalizeDirection(fixedDir)}方`,
      note: `以${sittingGua}宅坐山定固定文昌，主空间整体书香、企划与贵人气息。`,
    })
  }

  // 座位朝向：优先面向生气/延年，背向五鬼/绝命
  const shengqi = bazhaiResult.palaces.find(p => p.star === '生气')
  const yannian = bazhaiResult.palaces.find(p => p.star === '延年')
  const tianyi = bazhaiResult.palaces.find(p => p.star === '天医')
  const fuwei = bazhaiResult.palaces.find(p => p.star === '伏位')
  const wugui = bazhaiResult.palaces.find(p => p.star === '五鬼')
  const jueming = bazhaiResult.palaces.find(p => p.star === '绝命')

  const bestDirections: Direction[] = []
  if (shengqi) bestDirections.push(shengqi.direction)
  if (yannian) bestDirections.push(yannian.direction)
  if (tianyi && bestDirections.length < 2) bestDirections.push(tianyi.direction)
  if (fuwei && bestDirections.length < 2) bestDirections.push(fuwei.direction)

  const avoidDirections: Direction[] = []
  if (wugui) avoidDirections.push(wugui.direction)
  if (jueming && !avoidDirections.includes(jueming.direction)) avoidDirections.push(jueming.direction)

  const seat: SeatSuggestion = {
    bestDirections,
    avoidDirections,
    note: '座位宜面向吉方吸纳气场，忌背对或正对大凶方；实际布局以门窗动线与建筑结构为准。',
  }

  // 财位：办公室以「生气」为 primary 财位，延年为辅
  const wealthStar = shengqi ?? yannian
  const wealth: WealthPosition = {
    direction: wealthStar?.direction ?? (shengqi?.direction ?? '东'),
    star: wealthStar?.star ?? '生气',
    note: '办公空间以生气方为动财位，宜保持整洁、光线充足，可放置绿植或流水摆件；若生气方不适合作财位，再以延年方替补。',
  }

  return {
    ...bazhaiResult,
    roomType,
    birthMonth,
    birthDay,
    yearGan,
    wenchang,
    seat,
    wealth,
  }
}

interface InternalBazhaiParams {
  direction: number
  mountain: Mountain24 | null
  sittingMountain: Mountain24 | null
  birthYear: number
  gender: Gender
  locale: string
}

function calcBazhaiInternal(params: InternalBazhaiParams): BazhaiResult {
  const { direction, mountain, sittingMountain, birthYear, gender, locale } = params
  const mingGuaNumber = calcMingGuaNumber(birthYear, gender)
  const mingGua = getGuaByNumber(mingGuaNumber)
  const dongSiMing: '东四命' | '西四命' = isDongSi(mingGua) ? '东四命' : '西四命'

  const zhaiGua = sittingMountain?.palace ?? mingGua
  const dongSiZhai: '东四宅' | '西四宅' = isDongSi(zhaiGua) ? '东四宅' : '西四宅'

  // 复用 bazhai.ts 内部逻辑：这里直接导入 DAYOU_NIAN / PALACE_META / STAR_LEVEL
  const { DAYOU_NIAN, PALACE_META, STAR_LEVEL } = getBazhaiInternals()

  const CLOCKWISE_DIRECTIONS: Direction[] = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

  function directionToIndex(dir: Direction): number {
    return CLOCKWISE_DIRECTIONS.indexOf(dir)
  }

  function indexToDirection(idx: number): Direction {
    return CLOCKWISE_DIRECTIONS[(idx + 8) % 8]!
  }

  function getVowelStar(gua: Gua, dir: Direction): Star {
    const guaMeta = PALACE_META.find(p => p.name === gua)!
    const baseIdx = directionToIndex(guaMeta.direction)
    const targetIdx = directionToIndex(dir)
    const offset = (targetIdx - baseIdx + 8) % 8
    return DAYOU_NIAN[gua][offset]!
  }

  const palaces = PALACE_META.map((meta) => {
    const star = getVowelStar(mingGua, meta.direction)
    const auspicious = ['生气', '延年', '天医', '伏位'].includes(star)
    return {
      name: meta.name,
      direction: meta.direction,
      palaceNumber: meta.palaceNumber,
      star,
      auspicious,
      level: STAR_LEVEL[star],
    }
  })

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

function getBazhaiInternals() {
  const PALACE_META: { name: Gua; direction: Direction; palaceNumber: number }[] = [
    { name: '坎', direction: '北', palaceNumber: 1 },
    { name: '坤', direction: '西南', palaceNumber: 2 },
    { name: '震', direction: '东', palaceNumber: 3 },
    { name: '巽', direction: '东南', palaceNumber: 4 },
    { name: '乾', direction: '西北', palaceNumber: 6 },
    { name: '兑', direction: '西', palaceNumber: 7 },
    { name: '艮', direction: '东北', palaceNumber: 8 },
    { name: '离', direction: '南', palaceNumber: 9 },
  ]

  const DAYOU_NIAN: Record<Gua, Star[]> = {
    乾: ['伏位', '祸害', '天医', '延年', '绝命', '六煞', '五鬼', '生气'],
    坎: ['伏位', '五鬼', '天医', '生气', '延年', '绝命', '祸害', '六煞'],
    艮: ['伏位', '六煞', '绝命', '祸害', '生气', '延年', '天医', '五鬼'],
    震: ['伏位', '延年', '生气', '祸害', '绝命', '五鬼', '六煞', '天医'],
    巽: ['伏位', '天医', '五鬼', '六煞', '祸害', '生气', '绝命', '延年'],
    离: ['伏位', '六煞', '五鬼', '绝命', '延年', '祸害', '生气', '天医'],
    坤: ['伏位', '天医', '延年', '绝命', '生气', '祸害', '五鬼', '六煞'],
    兑: ['伏位', '生气', '祸害', '延年', '绝命', '六煞', '天医', '五鬼'],
  }

  const STAR_LEVEL: Record<Star, '大吉' | '吉' | '小吉' | '大凶' | '凶'> = {
    生气: '大吉',
    延年: '吉',
    天医: '吉',
    伏位: '小吉',
    绝命: '大凶',
    五鬼: '大凶',
    祸害: '凶',
    六煞: '凶',
  }

  return { DAYOU_NIAN, PALACE_META, STAR_LEVEL }
}
