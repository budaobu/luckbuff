import { listInsightSlugs, readInsightSafe } from '~~/server/utils/insights'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lang = String(query.lang || 'zh-CN')

  const articles = listInsightSlugs()
    .map(slug => readInsightSafe(slug, lang))
    .filter((a): a is NonNullable<typeof a> => a !== null && !a.draft)
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))]

  setResponseHeader(event, 'Cache-Control', 'public, max-age=30, stale-while-revalidate=300')

  return {
    total: articles.length,
    categories,
    articles,
  }
})
