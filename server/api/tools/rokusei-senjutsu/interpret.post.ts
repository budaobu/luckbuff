import type { RokuseiInterpretTarget, RokuseiSenjutsuResult } from '~~/app/types/rokusei-senjutsu'
import { getAuthSession } from '~~/server/utils/auth-session'

type InterpretMode = 'target' | 'full'

interface InterpretBody {
  mode?: InterpretMode
  chart?: RokuseiSenjutsuResult
  target?: RokuseiInterpretTarget
  locale?: 'zh-CN' | 'zh-TW' | 'en'
}

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in English.', user: 'Please output all content in English.' },
}

function buildSystemPrompt(mode: InterpretMode, locale: string) {
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const shared = `你是“幽默隐士”，一位见多识广的六星占术解析者。
风格：结论先行、克制务实；能把六星、阴阳、十二运势和宿命周期翻译成生活节奏，不制造焦虑。
规则：只基于已排好的结果解读，不重算命盘，不用绝对断语，不提供医疗、法律或投资建议。${lang.system}`

  if (mode === 'target') {
    return `${shared}

只解读用户指定的六星元素：先给一句结论，再说明判定或周期原因，最后给一句现实校准。
输出 60-120 字纯文本；不要标题、列表、提问或复述标签。`
  }

  return `${shared}

生成完整六星占术报告。输出 900-1500 字纯文本，按以下标签逐行分段，标签后换行：
总论：
六星结构：
十二运势：
月日节奏：
宿命周期：
行动清单：
风险提醒：

每段必须绑定排盘证据；行动清单用 2-4 行“- ”开头。不要 JSON、Markdown 标题、代码块或开场白。`
}

function compactChart(chart: RokuseiSenjutsuResult) {
  return JSON.stringify({
    birth: chart.birth,
    bazi: chart.bazi,
    annual: chart.annual,
    monthly: chart.monthly,
    daily: chart.daily,
    activeFateCycle: chart.activeFateCycle,
    fateCycles: chart.fateCycles,
  })
}

function buildUserPrompt(body: InterpretBody) {
  const locale = body.locale || 'zh-CN'
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const context = compactChart(body.chart!).slice(0, 22000)

  if (body.mode === 'target') {
    const target = body.target || {}
    const label = (target.label || '六星元素').slice(0, 160)
    const section = (target.section || '六星排盘').slice(0, 120)
    const content = (target.content || '').slice(0, 2600)
    return `请解读以下六星占术元素。

【所在区域】${section}
【元素标签】${label}
【元素内容】${content}

【完整六星结果】
${context}

只解读该元素与整体六星结构的关系。${lang.user}`
  }

  return `请基于以下完整六星占术结果生成报告，覆盖命运星、阴阳、灵合状态、年月日周期和宿命大杀界。

【完整六星结果】
${context}

请给出可用于未来一年的节奏建议。${lang.user}`
}

function validateChart(chart: RokuseiSenjutsuResult | undefined) {
  return !!chart?.birth?.typeKey && Array.isArray(chart.annual.timeline)
    && chart.annual.timeline.length === 12
    && Array.isArray(chart.monthly) && chart.monthly.length === 12
    && Array.isArray(chart.fateCycles)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'

  if (!validateChart(body?.chart)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid Rokusei chart' })
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
  if (!config.aiBaseUrl || !config.aiApiKey || !config.aiModel) {
    throw createError({ statusCode: 503, statusMessage: 'AI service is not configured' })
  }

  const isOpenAi = ['openai', 'newapi', 'gptniux'].includes(config.aiProvider)
  const configuredTokens = Number(config.aiMaxTokens) || 8192
  const maxTokens = Math.min(mode === 'full' ? 12000 : 2048, configuredTokens)
  const systemPrompt = buildSystemPrompt(mode, locale)
  const userPrompt = buildUserPrompt(body!)
  const upstreamBody = isOpenAi
    ? {
        model: config.aiModel,
        messages: [
          { role: 'system', content: systemPrompt },
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
