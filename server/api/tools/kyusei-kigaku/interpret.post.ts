import type { KyuseiPaipanResult } from '~~/app/types/kyusei-kigaku'
import { getAuthSession } from '~~/server/utils/auth-session'

type InterpretMode = 'target' | 'full'

interface InterpretTarget {
  selector?: string
  label?: string
  section?: string
  group?: string
  content?: string
}

interface InterpretBody {
  mode?: InterpretMode
  chart?: KyuseiPaipanResult
  chartContext?: string
  target?: InterpretTarget
  locale?: 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko'
}

const LANGUAGE_HOOKS: Record<string, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
}

function buildSystemPrompt(mode: InterpretMode, locale: string) {
  const language = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const shared = `You are a practical Nine Star Ki reader. Lead with a clear conclusion, use only the supplied chart, avoid fear-based language, and do not give medical, legal, or investment advice. Write every word in ${language}.`

  if (mode === 'target') {
    return `${shared}

Interpret only the selected chart element. Output one plain-text paragraph of 60-120 words: conclusion, evidence from the supplied stars or palace, then one practical adjustment. No headings, lists, questions, or labels.`
  }

  return `${shared}

Generate a complete Nine Star Ki report in ${language}. Use 900-1500 words of plain text with six short locale-native headings in this order: overview, natal stars and inclined palace, four boards, favorable and caution directions, compatibility, action list. Bind every claim to a supplied star, palace, board, or signal. In the action list use 2-4 lines beginning with "- ". Do not use JSON, code blocks, or Markdown heading syntax.`
}

function buildUserPrompt(body: InterpretBody) {
  const locale = body.locale || 'zh-CN'
  const language = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const context = (body.chartContext || '').slice(0, 22000)

  if (body.mode === 'target') {
    const target = body.target || {}
    const label = (target.label || 'chart element').slice(0, 160)
    const section = (target.section || 'chart').slice(0, 120)
    const group = (target.group || '').slice(0, 120)
    const content = (target.content || '').slice(0, 2600)
    return `Interpret this Nine Star Ki element in ${language}.

Section: ${section}${group ? ` / ${group}` : ''}
Label: ${label}
Content: ${content}

Chart summary:
${context}

Use only this element and its direct relation to the whole chart.`
  }

  return `Use this complete Nine Star Ki chart summary to generate the full report in ${language}.

${context}
`
}

function compactContext(chart: KyuseiPaipanResult) {
  const stars = (item: KyuseiPaipanResult['natal']['yearStar']) => `${item.star}/${item.element}/${item.direction}`
  return [
    `birth=${chart.basic.birthDate} ${chart.basic.birthHour} ${chart.basic.timezone} solarYear=${chart.basic.solarYear}`,
    `natal year=${stars(chart.natal.yearStar)} month=${stars(chart.natal.monthStar)} day=${stars(chart.natal.dayStar)} hour=${stars(chart.natal.hourStar)}`,
    `inclinedPalace=${chart.natal.inclinedPalace.palace}/${chart.natal.inclinedPalace.direction}${chart.natal.inclinedPalace.centerAdjusted ? ' center-adjusted' : ''}`,
    chart.boards.map(board => `${board.key} center=${board.centerStar}; ${board.stars.map(item => `${item.star}@${item.direction}`).join(',')}; signals=${board.signals.map(item => `${item.key}@${item.direction}`).join(',') || 'none'}`).join('\n'),
    `compatibility=${chart.compatibility.primary} score=${chart.compatibility.score}; affinities=${chart.compatibility.affinities.map(item => `${item.star}:${item.relation}`).join(',')}`,
    `rules=${chart.methodology.engine}; ${chart.methodology.yearBoundary}; ${chart.methodology.monthBoundary}; ${chart.methodology.hourRule}`,
  ].join('\n')
}

function validateChart(chart: KyuseiPaipanResult | undefined) {
  return !!chart
    && [chart.natal.yearStar, chart.natal.monthStar, chart.natal.dayStar, chart.natal.hourStar].every(item => item.star >= 1 && item.star <= 9)
    && Array.isArray(chart.boards) && chart.boards.length === 4
    && chart.boards.every(board => board.stars.length === 9)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'

  if (!validateChart(body?.chart)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid Nine Star Ki chart' })
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.aiApiKey}`,
      },
      body: JSON.stringify(upstreamBody),
    })
  }
  catch (error) {
    emit({ type: 'error', message: `AI connection failed: ${error instanceof Error ? error.message : error}` })
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    emit({ type: 'error', message: `AI error (${upstream.status}) ${detail.slice(0, 240)}` })
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
        catch { /* Provider keep-alive. */ }
      }
    }
  }
  catch (error) {
    emit({ type: 'error', message: `AI stream failed: ${error instanceof Error ? error.message : error}` })
  }
  finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
