import {
  calculateHumanDesignChart,
  type HumanDesignInput,
} from '~~/server/utils/tools/human-design'

export default defineEventHandler(async (event) => {
  const body = await readBody<HumanDesignInput>(event)

  if (!body?.birthDate || !body.birthTime || !body.timezone) {
    throw createError({ statusCode: 400, statusMessage: '出生日期、时间和时区均为必填项' })
  }
  if (body.houseSystem && !['placidus', 'whole', 'equal'].includes(body.houseSystem)) {
    throw createError({ statusCode: 400, statusMessage: '宫位制无效' })
  }

  try {
    return calculateHumanDesignChart({
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      timezone: body.timezone,
      location: body.location ?? null,
      houseSystem: body.houseSystem ?? 'placidus',
    })
  }
  catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : '人类图计算失败',
    })
  }
})
