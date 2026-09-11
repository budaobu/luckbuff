import { resolveGeo } from '../../vedic/_utils/geo'
import {
  calculateNatalAstroResult,
  type NatalAstroGender,
} from '~~/server/utils/tools/natal-astro'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    birthDate?: string
    birthTime?: string
    gender?: NatalAstroGender
    birthCity?: string
    timeUncertain?: boolean
  }>(event)

  if (!body?.birthDate || !body.birthTime || (body.gender !== 'male' && body.gender !== 'female') || !body.birthCity?.trim()) {
    throw createError({ statusCode: 400, statusMessage: '出生日期、精确出生时间、性别和出生地点均为必填项' })
  }

  const geo = await resolveGeo(body.birthCity.trim())
  if (!geo) {
    throw createError({ statusCode: 422, statusMessage: `无法解析出生地点：${body.birthCity}` })
  }

  return calculateNatalAstroResult({
    birthDate: body.birthDate,
    birthTime: body.birthTime,
    gender: body.gender,
    birthCity: body.birthCity.trim(),
    location: {
      name: body.birthCity.trim(),
      latitude: Number(geo.lat),
      longitude: Number(geo.lng),
      timezone: geo.timezone,
    },
    timeUncertain: body.timeUncertain === true,
  })
})
