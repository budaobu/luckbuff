import { randomInt } from 'node:crypto'
import { runLiuYaoEngine } from '~~/server/utils/liuyao/engine'
import { runQimenEngine } from '~~/server/utils/qimen'
import type { FootballPredictionResult, FootballSignal } from '~/types/football-prediction'

interface MatchInput {
  homeTeam: string
  awayTeam: string
  competition: string
  venue: string
  kickoff: string
  castAt: string
  timezone: string
}

function normalize(input: Omit<MatchInput, 'competition' | 'venue'> & {
  competition?: string
  venue?: string
}): MatchInput {
  return {
    homeTeam: input.homeTeam.trim(),
    awayTeam: input.awayTeam.trim(),
    competition: input.competition?.trim() || 'Football',
    venue: input.venue?.trim() || '',
    kickoff: input.kickoff,
    castAt: input.castAt,
    timezone: input.timezone || 'Asia/Shanghai',
  }
}

function stableHash(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function unit(value: string): number {
  return (stableHash(value) % 1000) / 1000
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function normalizeProbabilities(home: number, away: number): { home: number; draw: number; away: number } {
  const h = clamp(home, 15, 62)
  const a = clamp(away, 10, 55)
  const d = clamp(100 - h - a, 12, 40)
  const sum = h + a + d
  return {
    home: Number(((h / sum) * 100).toFixed(1)),
    draw: Number(((d / sum) * 100).toFixed(1)),
    away: Number(((a / sum) * 100).toFixed(1)),
  }
}

function confidenceFor(probabilities: { home: number; draw: number; away: number }): FootballPredictionResult['prediction']['confidence'] {
  const max = Math.max(probabilities.home, probabilities.draw, probabilities.away)
  if (max >= 58) return 'clear'
  if (max >= 45) return 'leaning'
  return 'balanced'
}

function outcomeFor(probabilities: { home: number; draw: number; away: number }): FootballPredictionResult['prediction']['outcome'] {
  if (probabilities.home >= probabilities.away && probabilities.home >= probabilities.draw) return 'home'
  if (probabilities.away >= probabilities.home && probabilities.away >= probabilities.draw) return 'away'
  return 'draw'
}

type ScoreCandidate = FootballPredictionResult['prediction']['primaryScore'] & { fit: number }

function scoresFor(
  probabilities: { home: number; draw: number; away: number },
  seed: string,
  outcome: FootballPredictionResult['prediction']['outcome'],
): {
  primaryScore: FootballPredictionResult['prediction']['primaryScore']
  alternateScores: FootballPredictionResult['prediction']['alternateScores']
} {
  const homeExpected = 0.35 + (probabilities.home / 100) * 2.0
  const awayExpected = 0.35 + (probabilities.away / 100) * 2.0
  const candidates: ScoreCandidate[] = []

  for (let h = 0; h <= 4; h++) {
    for (let a = 0; a <= 4; a++) {
      if (h + a > 5) continue
      const diffFit = 1 - Math.abs(h - a - (homeExpected - awayExpected)) / 4
      const totalFit = 1 - Math.abs(h + a - homeExpected - awayExpected) / 4
      const fit = diffFit * 0.65 + totalFit * 0.35
      candidates.push({ home: h, away: a, fit })
    }
  }

  candidates.sort((x, y) => y.fit - x.fit)
  const primaryIndex = stableHash(seed) % 2
  const consistent = candidates.filter((candidate) => {
    if (outcome === 'home') return candidate.home > candidate.away
    if (outcome === 'away') return candidate.away > candidate.home
    return candidate.home === candidate.away
  })
  const primary = consistent[primaryIndex] || consistent[0] || candidates[0] || { home: 1, away: 1 }
  const alternateScores = candidates
    .filter(candidate => candidate.home !== primary.home || candidate.away !== primary.away)
    .slice(0, 2)
    .map(({ home, away }) => ({ home, away }))

  return {
    primaryScore: { home: primary.home, away: primary.away },
    alternateScores,
  }
}

function buildPrediction(homeScore: number, awayScore: number, seed: string) {
  const probabilities = normalizeProbabilities(
    36 + homeScore * 0.9 + unit(`${seed}|home`) * 6,
    34 - awayScore * 0.9 + unit(`${seed}|away`) * 6,
  )
  const outcome = outcomeFor(probabilities)

  return {
    outcome,
    probabilities,
    ...scoresFor(probabilities, seed, outcome),
    confidence: confidenceFor(probabilities),
  }
}

function castLocation(timezone: string) {
  const offsetHours = Number(new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'shortOffset' })
    .format(new Date())
    .match(/GMT([+-]\d+(?::\d+)?)/)?.[1]?.split(':')[0] || 8)

  return {
    city: timezone,
    longitude: offsetHours * 15,
    latitude: 30,
    timezone,
  }
}

