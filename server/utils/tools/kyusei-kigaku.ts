import { Solar } from 'lunar-javascript'
import type { DiZhi } from '~/types/user'
import type {
  KyuseiAffinity,
  KyuseiBoard,
  KyuseiBoardKey,
  KyuseiDirectionKey,
  KyuseiPaipanInput,
  KyuseiPaipanResult,
  KyuseiRelationKey,
  KyuseiSignal,
  KyuseiSignalKey,
  KyuseiStarMeta,
} from '~~/app/types/kyusei-kigaku'

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
const JIE_TERMS = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'] as const
const DIRECTIONS = ['north', 'southeast', 'east', 'south', 'north', 'northwest', 'west', 'northeast', 'south'] as const
const DIRECTION_BY_PALACE: Record<number, KyuseiDirectionKey | 'center'> = {
  1: 'north', 2: 'southwest', 3: 'east', 4: 'southeast', 5: 'center',
  6: 'northwest', 7: 'west', 8: 'northeast', 9: 'south',
}
const ELEMENTS = ['water', 'earth', 'wood', 'wood', 'earth', 'metal', 'metal', 'earth', 'fire'] as const
const GENERATES: Record<string, string> = { water: 'wood', wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water' }
const OVERCOMES: Record<string, string> = { water: 'fire', fire: 'metal', metal: 'wood', wood: 'earth', earth: 'water' }
const CENTER_INCLINATION: Record<number, number> = { 1: 9, 2: 6, 3: 4, 4: 3, 6: 2, 7: 8, 8: 7, 9: 1 }
const ENGINE = 'lunar-javascript 1.7.0 + timezone-aware solar terms'

const createError = (input: { statusCode: number, statusMessage: string }) =>
  Object.assign(new Error(input.statusMessage), input)

export interface KyuseiCalendar {
  solarYear: number
  solarMonthIndex: number
  boundaryInstant: Date
}

function localFields(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(date)
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value ?? '0')
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour') % 24,
    minute: value('minute'),
    second: value('second'),
  }
}

function zoneOffsetMinutes(date: Date, timeZone: string) {
  const fields = localFields(date, timeZone)
  const asUtc = Date.UTC(fields.year, fields.month - 1, fields.day, fields.hour, fields.minute, fields.second)
  return Math.round((asUtc - date.getTime()) / 60000)
}

function parseBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createError({ statusCode: 400, statusMessage: 'Birth date must use YYYY-MM-DD' })
  }
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day || year < 1900 || year > 2100) {
    throw createError({ statusCode: 400, statusMessage: 'Birth year must be between 1900 and 2100' })
  }
  return { year: year!, month: month!, day: day! }
}

function solarDateToDate(solar: any) {
  // lunar-javascript stores term instants in Beijing civil time; construct the UTC instant first.
  return new Date(Date.UTC(
    solar.getYear(), solar.getMonth() - 1, solar.getDay(),
    solar.getHour(), solar.getMinute(), solar.getSecond(),
  ) - 480 * 60000)
}

function findTerm(birth: Date, timeZone: string, birthDate: { year: number, month: number, day: number, hour: number, minute: number }) {
  const lunar = Solar.fromYmdHms(
    birthDate.year, birthDate.month, birthDate.day, birthDate.hour, birthDate.minute, 0,
  ).getLunar()
  const table = lunar.getJieQiTable()
  const terms = JIE_TERMS.flatMap((name) => {
    const solar = table[name]
    return solar ? [{ name, instant: solarDateToDate(solar) }] : []
  })
    .sort((a, b) => a.instant.getTime() - b.instant.getTime())

  let selected = terms[0]!
  for (const term of terms) {
    if (term.instant.getTime() <= birth.getTime()) selected = term
  }
  if (!selected) throw createError({ statusCode: 422, statusMessage: 'Unable to resolve solar term' })

  const next = terms.find(term => term.instant.getTime() > birth.getTime())
  const monthIndex = JIE_TERMS.indexOf(selected.name)
  if (monthIndex < 0) throw createError({ statusCode: 422, statusMessage: 'Unknown solar term' })
  const localBirth = localFields(birth, timeZone)
  const solarYear = monthIndex === 11 ? localBirth.year - 1 : localBirth.year
  return { term: selected, next, monthIndex, solarYear }
}

