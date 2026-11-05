import test from 'node:test'
import assert from 'node:assert/strict'
import { buildThaiAstro3DScene, longitudeToPoint } from '../app/utils/thai-astro-3d/model.ts'
import type { ThaiAstroChartResult } from '../server/utils/tools/thai-astro-paipan.ts'

function chartFixture(longitudes: number[]) {
  const planets = longitudes.map((longitude, index) => ({
    key: `P${index}`,
    longitude,
  }))
  return {
    ascendant: { longitude: 15 },
    planets,
  } as unknown as ThaiAstroChartResult
}

function close(actual: number, expected: number, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≈ ${expected}`)
}

test('maps exact longitudes onto the 3D chart plane', () => {
  close(longitudeToPoint(0, 1).x, 0)
  close(longitudeToPoint(0, 1).z, -1)
  close(longitudeToPoint(90, 1).x, 1)
  close(longitudeToPoint(90, 1).z, 0)
  close(longitudeToPoint(180, 1).x, 0)
  close(longitudeToPoint(180, 1).z, 1)
  close(longitudeToPoint(-90, 1).x, -1)
  close(longitudeToPoint(-90, 1).z, 0)
})

test('builds one static placement for every chart body', () => {
  const scene = buildThaiAstro3DScene(chartFixture([359, 0, 47.5, 200]))
  assert.equal(scene.planets.length, 4)
  assert.equal(scene.ascendantLongitude, 15)

  const first = scene.planets.find(planet => planet.key === 'P0')!
  assert.equal(first.longitude, 359)
  close(first.point.x, Math.cos((359 - 90) * Math.PI / 180) * first.radius)
  assert.ok(first.point.z < -6.3)

  const fourth = scene.planets.find(planet => planet.key === 'P3')!
  assert.ok(Math.abs(fourth.point.x + 2.2426) < 0.01)
  assert.ok(Math.abs(fourth.point.z - 6.1547) < 0.01)
})

test('keeps clustered bodies on their true longitude rays', () => {
  const scene = buildThaiAstro3DScene(chartFixture([90, 92]))
  const first = scene.planets[0]!
  const second = scene.planets[1]!

  assert.ok(second.radius > first.radius)
  close(first.angle, 0)
  close(second.angle, 2 * Math.PI / 180)
  assert.ok(second.point.y > first.point.y)
  close(second.point.x, Math.cos(second.angle) * second.radius)
  close(second.point.z, Math.sin(second.angle) * second.radius)
})