export async function createLiuyaoFootballPrediction(input: MatchInput): Promise<FootballPredictionResult> {
  const normalized = normalize(input)
  const lineValues = Array.from({ length: 6 }, () => randomInt(6, 10))
  const engine = await runLiuYaoEngine({
    line_values: lineValues,
    cast_datetime: normalized.castAt,
    location: castLocation(normalized.timezone),
  })

  if (engine.status !== 'ok') {
    throw new Error(engine.message || 'Liuyao engine failed')
  }

  const rawLines = Array.isArray(engine.lines) ? engine.lines : []
  const detailTopDown = [...rawLines].reverse()
  const shiLine = detailTopDown.find(line => line?.shi) || detailTopDown.find(line => line?.role === '世')
  const yingLine = detailTopDown.find(line => line?.ying) || detailTopDown.find(line => line?.role === '应')
  const shiScore = Number(shiLine?.temporal?.score ?? 0)
  const yingScore = Number(yingLine?.temporal?.score ?? 0)
  const movingCount = engine.moving_lines?.length || lineValues.filter(value => value === 6 || value === 9).length
  const chartEdge = clamp((shiScore - yingScore) * 3 + (movingCount % 2 === 1 ? 2 : -1), -12, 12)
  const seed = `${normalized.homeTeam}|${normalized.awayTeam}|${normalized.kickoff}|${lineValues.join('')}`
  const lunar = engine.temporal_context?.lunar || {}

  const signals: FootballSignal[] = [
    {
      key: 'shi',
      value: [shiLine?.relation, shiLine?.six_spirit, shiScore > 0 ? `+${shiScore}` : String(shiScore)].filter(Boolean).join(' · '),
    },
    {
      key: 'ying',
      value: [yingLine?.relation, yingLine?.six_spirit, yingScore > 0 ? `+${yingScore}` : String(yingScore)].filter(Boolean).join(' · '),
    },
    { key: 'moving', value: String(movingCount) },
  ]

  return {
    method: 'liuyao',
    match: normalized,
    prediction: buildPrediction(chartEdge, -chartEdge, seed),
    signals,
    liuyao: {
      primary: engine.primary_hexagram?.name || '',
      transformed: engine.transformed_hexagram?.name || '',
      nuclear: engine.nuclear_hexagram?.name || '',
      monthBuild: lunar.month_build || '',
      dayGanzhi: lunar.day_ganzhi || '',
      timeGanzhi: lunar.time_ganzhi || '',
      void: lunar.day_xunkong_text || '',
      lines: [...lineValues].reverse().map(value => ({ value, moving: value === 6 || value === 9 })),
    },
    generatedAt: new Date().toISOString(),
  }
}

interface QimenPalace {
  palace: number
  earth_stem: string
  sky_stem: string | null
  star: string
  door: string | null
  god: string | null
}

function palaceScore(palace: QimenPalace | undefined, voidPalaces: number[]): number {
  if (!palace) return 0
  let score = 0
  if (['开门', '生门'].includes(palace.door || '')) score += 4
  else if (['休门', '景门'].includes(palace.door || '')) score += 2
  else if (['伤门', '惊门'].includes(palace.door || '')) score -= 2
  else if (palace.door === '死门') score -= 4

  if (['天心', '天辅', '天禽'].includes(palace.star)) score += 2
  if (['天蓬', '天芮'].includes(palace.star)) score -= 2
  if (palace.god === '值符') score += 2
  if (['白虎', '玄武'].includes(palace.god || '')) score -= 1
  if (voidPalaces.includes(palace.palace)) score -= 2
  return score
}

