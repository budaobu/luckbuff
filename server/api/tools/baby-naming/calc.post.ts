import { defineEventHandler, readBody, createError } from 'h3'
import { generateBabyNames, type BabyInfo, type NameGender, type NameLength, type StyleKey, STYLE_KEYS } from '~~/server/utils/baby-naming/engine'
import { NAMING_CHAR_POOL } from '~~/server/utils/baby-naming/chars'

export default defineEventHandler(async (event) => {
  const body = await readBody<BabyInfo & { locale?: string }>(event)

  if (!body?.surname || typeof body.surname !== 'string' || body.surname.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid surname' })
  }

  const surname = body.surname.trim()
  if (surname.length > 2) {
    throw createError({ statusCode: 400, statusMessage: 'Surname too long (max 2 chars)' })
  }

  const gender: NameGender = (['male', 'female', 'neutral'].includes(body.gender as string) ? body.gender : 'neutral') as NameGender
  const nameLength: NameLength = (body.nameLength === 1 || body.nameLength === 2 ? body.nameLength : 2) as NameLength

  const birthYear = Number(body.birthYear)
  const birthMonth = Number(body.birthMonth)
  const birthDay = Number(body.birthDay)
  const birthHour = body.birthHour === null || body.birthHour === undefined ? null : Number(body.birthHour)

  if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > 2100) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birth year' })
  }
  if (!Number.isInteger(birthMonth) || birthMonth < 1 || birthMonth > 12) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birth month' })
  }
  if (!Number.isInteger(birthDay) || birthDay < 1 || birthDay > 31) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birth day' })
  }
  if (birthHour !== null && (!Number.isInteger(birthHour) || birthHour < 0 || birthHour > 23)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birth hour' })
  }

  // 校验喜欢的字/避讳的字是否在字库中
  const likedChars = (body.likedChars ?? []).filter(c => NAMING_CHAR_POOL.some(x => x.char === c))
  const avoidedChars = (body.avoidedChars ?? []).filter(c => typeof c === 'string' && c.length === 1)

  // 风格偏好归一化
  const stylePreference: Partial<Record<StyleKey, number>> = {}
  if (body.stylePreference && typeof body.stylePreference === 'object') {
    for (const key of STYLE_KEYS) {
      const v = body.stylePreference[key]
      if (typeof v === 'number' && v >= 0 && v <= 100) {
        stylePreference[key] = v
      }
    }
  }

  const result = generateBabyNames({
    surname,
    gender,
    birthYear,
    birthMonth,
    birthDay,
    birthHour,
    nameLength,
    generationChar: body.generationChar?.trim(),
    likedChars,
    avoidedChars,
    stylePreference,
    filters: body.filters,
  })

  return result
})
