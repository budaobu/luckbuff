import { Solar, NineStar } from 'lunar-javascript'
import { calculateBaziChart } from '@openfate/bazi-engine'

export interface ZibaifeixingLocation {
  name: string
  longitude?: number
  latitude?: number
  timezone?: string
}

export interface ZibaifeixingInput {
  date: string
  timeIndex: number
  location?: ZibaifeixingLocation | null
}

export interface NineStarDetail {
  number: number
  label: string
  color: string
  element: string
  homePalace: string
  homeDirection: string
  xuanKongName: string
  beiDouName: string
  xuanKongLuck: '吉' | '凶'
  qiMenName: string
  qiMenLuck: string
  qiMenDoor: string
  qiMenYinYang: string
  taiYiName: string
  taiYiType: string
  taiYiSong: string
}

export interface ZibaifeixingPalace {
  palaceNumber: number
  name: string
  direction: string
  element: string
  year: NineStarDetail
  month: NineStarDetail
  day: NineStarDetail
  hour: NineStarDetail
}

export interface ZibaifeixingLayer {
  key: 'year' | 'month' | 'day' | 'hour'
  label: string
  center: NineStarDetail
  dateBasis: string
}

export interface ZibaifeixingSolarTime {
  status: 'uncorrected' | 'corrected' | 'boundary' | 'failed'
  statusText: string
  requestedTimeText: string
  trueSolarTimeText: string | null
  correctedTimeText: string | null
  effectiveTimeIndex: number
  effectiveTimeRange: string
  longitudeOffsetMinutes: number | null
  equationOfTimeMinutes: number | null
  standardMeridian: number | null
  algorithm: string | null
  dayBoundaryChanged: boolean
  hourBoundaryChanged: boolean
}

export interface ZibaifeixingSectorSignal {
  palaceNumber: number
  name: string
  direction: string
  cautionLayers: Array<'year' | 'month' | 'day' | 'hour'>
  cautionStars: number[]
  favorableLayers: Array<'year' | 'month' | 'day' | 'hour'>
  favorableStars: number[]
  priority: 'high-caution' | 'watch' | 'favorable' | 'neutral'
}

export interface ZibaifeixingResult {
  input: {
    date: string
    timeIndex: number
    locationName: string
    coordinates: string | null
  }
  calendar: {
    lunarYear: number
    lunarMonth: number
    lunarDay: number
    lunarText: string
    yearGanZhi: string
    monthGanZhi: string
    dayGanZhi: string
    hourGanZhi: string
    jieQi: string | null
    weekday: string
    zodiac: string
  }
  solarTime: ZibaifeixingSolarTime
  layers: ZibaifeixingLayer[]
  palaces: ZibaifeixingPalace[]
  sectorSignals: ZibaifeixingSectorSignal[]
  methodology: {
    engine: string
    yearRule: string
    monthRule: string
    dayRule: string
    hourRule: string
    trueSolarTime: string
    disclaimer: string
  }
  generatedAt: string
}

const PALACE_META: Array<{ number: number; name: string; direction: string; element: string }> = [
  { number: 4, name: '巽', direction: '东南', element: '木' },
  { number: 9, name: '离', direction: '南', element: '火' },
  { number: 2, name: '坤', direction: '西南', element: '土' },
  { number: 3, name: '震', direction: '东', element: '木' },
  { number: 5, name: '中', direction: '中宫', element: '土' },
  { number: 7, name: '兑', direction: '西', element: '金' },
  { number: 8, name: '艮', direction: '东北', element: '土' },
  { number: 1, name: '坎', direction: '北', element: '水' },
  { number: 6, name: '乾', direction: '西北', element: '金' },
]

const LUOSHU_ORDER = [5, 6, 7, 8, 9, 1, 2, 3, 4] as const
const LAYER_LABELS = { year: '年盘', month: '月盘', day: '日盘', hour: '时盘' } as const
const BRANCH_BY_INDEX = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子'] as const

function mod9(value: number) {
  return ((value - 1) % 9 + 9) % 9 + 1
}

function fly(center: number) {
  const chart = new Map<number, number>()
  let star = center
  for (const palaceNumber of LUOSHU_ORDER) {
    chart.set(palaceNumber, star)
    star = mod9(star + 1)
  }
  return chart
}

