import { readWikiManifest } from '~~/server/utils/wiki'

export default defineSitemapEventHandler(async () => {
  const manifest = await readWikiManifest()
  return manifest.entries.map(entry => asSitemapUrl({
    loc: entry.sourcePath,
    lastmod: manifest.syncedAt,
    changefreq: 'monthly',
    priority: 0.6,
    _i18nTransform: true,
  }))
})
