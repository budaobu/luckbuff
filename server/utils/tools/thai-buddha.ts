import { Body, Observer, SearchRiseSet } from 'astronomy-engine'

export type ThaiBuddhaDayKey =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday-day'
  | 'wednesday-night'
  | 'thursday'
  | 'friday'
  | 'saturday'

export type ThaiBuddhaPlanetKey =
  | 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter'
  | 'venus' | 'saturn' | 'rahu'

export type ThaiBuddhaHouseKey =
  | 'companion' | 'life' | 'authority' | 'fortune'
  | 'foundation' | 'effort' | 'minister' | 'kalakini'

export type ThaiBuddhaDirectionKey =
  | 'northeast' | 'east' | 'southeast' | 'south'
  | 'southwest' | 'west' | 'northwest' | 'north'

export type ThaiBuddhaColorKey =
  | 'red' | 'yellow' | 'pink' | 'green' | 'dark-green' | 'orange'
  | 'light-blue' | 'purple' | 'black' | 'white' | 'blue'

export interface ThaiBuddhaLocation {
  name: string
  latitude: number
  longitude: number
  timezone: string
}

export interface ThaiBuddhaInput {
  birthDate: string
  birthTime: string
  birthTimezone: string
  location?: ThaiBuddhaLocation | null
}

export interface ThaiBuddhaResult {
  input: {
    birthDate: string
    birthTime: string
    timezone: string
    location: ThaiBuddhaLocation | null
    locationResolved: boolean
  }
  day: {
    calendarWeekdayIndex: number
    calendarWeekdayKey: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
    astroDate: string
    astroWeekdayIndex: number
    key: ThaiBuddhaDayKey
    thai: string
    english: string
    planet: ThaiBuddhaPlanetKey
  }
  sunEvents: {
    sunrise: string | null
    sunset: string | null
    sunriseText: string
    sunsetText: string
  }
  buddha: {
    key: ThaiBuddhaDayKey
    thai: string
    english: string
    chinese: string
    posture: string
    symbols: string[]
  }
  colors: {
    dayColor: ThaiBuddhaColorKey
    luckyColor: ThaiBuddhaColorKey
    unluckyColor: ThaiBuddhaColorKey
    luckyDay: string
    unluckyDay: string
  }
  mahaTaksa: {
    houseOrder: ThaiBuddhaHouseKey[]
    wheelOrder: ThaiBuddhaPlanetKey[]
    houses: Array<{
      house: ThaiBuddhaHouseKey
      planet: ThaiBuddhaPlanetKey
      direction: ThaiBuddhaDirectionKey
      letters: string[]
      letterKind: 'vowels' | 'consonants'
      favorable: boolean
    }>
    favorableHouses: Array<Exclude<ThaiBuddhaHouseKey, 'kalakini'>>
  }
  methodology: {
    engine: string
    astronomy: string
    dayBoundary: string
    wednesdaySplit: string
    calculationSource: 'observed-sun-events' | 'approximate-sun-events'
    noBirthPersistence: boolean
  }
}

const CALENDAR_WEEKDAYS = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
] as const

const WHEEL_ORDER: ThaiBuddhaPlanetKey[] = [
  'sun', 'moon', 'mars', 'mercury', 'saturn', 'jupiter', 'rahu', 'venus',
]

const HOUSE_ORDER: ThaiBuddhaHouseKey[] = [
  'companion', 'life', 'authority', 'fortune',
  'foundation', 'effort', 'minister', 'kalakini',
]

const DIRECTION_ORDER: ThaiBuddhaDirectionKey[] = [
  'northeast', 'east', 'southeast', 'south',
  'southwest', 'west', 'northwest', 'north',
]

const LETTERS: Record<ThaiBuddhaPlanetKey, { kind: 'vowels' | 'consonants', letters: string[] }> = {
  sun: { kind: 'vowels', letters: [] },
  moon: { kind: 'consonants', letters: ['ก', 'ข', 'ค', 'ฆ', 'ง'] },
  mars: { kind: 'consonants', letters: ['จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ'] },
  mercury: { kind: 'consonants', letters: ['ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ'] },
  saturn: { kind: 'consonants', letters: ['ด', 'ต', 'ถ', 'ท', 'ธ', 'น'] },
  jupiter: { kind: 'consonants', letters: ['บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม'] },
  rahu: { kind: 'consonants', letters: ['ย', 'ร', 'ล', 'ว'] },
  venus: { kind: 'consonants', letters: ['ศ', 'ษ', 'ส', 'ห', 'ฬ', 'ฮ'] },
}

