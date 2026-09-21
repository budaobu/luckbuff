import { calculateZecheng, type ZechengInput } from '~~/server/utils/tools/zecheng'
import type { ZechengResponse } from '~/types/zecheng'

type ApiInput = {
  birth?: Partial<ZechengInput['birth']>
  originName?: unknown
  mode?: unknown
  targetCity?: unknown
}

export default defineEventHandler(async (event): Promise<ZechengResponse> => {
  const body = await readBody<ApiInput>(event)
  const birth = body?.birth

  if (!birth || (birth.gender !== 'male' && birth.gender !== 'female')) {
    throw createError({ statusCode: 400, statusMessage: '性别无效' })
  }
  if (!birth.year || !birth.month || !birth.day) {
    throw createError({ statusCode: 400, statusMessage: '出生日期不完整' })
  }
  if (birth.year < 1900 || birth.year > 2100) {
    throw createError({ statusCode: 400, statusMessage: '出生年份需在 1900 至 2100 之间' })
  }

  const mode = body?.mode === 'rank' ? 'rank' : 'compare'
  const hour = Number.isFinite(Number(birth.hour)) ? Number(birth.hour) : -1

  return await calculateZecheng({
    birth: {
      year: Number(birth.year),
      month: Number(birth.month),
      day: Number(birth.day),
      hour: Math.trunc(hour),
      gender: birth.gender,
    },
    originName: String(body?.originName ?? ''),
    mode,
    targetCity: body?.targetCity == null ? undefined : String(body.targetCity),
  })
})
