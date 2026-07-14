/**
 * 新生儿起名核心引擎
 * 组合候选字 → 五格校验 → 八字喜用匹配 → 音律/字形/谐音/风格打分 → 输出推荐列表
 */

import { calcPillars } from '~/utils/bazi/pillars'
import { calcWuxingScore, calcRiZhuStrength, calcXiYongJiShen, calcGeJu } from '~/utils/bazi/analysisCalc'
import type { BaziChart, WuxingScore } from '~/types/bazi'
import { calcWuge } from '../wuge/calc'
import { getFortune81 } from '../wuge/fortune81'
import { getStrokeCount } from '../wuge/strokes'
import { NAMING_CHAR_POOL, type NamingChar, type Wuxing, type GenderLean } from './chars'
import { TABOO_WORDS, RISKY_SINGLE_CHARS } from './taboo'

export type NameGender = 'male' | 'female' | 'neutral'
export type NameLength = 1 | 2 // 名字字数（不含姓）

export interface BabyInfo {
  surname: string
  gender: NameGender
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number | null // 0-23，null 表示未知
  nameLength: NameLength
  generationChar?: string // 辈分字（可选）
  likedChars?: string[] // 喜欢的字
  avoidedChars?: string[] // 避讳的字
  stylePreference?: Partial<Record<StyleKey, number>> // 0-100
  filters?: {
    avoidRare?: boolean
    avoidPolyphone?: boolean
    avoidBadHomophone?: boolean
    limitStrokes?: boolean
  }
}

export type StyleKey = 'classical' | 'warm' | 'grand' | 'poetic' | 'modern' | 'natural'

export const STYLE_KEYS: StyleKey[] = ['classical', 'warm', 'grand', 'poetic', 'modern', 'natural']

export const STYLE_LABELS: Record<StyleKey, string> = {
  classical: '古典文雅',
  warm: '温润平和',
  grand: '明朗大气',
  poetic: '诗词典故',
  modern: '现代简约',
  natural: '自然灵动',
}

export interface WuxingBoost {
  element: Wuxing
  matched: boolean
}

export interface NameScoreBreakdown {
  baziWuxing: { score: number; max: number; label: string }
  phonetics: { score: number; max: number; label: string }
  structure: { score: number; max: number; label: string }
  meaning: { score: number; max: number; label: string }
  tabooRisk: { score: number; max: number; label: string }
  styleMatch: { score: number; max: number; label: string }
}

export interface NameCandidate {
  fullName: string
  givenName: string
  chars: { char: string; pinyin: string; wuxing: Wuxing; meaning: string; source: string; structure: string; simplifiedStrokes: number; traditionalStrokes: number }[]
  pinyin: string
  score: number
  scoreGrade: string
  wuxingBoost: WuxingBoost[]
  meaningSummary: string
  sourceSummary: string
  homophoneRisk: '低' | '极低' | '中' | '高'
  homophoneNotes: string[]
  phoneticNotes: string[]
  structureNotes: string[]
  wuge: {
    tiange: number
    renge: number
    dige: number
    waige: number
    zongge: number
    tiangeFortune: string
    rengeFortune: string
    digeFortune: string
    waigeFortune: string
    zonggeFortune: string
    overallLuck: string
  }
  breakdown: NameScoreBreakdown
  comparisonRows: { label: string; value: string; score: number; max: number }[]
}

export interface NamingResult {
  chart: {
    pillars: { year: string; month: string; day: string; hour: string | null }
    riZhu: string
    riZhuStrength: string
    wuxingScore: WuxingScore
    xiyong: string
    jishen: string
    geju: string
    baziBrief: string
  }
  xiyongElements: Wuxing[]
  jishenElements: Wuxing[]
  totalCandidates: number
  names: NameCandidate[]
  topName: NameCandidate | null
}

// ---------- 内部工具 ----------

