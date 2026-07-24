import { readInsightSafe, isValidSlug } from '~~/server/utils/insights'
import { computeSourceHash } from '~~/server/utils/insights/hash'
import { getTranslationOverview } from '~~/server/utils/insights/translation-state'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  const slug = getRouterParam(event, 'slug') || ''
  if (!isValidSlug(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const article = readInsightSafe(slug, 'zh-CN')
  if (!article) throw createError({ statusCode: 404, statusMessage: '文章不存在' })

  return {
    ...article,
    translations: getTranslationOverview(slug, computeSourceHash(article)),
  }
})
