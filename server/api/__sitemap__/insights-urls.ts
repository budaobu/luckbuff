import { listInsightSlugs, readInsightSafe } from '~~/server/utils/insights'

// Runtime source so editor-published articles reach the sitemap without a rebuild
export default defineSitemapEventHandler(async () => {
  return listInsightSlugs()
    .map(slug => readInsightSafe(slug, 'zh-CN'))
    .filter((a): a is NonNullable<typeof a> => a !== null && !a.draft)
    .map(a => asSitemapUrl({
      loc: `/insights/${a.slug}`,
      lastmod: a.updatedAt || a.publishedAt || undefined,
      changefreq: 'monthly',
      priority: 0.6,
      _i18nTransform: true,
    }))
})
