import { calcZhiniangua } from '../../../utils/huangji/core'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ year?: number }>(event)

  if (!body || typeof body.year !== 'number' || !Number.isInteger(body.year)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid year' })
  }

  if (body.year < 1900 || body.year > 2100) {
    throw createError({ statusCode: 400, statusMessage: 'Year out of range (1900-2100)' })
  }

  try {
    return calcZhiniangua(body.year)
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: `Zhiniangua calculation failed: ${(err as Error).message}`,
    })
  }
})
