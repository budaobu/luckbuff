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

export type RoomType = 'office' | 'study' | 'bedroom' | 'hall'
export type OfficeUsageType = 'independent' | 'openPlan' | 'shared' | 'homeOffice'

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
  deskDirection: number
  birthYear: number
  birthMonth: number
  birthDay: number
  gender: Gender
  officeUsage: OfficeUsageType
  locale?: string
}

export interface OfficeFengshuiResult extends BazhaiResult {
  roomType: RoomType
  birthMonth: number
  birthDay: number
  yearGan: string
  deskDirection: number
  officeUsage: OfficeUsageType
  wenchang: WenchangResult[]
  seat: SeatSuggestion
  desk: SeatSuggestion
  deskStar: Star
  deskStarLevel: string
  deskAuspicious: boolean
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
    deskDirection,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    officeUsage,
    locale = 'zh-CN',
  } = input

  const normalizedDir = normalizeDegree(direction)
  const normalizedDeskDir = normalizeDegree(deskDirection)
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
  if (tianyi && bestDirections.length < 3) bestDirections.push(tianyi.direction)
  if (fuwei && bestDirections.length < 3) bestDirections.push(fuwei.direction)

  const avoidDirections: Direction[] = []
  if (wugui) avoidDirections.push(wugui.direction)
  if (jueming && !avoidDirections.includes(jueming.direction)) avoidDirections.push(jueming.direction)

  const officeUsageNote = {
    independent: '独立办公室气场最稳定，宜以生气、延年方主导座位与财位布局。',
    openPlan: '开放式工位动线较杂，宜尽量背靠实墙，面向吉方，避免背对通道。',
    shared: '共享办公室人员流动大，座位宜靠墙形成靠山，减少正对门口或背对人流。',
    homeOffice: '居家办公空间常与其他功能混用，书桌宜与生活动线分隔，面向吉方。',
  }

  const seat: SeatSuggestion = {
    bestDirections,
    avoidDirections,
    note: `座位宜面向吉方吸纳气场，忌背对或正对大凶方；${officeUsageNote[officeUsage]}实际布局以门窗动线与建筑结构为准。`,
  }

  const desk: SeatSuggestion = {
    bestDirections,
    avoidDirections,
    note: `办公桌宜面向生气、延年等吉方，强化专注与事业运；${officeUsageNote[officeUsage]}实际布局以门窗动线与建筑结构为准。`,
  }

  // 办公桌所在方位的吉凶
  const deskMountain = findMountain24(normalizedDeskDir)
    ?? findNearestMountain24Center(normalizedDeskDir)
  const deskPalace = bazhaiResult.palaces.find(p => p.name === deskMountain?.palace)
  const deskStar = deskPalace?.star ?? '伏位'
  const deskStarLevel = deskPalace?.level ?? '小吉'
  const deskAuspicious = deskPalace?.auspicious ?? true

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
    deskDirection: normalizedDeskDir,
    officeUsage,
    wenchang,
    seat,
    desk,
    deskStar,
    deskStarLevel,
    deskAuspicious,
    wealth,
  }
}

function calcBazhaiInternal(params: InternalBazhaiParams): BazhaiResult {
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

interface InternalBazhaiParams {
  direction: number
  mountain: Mountain24 | null
  sittingMountain: Mountain24 | null
  birthYear: number
  gender: Gender
  locale: string
}
