import { retryWritelistItem } from '~~/server/utils/insights/writelist'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)
  const id = getRouterParam(event, 'id') || ''
  const body = await readBody<{ action?: string }>(event)
  if (body?.action !== 'retry') {
    throw createError({ statusCode: 400, statusMessage: '不支持的操作' })
  }
  try {
    const item = retryWritelistItem(id)
    return { ok: true, item }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e instanceof Error ? e.message : '重试失败' })
  }
})
