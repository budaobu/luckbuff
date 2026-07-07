import { toLunar } from 'lunar'
import type {
  AccumulatedYearsInfo,
  ChaoShenJieQiInfo,
  GanZhiInfo,
  GodNature,
  PanLevel,
  TaiyiChart,
  TaiyiChartResult,
  TaiyiGod,
  TaiyiKeySpirits,
  TaiyiYinYang,
} from './types'

// =============================================================================
// 常量表
// =============================================================================

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/** 太乙九宫名称（编号 1-9） */
const PALACE_NAMES = [
  '', // 占位，使索引从 1 开始
  '坎一',
  '坤二',
  '震三',
  '巽四',
  '中五',
  '乾六',
  '兑七',
  '艮八',
  '离九',
]

/**
 * 地支 → 太乙九宫映射。
 * 采用后天八卦配九宫：
 *   子=坎一，丑寅=艮八，卯=震三，辰巳=巽四，午=离九，未申=坤二，酉=兑七，戌亥=乾六。
 *
 * 注：不同流派在辰/巳、未/申、戌/亥等共用地支的配宫上存在分歧；
 *     本实现取“一卦主一支、共用地支按卦宫归类”的常用方案。
 */
const ZHI_TO_PALACE: Record<string, number> = {
  子: 1, // 坎
  丑: 8, // 艮
  寅: 8, // 艮
  卯: 3, // 震
  辰: 4, // 巽
  巳: 4, // 巽
  午: 9, // 离
  未: 2, // 坤
  申: 2, // 坤
  酉: 7, // 兑
  戌: 6, // 乾
  亥: 6, // 乾
}

/**
 * 年干起文昌。
 * 据《太乙神数》传统算法：甲己之年文昌在巳，乙庚在午，丙辛在申，丁壬在戌，戊癸在子。
 * 再将地支映射到九宫即得文昌宫。
 */
const YEAR_GAN_TO_WENCHANG_ZHI: Record<string, string> = {
  甲: '巳',
  己: '巳',
  乙: '午',
  庚: '午',
  丙: '申',
  辛: '申',
  丁: '戌',
  壬: '戌',
  戊: '子',
  癸: '子',
}

/**
 * 十六神固定顺序。
 * 注：太乙神数各流派神名、顺序及排法有异；此处采用需求所列顺序，
 *     并以“太乙为本位、阳遁顺行九宫、阴遁逆行九宫”的方式布列。
 */
const GOD_NAMES = [
  '太乙',
  '摄提',
  '轩辕',
  '招摇',
  '天符',
  '青龙',
  '咸池',
  '太阴',
  '天一',
  '地一',
  '文昌',
  '太阳',
  '神光',
  '迁神',
  '死武',
  '斗杓',
] as const

/**
 * 十六神传统吉凶属性（工程近似，用于前端展示）。
 * 注：古籍对各神吉凶因事而异，同一神在不同占类中含义可变；
 *     本表取常见通论属性，后续可随占事类型调整权重。
 */
const GOD_NATURE: Record<string, GodNature> = {
  太乙: '吉',
  摄提: '凶',
  轩辕: '吉',
  招摇: '凶',
  天符: '吉',
  青龙: '吉',
  咸池: '凶',
  太阴: '吉',
  天一: '吉',
  地一: '中',
  文昌: '吉',
  太阳: '吉',
  神光: '吉',
  迁神: '中',
  死武: '凶',
  斗杓: '中',
}

// =============================================================================
// 工具函数
// =============================================================================

function modPositive(n: number, m: number): number {
  return ((n % m) + m) % m
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function daysInMonth(year: number, month: number): number {
  const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month === 2 && isLeapYear(year)) return 29
  return days[month]!
}

function dayOfYear(year: number, month: number, day: number): number {
  let result = 0
  for (let m = 1; m < month; m++) {
    result += daysInMonth(year, m)
  }
  return result + day
}

