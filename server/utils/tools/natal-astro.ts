import { AspectType, calculateChart, type Aspect, type Chart } from 'celestine'
import type {
  NatalAstroAspect,
  NatalAstroGender,
  NatalAstroInput,
  NatalAstroPoint,
  NatalAstroResult,
} from '~~/app/types/natal-astro'

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const

const SIGN_NAMES_ZH = [
  '白羊', '金牛', '双子', '巨蟹', '狮子', '处女',
  '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼',
] as const

const PLANET_NAMES_ZH: Record<string, string> = {
  Sun: '太阳',
  Moon: '月亮',
  Mercury: '水星',
  Venus: '金星',
  Mars: '火星',
  Jupiter: '木星',
  Saturn: '土星',
  Uranus: '天王星',
  Neptune: '海王星',
  Pluto: '冥王星',
  Chiron: '凯龙星',
  Ceres: '谷神星',
  Pallas: '智神星',
  Juno: '婚神星',
  Vesta: '灶神星',
  'North Node': '北交点',
  'South Node': '南交点',
  'True North Node': '北交点',
  'True South Node': '南交点',
  'Mean North Node': '北交点',
  'Mean South Node': '南交点',
  'Mean Lilith': '平均黑月莉莉丝',
  'Part of Fortune': '幸运点',
  'Part of Spirit': '精神点',
  Ascendant: '上升点',
  Midheaven: '天顶',
  Descendant: '下降点',
  'Imum Coeli': '天底',
}

const ASPECT_NAMES_ZH: Record<string, { label: string, classification: 'major' | 'minor', nature: 'harmonious' | 'dynamic' | 'neutral' }> = {
  conjunction: { label: '合相', classification: 'major', nature: 'neutral' },
  sextile: { label: '六合', classification: 'major', nature: 'harmonious' },
  square: { label: '刑相', classification: 'major', nature: 'dynamic' },
  trine: { label: '拱相', classification: 'major', nature: 'harmonious' },
  opposition: { label: '冲相', classification: 'major', nature: 'dynamic' },
  'semi-sextile': { label: '半六合', classification: 'minor', nature: 'neutral' },
  'semi-square': { label: '半刑相', classification: 'minor', nature: 'dynamic' },
  quintile: { label: '五分相', classification: 'minor', nature: 'harmonious' },
  sesquiquadrate: { label: '倍半刑相', classification: 'minor', nature: 'dynamic' },
  biquintile: { label: '倍五分相', classification: 'minor', nature: 'harmonious' },
  quincunx: { label: '梅花相', classification: 'minor', nature: 'neutral' },
  septile: { label: '七分相', classification: 'minor', nature: 'neutral' },
  novile: { label: '九分相', classification: 'minor', nature: 'harmonious' },
  decile: { label: '十分相', classification: 'minor', nature: 'neutral' },
}

const PATTERN_NAMES_ZH: Record<string, string> = {
  'Grand Trine': '大三角',
  'T-Square': 'T三角',
  'Grand Cross': '大十字',
  Yod: '上帝手指',
  Kite: '风筝格局',
  'Mystic Rectangle': '神秘矩形',
  Stellium: '星群',
}

const DIGNITY_NAMES_ZH: Record<string, string> = {
  Domicile: '入庙',
  Exaltation: '入旺',
  Detriment: '落陷',
  Fall: '失势',
  Peregrine: '旅行',
}

function normalizeLongitude(value: number) {
  return ((value % 360) + 360) % 360
}

function signIndex(longitude: number) {
  return Math.floor(normalizeLongitude(longitude) / 30)
}

function signName(index: number) {
  return SIGN_NAMES[index]!
}

function signNameZh(index: number) {
  return SIGN_NAMES_ZH[index]!
}

function compact(value: number, digits = 4) {
  return Number(value.toFixed(digits))
}

function degreeText(degree: number, minute: number, second: number, signZh: string) {
  return `${degree}°${String(minute).padStart(2, '0')}′${String(second).padStart(2, '0')}″ ${signZh}`
}

function weekdayLabel(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', { weekday: 'long', timeZone: 'UTC' }).format(date)
}

function zoneOffsetMinutes(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value ?? '0')
  const wall = Date.UTC(
    value('year'),
    value('month') - 1,
    value('day'),
    value('hour') % 24,
    value('minute'),
    value('second'),
  )
  return Math.round((wall - instant.getTime()) / 60000)
}

function zonedWallToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
) {
  const wall = Date.UTC(year, month - 1, day, hour, minute, 0)
  let offset = zoneOffsetMinutes(new Date(wall), timeZone)
  offset = zoneOffsetMinutes(new Date(wall - offset * 60000), timeZone)
  offset = zoneOffsetMinutes(new Date(wall - offset * 60000), timeZone)
  return {
    utc: new Date(wall - offset * 60000),
    offsetMinutes: offset,
  }
}

