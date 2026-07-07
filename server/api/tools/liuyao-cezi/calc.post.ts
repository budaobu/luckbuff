import type { LiuyaoCeziRequest, LiuyaoCeziResult } from '~/types/liuyao-cezi'
import { calculateLiuyaoCezi } from '~~/server/utils/liuyao-cezi/calc'

export default defineEventHandler(async (event): Promise<LiuyaoCeziResult> => {
  const body = await readBody<LiuyaoCeziRequest>(event)

  if (!body || !body.char || !body.question) {
    throw createError({ statusCode: 400, statusMessage: 'Missing char or question' })
  }

  try {
    return await calculateLiuyaoCezi(body)
  } catch (e: any) {
    throw createError({
      statusCode: e?.statusCode || 400,
      statusMessage: e?.statusMessage || e?.message || 'Calculation failed',
    })
  }
})
