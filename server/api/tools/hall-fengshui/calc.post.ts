import { calcHallFengshui, type HallFengshuiInput, type EntrywayFlow } from '~/utils/hall-fengshui'

const VALID_ENTRYWAY_FLOWS: EntrywayFlow[] = ['straight', 'curved', 'open']

export default defineEventHandler(async (event) => {
  const body = await readBody<HallFengshuiInput>(event)

  if (body == null) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request body' })
  }

  const {
    direction,
    sofaDirection,
    entrywayFlow,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    locale,
  } = body

  if (!VALID_ENTRYWAY_FLOWS.includes(entrywayFlow ?? '')) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid entrywayFlow' })
  }

  if (typeof direction !== 'number' || typeof sofaDirection !== 'number'
      || typeof birthYear !== 'number' || typeof birthMonth !== 'number'
      || typeof birthDay !== 'number' || !gender) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid direction/sofaDirection/birthYear/birthMonth/birthDay/gender' })
  }

  const normalizedDir = direction % 360
  if (normalizedDir < 0 || normalizedDir >= 360) {
    throw createError({ statusCode: 400, statusMessage: 'Direction must be in [0, 360)' })
  }

  const normalizedSofaDir = sofaDirection % 360
  if (normalizedSofaDir < 0 || normalizedSofaDir >= 360) {
    throw createError({ statusCode: 400, statusMessage: 'Sofa direction must be in [0, 360)' })
  }

  if (birthMonth < 1 || birthMonth > 12 || birthDay < 1 || birthDay > 31) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birth date' })
  }

  const result = calcHallFengshui({
    direction: normalizedDir,
    sofaDirection: normalizedSofaDir,
    entrywayFlow,
    birthYear: Math.floor(birthYear),
    birthMonth: Math.floor(birthMonth),
    birthDay: Math.floor(birthDay),
    gender,
    locale: locale || 'zh-CN',
  })

  return result
})
