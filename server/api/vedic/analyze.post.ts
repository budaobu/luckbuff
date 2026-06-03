import { resolveGeo } from './_utils/geo'
import { buildPrompt, VEDIC_SYSTEM_PROMPT } from './_utils/prompts'
import type { VedicChart, VedicDimension } from '~/types/vedic'

const VEDIC_SERVICE_URL = process.env.VEDIC_SERVICE_URL ?? 'http://127.0.0.1:8765'
const DEFAULT_DIMENSIONS: VedicDimension[] = ['core', 'career', 'love', 'annual']

interface AnalyzeBody {
  birthDate?: string
  birthTime?: string
  city?: string
  gender?: 'male' | 'female' | ''
  dimensions?: VedicDimension[]
  timeUncertain?: boolean
  locale?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AnalyzeBody>(event)
  const {
    birthDate, birthTime, city,
    gender = '', dimensions = DEFAULT_DIMENSIONS,
    timeUncertain = false,
    locale = 'zh-CN',
  } = body ?? {}

  if (!birthDate || !birthTime || !city) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birthDate / birthTime / city' })
  }

  const geo = await resolveGeo(city)
  if (!geo) {
    throw createError({ statusCode: 422, statusMessage: `无法解析城市：${city}` })
  }

  const [year, month, day] = birthDate.split('-').map(Number)
  const [hour, minute] = birthTime.split(':').map(Number)

  let chart: VedicChart
  try {
    chart = await $fetch<VedicChart>(`${VEDIC_SERVICE_URL}/chart`, {
      method: 'POST',
      body: { year, month, day, hour, minute, lat: geo.lat, lng: geo.lng, time_uncertain: timeUncertain },
      timeout: 10000,
    })
  } catch (e: any) {
    throw createError({ statusCode: 503, statusMessage: '星盘计算服务暂时不可用，请稍后重试' })
  }

  chart.cityName = geo.cityName

  const failed = chart.validations?.filter(v => !v.pass) ?? []
  if (failed.length) {
    console.warn('[vedic] validation warnings:', failed)
  }

  const { systemPrompt, userPrompt } = buildPrompt({
    chart, cityName: geo.cityName,
    dimensions: dimensions.length ? dimensions : DEFAULT_DIMENSIONS,
    gender, timeUncertain, locale,
  })

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  event._handled = true
  event.node.res.statusCode = 200
  const res = event.node.res
  // 禁用 TCP Nagle 算法，减少 SSE 延迟
  res.socket?.setNoDelay?.(true)
  const emit = (payload: Record<string, unknown>) => {
    const chunk = `data: ${JSON.stringify(payload)}\n\n`
    const ok = res.write(chunk)
    if (!ok) {
      res.socket?.setNoDelay?.(true)
    }
    // 尝试 flush（compression / Express 中间件会注入这个方法）
    if ('flush' in res && typeof (res as any).flush === 'function') {
      ;(res as any).flush()
    }
  }

  emit({ type: 'chart', chart })

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  const isGpt5 = (config.aiModel as string | undefined)?.startsWith('gpt-5')
  let maxTokens = Number(config.aiMaxTokens) || 81920
  if (maxTokens > 327680) maxTokens = 81920

  const upstreamBody = isOpenAi
    ? {
        model: config.aiModel,
        messages: [
          { role: 'system', content: systemPrompt || VEDIC_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        stream: true,
        max_tokens: maxTokens,
      }
    : {
        model: config.aiModel,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: true,
        options: { num_predict: maxTokens },
      }

  let upstream: Response
  try {
    upstream = await fetch(config.aiBaseUrl as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.aiApiKey}`,
      },
      body: JSON.stringify(upstreamBody),
    })
  } catch (e: any) {
    emit({ type: 'error', message: `AI 服务连接失败：${e?.message ?? e}` })
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '')
    emit({ type: 'error', message: `AI 服务错误 (${upstream.status})${text ? ': ' + text.slice(0, 300) : ''}` })
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) continue
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload) continue
        if (payload === '[DONE]') {
          continue
        }
        try {
          const parsed = JSON.parse(payload)
          const token = isOpenAi
            ? parsed.choices?.[0]?.delta?.content
            : (parsed.response ?? parsed.choices?.[0]?.delta?.content)
          if (token) emit({ type: 'text', text: token })
        } catch {
          // non-JSON chunk: ignore
        }
      }
    }
  } catch (e: any) {
    emit({ type: 'error', message: `读取 AI 流时出错：${e?.message ?? e}` })
  } finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
