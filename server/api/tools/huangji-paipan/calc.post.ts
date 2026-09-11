import { calcHuangjiPaipan } from '../../../utils/huangji/paipan'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ year?: number }>(event)

  if (!body || typeof body.year !== 'number' || !Number.isInteger(body.year)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid year' })
  }

  try {
    return calcHuangjiPaipan(body.year)
  }
  catch (error) {
    throw createError({
      statusCode: error instanceof Error && error.message.includes('range') ? 400 : 500,
      statusMessage: error instanceof Error ? error.message : 'Huangji chart calculation failed',
    })
  }
})
