import { readInsight } from '~~/server/utils/insights'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })
  }

  const query = getQuery(event)
  const lang = String(query.lang || 'zh-CN')

  const article = readInsight(slug, lang)
  if (!article || article.draft) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  }

  return article
})