/** 取得节气在当年内的第几天（简化近似值，用于确定年柱、月柱） */
function jieDayOfYear(year: number, jieIndex: number): number {
  // jieIndex: 0=立春,1=惊蛰,...,11=小寒
  const monthMap = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1]
  const dayMap = [4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 7, 6]
  let offset = 0
  if (jieIndex === 0) {
    // 立春微调：参考项目 app/utils/bazi/calendar.ts 中的规则
    const early3 = new Set([
      1903, 1907, 1911, 1915, 1919, 1923, 1927, 1931, 1935, 1939, 1943, 1947,
      1951, 1955, 1959, 1963, 1967, 1971, 1975, 1979, 1983, 1987, 1991, 1995,
      1999, 2003, 2007, 2011, 2015, 2019, 2023, 2027, 2031, 2035, 2039, 2043,
      2047, 2051, 2055, 2059, 2063, 2067, 2071, 2075, 2079, 2083, 2087, 2091,
      2095, 2099,
    ])
    const late5 = new Set([
      1900, 1904, 1908, 1912, 1916, 1920, 1924, 1928, 1932, 1936, 1940, 1944,
      1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992,
      1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024, 2028, 2032, 2036, 2040,
      2044, 2048, 2052, 2056, 2060, 2064, 2068, 2072, 2076, 2080, 2084, 2088,
      2092, 2096, 2100,
    ])
    if (early3.has(year)) offset = -1
    else if (late5.has(year)) offset = 1
  }
  return dayOfYear(year, monthMap[jieIndex]!, dayMap[jieIndex]!) + offset
}

/** 取得月支索引（0=子，1=丑，…，11=亥），以节气为界 */
function getMonthZhiIndex(year: number, month: number, day: number): number {
  const currentDay = dayOfYear(year, month, day)
  let jieIndex = 11 // 默认丑月（小寒到立春前）
  for (let i = 0; i < 12; i++) {
    if (currentDay >= jieDayOfYear(year, i)) {
      jieIndex = i
    }
  }
  // 12 月大雪后应属子月
  const daXueDay = jieDayOfYear(year, 10)
  if (jieIndex === 11 && currentDay > daXueDay) {
    jieIndex = 10
  }
  return jieIndex
}

/** 年柱（以立春为界） */
function getYearPillar(year: number, month: number, day: number): string {
  const lichenDay = jieDayOfYear(year, 0)
  const currentDay = dayOfYear(year, month, day)
  let effectiveYear = year
  if (currentDay < lichenDay) {
    effectiveYear = year - 1
  }
  const ganIdx = modPositive(effectiveYear - 4, 10)
  const zhiIdx = modPositive(effectiveYear - 4, 12)
  return TIAN_GAN[ganIdx]! + DI_ZHI[zhiIdx]!
}

/** 月柱（五虎遁） */
function getMonthPillar(yearGan: string, year: number, month: number, day: number): string {
  const jieIndex = getMonthZhiIndex(year, month, day)
  const zhi = DI_ZHI[jieIndex]!
  const ganStart: Record<string, number> = {
    甲: 2, 己: 2, 乙: 4, 庚: 4, 丙: 6, 辛: 6, 丁: 8, 壬: 8, 戊: 0, 癸: 0,
  }
  const ganIdx = modPositive((ganStart[yearGan] ?? 0) + jieIndex, 10)
  return TIAN_GAN[ganIdx]! + zhi
}

/** 日柱（以 1900-01-01=甲戌为基） */
function getDayPillar(year: number, month: number, day: number): string {
  const y = year - 1
  const d = dayOfYear(year, month, day)
  const g = modPositive(y * 5 + Math.floor(y / 4) + d, 60)
  return TIAN_GAN[g % 10]! + DI_ZHI[g % 12]!
}

/** 时柱（五鼠遁，含早晚子时） */
function getHourPillar(dayGan: string, hour: number): string {
  let zhiIndex: number
  if (hour >= 23) {
    zhiIndex = 0 // 晚子时
  } else if (hour >= 1) {
    zhiIndex = Math.floor((hour - 1) / 2) + 1
  } else {
    zhiIndex = 0 // 早子时
  }
  const ganStart: Record<string, number> = {
    甲: 0, 己: 0, 乙: 2, 庚: 2, 丙: 4, 辛: 4, 丁: 6, 壬: 6, 戊: 8, 癸: 8,
  }
  const ganIdx = modPositive((ganStart[dayGan] ?? 0) + zhiIndex, 10)
  return TIAN_GAN[ganIdx]! + DI_ZHI[zhiIndex]!
}

