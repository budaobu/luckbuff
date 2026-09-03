import { DI_ZHI } from '~/utils/bazi/constants'
import {
  calculateBaziChartResult,
  type BaziChartGender,
  type BaziChartLocation,
} from '~~/server/utils/tools/bazi-chart'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    birthDate?: string
    birthHour?: string
    gender?: BaziChartGender
    location?: BaziChartLocation | null
  }>(event)

  if (!body?.birthDate || !body.birthHour || (body.gender !== 'male' && body.gender !== 'female')) {
    throw createError({ statusCode: 400, statusMessage: '出生日期、时辰和性别均为必填项' })
  }

  if (!DI_ZHI.includes(body.birthHour as any)) {
    throw createError({ statusCode: 400, statusMessage: '出生时辰无效' })
  }

  return calculateBaziChartResult({
    birthDate: body.birthDate,
    birthHour: body.birthHour as any,
    gender: body.gender,
    location: body.location?.name ? body.location : null,
  })
})
