/**
 * 八宅风水计算引擎
 *
 * 参考资料：
 * - 姜群《八宅风水实用教学篇》（网易）
 * - time.actor《东西四命精密计算》
 * - 《八宅明镜》大游年歌诀
 *
 * 命卦计算以立春为年度分界；1900–1999 与 2000 年后使用不同公式；
 * 余数 5 男归坤、女归艮。
 */

export type Gender = 'male' | 'female'

export type Gua = '坎' | '坤' | '震' | '巽' | '乾' | '兑' | '艮' | '离'
export type Direction =
  | '北'
  | '东北'
  | '东'
  | '东南'
  | '南'
  | '西南'
  | '西'
  | '西北'

export type Star = '生气' | '延年' | '天医' | '伏位' | '绝命' | '五鬼' | '祸害' | '六煞'

export interface Mountain24 {
  name: string
  start: number
  end: number
  palace: Gua
  palaceNumber: number
  yin: boolean
}

export interface PalaceResult {
  name: Gua
  direction: Direction
  palaceNumber: number
  star: Star
  auspicious: boolean
  level: '大吉' | '吉' | '小吉' | '大凶' | '凶'
}

export interface BazhaiResult {
  direction: number
  mountain: Mountain24 | null
  sittingMountain: Mountain24 | null
  birthYear: number
  gender: Gender
  mingGua: Gua
  mingGuaNumber: number
  dongSiMing: '东四命' | '西四命'
  dongSiZhai: '东四宅' | '西四宅'
  palaces: PalaceResult[]
  auspicious: { star: Star; direction: Direction; level: string }[]
  inauspicious: { star: Star; direction: Direction; level: string }[]
  locale: string
}

