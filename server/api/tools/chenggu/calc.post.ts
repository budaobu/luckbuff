import { calcChenggu } from '~~/server/utils/chenggu/calc'

interface CalcInput {
  birthDate: string
  gender: 'male' | 'female'
  birthHour?: string
  locale?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CalcInput>(event)

  if (!body?.birthDate || typeof body.birthDate !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid birthDate' })
  }
  if (!body?.gender || !['male', 'female'].includes(body.gender)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid gender' })
  }

  const date = new Date(body.birthDate)
  if (isNaN(date.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate format' })
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const { result, error } = calcChenggu(year, month, day, body.gender, body.birthHour)

  if (error || !result) {
    throw createError({ statusCode: 400, statusMessage: error || 'Calculation failed' })
  }

  return result
})
