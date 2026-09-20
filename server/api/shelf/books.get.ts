import { fetchShelfBooks, fetchShelfSeo } from '~~/server/utils/shelf'

export default defineEventHandler(async (event) => {
  const [books, seo] = await Promise.all([fetchShelfBooks(), fetchShelfSeo()])
  setHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=86400')
  return { books, seo: seo.shelf }
})
