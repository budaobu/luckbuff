import type { ThaiAstroChartResult } from '~~/server/utils/tools/thai-astro-paipan'

export type ThaiAstro3DSelection =
  | { kind: 'planet', key: string }
  | { kind: 'house', number: number }

export interface ThaiAstro3DPoint {
  x: number
  y: number
  z: number
}

export interface ThaiAstro3DPlanet {
  key: string
  longitude: number
  angle: number
  radius: number
  y: number
  point: ThaiAstro3DPoint
}

export interface ThaiAstro3DScene {
  ascendantLongitude: number
  planets: ThaiAstro3DPlanet[]
}

export const CHART_RADIUS = 6.55
const CLUSTER_RADIUS_STEP = 0.34
const CLUSTER_HEIGHT_STEP = 0.28

function normalizedDegrees(value: number) {
  return ((value % 360) + 360) % 360
}

export function longitudeToAngle(longitude: number) {
  // Aries 0 is at screen top; increasing sidereal longitude runs clockwise.
  return (normalizedDegrees(longitude) - 90) * Math.PI / 180
}

export function longitudeToPoint(longitude: number, radius = CHART_RADIUS, y = 0): ThaiAstro3DPoint {
  const angle = longitudeToAngle(longitude)
  return {
    x: Math.cos(angle) * radius,
    y,
    z: Math.sin(angle) * radius,
  }
}

function angularDistance(from: number, to: number) {
  const difference = Math.abs(normalizedDegrees(from - to))
  return Math.min(difference, 360 - difference)
}

export function buildThaiAstro3DScene(result: ThaiAstroChartResult): ThaiAstro3DScene {
  const ascendantLongitude = normalizedDegrees(result.ascendant.longitude)
  const sorted = [...result.planets].sort((a, b) => a.longitude - b.longitude)
  const placements: ThaiAstro3DPlanet[] = []

  for (const planet of sorted) {
    const longitude = normalizedDegrees(planet.longitude)
    const neighbors = placements.filter(item => angularDistance(item.longitude, longitude) < 7)
    const radius = CHART_RADIUS + neighbors.length * CLUSTER_RADIUS_STEP
    const y = neighbors.length * CLUSTER_HEIGHT_STEP
    placements.push({
      key: planet.key,
      longitude,
      angle: longitudeToAngle(longitude),
      radius,
      y,
      point: longitudeToPoint(longitude, radius, y),
    })
  }

  return {
    ascendantLongitude,
    planets: placements,
  }
}
