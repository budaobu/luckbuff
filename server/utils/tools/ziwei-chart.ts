import { astro } from 'iztro'
import { calculateBaziChart } from '@openfate/bazi-engine'
import type { DiZhi } from '~/types/user'

export type ZiweiChartGender = 'male' | 'female'

export interface ZiweiChartLocation {
  name: string
  longitude?: number
  latitude?: number
  timezone?: string
}

export interface ZiweiChartInput {
  birthDate: string
  birthTimeIndex: number
  gender: ZiweiChartGender
  location?: ZiweiChartLocation | null
  locale?: 'zh-CN' | 'zh-TW' | 'en'
}

export interface ZiweiStar {
  name: string
  type: 'major' | 'soft' | 'tough' | 'adjective' | 'flower' | 'helper' | 'lucun' | 'tianma'
  scope: 'origin' | 'decadal' | 'yearly' | 'monthly' | 'daily' | 'hourly'
  brightness: string | null
  mutagen: string | null
}

export interface ZiweiPalace {
  index: number
  name: string
  isBodyPalace: boolean
  isOriginalPalace: boolean
  heavenlyStem: string
  earthlyBranch: string
  majorStars: ZiweiStar[]
  minorStars: ZiweiStar[]
  adjectiveStars: ZiweiStar[]
  changsheng12: string
  boshi12: string
  jiangqian12: string
  suiqian12: string
  decadal: {
    startAge: number
    endAge: number
    heavenlyStem: string
    earthlyBranch: string
  }
  ages: number[]
}

export interface ZiweiHoroscopeItem {
  key: 'decadal' | 'age' | 'yearly' | 'monthly' | 'daily' | 'hourly'
  label: string
  index: number
  natalPalace: string
  heavenlyStem: string
  earthlyBranch: string
  mutagenStars: string[]
  flowingStars: Array<{ name: string; natalPalace: string }>
  nominalAge?: number
  ageRange?: [number, number]
  yearRange?: [number, number]
  isCurrent?: boolean
}

export interface ZiweiMajorLimit {
  index: number
  palaceName: string
  natalPalace: string
  ageRange: [number, number]
  yearRange: [number, number]
  heavenlyStem: string
  earthlyBranch: string
  mutagenStars: string[]
  isCurrent: boolean
}

export interface ZiweiChartResult {
  input: {
    birthDate: string
    birthTimeIndex: number
    selectedTimeText: string
    effectiveTimeText: string
    effectiveTimeIndex: number
    effectiveHour: DiZhi
    gender: ZiweiChartGender
    genderText: string
    locationName: string
    coordinates: string | null
    timezone: string
    trueSolarText: string | null
    solarTimeStatus: 'uncorrected' | 'corrected' | 'failed' | 'boundary'
    solarTimeStatusText: string
    longitudeOffsetMinutes: number
    equationOfTimeMinutes: number
    standardMeridian: number | null
    dayBoundaryChanged: boolean
  }
  summary: {
    genderText: string
    solarDate: string
    lunarDate: string
    chineseDate: string
    timeText: string
    timeRange: string
    sign: string
    zodiac: string
    soulPalace: string
    bodyPalace: string
    soulStar: string
    bodyStar: string
    fiveElementsClass: string
    soulPalaceStars: string
  }
  palaces: ZiweiPalace[]
  natalMutagens: Array<{
    mutagen: '禄' | '权' | '科' | '忌'
    star: string
    palace: string
  }>
  majorLimits: ZiweiMajorLimit[]
  currentPeriods: {
    queryDate: string
    lunarDate: string
    solarDate: string
    periods: ZiweiHoroscopeItem[]
  }
  decadeFlowYears: ZiweiMajorLimit[]
  methodology: {
    school: string
    calendar: string
    trueSolarTime: string
    leapMonth: string
    lateZi: string
    engine: string
  }
  disclaimer: string
  generatedAt: string
}