function findStemPalace(palaces: QimenPalace[], stem: string): QimenPalace | undefined {
  return palaces.find(palace => palace.earth_stem === stem)
    || palaces.find(palace => palace.sky_stem === stem)
}

const XUNSHOU_HIDDEN_STEM: Record<string, string> = {
  '甲子': '戊',
  '甲戌': '己',
  '甲申': '庚',
  '甲午': '辛',
  '甲辰': '壬',
  '甲寅': '癸',
}

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const STEM_ELEMENT = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']
const BRANCH_ELEMENT = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水']

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value || 0)
  const hour = value('hour')
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: hour === 24 ? 0 : hour,
  }
}

function liurenYearGanzhi(year: number): string {
  return TIAN_GAN[(year - 4) % 10]! + DI_ZHI[(year - 4) % 12]!
}

function liurenMonthGanzhi(year: number, month: number): string {
  const yearGanIndex = (year - 4) % 10
  const startGan = [2, 4, 6, 8, 0][yearGanIndex % 5]!
  return TIAN_GAN[(startGan + month - 1) % 10]! + DI_ZHI[(month + 1) % 12]!
}

function liurenDayGanzhi(year: number, month: number, day: number): string {
  const date = Date.UTC(year, month - 1, day)
  const diffDays = Math.floor((date - Date.UTC(1900, 0, 31)) / 86400000)
  return TIAN_GAN[(diffDays % 10 + 10) % 10]! + DI_ZHI[(diffDays % 12 + 12) % 12]!
}

function liurenShichen(hour: number): string {
  if (hour >= 23 || hour < 1) return '子'
  return DI_ZHI[Math.floor((hour - 1) / 2) + 1]!
}

function liurenHourGanzhi(dayGan: string, hourZhi: string): string {
  const startGan = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8][TIAN_GAN.indexOf(dayGan)]!
  return TIAN_GAN[(startGan + DI_ZHI.indexOf(hourZhi)) % 10]! + hourZhi
}

function liurenYuejiang(month: number): string {
  return ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌'][month - 1]!
}

function elementRelation(source: string, target: string): number {
  const generate: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
  const control: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }
  if (source === target) return 1
  if (generate[source] === target) return 2
  if (control[source] === target) return 1.5
  if (generate[target] === source) return -1
  if (control[target] === source) return -1.5
  return 0
}

export async function createLiurenFootballPrediction(
  input: MatchInput & { birthYear: number },
): Promise<FootballPredictionResult> {
  const normalized = normalize(input)
  const chartDate = new Date(normalized.kickoff)
  const parts = zonedParts(chartDate, normalized.timezone)
  const yearGanzhi = liurenYearGanzhi(parts.year)
  const monthGanzhi = liurenMonthGanzhi(parts.year, parts.month)
  const dayGanzhi = liurenDayGanzhi(parts.year, parts.month, parts.day)
  const shichen = liurenShichen(parts.hour)
  const hourGanzhi = liurenHourGanzhi(dayGanzhi.charAt(0), shichen)
  const yuejiang = liurenYuejiang(parts.month)
  const birthYearBranch = DI_ZHI[(input.birthYear - 4) % 12]!

  const dayStem = dayGanzhi.charAt(0)
  const dayBranch = dayGanzhi.charAt(1)
  const homeState = elementRelation(STEM_ELEMENT[TIAN_GAN.indexOf(dayStem)]!, BRANCH_ELEMENT[DI_ZHI.indexOf(shichen)]!)
  const awayState = elementRelation(BRANCH_ELEMENT[DI_ZHI.indexOf(shichen)]!, BRANCH_ELEMENT[DI_ZHI.indexOf(dayBranch)]!)
  const birthRelation = elementRelation(BRANCH_ELEMENT[DI_ZHI.indexOf(birthYearBranch)]!, BRANCH_ELEMENT[DI_ZHI.indexOf(dayBranch)]!)
  const dayHourClash = Math.abs(DI_ZHI.indexOf(dayBranch) - DI_ZHI.indexOf(shichen)) === 6 ? -2 : 1
  const chartEdge = clamp((homeState * 1.5 + awayState * 0.5 + birthRelation + dayHourClash) * 1.2, -12, 12)
  const seed = `${normalized.homeTeam}|${normalized.awayTeam}|${normalized.kickoff}|${input.birthYear}|${dayGanzhi}|${hourGanzhi}`

  const signals: FootballSignal[] = [
    { key: 'homeState', value: `${dayGanzhi} · ${homeState > 0 ? `+${homeState}` : homeState}` },
    { key: 'awayState', value: `${hourGanzhi} · ${awayState > 0 ? `+${awayState}` : awayState}` },
    { key: 'birthRelation', value: `${birthYearBranch}命 · ${birthRelation > 0 ? `+${birthRelation}` : birthRelation}` },
  ]

  return {
    method: 'liuren',
    match: normalized,
    prediction: buildPrediction(chartEdge, -chartEdge, seed),
    signals,
    liuren: {
      yearGanzhi,
      monthGanzhi,
      dayGanzhi,
      hourGanzhi,
      yuejiang,
      shichen,
      birthYear: input.birthYear,
      birthYearBranch,
    },
    generatedAt: new Date().toISOString(),
  }
}