function pinyinTone(p: string): number {
  if (/[āēīōūǖ]/.test(p)) return 1
  if (/[áéíóúǘ]/.test(p)) return 2
  if (/[ǎěǐǒǔǚ]/.test(p)) return 3
  if (/[àèìòùǜ]/.test(p)) return 4
  return 0
}

function stripTone(p: string): string {
  return p
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'ü')
}

function wugeFortuneRank(fortune: string): number {
  if (fortune.includes('大吉')) return 4
  if (fortune.includes('吉')) return 3
  if (fortune.includes('半吉') || fortune.includes('平')) return 2
  return 1
}

function wugeOverallLuck(grids: string[]): string {
  const ranks = grids.map(wugeFortuneRank)
  const badCount = ranks.filter(r => r === 1).length
  const goodCount = ranks.filter(r => r >= 3).length
  if (badCount === 0 && goodCount >= 4) return '上吉'
  if (badCount === 0 && goodCount >= 3) return '吉'
  if (badCount <= 1 && goodCount >= 3) return '中吉'
  if (badCount <= 1) return '平'
  return '需谨慎'
}

function gradeFromScore(score: number): string {
  if (score >= 92) return '极佳'
  if (score >= 85) return '优秀'
  if (score >= 75) return '良好'
  if (score >= 65) return '中等'
  return '一般'
}

// ---------- 五行补益 ----------

function parseXiYong(xiyong: string): Wuxing[] {
  return xiyong.split(/[、,，]/).map(s => s.trim()).filter((s): s is Wuxing =>
    ['木', '火', '土', '金', '水'].includes(s),
  )
}

function wuxingSheng(a: Wuxing, b: Wuxing): boolean {
  const map: Record<Wuxing, Wuxing> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
  return map[a] === b
}

// ---------- 音律分析 ----------

function analyzePhonetics(surnamePinyin: string, givenPinyins: string[]): { score: number; notes: string[] } {
  const tones = [pinyinTone(surnamePinyin), ...givenPinyins.map(pinyinTone)]
  const notes: string[] = []
  let score = 100

  // 声调重复过多扣分
  const uniqueTones = new Set(tones).size
  if (tones.length === 3 && uniqueTones === 1) {
    score -= 35
    notes.push('三字同调，读起来单调')
  } else if (tones.length === 3 && uniqueTones === 2) {
    if (tones[0] === tones[1]) {
      score -= 10
      notes.push('前两字同调，略显平淡')
    } else if (tones[1] === tones[2]) {
      score -= 15
      notes.push('后两字同调，收尾不够响亮')
    } else {
      notes.push('声调有起伏，读起来顺口')
    }
  } else if (tones.length === 2) {
    if (uniqueTones === 1) {
      score -= 15
      notes.push('双字同调，音调略平')
    } else {
      notes.push('声调错落，朗朗上口')
    }
  }

  // 声母相同（叠声）扣分
  const initials = [surnamePinyin, ...givenPinyins].map(p => {
    const s = stripTone(p).toLowerCase()
    if (/^(zh|ch|sh|zhi|chi|shi)/.test(s)) return s.slice(0, 2)
    return s[0] ?? ''
  })
  if (initials.length >= 2 && initials[0] === initials[1] && initials[0] !== '') {
    score -= 12
    notes.push('姓氏与名字首字声母相同，略有拗口')
  }
  if (initials.length === 3 && initials[1] === initials[2] && initials[1] !== '') {
    score -= 8
    notes.push('名字两字声母相同，略叠')
  }

  // 韵母相同（叠韵）轻微扣分
  const vowels = [surnamePinyin, ...givenPinyins].map(p => {
    const s = stripTone(p).toLowerCase()
    const m = s.match(/^[a-z]*?(?=[aeiouü])/)
    return m ? s.slice(m[0].length) : s
  })
  if (vowels.length >= 2 && vowels[0] === vowels[1] && vowels[0] !== '') {
    score -= 10
    notes.push('姓氏与名字首字韵母相同，略叠韵')
  }

  // 去声+去声收尾偏硬，上声+去声更顺
  if (tones.length >= 2) {
    const lastTwo = tones.slice(-2)
    if (lastTwo[0] === 4 && lastTwo[1] === 4) {
      score -= 6
      notes.push('两字皆去声，收尾偏硬')
    }
    if (lastTwo[0] === 2 && lastTwo[1] === 1) {
      score += 4
      notes.push('平声收尾，余音悠扬')
    }
  }

  return { score: Math.max(40, Math.min(100, score)), notes }
}

