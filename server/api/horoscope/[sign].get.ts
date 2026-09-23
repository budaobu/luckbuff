import { calculateHoroscopeResult } from '~~/server/utils/tools/horoscope'
import { isHoroscopeSignSlug } from '~~/app/utils/horoscope/signs'

export default defineEventHandler((event) => {
  const sign = getRouterParam(event, 'sign')
  if (!isHoroscopeSignSlug(sign)) {
    throw createError({ statusCode: 404, statusMessage: 'Horoscope sign not found' })
  }

  const query = getQuery(event)
  return calculateHoroscopeResult(
    sign,
    typeof query.date === 'string' ? query.date : undefined,
    typeof query.locale === 'string' ? query.locale as any : undefined,
  )
})
