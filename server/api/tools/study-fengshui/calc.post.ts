import { calcStudyFengshui, type StudyFengshuiInput, type StudyRoomType } from '~/utils/study-fengshui'

const VALID_ROOM_USAGE: StudyRoomType[] = ['independent', 'withBedroom', 'withLivingRoom', 'withDining']

export default defineEventHandler(async (event) => {
  const body = await readBody<StudyFengshuiInput>(event)

  if (body == null) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request body' })
  }

  const {
    direction,
    deskDirection,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    roomUsage,
    locale,
  } = body

  if (!VALID_ROOM_USAGE.includes(roomUsage ?? '')) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid roomUsage' })
  }

  if (typeof direction !== 'number' || typeof deskDirection !== 'number'
      || typeof birthYear !== 'number' || typeof birthMonth !== 'number'
      || typeof birthDay !== 'number' || !gender) {
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

  const result = calcStudyFengshui({
    direction: normalizedDir,
    deskDirection: normalizedDeskDir,
    birthYear: Math.floor(birthYear),
    birthMonth: Math.floor(birthMonth),
    birthDay: Math.floor(birthDay),
    gender,
    roomUsage,
    locale: locale || 'zh-CN',
  })

  return result
})
