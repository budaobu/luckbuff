import { DI_ZHI } from '~/utils/bazi/constants'
import {
  calculateQizhengPaipan,
  type QizhengPaipanInput,
} from '~~/server/utils/tools/qizheng-paipan'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<QizhengPaipanInput>>(event)

  if (!body?.birthDate || !body.birthHour || (body.gender !== 'male' && body.gender !== 'female')) {
    throw createError({ statusCode: 400, statusMessage: '出生日期、时辰和性别均为必填项' })
  }
  if (!DI_ZHI.includes(body.birthHour as any)) {
    throw createError({ statusCode: 400, statusMessage: '出生时辰无效' })
  }

  return calculateQizhengPaipan({
    birthDate: body.birthDate,
    birthHour: body.birthHour,
    gender: body.gender,
    location: body.location?.longitude !== undefined ? {
      name: body.location.name || '出生地点',
      latitude: Number(body.location.latitude ?? 0),
      longitude: Number(body.location.longitude),
      timezone: body.location.timezone || 'Asia/Shanghai',
    } : null,
  })
})