// ---------- 字形结构分析 ----------

function analyzeStructure(surnameStructure: string, givenStructures: string[]): { score: number; notes: string[] } {
  const structures = [surnameStructure, ...givenStructures]
  const notes: string[] = []
  let score = 100

  const unique = new Set(structures).size
  if (structures.length === 3) {
    if (unique === 1) {
      score -= 20
      notes.push('三字同结构，字形略单调')
    } else if (unique === 2) {
      score -= 5
      notes.push('字形有变化，书写较美观')
    } else {
      notes.push('字形错落有致，结构协调')
    }
  } else if (structures.length === 2) {
    if (unique === 1) {
      score -= 12
      notes.push('两字同结构，略显重复')
    } else {
      notes.push('结构搭配合理')
    }
  }

  // 笔画均衡度
  const strokes = structures.map((_, i) => {
    if (i === 0) return 8 // 姓氏笔画假设值，实际由外部传入更准确
    return 8
  })
  void strokes

  return { score: Math.max(50, Math.min(100, score)), notes }
}

// ---------- 谐音/避讳检测 ----------

function checkTaboo(fullName: string, givenChars: string[]): { risk: '低' | '极低' | '中' | '高'; notes: string[] } {
  const notes: string[] = []
  let risk: '低' | '极低' | '中' | '高' = '极低'

  // 黑名单词检测
  for (const word of TABOO_WORDS) {
    if (fullName.includes(word)) {
      notes.push(`包含不雅谐音「${word}」`)
      risk = '高'
    }
  }

  // 负面单字检测
  for (const ch of givenChars) {
    if (RISKY_SINGLE_CHARS.has(ch)) {
      notes.push(`名字中含负面字「${ch}」，需谨慎`)
      if (risk !== '高') risk = '中'
    }
  }

  // 常见谐音风险启发式
  const homophoneHints: Record<string, string> = {
    死: '死', 四: '死', 史: '屎', 诗: '死/湿', 姬: '鸡', 基: '鸡',
    吴: '无', 梅: '没', 贾: '假', 范: '犯', 杜: '肚', 杨: '羊',
  }
  for (const [ch, hint] of Object.entries(homophoneHints)) {
    if (fullName.includes(ch) && risk !== '高') {
      notes.push(`「${ch}」字在部分地区可能被谐音联想，建议大声读几遍确认`)
      if (risk === '极低') risk = '低'
      break
    }
  }

  if (notes.length === 0) {
    notes.push('未发现明显不雅谐音')
  }

  return { risk, notes }
}

// ---------- 单字释义/出处提取 ----------

function buildMeaningSummary(chars: NamingChar[]): string {
  if (chars.length === 1) {
    return chars[0]!.meaning
  }
  return chars.map(c => c.meaning.split('，')[0]).join('，') + '。'
}

function buildSourceSummary(chars: NamingChar[]): string {
  const sources = [...new Set(chars.map(c => c.source).filter(Boolean))]
  return sources.length > 0 ? `典出${sources.join('、')}` : '原创组合'
}

// ---------- 候选字过滤 ----------

function isRareChar(c: NamingChar): boolean {
  // 简化判断：笔画 >18 或部首生僻视为生僻字
  return c.simplifiedStrokes > 18
}

