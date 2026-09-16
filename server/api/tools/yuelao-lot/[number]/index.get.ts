import { getYuelaoLot } from '~~/server/utils/tools/yuelao-lot-data'

export default defineEventHandler((event) => {
  const number = Number(getRouterParam(event, 'number'))
  if (!Number.isInteger(number) || number < 1 || number > 100) {
    throw createError({ statusCode: 404, statusMessage: 'Lot not found' })
  }
  const locale = String(getQuery(event).locale || 'zh-CN')
  return getYuelaoLot(number, locale)
})
