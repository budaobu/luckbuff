import { runQimenEngine } from '~~/server/utils/qimen'
import type { QimenChartRequest } from '~/types/qimen'
import type { QimenEnginePayload } from '~~/server/utils/qimen'

function getShiChenHour(d: Date): number {
  // 时辰：子(23-1) 丑(1-3) 寅(3-5) ... 亥(21-23)
  const h = d.getHours()
  if (h >= 23 || h < 1) return 0
  return Math.floor((h - 1) / 2) + 1
}

export default defineEventHandler(async (event) => {
  const body = await readBody<QimenChartRequest>(event)

  if (!body?.question_type) {
    throw createError({ statusCode: 400, statusMessage: 'Missing question_type' })
  }

  const dt = new Date()
  const tz = body.timezone || 'Asia/Shanghai'

  // 解析 location 字符串为 country + city
  let locationCountry = ''
  let locationCity = body.location || ''
  if (locationCity.includes(',')) {
    const parts = locationCity.split(',').map(s => s.trim())
    locationCity = parts[0] || ''
    locationCountry = parts[1] || ''
  }

  const payload: QimenEnginePayload = {
    question_type: body.question_type,
    question_label: body.question_label,
    question_goals: body.question_goals,
    datetime: dt.toISOString(),
    timezone: tz,
    calendar_type: 'solar',
    location: {
      country: locationCountry || '中国',
      city: locationCity || '北京',
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

    // 过滤后返回核心字段
    return {
      normalized_input: result.normalized_input,
      calendar: result.calendar,
      ganzhi: result.ganzhi,
      chart: result.chart,
      warnings: result.warnings || [],
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
