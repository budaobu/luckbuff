import { calculateBaziChart } from '@openfate/bazi-engine'
import { generateChartByDatetime, chartToObject, detectPatterns } from 'qimen-dunjia'
import type {
  QimenPaipanPattern,
  QimenPaipanPalace,
  QimenPaipanPillar,
  QimenPaipanResult,
} from '~~/app/types/qimen-paipan'

type RawChart = Record<string, any>

const PALACE_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6] as const
const PALACE_NAMES = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾'] as const

const DIRECTIONS: Record<number, string> = {
  1: '北',
  2: '西南',
  3: '东',
  4: '东南',
  5: '中',
  6: '西北',
  7: '西',
  8: '东北',
  9: '南',
}

const ELEMENTS: Record<number, string> = {
  1: '水',
  2: '土',
  3: '木',
  4: '木',
  5: '土',
  6: '金',
  7: '金',
  8: '土',
  9: '火',
}

const BRANCH_PALACES: Record<string, number> = {
  子: 1,
  丑: 8,
  寅: 8,
  卯: 3,
  辰: 4,
  巳: 4,
  午: 9,
  未: 2,
  申: 2,
  酉: 7,
  戌: 6,
  亥: 6,
}

const XUN_KONG: Record<string, string[]> = {
  甲子: ['戌', '亥'],
  甲戌: ['申', '酉'],
  甲申: ['午', '未'],
  甲午: ['辰', '巳'],
  甲辰: ['寅', '卯'],
  甲寅: ['子', '丑'],
}

let simplifiedConverter: ((text: string) => string) | null = null

async function simplify(text: unknown): Promise<string> {
  const value = String(text ?? '')
  if (!value) return ''
  if (!simplifiedConverter) {
    const OpenCC = await import('opencc-js')
    simplifiedConverter = OpenCC.Converter({ from: 't', to: 'cn' }) as (text: string) => string
  }
  return simplifiedConverter(value)
}

function palaceNumberByName(name: string): number | undefined {
  const index = PALACE_NAMES.findIndex(item => item === name)
  return index >= 0 ? PALACE_ORDER[index] : undefined
}

function asArray(value: any): any[] {
  return Array.isArray(value) ? value : []
}

function branchList(value: any): string[] {
  if (Array.isArray(value)) return value.map(item => String(item))
  if (typeof value === 'string' && value) {
    return value.match(/[\u4e00-\u9fa5]/g) || []
  }
  return []
}

function zodiacDirection(value: any): string[] {
  if (Array.isArray(value)) return value.map(item => String(item)).filter(Boolean)
  if (value && typeof value === 'object') {
    return [...asArray(value['孤']), ...asArray(value['虛'])].map(item => String(item)).filter(Boolean)
  }
  return []
}

function zodiacGuXu(value: any): string[] {
  if (Array.isArray(value)) return value.map(item => String(item))
  if (value && typeof value === 'object') {
    return [value['孤'], value['虛']].flat().map(item => String(item)).filter(Boolean)
  }
  return []
}

export function timePartsInZone(instant: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(formatter.formatToParts(instant).map(part => [part.type, part.value]))
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  }
}

function validateTimezone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: '时区无效' })
  }
}

function parseSolarDateTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value)
  if (!match) {
    throw createError({ statusCode: 500, statusMessage: '真太阳时校正结果无效' })
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6]),
  }
}

function formatZoneTime(parts: { year: number, month: number, day: number, hour: number, minute: number }) {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')} ${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
}

function branchFromMinutes(minutes: number) {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
  const normalized = ((minutes + 60) % 1440 + 1440) % 1440
  return branches[Math.floor(normalized / 120)] || '子'
}

async function simplifyPreservingQian(original: unknown): Promise<string> {
  const source = String(original ?? '')
  const simplified = await simplify(source)
  return source.includes('乾') ? simplified.replaceAll('干', '乾') : simplified
}

function buildPattern(raw: any): QimenPaipanPattern {
  return {
    category: String(raw['類'] ?? '格局'),
    name: String(raw['格'] ?? ''),
    auspiciousness: String(raw['吉凶'] ?? ''),
    palace: raw['宮'] ? String(raw['宮']) : undefined,
    detail: String(raw['細節'] ?? ''),
    relation: raw['關係'] ? String(raw['關係']) : undefined,
    sources: asArray(raw['出處']).map(source => ({
      book: String(source?.['書'] ?? ''),
      section: String(source?.['篇'] ?? ''),
    })).filter(source => source.book || source.section),
  }
}

