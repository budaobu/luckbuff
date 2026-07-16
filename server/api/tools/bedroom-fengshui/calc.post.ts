import { calcBedroomFengshui, type BedroomFengshuiInput } from '~/utils/bedroom-fengshui'

export default defineEventHandler(async (event) => {
  const body = await readBody<BedroomFengshuiInput>(event)

  if (body == null) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request body' })
  }

  const {
    roomType,
    direction,
    bedDirection,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    taboos,
    locale,
  } = body

  if (roomType !== 'bedroom') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid roomType' })
  }

  if (typeof direction !== 'number' || typeof bedDirection !== 'number'
      || typeof birthYear !== 'number' || typeof birthMonth !== 'number'
      || typeof birthDay !== 'number' || !gender
      || !taboos || typeof taboos !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid direction/bedDirection/birthYear/birthMonth/birthDay/gender/taboos' })
  }

  const normalizedDir = direction % 360
  if (normalizedDir < 0 || normalizedDir >= 360) {
    throw createError({ statusCode: 400, statusMessage: 'Direction must be in [0, 360)' })
  }

  const normalizedBedDir = bedDirection % 360
  if (normalizedBedDir < 0 || normalizedBedDir >= 360) {
    throw createError({ statusCode: 400, statusMessage: 'Bed direction must be in [0, 360)' })
  }

  if (birthMonth < 1 || birthMonth > 12 || birthDay < 1 || birthDay > 31) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birth date' })
  }

  const result = calcBedroomFengshui({
    roomType,
    direction: normalizedDir,
    bedDirection: normalizedBedDir,
    birthYear: Math.floor(birthYear),
    birthMonth: Math.floor(birthMonth),
    birthDay: Math.floor(birthDay),
    gender,
    taboos,
    locale: locale || 'zh-CN',
  })

  return result
})
