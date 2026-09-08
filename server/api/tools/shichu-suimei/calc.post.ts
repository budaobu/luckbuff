import { DI_ZHI } from '~/utils/bazi/constants'
import {
  calculateShichuSuimeiResult,
  type ShichuSuimeiGender,
  type ShichuSuimeiDisplayLocale,
  type ShichuSuimeiLocation,
} from '~~/server/utils/tools/shichu-suimei'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    birthDate?: string
    birthHour?: string
    gender?: ShichuSuimeiGender
    location?: ShichuSuimeiLocation | null
    displayLocale?: ShichuSuimeiDisplayLocale
  }>(event)

  if (!body?.birthDate || !body.birthHour || (body.gender !== 'male' && body.gender !== 'female')) {
    throw createError({ statusCode: 400, statusMessage: '出生日期、时辰和性别均为必填项' })
  }

  if (!DI_ZHI.includes(body.birthHour as any)) {
    throw createError({ statusCode: 400, statusMessage: '出生时辰无效' })
  }

  const displayLocale = body.displayLocale === 'ja'
    ? 'ja'
    : body.displayLocale === 'en'
      ? 'en'
      : body.displayLocale === 'zh-TW' ? 'zh-TW' : 'zh-CN'

  return calculateShichuSuimeiResult({
    birthDate: body.birthDate,
    birthHour: body.birthHour as any,
    gender: body.gender,
    location: body.location?.name ? body.location : null,
  }, displayLocale)
})
