import { calculateHoroscopeRange } from '~~/server/utils/tools/horoscope'
import {
  HOROSCOPE_SIGN_SLUGS,
  HOROSCOPE_SIGN_NAMES_ZH,
  HOROSCOPE_ZODIAC_SIGNS,
  isHoroscopeSignSlug,
} from '~~/app/utils/horoscope/signs'

const VALID_TYPES = new Set(['overall', 'love', 'work', 'wealth', 'health', 'lucky-number', 'lucky-color'])

function icsEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function icsStamp(date: Date) {
  return `${date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`
}

function compactDate(date: string) {
  return date.replaceAll('-', '')
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const sign = typeof query.sign === 'string' ? query.sign : ''
  if (!isHoroscopeSignSlug(sign)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid horoscope sign' })
  }

  const rangeValue = Number(query.range)
  const range = rangeValue === 1 || rangeValue === 3 || rangeValue === 7 ? rangeValue : 1
  const rawTypes = typeof query.types === 'string' && query.types.trim()
    ? query.types.split(',').map(type => type.trim()).filter(Boolean)
    : [...VALID_TYPES]
  const types = rawTypes.filter(type => VALID_TYPES.has(type))
  if (!types.length) {
    throw createError({ statusCode: 400, statusMessage: 'At least one fortune type is required' })
  }

  const days = calculateHoroscopeRange(sign, range, types)
  const signName = HOROSCOPE_SIGN_NAMES_ZH[(HOROSCOPE_SIGN_SLUGS as readonly string[]).indexOf(sign)]!
  const selected: string[] = []
  const events: string[] = []
  const now = new Date()

  days.forEach((day, index) => {
    const summaryParts: string[] = []
    const descriptionParts: string[] = []
    if (types.includes('overall')) summaryParts.push(`综合${day.scores.overall}`)
    if (types.includes('love')) summaryParts.push(`爱情${day.scores.love}`)
    if (types.includes('work')) summaryParts.push(`工作${day.scores.work}`)
    if (types.includes('wealth')) summaryParts.push(`财运${day.scores.wealth}`)
    if (types.includes('health')) summaryParts.push(`健康${day.scores.health}`)
    if (types.includes('lucky-number')) descriptionParts.push(`幸运数：${day.luckyNumber}`)
    if (types.includes('lucky-color')) descriptionParts.push(`幸运色：${day.luckyColorKey}`)

    events.push([
      'BEGIN:VEVENT',
      `UID:horoscope-${sign}-${day.date}@ososn.com`,
      `DTSTAMP:${icsStamp(now)}`,
      `DTSTART;TZID=Asia/Shanghai:${compactDate(day.date)}T070000`,
      `DTEND;TZID=Asia/Shanghai:${compactDate(day.date)}T071500`,
      `SUMMARY:${icsEscape(`${signName}运势 ${summaryParts.join(' / ')}`)}`,
      `DESCRIPTION:${icsEscape(descriptionParts.join('\n'))}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT10M',
      'ACTION:DISPLAY',
      `DESCRIPTION:${icsEscape(`${signName}今日运势`)}`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n'))
    if (index === 0) selected.push(...summaryParts)
  })

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ososn//Horoscope Subscription//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(`${signName}运势订阅`)}`,
    'X-WR-TIMEZONE:Asia/Shanghai',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Shanghai',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0800',
    'TZOFFSETTO:+0800',
    'TZNAME:CST',
    'END:STANDARD',
    'END:VTIMEZONE',
    ...events,
    'END:VCALENDAR',
  ]

  setResponseHeaders(event, {
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': `inline; filename="${sign}-horoscope-${range}d.ics"`,
    'Cache-Control': 'public, max-age=600',
  })
  return lines.join('\r\n') + '\r\n'
})
