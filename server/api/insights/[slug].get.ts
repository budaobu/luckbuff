import { readInsightSafe } from '~~/server/utils/insights'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })
  }

  const query = getQuery(event)
  const lang = String(query.lang || 'zh-CN')

  const article = readInsightSafe(slug, lang)
  if (!article || article.draft) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=30, stale-while-revalidate=300')

  return article
})
