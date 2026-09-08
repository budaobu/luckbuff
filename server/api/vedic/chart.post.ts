import { resolveGeo } from './_utils/geo'
import { calculateVedicChart } from '~~/server/utils/tools/vedic-paipan'

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
  if (!geo.timezone) {
    throw createError({ statusCode: 422, statusMessage: `无法确定 ${geo.cityName} 的 IANA 时区` })
  }

  const [year, month, day] = birthDate.split('-').map(Number)
  const [hour, minute] = birthTime.split(':').map(Number)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate or birthTime' })
  }

  return calculateVedicChart({
    birthDate,
    birthTime,
    latitude: geo.lat,
    longitude: geo.lng,
    timezone: geo.timezone,
    cityName: geo.cityName,
    timeUncertain: timeUncertain ?? false,
  })
})
