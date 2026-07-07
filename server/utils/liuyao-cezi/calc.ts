import { toLunar } from 'lunar'
import { getStrokeCountsWithAIFallback } from '../wuge/strokes'
import type {
  LiuyaoCeziCharAnalysis,
  LiuyaoCeziHexagram,
  LiuyaoCeziLine,
  LiuyaoCeziRequest,
  LiuyaoCeziResult,
  LiuyaoCeziTimeInfo,
  LiuyaoCeziTrigram,
} from '~/types/liuyao-cezi'

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 先天八卦序：乾1 兑2 离3 震4 巽5 坎6 艮7 坤8
const TRIGRAMS: LiuyaoCeziTrigram[] = [
  { index: 1, name: '乾', symbol: '☰', nature: '天', wuxing: '金' },
  { index: 2, name: '兑', symbol: '☱', nature: '泽', wuxing: '金' },
  { index: 3, name: '离', symbol: '☲', nature: '火', wuxing: '火' },
  { index: 4, name: '震', symbol: '☳', nature: '雷', wuxing: '木' },
  { index: 5, name: '巽', symbol: '☴', nature: '风', wuxing: '木' },
  { index: 6, name: '坎', symbol: '☵', nature: '水', wuxing: '水' },
  { index: 7, name: '艮', symbol: '☶', nature: '山', wuxing: '土' },
  { index: 8, name: '坤', symbol: '☷', nature: '地', wuxing: '土' },
]

const HEXAGRAM_NAMES: Record<string, string> = {
  '乾乾': '乾', '乾坤': '否', '乾艮': '遁', '乾兑': '履', '乾离': '同人', '乾坎': '讼', '乾震': '无妄', '乾巽': '姤',
  '坤乾': '泰', '坤坤': '坤', '坤艮': '谦', '坤兑': '临', '坤离': '明夷', '坤坎': '师', '坤震': '复', '坤巽': '升',
  '艮乾': '大畜', '艮坤': '剥', '艮艮': '艮', '艮兑': '损', '艮离': '贲', '艮坎': '蒙', '艮震': '颐', '艮巽': '蛊',
  '兑乾': '夬', '兑坤': '萃', '兑艮': '咸', '兑兑': '兑', '兑离': '革', '兑坎': '困', '兑震': '随', '兑巽': '大过',
  '离乾': '大有', '离坤': '晋', '离艮': '旅', '离兑': '睽', '离离': '离', '离坎': '未济', '离震': '噬嗑', '离巽': '鼎',
  '坎乾': '需', '坎坤': '比', '坎艮': '蹇', '坎兑': '节', '坎离': '既济', '坎坎': '坎', '坎震': '屯', '坎巽': '井',
  '震乾': '大壮', '震坤': '豫', '震艮': '小过', '震兑': '归妹', '震离': '丰', '震坎': '解', '震震': '震', '震巽': '恒',
  '巽乾': '小畜', '巽坤': '观', '巽艮': '渐', '巽兑': '中孚', '巽离': '家人', '巽坎': '涣', '巽震': '益', '巽巽': '巽',
}

// 卦象三爻（由下而上），true=阳 false=阴
const TRIGRAM_LINES: Record<string, boolean[]> = {
  乾: [true, true, true],
  兑: [true, true, false],
  离: [true, false, true],
  震: [true, false, false],
  巽: [false, true, true],
  坎: [false, true, false],
  艮: [false, false, true],
  坤: [false, false, false],
}

// 内卦纳甲（初、二、三爻）
const NA_JIA_LOWER: Record<string, string[]> = {
  乾: ['甲子', '甲寅', '甲辰'],
  兑: ['丁巳', '丁卯', '丁丑'],
  离: ['己卯', '己丑', '己亥'],
  震: ['庚子', '庚寅', '庚辰'],
  巽: ['辛丑', '辛亥', '辛酉'],
  坎: ['戊寅', '戊辰', '戊午'],
  艮: ['丙辰', '丙午', '丙申'],
  坤: ['乙未', '乙巳', '乙卯'],
}

