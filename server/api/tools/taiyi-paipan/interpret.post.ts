import type { TaiyiPaipanInterpretTarget, TaiyiPaipanResult } from '~~/app/types/taiyi-paipan'
import { compactTaiyiPaipanContext } from '~~/server/utils/tools/taiyi-paipan'
import { getAuthSession } from '~~/server/utils/auth-session'

type InterpretMode = 'target' | 'full'

interface InterpretBody {
  mode?: InterpretMode
  chart?: TaiyiPaipanResult
  chartContext?: string
  target?: TaiyiPaipanInterpretTarget
  locale?: 'zh-CN' | 'zh-TW' | 'en'
}

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in English.', user: 'Please output all content in English.' },
}

function buildSystemPrompt(mode: InterpretMode, locale: string) {
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const shared = `你是“幽默隐士”，一位通透务实的太乙神数解析师。
规则：只基于已排好的太乙盘解读，不重新起局；结合太乙宫、文昌、始击、主客算与格局；结论务实温和，不用绝对断语，不提供医疗、法律或投资建议。${lang.system}`

  if (mode === 'target') {
    return `${shared}

这次只解读用户指定的盘面元素：先给一句结论，再说明盘面依据，最后给一句现实校准。
输出一段 60-120 字的纯文本；不要标题、列表、提问或复述标签。`
  }

  return `${shared}

请生成完整太乙神数排盘报告。输出 900-1500 字纯文本，按以下标签逐行分段，标签后换行：
总论：
太乙与主客：
十六宫重点：
八门格局：
时机与行动：
风险提醒：

每段必须绑定盘面证据；行动建议用 2-4 行“- ”开头。不要 JSON、Markdown 标题或多余开场白。`
}

function buildUserPrompt(body: InterpretBody) {
  const locale = body.locale || 'zh-CN'
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const context = (body.chartContext || '').slice(0, 22000)
  if (body.mode === 'target') {
    const target = body.target || {}
    const label = (target.label || '盘面元素').slice(0, 160)
    const section = (target.section || '太乙盘').slice(0, 120)
    const content = (target.content || '').slice(0, 2600)
    return `请解读以下太乙神数盘面元素。

【所在区域】${section}
【元素标签】${label}
【元素内容】${content}

【完整盘面摘要】
${context}

只解读该元素与全盘的直接关系。${lang.user}`
  }
  return `请基于以下完整太乙神数排盘摘要生成全盘 AI 报告。

【完整盘面】
${context}

请覆盖阴阳局、太乙落宫、主客算三将、十六宫神将、八门旺衰、格局与行动时机。${lang.user}`
}

function validateChart(chart: TaiyiPaipanResult | undefined) {
  return !!chart
    && !!chart.summary
    && Array.isArray(chart.pillars)
    && chart.pillars.length === 4
    && Array.isArray(chart.chart?.palaces)
    && chart.chart.palaces.length === 17
    && Array.isArray(chart.patterns)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'
  if (!validateChart(body?.chart)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid Taiyi chart' })
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
        catch { /* Ignore provider keep-alive lines. */ }
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
