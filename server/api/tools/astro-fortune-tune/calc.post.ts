import { resolveGeo } from '../../vedic/_utils/geo'
import type {
  AstroFortuneTuneCalcResult,
  AstroFortuneTuneCity,
  AstroFortuneTuneComparison,
  AstroFortuneTuneAspectHighlight,
} from '~/types/astro-fortune-tune'
import type { VedicChart, VedicPlanet } from '~/types/vedic'

const VEDIC_SERVICE_URL = process.env.VEDIC_SERVICE_URL ?? 'http://127.0.0.1:8765'

interface CalcBody {
  birthDate?: string
  birthTime?: string
  baseCity?: string
  candidateCities?: string[]
  timeUncertain?: boolean
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

async function fetchVedicChart(year: number, month: number, day: number, hour: number, minute: number, geo: { lat: number; lng: number }): Promise<VedicChart> {
  return await $fetch<VedicChart>(`${VEDIC_SERVICE_URL}/chart`, {
    method: 'POST',
    body: {
      year, month, day, hour, minute,
      lat: geo.lat, lng: geo.lng,
      time_uncertain: false,
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

function aspectType(orbDeg: number): { type: string; ideal: number } {
  const aspects = [
    { type: '合相', ideal: 0 },
    { type: '六合', ideal: 60 },
    { type: '刑克', ideal: 90 },
    { type: '拱相', ideal: 120 },
    { type: '冲相', ideal: 180 },
  ] as const
  let best: { type: string; ideal: number } = aspects[0]
  let bestDiff = degreeDistance(orbDeg, 0)
  for (const asp of aspects) {
    const diff = degreeDistance(orbDeg, asp.ideal)
    if (diff < bestDiff) {
      best = asp
      bestDiff = diff
    }
  }
  return { type: best.type, ideal: best.ideal }
}

type PlanetName = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn'
const MAJOR_PLANETS: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']

function computeAspectHighlights(basePlanets: VedicPlanet[], relocatedPlanets: VedicPlanet[]): AstroFortuneTuneAspectHighlight[] {
  const highlights: AstroFortuneTuneAspectHighlight[] = []
  for (let i = 0; i < MAJOR_PLANETS.length; i++) {
    for (let j = i + 1; j < MAJOR_PLANETS.length; j++) {
      const p1Name = MAJOR_PLANETS[i]
      const p2Name = MAJOR_PLANETS[j]
      const baseP1 = basePlanets.find(p => p.graha === p1Name)
      const baseP2 = basePlanets.find(p => p.graha === p2Name)
      const relP1 = relocatedPlanets.find(p => p.graha === p1Name)
      const relP2 = relocatedPlanets.find(p => p.graha === p2Name)
      if (!baseP1 || !baseP2 || !relP1 || !relP2) continue

      const baseOrb = degreeDistance(baseP1.longitude, baseP2.longitude)
      const relOrb = degreeDistance(relP1.longitude, relP2.longitude)
      const baseAsp = aspectType(baseOrb)
      const relAsp = aspectType(relOrb)

      // 只记录变化明显的相位（换类型或 orb 变化超过 3 度）
      if (baseAsp.type !== relAsp.type || Math.abs(baseOrb - relOrb) > 3) {
        const planet1Name: string = p1Name as string
        const planet2Name: string = p2Name as string
        highlights.push({
          planet1: planet1Name,
          planet2: planet2Name,
          orb: Number(relOrb.toFixed(2)),
          aspectType: relAsp.type,
          orbDelta: Number((relOrb - baseOrb).toFixed(2)),
          note: `${planet1Name}-${planet2Name}：${baseAsp.type} ${baseOrb.toFixed(1)}° → ${relAsp.type} ${relOrb.toFixed(1)}°`,
        })
      }
    }
  }
  return highlights.slice(0, 8)
}

function buildCitySummary(_city: AstroFortuneTuneCity, baseAsc: VedicChart['ascendant'], relocatedAsc: VedicChart['ascendant']): string {
  const baseSign = baseAsc.signNameZh
  const relocatedSign = relocatedAsc.signNameZh
  if (baseSign === relocatedSign) {
    return `上升仍为${relocatedSign}，度数偏移约${degreeDistance(baseAsc.longitude, relocatedAsc.longitude).toFixed(1)}°，整体基调稳定。`
  }
  return `上升由${baseSign}变为${relocatedSign}，外在气质与行事风格会呈现${relocatedSign}特质。`
}

export default defineEventHandler(async (event): Promise<AstroFortuneTuneCalcResult> => {
  const body = await readBody<CalcBody>(event)
  const { birthDate, birthTime, baseCity, candidateCities = [], timeUncertain = false } = body ?? {}

  if (!birthDate || !birthTime || !baseCity) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birthDate / birthTime / baseCity' })
  }

  const { year, month, day, hour, minute } = parseDateTime(birthDate, birthTime)

  const baseGeo = await resolveGeo(baseCity)
  if (!baseGeo) {
    throw createError({ statusCode: 422, statusMessage: `无法解析出生地城市：${baseCity}` })
  }

  let baseChart: VedicChart
  try {
    baseChart = await fetchVedicChart(year, month, day, hour, minute, baseGeo)
  } catch (e: any) {
    throw createError({ statusCode: 503, statusMessage: `星盘计算服务不可用：${e?.message ?? e}` })
  }
  baseChart.cityName = baseGeo.cityName

  const comparisons: AstroFortuneTuneComparison[] = []
  let hasUnresolvedCities = false

  for (const cityQuery of candidateCities.slice(0, 3)) {
    const trimmed = cityQuery?.trim()
    if (!trimmed) continue

    const geo = await resolveGeo(trimmed)
    if (!geo) {
      hasUnresolvedCities = true
      comparisons.push({
        city: { name: trimmed, resolved: false },
        chart: baseChart,
        ascendantDeltaDeg: 0,
        aspectHighlights: [],
        summary: `未能解析城市「${trimmed}」的经纬度，将以出生地星盘作为占位。`,
      })
      continue
    }

    let relocatedChart: VedicChart
    try {
      relocatedChart = await fetchVedicChart(year, month, day, hour, minute, geo)
    } catch (e: any) {
      hasUnresolvedCities = true
      comparisons.push({
        city: { name: trimmed, resolved: false },
        chart: baseChart,
        ascendantDeltaDeg: 0,
        aspectHighlights: [],
        summary: `城市「${trimmed}」星盘计算失败，将以出生地星盘作为占位：${e?.message ?? e}`,
      })
      continue
    }
    relocatedChart.cityName = geo.cityName

    const ascendantDeltaDeg = degreeDistance(baseChart.ascendant.longitude, relocatedChart.ascendant.longitude)
    const aspectHighlights = computeAspectHighlights(baseChart.planets, relocatedChart.planets)

    comparisons.push({
      city: { name: trimmed, resolved: true, lat: geo.lat, lng: geo.lng, cityName: geo.cityName },
      chart: relocatedChart,
      ascendantDeltaDeg: Number(ascendantDeltaDeg.toFixed(2)),
      aspectHighlights,
      summary: buildCitySummary({ name: trimmed, resolved: true }, baseChart.ascendant, relocatedChart.ascendant),
    })
  }

  if (comparisons.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请至少填写 1 个候选城市' })
  }

  const methodNote = timeUncertain
    ? '出生时间已标记为不确定， relocated 角度与相位差异仅供参考，不宜用于精确择地。'
    : '本次计算基于 Swiss Ephemeris + Lahiri Ayanamsha + Whole Sign 宫位制，对每个候选城市按真实经纬度重新计算命盘角度。'

  return {
    baseChart,
    baseCityName: baseGeo.cityName,
    comparisons,
    hasUnresolvedCities,
    calculationMethod: 'vedic_relocation',
    methodNote,
    generatedAt: new Date().toISOString(),
  }
})
