import { deleteInsight, isValidSlug } from '~~/server/utils/insights'
import { deleteTranslationState } from '~~/server/utils/insights/translation-state'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  const slug = getRouterParam(event, 'slug') || ''
  if (!isValidSlug(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  // Delete keeps a backup copy under content/insights/.backups/
  if (!deleteInsight(slug)) throw createError({ statusCode: 404, statusMessage: '文章不存在' })
  deleteTranslationState(slug)
  return { ok: true }
})
