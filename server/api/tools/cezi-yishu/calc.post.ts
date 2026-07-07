import type { CeziYishuRequest, CeziYishuResult } from '~/types/cezi-yishu'
import { calculateCeziYishu } from '~~/server/utils/cezi-yishu/calc'

export default defineEventHandler(async (event): Promise<CeziYishuResult> => {
  const body = await readBody<CeziYishuRequest>(event)

  if (!body || !body.chars || !body.question || !body.external) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chars, question or external' })
  }

  try {
    return calculateCeziYishu(body)
  } catch (e: any) {
    throw createError({ statusCode: 400, statusMessage: e?.statusMessage || e?.message || 'Calculation failed' })
  }
})
