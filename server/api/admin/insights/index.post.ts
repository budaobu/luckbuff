import { writeInsight, validateInsightInput, type InsightWriteInput } from '~~/server/utils/insights'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  const body = await readBody<Partial<InsightWriteInput>>(event)
  const slug = String(body.slug || '').trim().toLowerCase()
  const input: InsightWriteInput = {
    slug,
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    category: String(body.category || ''),
    tags: Array.isArray(body.tags) ? body.tags.map(t => String(t).trim()).filter(Boolean) : [],
    publishedAt: String(body.publishedAt || ''),
    updatedAt: String(body.updatedAt || body.publishedAt || ''),
    author: String(body.author || '').trim() || '幽默隐士',
    readingTime: typeof body.readingTime === 'number' ? body.readingTime : 0,
    draft: body.draft !== false,
    relatedTools: Array.isArray(body.relatedTools) ? body.relatedTools.map(t => String(t).trim()).filter(Boolean) : [],
    content: String(body.content || ''),
  }

  const err = validateInsightInput(input, true)
  if (err) throw createError({ statusCode: 400, statusMessage: err })

  try {
    writeInsight(input, { isNew: true })
  } catch (e) {
    throw createError({ statusCode: 409, statusMessage: e instanceof Error ? e.message : '写入失败' })
  }

  return { ok: true, slug }
})