function buildPalace(index: number, raw: RawChart, voidPalaces: number[], centerTargetName: string): QimenPaipanPalace {
  const palace = PALACE_ORDER[index]!
  const name = PALACE_NAMES[index]!
  const isCenter = palace === 5
  const hostsCenter = centerTargetName === name
  const earthDoor = String(asArray(raw['地門'])[index] ?? '')
  const door = String(asArray(raw['天門'])[index] ?? '')
  const originalStar = String(asArray(raw['原星'])[index] ?? '')
  const star = String(asArray(raw['九星'])[index] ?? '')

  return {
    palace,
    name,
    trigram: name,
    direction: DIRECTIONS[palace] || '',
    element: ELEMENTS[palace] || '',
    earthStem: String(asArray(raw['地盤'])[index] ?? ''),
    earthDoor,
    skyStem: String(asArray(raw['天盤'])[index] ?? ''),
    door,
    originalStar,
    star,
    god: String(asArray(raw['八神'])[index] ?? ''),
    isCenter,
    hostsCenter,
    isVoid: voidPalaces.includes(palace),
    hostingNote: hostsCenter ? '中宫寄此' : undefined,
  }
}

function buildPillar(label: QimenPaipanPillar['label'], ganzhi: any, raw: RawChart, scope: '年' | '月' | '日' | '時'): QimenPaipanPillar {
  return {
    label,
    ganzhi: String(ganzhi ?? ''),
    xunKongDirection: zodiacDirection(raw[`${scope}旬空`]),
    guXu: zodiacGuXu(raw[`${scope}孤虛`]),
  }
}