function isPolyphone(char: string): boolean {
  // 常见多音字白名单（用于提示）
  const polyphones = new Set([
    '乐', '行', '长', '重', '好', '朝', '少', '中', '大', '小', '多', '少',
    '兴', '和', '为', '得', '地', '的', '着', '了', '过', '还', '会', '说',
    '觉', '看', '听', '吃', '喝', '给', '让', '叫', '被', '把', '将', '要',
  ])
  return polyphones.has(char)
}

function filterCharPool(info: BabyInfo): NamingChar[] {
  const avoided = new Set(info.avoidedChars ?? [])
  const liked = new Set(info.likedChars ?? [])
  const filters = info.filters ?? {}

  return NAMING_CHAR_POOL.filter(c => {
    if (avoided.has(c.char)) return false
    if (filters.avoidRare && isRareChar(c)) return false
    if (filters.avoidPolyphone && isPolyphone(c.char)) return false
    if (filters.limitStrokes && c.simplifiedStrokes > 15) return false
    // 性别倾向：male 偏好 male/neutral；female 偏好 female/neutral
    if (info.gender === 'male' && c.gender === 'female') return false
    if (info.gender === 'female' && c.gender === 'male') return false
    return true
  }).sort((a, b) => {
    // 喜欢的字优先
    const aLiked = liked.has(a.char) ? 1 : 0
    const bLiked = liked.has(b.char) ? 1 : 0
    return bLiked - aLiked
  })
}

// ---------- 评分主逻辑 ----------

