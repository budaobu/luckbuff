import type { CeziZhouyiRequest, CeziZhouyiResult } from '~/types/cezi-zhouyi'
import { calculateCeziZhouyi } from '~~/server/utils/cezi-zhouyi/calc'

export default defineEventHandler(async (event): Promise<CeziZhouyiResult> => {
  const body = await readBody<CeziZhouyiRequest>(event)

  if (!body || !body.char || !body.question) {
    throw createError({ statusCode: 400, statusMessage: 'Missing char or question' })
  }

  try {
    return calculateCeziZhouyi(body)
  } catch (e: any) {
    throw createError({ statusCode: 400, statusMessage: e?.statusMessage || e?.message || 'Calculation failed' })
  }
})