export async function calculateQimenPaipan(input: {
  datetime: string
  timezone?: string
  location?: string
  longitude?: number
  latitude?: number
}): Promise<QimenPaipanResult> {
  const instant = new Date(input.datetime)
  if (Number.isNaN(instant.getTime())) {
    throw createError({ statusCode: 400, statusMessage: '起局时间无效' })
  }

  const timezone = input.timezone?.trim() || 'Asia/Shanghai'
  validateTimezone(timezone)

  if ((input.longitude === undefined) !== (input.latitude === undefined)) {
    throw createError({ statusCode: 400, statusMessage: '真太阳时校正需要完整的经纬度' })
  }
  if (input.longitude !== undefined && (input.longitude < -180 || input.longitude > 180)) {
    throw createError({ statusCode: 400, statusMessage: '经度无效' })
  }
  if (input.latitude !== undefined && (input.latitude < -90 || input.latitude > 90)) {
    throw createError({ statusCode: 400, statusMessage: '纬度无效' })
  }

  const parts = timePartsInZone(instant, timezone)
  let engineParts = parts
  let solarTime: QimenPaipanResult['solarTime'] = {
    status: 'uncorrected',
    statusText: '未填地点或未解析坐标；按所选时区标准时排盘，未做真太阳时校正。',
    requestedTimeText: formatZoneTime(parts),
    trueSolarTime: null,
    correctedEngineTimeText: null,
    longitudeOffsetMinutes: null,
    equationOfTimeMinutes: null,
    standardMeridian: null,
    algorithm: null,
    dayBoundaryChanged: false,
    hourBoundaryChanged: false,
  }

  if (input.longitude !== undefined && input.latitude !== undefined) {
    const solarChart = calculateBaziChart({
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute,
      gender: 'male',
      timezoneId: timezone,
      longitude: input.longitude,
      enableTrueSolarTime: true,
    })
    const info = solarChart.solarTimeInfo
    if (!info) {
      throw createError({ statusCode: 422, statusMessage: '无法完成真太阳时校正，请检查地点坐标或时间' })
    }

    const trueParts = parseSolarDateTime(info.trueSolarDateTime)
    const originalWallMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
    const trueWallMs = Date.UTC(trueParts.year, trueParts.month - 1, trueParts.day, trueParts.hour, trueParts.minute)
    const correctionMinutes = (trueWallMs - originalWallMs) / 60000
    const correctedInstant = new Date(instant.getTime() + correctionMinutes * 60000)
    engineParts = timePartsInZone(correctedInstant, 'Asia/Shanghai')

    const dayBoundaryChanged = engineParts.year !== parts.year
      || engineParts.month !== parts.month
      || engineParts.day !== parts.day
    const hourBoundaryChanged = branchFromMinutes(parts.hour * 60 + parts.minute)
      !== branchFromMinutes(engineParts.hour * 60 + engineParts.minute)
    const boundary = dayBoundaryChanged || hourBoundaryChanged

    solarTime = {
      status: boundary ? 'boundary' : 'corrected',
      statusText: dayBoundaryChanged
        ? `已启用真太阳时：${info.trueSolarTime.slice(0, 5)}；校正后跨过日期边界，奇门盘已按校正日期重排。`
        : hourBoundaryChanged
          ? `已启用真太阳时：${info.trueSolarTime.slice(0, 5)}；校正后跨入新时辰边界，奇门盘已重排。`
          : `已按地点完成真太阳时校正：${info.trueSolarTime.slice(0, 5)}；未跨时辰边界。`,
      requestedTimeText: formatZoneTime(parts),
      trueSolarTime: info.trueSolarTime.slice(0, 5),
      correctedEngineTimeText: formatZoneTime(engineParts),
      longitudeOffsetMinutes: Math.round(info.longitudeCorrectionMinutes * 10) / 10,
      equationOfTimeMinutes: Math.round(info.equationOfTimeMinutes * 10) / 10,
      standardMeridian: info.standardMeridian,
      algorithm: info.algorithm,
      dayBoundaryChanged,
      hourBoundaryChanged,
    }
  }

  const engineInput = `${engineParts.year}${String(engineParts.month).padStart(2, '0')}${String(engineParts.day).padStart(2, '0')}${String(engineParts.hour).padStart(2, '0')}`
  const raw = chartToObject(generateChartByDatetime(engineInput)) as RawChart

  const timeXun = String(raw['旬首'] ?? '')
  const timeXunKong = XUN_KONG[timeXun] || []
  const timeXunKongDirections = zodiacDirection(raw['時旬空'])
  const timeXunKongPalaces = [...new Set(timeXunKong.map(branch => BRANCH_PALACES[branch]).filter(Boolean))] as number[]
  const centerTargetName = String(raw['天禽落宮'] ?? '坤')
  const palaces = PALACE_ORDER.map((_, index) => buildPalace(index, raw, timeXunKongPalaces, centerTargetName))

  const rawPatterns = detectPatterns(raw)
  const patterns = await Promise.all(asArray(rawPatterns).map(pattern => buildPattern(pattern)))
  const [dunTypeText, yuan, solarTerm, xunShou, hiddenYi, zhiFu, zhiFuPalace, zhiShi, zhiShiPalace, centerHosting] = await Promise.all([
    simplify(raw['陰陽'] === '陽' ? '阳遁' : '阴遁'),
    simplify(raw['三元']),
    simplify(raw['節氣']),
    simplify(raw['旬首']),
    simplify(raw['符首']),
    simplify(raw['值符']),
    simplifyPreservingQian(raw['值符落宮']),
    simplify(raw['值使']),
    simplifyPreservingQian(raw['值使落宮']),
    simplifyPreservingQian(`天禽寄${centerTargetName}宫`),
  ])

  const simplifiedPillars = await Promise.all([
    buildPillar('year', raw['年柱'], raw, '年'),
    buildPillar('month', raw['月柱'], raw, '月'),
    buildPillar('day', raw['日柱'], raw, '日'),
    buildPillar('hour', raw['時柱'], raw, '時'),
  ].map(async pillar => ({
    ...pillar,
    xunKongDirection: await Promise.all(pillar.xunKongDirection.map(simplify)),
    guXu: await Promise.all(pillar.guXu.map(simplify)),
  })))

  const simplifiedPatterns = await Promise.all(patterns.map(async pattern => ({
    ...pattern,
    category: await simplify(pattern.category),
    name: await simplify(pattern.name),
    auspiciousness: await simplify(pattern.auspiciousness),
    palace: pattern.palace ? await simplifyPreservingQian(pattern.palace) : undefined,
    detail: await simplifyPreservingQian(pattern.detail),
    relation: pattern.relation ? await simplifyPreservingQian(pattern.relation) : undefined,
    sources: await Promise.all(pattern.sources.map(async source => ({
      book: await simplifyPreservingQian(source.book),
      section: await simplifyPreservingQian(source.section),
    }))),
  })))

  const mappedTimeXunKong = await Promise.all(timeXunKong.map(simplify))
  const mappedTimeXunKongDirections = await Promise.all(timeXunKongDirections.map(simplify))
  const simplifiedPalaces = await Promise.all(palaces.map(async palace => ({
    ...palace,
    name: palace.name,
    trigram: palace.trigram,
    direction: await simplify(palace.direction),
    element: await simplify(palace.element),
    earthStem: await simplify(palace.earthStem),
    earthDoor: await simplify(palace.earthDoor),
    skyStem: await simplify(palace.skyStem),
    door: await simplify(palace.door),
    originalStar: await simplify(palace.originalStar),
    star: await simplify(palace.star),
    god: await simplify(palace.god),
    hostingNote: palace.hostingNote ? await simplify(palace.hostingNote) : undefined,
  })))
  const mappedSignals = {
    yearXunKong: simplifiedPillars[0]!.xunKongDirection,
    yearGuXu: simplifiedPillars[0]!.guXu,
    monthXunKong: simplifiedPillars[1]!.xunKongDirection,
    monthGuXu: simplifiedPillars[1]!.guXu,
    dayXunKong: simplifiedPillars[2]!.xunKongDirection,
    dayGuXu: simplifiedPillars[2]!.guXu,
    hourXunKong: mappedTimeXunKong,
    hourGuXu: simplifiedPillars[3]!.guXu,
  }

  return {
    input: {
      requestedTime: instant.toISOString(),
      requestedTimezone: timezone,
      location: input.location?.trim() || '未填写',
      longitude: input.longitude,
      latitude: input.latitude,
      engineTime: formatZoneTime(engineParts),
      engineTimeBasis: solarTime.status === 'uncorrected'
        ? '已转换为 UTC+8 墙上时钟后起盘'
        : '已按真太阳时转换为 UTC+8 墙上时钟后起盘',
    },
    solarTime,
    summary: {
      dunType: raw['陰陽'] === '陽' ? 'yang' : 'yin',
      dunTypeText,
      juNumber: Number(raw['局數'] ?? 0),
      yuan,
      solarTerm,
      method: '时家奇门 · 拆补法',
      xunShou,
      hiddenYi,
      zhiFu,
      zhiFuPalace,
      zhiShi,
      zhiShiPalace,
    },
    pillars: simplifiedPillars,
    chart: {
      palaces: simplifiedPalaces,
      timeXun,
      timeXunKong: mappedTimeXunKong,
      timeXunKongDirections: mappedTimeXunKongDirections,
      timeXunKongPalaces,
      timeGuXu: mappedSignals.hourGuXu,
      centerHosting,
    },
    signals: mappedSignals,
    patterns: simplifiedPatterns,
    methodology: {
      engine: 'qimen-dunjia 3.1.0',
      method: '时家转盘奇门，拆补定局',
      calendar: '定气节气，依时宪历法',
      timeBasis: 'UTC+8 排盘基准；有坐标时先做真太阳时校正',
      trueSolarTime: solarTime.statusText,
      disclaimer: '奇门遁甲排盘结果仅供文化研究与传统命理参考，不构成医疗、法律、财务或重大决策建议。',
    },
  }
}