function scoreName(
  info: BabyInfo,
  surnameEntry: NamingChar,
  givenEntries: NamingChar[],
  xiyongElements: Wuxing[],
  jishenElements: Wuxing[],
): NameCandidate {
  const fullName = info.surname + givenEntries.map(c => c.char).join('')
  const givenName = givenEntries.map(c => c.char).join('')
  const pinyin = [surnameEntry.pinyin, ...givenEntries.map(c => c.pinyin)].join(' ')

  // 1. 八字五行补益 (25分)
  const wuxingBoost: WuxingBoost[] = []
  const givenWuxings = givenEntries.map(c => c.wuxing)
  let baziScore = 10 // 基础分

  for (const el of xiyongElements) {
    const matched = givenWuxings.includes(el)
    wuxingBoost.push({ element: el, matched })
    if (matched) baziScore += 8
  }

  // 相生加分：名字内五行相生
  if (givenWuxings.length === 2 && wuxingSheng(givenWuxings[0]!, givenWuxings[1]!)) {
    baziScore += 5
  }

  // 忌神减分
  const jishenHit = givenWuxings.some(w => jishenElements.includes(w))
  if (jishenHit) baziScore -= 10

  baziScore = Math.max(0, Math.min(25, baziScore))
  const baziLabel = baziScore >= 20 ? '五行高度契合喜用' : baziScore >= 12 ? '五行基本补益' : '五行补益一般'

  // 2. 音律 (20分)
  const phonetics = analyzePhonetics(surnameEntry.pinyin, givenEntries.map(c => c.pinyin))
  const phoneticScore = Math.round(phonetics.score / 100 * 20)
  const phoneticLabel = phonetics.score >= 85 ? '音律优美' : phonetics.score >= 70 ? '读音顺畅' : '读音尚可'

  // 3. 字形结构 (15分)
  const structure = analyzeStructure(surnameEntry.structure, givenEntries.map(c => c.structure))
  const structureScore = Math.round(structure.score / 100 * 15)
  const structureLabel = structure.score >= 85 ? '字形协调' : structure.score >= 70 ? '结构合理' : '字形一般'

  // 4. 寓意内涵 (20分)
  // 出处经典 + 含义积极 + 风格匹配
  const hasClassicSource = givenEntries.some(c => /诗经|论语|楚辞|周易|老子|庄子|史记|说文|文选|礼记|尔雅/.test(c.source))
  let meaningScore = 12
  if (hasClassicSource) meaningScore += 4
  if (givenEntries.every(c => /吉|祥|瑞|福|安|康|宁|乐|悦|喜|荣|华|贵|富|美|好|善|德|慧|智|明|亮|光|辉|耀|盛|昌|兴|隆|旺|达|通|顺|利|成|功|伟|俊|英|豪|杰|才|学|文|雅|清|洁|纯|真|善|良|温|柔|和|平|静|怡|悦|欣|欢|笑|春|夏|秋|冬|山|水|云|月|星|辰|风|雨|雪|花|草|木|林|森|江|河|湖|海|天|地|日|月|星|空|宇|宙|乾|坤|震|巽|坎|离|艮|兑/.test(c.meaning))) {
    meaningScore += 4
  }
  meaningScore = Math.min(20, meaningScore)
  const meaningLabel = meaningScore >= 17 ? '寓意深远' : meaningScore >= 13 ? '寓意美好' : '寓意平稳'

  // 5. 避讳风险 (10分)
  const taboo = checkTaboo(fullName, givenEntries.map(c => c.char))
  const tabooScore = taboo.risk === '高' ? 0 : taboo.risk === '中' ? 4 : taboo.risk === '低' ? 7 : 10
  const tabooLabel = taboo.risk === '极低' ? '风险极低' : taboo.risk === '低' ? '风险低' : taboo.risk === '中' ? '风险中' : '风险高'

  // 6. 风格匹配 (10分)
  const stylePref = info.stylePreference ?? {}
  const styleKeys = Object.keys(stylePref) as StyleKey[]
  let styleScore = 6
  if (styleKeys.length > 0) {
    let matchSum = 0
    let weightSum = 0
    for (const key of styleKeys) {
      const weight = stylePref[key] ?? 50
      const matched = givenEntries.some(c => c.styles.includes(key))
      matchSum += weight * (matched ? 1 : 0.3)
      weightSum += weight
    }
    styleScore = weightSum > 0 ? Math.round((matchSum / weightSum) * 10) : 6
  } else {
    // 无偏好时，古典/温润默认加分
    const hasDefault = givenEntries.some(c => c.styles.includes('classical') || c.styles.includes('warm'))
    styleScore = hasDefault ? 8 : 6
  }
  styleScore = Math.max(0, Math.min(10, styleScore))
  const styleLabel = styleScore >= 8 ? '风格高度匹配' : styleScore >= 5 ? '风格基本匹配' : '风格匹配一般'

  const breakdown: NameScoreBreakdown = {
    baziWuxing: { score: baziScore, max: 25, label: baziLabel },
    phonetics: { score: phoneticScore, max: 20, label: phoneticLabel },
    structure: { score: structureScore, max: 15, label: structureLabel },
    meaning: { score: meaningScore, max: 20, label: meaningLabel },
    tabooRisk: { score: tabooScore, max: 10, label: tabooLabel },
    styleMatch: { score: styleScore, max: 10, label: styleLabel },
  }

  const totalScore = baziScore + phoneticScore + structureScore + meaningScore + tabooScore + styleScore

  // 五格
  const wugeCalc = calcWuge(fullName)
  let wuge: NameCandidate['wuge']
  if (wugeCalc.result) {
    const g = wugeCalc.result.grids
    const fortunes = [g.tiange.fortune.fortune, g.renge.fortune.fortune, g.dige.fortune.fortune, g.waige.fortune.fortune, g.zongge.fortune.fortune]
    wuge = {
      tiange: g.tiange.value,
      renge: g.renge.value,
      dige: g.dige.value,
      waige: g.waige.value,
      zongge: g.zongge.value,
      tiangeFortune: g.tiange.fortune.fortune,
      rengeFortune: g.renge.fortune.fortune,
      digeFortune: g.dige.fortune.fortune,
      waigeFortune: g.waige.fortune.fortune,
      zonggeFortune: g.zongge.fortune.fortune,
      overallLuck: wugeOverallLuck(fortunes),
    }
  } else {
    // 静态笔画表未收录该字：用字库内各字 traditionalStrokes 手算五格
    const surnameChar = fullName.slice(0, info.surname.length)
    const manual = manualWuge(surnameChar, givenEntries)
    if (manual) {
      wuge = manual
    } else {
      wuge = {
        tiange: 0, renge: 0, dige: 0, waige: 0, zongge: 0,
        tiangeFortune: '-', rengeFortune: '-', digeFortune: '-', waigeFortune: '-', zonggeFortune: '-',
        overallLuck: '-',
      }
    }
  }

  const comparisonRows: NameCandidate['comparisonRows'] = [
    { label: '八字五行', value: baziLabel, score: baziScore, max: 25 },
    { label: '音律音调', value: phoneticLabel, score: phoneticScore, max: 20 },
    { label: '字形结构', value: structureLabel, score: structureScore, max: 15 },
    { label: '寓意内涵', value: meaningLabel, score: meaningScore, max: 20 },
    { label: '避讳风险', value: tabooLabel, score: tabooScore, max: 10 },
    { label: '风格匹配', value: styleLabel, score: styleScore, max: 10 },
  ]

  return {
    fullName,
    givenName,
    chars: givenEntries.map(c => ({
      char: c.char,
      pinyin: c.pinyin,
      wuxing: c.wuxing,
      meaning: c.meaning,
      source: c.source,
      structure: c.structure,
      simplifiedStrokes: c.simplifiedStrokes,
      traditionalStrokes: c.traditionalStrokes,
    })),
    pinyin,
    score: totalScore,
    scoreGrade: gradeFromScore(totalScore),
    wuxingBoost,
    meaningSummary: buildMeaningSummary(givenEntries),
    sourceSummary: buildSourceSummary(givenEntries),
    homophoneRisk: taboo.risk,
    homophoneNotes: taboo.notes,
    phoneticNotes: phonetics.notes,
    structureNotes: structure.notes,
    wuge,
    breakdown,
    comparisonRows,
  }
}

