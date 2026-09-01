import type { DiZhi } from '~/types/user'
import { calcMangpaiBazi } from '../../../utils/mangpai-bazi'

const BIRTH_HOURS: readonly DiZhi[] = [
  '子', '丑', '寅', '卯', '辰', '巳',
  '午', '未', '申', '酉', '戌', '亥',
]

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    gender?: 'male' | 'female'
    birthDate?: string
    birthHour?: DiZhi | null
    locale?: string
  }>(event)

  if (!body?.gender || !['male', 'female'].includes(body.gender)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid gender' })
  }
  if (!body.birthDate || typeof body.birthDate !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing birthDate' })
  }

  const [year, month, day] = body.birthDate.split('-').map(Number)
  if (!year || !month || !day || year < 1900 || year > 2100) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate' })
  }
  const solarDate = new Date(Date.UTC(year, month - 1, day))
  if (
    solarDate.getUTCFullYear() !== year
    || solarDate.getUTCMonth() !== month - 1
    || solarDate.getUTCDate() !== day
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate' })
  }
  if (body.birthHour && !BIRTH_HOURS.includes(body.birthHour)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthHour' })
  }

  try {
    return calcMangpaiBazi(year, month, day, body.birthHour ?? null, body.gender)
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Mangpai calculation failed: ${(error as Error).message}`,
    })
  }
})
