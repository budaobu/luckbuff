import { resolveGeo } from '../../vedic/_utils/geo'
import { calculateThaiAstroChart } from '~~/server/utils/tools/thai-astro-paipan'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    birthDate?: string
    birthTime?: string
    city?: string
    gender?: 'male' | 'female' | ''
    timeUncertain?: boolean
  }>(event)

  if (!body?.birthDate || !body.birthTime || !body.city?.trim()) {
    throw createError({ statusCode: 400, statusMessage: '出生日期、精确时间和出生城市均为必填项' })
  }

  const geo = await resolveGeo(body.city.trim())
  if (!geo) {
    throw createError({ statusCode: 422, statusMessage: `无法解析出生城市：${body.city}` })
  }
  if (!geo.timezone) {
    throw createError({ statusCode: 422, statusMessage: `无法确定 ${geo.cityName} 的 IANA 时区；请使用拼音/英文名或更具体的城市` })
  }

  try {
    return calculateThaiAstroChart({
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      gender: body.gender,
      timeUncertain: body.timeUncertain,
      location: {
        name: geo.cityName,
        latitude: geo.lat,
        longitude: geo.lng,
        timezone: geo.timezone,
      },
    })
  }
  catch (error) {
    throw createError({
      statusCode: 422,
      statusMessage: error instanceof Error ? error.message : '泰国12星宿命盘计算失败',
    })
  }
})