// ---------- 手动五格（静态表未命中时的兜底） ----------

const COMPOUND_SURNAMES = new Set([
  '欧阳', '太史', '端木', '上官', '司马', '东方', '独孤', '南宫', '诸葛', '尉迟',
  '公孙', '慕容', '司徒', '司空', '令狐', '钟离', '宇文', '长孙', '鲜于',
])

function manualWuge(surname: string, givenEntries: NamingChar[]): NameCandidate['wuge'] | null {
  // 单姓笔画从静态表读（常用姓都已收录），名字笔画用字库 traditionalStrokes
  const surnameStrokes = getStrokeCount(surname)
  if (surnameStrokes === null) return null
  const givenStrokes = givenEntries.map(c => c.traditionalStrokes)
  const totalStrokes = surnameStrokes + givenStrokes.reduce((a, b) => a + b, 0)

  const tiange = surname.length === 1 ? surnameStrokes + 1 : surnameStrokes
  const renge = surnameStrokes + givenStrokes[0]!
  const dige = givenEntries.length === 1 ? givenStrokes[0]! + 1 : givenStrokes.reduce((a, b) => a + b, 0)
  const zongge = totalStrokes
  const waige = zongge - renge + 1

  const fortunes = [tiange, renge, dige, waige, zongge].map(v => getFortune81(v).fortune)
  return {
    tiange,
    renge,
    dige,
    waige,
    zongge,
    tiangeFortune: fortunes[0]!,
    rengeFortune: fortunes[1]!,
    digeFortune: fortunes[2]!,
    waigeFortune: fortunes[3]!,
    zonggeFortune: fortunes[4]!,
    overallLuck: wugeOverallLuck(fortunes),
  }
}

// ---------- 辈分字定位 ----------
function placeGenerationChar(given: NamingChar[], generationChar: string, pool: NamingChar[]): NamingChar[] {
  if (!generationChar) return given
  const genEntry = pool.find(c => c.char === generationChar)
  if (!genEntry) return given

  // 双字名：辈分字默认放首字
  if (given.length === 2) {
    if (given[0]!.char === generationChar) return given
    if (given[1]!.char === generationChar) {
      // 已在次字，交换到首字
      return [given[1]!, given[0]!]
    }
    // 组合不含辈分字：替换首字
    return [genEntry, given[1]!]
  }
  return given
}