const DAY_META: Record<ThaiBuddhaDayKey, {
  thai: string
  english: string
  planet: ThaiBuddhaPlanetKey
  dayColor: ThaiBuddhaColorKey
  luckyColor: ThaiBuddhaColorKey
  unluckyColor: ThaiBuddhaColorKey
  luckyDay: string
  unluckyDay: string
}> = {
  sunday: {
    thai: 'วันอาทิตย์', english: 'Sunday', planet: 'sun', dayColor: 'red',
    luckyColor: 'green', unluckyColor: 'blue', luckyDay: 'wednesday-day', unluckyDay: 'friday',
  },
  monday: {
    thai: 'วันจันทร์', english: 'Monday', planet: 'moon', dayColor: 'yellow',
    luckyColor: 'black', unluckyColor: 'orange', luckyDay: 'saturday', unluckyDay: 'sunday',
  },
  tuesday: {
    thai: 'วันอังคาร', english: 'Tuesday', planet: 'mars', dayColor: 'pink',
    luckyColor: 'yellow', unluckyColor: 'white', luckyDay: 'thursday', unluckyDay: 'monday',
  },
  'wednesday-day': {
    thai: 'วันพุธกลางวัน', english: 'Wednesday day', planet: 'mercury', dayColor: 'green',
    luckyColor: 'green', unluckyColor: 'pink', luckyDay: 'wednesday-night', unluckyDay: 'tuesday',
  },
  'wednesday-night': {
    thai: 'วันพุธกลางคืน', english: 'Wednesday night', planet: 'rahu', dayColor: 'dark-green',
    luckyColor: 'white', unluckyColor: 'yellow', luckyDay: 'monday', unluckyDay: 'thursday',
  },
  thursday: {
    thai: 'วันพฤหัสบดี', english: 'Thursday', planet: 'jupiter', dayColor: 'orange',
    luckyColor: 'orange', unluckyColor: 'black', luckyDay: 'sunday', unluckyDay: 'saturday',
  },
  friday: {
    thai: 'วันศุกร์', english: 'Friday', planet: 'venus', dayColor: 'light-blue',
    luckyColor: 'pink', unluckyColor: 'dark-green', luckyDay: 'tuesday', unluckyDay: 'wednesday-night',
  },
  saturday: {
    thai: 'วันเสาร์', english: 'Saturday', planet: 'saturn', dayColor: 'purple',
    luckyColor: 'blue', unluckyColor: 'green', luckyDay: 'friday', unluckyDay: 'wednesday-day',
  },
}

const BUDDHA_META: Record<ThaiBuddhaDayKey, {
  thai: string
  english: string
  chinese: string
  posture: string
  symbols: string[]
}> = {
  sunday: {
    thai: 'ปางถวายเนตร', english: 'Offering eyes', chinese: '供眼佛',
    posture: 'Standing, arms crossed at the waist', symbols: ['gratitude', 'steadfast gaze'],
  },
  monday: {
    thai: 'ปางห้ามญาติ', english: 'Forbidding relatives', chinese: '止亲佛',
    posture: 'Standing, right hand raised palm outward', symbols: ['reassurance', 'reconciliation'],
  },
  tuesday: {
    thai: 'ปางไสยาสน์', english: 'Reclining', chinese: '卧佛',
    posture: 'Reclining on the right side', symbols: ['calm authority', 'detachment'],
  },
  'wednesday-day': {
    thai: 'ปางอุ้มบาตร', english: 'Holding the alms bowl', chinese: '托钵佛',
    posture: 'Standing with an alms bowl', symbols: ['generosity', 'merit'],
  },
  'wednesday-night': {
    thai: 'ปางป่าเลไลยก์', english: 'Retreat in the forest', chinese: '森林隐修佛',
    posture: 'Seated in the forest with elephant and monkey', symbols: ['solitude', 'inner peace'],
  },
  thursday: {
    thai: 'ปางสมาธิ', english: 'Meditation', chinese: '禅定佛',
    posture: 'Seated meditation, hands resting in the lap', symbols: ['stillness', 'wisdom'],
  },
  friday: {
    thai: 'ปางรำพึง', english: 'Contemplation', chinese: '沉思佛',
    posture: 'Standing, arms crossed on the chest', symbols: ['reflection', 'compassion'],
  },
  saturday: {
    thai: 'ปางนาคปรก', english: 'Sheltered by the Naga', chinese: '那伽护佛',
    posture: 'Meditating under the Naga canopy', symbols: ['protection', 'resilience'],
  },
}

