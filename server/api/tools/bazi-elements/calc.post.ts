import {
  analyzeBaziElements,
  type BaziElementsInput,
} from '~~/server/utils/tools/bazi-elements'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<BaziElementsInput>>(event)
  if (body?.gender !== 'male' && body?.gender !== 'female') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid gender' })
  }
  if (!body.birthDate) throw createError({ statusCode: 400, statusMessage: 'Missing birthDate' })

  return analyzeBaziElements({
    gender: body.gender,
    birthDate: body.birthDate,
    birthHour: body.birthHour,
    name: body.name,
  })
})
