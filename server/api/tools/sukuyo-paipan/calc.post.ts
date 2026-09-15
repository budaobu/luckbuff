import type { DiZhi } from '~/types/user'
import type { SukuyoPaipanLocation } from '~~/app/types/sukuyo-paipan'
import { resolveGeo } from '../../vedic/_utils/geo'
import { calculateSukuyoPaipan } from '~~/server/utils/tools/sukuyo-paipan'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    birthDate?: string
    birthHour?: DiZhi
    gender?: 'male' | 'female'
    location?: SukuyoPaipanLocation | null
  }>(event)

  if (!body?.birthDate || !body.birthHour || (body.gender !== 'male' && body.gender !== 'female')) {
    throw createError({ statusCode: 400, statusMessage: '出生日期、时辰和性别均为必填项' })
  }

  let location: SukuyoPaipanLocation | null = body.location?.name ? body.location : null
  if (location && (!location.timezone || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude))) {
    const geo = await resolveGeo(location.name)
    if (!geo || !geo.timezone) {
      throw createError({ statusCode: 422, statusMessage: `无法解析出生地点坐标或时区：${location.name}` })
    }
    location = {
      name: geo.cityName,
      latitude: geo.lat,
      longitude: geo.lng,
      timezone: geo.timezone,
    }
  }

  return calculateSukuyoPaipan({
    birthDate: body.birthDate,
    birthHour: body.birthHour,
    gender: body.gender,
    location,
  })
})
