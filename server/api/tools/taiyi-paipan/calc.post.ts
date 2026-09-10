import type { TaiyiAcumMethod } from '~~/app/types/taiyi-paipan'
import { calculateTaiyiPaipan } from '~~/server/utils/tools/taiyi-paipan'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    datetime?: string
    timezone?: string
    location?: string
    longitude?: number
    latitude?: number
    jiStyle?: 'year' | 'month' | 'day' | 'hour'
    method?: TaiyiAcumMethod
  }>(event)

  if (!body?.datetime) {
    throw createError({ statusCode: 400, statusMessage: '起局时间为必填项' })
  }

  return calculateTaiyiPaipan({
    datetime: body.datetime,
    timezone: body.timezone,
    location: body.location,
    longitude: body.longitude,
    latitude: body.latitude,
    jiStyle: body.jiStyle,
    method: body.method,
  })
})
