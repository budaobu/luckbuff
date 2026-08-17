import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'
import { readInsightSafe } from '~~/server/utils/insights'
import { getInsightViewStats } from '~~/server/utils/insights-views'

export default defineEventHandler((event) => {
  checkInsightsAdminAuth(event)

  const stats = getInsightViewStats()
  const top = stats.top
    .map((entry) => {
      const article = readInsightSafe(entry.slug, 'zh-CN')
      return article ? { slug: entry.slug, title: article.title, views: entry.views } : null
    })
    .filter((e): e is { slug: string; title: string; views: number } => e !== null)

  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { ...stats, top }
})