// 外卦纳甲（四、五、上爻）
const NA_JIA_UPPER: Record<string, string[]> = {
  乾: ['壬午', '壬申', '壬戌'],
  兑: ['丁亥', '丁酉', '丁未'],
  离: ['己酉', '己未', '己巳'],
  震: ['庚午', '庚申', '庚戌'],
  巽: ['辛未', '辛巳', '辛卯'],
  坎: ['戊申', '戊戌', '戊子'],
  艮: ['丙戌', '丙子', '丙寅'],
  坤: ['癸丑', '癸亥', '癸酉'],
}

// 六神起始（按日干）
const LIU_SHEN = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武']
const LIU_SHEN_START: Record<string, number> = {
  甲: 0, 乙: 0,
  丙: 1, 丁: 1,
  戊: 2,
  己: 3,
  庚: 4, 辛: 4,
  壬: 5, 癸: 5,
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

function julianDayNumber(y: number, m: number, d: number): number {
  if (m <= 2) {
    y--
    m += 12
  }
  const A = Math.floor(y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5
}

function getDayPillar(date: Date): { gan: string; zhi: string } {
  const effectiveDate = date.getHours() >= 23 ? new Date(date.getTime() + 3600 * 1000) : date
  const jdn = julianDayNumber(
    effectiveDate.getFullYear(),
    effectiveDate.getMonth() + 1,
    effectiveDate.getDate(),
  )
  const index = normalizeIndex(Math.floor(jdn + 49), 60)
  return { gan: getGan(index), zhi: getZhi(index) }
}

function getYearPillar(lunarYear: number): { gan: string; zhi: string } {
  const offset = lunarYear - 1984
  return { gan: getGan(offset), zhi: getZhi(offset) }
}

function getFirstMonthStem(yearStem: string): string {
  const map: Record<string, string> = {
    甲: '丙', 己: '丙', 乙: '戊', 庚: '戊', 丙: '庚', 辛: '庚', 丁: '壬', 壬: '壬', 戊: '甲', 癸: '甲',
  }
  return map[yearStem] ?? '丙'
}

function getMonthPillar(yearStem: string, lunarMonth: number): { gan: string; zhi: string } {
  const monthBranchIndex = normalizeIndex(lunarMonth + 1, 12)
  const firstMonthStemIndex = ganIndex(getFirstMonthStem(yearStem))
  const monthStemIndex = normalizeIndex(firstMonthStemIndex + monthBranchIndex - 2, 10)
  return { gan: getGan(monthStemIndex), zhi: getZhi(monthBranchIndex) }
}

function getHourBranchIndex(date: Date): number {
  const h = date.getHours()
  return Math.floor(((h + 1) % 24) / 2)
}

function buildTimeInfo(date: Date): LiuyaoCeziTimeInfo {
  const { lunar } = toLunar(date)
  const yearPillar = getYearPillar(lunar.year)
  const monthPillar = getMonthPillar(yearPillar.gan, lunar.month)
  const dayPillar = getDayPillar(date)
  const hourBranchIndex = getHourBranchIndex(date)
  const hourZhi = getZhi(hourBranchIndex)

  return {
    gregorian: date.toISOString(),
    lunar: {
      year: lunar.year,
      month: lunar.month,
      day: lunar.day,
      yearGanZhi: `${yearPillar.gan}${yearPillar.zhi}`,
      monthGanZhi: `${monthPillar.gan}${monthPillar.zhi}`,
      dayGanZhi: `${dayPillar.gan}${dayPillar.zhi}`,
      hourZhi,
      hourIndex: hourBranchIndex + 1,
    },
    monthBuild: monthPillar.zhi,
    dayPillar: `${dayPillar.gan}${dayPillar.zhi}`,
  }
}

function getTrigramByNumber(n: number): LiuyaoCeziTrigram {
  const idx = normalizeIndex(n - 1, 8)
  return TRIGRAMS[idx]!
}

function isChineseChar(char: string): boolean {
  if (!char || char.length !== 1) return false
  const cp = char.codePointAt(0) || 0
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
}

function ganWuxing(gan: string): string {
  const map: Record<string, string> = {
    甲: '木', 乙: '木',
    丙: '火', 丁: '火',
    戊: '土', 己: '土',
    庚: '金', 辛: '金',
    壬: '水', 癸: '水',
  }
  return map[gan] ?? '土'
}

function zhiWuxing(zhi: string): string {
  const map: Record<string, string> = {
    寅: '木', 卯: '木',
    巳: '火', 午: '火',
    辰: '土', 戌: '土', 丑: '土', 未: '土',
    申: '金', 酉: '金',
    亥: '水', 子: '水',
  }
  return map[zhi] ?? '土'
}

function generates(from: string, to: string): boolean {
  const map: Record<string, string> = {
    木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
  }
  return map[from] === to
}

function overcomes(from: string, to: string): boolean {
  const map: Record<string, string> = {
    木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
  }
  return map[from] === to
}

function getLiuQin(lineGan: string, tiWuxing: string): string {
  const lineWuxing = ganWuxing(lineGan)
  if (lineWuxing === tiWuxing) return '兄弟'
  if (generates(lineWuxing, tiWuxing)) return '父母'
  if (generates(tiWuxing, lineWuxing)) return '子孙'
  if (overcomes(lineWuxing, tiWuxing)) return '官鬼'
  if (overcomes(tiWuxing, lineWuxing)) return '妻财'
  return '兄弟'
}

function getLineState(lineGan: string, monthBuildZhi: string): string {
  const lineWuxing = ganWuxing(lineGan)
  const monthWuxing = zhiWuxing(monthBuildZhi)
  if (lineWuxing === monthWuxing) return '旺'
  if (generates(monthWuxing, lineWuxing)) return '相'
  if (generates(lineWuxing, monthWuxing)) return '休'
  if (overcomes(lineWuxing, monthWuxing)) return '囚'
  if (overcomes(monthWuxing, lineWuxing)) return '死'
  return '平'
}

function getXunKongBranches(dayPillar: string): string[] {
  const gan = dayPillar.slice(0, 1)
  const zhi = dayPillar.slice(1, 2)
  const g = ganIndex(gan)
  const z = zhiIndex(zhi)
  let k = 0
  while ((g + 10 * k) % 12 !== z) {
    k++
  }
  const pillarIdx = g + 10 * k
  const xunIndex = Math.floor(pillarIdx / 10) * 10
  const starts: Record<number, [string, string]> = {
    0: ['戌', '亥'],
    10: ['申', '酉'],
    20: ['午', '未'],
    30: ['辰', '巳'],
    40: ['寅', '卯'],
    50: ['子', '丑'],
  }
  const pair = starts[xunIndex]
  return pair ? [pair[0], pair[1]] : []
}

function getYuePo(monthBuildZhi: string): string {
  return getZhi(zhiIndex(monthBuildZhi) + 6)
}

function getLineLabel(position: number): string {
  const labels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']
  return labels[position - 1] ?? `${position}爻`
}

function buildHexagramLines(
  hexagram: LiuyaoCeziHexagram,
  movingLine: number,
  time: LiuyaoCeziTimeInfo,
  tiTrigram: LiuyaoCeziTrigram,
  yongTrigram: LiuyaoCeziTrigram,
): LiuyaoCeziLine[] {
  const lowerLines = TRIGRAM_LINES[hexagram.lower.name]!
  const upperLines = TRIGRAM_LINES[hexagram.upper.name]!
  const allLines = [...lowerLines, ...upperLines]
  const tiCenter = tiTrigram === hexagram.lower ? 2 : 5
  const yingCenter = yongTrigram === hexagram.lower ? 2 : 5

  const xunKong = getXunKongBranches(time.dayPillar)
  const yuePo = getYuePo(time.monthBuild)
  const dayStem = time.dayPillar.slice(0, 1)
  const liuShenStart = LIU_SHEN_START[dayStem] ?? 0

  const lines: LiuyaoCeziLine[] = []
  for (let pos = 1; pos <= 6; pos++) {
    const isUpper = pos > 3
    const trigramName = isUpper ? hexagram.upper.name : hexagram.lower.name
    const localPos = isUpper ? pos - 4 : pos - 1
    const stemBranch = isUpper
      ? NA_JIA_UPPER[trigramName]![localPos]!
      : NA_JIA_LOWER[trigramName]![localPos]!
    const gan = stemBranch.slice(0, 1)
    const zhi = stemBranch.slice(1, 2)
    const yin = !allLines[pos - 1]

    lines.push({
      position: pos,
      label: getLineLabel(pos),
      yin,
      stemBranch,
      gan,
      zhi,
      liuQin: getLiuQin(gan, tiTrigram.wuxing),
      liuShen: LIU_SHEN[normalizeIndex(liuShenStart + pos - 1, 6)]!,
      wuxing: ganWuxing(gan),
      state: getLineState(gan, time.monthBuild),
      isMoving: pos === movingLine,
      isXunKong: xunKong.includes(zhi),
      isYuePo: zhi === yuePo,
      isShi: pos === tiCenter,
      isYing: pos === yingCenter,
    })
  }
  return lines
}

function deriveHexagram(strokes: number, hourNumber: number): { hexagram: LiuyaoCeziHexagram; formulas: { upper: string; lower: string; moving: string } } {
  const upperNumber = strokes % 8 === 0 ? 8 : strokes % 8
  const lowerNumber = (strokes + hourNumber) % 8 === 0 ? 8 : (strokes + hourNumber) % 8
  const movingLine = (strokes + hourNumber) % 6 === 0 ? 6 : (strokes + hourNumber) % 6

  const upper = getTrigramByNumber(upperNumber)
  const lower = getTrigramByNumber(lowerNumber)
  const key = `${upper.name}${lower.name}`

  return {
    hexagram: {
      upper,
      lower,
      name: HEXAGRAM_NAMES[key] || key,
      symbol: `${upper.symbol}${lower.symbol}`,
      movingLine,
    },
    formulas: {
      upper: `${strokes} ÷ 8 余 ${upperNumber} → ${upper.name}（${upper.nature}）`,
      lower: `(${strokes} + ${hourNumber}) ÷ 8 余 ${lowerNumber} → ${lower.name}（${lower.nature}）`,
      moving: `(${strokes} + ${hourNumber}) ÷ 6 余 ${movingLine} → 第 ${movingLine} 爻动`,
    },
  }
}

export async function calculateLiuyaoCezi(payload: LiuyaoCeziRequest): Promise<LiuyaoCeziResult> {
  const char = payload.char?.trim() || ''
  const question = payload.question?.trim() || ''

  if (!char) {
    throw createError({ statusCode: 400, statusMessage: '请输入汉字' })
  }
  if (!isChineseChar(char)) {
    throw createError({ statusCode: 400, statusMessage: '只能输入一个汉字' })
  }
  if (!question) {
    throw createError({ statusCode: 400, statusMessage: '请填写所问事项' })
  }

  let strokeMap: Record<string, number>
  try {
    strokeMap = await getStrokeCountsWithAIFallback([char])
  } catch (e: any) {
    if (e.statusCode === 400) throw e
    throw createError({ statusCode: 500, statusMessage: `笔画查询失败：${e?.message ?? e}` })
  }

  const strokes = strokeMap[char]
  if (strokes === undefined) {
    throw createError({ statusCode: 400, statusMessage: `该字笔画数暂未收录，请换字：${char}` })
  }

  const date = payload.datetime ? new Date(payload.datetime) : new Date()
  const time = buildTimeInfo(date)

  const { hexagram, formulas } = deriveHexagram(strokes, time.lunar.hourIndex)

  // 体用：有动爻之卦为用，无动爻之卦为体
  const movingInUpper = hexagram.movingLine >= 4
  const tiTrigram = movingInUpper ? hexagram.lower : hexagram.upper
  const yongTrigram = movingInUpper ? hexagram.upper : hexagram.lower

  const lines = buildHexagramLines(hexagram, hexagram.movingLine, time, tiTrigram, yongTrigram)

  return {
    input: {
      char,
      question,
      datetime: date.toISOString(),
    },
    analysis: {
      char,
      strokes,
      estimated: false,
    },
    time,
    derivation: {
      strokes,
      hourNumber: time.lunar.hourIndex,
      upperFormula: formulas.upper,
      lowerFormula: formulas.lower,
      movingLineFormula: formulas.moving,
    },
    hexagram,
    body: {
      tiTrigram,
      yongTrigram,
      tiWuxing: tiTrigram.wuxing,
    },
    lines,
  }
}