// ---------- 主入口 ----------

export function generateBabyNames(info: BabyInfo): NamingResult {
  // 排八字
  const genderForCalc = info.gender === 'female' ? 'female' : 'male'
  const pillars = calcPillars(info.birthYear, info.birthMonth, info.birthDay, info.birthHour, genderForCalc)

  const chartPartial: BaziChart = {
    year: pillars.year,
    month: pillars.month,
    day: pillars.day,
    hour: pillars.hour,
    riZhu: pillars.riZhu,
    riZhuStrength: '身弱',
    wuxingScore: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
    geju: '',
    xiyong: '',
    jishen: '',
    dayuns: [],
    qiyunAge: 0,
    currentAge: new Date().getFullYear() - info.birthYear,
    currentDaYun: null,
  }

  const wuxingScore = calcWuxingScore(chartPartial)
  const riZhuStrength = calcRiZhuStrength(pillars.riZhu, pillars.month.zhi, wuxingScore)
  chartPartial.wuxingScore = wuxingScore
  chartPartial.riZhuStrength = riZhuStrength

  const { xiyong, jishen } = calcXiYongJiShen(pillars.riZhu, riZhuStrength, wuxingScore)
  chartPartial.xiyong = xiyong
  chartPartial.jishen = jishen
  chartPartial.geju = calcGeJu(chartPartial)

  const xiyongElements = parseXiYong(xiyong)
  const jishenElements = parseXiYong(jishen)

  // 八字简析
  const riWx = (() => {
    const ganWxMap: Record<string, Wuxing> = {
      甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
    }
    return ganWxMap[pillars.riZhu] ?? '土'
  })()
  const strongWuxing = (Object.entries(wuxingScore) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k)
  const weakWuxing = (Object.entries(wuxingScore) as [string, number][])
    .sort((a, b) => a[1] - b[1])
    .slice(0, 1)
    .map(([k]) => k)

  const baziBrief = `日主为${pillars.riZhu}${riWx}，生于${pillars.month.zhi}月，${riZhuStrength}。五行中${strongWuxing.join('、')}较旺，${weakWuxing.join('、')}稍弱。喜用神为${xiyong}，忌${jishen}。名字宜补益${xiyong}属性，以平衡命局。`

  // 过滤候选字
  let pool = filterCharPool(info)

  // 确保喜用五行有足够的字
  const xiyongPool = pool.filter(c => xiyongElements.includes(c.wuxing))
  const otherPool = pool.filter(c => !xiyongElements.includes(c.wuxing) && !jishenElements.includes(c.wuxing))

  // 如果喜用字太少，放宽过滤
  if (xiyongPool.length < 6) {
    const relaxed = NAMING_CHAR_POOL.filter(c => {
      const avoided = new Set(info.avoidedChars ?? [])
      if (avoided.has(c.char)) return false
      if (info.gender === 'male' && c.gender === 'female') return false
      if (info.gender === 'female' && c.gender === 'male') return false
      return xiyongElements.includes(c.wuxing)
    })
    const existing = new Set(pool.map(c => c.char))
    for (const c of relaxed) {
      if (!existing.has(c.char)) {
        pool.push(c)
        xiyongPool.push(c)
      }
    }
  }

  // 姓氏五行入口
  const surnameEntry: NamingChar = {
    char: info.surname,
    wuxing: '土', // 默认，实际用字库查
    pinyin: 'xìng', // 占位，下面替换
    simplifiedStrokes: 8,
    traditionalStrokes: 8,
    radical: '',
    structure: '独体',
    gender: 'neutral',
    styles: [],
    meaning: '',
    source: '',
  }

  const surnameFromPool = NAMING_CHAR_POOL.find(c => c.char === info.surname)
  if (surnameFromPool) {
    surnameEntry.wuxing = surnameFromPool.wuxing
    surnameEntry.pinyin = surnameFromPool.pinyin
    surnameEntry.structure = surnameFromPool.structure
    surnameEntry.simplifiedStrokes = surnameFromPool.simplifiedStrokes
    surnameEntry.traditionalStrokes = surnameFromPool.traditionalStrokes
  } else {
    // 姓氏不在字库：用 cnchar 兜底拼音/笔画，五行默认土
    surnameEntry.pinyin = info.surname
    surnameEntry.wuxing = '土'
  }

  // 生成组合
  const candidates: NameCandidate[] = []
  const liked = new Set(info.likedChars ?? [])
  const genChar = info.generationChar?.trim() ?? ''

  if (info.nameLength === 1) {
    // 单字名
    for (const c of pool) {
      if (genChar && c.char !== genChar && liked.has(genChar)) continue
      const given = placeGenerationChar([c], genChar, pool)
      const candidate = scoreName(info, surnameEntry, given, xiyongElements, jishenElements)
      candidates.push(candidate)
    }
  } else {
    // 双字名：从喜用池 + 其他池组合
    const firstPool = xiyongPool.length > 0 ? xiyongPool : pool
    const secondPool = pool

    for (const c1 of firstPool) {
      for (const c2 of secondPool) {
        if (c1.char === c2.char) continue
        let given: NamingChar[] = [c1, c2]

        // 辈分字强制放入
        if (genChar) {
          if (c1.char !== genChar && c2.char !== genChar) {
            // 组合不含辈分字：只有喜用池里的字才允许"替换首字"扩展，
            // 且要求第二字也来自喜用池，避免随机普通字拉低质量
            if (!liked.has(genChar)) {
              if (!xiyongElements.includes(c1.wuxing) || !xiyongElements.includes(c2.wuxing)) continue
            }
          }
          given = placeGenerationChar(given, genChar, pool)
        }

        // 两字相同（如「若若」）不作为候选
        if (given.length === 2 && given[0]!.char === given[1]!.char) continue

        const candidate = scoreName(info, surnameEntry, given, xiyongElements, jishenElements)
        candidates.push(candidate)
      }
    }
  }

  // 去重（同 fullName）
  const seen = new Set<string>()
  const unique = candidates.filter(c => {
    if (seen.has(c.fullName)) return false
    seen.add(c.fullName)
    return true
  })

  // 排序：综合分 → 五格整体吉凶 → 总格吉凶（同分时更吉者靠前）
  const luckRank: Record<string, number> = { 上吉: 5, 吉: 4, 中吉: 3, 平: 2, 需谨慎: 1, '-': 0 }
  unique.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const luckDiff = (luckRank[b.wuge.overallLuck] ?? 0) - (luckRank[a.wuge.overallLuck] ?? 0)
    if (luckDiff !== 0) return luckDiff
    return wugeFortuneRank(b.wuge.zonggeFortune) - wugeFortuneRank(a.wuge.zonggeFortune)
  })

  // 取前 N 个（默认 24 个，3 页 x 8 个）
  const topNames = unique.slice(0, 24)

  return {
    chart: {
      pillars: {
        year: `${pillars.year.gan}${pillars.year.zhi}`,
        month: `${pillars.month.gan}${pillars.month.zhi}`,
        day: `${pillars.day.gan}${pillars.day.zhi}`,
        hour: pillars.hour ? `${pillars.hour.gan}${pillars.hour.zhi}` : null,
      },
      riZhu: pillars.riZhu,
      riZhuStrength,
      wuxingScore,
      xiyong,
      jishen,
      geju: chartPartial.geju,
      baziBrief,
    },
    xiyongElements,
    jishenElements,
    totalCandidates: unique.length,
    names: topNames,
    topName: topNames[0] ?? null,
  }
}
