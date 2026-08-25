import { readWritelist, isWritelistRunning } from '~~/server/utils/insights/writelist'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler((event) => {
  checkInsightsAdminAuth(event)
  const data = readWritelist()
  return {
    settings: data.settings,
    running: isWritelistRunning(),
    items: [...data.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  }
})
