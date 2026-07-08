import { resolveGeo } from '../../vedic/_utils/geo'
import { calculateQizhengSiyu } from '../../../utils/qizheng-siyu/calc'
import type { QizhengSiyuChart } from '~/types/qizheng-siyu'

interface CalcBody {
  birthDate?: string
  birthTime?: string
  baseCity?: string
  gender?: 'male' | 'female' | ''
  locale?: string
}

function parseDateTime(birthDate: string, birthTime: string): { year: number; month: number; day: number; hour: number; minute: number } {
  const [yearStr, monthStr, dayStr] = birthDate.split('-')
  const [hourStr, minuteStr] = birthTime.split(':')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  const hour = Number(hourStr)
  const minute = Number(minuteStr)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid birthDate or birthTime: ${birthDate} ${birthTime}` })
  }
  return { year, month, day, hour, minute }
}

export default defineEventHandler(async (event): Promise<QizhengSiyuChart> => {
  const body = await readBody<CalcBody>(event)
  const { birthDate, birthTime, baseCity } = body ?? {}

  if (!birthDate || !birthTime || !baseCity) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birthDate / birthTime / baseCity' })
  }

  const { year, month, day, hour, minute } = parseDateTime(birthDate, birthTime)
  const geo = await resolveGeo(baseCity)
  if (!geo) {
    throw createError({ statusCode: 422, statusMessage: `无法解析出生地城市：${baseCity}` })
  }

  try {
    return calculateQizhengSiyu({ year, month, day, hour, minute }, geo)
  }
  catch (e: any) {
    throw createError({ statusCode: 503, statusMessage: `星盘计算失败：${e?.message ?? e}` })
  }
})