/** 四柱干支 */
function getGanZhiInfo(year: number, month: number, day: number, hour: number): GanZhiInfo {
  const yearPillar = getYearPillar(year, month, day)
  const yearGan = yearPillar[0]!
  const monthPillar = getMonthPillar(yearGan, year, month, day)
  const dayPillar = getDayPillar(year, month, day)
  const hourPillar = getHourPillar(dayPillar[0]!, hour)
  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  }
}

/** 取得时辰地支索引（0=子，…，11=亥）。23-1 为子时。 */
function getHourBranchIndex(hour: number): number {
  if (hour >= 23 || hour < 1) return 0
  return Math.floor((hour - 1) / 2) + 1
}

// =============================================================================
// 太乙核心算法
// =============================================================================

/**
 * 计算太乙积年。
 * 以公元前 2696 年（甲子年）为基元第 1 年。
 * 因公历无公元 0 年，从公元前 2696 年到公元 1 年共 2695 年，
 * 故公元 Y 年的积年数 = 2695 + (Y - 1) = Y + 2694。
 *
 * 注：部分流派以公元前 2697 年为基元，则公式为 Y + 2695；
 *     本实现按需求采用公元前 2696 年基元。
 */
export function getAccumulatedYears(year: number): AccumulatedYearsInfo {
  return {
    year,
    accumulatedYears: year + 2694,
    baseYearNote: '以公元前 2696 年（甲子年）为基元第 1 年',
  }
}

/**
 * 由积年数推导 72 年周期位置、阴阳、局数。
 * 太乙以 72 年为一纪（18 局 × 4 年）。
 * 本实现取：cyclePosition 1-36 为阳遁，37-72 为阴遁；
 * 每 4 年为 1 局，阳 1-9 局、阴 1-9 局各出现一次。
 *
 * 注：不同古籍对“一局管几年”“阴阳从何年起”有分歧；
 *     此处采用最常见的“18 局、每局 4 年、先阳后阴”模型。
 */
function getCycleInfo(accumulatedYears: number): {
  cyclePosition: number
  taiyiYinYang: TaiyiYinYang
  juNumber: number
  juYearPosition: number
} {
  const cyclePosition = modPositive(accumulatedYears - 1, 72) + 1 // 1..72
  const juIndex = Math.floor((cyclePosition - 1) / 4) + 1 // 1..18
  const taiyiYinYang: TaiyiYinYang = juIndex <= 9 ? '阳' : '阴'
  const juNumber = juIndex <= 9 ? juIndex : juIndex - 9
  const juYearPosition = modPositive(cyclePosition - 1, 4) + 1 // 1..4
  return { cyclePosition, taiyiYinYang, juNumber, juYearPosition }
}

/**
 * 超神 / 接气判断。
 * 传统含义：用局之气与节气之气的先后关系。
 * 本实现简化为“一局四年”模型：
 *   - 前两年为超神（用局提前于节气转换），
 *   - 后两年为接气（承接上一局之气）。
 * 返回偏移量 offset 为当前年份在该半段内的 0-based 年偏移。
 *
 * 注：此为便于工程落地的简化；古籍对超神接气的精确节气交界有多种算法。
 */
function getChaoShenJieQi(
  cyclePosition: number,
  juYearPosition: number,
): ChaoShenJieQiInfo {
  if (juYearPosition <= 2) {
    return {
      state: '超神',
      offset: juYearPosition - 1,
      cyclePosition,
      juYearPosition,
    }
  }
  return {
    state: '接气',
    offset: juYearPosition - 3,
    cyclePosition,
    juYearPosition,
  }
}

/**
 * 计算年局太乙宫（九宫）。
 * 阳遁顺行九宫：cyclePosition 1→坎一，2→坤二，…；
 * 阴遁逆行九宫：cyclePosition 37→离九，38→艮八，…。
 */
