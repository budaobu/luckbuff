import { readWritelist, isWritelistRunning } from '~~/server/utils/insights/writelist'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

export default defineEventHandler((event) => {
  checkInsightsAdminAuth(event)
  const data = readWritelist()
  const query = getQuery(event)
  const pageSize = Math.min(Math.max(Number(query.pageSize) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE)
  const items = [...data.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.min(Math.max(Number(query.page) || 1, 1), totalPages)

  return {
    settings: data.settings,
    running: isWritelistRunning(),
    total: items.length,
    page,
    pageSize,
    hasActiveItems: items.some(i => i.status === 'pending' || i.status === 'writing'),
    items: items.slice((page - 1) * pageSize, page * pageSize),
  }
})
