import { calculateQimenPaipan } from '~~/server/utils/tools/qimen-paipan'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    datetime?: string
    timezone?: string
    location?: string
    longitude?: number
    latitude?: number
  }>(event)

  if (!body?.datetime) {
    throw createError({ statusCode: 400, statusMessage: '起局时间为必填项' })
  }

  return calculateQimenPaipan({
    datetime: body.datetime,
    timezone: body.timezone,
    location: body.location,
    longitude: body.longitude,
    latitude: body.latitude,
  })
})
