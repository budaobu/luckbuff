import { createLifePathPeiduiResult } from '~~/server/utils/tools/lifepath-peidui-data'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    personA?: { name?: string; birthDate?: string }
    personB?: { name?: string; birthDate?: string }
    locale?: string
  }>(event)

  if (!body?.personA || !body?.personB) {
    throw createError({ statusCode: 400, statusMessage: 'Missing personA or personB' })
  }
  if (!body.personA.birthDate || !body.personB.birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birth date' })
  }

  return createLifePathPeiduiResult({
    personA: { name: body.personA.name, birthDate: body.personA.birthDate },
    personB: { name: body.personB.name, birthDate: body.personB.birthDate },
    locale: body.locale,
  })
})
