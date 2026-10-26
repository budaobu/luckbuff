import { DI_ZHI } from '~/utils/bazi/constants'
import {
  calculateKyuseiPaipan,
  type KyuseiPaipanInput,
} from '~~/server/utils/tools/kyusei-kigaku'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<KyuseiPaipanInput>>(event)

  if (!body?.birthDate || !body.birthHour || (body.gender !== 'male' && body.gender !== 'female')) {
    throw createError({ statusCode: 400, statusMessage: 'Birth date, hour and gender are required' })
  }
  if (!DI_ZHI.includes(body.birthHour as any)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birth hour' })
  }

  return calculateKyuseiPaipan({
    birthDate: body.birthDate,
    birthHour: body.birthHour,
    gender: body.gender,
    location: body.location?.longitude !== undefined ? {
      name: body.location.name || 'birth-place',
      latitude: Number(body.location.latitude ?? 0),
      longitude: Number(body.location.longitude),
      timezone: body.location.timezone || 'Asia/Shanghai',
    } : null,
  })
})
