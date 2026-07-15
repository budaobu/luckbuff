import { calcBazhai, type Gender } from '~/utils/bazhai'

interface CalcInput {
  direction: number
  birthYear: number
  gender: Gender
  locale?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CalcInput>(event)

  if (body == null || typeof body.direction !== 'number' || typeof body.birthYear !== 'number' || !body.gender) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid direction/birthYear/gender' })
  }

  const direction = body.direction % 360
  if (direction < 0 || direction >= 360) {
    throw createError({ statusCode: 400, statusMessage: 'Direction must be in [0, 360)' })
  }

  const birthYear = Math.floor(body.birthYear)
  const gender = body.gender
  const locale = body.locale || 'zh-CN'

  const result = calcBazhai(direction, birthYear, gender, locale)

  return result
})
