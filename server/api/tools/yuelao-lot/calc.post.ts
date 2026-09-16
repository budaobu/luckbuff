import { drawYuelaoLot, type YuelaoLotResult } from '~~/server/utils/tools/yuelao-lot-data'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ question?: string; locale?: string }>(event)
  const question = body?.question?.trim() || ''
  if (!question) {
    throw createError({ statusCode: 400, statusMessage: '请填写所问之事' })
  }

  const result = drawYuelaoLot(body?.locale || 'zh-CN')
  return { ...result, question } satisfies YuelaoLotResult & { question: string }
})
