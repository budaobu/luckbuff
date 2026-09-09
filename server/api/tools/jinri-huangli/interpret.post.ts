import type { TodayAlmanac } from '~/types/today-almanac'
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
  day?: TodayAlmanac
  almanacContext?: string
  target?: InterpretTarget
  locale?: 'zh-CN' | 'zh-TW' | 'en'
}

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': {
    system: '请使用简体中文输出。',
    user: '请使用简体中文输出所有内容。',
  },
  'zh-TW': {
    system: '請使用繁體中文輸出。',
    user: '請使用繁體中文輸出所有內容。',
  },
  en: {
    system: 'Please output in English.',
    user: 'Please output all content in English.',
  },
}

function buildSystemPrompt(mode: InterpretMode, locale: string) {
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const shared = `你是“幽默隐士”，一位熟悉传统黄历的民俗文化讲解者。
风格：结论先行、简洁温和、有画面感；把黄历术语翻译成现代生活场景。
规则：只基于给定黄历结构解释传统文化含义，不预测确定事件，不用绝对断语，不提供医疗、法律或投资建议。${lang.system}`

  if (mode === 'target') {
    return `${shared}

这次只解读用户指定的黄历元素：先给一句结论，再说明传统结构原因，最后给一句现实场景建议。
输出一段 60-120 字纯文本；不要标题、列表、提问、复述标签，也不要展开其他黄历部分。`
  }

  return `${shared}

请生成完整今日黄历报告。输出 900-1500 字纯文本，按以下标签逐行分段，标签后换行：
今日总论：
宜忌节奏：
时辰安排：
方位冲煞：
颜色搭配：
节气与仪式感：
行动清单：

每段必须绑定黄历证据；行动清单用 2-4 行“- ”开头。不要 JSON、Markdown 标题、代码块或多余开场白。`
}

function buildUserPrompt(body: InterpretBody) {
  const locale = body.locale || 'zh-CN'
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const context = (body.almanacContext || '').slice(0, 22000)

  if (body.mode === 'target') {
    const target = body.target || {}
    const label = (target.label || '黄历元素').slice(0, 160)
    const section = (target.section || '今日黄历').slice(0, 120)
    const group = (target.group || '').slice(0, 120)
    const content = (target.content || '').slice(0, 2600)

    return `请解读以下今日黄历元素。

【所在区域】${section}
【元素标签】${label}
【元素内容】${content}

【当日黄历摘要】
${context}

只解读该元素与当日黄历的直接关系，忽略无关部分。${lang.user}`
  }

  return `请基于以下完整当日黄历摘要，生成完整黄历报告。

【完整黄历】
${context}

请覆盖宜忌、时辰、方位冲煞、颜色、节气和可执行建议。${lang.user}`
}

function validateDay(day: TodayAlmanac | undefined): day is TodayAlmanac {
  return !!day
    && typeof day.date === 'string'
    && !!day.lunar
    && typeof day.lunar.dayGanZhi === 'string'
    && Array.isArray(day.yi)
    && Array.isArray(day.ji)
    && Array.isArray(day.hours)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'

  if (!validateDay(body?.day)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid almanac day' })
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
  const systemPrompt = buildSystemPrompt(mode, locale)
  const userPrompt = buildUserPrompt({ ...body!, mode })

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
    if ('flush' in res && typeof (res as any).flush === 'function') {
      ;(res as any).flush()
    }
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
