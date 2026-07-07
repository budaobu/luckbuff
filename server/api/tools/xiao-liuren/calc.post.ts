import type { XiaoLiurenRequest, XiaoLiurenResult } from '~/types/xiao-liuren'
import { calculateXiaoLiuren } from '~~/server/utils/xiao-liuren/calc'

export default defineEventHandler(async (event): Promise<XiaoLiurenResult> => {
  const body = await readBody<XiaoLiurenRequest>(event)

  if (!body || !body.method) {
    throw createError({ statusCode: 400, statusMessage: 'Missing method' })
  }

  try {
    return calculateXiaoLiuren(body)
  } catch (e: any) {
    throw createError({ statusCode: 400, statusMessage: e?.message || 'Calculation failed' })
  }
})