export function yearStarOf(year: number) {
  return (((9 - ((year - 1) % 9)) % 9) + 1 + 9) % 9 || 9
}

function monthStarOf(year: number, monthIndex: number) {
  const yearBranch = ((year - 4) % 12 + 12) % 12
  const base = yearBranch % 3 === 0 ? 8 : yearBranch % 3 === 1 ? 5 : 2
  return ((base - monthIndex - 1) % 9 + 9) % 9 + 1
}

function palaceOf(star: number, centerStar: number) {
  return ((star - centerStar + 4) % 9 + 9) % 9 + 1
}

function oppositePalace(palace: number) {
  if (palace === 5) return 5
  return palace <= 4 ? palace + 4 : palace - 4
}

function starMeta(star: number): KyuseiStarMeta {
  return {
    star,
    element: ELEMENTS[star - 1]!,
    direction: DIRECTIONS[star - 1]!,
  }
}

function buildStars(centerStar: number) {
  return Array.from({ length: 9 }, (_, index) => {
    const star = index + 1
    const palace = palaceOf(star, centerStar)
    return {
      palace,
      direction: DIRECTION_BY_PALACE[palace] as KyuseiDirectionKey,
      star,
    }
  })
}

function branchDirection(branchIndex: number): KyuseiDirectionKey {
  const palace = [1, 8, 8, 3, 4, 4, 9, 2, 2, 7, 6, 6][branchIndex]!
  return DIRECTION_BY_PALACE[palace] as KyuseiDirectionKey
}

function signalOf(board: KyuseiBoardKey, key: KyuseiSignalKey, palace: number): KyuseiSignal {
  return {
    key,
    board,
    palace,
    direction: DIRECTION_BY_PALACE[palace]!,
  }
}

function boardSignals(key: KyuseiBoardKey, centerStar: number, yearBranchIndex: number, monthBranchIndex: number, natalYearStar: number): KyuseiSignal[] {
  const stars = buildStars(centerStar)
  const palaceByStar = new Map(stars.map(item => [item.star, item.palace]))
  const fiveYellow = palaceByStar.get(5)!
  const signals: KyuseiSignal[] = [
    signalOf(key, 'fiveYellow', fiveYellow),
    signalOf(key, 'darkSword', oppositePalace(fiveYellow)),
    signalOf(key, 'honmeiKill', palaceByStar.get(natalYearStar)!),
    signalOf(key, 'honmeiTargetKill', oppositePalace(palaceByStar.get(natalYearStar)!)),
  ]

  const breakerPalace = (branchIndex: number) => {
    const direction = branchDirection(branchIndex)
    return stars.find(item => item.direction === direction)!.palace
  }
  const yearPalace = breakerPalace(yearBranchIndex)
  const monthPalace = breakerPalace(monthBranchIndex)
  if (!signals.some(item => item.palace === yearPalace && item.key === 'fiveYellow')) {
    signals.push(signalOf(key, 'yearBreaker', yearPalace))
  }
  if (!signals.some(item => item.palace === monthPalace && ['fiveYellow', 'yearBreaker'].includes(item.key))) {
    signals.push(signalOf(key, 'monthBreaker', monthPalace))
  }
  return signals
}

function elementRelation(firstElement: string, secondElement: string): KyuseiRelationKey {
  if (firstElement === secondElement) return 'sameElement'
  if (GENERATES[firstElement] === secondElement) return 'nourishes'
  if (GENERATES[secondElement] === firstElement) return 'drains'
  if (OVERCOMES[firstElement] === secondElement) return 'controls'
  return 'controlledBy'
}

function relationScore(relation: KyuseiRelationKey) {
  if (relation === 'sameElement' || relation === 'nourishes') return 2
  if (relation === 'drains') return 0
  return -1
}

function buildAffinities(star: number): KyuseiAffinity[] {
  const element = ELEMENTS[star - 1]!
  return Array.from({ length: 9 }, (_, index) => index + 1)
    .filter(item => item !== star)
    .map(item => ({
      star: item,
      relation: elementRelation(element, ELEMENTS[item - 1]!),
      score: relationScore(elementRelation(element, ELEMENTS[item - 1]!)),
    }))
}