export function compactQimenPaipanContext(result: QimenPaipanResult): string {
  const palaceLines = result.chart.palaces.map(palace => [
    `${palace.name}宫(${palace.direction})`,
    `天${palace.skyStem}/地${palace.earthStem}`,
    palace.star,
    palace.door || '无门',
    palace.god || '无神',
    palace.isVoid ? '空' : '',
    palace.hostsCenter ? '寄宫' : '',
  ].filter(Boolean).join(' '))

  return [
    `起局：${result.input.engineTime}；时区：${result.input.requestedTimezone}；地点：${result.input.location}`,
    `真太阳时：${result.solarTime.trueSolarTime || '未校正'}；${result.solarTime.statusText}`,
    `局：${result.summary.dunTypeText}${result.summary.juNumber}局 · ${result.summary.yuan} · ${result.summary.solarTerm} · ${result.summary.method}`,
    `四柱：${result.pillars.map(pillar => pillar.ganzhi).join(' ')}`,
    `旬首：${result.summary.xunShou}（遁${result.summary.hiddenYi}）；旬空：${result.chart.timeXunKong.join('、')}`,
    `值符：${result.summary.zhiFu}@${result.summary.zhiFuPalace}；值使：${result.summary.zhiShi}@${result.summary.zhiShiPalace}`,
    `九宫：${palaceLines.join('；')}`,
    `格局/十干克应：${result.patterns.map(pattern => `${pattern.name}${pattern.palace ? `@${pattern.palace}` : ''}(${pattern.auspiciousness})`).join('、') || '未检出'}`,
    `规则：${result.methodology.method}；${result.methodology.calendar}；${result.methodology.timeBasis}`,
  ].join('\n')
}
