import type { ZhugeCeziRequest, ZhugeCeziResult } from '~/types/zhuge-cezi'
import { calculateZhugeCezi } from '~~/server/utils/zhuge-shenshu/calc'

export default defineEventHandler(async (event): Promise<ZhugeCeziResult> => {
  const body = await readBody<ZhugeCeziRequest>(event)

  if (!body || !body.chars || !body.question) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chars or question' })
  }

  try {
    return await calculateZhugeCezi(body)
  } catch (e: any) {
    throw createError({
      statusCode: e?.statusCode || 400,
      statusMessage: e?.statusMessage || e?.message || 'Calculation failed',
    })
  }
})