function detail(raw: any): NineStarDetail {
  return {
    number: Number(raw.getIndex()) + 1,
    label: `${raw.getNumber()}${raw.getColor()}`,
    color: String(raw.getColor()),
    element: String(raw.getWuXing()),
    homePalace: String(raw.getPosition()),
    homeDirection: String(raw.getPositionDesc()),
    xuanKongName: String(raw.getNameInXuanKong()),
    beiDouName: String(raw.getNameInBeiDou()),
    xuanKongLuck: String(raw.getLuckInXuanKong()) === '凶' ? '凶' : '吉',
    qiMenName: String(raw.getNameInQiMen()),
    qiMenLuck: String(raw.getLuckInQiMen()),
    qiMenDoor: String(raw.getBaMenInQiMen()),
    qiMenYinYang: String(raw.getYinYangInQiMen()),
    taiYiName: String(raw.getNameInTaiYi()),
    taiYiType: String(raw.getTypeInTaiYi()),
    taiYiSong: String(raw.getSongInTaiYi()),
  }
}

function detailForNumber(number: number): NineStarDetail {
  return detail(NineStar.fromIndex(number - 1))
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const year = Number(match?.[1])
  const month = Number(match?.[2])
  const day = Number(match?.[3])
  if (!year || !month || !day || month > 12 || day > 31) {
    throw createError({ statusCode: 400, statusMessage: '日期格式应为 YYYY-MM-DD' })
  }
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: '日期无效' })
  }
  if (year < 1900 || year > 2100) {
    throw createError({ statusCode: 400, statusMessage: '日期支持 1900–2100 年' })
  }
  return { year, month, day }
}

function timeIndexFromMinutes(minutes: number) {
  const hour = Math.floor((((minutes % 1440) + 1440) % 1440) / 60)
  return hour === 23 ? 12 : Math.floor((hour + 1) / 2)
}

function branchFromMinutes(minutes: number) {
  return BRANCH_BY_INDEX[timeIndexFromMinutes(minutes)] ?? '子'
}

function timeRange(index: number) {
  if (index === 0) return '00:00–01:00'
  if (index === 12) return '23:00–24:00'
  const start = (index * 2 - 1) * 60
  const end = start + 120
  const pad = (value: number) => String(Math.floor(value / 60)).padStart(2, '0')
  return `${pad(start)}:00–${pad(end)}:00`
}

function minutesFromTimeText(value: string) {
  const [hour, minute] = value.split(':').map(Number)
  return (hour ?? 0) * 60 + (minute ?? 0)
}

function partsFromText(value: string) {
  const [dateText, timeText = '00:00:00'] = value.split(' ')
  const [year, month, day] = (dateText ?? '').split('-').map(Number)
  const [hour, minute] = timeText.split(':').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 422, statusMessage: '无法解析真太阳时结果' })
  }
  return { year, month, day, hour: hour ?? 0, minute: minute ?? 0 }
}

