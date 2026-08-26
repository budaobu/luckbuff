import { removeWritelistItem } from '~~/server/utils/insights/writelist'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler((event) => {
  checkInsightsAdminAuth(event)
  const id = getRouterParam(event, 'id') || ''
  try {
    if (!removeWritelistItem(id)) throw new Error('主题不存在')
    return { ok: true }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e instanceof Error ? e.message : '删除失败' })
  }
})
