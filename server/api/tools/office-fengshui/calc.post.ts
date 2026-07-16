import { calcOfficeFengshui, type OfficeFengshuiInput } from '~/utils/office-fengshui'

export default defineEventHandler(async (event) => {
  const body = await readBody<OfficeFengshuiInput>(event)

  if (body == null) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request body' })
  }

  const {
    roomType,
    direction,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    locale,
  } = body

  if (!['office', 'study', 'bedroom', 'hall'].includes(roomType ?? '')) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid roomType' })
  }

  if (typeof direction !== 'number' || typeof birthYear !== 'number'
      || typeof birthMonth !== 'number' || typeof birthDay !== 'number'
      || !gender) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid direction/birthYear/birthMonth/birthDay/gender' })
  }

  const normalizedDir = direction % 360
  if (normalizedDir < 0 || normalizedDir >= 360) {
    throw createError({ statusCode: 400, statusMessage: 'Direction must be in [0, 360)' })
  }

  if (birthMonth < 1 || birthMonth > 12 || birthDay < 1 || birthDay > 31) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birth date' })
  }

  const result = calcOfficeFengshui({
    roomType,
    direction: normalizedDir,
    birthYear: Math.floor(birthYear),
    birthMonth: Math.floor(birthMonth),
    birthDay: Math.floor(birthDay),
    gender,
    locale: locale || 'zh-CN',
  })

  return result
})
