import { listInsightSlugs, readInsightSafe, INSIGHT_CATEGORIES } from '~~/server/utils/insights'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  // Admin lists every default-locale file, drafts included
  const articles = listInsightSlugs()
    .map(slug => readInsightSafe(slug, 'zh-CN'))
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return {
    total: articles.length,
    categories: INSIGHT_CATEGORIES,
    articles,
  }
})
