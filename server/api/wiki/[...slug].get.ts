import { readWikiEntry } from '~~/server/utils/wiki'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const entry = await readWikiEntry(slug.split('/').filter(Boolean))
  if (!entry) {
    throw createError({ statusCode: 404, statusMessage: 'Wiki entry not found' })
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=1800')
  return entry
})