// 二十四山：每山 15°，中心点按 0°/360° 起每 15° 递增
export const MOUNTAINS_24: Mountain24[] = [
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

const DIRECTIONS: Direction[] = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

// 宫位元信息（上南下北布局，但八宅以坐山起伏位）
const PALACE_META: {
  name: Gua
  direction: Direction
  palaceNumber: number
}[] = [
  { name: '坎', direction: '北', palaceNumber: 1 },
  { name: '坤', direction: '西南', palaceNumber: 2 },
  { name: '震', direction: '东', palaceNumber: 3 },
  { name: '巽', direction: '东南', palaceNumber: 4 },
  { name: '乾', direction: '西北', palaceNumber: 6 },
  { name: '兑', direction: '西', palaceNumber: 7 },
  { name: '艮', direction: '东北', palaceNumber: 8 },
  { name: '离', direction: '南', palaceNumber: 9 },
]

// 数字到卦
const NUMBER_TO_GUA: Record<number, Gua> = {
  1: '坎',
  2: '坤',
  3: '震',
  4: '巽',
  6: '乾',
  7: '兑',
  8: '艮',
  9: '离',
}

// 大游年歌诀：以伏位卦为起点，顺时针（北→东北→东→东南→南→西南→西→西北）排列八星
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

// 按标准罗盘顺序：子/北 起顺时针，每 45° 一宫
const CLOCKWISE_DIRECTIONS: Direction[] = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

export function normalizeDegree(d: number): number {
  let deg = d % 360
  if (deg < 0) deg += 360
  return deg
}

export function findMountain24(deg: number): Mountain24 | null {
  const normalized = normalizeDegree(deg)
  for (const m of MOUNTAINS_24) {
    if (m.start < m.end) {
      if (normalized >= m.start && normalized < m.end) return m
    }
    else {
      // 跨越 0°/360°
      if (normalized >= m.start || normalized < m.end) return m
    }
  }
  return null
}

export function findNearestMountain24Center(deg: number): Mountain24 | null {
  const normalized = normalizeDegree(deg)
  let nearest: Mountain24 | null = null
  let minDiff = Infinity
  for (const m of MOUNTAINS_24) {
    let center: number
    if (m.start < m.end) {
      center = (m.start + m.end) / 2
    }
    else {
      center = normalizeDegree((m.start + (m.end + 360)) / 2)
    }
    const diff = Math.abs(normalizeDegree(normalized - center))
    const d = Math.min(diff, 360 - diff)
    if (d < minDiff) {
      minDiff = d
      nearest = m
    }
  }
  return nearest
}

/**
 * 计算命卦数字。
 * @param effectiveYear 已按立春调整后的有效年份
 * @param gender 性别
 */
export function calcMingGuaNumber(effectiveYear: number, gender: Gender): number {
  const lastTwo = effectiveYear % 100

  let result: number
  if (effectiveYear < 2000) {
    // 1900–1999：男命 (100 − 后两位) ÷ 9 取余；女命 (后两位 + 5) ÷ 9 取余
    if (gender === 'male') {
      result = (100 - lastTwo) % 9
    }
    else {
      result = (lastTwo + 5) % 9
    }
  }
  else {
    // 2000 年后：男命 (99 − 后两位) ÷ 9 取余；女命 (后两位 + 6) ÷ 9 取余
    if (gender === 'male') {
      result = (99 - lastTwo) % 9
    }
    else {
      result = (lastTwo + 6) % 9
    }
  }

  // % 9 结果为 0 时视为 9（离卦）
  if (result === 0) result = 9

  // 中五寄宫：男命归坤（2），女命归艮（8）
  if (result === 5) {
    return gender === 'male' ? 2 : 8
  }
  return result
}

export function getGuaByNumber(n: number): Gua {
  return NUMBER_TO_GUA[n] ?? '坎'
}

export function isDongSi(gua: Gua): boolean {
  return ['坎', '震', '巽', '离'].includes(gua)
}

function directionToIndex(dir: Direction): number {
  return CLOCKWISE_DIRECTIONS.indexOf(dir)
}

function indexToDirection(idx: number): Direction {
  return CLOCKWISE_DIRECTIONS[(idx + 8) % 8]!
}

function getVowelStar(gua: Gua, direction: Direction): Star {
  const guaMeta = PALACE_META.find(p => p.name === gua)!
  const baseIdx = directionToIndex(guaMeta.direction)
  const targetIdx = directionToIndex(direction)
  const offset = (targetIdx - baseIdx + 8) % 8
  return DAYOU_NIAN[gua][offset]!
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

export function calcBazhai(
  direction: number,
  birthYear: number,
  gender: Gender,
  locale = 'zh-CN',
): BazhaiResult {
  const normalizedDir = normalizeDegree(direction)
  const mountain = findMountain24(normalizedDir)
  const sittingDeg = normalizeDegree(normalizedDir + 180)
  const sittingMountain = findMountain24(sittingDeg)

  const mingGuaNumber = calcMingGuaNumber(birthYear, gender)
  const mingGua = getGuaByNumber(mingGuaNumber)
  const dongSiMing: '东四命' | '西四命' = isDongSi(mingGua) ? '东四命' : '西四命'

  const zhaiGua = sittingMountain?.palace ?? mingGua
  const dongSiZhai: '东四宅' | '西四宅' = isDongSi(zhaiGua) ? '东四宅' : '西四宅'

  const palaces: PalaceResult[] = PALACE_META.map((meta) => {
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
    direction: normalizedDir,
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

// 用于验证的参考案例
export const TEST_CASES = [
  { birthYear: 1962, gender: 'male' as Gender, expected: '坤' },
  { birthYear: 1962, gender: 'female' as Gender, expected: '巽' },
  { birthYear: 1982, gender: 'male' as Gender, expected: '离' },
  { birthYear: 1989, gender: 'female' as Gender, expected: '巽' },
  { birthYear: 2008, gender: 'female' as Gender, expected: '艮' },
  { birthYear: 2001, gender: 'male' as Gender, expected: '艮' },
]
