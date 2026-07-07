import type { JinkoujueRequest, JinkoujueResult } from '~/types/jinkoujue'
import { calculateJinkoujue } from '~~/server/utils/jinkoujue/calc'

export default defineEventHandler(async (event): Promise<JinkoujueResult> => {
  const body = await readBody<JinkoujueRequest>(event)

  if (!body || !body.method) {
    throw createError({ statusCode: 400, statusMessage: 'Missing method' })
  }

  if (body.method === 'number') {
    if (typeof body.number !== 'number' || body.number < 1 || body.number > 12) {
      throw createError({ statusCode: 400, statusMessage: 'Number must be between 1 and 12' })
    }
  }

  try {
    return calculateJinkoujue(body)
  } catch (e: any) {
    throw createError({ statusCode: 400, statusMessage: e?.message || 'Calculation failed' })
  }
})
