import {
  Observer,
  getKundli,
  getPanchangamDetails,
  type Kundli,
  type PlanetaryPosition,
} from '@prisri/jyotish'

export interface ThaiAstroLocation {
  name: string
  latitude: number
  longitude: number
  timezone: string
}

export interface ThaiAstroInput {
  birthDate: string
  birthTime: string
  gender?: 'male' | 'female' | ''
  timeUncertain?: boolean
  location: ThaiAstroLocation
}

export type ThaiBodyKey =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'ThaiKetu'
  | 'Uranus'

export type ThaiSignKey =
  | 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo'
  | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces'

export type ThaiHouseKey =
  | 'tanu' | 'katumpha' | 'sahatcha' | 'phanthu' | 'putta' | 'ari'
  | 'patni' | 'marana' | 'supha' | 'kamma' | 'lapha' | 'vinat'

export type ThaiStatusKey = 'exalted' | 'own' | 'debilitated' | 'detriment'
export type ThaiTriyangaKey = 'first' | 'second' | 'third'
export type ThaiTaksaRole =
  | 'attendant' | 'longevity' | 'power' | 'glory'
  | 'root' | 'effort' | 'minister' | 'calamity'

export interface ThaiPlanet {
  key: ThaiBodyKey
  number: number
  symbol: string
  longitude: number
  sign: number
  signKey: ThaiSignKey
  signNameTh: string
  degree: number
  minute: number
  second: number
  house: number
  houseKey: ThaiHouseKey
  nakshatraKey: string
  nakshatraTh: string
  nakshatraLordKey: string
  pada: number
  statuses: ThaiStatusKey[]
  isRetrograde: boolean
  isTanuseth: boolean
  speed: number | null
}

export interface ThaiHouse {
  number: number
  key: ThaiHouseKey
  sign: number
  signKey: ThaiSignKey
  signNameTh: string
  signLordKey: ThaiBodyKey
  occupants: ThaiBodyKey[]
}

export interface ThaiPanchang {
  tithi: string
  paksha: string
  moonNakshatra: string
  yoga: string
  karana: string
  weekday: string
  sunrise: string | null
  sunset: string | null
}

export interface ThaiAstroChartResult {
  input: {
    birthDate: string
    birthTime: string
    birthUtc: string
    gender: 'male' | 'female' | 'unknown'
    timeUncertain: boolean
    location: {
      name: string
      latitude: number
      longitude: number
      timezone: string
      utcOffsetMinutes: number
    }
  }
  methodology: {
    engine: string
    astronomy: string
    ayanamsa: string
    ayanamsha: number
    houseSystem: string
    thaiKetu: string
    noBirthPersistence: boolean
  }
  ascendant: {
    sign: number
    signKey: ThaiSignKey
    signNameTh: string
    longitude: number
    degree: number
    minute: number
    second: number
    nakshatraKey: string
    nakshatraTh: string
    nakshatraLordKey: string
    pada: number
  }
  planets: ThaiPlanet[]
  houses: ThaiHouse[]
  tanuseth: {
    bodyKey: ThaiBodyKey | null
    number: number | null
    sign: number | null
    signKey: ThaiSignKey | null
  }
  taksa: {
    dayKey: ThaiBodyKey
    nightChart: boolean
    positions: Array<{ role: ThaiTaksaRole, bodyKey: ThaiBodyKey }>
  }
  panchang: ThaiPanchang
}

const SIGN_KEYS: ThaiSignKey[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]

const SIGN_NAMES_TH = [
  'เมษ', 'พฤษภ', 'เมถุน', 'กรกฎ', 'สิงห์', 'กันย์',
  'ตุล', 'พิจิก', 'ธนู', 'มกร', 'กุมภ์', 'มีน',
]

const HOUSE_KEYS: ThaiHouseKey[] = [
  'tanu', 'katumpha', 'sahatcha', 'phanthu', 'putta', 'ari',
  'patni', 'marana', 'supha', 'kamma', 'lapha', 'vinat',
]

const BODY_ORDER: ThaiBodyKey[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter',
  'Venus', 'Saturn', 'Rahu', 'ThaiKetu', 'Uranus',
]

