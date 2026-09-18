import { fetchShelfBooks } from '~~/server/utils/shelf'

export default defineSitemapEventHandler(async () => {
  try {
    const books = await fetchShelfBooks()
    return books.map(book => asSitemapUrl({
      loc: `/shelf/${book.id}`,
      changefreq: 'monthly',
      priority: 0.6,
      _i18nTransform: true,
    }))
  }
  catch (error) {
    console.warn('[sitemap] shelf source unavailable', error)
    return []
  }
})