function getYearTaiyiGong(cyclePosition: number, taiyiYinYang: TaiyiYinYang): number {
  if (taiyiYinYang === '阳') {
    return modPositive(cyclePosition - 1, 9) + 1
  }
  // 阴遁从 cyclePosition 37 开始逆行，37→9，38→8，…
  const yinPos = cyclePosition - 36 // 1..36
  return 9 - modPositive(yinPos - 1, 9)
}

/** 九宫对宫：1↔9，2↔8，3↔7，4↔6，5↔5 */
function oppositePalace(palace: number): number {
  return 10 - palace
}

/**
 * 在九宫中移动。
 * @param start 起始宫（1-9）
 * @param steps 步数；正数为顺行，负数为逆行
 * @returns 目标宫（1-9）
 */
function moveInPalace(start: number, steps: number, taiyiYinYang: TaiyiYinYang): number {
  const direction = taiyiYinYang === '阳' ? 1 : -1
  return modPositive(start - 1 + steps * direction, 9) + 1
}

/**
 * 中五宫寄宫。
 * 本实现采用“中五寄坤二”的常用寄宫法，使对外宫位落在 1-8 宫。
 *
 * 注：寄宫法有多种（寄坤二、寄艮八、寄本宫等），
 *     不同流派处理方式不同，此处明确选用寄坤二。
 */
function attachCenterPalace(palace: number): number {
  return palace === 5 ? 2 : palace
}

/**
 * 计算主要神将宫位。
 * - 太乙宫：传入的当前盘太乙宫。
 * - 计神宫：太乙对冲宫。
 * - 文昌宫：由年干起文昌，地支映射到九宫后寄宫。
 * - 天目宫：文昌起，顺时辰地支索引（0-based）推算；
 *           古籍多用“月将加时”，此处以时支代替月将作工程近似。
 * - 地目宫：天目对冲宫。
 *
 * 注：太乙、文昌、天目/地目为太乙式核心用神，各流派起法存在差异；
 *     本函数在注释中标注了选用版本及近似理由。
 */
function getKeySpirits(
  taiyiGong: number,
  yearGan: string,
  hourBranchIndex: number,
): TaiyiKeySpirits {
  const jiShenGong = oppositePalace(taiyiGong)

  const wenChangZhi = YEAR_GAN_TO_WENCHANG_ZHI[yearGan] ?? '巳'
  const wenChangRaw = ZHI_TO_PALACE[wenChangZhi] ?? 4
  const wenChangGong = attachCenterPalace(wenChangRaw)

  // 天目：文昌起，顺时支数（0-based）。
  // 此处固定用阳遁顺行，是因为“天目”作为文昌之延伸，传统上以顺推为主；
  // 若严格按月将加时顺逆，则需引入完整月将表，超出本轮骨架范围。
  const tianMuRaw = moveInPalace(wenChangRaw, hourBranchIndex, '阳')
  const tianMuGong = attachCenterPalace(tianMuRaw)
  const diMuGong = attachCenterPalace(oppositePalace(tianMuRaw))

  return {
    taiyiGong: attachCenterPalace(taiyiGong),
    jiShenGong: attachCenterPalace(jiShenGong),
    wenChangGong,
    tianMuGong,
    diMuGong,
  }
}

/**
 * 计算十六神全排。
 * 以当前盘太乙宫为起点，阳遁顺行九宫、阴遁逆行九宫依次布列十六神；
 * 中五宫寄于坤二宫，使所有神将宫位落在 1-8 宫。
 *
 * 注：十六神的实际排法古籍记载不一（如“太乙十六神游”与“推神术”有异），
 *     此处选用“以太乙为起点、按固定神序、顺逆九宫”的可计算模型，
 *     便于工程落地并保持各局之间的一致性。
 */
function getSixteenGods(taiyiGong: number, yinYang: TaiyiYinYang): TaiyiGod[] {
  return GOD_NAMES.map((name, index) => {
    const rawPalace = moveInPalace(taiyiGong, index, yinYang)
    return {
      name,
      palace: attachCenterPalace(rawPalace),
      nature: GOD_NATURE[name] ?? '中',
    }
  })
}