const BODY_META: Record<ThaiBodyKey, { number: number, symbol: string }> = {
  Sun: { number: 1, symbol: '☉' },
  Moon: { number: 2, symbol: '☾' },
  Mars: { number: 3, symbol: '♂' },
  Mercury: { number: 4, symbol: '☿' },
  Jupiter: { number: 5, symbol: '♃' },
  Venus: { number: 6, symbol: '♀' },
  Saturn: { number: 7, symbol: '♄' },
  Rahu: { number: 8, symbol: '☊' },
  ThaiKetu: { number: 9, symbol: '☋' },
  Uranus: { number: 0, symbol: '⛢' },
}

const SIGN_LORD_KEYS: ThaiBodyKey[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Jupiter',
]

// Traditional Thai Tanuseth does not use Rahu as a counting lord; Aquarius uses Saturn.
const TANUSETH_LORD_KEYS: ThaiBodyKey[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
]

const EXALTED_BY_SIGN: Partial<Record<number, number>> = {
  0: 1, 1: 2, 3: 5, 5: 4, 6: 7, 7: 8, 11: 6,
}

const DEBILITATED_BY_SIGN: Partial<Record<number, number>> = {
  0: 7, 1: 8, 3: 3, 5: 6, 6: 1, 7: 2, 11: 4,
}

const BODY_KEY_BY_NUMBER: Record<number, ThaiBodyKey> = Object.fromEntries(
  BODY_ORDER.map(key => [BODY_META[key].number, key]),
) as Record<number, ThaiBodyKey>

const NAKSHATRA_TH = [
  'อัศวินี', 'ภรณี', 'กฤติกา', 'โรหินี', 'มฤคศิระ', 'อารทรา',
  'ปุนรวสุ', 'ปุษยะ', 'อาศเลษา', 'มาฆะ', 'บุรพผลคุนี', 'อุตรผลคุนี',
  'หัสตะ', 'จิตรา', 'สวาตี', 'วิสาขะ', 'อนุราธะ', 'เชษฐา',
  'มูละ', 'บุรพษาฒ', 'อุตราษาฒ', 'ศรวณะ', 'ธนิษฐา', 'ศตภิษัช',
  'บุรพภัทรบท', 'อุตรภัทรบท', 'เรวดี',
]

const NAKSHATRA_KEYS = [
  'ashwini', 'bharani', 'krittika', 'rohini', 'mrigashira', 'ardra',
  'punarvasu', 'pushya', 'ashlesha', 'magha', 'purva_phalguni', 'uttara_phalguni',
  'hasta', 'chitra', 'swati', 'vishakha', 'anuradha', 'jyeshtha',
  'mula', 'purva_ashadha', 'uttara_ashadha', 'shravana', 'dhanishta', 'shatabhisha',
  'purva_bhadrapada', 'uttara_bhadrapada', 'revati',
]

const NAKSHATRA_LORD_KEYS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury',
]

const TAKSA_ROLES: ThaiTaksaRole[] = [
  'attendant', 'longevity', 'power', 'glory',
  'root', 'effort', 'minister', 'calamity',
]

const TAKSA_BODY_ORDER: ThaiBodyKey[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Saturn', 'Jupiter', 'Rahu', 'Venus',
]

const KETU_TH_EPOCH_JD = 2461045.2527778
const KETU_TH_PERIOD_DAYS = 679

function validateTimezone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date())
    return timeZone
  }
  catch {
    throw new Error(`无效时区：${timeZone}`)
  }
}

function zonedParts(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(instant)
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

function zoneOffsetMinutes(instant: Date, timeZone: string) {
  const parts = zonedParts(instant, timeZone)
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  return Math.round((asUtc - instant.getTime()) / 60000)
}

function createUtcInstant(date: string, time: string, timeZone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('出生日期无效')
  if (!/^\d{2}:\d{2}$/.test(time)) throw new Error('出生时间无效')

  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new Error('出生日期或时间无效')
  }

  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0)
  const firstOffset = zoneOffsetMinutes(new Date(naiveUtc), timeZone)
  const firstInstant = new Date(naiveUtc - firstOffset * 60000)
  const secondOffset = zoneOffsetMinutes(firstInstant, timeZone)
  const instant = secondOffset === firstOffset
    ? firstInstant
    : new Date(naiveUtc - secondOffset * 60000)

  const actual = zonedParts(instant, timeZone)
  if (actual.year !== year || actual.month !== month || actual.day !== day
    || actual.hour !== hour || actual.minute !== minute) {
    throw new Error('出生时间在该时区不存在或跨越夏令时边界')
  }
  return instant
}

function normalize360(value: number) {
  return ((value % 360) + 360) % 360
}

