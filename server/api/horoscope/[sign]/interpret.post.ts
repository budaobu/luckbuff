import { getAuthSession } from '~~/server/utils/auth-session'
import { HOROSCOPE_SIGN_SLUGS, isHoroscopeSignSlug } from '~~/app/utils/horoscope/signs'
import type { HoroscopeResult } from '~~/app/types/horoscope'

type InterpretMode = 'target' | 'full'
type DisplayLocale = 'zh-CN' | 'zh-TW' | 'en' | 'ja'

interface InterpretTarget {
  label?: string
  section?: string
  content?: string
}

interface InterpretBody {
  mode?: InterpretMode
  chart?: HoroscopeResult
  chartContext?: string
  target?: InterpretTarget
  locale?: DisplayLocale
}

const LANGUAGE_HOOKS: Record<DisplayLocale, { system: string; user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in English.', user: 'Please output all content in English.' },
  ja: { system: '日本語で出力してください。', user: 'すべての内容を日本語で出力してください。' },
}

function validateChart(chart: HoroscopeResult | undefined) {
  return !!chart
    && isHoroscopeSignSlug(chart.sign?.slug)
    && (HOROSCOPE_SIGN_SLUGS as readonly string[]).includes(chart.sign.slug)
    && !!chart.scores
    && Array.isArray(chart.sky?.planets)
    && Array.isArray(chart.sky?.aspects)
}

function buildSystemPrompt(mode: InterpretMode, locale: DisplayLocale) {
  const lang = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const shared = `你是“幽默隐士”，一位把占星信号翻译成现实节奏的运势解读助手。
风格：结论先行、简洁务实、温和通透；不卖焦虑，不使用绝对断语。
规则：只基于当日星座与天象结构解读，不预测确定事件，不提供医疗、法律或投资建议。${lang.system}`

  if (mode === 'target') {
    return `${shared}

这次只解读用户指定的星座运势元素：先给一句结论，再说明星象原因，最后给一句现实校准。
输出一段 60-120 字纯文本；不要标题、列表、提问或复述标签。`
  }

  return `${shared}

请生成完整星座运势解读。输出 900-1400 字纯文本，按以下标签逐行分段，标签后换行：
总论：
爱情：
工作：
财富：
健康：
幸运参数：
星象依据：
行动清单：

每段必须绑定分数、相位或月亮星座证据；行动清单用 2-4 行“- ”开头。不要 JSON、Markdown 标题、代码块或多余开场白。`
}

function buildUserPrompt(body: InterpretBody) {
  const locale = body.locale || 'zh-CN'
  const lang = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const context = (body.chartContext || '').slice(0, 22000)

  if (body.mode === 'target') {
    const target = body.target || {}
    const label = (target.label || '星座运势').slice(0, 160)
    const section = (target.section || '星座运势').slice(0, 120)
    const content = (target.content || '').slice(0, 2600)
    return `请解读以下星座运势元素。\n\n【所在区域】${section}\n【元素标签】${label}\n【元素内容】${content}\n\n【当日星座摘要】\n${context}\n\n只解读该元素与本日星座的直接关系，忽略无关部分。${lang.user}`
  }

  return `请基于以下星座与当日天象摘要，生成完整 AI 解读。\n\n【完整星座运势】\n${context}\n\n请覆盖分项分数、月亮星座、关键相位、幸运参数与现实行动。${lang.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'

  if (!validateChart(body?.chart)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid horoscope result' })
  }
  if (mode === 'target' && !body?.target?.label?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing interpretation target' })
  }
  if (mode === 'full') {
    const session = await getAuthSession(event)
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: 'Sign in to view the full report' })
    }
  }

  const locale = body!.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  const configuredTokens = Number(config.aiMaxTokens) || 8192
  const maxTokens = Math.min(mode === 'full' ? 12000 : 2048, configuredTokens)

  const upstreamBody = isOpenAi
    ? {
        model: config.aiModel,
        messages: [
          { role: 'system', content: buildSystemPrompt(mode, locale) },
          { role: 'user', content: buildUserPrompt({ ...body!, mode }) },
        ],
        stream: true,
        max_tokens: maxTokens,
      }
    : {
        model: config.aiModel,
        prompt: `${buildSystemPrompt(mode, locale)}\n\n${buildUserPrompt({ ...body!, mode })}`,
        stream: true,
        options: { num_predict: maxTokens },
      }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  const res = event.node.res
  res.socket?.setNoDelay?.(true)
  const emit = (payload: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
    if ('flush' in res && typeof (res as any).flush === 'function') (res as any).flush()
  }

  let upstream: Response
  try {
    upstream = await fetch(config.aiBaseUrl as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.aiApiKey}` },
      body: JSON.stringify(upstreamBody),
    })
  }
  catch (error) {
    emit({ type: 'error', message: `AI 服务连接失败：${error instanceof Error ? error.message : error}` })
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    emit({ type: 'error', message: `AI 服务错误（${upstream.status}）${detail.slice(0, 240)}` })
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
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const chunk = JSON.parse(payload)
          const token = isOpenAi
            ? chunk.choices?.[0]?.delta?.content
            : (chunk.response ?? chunk.choices?.[0]?.delta?.content)
          if (token) emit({ type: 'text', text: token })
        }
        catch { /* ignore provider keep-alive */ }
      }
    }
  }
  catch (error) {
    emit({ type: 'error', message: `读取 AI 流失败：${error instanceof Error ? error.message : error}` })
  }
  finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
