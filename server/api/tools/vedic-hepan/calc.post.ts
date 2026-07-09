import { resolveGeo } from '../../vedic/_utils/geo'
import type {
  VedicHepanCalcResult,
  VedicHepanAspect,
  VedicHepanHouseOverlay,
} from '~/types/vedic-hepan'
import type { VedicChart, VedicPlanet } from '~/types/vedic'

const VEDIC_SERVICE_URL = process.env.VEDIC_SERVICE_URL ?? 'http://127.0.0.1:8765'

interface CalcBody {
  personA?: {
    name?: string
    gender?: 'male' | 'female' | ''
    birthDate: string
    birthTime: string
    birthCity: string
    timeUncertain?: boolean
  }
  personB?: {
    name?: string
    gender?: 'male' | 'female' | ''
    birthDate: string
    birthTime: string
    birthCity: string
    timeUncertain?: boolean
  }
}

function parseDateTime(birthDate: string, birthTime: string): { year: number; month: number; day: number; hour: number; minute: number } {
  const [yearStr, monthStr, dayStr] = birthDate.split('-')
  const [hourStr, minuteStr] = birthTime.split(':')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  const hour = Number(hourStr)
  const minute = Number(minuteStr)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid birthDate or birthTime: ${birthDate} ${birthTime}` })
  }
  return { year, month, day, hour, minute }
}

async function fetchVedicChart(year: number, month: number, day: number, hour: number, minute: number, geo: { lat: number; lng: number }, timeUncertain: boolean): Promise<VedicChart> {
  return await $fetch<VedicChart>(`${VEDIC_SERVICE_URL}/chart`, {
    method: 'POST',
    body: {
      year, month, day, hour, minute,
      lat: geo.lat, lng: geo.lng,
      time_uncertain: timeUncertain,
    },
    timeout: 10000,
  })
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

/** 站内容许度：合 8°、六合 6°、刑 8°、拱 8°、冲 8° */
const ASPECT_RULES: { type: string; ideal: number; orb: number; nature: 'harmony' | 'tension' | 'blend' }[] = [
  { type: '合相', ideal: 0, orb: 8, nature: 'blend' },
  { type: '六合', ideal: 60, orb: 6, nature: 'harmony' },
  { type: '刑克', ideal: 90, orb: 8, nature: 'tension' },
  { type: '拱相', ideal: 120, orb: 8, nature: 'harmony' },
  { type: '冲相', ideal: 180, orb: 8, nature: 'tension' },
]

function detectAspect(aLon: number, bLon: number): { type: string; ideal: number; orb: number; nature: 'harmony' | 'tension' | 'blend' } | null {
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

const MAJOR_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const

function computeCrossAspects(planetsA: VedicPlanet[], planetsB: VedicPlanet[], labelA: string, labelB: string): VedicHepanAspect[] {
  const aspects: VedicHepanAspect[] = []
  for (const pa of planetsA) {
    if (!MAJOR_PLANETS.includes(pa.graha as any)) continue
    for (const pb of planetsB) {
      if (!MAJOR_PLANETS.includes(pb.graha as any)) continue
      if (pa.graha === pb.graha) continue
      const match = detectAspect(pa.longitude, pb.longitude)
      if (match) {
        aspects.push({
          planetA: pa.graha,
          planetB: pb.graha,
          personA: labelA,
          personB: labelB,
          orb: Number(match.orb.toFixed(2)),
          aspectType: match.type,
          idealDeg: match.ideal,
          note: `${labelA}的${pa.graha}与${labelB}的${pb.graha}形成${match.type}（容许度 ${match.orb.toFixed(1)}°）`,
        })
      }
    }
  }
  return aspects
}

function computeHouseOverlays(fromPlanets: VedicPlanet[], toChart: VedicChart, ownerLabel: string): VedicHepanHouseOverlay[] {
  const toAscSign = toChart.houseStartSign
  const overlays: VedicHepanHouseOverlay[] = []
  for (const p of fromPlanets) {
    if (!MAJOR_PLANETS.includes(p.graha as any)) continue
    const house = ((p.sign - toAscSign + 12) % 12) + 1
    overlays.push({
      owner: ownerLabel,
      planet: p.graha,
      house,
    })
  }
  return overlays
}

function ascendantComparison(a: VedicChart, b: VedicChart) {
  return {
    aSign: a.ascendant.signName,
    aSignZh: a.ascendant.signNameZh,
    bSign: b.ascendant.signName,
    bSignZh: b.ascendant.signNameZh,
    aSignName: a.ascendant.nakshatra,
    bSignName: b.ascendant.nakshatra,
  }
}

export default defineEventHandler(async (event): Promise<VedicHepanCalcResult> => {
  const body = await readBody<CalcBody>(event)

  if (!body?.personA || !body?.personB) {
    throw createError({ statusCode: 400, statusMessage: 'Missing personA or personB info' })
  }

  const { personA, personB } = body

  for (const [role, p] of Object.entries({ personA, personB })) {
    if (!p.birthDate || !p.birthTime || !p.birthCity) {
      throw createError({ statusCode: 400, statusMessage: `Missing birthDate / birthTime / birthCity for ${role}` })
    }
  }

  const geoA = await resolveGeo(personA.birthCity)
  if (!geoA) {
    throw createError({ statusCode: 422, statusMessage: `无法解析出生地城市：${personA.birthCity}` })
  }
  const geoB = await resolveGeo(personB.birthCity)
  if (!geoB) {
    throw createError({ statusCode: 422, statusMessage: `无法解析出生地城市：${personB.birthCity}` })
  }

  const aDate = parseDateTime(personA.birthDate, personA.birthTime)
  const bDate = parseDateTime(personB.birthDate, personB.birthTime)

  let chartA: VedicChart
  let chartB: VedicChart
  try {
    chartA = await fetchVedicChart(aDate.year, aDate.month, aDate.day, aDate.hour, aDate.minute, geoA, personA.timeUncertain ?? false)
    chartB = await fetchVedicChart(bDate.year, bDate.month, bDate.day, bDate.hour, bDate.minute, geoB, personB.timeUncertain ?? false)
  } catch (e: any) {
    throw createError({ statusCode: 503, statusMessage: `星盘计算服务不可用：${e?.message ?? e}` })
  }

  chartA.cityName = geoA.cityName
  chartB.cityName = geoB.cityName

  const labelA = personA.name?.trim() || '甲方'
  const labelB = personB.name?.trim() || '乙方'

  // 跨盘相位：A→B 与 B→A，但避免重复（ Sun A vs Moon B 与 Moon B vs Sun A 是不同视角，保留）
  const crossAspectsAtoB = computeCrossAspects(chartA.planets, chartB.planets, labelA, labelB)
  const crossAspectsBtoA = computeCrossAspects(chartB.planets, chartA.planets, labelB, labelA)
  const crossAspects = [...crossAspectsAtoB, ...crossAspectsBtoA]
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 20)

  const aPlanetsInB = computeHouseOverlays(chartA.planets, chartB, labelA)
  const bPlanetsInA = computeHouseOverlays(chartB.planets, chartA, labelB)

  const methodNote = '本次计算基于 Swiss Ephemeris + Lahiri Ayanamsha + Whole Sign 宫位制，分别计算双人本命盘后，在服务端合成跨盘相位与宫位叠加关系。'

  return {
    personA: { name: labelA, chart: chartA, cityName: geoA.cityName },
    personB: { name: labelB, chart: chartB, cityName: geoB.cityName },
    crossAspects,
    aPlanetsInB,
    bPlanetsInA,
    ascendantComparison: ascendantComparison(chartA, chartB),
    methodNote,
    generatedAt: new Date().toISOString(),
  }
})