export function calculateKyuseiPaipan(input: KyuseiPaipanInput): KyuseiPaipanResult {
  const birthDate = parseBirthDate(input.birthDate)
  const location = input.location ?? null
  const timezone = location?.timezone || 'Asia/Shanghai'
  const HOUR_MIDPOINT: Record<DiZhi, number> = {
    子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
    午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
  }
  const birth = new Date(Date.UTC(
    birthDate.year, birthDate.month - 1, birthDate.day,
    HOUR_MIDPOINT[input.birthHour], 0, 0,
  ) - zoneOffsetMinutes(new Date(Date.UTC(
    birthDate.year, birthDate.month - 1, birthDate.day, 12, 0, 0,
  )), timezone) * 60000)

  const term = findTerm(birth, timezone, {
    ...birthDate,
    hour: HOUR_MIDPOINT[input.birthHour],
    minute: 0,
  })
  const natalYearStar = yearStarOf(term.solarYear)
  const natalMonthStar = monthStarOf(term.solarYear, term.monthIndex)

  const local = localFields(birth, timezone)
  const dayLunar = Solar.fromYmdHms(local.year, local.month, local.day, 12, 0, 0).getLunar()
  const dayStar = dayLunar.getDayNineStar().getIndex() + 1
  const dayBranchIndex = BRANCHES.indexOf(dayLunar.getDayZhi() as (typeof BRANCHES)[number])
  const hourBranchIndex = BRANCHES.indexOf(input.birthHour)
  const hourBase = [1, 4, 7][dayBranchIndex % 3]!
  const hourStar = ((hourBase - hourBranchIndex - 1) % 9 + 9) % 9 + 1

  const yearBranchIndex = ((term.solarYear - 4) % 12 + 12) % 12
  const monthBranchIndex = (2 + term.monthIndex) % 12
  const boardCenters: Array<[KyuseiBoardKey, number]> = [
    ['year', natalYearStar],
    ['month', natalMonthStar],
    ['day', dayStar],
    ['hour', hourStar],
  ]
  const boards: KyuseiBoard[] = boardCenters.map(([key, centerStar]) => ({
    key,
    centerStar,
    stars: buildStars(centerStar),
    signals: boardSignals(key, centerStar, yearBranchIndex, monthBranchIndex, natalYearStar),
  }))

  const rawPalace = palaceOf(natalMonthStar, natalYearStar)
  const centerAdjusted = rawPalace === 5
  const inclinedPalace = centerAdjusted ? CENTER_INCLINATION[natalYearStar]! : rawPalace
  const primaryRelation = elementRelation(ELEMENTS[natalYearStar - 1]!, ELEMENTS[natalMonthStar - 1]!)

  return {
    basic: {
      birthDate: input.birthDate,
      birthHour: input.birthHour,
      gender: input.gender,
      solarYear: term.solarYear,
      solarMonthIndex: term.monthIndex,
      boundaryInstant: term.term.instant.toISOString(),
      timezone,
      locationName: location?.name || 'default',
    },
    natal: {
      yearStar: starMeta(natalYearStar),
      monthStar: starMeta(natalMonthStar),
      dayStar: starMeta(dayStar),
      hourStar: starMeta(hourStar),
      inclinedPalace: {
        palace: inclinedPalace,
        direction: DIRECTION_BY_PALACE[inclinedPalace] as KyuseiDirectionKey,
        centerAdjusted,
      },
    },
    boards,
    compatibility: {
      primary: primaryRelation,
      score: relationScore(primaryRelation),
      affinities: buildAffinities(natalYearStar),
    },
    methodology: {
      engine: ENGINE,
      yearBoundary: 'exact solar-term Risshun',
      monthBoundary: 'exact Jie-term month boundary',
      hourRule: 'day-branch group sets the Rat hour at 1/4/7, then descends',
      disclaimer: 'traditional cultural reference, not deterministic advice',
    },
    generatedAt: new Date().toISOString(),
  }
}

export type { KyuseiPaipanInput, KyuseiPaipanResult }
