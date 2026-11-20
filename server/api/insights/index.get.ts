import { listInsightSlugs, readInsightSafe } from '~~/server/utils/insights'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lang = String(query.lang || 'zh-CN')
  const category = String(query.category || '')
  const page = Math.max(1, Number.parseInt(String(query.page || '1'), 10) || 1)
  const pageSize = query.pageSize
    ? Math.min(100, Math.max(1, Number.parseInt(String(query.pageSize), 10) || 10))
    : 0

  const articles = listInsightSlugs()
    .map(slug => readInsightSafe(slug, lang))
    .filter((a): a is NonNullable<typeof a> => a !== null && !a.draft)
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const categoryArticles = category
    ? articles.filter(article => article.category === category)
    : articles
  const pagedArticles = pageSize
    ? categoryArticles.slice((page - 1) * pageSize, page * pageSize)
    : categoryArticles

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))]

  setResponseHeader(event, 'Cache-Control', 'public, max-age=30, stale-while-revalidate=300')

  return {
    total: categoryArticles.length,
    totalArticles: articles.length,
    categories,
    articles: pagedArticles,
  }
})
