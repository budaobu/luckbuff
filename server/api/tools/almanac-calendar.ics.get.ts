import {
  ALMANAC_CALENDAR_LOCALES,
  ALMANAC_CALENDAR_DAYS,
  ALMANAC_CALENDAR_TYPES,
  generateAlmanacCalendar,
  type AlmanacCalendarLocale,
  type AlmanacCalendarType,
} from '~~/server/utils/almanac-calendar'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawLocale = typeof query.locale === 'string' ? query.locale : 'zh-CN'
  if (!ALMANAC_CALENDAR_LOCALES.includes(rawLocale as AlmanacCalendarLocale)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid calendar locale' })
  }
  const locale = rawLocale as AlmanacCalendarLocale

  const rawTypes = typeof query.types === 'string'
    ? query.types.split(',').map(type => type.trim())
    : [...ALMANAC_CALENDAR_TYPES]
  const types = [...new Set(rawTypes)]
    .filter((type): type is AlmanacCalendarType => ALMANAC_CALENDAR_TYPES.includes(type as AlmanacCalendarType))
  if (!types.length) {
    throw createError({ statusCode: 400, statusMessage: 'At least one calendar type is required' })
  }

  const body = await generateAlmanacCalendar(types, locale)
  setResponseHeaders(event, {
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': `inline; filename="ososn-almanac-${locale}.ics"`,
    'Cache-Control': 'public, max-age=3600, s-maxage=21600',
  })

  return body
})
