import { DI_ZHI } from '~/utils/bazi/constants'
import { calculateRokuseiSenjutsu } from '~~/server/utils/tools/rokusei-senjutsu'

interface CalcInput {
  birthDate?: string
  birthHour?: string
  gender?: 'male' | 'female'
  location?: {
    name?: string
    longitude?: number
    latitude?: number
    timezone?: string
  } | null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CalcInput>(event)

  if (!body?.birthDate || !body.birthHour || (body.gender !== 'male' && body.gender !== 'female')) {
    throw createError({ statusCode: 400, statusMessage: '出生日期、时辰和性别均为必填项' })
  }
  if (!DI_ZHI.includes(body.birthHour as any)) {
    throw createError({ statusCode: 400, statusMessage: '出生时辰无效' })
  }

  return calculateRokuseiSenjutsu({
    birthDate: body.birthDate,
    birthHour: body.birthHour,
    gender: body.gender,
    location: body.location?.name ? body.location as any : null,
  })
})