/** 构造单盘 */
function buildChart(
  level: PanLevel,
  levelLabel: string,
  taiyiGong: number,
  taiyiYinYang: TaiyiYinYang,
  juNumber: number,
  chaoShenJieQi: ChaoShenJieQiInfo,
  yearGan: string,
  hourBranchIndex: number,
): TaiyiChart {
  return {
    level,
    levelLabel,
    taiyiGong: attachCenterPalace(taiyiGong),
    yinYangJu: taiyiYinYang,
    juNumber,
    chaoShenJieQi,
    gods: getSixteenGods(taiyiGong, taiyiYinYang),
    keySpirits: getKeySpirits(taiyiGong, yearGan, hourBranchIndex),
  }
}

// =============================================================================
// 公开 API
// =============================================================================

/**
 * 计算完整太乙四盘。
 * @param input 出生/占问年月日时与所问事项
 */
export function calculateTaiyiChart(input: {
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
  question: string
}): TaiyiChartResult {
  const { birthYear: year, birthMonth: month, birthDay: day, birthHour: hour, question } = input

  // 农历转换：构造一个 UTC Date，使其 getUTC* 等于输入的年月日时。
  // 默认视为东八区本地时间；后续若需时区扩展，可在此加入 timezone 参数。
  const date = new Date(Date.UTC(year, month - 1, day, hour, 0, 0))
  const { lunar } = toLunar(date)

  // 四柱
  const pillars = getGanZhiInfo(year, month, day, hour)
  const yearGan = pillars.year[0]!
  const dayGan = pillars.day[0]!
  const dayZhi = pillars.day[1]!

  // 积年与周期
  const accumulated = getAccumulatedYears(year)
  const { cyclePosition, taiyiYinYang, juNumber, juYearPosition } = getCycleInfo(accumulated.accumulatedYears)
  const chaoShenJieQi = getChaoShenJieQi(cyclePosition, juYearPosition)

  // 年局太乙宫（九宫）
  const yearTaiyiGong = getYearTaiyiGong(cyclePosition, taiyiYinYang)

  // 时辰地支索引
  const hourBranchIndex = getHourBranchIndex(hour)

  // 月局：以年局为基，月数（0-based）顺/逆推
  const monthTaiyiGong = moveInPalace(yearTaiyiGong, lunar.month - 1, taiyiYinYang)

  // 日局：以月局为基，累加日干、日支序号
  const dayGanIndex = TIAN_GAN.indexOf(dayGan)
  const dayZhiIndex = DI_ZHI.indexOf(dayZhi)
  const daySteps = (dayGanIndex >= 0 ? dayGanIndex : 0) + (dayZhiIndex >= 0 ? dayZhiIndex : 0)
  const dayTaiyiGong = moveInPalace(monthTaiyiGong, daySteps, taiyiYinYang)

  // 时局：以日局为基，时辰地支索引
  const hourTaiyiGong = moveInPalace(dayTaiyiGong, hourBranchIndex, taiyiYinYang)

  // 四盘阴阳局与年局一致（简化模型）
  const yearChart = buildChart('year', '年局', yearTaiyiGong, taiyiYinYang, juNumber, chaoShenJieQi, yearGan, hourBranchIndex)
  const monthChart = buildChart('month', '月局', monthTaiyiGong, taiyiYinYang, juNumber, chaoShenJieQi, yearGan, hourBranchIndex)
  const dayChart = buildChart('day', '日局', dayTaiyiGong, taiyiYinYang, juNumber, chaoShenJieQi, yearGan, hourBranchIndex)
  const hourChart = buildChart('hour', '时局', hourTaiyiGong, taiyiYinYang, juNumber, chaoShenJieQi, yearGan, hourBranchIndex)

  return {
    input,
    pillars,
    accumulatedYears: accumulated,
    yearChart,
    monthChart,
    dayChart,
    hourChart,
  }
}

/** 宫位名称（辅助函数，UI 阶段可用） */
export function getPalaceName(palace: number): string {
  return PALACE_NAMES[palace] ?? '未知'
}