function buildSolarTime(input: ZibaifeixingInput, parts: { year: number; month: number; day: number }, midpoint: { hour: number; minute: number }) {
  const timezone = input.location?.timezone || 'Asia/Shanghai'
  const requestedText = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')} ${String(midpoint.hour).padStart(2, '0')}:${String(midpoint.minute).padStart(2, '0')}`
  const requestedMinutes = midpoint.hour * 60 + midpoint.minute
  const hasCoordinates = input.location?.longitude !== undefined && input.location?.latitude !== undefined
  const base = {
    requestedTimeText: requestedText,
    longitudeOffsetMinutes: null,
    equationOfTimeMinutes: null,
    standardMeridian: null,
    algorithm: null,
    dayBoundaryChanged: false,
    hourBoundaryChanged: false,
  }

  if (!input.location?.name) {
    return {
      status: 'uncorrected' as const,
      statusText: '未填地点；按所选时辰中值排盘，未做真太阳时校正。',
      trueSolarTimeText: null,
      correctedTimeText: null,
      effectiveTimeIndex: timeIndexFromMinutes(requestedMinutes),
      effectiveTimeRange: timeRange(timeIndexFromMinutes(requestedMinutes)),
      ...base,
    }
  }

  if (!hasCoordinates) {
    return {
      status: 'failed' as const,
      statusText: '地点未能解析坐标；未做真太阳时校正，请更换地点名称或清空地点。',
      trueSolarTimeText: null,
      correctedTimeText: null,
      effectiveTimeIndex: timeIndexFromMinutes(requestedMinutes),
      effectiveTimeRange: timeRange(timeIndexFromMinutes(requestedMinutes)),
      ...base,
    }
  }

  const solarChart = calculateBaziChart({
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: midpoint.hour,
    minute: midpoint.minute,
    gender: 'male',
    timezoneId: timezone,
    longitude: input.location.longitude,
    enableTrueSolarTime: true,
  })
  const info = solarChart.solarTimeInfo
  if (!info?.trueSolarDateTime) {
    throw createError({ statusCode: 422, statusMessage: '无法完成真太阳时校正，请检查地点坐标或时间' })
  }

  const corrected = partsFromText(info.trueSolarDateTime)
  const correctedMinutes = corrected.hour * 60 + corrected.minute
  const effectiveTimeIndex = timeIndexFromMinutes(correctedMinutes)
  const dayBoundaryChanged = corrected.year !== parts.year
    || corrected.month !== parts.month
    || corrected.day !== parts.day
  const hourBoundaryChanged = branchFromMinutes(requestedMinutes) !== branchFromMinutes(correctedMinutes)
  const correctedText = `${corrected.year}-${String(corrected.month).padStart(2, '0')}-${String(corrected.day).padStart(2, '0')} ${String(corrected.hour).padStart(2, '0')}:${String(corrected.minute).padStart(2, '0')}`

  return {
    ...base,
    status: dayBoundaryChanged || hourBoundaryChanged ? 'boundary' as const : 'corrected' as const,
    statusText: dayBoundaryChanged
      ? `已启用真太阳时：${info.trueSolarTime.slice(0, 5)}；校正后跨日期边界，四层盘已重排。`
      : hourBoundaryChanged
        ? `已启用真太阳时：${info.trueSolarTime.slice(0, 5)}；校正后跨入新时辰边界，时盘已重排。`
        : `已按地点完成真太阳时校正：${info.trueSolarTime.slice(0, 5)}。`,
    trueSolarTimeText: info.trueSolarTime.slice(0, 5),
    correctedTimeText: correctedText,
    effectiveTimeIndex,
    effectiveTimeRange: timeRange(effectiveTimeIndex),
    longitudeOffsetMinutes: Math.round(info.longitudeCorrectionMinutes * 10) / 10,
    equationOfTimeMinutes: Math.round(info.equationOfTimeMinutes * 10) / 10,
    standardMeridian: info.standardMeridian,
    algorithm: info.algorithm,
    dayBoundaryChanged,
    hourBoundaryChanged,
  }
}

