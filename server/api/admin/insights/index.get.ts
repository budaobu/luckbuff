import { listInsightSlugs, readInsightSafe, INSIGHT_CATEGORIES } from '~~/server/utils/insights'
import { computeSourceHash } from '~~/server/utils/insights/hash'
import { getTranslationOverview } from '~~/server/utils/insights/translation-state'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  // Admin lists every default-locale file, drafts included
  const articles = listInsightSlugs()
    .map(slug => readInsightSafe(slug, 'zh-CN'))
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map((article) => {
      const { content: _content, ...meta } = article
      return {
        ...meta,
        translations: getTranslationOverview(article.slug, computeSourceHash(article)),
      }
    })

  return {
    total: articles.length,
    categories: INSIGHT_CATEGORIES,
    articles,
  }
})
