import { readWikiManifest } from '~~/server/utils/wiki'

export default defineEventHandler(async (event) => {
  const manifest = await readWikiManifest()
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=600')
  return {
    syncedAt: manifest.syncedAt,
    total: manifest.entries.length,
    seo: manifest.indexSeo,
    entries: manifest.entries,
  }
})
