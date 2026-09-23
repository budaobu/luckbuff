import { calculateHoroscopeTopic } from '~~/server/utils/tools/horoscope'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  return calculateHoroscopeTopic(
    typeof query.date === 'string' ? query.date : undefined,
    typeof query.locale === 'string' ? query.locale as any : undefined,
  )
})
