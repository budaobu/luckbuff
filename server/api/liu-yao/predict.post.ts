import { runLiuYaoEngine } from '~~/server/utils/liuyao/engine'
import type { LiuYaoInput } from '~/types/liuyao'

// 通过 Open-Meteo API 实时查询城市坐标（免费无需 API Key）
// 注意：Open-Meteo 的 name 参数仅支持英文/拼音，不支持中文
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
    console.warn('[LiuYao] Open-Meteo API failed:', e)
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
        timezone: undefined, // Nominatim 不返回时区
      }
    }
  } catch (e) {
    console.warn('[LiuYao] Nominatim API failed:', e)
  }
  return null
}

// 判断是否为中文城市名（Open-Meteo 仅支持英文/拼音，需跳过直接用 Nominatim）
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
    subject_home,
    subject_away,
  } = body || {}

  // ===== 物理层校验 =====

  // 1. 行数完整性
  if (!Array.isArray(line_values) || line_values.length !== 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'fatal_error',
      message: '物理层熔断：爻值数组长度必须等于 6',
      data: { error_code: 'LINE_COUNT_MISMATCH', expected: 6, received: line_values?.length },
    })
  }

  // 2. 爻值范围校验
  const validValues = [6, 7, 8, 9]
  for (let i = 0; i < line_values.length; i++) {
    const v = line_values[i]
    if (!validValues.includes(v)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'fatal_error',
        message: `物理层熔断：第 ${i + 1} 爻值 ${v} 不合法，必须为正整数 6/7/8/9`,
        data: { error_code: 'INVALID_LINE_VALUE', index: i, value: v },
      })
    }
  }

  // 3. 能量守恒校验（line_values 必须是 3 枚硬币之和）
  // 6 = 2+2+2, 7 = 2+2+3, 8 = 2+3+3, 9 = 3+3+3
  // 实际上，由于我们只接受 6/7/8/9，这个校验已经隐含在范围校验中了
  // 但为了安全，仍显式校验
  for (let i = 0; i < line_values.length; i++) {
    const v = line_values[i]
    // 每个爻值必须是 3 枚硬币之和，且每枚只能是 2 或 3
    // 即 v 必须能表示为 3 个来自 {2,3} 的数之和
    // 6 = 2+2+2, 7 = 2+2+3, 8 = 2+3+3, 9 = 3+3+3
    // 等价于 v ∈ [6,9] 且 v 为整数，这已经由范围校验保证
    // 额外检查：不存在无法由 3 枚硬币组成的值
    const minSum = 2 * 3 // 3 枚都是 2
    const maxSum = 3 * 3 // 3 枚都是 3
    if (v < minSum || v > maxSum) {
      throw createError({
        statusCode: 400,
        statusMessage: 'fatal_error',
        message: `物理层熔断：第 ${i + 1} 爻值 ${v} 无法由三枚硬币（阴=2/阳=3）组合而成`,
        data: { error_code: 'ENERGY_CONSERVATION_VIOLATION', index: i, value: v },
      })
    }
  }

  // 4. 时间字段校验
  if (!cast_datetime || typeof cast_datetime !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'fatal_error',
      message: '物理层熔断：缺少起卦时间 cast_datetime',
      data: { error_code: 'MISSING_CAST_DATETIME' },
    })
  }

  // ===== 子时边界拦截 =====
  // 由后端引擎执行，但我们在调用前做前置检查以提供更快的响应
  const castDate = new Date(cast_datetime)
  const h = castDate.getHours()
  const m = castDate.getMinutes()
  const totalMinutes = h * 60 + m
  const isZiBoundary = totalMinutes >= 1350 || totalMinutes <= 90 // 22:30-01:30

  if (isZiBoundary) {
    const hasCoords = !!(location?.longitude && location?.latitude)
    // 有坐标就放行；有城市名则继续走到下方 API 解析逻辑
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
        subject_home,
        subject_away,
      }
    }
  }

  // ===== 调用引擎 =====
  try {
    // 如果只有城市名没有经纬度，尝试在 API 层解析坐标后注入
    // 即便 API 失败也放行，让引擎自己尝试查表
    let resolvedLocation = location
    if (resolvedLocation && resolvedLocation.city && !resolvedLocation.longitude) {
      // Open-Meteo 仅支持英文/拼音，中文城市名直接跳过
      let coords = null
      if (!isChineseCity(resolvedLocation.city)) {
        coords = await resolveCityCoordsViaApi(resolvedLocation.city)
      }
      // 备用 Nominatim API（支持所有语言）
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
      // API 失败也继续放行，让引擎自己处理
    }

    const enginePayload = {
      line_values,
      cast_datetime,
      location: resolvedLocation || undefined,
    }

    const result = await runLiuYaoEngine(enginePayload)

    // 如果引擎仍返回 system_pause（城市名无法解析为经纬度），放行让 AI 继续处理
    // 不再拦截用户，用户已提供了城市信息

    // 注入赛事信息（引擎不处理这些字段）
    result.subject_home = subject_home
    result.subject_away = subject_away

    // ===== 数据格式转换：引擎输出 → 前端期望 =====
    // 引擎: primary_hexagram / transformed_hexagram / nuclear_hexagram
    // 前端: hexagram.本卦 / hexagram.变卦 / hexagram.互卦
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

    // 时空参数：将 lunar 子字段提升到顶层供前端直接使用
    const lunar = result.temporal_context?.lunar || {}
    if (lunar) {
      result.temporal_context.月建 = lunar.month_build || ''
      result.temporal_context.日辰 = lunar.day_ganzhi || ''
      result.temporal_context.时辰 = lunar.time_ganzhi || ''
      result.temporal_context.旬空 = lunar.day_xunkong_text || ''
    }

    return result
  } catch (err: any) {
    // 引擎返回 fatal_error 的情况
    console.error('[LiuYao Engine Error]', err)

    // 尝试解析引擎的错误输出
    const errorMessage = err.message || String(err)

    // 如果引擎输出包含 JSON，尝试解析
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
