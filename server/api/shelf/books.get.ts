import { fetchShelfBooks } from '~~/server/utils/shelf'

export default defineEventHandler(async (event) => {
  const books = await fetchShelfBooks()
  setHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=86400')
  return { books }
})
