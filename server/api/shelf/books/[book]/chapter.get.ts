import { createError } from 'h3'
import { fetchShelfChapter } from '~~/server/utils/shelf'

export default defineEventHandler(async (event) => {
  const bookId = Number.parseInt(getRouterParam(event, 'book') || '', 10)
  const chapterIndex = Number.parseInt(getQuery(event).chapter as string || '', 10)

  if (!Number.isInteger(bookId) || bookId <= 0 || !Number.isInteger(chapterIndex) || chapterIndex < 0) {
    throw createError({ statusCode: 400, statusMessage: '章节参数无效' })
  }

  const sections = await fetchShelfChapter(bookId, chapterIndex)
  setHeader(event, 'Cache-Control', 'public, max-age=600, stale-while-revalidate=604800')
  return { chapterIndex, sections }
})