const TIME_INDEX_LABELS: Record<number, string> = {
  0: '早子时',
  1: '丑时',
  2: '寅时',
  3: '卯时',
  4: '辰时',
  5: '巳时',
  6: '午时',
  7: '未时',
  8: '申时',
  9: '酉时',
  10: '戌时',
  11: '亥时',
  12: '晚子时',
}

const TIME_RANGE_LABELS: Record<number, string> = {
  0: '00:00~01:00',
  1: '01:00~03:00',
  2: '03:00~05:00',
  3: '05:00~07:00',
  4: '07:00~09:00',
  5: '09:00~11:00',
  6: '11:00~13:00',
  7: '13:00~15:00',
  8: '15:00~17:00',
  9: '17:00~19:00',
  10: '19:00~21:00',
  11: '21:00~23:00',
  12: '23:00~24:00',
}

const BRANCH_BY_INDEX: DiZhi[] = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子',
]

const MUTAGEN_KEYS = ['禄', '权', '科', '忌'] as const
const SCOPE_KEYS = ['decadal', 'age', 'yearly', 'monthly', 'daily', 'hourly'] as const
const SCOPE_LABELS: Record<(typeof SCOPE_KEYS)[number], string> = {
  decadal: '大限',
  age: '小限',
  yearly: '流年',
  monthly: '流月',
  daily: '流日',
  hourly: '流时',
}

function timeIndexFromMinutes(minutes: number): number {
  const hour = Math.floor(minutes / 60) % 24
  return hour === 23 ? 12 : Math.floor((hour + 1) / 2)
}

function branchFromMinutes(minutes: number): DiZhi {
  return BRANCH_BY_INDEX[timeIndexFromMinutes(minutes)] ?? '子'
}

function mapStars(stars: Array<{
  name: string
  type: ZiweiStar['type']
  scope: ZiweiStar['scope']
  brightness?: string
  mutagen?: string
}>): ZiweiStar[] {
  return stars.map(star => ({
    name: star.name,
    type: star.type,
    scope: star.scope,
    brightness: star.brightness || null,
    mutagen: star.mutagen || null,
  }))
}

function parseBirthDate(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const year = Number(match?.[1])
  const month = Number(match?.[2])
  const day = Number(match?.[3])
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: '出生日期格式必须是 YYYY-MM-DD' })
  }
  if (year < 1900 || year > 2100) {
    throw createError({ statusCode: 400, statusMessage: '出生年份需在 1900-2100' })
  }
  return { year, month, day }
}

function timezoneOffsetMinutes(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  let timestamp = Date.UTC(year, month - 1, day, hour, minute)
  let offset = 0
  for (let index = 0; index < 3; index += 1) {
    const parts = formatter.formatToParts(new Date(timestamp))
    const value = (type: string) => Number(parts.find(part => part.type === type)?.value ?? 0)
    const asUtc = Date.UTC(
      value('year'),
      value('month') - 1,
      value('day'),
      value('hour'),
      value('minute'),
      value('second'),
    )
    offset = Math.round((asUtc - timestamp) / 60000)
    timestamp = Date.UTC(year, month - 1, day, hour, minute) - offset * 60000
  }
  return offset
}

