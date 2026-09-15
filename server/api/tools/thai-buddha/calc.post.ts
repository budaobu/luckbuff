import {
  calculateThaiBuddha,
  type ThaiBuddhaInput,
} from '~~/server/utils/tools/thai-buddha'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<ThaiBuddhaInput>>(event)

  if (!body?.birthDate || !body.birthTime || !body.birthTimezone) {
    throw createError({ statusCode: 400, statusMessage: '出生日期、时间和时区均为必填项' })
  }

  if (body.location && (
    typeof body.location.latitude !== 'number'
    || typeof body.location.longitude !== 'number'
    || !body.location.timezone
  )) {
    throw createError({ statusCode: 400, statusMessage: '出生地点必须包含经纬度和时区' })
  }

  try {
    return calculateThaiBuddha({
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthTimezone: body.birthTimezone,
      location: body.location ?? null,
    })
  }
  catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : '泰国星期佛参数无效',
    })
  }
})
