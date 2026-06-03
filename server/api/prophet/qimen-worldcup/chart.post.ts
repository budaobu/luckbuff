import { runQimenEngine } from '~~/server/utils/qimen'
import type { QimenWorldcupRequest } from '~/types/qimen-worldcup'
import type { QimenEnginePayload } from '~~/server/utils/qimen'

export default defineEventHandler(async (event) => {
  const body = await readBody<QimenWorldcupRequest>(event)

  if (!body?.homeTeam || !body?.awayTeam || !body?.matchTime) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields: homeTeam, awayTeam, matchTime' })
  }

  const dt = new Date(body.matchTime)
  if (isNaN(dt.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid matchTime' })
  }

  const tz = body.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'

  // 解析 venue 为 city, country
  let locationCity = body.venue || ''
  let locationCountry = ''
  if (locationCity) {
    const parts = locationCity.split(',').map(s => s.trim())
    locationCity = parts[0] || ''
    locationCountry = parts[parts.length - 1] || ''
  }

  const payload: QimenEnginePayload = {
    question_type: 'other',
    question_label: `${body.homeTeam} vs ${body.awayTeam}`,
    question_goals: ['can_succeed'],
    datetime: dt.toISOString(),
    timezone: tz,
    calendar_type: 'solar',
    location: {
      country: locationCountry || '未知',
      city: locationCity || '未知',
    },
    output_style: 'brief',
  }

  try {
    const result = await runQimenEngine(payload)

    if (result.status === 'fatal_error') {
      throw createError({
        statusCode: 500,
        statusMessage: result.message || 'Engine fatal error',
      })
    }

    if (result.status === 'system_pause') {
      throw createError({
        statusCode: 503,
        statusMessage: result.message || 'System pause',
      })
    }

    return {
      match: {
        homeTeam: body.homeTeam,
        awayTeam: body.awayTeam,
        matchTime: body.matchTime,
        venue: body.venue,
      },
      chart: {
        normalized_input: result.normalized_input,
        calendar: result.calendar,
        ganzhi: result.ganzhi,
        chart: result.chart,
        warnings: result.warnings || [],
      },
    }
  } catch (err: any) {
    const msg = err?.message || String(err)
    if (msg.includes('qimen-engine.py not found')) {
      throw createError({
        statusCode: 503,
        statusMessage: '排盘引擎未就绪，请联系管理员部署 qimen-engine.py',
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: msg.slice(0, 200),
    })
  }
})
