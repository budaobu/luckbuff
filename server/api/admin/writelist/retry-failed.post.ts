import { retryFailedWritelistItems } from '~~/server/utils/insights/writelist'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler((event) => {
  checkInsightsAdminAuth(event)
  return { ok: true, items: retryFailedWritelistItems() }
})
