/**
 * 卧室风水布局计算引擎
 *
 * 参考资料：
 * - 姜群《八宅风水实用教学篇》（网易）
 * - time.actor《东西四命精密计算》
 * - 《八宅明镜》大游年歌诀
 * - 《阳宅十书》床论
 * - 卧室床位峦头禁忌：横梁压床、门冲床、镜子对床、床头靠窗/窗冲床、
 *   床头靠厕所墙、床头靠厨房墙、斜顶压床等，综合传统形势派与八宅理气派。
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
import type { RoomType } from './office-fengshui'

export interface BedroomTaboos {
  beamOverBed: boolean
  doorRushBed: boolean
  mirrorFacingBed: boolean
  windowBehindBed: boolean
  windowAboveBed: boolean
  bathroomWall: boolean
  kitchenWall: boolean
  slopedCeiling: boolean
}

export interface TabooWarning {
  key: keyof BedroomTaboos
  severity: 'high' | 'medium' | 'low'
  message: string
}

export interface BedSuggestion {
  bestDirections: Direction[]
  avoidDirections: Direction[]
  note: string
}

export interface BedroomFengshuiInput {
  roomType: RoomType
  direction: number
  bedDirection: number
  birthYear: number
  birthMonth: number
  birthDay: number
  gender: Gender
  taboos: BedroomTaboos
  locale?: string
}

export interface BedroomFengshuiResult extends BazhaiResult {
  roomType: RoomType
  birthMonth: number
  birthDay: number
  yearGan: string
  bedDirection: number
  bedStar: Star
  bedStarLevel: string
  bedAuspicious: boolean
  taboos: BedroomTaboos
  tabooWarnings: TabooWarning[]
  bed: BedSuggestion
}

// 地支到方位（用于文昌位转换，保留以便扩展）
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

function evaluateTaboos(taboos: BedroomTaboos): TabooWarning[] {
  const warnings: TabooWarning[] = []
  const rules: { key: keyof BedroomTaboos; severity: 'high' | 'medium' | 'low'; message: string }[] = [
    { key: 'beamOverBed', severity: 'high', message: '横梁压床：床位于横梁正下方，易造成压迫感与睡眠不安，宜移床或吊顶遮挡。' },
    { key: 'doorRushBed', severity: 'high', message: '门冲床：房门直冲床位，气流直冲睡床，宜移床或加屏风/门帘缓冲。' },
    { key: 'mirrorFacingBed', severity: 'high', message: '镜子对床：镜子反射床影，易扰动气场、影响睡眠与情绪，宜移镜或遮盖。' },
    { key: 'windowBehindBed', severity: 'medium', message: '床头靠窗：窗为动气之口，床头无实墙靠山，建议用厚帘或高床头补救，最佳为移床。' },
    { key: 'windowAboveBed', severity: 'medium', message: '窗冲床：床正上方有窗，气流与光线直压，建议避免或安装遮光帘。' },
    { key: 'bathroomWall', severity: 'medium', message: '床头靠厕所墙：湿秽之气易扰睡眠，建议改换床头方向或加实板/软包隔断。' },
    { key: 'kitchenWall', severity: 'medium', message: '床头靠厨房墙：火气、油烟与噪音扰动，建议改换床头或加厚床头板缓冲。' },
    { key: 'slopedCeiling', severity: 'medium', message: '斜顶压床：低矮斜顶造成压迫感，建议将床置于最高处或用高床头/床幔化解。' },
  ]
  for (const rule of rules) {
    if (taboos[rule.key]) {
      warnings.push({ key: rule.key, severity: rule.severity, message: rule.message })
    }
  }
  return warnings
}

export function calcBedroomFengshui(input: BedroomFengshuiInput): BedroomFengshuiResult {
  const {
    roomType,
    direction,
    bedDirection,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    taboos,
    locale = 'zh-CN',
  } = input

  const normalizedDir = normalizeDegree(direction)
  const normalizedBedDir = normalizeDegree(bedDirection)
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

  // 床位所在方位山向与星曜：以床头朝向（人躺卧时头部所指）对应的宫位定吉凶
  const bedMountain = findMountain24(normalizedBedDir)
    ?? findNearestMountain24Center(normalizedBedDir)
  const bedPalace = bazhaiResult.palaces.find(p => p.name === bedMountain?.palace)
  const bedStar = bedPalace?.star ?? '伏位'
  const bedStarLevel = bedPalace?.level ?? '小吉'
  const bedAuspicious = bedPalace?.auspicious ?? true

  // 床位朝向建议：优先床头朝延年（姻缘、健康）、天医（身体），其次生气、伏位；避开绝命、五鬼
  const shengqi = bazhaiResult.palaces.find(p => p.star === '生气')
  const yannian = bazhaiResult.palaces.find(p => p.star === '延年')
  const tianyi = bazhaiResult.palaces.find(p => p.star === '天医')
  const fuwei = bazhaiResult.palaces.find(p => p.star === '伏位')
  const wugui = bazhaiResult.palaces.find(p => p.star === '五鬼')
  const jueming = bazhaiResult.palaces.find(p => p.star === '绝命')

  const bestDirections: Direction[] = []
  if (yannian) bestDirections.push(yannian.direction)
  if (tianyi) bestDirections.push(tianyi.direction)
  if (shengqi && bestDirections.length < 3) bestDirections.push(shengqi.direction)
  if (fuwei && bestDirections.length < 3) bestDirections.push(fuwei.direction)

  const avoidDirections: Direction[] = []
  if (jueming) avoidDirections.push(jueming.direction)
  if (wugui && !avoidDirections.includes(wugui.direction)) avoidDirections.push(wugui.direction)

  const bed: BedSuggestion = {
    bestDirections,
    avoidDirections,
    note: '卧室床位宜床头靠实墙，优先朝向延年（利姻缘、健康）与天医（利身体）吉方；实际布局需避开门窗直冲与横梁压顶。',
  }

  const tabooWarnings = evaluateTaboos(taboos)

  return {
    ...bazhaiResult,
    roomType,
    birthMonth,
    birthDay,
    yearGan,
    bedDirection: normalizedBedDir,
    bedStar,
    bedStarLevel,
    bedAuspicious,
    taboos,
    tabooWarnings,
    bed,
  }
}
