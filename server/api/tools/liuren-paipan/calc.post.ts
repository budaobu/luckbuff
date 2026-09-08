import { calculateLiurenPaipan } from '~~/server/utils/tools/liuren-paipan'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    datetime?: string
    timezone?: string
    location?: string
    longitude?: number
    latitude?: number
    birthDate?: string
    gender?: 'male' | 'female'
  }>(event)

  if (!body?.datetime) {
    throw createError({ statusCode: 400, statusMessage: '起课时间为必填项' })
  }

  return calculateLiurenPaipan({
    datetime: body.datetime,
    timezone: body.timezone,
    location: body.location,
    longitude: body.longitude,
    latitude: body.latitude,
    birthDate: body.birthDate,
    gender: body.gender,
  })
})
