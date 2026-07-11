import { calculateChart } from 'celestine'
import type { Chart, ChartPlanet } from 'celestine'
import { resolveGeo } from '../../vedic/_utils/geo'
import type {
  AstroZhichangAspect,
  AstroZhichangCalcResult,
  AstroZhichangChart,
  AstroZhichangHouseOverlay,
  AstroZhichangPlanet,
  AstroZhichangRelationType,
} from '~/types/astro-zhichang-hepan'

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
const SIGN_NAMES_ZH = ['白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼']

const PLANET_NAME_ZH: Record<string, string> = {
  Sun: '太阳', Moon: '月亮', Mercury: '水星', Venus: '金星', Mars: '火星',
  Jupiter: '木星', Saturn: '土星', Uranus: '天王星', Neptune: '海王星', Pluto: '冥王星',
}

const MAJOR_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const

interface PersonInput {
  name?: string
  gender?: 'male' | 'female' | ''
  birthDate: string
  birthTime: string
  birthCity: string
  timeUncertain?: boolean
}

interface CalcBody {
  relationType?: AstroZhichangRelationType
  personA?: PersonInput
  personB?: PersonInput
}

function parseDateTime(birthDate: string, birthTime: string) {
  const [y, m, d] = birthDate.split('-').map(Number)
  const [hh, mm] = birthTime.split(':').map(Number)
  if (!y || !m || !d || hh == null || mm == null || Number.isNaN(hh) || Number.isNaN(mm)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid birthDate/birthTime: ${birthDate} ${birthTime}` })
  }
  return { year: y, month: m, day: d, hour: hh, minute: mm }
}

function signIndex(longitude: number): number {
  return Math.floor((((longitude % 360) + 360) % 360) / 30) + 1
}

function signName(sign: number): string {
  return SIGN_NAMES[(sign - 1) % 12]!
}
function signNameZh(sign: number): string {
  return SIGN_NAMES_ZH[(sign - 1) % 12]!
}

function estimateTimezoneOffset(lng: number): number {
  // 无离线时区库时的工程估算：经度 / 15，四舍五入到整小时。
  // 对中国大陆（统一 +8）等单一时区大国需要按区域修正。
  const raw = lng / 15
  let offset = Math.round(raw)
  // 中国大陆：经度 73~135E 但统一使用 UTC+8
  if (lng >= 73 && lng <= 135) offset = 8
  return offset
}

function normalizePlanet(p: ChartPlanet): AstroZhichangPlanet {
  const sign = signIndex(p.longitude)
  return {
    name: p.name,
    nameZh: PLANET_NAME_ZH[p.name] ?? p.name,
    longitude: Number(p.longitude.toFixed(4)),
    sign,
    signName: signName(sign),
    signNameZh: signNameZh(sign),
    degree: Number(((p.degree ?? 0) + (p.minute ?? 0) / 60).toFixed(2)),
    house: p.house,
    isRetrograde: p.isRetrograde,
  }
}

function buildChart(input: PersonInput, geo: { lat: number; lng: number; cityName: string }): AstroZhichangChart {
  const { year, month, day, hour, minute } = parseDateTime(input.birthDate, input.birthTime)
  const timezone = estimateTimezoneOffset(geo.lng)

  const chart: Chart = calculateChart(
    { year, month, day, hour, minute, second: 0, timezone, latitude: Number(geo.lat), longitude: Number(geo.lng) },
    {
      houseSystem: 'placidus',
      includeAsteroids: false,
      includeChiron: false,
      includeLilith: false,
      includeNodes: 'true',
      includeLots: false,
      includePatterns: false,
    },
  )

  const planets = chart.planets
    .filter(p => MAJOR_PLANETS.includes(p.name as any))
    .map(normalizePlanet)

  const ascSign = signIndex(chart.angles.ascendant.longitude)
  const mcSign = signIndex(chart.angles.midheaven.longitude)

  return {
    ascendant: {
      longitude: Number(chart.angles.ascendant.longitude.toFixed(4)),
      sign: ascSign,
      signName: signName(ascSign),
      signNameZh: signNameZh(ascSign),
      degree: Number(((chart.angles.ascendant.degree ?? 0) + (chart.angles.ascendant.minute ?? 0) / 60).toFixed(2)),
    },
    midheaven: {
      longitude: Number(chart.angles.midheaven.longitude.toFixed(4)),
      sign: mcSign,
      signName: signName(mcSign),
      signNameZh: signNameZh(mcSign),
      degree: Number(((chart.angles.midheaven.degree ?? 0) + (chart.angles.midheaven.minute ?? 0) / 60).toFixed(2)),
    },
    planets,
    houseCusps: chart.houses.cusps.map(c => {
      const s = signIndex(c.longitude)
      return {
        house: c.house,
        longitude: Number(c.longitude.toFixed(4)),
        signName: signName(s),
        signNameZh: signNameZh(s),
      }
    }),
    ascendantSign: ascSign,
  }
}

function normalizeLongitude(lon: number): number {
  let v = lon % 360
  if (v < 0) v += 360
  return v
}
function degreeDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeLongitude(a) - normalizeLongitude(b))
  return Math.min(diff, 360 - diff)
}

const ASPECT_RULES: { type: string; ideal: number; orb: number; nature: 'harmony' | 'tension' | 'blend' }[] = [
  { type: '合相', ideal: 0, orb: 8, nature: 'blend' },
  { type: '六合', ideal: 60, orb: 6, nature: 'harmony' },
  { type: '刑克', ideal: 90, orb: 8, nature: 'tension' },
  { type: '拱相', ideal: 120, orb: 8, nature: 'harmony' },
  { type: '冲相', ideal: 180, orb: 8, nature: 'tension' },
]

function detectAspect(aLon: number, bLon: number) {
  let best: typeof ASPECT_RULES[number] | null = null
  let bestOrb = Infinity
  for (const rule of ASPECT_RULES) {
    const orb = degreeDistance(aLon - bLon, rule.ideal)
    if (orb <= rule.orb && orb < bestOrb) {
      best = rule
      bestOrb = orb
    }
  }
  if (!best) return null
  return { ...best, orb: bestOrb }
}

function computeCrossAspects(planetsA: AstroZhichangPlanet[], planetsB: AstroZhichangPlanet[], labelA: string, labelB: string): AstroZhichangAspect[] {
  const out: AstroZhichangAspect[] = []
  for (const pa of planetsA) {
    for (const pb of planetsB) {
      if (pa.name === pb.name) continue
      const match = detectAspect(pa.longitude, pb.longitude)
      if (match) {
        out.push({
          planetA: pa.name,
          planetB: pb.name,
          personA: labelA,
          personB: labelB,
          orb: Number(match.orb.toFixed(2)),
          aspectType: match.type,
          idealDeg: match.ideal,
          nature: match.nature,
          note: `${labelA}的${pa.nameZh}与${labelB}的${pb.nameZh}形成${match.type}（容许度 ${match.orb.toFixed(1)}°）`,
        })
      }
    }
  }
  return out
}

function computeHouseOverlays(fromPlanets: AstroZhichangPlanet[], toChart: AstroZhichangChart, ownerLabel: string): AstroZhichangHouseOverlay[] {
  const toAscSign = toChart.ascendantSign
  return fromPlanets.map((p) => {
    const house = ((p.sign - toAscSign + 12) % 12) + 1
    return { owner: ownerLabel, planet: p.name, house }
  })
}

function careerFocusFor(chart: AstroZhichangChart) {
  const tenthHousePlanets = chart.planets.filter(p => p.house === 10).map(p => p.nameZh)
  const saturn = chart.planets.find(p => p.name === 'Saturn')
  const jupiter = chart.planets.find(p => p.name === 'Jupiter')
  const sun = chart.planets.find(p => p.name === 'Sun')
  return {
    tenthHousePlanets,
    mcSignZh: chart.midheaven.signNameZh,
    saturnHouse: saturn?.house ?? 0,
    jupiterHouse: jupiter?.house ?? 0,
    sunHouse: sun?.house ?? 0,
  }
}

export default defineEventHandler(async (event): Promise<AstroZhichangCalcResult> => {
  const body = await readBody<CalcBody>(event)
  if (!body?.personA || !body?.personB) {
    throw createError({ statusCode: 400, statusMessage: 'Missing personA or personB info' })
  }
  const relationType: AstroZhichangRelationType = body.relationType === 'colleague' ? 'colleague' : 'leader-subordinate'
  const roleA = relationType === 'colleague' ? '同事A' : '领导'
  const roleB = relationType === 'colleague' ? '同事B' : '下属'

  for (const [role, p] of Object.entries({ personA: body.personA, personB: body.personB })) {
    if (!p.birthDate || !p.birthTime || !p.birthCity) {
      throw createError({ statusCode: 400, statusMessage: `Missing birthDate / birthTime / birthCity for ${role}` })
    }
  }

  const [geoA, geoB] = await Promise.all([resolveGeo(body.personA.birthCity), resolveGeo(body.personB.birthCity)])
  if (!geoA) throw createError({ statusCode: 422, statusMessage: `无法解析出生地城市：${body.personA.birthCity}` })
  if (!geoB) throw createError({ statusCode: 422, statusMessage: `无法解析出生地城市：${body.personB.birthCity}` })

  let chartA: AstroZhichangChart
  let chartB: AstroZhichangChart
  try {
    chartA = buildChart(body.personA, geoA)
    chartB = buildChart(body.personB, geoB)
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: `星盘计算失败：${e?.message ?? e}` })
  }

  const nameA = body.personA.name?.trim() || roleA
  const nameB = body.personB.name?.trim() || roleB

  const crossAspects = [
    ...computeCrossAspects(chartA.planets, chartB.planets, nameA, nameB),
    ...computeCrossAspects(chartB.planets, chartA.planets, nameB, nameA),
  ].sort((a, b) => a.orb - b.orb).slice(0, 24)

  const aPlanetsInB = computeHouseOverlays(chartA.planets, chartB, nameA)
  const bPlanetsInA = computeHouseOverlays(chartB.planets, chartA, nameB)

  const methodNote = '本次计算采用回归黄道（Tropical Zodiac）+ Placidus 宫位制，由 celestine（经 Swiss Ephemeris / JPL Horizons 校验）在服务端直接计算双人本命盘，再合成跨盘相位与宫位叠加。出生地经纬度经地理编码解析；时区按经度估算（中国大陆统一 UTC+8），精确宫头角度建议核对真实出生时区。'

  return {
    relationType,
    personA: {
      name: nameA,
      roleLabel: roleA,
      gender: body.personA.gender ?? '',
      birthCity: body.personA.birthCity,
      cityName: geoA.cityName,
      lat: geoA.lat,
      lng: geoA.lng,
      timezone: estimateTimezoneOffset(geoA.lng),
      timeUncertain: body.personA.timeUncertain ?? false,
      chart: chartA,
    },
    personB: {
      name: nameB,
      roleLabel: roleB,
      gender: body.personB.gender ?? '',
      birthCity: body.personB.birthCity,
      cityName: geoB.cityName,
      lat: geoB.lat,
      lng: geoB.lng,
      timezone: estimateTimezoneOffset(geoB.lng),
      timeUncertain: body.personB.timeUncertain ?? false,
      chart: chartB,
    },
    crossAspects,
    aPlanetsInB,
    bPlanetsInA,
    ascendantComparison: {
      aSign: chartA.ascendant.signName,
      aSignZh: chartA.ascendant.signNameZh,
      bSign: chartB.ascendant.signName,
      bSignZh: chartB.ascendant.signNameZh,
    },
    careerFocus: {
      personA: careerFocusFor(chartA),
      personB: careerFocusFor(chartB),
    },
    methodNote,
    generatedAt: new Date().toISOString(),
  }
})
