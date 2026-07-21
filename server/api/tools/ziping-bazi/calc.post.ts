import type { DiZhi } from '~/types/user'
import type { ZipingBaziChart } from '~/types/ziping-bazi'
import { calcZipingChart } from '~/utils/ziping-bazi/pillars'

interface CalcInput {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi | null
  name?: string
  locale?: string
}

export default defineEventHandler(async (event): Promise<ZipingBaziChart> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.gender || !['male', 'female'].includes(body.gender)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid gender' })
  }
  if (!body?.birthDate || typeof body.birthDate !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid birthDate' })
  }

  const [year, month, day] = body.birthDate.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate format' })
  }

  return calcZipingChart(year, month, day, body.birthHour ?? null, body.gender)
})