const DAY_PROFILE: Record<ThaiBuddhaDayKey, { personality: string, professions: string[] }> = {
  sunday: {
    personality: 'Respectable, wise, carefree and well liked by family and friends',
    professions: ['manager', 'official', 'doctor', 'craftsman', 'trader'],
  },
  monday: {
    personality: 'Thoughtful, serious, good memory and fond of travel',
    professions: ['doctor', 'nurse', 'fisherman'],
  },
  tuesday: {
    personality: 'Brave, active, determined and broad minded',
    professions: ['police officer', 'soldier', 'chemist', 'cook', 'hairdresser'],
  },
  'wednesday-day': {
    personality: 'Ambitious, sociable, expressive and creative',
    professions: ['banker', 'singer', 'musician', 'artist', 'designer'],
  },
  'wednesday-night': {
    personality: 'Hardworking, diligent, calm and honest',
    professions: ['writer', 'poet', 'doctor', 'scientist', 'actor', 'archaeologist'],
  },
  thursday: {
    personality: 'Kind, graceful, tranquil and fair minded',
    professions: ['judge', 'lawyer', 'teacher', 'clergy member'],
  },
  friday: {
    personality: 'Ambitious, sociable, fun loving and expressive',
    professions: ['banker', 'singer', 'musician', 'artist', 'designer'],
  },
  saturday: {
    personality: 'Logical, tranquil, reserved and methodical',
    professions: ['agriculturist', 'constructor', 'miner', 'bailiff'],
  },
}

function validateTimezone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date())
    return timeZone
  }
  catch {
    throw new Error('无效时区')
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

function createLocalInstant(date: string, time: string, timeZone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('出生日期无效')
  if (!/^\d{2}:\d{2}$/.test(time)) throw new Error('出生时间无效')
  validateTimezone(timeZone)

  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new Error('出生日期或时间无效')
  }

  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute)
  const firstOffset = zoneOffsetMinutes(new Date(naiveUtc), timeZone)
  const firstInstant = new Date(naiveUtc - firstOffset * 60000)
  const secondOffset = zoneOffsetMinutes(firstInstant, timeZone)
  const instant = secondOffset === firstOffset
    ? firstInstant
    : new Date(naiveUtc - secondOffset * 60000)

  const actual = zonedParts(instant, timeZone)
  if (actual.year !== year || actual.month !== month || actual.day !== day
    || actual.hour !== hour || actual.minute !== minute) {
    throw new Error('出生时间在该时区不存在或跨夏令时边界')
  }
  return instant
}

function localDayStart(date: string, timeZone: string) {
  return createLocalInstant(date, '00:00', timeZone)
}

function addUtcDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number)
  const next = new Date(Date.UTC(year!, month! - 1, day!))
  next.setUTCDate(next.getUTCDate() + days)
  return next.toISOString().slice(0, 10)
}

function formatZoned(value: Date | null, timeZone: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value)
}

function findSunEvent(date: string, timeZone: string, latitude: number, longitude: number, isRise: boolean) {
  const start = localDayStart(date, timeZone)
  const event = SearchRiseSet(Body.Sun, new Observer(latitude, longitude, 0), isRise ? 1 : -1, start, 1)
  return event?.date ?? null
}

