import type { Wuxing, PlantRecommendation } from './data/plants'
import { getSeasonFromMonth, deriveXiYong, derivePlants, WUXING_LABELS, SEASON_NAMES } from './data/plants'

interface CalcInput {
  name: string
  birthdate: string
  gender?: 'male' | 'female'
  preferredElement?: Wuxing
  placement?: string
}

interface LuckyPlantCalcResult {
  profile: {
    name: string
    birthDate: string
    gender?: 'male' | 'female'
  }
  derived: {
    season: string
    seasonLabel: string
    natalElement: Wuxing
    natalElementLabel: string
    xiYong: Wuxing
    xiYongLabel: string
    reasoning: string
  }
  recommendations: PlantRecommendation[]
}

function normalizeBirthDate(birthDate: string): string {
  const digits = birthDate.replace(/\D/g, '')
  if (digits.length !== 8) {
    throw createError({ statusCode: 400, statusMessage: 'Birthdate must be YYYY-MM-DD format' })
  }
  const year = Number(digits.slice(0, 4))
  const month = Number(digits.slice(4, 6))
  const day = Number(digits.slice(6, 8))
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthdate values' })
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function buildReasoning(seasonLabel: string, natalElementLabel: string, xiYongLabel: string): string {
  return `出生于${seasonLabel}季，先天五行偏${natalElementLabel}旺；根据「旺则宜泄」的原则，喜用${xiYongLabel}行植物来流通气场、催旺财运。`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CalcInput>(event)

  if (!body?.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid name' })
  }
  if (!body?.birthdate || typeof body.birthdate !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid birthdate' })
  }

  const normalizedDate = normalizeBirthDate(body.birthdate)
  const month = Number(normalizedDate.slice(5, 7))
  const { season, element: natalElement } = getSeasonFromMonth(month)

  const xiYong = body.preferredElement || deriveXiYong(natalElement)
  const recommendations = derivePlants(xiYong, body.placement)

  const result: LuckyPlantCalcResult = {
    profile: {
      name: body.name.trim(),
      birthDate: normalizedDate,
      gender: body.gender,
    },
    derived: {
      season,
      seasonLabel: SEASON_NAMES[season] || '',
      natalElement,
      natalElementLabel: WUXING_LABELS[natalElement],
      xiYong,
      xiYongLabel: WUXING_LABELS[xiYong],
      reasoning: buildReasoning(
        SEASON_NAMES[season] || '',
        WUXING_LABELS[natalElement],
        WUXING_LABELS[xiYong],
      ),
    },
    recommendations,
  }

  return result
})
