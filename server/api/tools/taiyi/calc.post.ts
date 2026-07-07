import { calculateTaiyiChart } from '../../../utils/taiyi/core'
import type { TaiyiCalcRequest } from '../../../utils/taiyi/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<TaiyiCalcRequest>(event)

  if (!body || typeof body.birthYear !== 'number' || typeof body.birthMonth !== 'number'
    || typeof body.birthDay !== 'number' || typeof body.birthHour !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid birth datetime fields' })
  }

  if (!body.question || typeof body.question !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid question' })
  }

  try {
    const result = calculateTaiyiChart({
      birthYear: body.birthYear,
      birthMonth: body.birthMonth,
      birthDay: body.birthDay,
      birthHour: body.birthHour,
      question: body.question,
    })
    return result
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: `Taiyi chart calculation failed: ${(err as Error).message}`,
    })
  }
})
