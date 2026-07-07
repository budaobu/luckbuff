import { runLiuYaoEngine } from '~~/server/utils/liuyao/engine'
import type { LineValue } from '~/types/liuyao'

export default defineEventHandler(async (event) => {
  let body: any
  try {
    body = await readBody(event)
  } catch (e: any) {
    throw createError({ statusCode: 400, message: `读取请求体失败: ${e.message || e}` })
  }

  const {
    line_values,
    cast_datetime,
    location,
    description,
    lastSeenTime,
    lastSeenPlace,
    lostItemDesc,
    relationship,
  } = body || {}

  // ===== 物理层校验 =====
  if (!Array.isArray(line_values) || line_values.length !== 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'fatal_error',
      message: '物理层熔断：爻值数组长度必须等于 6',
      data: { error_code: 'LINE_COUNT_MISMATCH', expected: 6, received: line_values?.length },
    })
  }

  const validValues = [6, 7, 8, 9]
  for (let i = 0; i < line_values.length; i++) {
    const v = line_values[i]
    if (!validValues.includes(v)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'fatal_error',
        message: `物理层熔断：第 ${i + 1} 爻值 ${v} 不合法，必须为 6/7/8/9`,
        data: { error_code: 'INVALID_LINE_VALUE', index: i, value: v },
      })
    }
  }

  if (!cast_datetime || typeof cast_datetime !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'fatal_error',
      message: '物理层熔断：缺少起卦时间 cast_datetime',
      data: { error_code: 'MISSING_CAST_DATETIME' },
    })
  }

  // ===== 子时边界拦截 =====
  const castDate = new Date(cast_datetime)
  const h = castDate.getHours()
  const m = castDate.getMinutes()
  const totalMinutes = h * 60 + m
  const isZiBoundary = totalMinutes >= 1350 || totalMinutes <= 90

  if (isZiBoundary) {
    const hasCoords = !!(location?.longitude && location?.latitude)
    if (!hasCoords && !location?.city) {
      return {
        status: 'system_pause',
        error_code: 'ZI_HOUR_BOUNDARY_UNCALIBRATED',
        message: '时空确证拦截：当前处于子时交接边界（22:30–01:30），日干支存在切换风险。请提供起卦地点坐标或输入所在城市，以完成真太阳时绝对校准。',
        temporal_context: {
          detected_time: cast_datetime,
          zi_boundary_policy: {
            sensitive_window: '22:30-01:30',
            requirement: 'requires location.longitude / location.latitude or location.city',
          },
        },
        label_order_input: 'bottom-up',
        label_order_source: 'default-bottom-up',
        lines_top_down: [],
        transformed_lines_top_down: [],
        hexagram: null,
        seeking_context: {
          description: description || '',
          lastSeenTime: lastSeenTime || '',
          lastSeenPlace: lastSeenPlace || '',
          lostItemDesc: lostItemDesc || '',
          relationship: relationship || '',
        },
      }
    }
  }

  // ===== 调用引擎 =====
  try {
    const enginePayload = {
      line_values,
      cast_datetime,
      location: location || undefined,
    }

    const result = await runLiuYaoEngine(enginePayload)

    // 注入寻物上下文
    result.seeking_context = {
      description: description || '',
      lastSeenTime: lastSeenTime || '',
      lastSeenPlace: lastSeenPlace || '',
      lostItemDesc: lostItemDesc || '',
      relationship: relationship || '',
    }

    // 数据格式转换：引擎输出 → 前端期望
    const primary = result.primary_hexagram
    const transformed = result.transformed_hexagram
    const nuclear = result.nuclear_hexagram
    const shiYing = result.shi_ying || {}

    result.hexagram = {
      本卦: primary?.name || '',
      变卦: transformed?.name || '',
      互卦: nuclear?.name || '',
      世爻位: shiYing.shi_label || '',
      应爻位: shiYing.ying_label || '',
    }

    const lunar = result.temporal_context?.lunar || {}
    if (lunar) {
      result.temporal_context.月建 = lunar.month_build || ''
      result.temporal_context.日辰 = lunar.day_ganzhi || ''
      result.temporal_context.时辰 = lunar.time_ganzhi || ''
      result.temporal_context.旬空 = lunar.day_xunkong_text || ''
    }

    return result
  } catch (err: any) {
    console.error('[LiuyaoSeeking Engine Error]', err)
    const errorMessage = err.message || String(err)

    let parsedResult: any = null
    const jsonMatch = errorMessage.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        parsedResult = JSON.parse(jsonMatch[0])
      } catch {
        // ignore
      }
    }

    if (parsedResult && parsedResult.status) {
      return parsedResult
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'fatal_error',
      message: `排盘引擎错误: ${errorMessage.slice(0, 200)}`,
      data: { error_code: 'ENGINE_EXECUTION_FAILED' },
    })
  }
})
