import { readInsightSafe, writeInsight, validateInsightInput, isValidSlug, type InsightWriteInput } from '~~/server/utils/insights'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  const slug = getRouterParam(event, 'slug') || ''
  if (!isValidSlug(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const existing = readInsightSafe(slug, 'zh-CN')
  if (!existing) throw createError({ statusCode: 404, statusMessage: '文章不存在' })

  const body = await readBody<Partial<InsightWriteInput>>(event)
  const input: InsightWriteInput = {
    slug,
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    category: String(body.category || ''),
    tags: Array.isArray(body.tags) ? body.tags.map(t => String(t).trim()).filter(Boolean) : [],
    publishedAt: String(body.publishedAt || existing.publishedAt),
    updatedAt: new Date().toISOString(),
    author: String(body.author || '').trim() || '幽默隐士',
    readingTime: typeof body.readingTime === 'number' ? body.readingTime : 0,
    draft: body.draft !== false,
    relatedTools: Array.isArray(body.relatedTools) ? body.relatedTools.map(t => String(t).trim()).filter(Boolean) : [],
    content: String(body.content || ''),
  }

  const err = validateInsightInput(input, false)
  if (err) throw createError({ statusCode: 400, statusMessage: err })

  writeInsight(input, { isNew: false })
  return { ok: true, slug }
})