export async function calculateZiweiChartResult(input: ZiweiChartInput): Promise<ZiweiChartResult> {
  const birth = parseBirthDate(input.birthDate)
  if (!Number.isInteger(input.birthTimeIndex) || input.birthTimeIndex < 0 || input.birthTimeIndex > 12) {
    throw createError({ statusCode: 400, statusMessage: '出生时辰索引必须在 0-12' })
  }

  const timezone = input.location?.timezone || 'Asia/Shanghai'
  const hasCoordinates = input.location?.longitude !== undefined && input.location?.latitude !== undefined
  if (input.location?.name && !hasCoordinates) {
    throw createError({
      statusCode: 422,
      statusMessage: '出生地点未能解析坐标；请更换地点名称或留空后按所选时辰排盘',
    })
  }
  const midpointMinutes = input.birthTimeIndex === 12 ? 1380 : input.birthTimeIndex * 120
  const midpointHour = Math.floor(midpointMinutes / 60)
  const midpointMinute = midpointMinutes % 60

  let solarTime: {
    text: string
    dateTime: string
    day: { year: number; month: number; day: number }
    longitudeCorrectionMinutes: number
    equationOfTimeMinutes: number
    standardMeridian: number | null
  } | null = null

  if (hasCoordinates) {
    const openChart = calculateBaziChart({
      year: birth.year,
      month: birth.month,
      day: birth.day,
      hour: midpointHour,
      minute: midpointMinute,
      gender: input.gender,
      timezoneId: timezone,
      longitude: input.location?.longitude,
      enableTrueSolarTime: true,
      dayBoundaryMode: 'ZI_HOUR_23',
    })
    const info = openChart.solarTimeInfo
    if (!info) {
      throw createError({
        statusCode: 422,
        statusMessage: '出生地点坐标无法完成真太阳时校正，请检查地点或时间后再试',
      })
    }
    const [dateText, timeText] = info.trueSolarDateTime.split(' ')
    const dateParts = dateText?.split('-').map(Number) ?? []
    solarTime = {
      text: info.trueSolarTime,
      dateTime: info.trueSolarDateTime,
      day: {
        year: dateParts[0] ?? birth.year,
        month: dateParts[1] ?? birth.month,
        day: dateParts[2] ?? birth.day,
      },
      longitudeCorrectionMinutes: info.longitudeCorrectionMinutes,
      equationOfTimeMinutes: info.equationOfTimeMinutes,
      standardMeridian: info.standardMeridian,
    }
  }

  const effectiveMinutes = solarTime
    ? Number(solarTime.text.slice(0, 2)) * 60 + Number(solarTime.text.slice(3, 5))
    : midpointMinutes
  const effectiveTimeIndex = solarTime
    ? timeIndexFromMinutes(effectiveMinutes)
    : input.birthTimeIndex
  const effectiveHour = solarTime ? branchFromMinutes(effectiveMinutes) : BRANCH_BY_INDEX[input.birthTimeIndex] ?? '子'
  const chartDay = solarTime?.day ?? birth
  const dayBoundaryChanged = solarTime
    ? chartDay.year !== birth.year || chartDay.month !== birth.month || chartDay.day !== birth.day
    : false

  const isEnglish = input.locale === 'en'
  const language = input.locale === 'zh-TW' ? 'zh-TW' : 'zh-CN'
  const chart = astro.bySolar(
    `${chartDay.year}-${chartDay.month}-${chartDay.day}`,
    effectiveTimeIndex,
    input.gender,
    true,
    language,
  )

  const palaces: ZiweiPalace[] = chart.palaces.map(palace => ({
    index: palace.index,
    name: palace.name,
    isBodyPalace: palace.isBodyPalace,
    isOriginalPalace: palace.isOriginalPalace,
    heavenlyStem: palace.heavenlyStem,
    earthlyBranch: palace.earthlyBranch,
    majorStars: mapStars(palace.majorStars),
    minorStars: mapStars(palace.minorStars),
    adjectiveStars: mapStars(palace.adjectiveStars),
    changsheng12: palace.changsheng12,
    boshi12: palace.boshi12,
    jiangqian12: palace.jiangqian12,
    suiqian12: palace.suiqian12,
    decadal: {
      startAge: palace.decadal.range[0],
      endAge: palace.decadal.range[1],
      heavenlyStem: palace.decadal.heavenlyStem,
      earthlyBranch: palace.decadal.earthlyBranch,
    },
    ages: [...palace.ages],
  }))

  const natalMutagenSignals = palaces.flatMap(palace => [
    ...palace.majorStars,
    ...palace.minorStars,
  ].flatMap((star) => {
    const mutagen = MUTAGEN_KEYS.find(key => key === star.mutagen)
    return mutagen ? [{ mutagen, star: star.name, palace: palace.name }] : []
  }))
  const natalMutagens = [...natalMutagenSignals].sort(
    (a, b) => MUTAGEN_KEYS.indexOf(a.mutagen) - MUTAGEN_KEYS.indexOf(b.mutagen),
  )

  const majorLimits = chart.decadalList().map((limit, sequenceIndex) => {
    const year = new Date().getFullYear()
    const natalPalace = palaces.find(item => item.index === limit.index)?.name ?? ''
    return {
      index: sequenceIndex,
      palaceName: natalPalace,
      natalPalace,
      ageRange: [limit.ageRange[0], limit.ageRange[1]] as [number, number],
      yearRange: [limit.yearRange[0], limit.yearRange[1]] as [number, number],
      heavenlyStem: limit.heavenlyStem,
      earthlyBranch: limit.earthlyBranch,
      mutagenStars: [...limit.mutagen],
      isCurrent: year >= limit.yearRange[0] && year <= limit.yearRange[1],
    }
  })

  const queryDate = new Date()
  const queryText = `${queryDate.getFullYear()}-${String(queryDate.getMonth() + 1).padStart(2, '0')}-${String(queryDate.getDate()).padStart(2, '0')}`
  const horoscope = chart.horoscope(queryText, timeIndexFromMinutes(queryDate.getHours() * 60 + queryDate.getMinutes()))
  const currentPeriods: ZiweiHoroscopeItem[] = SCOPE_KEYS.map((key) => {
    const item = horoscope[key]
    return {
      key,
      label: SCOPE_LABELS[key],
      index: item.index,
      natalPalace: palaces.find(palace => palace.index === item.index)?.name ?? '',
      heavenlyStem: item.heavenlyStem,
      earthlyBranch: item.earthlyBranch,
      mutagenStars: [...item.mutagen],
      flowingStars: (item.stars ?? []).flatMap((stars, palaceIndex) => stars.map(star => ({
        name: star.name,
        natalPalace: palaces.find(palace => palace.index === palaceIndex)?.name ?? '',
      }))),
      nominalAge: key === 'age' ? horoscope.age.nominalAge : undefined,
    }
  })

  const currentYear = queryDate.getFullYear()
  const currentDecade = majorLimits.find(limit => limit.isCurrent)
  const decadeFlowYears = currentDecade
    ? chart.yearlyList(currentDecade.index).map((flowYear) => {
      const year = currentYear
      return {
        index: flowYear.index,
        palaceName: SCOPE_LABELS.yearly,
        natalPalace: palaces.find(item => item.index === flowYear.index)?.name ?? '',
        ageRange: [flowYear.age, flowYear.age] as [number, number],
        yearRange: [flowYear.year, flowYear.year] as [number, number],
        heavenlyStem: flowYear.heavenlyStem,
        earthlyBranch: flowYear.earthlyBranch,
        mutagenStars: [...flowYear.mutagen],
        isCurrent: year === flowYear.year,
      }
    })
    : []

  const soulPalace = palaces.find(palace => palace.earthlyBranch === chart.earthlyBranchOfSoulPalace)
  const bodyPalace = palaces.find(palace => palace.earthlyBranch === chart.earthlyBranchOfBodyPalace)
  const selectedTimeText = TIME_INDEX_LABELS[input.birthTimeIndex] ?? `${input.birthTimeIndex}`

  return {
    input: {
      birthDate: input.birthDate,
      birthTimeIndex: input.birthTimeIndex,
      selectedTimeText,
      effectiveTimeText: TIME_INDEX_LABELS[effectiveTimeIndex] ?? `${effectiveTimeIndex}`,
      effectiveTimeIndex,
      effectiveHour,
      gender: input.gender,
      genderText: input.gender === 'male' ? (isEnglish ? 'Male' : '男') : (isEnglish ? 'Female' : '女'),
      locationName: input.location?.name || (isEnglish ? 'Not provided' : '未填写'),
      coordinates: hasCoordinates
        ? `${input.location?.latitude?.toFixed(4)}°${(input.location?.latitude ?? 0) >= 0 ? 'N' : 'S'}, ${input.location?.longitude?.toFixed(4)}°${(input.location?.longitude ?? 0) >= 0 ? 'E' : 'W'}`
        : null,
      timezone,
      trueSolarText: solarTime?.text ?? null,
      solarTimeStatus: !solarTime
        ? (input.location?.name ? 'failed' : 'uncorrected')
        : effectiveTimeIndex !== input.birthTimeIndex || dayBoundaryChanged ? 'boundary' : 'corrected',
      solarTimeStatusText: !solarTime
        ? (isEnglish
          ? 'No location coordinates; calculated by the selected hour without true solar time correction.'
          : '未填出生地点或未解析坐标，按所选时辰排盘，未做真太阳时校正。')
        : dayBoundaryChanged
          ? '真太阳时跨过日期边界；已按校正后的日期排盘。'
          : effectiveTimeIndex !== input.birthTimeIndex
            ? `真太阳时跨入${effectiveHour}时边界；时辰已校正。`
            : '已按出生地点完成真太阳时校正，时辰未跨边界。',
      longitudeOffsetMinutes: Math.round(solarTime?.longitudeCorrectionMinutes ?? 0),
      equationOfTimeMinutes: Math.round((solarTime?.equationOfTimeMinutes ?? 0) * 10) / 10,
      standardMeridian: solarTime?.standardMeridian ?? null,
      dayBoundaryChanged,
    },
    summary: {
      genderText: input.gender === 'male' ? (isEnglish ? 'Male' : '男') : (isEnglish ? 'Female' : '女'),
      solarDate: chart.solarDate,
      lunarDate: chart.lunarDate,
      chineseDate: chart.chineseDate,
      timeText: chart.time,
      timeRange: chart.timeRange,
      sign: chart.sign,
      zodiac: chart.zodiac,
      soulPalace: `${chart.earthlyBranchOfSoulPalace}宫`,
      bodyPalace: `${chart.earthlyBranchOfBodyPalace}宫`,
      soulStar: chart.soul,
      bodyStar: chart.body,
      fiveElementsClass: chart.fiveElementsClass,
      soulPalaceStars: soulPalace?.majorStars.map(star => `${star.name}${star.mutagen ? `化${star.mutagen}` : ''}`).join('、') || '',
    },
    palaces,
    natalMutagens,
    majorLimits,
    currentPeriods: {
      queryDate: queryText,
      lunarDate: horoscope.lunarDate,
      solarDate: horoscope.solarDate,
      periods: currentPeriods,
    },
    decadeFlowYears,
    methodology: {
      school: isEnglish ? 'Iztro default convention' : 'iztro 通行安星法',
      calendar: isEnglish ? 'Solar date input, lunar calendar conversion' : '阳历输入，内部换算农历与干支',
      trueSolarTime: hasCoordinates && solarTime
        ? `已启用：${solarTime.text}`
        : '未启用：缺少出生地点坐标',
      leapMonth: isEnglish ? 'Leap month adjusted at lunar day 15' : '闰月以十五日为界折算',
      lateZi: isEnglish ? 'Late Zi starts at 23:00; day pillar changes at 23:00' : '23:00 后按晚子时，23:00 换日干支',
      engine: 'iztro@2.6.1 + @openfate/bazi-engine true solar time',
    },
    disclaimer: isEnglish
      ? 'For cultural and entertainment reference only; not medical, legal, financial, or life advice.'
      : '排盘结果基于传统历法与命理规则生成，仅供文化研究和娱乐参考，不构成医疗、法律、财务或人生决策建议。',
    generatedAt: new Date().toISOString(),
  }
}
