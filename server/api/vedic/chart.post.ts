import { resolveGeo } from './_utils/geo'

const VEDIC_SERVICE_URL = process.env.VEDIC_SERVICE_URL ?? 'http://127.0.0.1:8765'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    birthDate?: string
    birthTime?: string
    city?: string
    timeUncertain?: boolean
  }>(event)

  const { birthDate, birthTime, city, timeUncertain } = body ?? {}
  if (!birthDate || !birthTime || !city) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birthDate / birthTime / city' })
  }

  const geo = await resolveGeo(city)
  if (!geo) {
    throw createError({ statusCode: 422, statusMessage: `无法解析城市：${city}` })
  }

  const [year, month, day] = birthDate.split('-').map(Number)
  const [hour, minute] = birthTime.split(':').map(Number)

  try {
    const chart = await $fetch<Record<string, unknown>>(`${VEDIC_SERVICE_URL}/chart`, {
      method: 'POST',
      body: { year, month, day, hour, minute, lat: geo.lat, lng: geo.lng, time_uncertain: timeUncertain ?? false },
      timeout: 10000,
    })
    return { ...chart, cityName: geo.cityName }
  } catch (e: any) {
    throw createError({ statusCode: 503, statusMessage: `星盘计算服务不可用：${e?.message ?? e}` })
  }
})