function offsetText(minutes: number) {
  const sign = minutes < 0 ? '-' : '+'
  const absolute = Math.abs(minutes)
  const hour = Math.floor(absolute / 60)
  const minute = absolute % 60
  return `UTC${sign}${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function bodyCategory(name: string): NatalAstroPoint['category'] {
  if (name === 'Sun' || name === 'Moon') return 'luminary'
  if (name === 'Chiron') return 'centaur'
  if (['Ceres', 'Pallas', 'Juno', 'Vesta'].includes(name)) return 'asteroid'
  if (name.includes('Node')) return 'node'
  if (name.includes('Lilith')) return 'lilith'
  if (name.startsWith('Part of')) return 'lot'
  return 'planet'
}

function pointLabel(name: string) {
  return PLANET_NAMES_ZH[name] ?? name
}

function mapAspect(aspect: Aspect) {
  const meta = ASPECT_NAMES_ZH[aspect.type] ?? {
    label: aspect.type,
    classification: 'minor' as const,
    nature: 'neutral' as const,
  }
  return {
    body1: aspect.body1,
    body2: aspect.body2,
    body1Zh: pointLabel(aspect.body1),
    body2Zh: pointLabel(aspect.body2),
    type: aspect.type,
    typeZh: meta.label,
    symbol: aspect.symbol,
    classification: meta.classification,
    nature: meta.nature,
    exactAngle: aspect.angle,
    separation: compact(aspect.separation, 3),
    orb: compact(aspect.deviation, 3),
    strength: Math.round(aspect.strength),
    isApplying: aspect.isApplying,
    isOutOfSign: aspect.isOutOfSign,
  } satisfies NatalAstroAspect
}

function buildPoint(
  name: string,
  category: NatalAstroPoint['category'],
  longitude: number,
  house: number,
  degree: number,
  minute: number,
  second: number,
  options: {
    speed?: number
    isRetrograde?: boolean
    dignity?: string
    formula?: string
    calculation?: string
  } = {},
): NatalAstroPoint {
  const index = signIndex(longitude)
  const signZh = signNameZh(index)
  return {
    key: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    nameZh: pointLabel(name),
    category,
    categoryZh: {
      luminary: '发光体',
      planet: '行星',
      centaur: '半人马小行星',
      asteroid: '小行星',
      node: '月交点',
      lilith: '黑月莉莉丝',
      lot: '阿拉伯点',
      angle: '四轴',
    }[category],
    longitude: compact(longitude),
    signIndex: index + 1,
    sign: signName(index),
    signZh,
    degreeText: degreeText(degree, minute, second, signZh),
    house,
    speed: options.speed === undefined ? undefined : compact(options.speed, 5),
    isRetrograde: options.isRetrograde,
    dignity: options.dignity,
    dignityZh: options.dignity ? DIGNITY_NAMES_ZH[options.dignity] ?? options.dignity : undefined,
    formula: options.formula,
    calculation: options.calculation,
  }
}

function assertValidInput(input: NatalAstroInput) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.birthDate)
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(input.birthTime)
  if (!dateMatch || !timeMatch) {
    throw createError({ statusCode: 400, statusMessage: '出生日期或时间格式无效' })
  }

  const year = Number(dateMatch[1])
  const month = Number(dateMatch[2])
  const day = Number(dateMatch[3])
  const hour = Number(timeMatch[1])
  const minute = Number(timeMatch[2])
  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute))
  if (year < 1800 || year > 2200 || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: '出生日期需在 1800-2200 且必须真实存在' })
  }
  if (!input.location.timezone) {
    throw createError({ statusCode: 422, statusMessage: '无法确定出生地时区' })
  }

  return {
    year,
    month,
    day,
    hour,
    minute,
  }
}

export async function calculateNatalAstroResult(input: NatalAstroInput): Promise<NatalAstroResult> {
  const { year, month, day, hour, minute } = assertValidInput(input)
  const location = input.location
  const timezone = location.timezone!
  const { utc, offsetMinutes } = zonedWallToUtc(year, month, day, hour, minute, timezone)

  let chart: Chart
  try {
    chart = calculateChart({
      year,
      month,
      day,
      hour,
      minute,
      second: 0,
      timezone: offsetMinutes / 60,
      latitude: location.latitude,
      longitude: location.longitude,
    }, {
      houseSystem: 'placidus',
      includeAsteroids: true,
      includeChiron: true,
      includeLilith: 'mean',
      includeNodes: 'true',
      includeLots: true,
      aspectTypes: Object.values(AspectType),
      includePatterns: true,
      minimumAspectStrength: 0,
    })
  }
  catch (error) {
    throw createError({
      statusCode: 422,
      statusMessage: `星盘计算失败：${error instanceof Error ? error.message : error}`,
    })
  }

  const points: NatalAstroPoint[] = []
  for (const planet of chart.planets) {
    points.push(buildPoint(planet.name, bodyCategory(planet.name), planet.longitude, planet.house, planet.degree, planet.minute, planet.second, {
      speed: planet.longitudeSpeed,
      isRetrograde: planet.isRetrograde,
      dignity: planet.dignity.state,
    }))
  }

  for (const node of chart.nodes) {
    points.push(buildPoint(node.name, 'node', node.longitude, node.house, node.degree, node.minute, 0, {
      calculation: node.type,
    }))
  }

  for (const lilith of chart.lilith) {
    points.push(buildPoint('Mean Lilith', 'lilith', lilith.longitude, lilith.house, lilith.degree, lilith.minute, 0, {
      calculation: lilith.type,
    }))
  }

  for (const lot of chart.lots) {
    points.push(buildPoint(lot.name, 'lot', lot.longitude, lot.house, lot.degree, lot.minute, 0, {
      formula: lot.formula,
    }))
  }

  const angleOrder = ['ascendant', 'midheaven', 'descendant', 'imumCoeli'] as const
  for (const key of angleOrder) {
    const angle = chart.angles[key]
    points.push(buildPoint(angle.name, 'angle', angle.longitude, key === 'ascendant' ? 1 : key === 'midheaven' ? 10 : key === 'descendant' ? 7 : 4, angle.degree, angle.minute, angle.second))
  }

  const aspects = chart.aspects.all.map(mapAspect).sort((a, b) => b.strength - a.strength)
  const houseCusps = chart.houses.cusps.map(cusp => ({
    house: cusp.house,
    sign: cusp.signName,
    signZh: signNameZh(signIndex(cusp.longitude)),
    degreeText: degreeText(cusp.degree, cusp.minute, 0, signNameZh(signIndex(cusp.longitude))),
    longitude: compact(cusp.longitude),
    size: compact(cusp.size, 2),
  }))

  const elementLabels = { fire: '火', earth: '土', air: '风', water: '水' } as const
  const modalityLabels = { cardinal: '基本', fixed: '固定', mutable: '变动' } as const
  const quadrantLabels = { first: '第一象限', second: '第二象限', third: '第三象限', fourth: '第四象限' } as const
  const dignityLabels = {
    domicile: '入庙',
    exalted: '入旺',
    detriment: '落陷',
    fall: '失势',
    peregrine: '旅行',
  } as const

  const utcText = `${utc.toISOString().slice(0, 16).replace('T', ' ')} UTC`
  const localText = `${input.birthDate} ${input.birthTime}`

  return {
    birth: {
      localText,
      utcText,
      weekday: weekdayLabel(utc),
      genderText: input.gender === 'male' ? '男' : '女',
      timeBasis: input.timeUncertain ? '时间精度待确认' : '精确出生时间',
      locationName: location.name,
      coordinates: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
      timezone,
      timezoneOffsetText: offsetText(offsetMinutes),
    },
    angles: {
      ascendant: points.find(point => point.name === 'Ascendant')!.degreeText,
      midheaven: points.find(point => point.name === 'Midheaven')!.degreeText,
      descendant: points.find(point => point.name === 'Descendant')!.degreeText,
      imumCoeli: points.find(point => point.name === 'Imum Coeli')!.degreeText,
    },
    points,
    houseCusps,
    aspects,
    patterns: chart.patterns.map(pattern => PATTERN_NAMES_ZH[pattern.type] ?? pattern.type),
    summary: {
      elements: Object.entries(chart.summary.elements).map(([key, values]) => ({
        key: key as 'fire' | 'earth' | 'air' | 'water',
        label: elementLabels[key as keyof typeof elementLabels],
        points: values,
      })),
      modalities: Object.entries(chart.summary.modalities).map(([key, values]) => ({
        key: key as 'cardinal' | 'fixed' | 'mutable',
        label: modalityLabels[key as keyof typeof modalityLabels],
        points: values,
      })),
      polarity: chart.summary.polarity,
      hemispheres: chart.summary.hemispheres,
      quadrants: Object.entries(chart.summary.quadrants).map(([key, values]) => ({
        key,
        label: quadrantLabels[key as keyof typeof quadrantLabels],
        points: values,
      })),
      retrograde: chart.summary.retrograde,
      dignities: Object.entries(chart.summary.dignified).map(([key, values]) => ({
        key,
        label: dignityLabels[key as keyof typeof dignityLabels],
        points: values,
      })),
    },
    methodology: {
      engine: 'celestine 0.2.1（MIT License）',
      zodiac: '回归黄道 Tropical Zodiac',
      houseSystem: `${chart.houses.systemName}（${chart.houses.system}）`,
      timezone: `${timezone} · ${offsetText(offsetMinutes)} · 含历史夏令时规则`,
      trueSolarTime: '西洋本命盘使用出生地民用标准时，不做真太阳时校正',
      disclaimer: '本结果仅提供结构化排盘证据，不构成医疗、法律或投资建议。',
    },
    generatedAt: new Date().toISOString(),
  }
}

export type { NatalAstroGender, NatalAstroInput, NatalAstroResult }