function julianDayUT(instant: Date) {
  return instant.getTime() / 86400000 + 2440587.5
}

function thaiKetuLongitude(jdUT: number) {
  const elapsed = (jdUT - KETU_TH_EPOCH_JD) % KETU_TH_PERIOD_DAYS
  return normalize360(360 - (360 * elapsed / KETU_TH_PERIOD_DAYS))
}

function splitDegrees(longitude: number) {
  const normalized = normalize360(longitude)
  const sign = Math.floor(normalized / 30) % 12
  const inSign = normalized - sign * 30
  const degree = Math.floor(inSign)
  const minuteFull = (inSign - degree) * 60
  const minute = Math.floor(minuteFull)
  const second = Math.round((minuteFull - minute) * 60)
  if (second === 60) {
    return { sign, inSign, degree, minute: minute + 1, second: 0 }
  }
  return { sign, inSign, degree, minute, second }
}

function nakshatra(longitude: number) {
  const normalized = normalize360(longitude)
  const span = 360 / 27
  const index = Math.floor(normalized / span) % 27
  const pada = Math.floor((normalized - index * span) / (span / 4)) + 1
  return {
    key: NAKSHATRA_KEYS[index]!,
    nameTh: NAKSHATRA_TH[index]!,
    lordKey: NAKSHATRA_LORD_KEYS[index % 9]!,
    pada,
  }
}

function normalizeJyotishBody(name: string): ThaiBodyKey | null {
  if (name === 'Ketu') return 'ThaiKetu'
  return BODY_ORDER.find(key => key === name) ?? null
}

function statusesFor(sign: number, bodyNumber: number): ThaiStatusKey[] {
  const statuses: ThaiStatusKey[] = []
  const bodyKey = BODY_KEY_BY_NUMBER[bodyNumber]
  if (!bodyKey) return statuses
  if (EXALTED_BY_SIGN[sign] === bodyNumber) statuses.push('exalted')
  if (DEBILITATED_BY_SIGN[sign] === bodyNumber) statuses.push('debilitated')
  if (SIGN_LORD_KEYS[sign] === bodyKey) statuses.push('own')
  if (SIGN_LORD_KEYS[(sign + 6) % 12] === bodyKey) statuses.push('detriment')
  return statuses
}

function triyanga(longitude: number) {
  const inSign = normalize360(longitude) % 30
  const segment = Math.min(2, Math.floor(inSign / 10))
  const keys: ThaiTriyangaKey[] = ['first', 'second', 'third']
  return { segment, key: keys[segment]! }
}

function navamsaSign(longitude: number) {
  const sign = Math.floor(normalize360(longitude) / 30) % 12
  const elementStart = Math.floor(sign / 3) * 3
  const segment = Math.min(8, Math.floor((normalize360(longitude) % 30) / (30 / 9)))
  return (elementStart + segment) % 12
}

function thaiWeekdayIndex(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(instant)
  const weekday = parts.find(part => part.type === 'weekday')?.value ?? 'Sun'
  const hour = Number(parts.find(part => part.type === 'hour')?.value ?? '0') % 24
  const calendarIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 5, Fri: 6, Sat: 7 }[weekday] ?? 0
  return {
    index: weekday === 'Wed' && hour >= 18 ? 4 : calendarIndex,
    nightChart: weekday === 'Wed' && hour >= 18,
    label: weekday,
  }
}

function mapStandardPlanet(name: string, position: PlanetaryPosition, ascendantSign: number): ThaiPlanet {
  const bodyKey = normalizeJyotishBody(name)
  if (!bodyKey) throw new Error(` Thai astrology does not use ${name}`)
  const split = splitDegrees(position.longitude)
  const mansion = nakshatra(position.longitude)
  return {
    key: bodyKey,
    ...BODY_META[bodyKey],
    longitude: normalize360(position.longitude),
    sign: split.sign,
    signKey: SIGN_KEYS[split.sign]!,
    signNameTh: SIGN_NAMES_TH[split.sign]!,
    degree: split.degree,
    minute: split.minute,
    second: split.second,
    house: ((split.sign - ascendantSign + 12) % 12) + 1,
    houseKey: HOUSE_KEYS[((split.sign - ascendantSign + 12) % 12)]!,
    nakshatraKey: mansion.key,
    nakshatraTh: mansion.nameTh,
    nakshatraLordKey: mansion.lordKey,
    pada: mansion.pada,
    statuses: statusesFor(split.sign, BODY_META[bodyKey].number),
    isRetrograde: position.isRetrograde,
    isTanuseth: false,
    speed: position.speed,
  }
}

