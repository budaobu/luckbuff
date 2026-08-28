import { createLiuyaoFootballPrediction } from '~~/server/utils/football/prediction'
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

  try {
    return await createLiuyaoFootballPrediction({
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      competition: body.competition || '',
      venue: body.venue || '',
      kickoff: new Date(body.kickoff).toISOString(),
      castAt: body.castAt && !Number.isNaN(new Date(body.castAt).getTime())
        ? new Date(body.castAt).toISOString()
        : new Date().toISOString(),
      timezone: body.timezone || 'Asia/Shanghai',
    })
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: error instanceof Error ? error.message : 'Liuyao engine unavailable',
    })
  }
})
