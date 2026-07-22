import { restoreInsightBackup, isValidSlug } from '~~/server/utils/insights'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  const slug = getRouterParam(event, 'slug') || ''
  if (!isValidSlug(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const body = await readBody<{ file?: string }>(event)
  if (!body?.file) throw createError({ statusCode: 400, statusMessage: '缺少备份文件名' })

  try {
    restoreInsightBackup(slug, body.file)
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e instanceof Error ? e.message : '恢复失败' })
  }
  return { ok: true }
})
