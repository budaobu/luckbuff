import { toLunar } from 'lunar'
import { getStrokeCount } from '../wuge/strokes'
import { CHAR_DATA, RADICALS } from '../cezi-zhouyi/calc'
import type {
  CeziYishuCharAnalysis,
  CeziYishuHexagram,
  CeziYishuRequest,
  CeziYishuResult,
  CeziYishuTimeInfo,
  CeziYishuTrigram,
} from '~/types/cezi-yishu'

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 先天八卦序：乾1 兑2 离3 震4 巽5 坎6 艮7 坤8
const TRIGRAMS: CeziYishuTrigram[] = [
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

function normalizeIndex(n: number, mod: number): number {
  return ((n % mod) + mod) % mod
}

function getGan(index: number): string {
  return TIAN_GAN[normalizeIndex(index, 10)]!
}

function getZhi(index: number): string {
  return DI_ZHI[normalizeIndex(index, 12)]!
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
  const firstMonthStemIndex = TIAN_GAN.indexOf(getFirstMonthStem(yearStem))
  const monthStemIndex = normalizeIndex(firstMonthStemIndex + monthBranchIndex - 2, 10)
  return { gan: getGan(monthStemIndex), zhi: getZhi(monthBranchIndex) }
}

function getHourBranchIndex(date: Date): number {
  const h = date.getHours()
  return Math.floor(((h + 1) % 24) / 2)
}

function getTrigramByNumber(n: number): CeziYishuTrigram {
  const idx = normalizeIndex(n - 1, 8)
  return TRIGRAMS[idx]!
}

function isChineseChar(char: string): boolean {
  if (!char || char.length !== 1) return false
  const cp = char.codePointAt(0) || 0
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
}

function analyzeCharacter(char: string): CeziYishuCharAnalysis {
  const data = CHAR_DATA[char]
  const strokes = getStrokeCount(char)
  if (data && strokes !== null) {
    return {
      char,
      pinyin: data.pinyin,
      strokes,
      radical: data.radical,
      components: data.components,
      wuxing: data.wuxing,
      structure: data.structure,
      meaning: data.meaning,
      estimated: false,
    }
  }

  if (data) {
    return {
      char,
      pinyin: data.pinyin,
      strokes: data.strokes,
      radical: data.radical,
      components: data.components,
      wuxing: data.wuxing,
      structure: data.structure,
      meaning: data.meaning,
      estimated: false,
    }
  }

  if (strokes !== null) {
    let radical = '未知'
    let radicalWuxing = '土'
    for (const [r, info] of Object.entries(RADICALS)) {
      if (char.includes(r)) {
        radical = info.name
        radicalWuxing = info.wuxing
        break
      }
    }
    return {
      char,
      pinyin: '（待查）',
      strokes,
      radical,
      components: [char],
      wuxing: radicalWuxing,
      structure: '未知',
      meaning: '《梅花易数》以象取义，可结合所问之事观其形、音、义以断吉凶。',
      estimated: false,
    }
  }

  // 完全无数据时的估计
  let radical = '未知'
  let radicalWuxing = '土'
  for (const [r, info] of Object.entries(RADICALS)) {
    if (char.includes(r)) {
      radical = info.name
      radicalWuxing = info.wuxing
      break
    }
  }
  return {
    char,
    pinyin: '（待查）',
    strokes: 8,
    radical,
    components: [char],
    wuxing: radicalWuxing,
    structure: '未知',
    meaning: '《梅花易数》以象取义，可结合所问之事观其形、音、义以断吉凶。',
    estimated: true,
  }
}

function buildTimeInfo(date: Date): CeziYishuTimeInfo {
  const { lunar } = toLunar(date)
  const yearPillar = getYearPillar(lunar.year)
  const monthPillar = getMonthPillar(yearPillar.gan, lunar.month)
  const dayPillar = getDayPillar(date)
  const hourBranchIndex = getHourBranchIndex(date)
  const hourZhi = getZhi(hourBranchIndex)

  // 年支序数：子=1, 丑=2, ... 亥=12
  const yearZhiNumber = normalizeIndex(lunar.year - 4, 12) + 1
  const hourZhiNumber = hourBranchIndex + 1

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
    },
    numbers: {
      yearZhi: yearZhiNumber,
      month: lunar.month,
      day: lunar.day,
      hourZhi: hourZhiNumber,
      sum: yearZhiNumber + lunar.month + lunar.day + hourZhiNumber,
    },
  }
}

function deriveHexagram(totalStrokes: number, time: CeziYishuTimeInfo): CeziYishuHexagram {
  const upperNumber = totalStrokes % 8 === 0 ? 8 : totalStrokes % 8
  const lowerNumber = time.numbers.sum % 8 === 0 ? 8 : time.numbers.sum % 8
  const movingLine = (totalStrokes + time.numbers.sum) % 6 === 0
    ? 6
    : (totalStrokes + time.numbers.sum) % 6

  const upper = getTrigramByNumber(upperNumber)
  const lower = getTrigramByNumber(lowerNumber)
  const key = `${upper.name}${lower.name}`

  return {
    upper,
    lower,
    name: HEXAGRAM_NAMES[key] || key,
    symbol: `${upper.symbol}${lower.symbol}`,
    movingLine,
  }
}

export function calculateCeziYishu(payload: CeziYishuRequest): CeziYishuResult {
  const chars = payload.chars?.trim() || ''
  const question = payload.question?.trim() || ''
  const external = payload.external?.trim() || ''

  if (!chars) {
    throw createError({ statusCode: 400, statusMessage: '请输入汉字' })
  }
  if (!question) {
    throw createError({ statusCode: 400, statusMessage: '请填写所问事项' })
  }
  if (!external) {
    throw createError({ statusCode: 400, statusMessage: '请填写外应' })
  }

  const charArray = Array.from(chars)
  const invalidChars = charArray.filter(c => !isChineseChar(c))
  if (invalidChars.length > 0) {
    throw createError({ statusCode: 400, statusMessage: `包含非汉字字符：${invalidChars.join('、')}` })
  }

  const date = payload.datetime ? new Date(payload.datetime) : new Date()
  const time = buildTimeInfo(date)
  const charAnalysis = charArray.map(analyzeCharacter)
  const totalStrokes = charAnalysis.reduce((sum, c) => sum + c.strokes, 0)
  const hexagram = deriveHexagram(totalStrokes, time)

  return {
    input: {
      chars,
      question,
      external,
      datetime: date.toISOString(),
    },
    analysis: {
      chars: charAnalysis,
      totalStrokes,
    },
    time,
    derivation: {
      upperFormula: `${totalStrokes} ÷ 8 余 ${hexagram.upper.index} → ${hexagram.upper.name}（${hexagram.upper.nature}）`,
      lowerFormula: `${time.numbers.yearZhi}+${time.numbers.month}+${time.numbers.day}+${time.numbers.hourZhi}=${time.numbers.sum}，${time.numbers.sum} ÷ 8 余 ${hexagram.lower.index} → ${hexagram.lower.name}（${hexagram.lower.nature}）`,
      movingLineFormula: `${totalStrokes}+${time.numbers.sum}=${totalStrokes + time.numbers.sum} ÷ 6 余 ${hexagram.movingLine} → 第 ${hexagram.movingLine} 爻动`,
    },
    hexagram,
  }
}
