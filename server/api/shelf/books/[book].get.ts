import { createError } from 'h3'
import { fetchShelfBook } from '~~/server/utils/shelf'

export default defineEventHandler(async (event) => {
  const bookId = Number.parseInt(getRouterParam(event, 'book') || '', 10)
  const query = getQuery(event)
  const chapterIndex = Number.parseInt(String(query.chapter ?? '0'), 10)
  const sectionIndex = Number.parseInt(String(query.section ?? '0'), 10)

  if (!Number.isInteger(bookId) || bookId <= 0) {
    throw createError({ statusCode: 400, statusMessage: '书籍 ID 无效' })
  }

  const detail = await fetchShelfBook(
    bookId,
    Number.isInteger(chapterIndex) ? chapterIndex : 0,
    Number.isInteger(sectionIndex) ? sectionIndex : 0,
  )
  setHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=86400')
  return detail
})
