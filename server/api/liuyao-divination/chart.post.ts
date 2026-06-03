import { runLiuYaoEngine } from '~~/server/utils/liuyao/engine'
import type { LineValue } from '~/types/liuyao'

// 通过 Open-Meteo API 实时查询城市坐标（免费无需 API Key）
async function resolveCityCoordsViaApi(city: string): Promise<{ longitude: number; latitude: number; timezone?: string } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (data.results && data.results.length > 0) {
      return {
        longitude: data.results[0].longitude,
        latitude: data.results[0].latitude,
        timezone: data.results[0].timezone,
      }
    }
  } catch (e) {
    console.warn('[LiuyaoDivination] Open-Meteo API failed:', e)
  }
  return null
}

// 通过 Nominatim API 备用查询城市坐标
async function resolveCityCoordsViaNominatim(city: string): Promise<{ longitude: number; latitude: number; timezone?: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&accept-language=zh`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LuckBuff/1.0' },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data && data.length > 0) {
      return {
        longitude: parseFloat(data[0].lon),
        latitude: parseFloat(data[0].lat),
        timezone: undefined,
      }
    }
  } catch (e) {
    console.warn('[LiuyaoDivination] Nominatim API failed:', e)
  }
  return null
}

function isChineseCity(city: string): boolean {
  return /[一-龥]/.test(city)
}

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
    question,
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
        question: question || '',
      }
    }
  }

  // ===== 调用引擎 =====
  try {
    let resolvedLocation = location
    if (resolvedLocation && resolvedLocation.city && !resolvedLocation.longitude) {
      let coords = null
      if (!isChineseCity(resolvedLocation.city)) {
        coords = await resolveCityCoordsViaApi(resolvedLocation.city)
      }
      if (!coords) {
        coords = await resolveCityCoordsViaNominatim(resolvedLocation.city)
      }
      if (coords) {
        resolvedLocation = {
          ...resolvedLocation,
          longitude: coords.longitude,
          latitude: coords.latitude,
          timezone: coords.timezone || resolvedLocation.timezone,
        }
      }
    }

    const enginePayload = {
      line_values,
      cast_datetime,
      location: resolvedLocation || undefined,
    }

    const result = await runLiuYaoEngine(enginePayload)

    // 注入问事内容
    result.question = question || ''

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
    console.error('[LiuyaoDivination Engine Error]', err)
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