function inclusiveDistance(fromSign: number, toSign: number) {
  return ((toSign - fromSign + 12) % 12) + 1
}

function computeTanuseth(planets: ThaiPlanet[], ascendantSign: number) {
  const byKey = new Map(planets.map(planet => [planet.key, planet]))
  const firstLordKey = TANUSETH_LORD_KEYS[ascendantSign]!
  const firstLord = byKey.get(firstLordKey)
  if (!firstLord) return null

  const secondLordKey = TANUSETH_LORD_KEYS[firstLord.sign]!
  const secondLord = byKey.get(secondLordKey)
  if (!secondLord) return null

  const firstStep = inclusiveDistance(ascendantSign, firstLord.sign)
  const secondStep = inclusiveDistance(firstLord.sign, secondLord.sign)
  const number = (firstStep * secondStep) % 7 || 7
  const marked = planets.find(planet => BODY_META[planet.key].number === number) ?? null

  return {
    bodyKey: marked?.key ?? null,
    number,
    sign: marked?.sign ?? null,
    signKey: marked?.signKey ?? null,
  }
}

export function calculateThaiAstroChart(input: ThaiAstroInput): ThaiAstroChartResult {
  const timezone = validateTimezone(input.location.timezone.trim())
  const instant = createUtcInstant(input.birthDate, input.birthTime, timezone)
  const observer = new Observer(input.location.latitude, input.location.longitude, 0)
  const kundli: Kundli = getKundli(instant, observer, {
    ayanamsa: 'lahiri',
    houseSystem: 'whole_sign',
  })

  const ascendantSign = kundli.ascendant.rashi - 1
  const ascendantSplit = splitDegrees(kundli.ascendant.longitude)
  const ascendantMansion = nakshatra(kundli.ascendant.longitude)

  const planets = BODY_ORDER.map((bodyKey) => {
    if (bodyKey === 'ThaiKetu') {
      const longitude = thaiKetuLongitude(julianDayUT(instant))
      const split = splitDegrees(longitude)
      const mansion = nakshatra(longitude)
      return {
        key: bodyKey,
        ...BODY_META[bodyKey],
        longitude,
        sign: split.sign,
        signKey: SIGN_KEYS[split.sign]!,
        signNameTh: SIGN_NAMES_TH[split.sign]!,
        degree: split.degree,
        minute: split.minute,
        second: split.second,
        house: ((split.sign - ascendantSign + 12) % 12) + 1,
        houseKey: HOUSE_KEYS[((split.sign - ascendantSign + 12) % 12)]!,
        nakshatraKey: mansion.key,
        nakshatraTh: mansion.nameTh,
        nakshatraLordKey: mansion.lordKey,
        pada: mansion.pada,
        statuses: statusesFor(split.sign, BODY_META[bodyKey].number),
        isRetrograde: true,
        isTanuseth: false,
        speed: -360 / KETU_TH_PERIOD_DAYS,
      }
    }

    const position = kundli.planets[bodyKey]
    if (!position) throw new Error(`星历缺少 ${bodyKey} 位置`)
    return mapStandardPlanet(bodyKey, position, ascendantSign)
  })

  const tanuseth = computeTanuseth(planets, ascendantSign)
  if (tanuseth?.bodyKey) {
    const marked = planets.find(planet => planet.key === tanuseth.bodyKey)
    if (marked) marked.isTanuseth = true
  }

  const houses: ThaiHouse[] = Array.from({ length: 12 }, (_, index) => {
    const sign = (ascendantSign + index) % 12
    const lordKey = SIGN_LORD_KEYS[sign]!
    return {
      number: index + 1,
      key: HOUSE_KEYS[index]!,
      sign: sign + 1,
      signKey: SIGN_KEYS[sign]!,
      signNameTh: SIGN_NAMES_TH[sign]!,
      signLordKey: lordKey,
      occupants: planets.filter(planet => planet.sign === sign).map(planet => planet.key),
    }
  })

  const weekday = thaiWeekdayIndex(instant, timezone)
  const taksaPositions = TAKSA_ROLES.map((role, positionIndex) => ({
    role,
    bodyKey: TAKSA_BODY_ORDER[((positionIndex - weekday.index) % 8 + 8) % 8]!,
  }))

  const offset = zoneOffsetMinutes(instant, timezone)
  const panchangRaw = getPanchangamDetails(instant, observer, { timezoneOffset: offset })

  return {
    input: {
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      birthUtc: instant.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      gender: input.gender === 'male' || input.gender === 'female' ? input.gender : 'unknown',
      timeUncertain: !!input.timeUncertain,
      location: {
        name: input.location.name,
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        timezone,
        utcOffsetMinutes: offset,
      },
    },
    methodology: {
      engine: '@prisri/jyotish 1.1.7 + Thai rule layer',
      astronomy: 'Astronomy Engine 2.1.19',
      ayanamsa: 'Lahiri / Chitrapaksha',
      ayanamsha: panchangRaw.ayanamsa,
      houseSystem: 'Whole-sign 12 Rasi',
      thaiKetu: 'Suriyayat 679-day cycle',
      noBirthPersistence: true,
    },
    ascendant: {
      sign: ascendantSign + 1,
      signKey: SIGN_KEYS[ascendantSign]!,
      signNameTh: SIGN_NAMES_TH[ascendantSign]!,
      longitude: normalize360(kundli.ascendant.longitude),
      degree: ascendantSplit.degree,
      minute: ascendantSplit.minute,
      second: ascendantSplit.second,
      nakshatraKey: ascendantMansion.key,
      nakshatraTh: ascendantMansion.nameTh,
      nakshatraLordKey: ascendantMansion.lordKey,
      pada: ascendantMansion.pada,
    },
    planets,
    houses,
    tanuseth: {
      bodyKey: tanuseth?.bodyKey ?? null,
      number: tanuseth?.number ?? null,
      sign: tanuseth?.sign ?? null,
      signKey: tanuseth?.signKey ?? null,
    },
    taksa: {
      dayKey: TAKSA_BODY_ORDER[weekday.index]!,
      nightChart: weekday.nightChart,
      positions: taksaPositions,
    },
    panchang: {
      tithi: String(panchangRaw.tithiName ?? panchangRaw.tithi ?? ''),
      paksha: String(panchangRaw.paksha ?? ''),
      moonNakshatra: String(panchangRaw.nakshatraName ?? ''),
      yoga: String(panchangRaw.yogaName ?? ''),
      karana: String(panchangRaw.karana ?? ''),
      weekday: weekday.label,
      sunrise: panchangRaw.sunrise ? new Date(panchangRaw.sunrise).toISOString() : null,
      sunset: panchangRaw.sunset ? new Date(panchangRaw.sunset).toISOString() : null,
    },
  }
}