export function calculateZibaifeixingPaipan(input: ZibaifeixingInput): ZibaifeixingResult {
  const parts = parseDate(input.date)
  if (!Number.isInteger(input.timeIndex) || input.timeIndex < 0 || input.timeIndex > 12) {
    throw createError({ statusCode: 400, statusMessage: '时辰索引必须在 0–12' })
  }

  const midpointMinutes = input.timeIndex === 12 ? 1380 : input.timeIndex * 120
  const midpoint = { hour: Math.floor(midpointMinutes / 60), minute: midpointMinutes % 60 }
  const solarTime = buildSolarTime(input, parts, midpoint)
  const effective = partsFromText(solarTime.correctedTimeText ?? `${input.date} ${String(midpoint.hour).padStart(2, '0')}:${String(midpoint.minute).padStart(2, '0')}:00`)
  const solar = Solar.fromYmdHms(effective.year, effective.month, effective.day, effective.hour, effective.minute, 0)
  const lunar = solar.getLunar()

  const rawCenters = {
    year: lunar.getYearNineStar(),
    month: lunar.getMonthNineStar(),
    day: lunar.getDayNineStar(),
    hour: lunar.getTimeNineStar(),
  }
  const centers = Object.fromEntries(Object.entries(rawCenters).map(([key, value]) => [key, detail(value)])) as Record<keyof typeof LAYER_LABELS, NineStarDetail>
  const charts = Object.fromEntries(
    Object.entries(centers).map(([key, center]) => [key, fly(center.number)]),
  ) as Record<keyof typeof LAYER_LABELS, Map<number, number>>

  const palaces: ZibaifeixingPalace[] = PALACE_META.map((meta) => {
    const mapped = Object.fromEntries(
      (Object.keys(LAYER_LABELS) as Array<keyof typeof LAYER_LABELS>).map((key) => {
        const number = charts[key].get(meta.number)!
        return [key, detailForNumber(number)]
      }),
    ) as Record<keyof typeof LAYER_LABELS, NineStarDetail>

    return {
      palaceNumber: meta.number,
      name: meta.name,
      direction: meta.direction,
      element: meta.element,
      ...mapped,
    }
  })

  const sectorSignals: ZibaifeixingSectorSignal[] = palaces.map((palace) => {
    const cautionLayers = (['year', 'month', 'day', 'hour'] as const)
      .filter(key => [2, 5].includes(palace[key].number))
    const favorableLayers = (['year', 'month', 'day', 'hour'] as const)
      .filter(key => [1, 4, 6, 8, 9].includes(palace[key].number))
    const priority: ZibaifeixingSectorSignal['priority'] = cautionLayers.includes('year') || cautionLayers.length >= 2
      ? 'high-caution'
      : cautionLayers.length
        ? 'watch'
        : favorableLayers.length
          ? 'favorable'
          : 'neutral'

    return {
      palaceNumber: palace.palaceNumber,
      name: palace.name,
      direction: palace.direction,
      cautionLayers,
      cautionStars: cautionLayers.map(key => palace[key].number),
      favorableLayers,
      favorableStars: favorableLayers.map(key => palace[key].number),
      priority,
    }
  })

  const location = input.location
  const coordinates = location?.longitude !== undefined && location?.latitude !== undefined
    ? `${location.latitude.toFixed(4)}°${location.latitude >= 0 ? 'N' : 'S'}, ${location.longitude.toFixed(4)}°${location.longitude >= 0 ? 'E' : 'W'}`
    : null

  return {
    input: {
      date: input.date,
      timeIndex: input.timeIndex,
      locationName: location?.name || '未填写',
      coordinates,
    },
    calendar: {
      lunarYear: lunar.getYear(),
      lunarMonth: lunar.getMonth(),
      lunarDay: lunar.getDay(),
      lunarText: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      yearGanZhi: lunar.getYearInGanZhiByLiChun(),
      monthGanZhi: lunar.getMonthInGanZhi(),
      dayGanZhi: lunar.getDayInGanZhi(),
      hourGanZhi: lunar.getTimeInGanZhi(),
      jieQi: lunar.getJieQi() || null,
      weekday: lunar.getWeekInChinese(),
      zodiac: lunar.getYearShengXiaoByLiChun(),
    },
    solarTime,
    layers: (Object.keys(LAYER_LABELS) as Array<keyof typeof LAYER_LABELS>).map((key) => ({
      key,
      label: LAYER_LABELS[key],
      center: centers[key],
      dateBasis: key === 'year' || key === 'month' ? '以立春/节气定年月口径' : '以真太阳时校正后的日与时辰为准',
    })),
    palaces,
    sectorSignals,
    methodology: {
      engine: 'lunar-javascript NineStar + Luckbuff time correction',
      yearRule: '年紫白按立春归界；默认口径为 lunar-javascript NineStar',
      monthRule: '月紫白按节气月支推星，不按公历月硬切',
      dayRule: '日紫白按冬至/夏至顺逆与六十甲子日锚点推星',
      hourRule: '时紫白按日支三分组与节气顺逆推星；23:00 后仍属子时',
      trueSolarTime: solarTime.trueSolarTimeText ? `已启用：${solarTime.trueSolarTimeText}` : '未启用：缺少可解析地点坐标',
      disclaimer: '结果基于传统紫白飞星规则，仅供文化研究和空间规划参考，不构成科学结论或专业决策建议。',
    },
    generatedAt: new Date().toISOString(),
  }
}

export function compactZibaifeixingContext(result: ZibaifeixingResult) {
  const palaces = result.palaces.map(palace => [
    `${palace.name}宫(${palace.direction})`,
    `年${palace.year.number}/月${palace.month.number}/日${palace.day.number}/时${palace.hour.number}`,
    `${palace.year.xuanKongName}/${palace.month.xuanKongName}/${palace.day.xuanKongName}/${palace.hour.xuanKongName}`,
  ].join(' '))

  return [
    `体系：紫白飞星时间盘（年月日时四层）`,
    `输入：${result.input.date}，时辰索引 ${result.input.timeIndex}；地点 ${result.input.locationName}`,
    `真太阳时：${result.solarTime.statusText}`,
    `历法：农历${result.calendar.lunarText}，${result.calendar.yearGanZhi}年 ${result.calendar.monthGanZhi}月 ${result.calendar.dayGanZhi}日 ${result.calendar.hourGanZhi}时`,
    `入中星：年${result.layers[0]?.center.label}${result.layers[0]?.center.xuanKongName} / 月${result.layers[1]?.center.label}${result.layers[1]?.center.xuanKongName} / 日${result.layers[2]?.center.label}${result.layers[2]?.center.xuanKongName} / 时${result.layers[3]?.center.label}${result.layers[3]?.center.xuanKongName}`,
    `九宫：${palaces.join('；')}`,
    `重点方位：${result.sectorSignals.filter(item => item.priority === 'high-caution').map(item => `${item.name}宫(${item.direction})`).join('、') || '未检出'}`,
    `规则：${result.methodology.engine}；${result.methodology.yearRule}`,
  ].join('\n')
}
