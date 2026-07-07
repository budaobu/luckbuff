import { generateQimenPan } from '~~/server/utils/qimen/calculator'
import type { QimenGeneratePayload } from '~~/server/utils/qimen/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<QimenGeneratePayload>(event)

  if (!body?.eventType) {
    throw createError({ statusCode: 400, statusMessage: 'Missing eventType' })
  }

  const questionTime = body.questionTime ? new Date(body.questionTime) : new Date()

  if (isNaN(questionTime.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid questionTime' })
  }

  try {
    const pan = generateQimenPan(questionTime)
    return pan
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err?.message || '排盘失败',
    })
  }
})
