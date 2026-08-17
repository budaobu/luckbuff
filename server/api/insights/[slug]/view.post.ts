import { isValidSlug } from '~~/server/utils/insights'
import { recordInsightView } from '~~/server/utils/insights-views'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !isValidSlug(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })
  }

  const total = recordInsightView(slug)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { total }
})
