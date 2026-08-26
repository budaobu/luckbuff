import { addWritelistTitles } from '~~/server/utils/insights/writelist'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)
  const body = await readBody<{ title?: string; titles?: string }>(event)
  const raw = typeof body?.titles === 'string' ? body.titles : String(body?.title ?? '')
  try {
    const { added, errors } = addWritelistTitles(raw)
    return { ok: true, added, errors, item: added[0] }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e instanceof Error ? e.message : '添加失败' })
  }
})
