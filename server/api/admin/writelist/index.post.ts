import { addWritelistTitle } from '~~/server/utils/insights/writelist'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)
  const body = await readBody<{ title?: string }>(event)
  try {
    const item = addWritelistTitle(String(body?.title ?? ''))
    return { ok: true, item }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e instanceof Error ? e.message : '添加失败' })
  }
})
