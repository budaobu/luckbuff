import { drawOmikuji } from '~~/server/utils/tools/omikuji-data'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ question?: string; locale?: string }>(event)
  const question = body?.question?.trim() || ''

  if (!question) {
    throw createError({ statusCode: 400, statusMessage: '请填写所问之事' })
  }

  const { lotType, fortune } = drawOmikuji(body?.locale || 'zh-CN')
  return { lotType, fortune, question }
})
