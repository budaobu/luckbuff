/**
 * 书房风水布局计算引擎
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

export type StudyRoomType = 'independent' | 'withBedroom' | 'withLivingRoom' | 'withDining'

export interface WenchangResult {
  type: '本命文昌' | '固定文昌'
  gan?: string
  direction: Direction
  directionName: string
  note: string
}

export interface DeskSuggestion {
  bestDirections: Direction[]
  avoidDirections: Direction[]
  note: string
}

export interface StudyFengshuiInput {
  direction: number
  deskDirection: number
  birthYear: number
  birthMonth: number
  birthDay: number
  gender: Gender
  roomUsage: StudyRoomType
  locale?: string
}

export interface StudyFengshuiResult extends BazhaiResult {
  birthMonth: number
  birthDay: number
  yearGan: string
  deskDirection: number
  roomUsage: StudyRoomType
  wenchang: WenchangResult[]
  desk: DeskSuggestion
  deskStar: Star
  deskStarLevel: string
  deskAuspicious: boolean
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

export function calcStudyFengshui(input: StudyFengshuiInput): StudyFengshuiResult {
  const {
    direction,
    deskDirection,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    roomUsage,
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

  // 书桌朝向：优先面向生气/延年/天医/伏位，避开五鬼/绝命
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

  const roomUsageNote = {
    independent: '独立书房气场最纯粹，宜以文昌位与吉方主导整体布局。',
    withBedroom: '书房与卧室合用，需注意书桌不宜正对床头，睡眠区与思考区宜有软性分隔。',
    withLivingRoom: '书房与客厅合用，需避开电视、沙发动线，书桌宜背靠实墙、面向吉方。',
    withDining: '书房与餐厅合用，需远离餐桌油烟动线，书架与书桌尽量靠墙形成稳定靠山。',
  }

  const desk: DeskSuggestion = {
    bestDirections,
    avoidDirections,
    note: `书桌宜面向吉方吸纳文昌气场，忌背对或正对大凶方；${roomUsageNote[roomUsage]}实际布局以门窗动线与建筑结构为准。`,
  }

  // 书桌所在方位的吉凶
  const deskMountain = findMountain24(normalizedDeskDir)
    ?? findNearestMountain24Center(normalizedDeskDir)
  const deskPalace = bazhaiResult.palaces.find(p => p.name === deskMountain?.palace)
  const deskStar = deskPalace?.star ?? '伏位'
  const deskStarLevel = deskPalace?.level ?? '小吉'
  const deskAuspicious = deskPalace?.auspicious ?? true

  return {
    ...bazhaiResult,
    birthMonth,
    birthDay,
    yearGan,
    deskDirection: normalizedDeskDir,
    roomUsage,
    wenchang,
    desk,
    deskStar,
    deskStarLevel,
    deskAuspicious,
  }
}
