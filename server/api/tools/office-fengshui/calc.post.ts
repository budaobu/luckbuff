import { calcOfficeFengshui, type OfficeFengshuiInput, type OfficeUsageType } from '~/utils/office-fengshui'

const VALID_OFFICE_USAGE: OfficeUsageType[] = ['independent', 'openPlan', 'shared', 'homeOffice']

export default defineEventHandler(async (event) => {
  const body = await readBody<OfficeFengshuiInput>(event)

  if (body == null) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request body' })
  }

  const {
    roomType,
    direction,
    deskDirection,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    officeUsage,
    locale,
  } = body

  if (!['office', 'study', 'bedroom', 'hall'].includes(roomType ?? '')) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid roomType' })
  }

  if (!VALID_OFFICE_USAGE.includes(officeUsage ?? '')) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid officeUsage' })
  }

  if (typeof direction !== 'number' || typeof deskDirection !== 'number' || typeof birthYear !== 'number'
      || typeof birthMonth !== 'number' || typeof birthDay !== 'number'
      || !gender) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid direction/deskDirection/birthYear/birthMonth/birthDay/gender' })
  }

  const normalizedDir = direction % 360
  if (normalizedDir < 0 || normalizedDir >= 360) {
    throw createError({ statusCode: 400, statusMessage: 'Direction must be in [0, 360)' })
  }

  const normalizedDeskDir = deskDirection % 360
  if (normalizedDeskDir < 0 || normalizedDeskDir >= 360) {
    throw createError({ statusCode: 400, statusMessage: 'Desk direction must be in [0, 360)' })
  }

  if (birthMonth < 1 || birthMonth > 12 || birthDay < 1 || birthDay > 31) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birth date' })
  }

  const result = calcOfficeFengshui({
    roomType,
    direction: normalizedDir,
    deskDirection: normalizedDeskDir,
    birthYear: Math.floor(birthYear),
    birthMonth: Math.floor(birthMonth),
    birthDay: Math.floor(birthDay),
    gender,
    officeUsage,
    locale: locale || 'zh-CN',
  })

  return result
})
