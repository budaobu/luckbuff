import {
  calculateZiweiChartResult,
  type ZiweiChartGender,
  type ZiweiChartLocation,
} from '~~/server/utils/tools/ziwei-chart'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    birthDate?: string
    birthTimeIndex?: number
    gender?: ZiweiChartGender
    location?: ZiweiChartLocation | null
    locale?: 'zh-CN' | 'zh-TW' | 'en'
  }>(event)

  if (!body?.birthDate || body.birthTimeIndex === undefined || (body.gender !== 'male' && body.gender !== 'female')) {
    throw createError({ statusCode: 400, statusMessage: '出生日期、时辰和性别均为必填项' })
  }

  if (!Number.isInteger(body.birthTimeIndex) || body.birthTimeIndex < 0 || body.birthTimeIndex > 12) {
    throw createError({ statusCode: 400, statusMessage: '出生时辰无效' })
  }

  return calculateZiweiChartResult({
    birthDate: body.birthDate,
    birthTimeIndex: body.birthTimeIndex,
    gender: body.gender,
    location: body.location?.name ? body.location : null,
    locale: body.locale,
  })
})
