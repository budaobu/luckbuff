import { createLiurenFootballPrediction } from '~~/server/utils/football/prediction'
import type { FootballPredictionRequest } from '~/types/football-prediction'

export default defineEventHandler(async (event) => {
  const body = await readBody<FootballPredictionRequest>(event)

  if (!body?.homeTeam?.trim() || !body?.awayTeam?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'homeTeam and awayTeam are required' })
  }
  if (body.homeTeam.trim() === body.awayTeam.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'homeTeam and awayTeam must be different' })
  }
  if (!body?.kickoff || Number.isNaN(new Date(body.kickoff).getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'A valid kickoff is required' })
  }
  if (!body?.birthYear || body.birthYear < 1900 || body.birthYear > 2100) {
    throw createError({ statusCode: 400, statusMessage: 'A birth year between 1900 and 2100 is required' })
  }

  try {
    return await createLiurenFootballPrediction({
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      competition: body.competition || '',
      venue: body.venue || '',
      kickoff: new Date(body.kickoff).toISOString(),
      castAt: body.castAt || new Date().toISOString(),
      timezone: body.timezone || 'Asia/Shanghai',
      birthYear: body.birthYear,
    })
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Liuren prediction unavailable',
    })
  }
})