export async function createQimenFootballPrediction(input: MatchInput): Promise<FootballPredictionResult> {
  const normalized = normalize(input)
  const engine = await runQimenEngine({
    question_type: 'other',
    question_label: `${normalized.homeTeam} vs ${normalized.awayTeam}`,
    question_goals: ['can_succeed'],
    datetime: normalized.castAt,
    timezone: normalized.timezone,
    calendar_type: 'solar',
    location: { country: '', city: normalized.venue || normalized.timezone },
    output_style: 'brief',
  })

  if (engine.status !== 'ok' || !engine.chart || !engine.ganzhi) {
    throw new Error(engine.message || 'Qimen engine failed')
  }

  const palaces = (engine.chart.palaces || []) as QimenPalace[]
  const voidPalaces = engine.chart.kongwang_palaces || []
  const dayStem = engine.ganzhi.day.charAt(0)
  const dayHiddenStem = dayStem === '甲'
    ? XUNSHOU_HIDDEN_STEM[engine.ganzhi.day_xun_exact || ''] || '戊'
    : ''
  const homePalace = findStemPalace(palaces, dayHiddenStem || dayStem)
  const awayPalace = findStemPalace(palaces, engine.ganzhi.time.charAt(0))
  const homeScore = palaceScore(homePalace, voidPalaces)
  const awayScore = palaceScore(awayPalace, voidPalaces)
  const chartEdge = clamp((homeScore - awayScore) * 1.5, -12, 12)
  const seed = `${normalized.homeTeam}|${normalized.awayTeam}|${normalized.kickoff}|${engine.ganzhi.day}|${engine.ganzhi.time}`

  const keyPalace = homeScore >= awayScore ? homePalace : awayPalace
  const signals: FootballSignal[] = [
    { key: 'homePalace', value: `${dayStem}${dayHiddenStem ? `遁${dayHiddenStem}` : ''} · ${homePalace?.palace ?? '-'}宫 · ${homeScore > 0 ? `+${homeScore}` : homeScore}` },
    { key: 'awayPalace', value: `${engine.ganzhi.time.charAt(0)} · ${awayPalace?.palace ?? '-'}宫 · ${awayScore > 0 ? `+${awayScore}` : awayScore}` },
    {
      key: 'keyPalace',
      value: [keyPalace?.door, keyPalace?.star, keyPalace?.palace ? `${keyPalace.palace}宫` : ''].filter(Boolean).join(' · '),
    },
  ]

  return {
    method: 'qimen',
    match: normalized,
    prediction: buildPrediction(chartEdge, -chartEdge, seed),
    signals,
    qimen: {
      title: `${engine.chart.dun_type}${engine.chart.ju_number}局`,
      yuan: engine.chart.yuan || '',
      dayGanzhi: engine.ganzhi.day,
      timeGanzhi: engine.ganzhi.time,
      zhifu: `${engine.chart.zhifu?.star || ''}·${engine.chart.zhifu?.palace || ''}宫`,
      zhishi: `${engine.chart.zhishi?.door || ''}·${engine.chart.zhishi?.palace || ''}宫`,
      void: (engine.chart.kongwang || []).join('') || '',
    },
    generatedAt: new Date().toISOString(),
  }
}