export function calculateThaiBuddha(input: ThaiBuddhaInput): ThaiBuddhaResult {
  const timezone = validateTimezone(input.location?.timezone || input.birthTimezone)
  const birthInstant = createLocalInstant(input.birthDate, input.birthTime, timezone)
  const locationResolved = !!input.location

  const sunrise = locationResolved
    ? findSunEvent(input.birthDate, timezone, input.location!.latitude, input.location!.longitude, true)
    : null
  const sunset = locationResolved
    ? findSunEvent(input.birthDate, timezone, input.location!.latitude, input.location!.longitude, false)
    : null

  const sunriseBoundary = sunrise ?? createLocalInstant(input.birthDate, '06:00', timezone)
  const sunsetBoundary = sunset ?? createLocalInstant(input.birthDate, '18:00', timezone)

  const astroDate = birthInstant < sunriseBoundary
    ? addUtcDays(input.birthDate, -1)
    : input.birthDate
  const astroWeekdayIndex = new Date(`${astroDate}T00:00:00Z`).getUTCDay()
  const calendarWeekdayIndex = new Date(`${input.birthDate}T00:00:00Z`).getUTCDay()
  const calendarWeekday = CALENDAR_WEEKDAYS[calendarWeekdayIndex]!
  const astroWeekday = CALENDAR_WEEKDAYS[astroWeekdayIndex]!

  let dayKey: ThaiBuddhaDayKey = astroWeekday === 'wednesday' ? 'wednesday-day' : astroWeekday
  if (dayKey === 'wednesday-day' && birthInstant >= sunsetBoundary) {
    dayKey = 'wednesday-night'
  }

  const meta = DAY_META[dayKey]
  const birthPlanetIndex = WHEEL_ORDER.indexOf(meta.planet)
  const houses = HOUSE_ORDER.map((house, index) => {
    const offset = (birthPlanetIndex + index) % WHEEL_ORDER.length
    const planet = WHEEL_ORDER[offset]!
    return {
      house,
      planet,
      direction: DIRECTION_ORDER[offset]!,
      letters: LETTERS[planet]!.letters,
      letterKind: LETTERS[planet]!.kind,
      favorable: house !== 'kalakini',
    }
  })

  return {
    input: {
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      timezone,
      location: input.location ?? null,
      locationResolved,
    },
    day: {
      calendarWeekdayIndex,
      calendarWeekdayKey: calendarWeekday,
      astroDate,
      astroWeekdayIndex,
      key: dayKey,
      thai: meta.thai,
      english: meta.english,
      planet: meta.planet,
    },
    sunEvents: {
      sunrise: sunrise?.toISOString() ?? null,
      sunset: sunset?.toISOString() ?? null,
      sunriseText: formatZoned(sunrise, timezone),
      sunsetText: formatZoned(sunset, timezone),
    },
    buddha: {
      key: dayKey,
      thai: BUDDHA_META[dayKey]!.thai,
      english: BUDDHA_META[dayKey]!.english,
      chinese: BUDDHA_META[dayKey]!.chinese,
      posture: BUDDHA_META[dayKey]!.posture,
      symbols: BUDDHA_META[dayKey]!.symbols,
    },
    colors: {
      dayColor: meta.dayColor,
      luckyColor: meta.luckyColor,
      unluckyColor: meta.unluckyColor,
      luckyDay: meta.luckyDay,
      unluckyDay: meta.unluckyDay,
    },
    mahaTaksa: {
      houseOrder: [...HOUSE_ORDER],
      wheelOrder: [...WHEEL_ORDER],
      houses,
      favorableHouses: ['authority', 'fortune', 'foundation'],
    },
    methodology: {
      engine: 'ososn Thai Buddha Days 1.0',
      astronomy: locationResolved
        ? 'astronomy-engine local sunrise/sunset'
        : 'no birthplace: 06:00/18:00 approximations',
      dayBoundary: locationResolved ? 'astro day begins at local sunrise' : 'astro day approximated at 06:00',
      wednesdaySplit: locationResolved ? 'Wednesday splits at local sunset' : 'Wednesday split approximated at 18:00',
      calculationSource: locationResolved ? 'observed-sun-events' : 'approximate-sun-events',
      noBirthPersistence: true,
    },
  }
}

export function isValidThaiBuddhaResult(value: unknown): value is ThaiBuddhaResult {
  const result = value as ThaiBuddhaResult
  return !!result?.day?.key
    && DAY_META[result.day.key] !== undefined
    && Array.isArray(result.mahaTaksa?.houses)
    && result.mahaTaksa.houses.length === 8
    && typeof result.buddha?.thai === 'string'
}

export function compactThaiBuddhaContext(result: ThaiBuddhaResult) {
  const profile = DAY_PROFILE[result.day.key]
  const houses = result.mahaTaksa.houses
    .map(item => `${item.house}=${item.planet}/${item.direction}${item.favorable ? '' : ' [avoid for names]'}`)
    .join(', ')

  return [
    `Birth: ${result.input.birthDate} ${result.input.birthTime} ${result.input.timezone}; location resolved=${result.input.locationResolved}`,
    `Sun events: sunrise=${result.sunEvents.sunriseText}, sunset=${result.sunEvents.sunsetText}; rule=${result.methodology.dayBoundary}; ${result.methodology.wednesdaySplit}`,
    `Calendar weekday: ${result.day.calendarWeekdayKey}; Thai astro day: ${result.day.english} / ${result.day.thai}; planet=${result.day.planet}`,
    `Buddha: ${result.buddha.english} / ${result.buddha.thai}; posture=${result.buddha.posture}; symbols=${result.buddha.symbols.join(', ')}`,
    `Traditional profile: ${profile.personality}; professions=${profile.professions.join(', ')}`,
    `Colors: day=${result.colors.dayColor}, lucky=${result.colors.luckyColor}, avoid=${result.colors.unluckyColor}; lucky day=${result.colors.luckyDay}; avoid day=${result.colors.unluckyDay}`,
    `Maha Taksa: ${houses}`,
    `Methodology: ${result.methodology.engine}; ${result.methodology.astronomy}; no birth persistence=${result.methodology.noBirthPersistence}`,
  ].join('\n')
}
