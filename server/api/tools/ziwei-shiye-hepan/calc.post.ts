import type { DiZhi } from '~/types/user'
import type { ZwdsChart } from '~/types/zwds'
import { calcZwdsPan } from '~/utils/zwds/pan'

interface PersonInput {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi | null
  name?: string
}

interface CalcInput {
  personA: PersonInput
  personB: PersonInput
  locale?: string
}

function computeZwdsChart(person: PersonInput): ZwdsChart {
  const [year, month, day] = person.birthDate.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate format' })
  }

  return calcZwdsPan(year, month, day, person.birthHour ?? null, person.gender)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CalcInput>(event)

  if (!body?.personA || !body?.personB) {
    throw createError({ statusCode: 400, statusMessage: 'Missing personA or personB' })
  }

  for (const key of ['personA', 'personB'] as const) {
    const person = body[key]
    if (!['male', 'female'].includes(person.gender)) {
      throw createError({ statusCode: 400, statusMessage: `Missing or invalid gender for ${key}` })
    }
    if (!person.birthDate || typeof person.birthDate !== 'string') {
      throw createError({ statusCode: 400, statusMessage: `Missing or invalid birthDate for ${key}` })
    }
  }

  const chartA = computeZwdsChart(body.personA)
  const chartB = computeZwdsChart(body.personB)

  return {
    chartA,
    chartB,
    nameA: body.personA.name || '',
    nameB: body.personB.name || '',
    locale: body.locale || 'zh-CN',
  }
})
