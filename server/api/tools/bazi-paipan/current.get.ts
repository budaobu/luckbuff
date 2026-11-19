import { solarToGanZhi } from '~/utils/bazi/calendar'

export interface BaziCurrentPillar {
  key: 'year' | 'month' | 'day' | 'hour'
  gan: string
  zhi: string
  ganzhi: string
}

export interface BaziCurrentPillarsResult {
  date: string
  hour: number
  pillars: BaziCurrentPillar[]
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export default defineEventHandler((event): BaziCurrentPillarsResult => {
  const query = getQuery(event)
  const date = typeof query.date === 'string' ? query.date : ''
  const hour = Number(query.hour)

  if (!DATE_PATTERN.test(date) || !Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw createError({ statusCode: 400, statusMessage: '当前日期或时辰无效' })
  }

  const [year, month, day] = date.split('-').map(Number) as [number, number, number]
  const result = solarToGanZhi(year, month, day, hour)
  const pillars: BaziCurrentPillar[] = [
    { key: 'year', ...result.year, ganzhi: `${result.year.gan}${result.year.zhi}` },
    { key: 'month', ...result.month, ganzhi: `${result.month.gan}${result.month.zhi}` },
    { key: 'day', ...result.day, ganzhi: `${result.day.gan}${result.day.zhi}` },
  ]
  if (result.hour) {
    pillars.push({
      key: 'hour',
      ...result.hour,
      ganzhi: `${result.hour.gan}${result.hour.zhi}`,
    })
  }

  return { date, hour, pillars }
})
