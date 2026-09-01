import type { DiZhi } from '~/types/user'
import type { NewSchoolBaziChart } from '~/types/new-school-bazi'
import { calcNewSchoolBazi, type NewSchoolGender } from '~~/server/utils/tools/new-school-bazi'

interface CalcInput {
  gender?: NewSchoolGender
  birthDate?: string
  birthHour?: DiZhi | null
}

export default defineEventHandler(async (event): Promise<NewSchoolBaziChart> => {
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

  return calcNewSchoolBazi(year, month, day, body.birthHour ?? null, body.gender)
})
