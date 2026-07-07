import { calcWuge, type WugeResult } from '~~/server/utils/wuge/calc'

interface CalcInput {
  name: string
  locale?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CalcInput>(event)

  if (!body?.name || typeof body.name !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid name' })
  }

  const { result, error } = calcWuge(body.name)

  if (error || !result) {
    throw createError({ statusCode: 400, statusMessage: error || 'Calculation failed' })
  }

  return result
})