export function buildThaiAstroContext(result: ThaiAstroChartResult) {
  return [
    `体系：泰国12星宿命盘（ราศี 12 นักษัตร）`,
    `出生：${result.input.birthDate} ${result.input.birthTime} ${result.input.location.timezone}；地点：${result.input.location.name}`,
    `ลัคนา：${result.ascendant.signNameTh} ${result.ascendant.degree}° ${result.ascendant.nakshatraTh} p${result.ascendant.pada}`,
    `ตนุเศษ：${result.tanuseth.bodyKey ?? '未知'} #${result.tanuseth.number ?? '-'}`,
    `ดาว：${result.planets.map(planet => `${planet.key}${planet.number} ${planet.signNameTh} ${planet.degree}° H${planet.house} ${planet.nakshatraTh}p${planet.pada}${planet.isRetrograde ? ' R' : ''}`).join('；')}`,
    `ภพ：${result.houses.map(house => `H${house.number}-${house.signNameTh}-${house.signLordKey}[${house.occupants.join('/') || '-'}]`).join('；')}`,
    `ทักษา：${result.taksa.dayKey}${result.taksa.nightChart ? '(night)' : ''} ${result.taksa.positions.map(item => `${item.role}:${item.bodyKey}`).join('，')}`,
    `Panchang：${result.panchang.weekday} ${result.panchang.tithi} ${result.panchang.paksha} ${result.panchang.moonNakshatra} ${result.panchang.yoga}`,
  ].join('\n')
}

export function isValidThaiAstroResult(value: unknown): value is ThaiAstroChartResult {
  const result = value as ThaiAstroChartResult
  return !!result
    && Array.isArray(result.planets)
    && result.planets.length === 10
    && Array.isArray(result.houses)
    && result.houses.length === 12
    && !!result.ascendant
    && !!result.tanuseth
    && !!result.taksa
    && !!result.panchang
}
