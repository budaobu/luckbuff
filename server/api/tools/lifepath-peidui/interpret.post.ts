import type { LifePathCalcResult } from '~~/server/utils/tools/lifepath-peidui-data'
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
  result?: LifePathCalcResult
  resultContext?: string
  target?: InterpretTarget
  title?: string
  locale?: 'zh-CN' | 'zh-TW' | 'en' | 'ja'
}

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in English.', user: 'Please output all content in English.' },
  ja: { system: '日本語で出力してください。', user: 'すべての内容を日本語で出力してください。' },
}

function buildSystemPrompt(mode: InterpretMode, locale: string) {
  const hook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const shared = `你是温和通透的生命灵数关系顾问。只基于已计算的生命灵数、符号类型、配对层级和相处维度解读；不预测确定事件，不用宿命论，不提供医疗、法律或投资建议。遇到控制、贬低或暴力，提示用户寻求现实支持。${hook.system}`

  if (mode === 'target') {
    return `${shared}

只解读用户指定的结果元素：先一句结论，再说明数字原因，最后一句现实校准。
输出一段 60-120 字纯文本；不要标题、列表、提问或复述标签。`
  }

  return `${shared}

生成 900-1500 字完整关系报告，输出纯文本，按标签逐行分段，标签后换行：
配对总览：
沟通与情绪：
相处节奏：
互补与张力：
成长课题：
行动清单：

每段必须绑定双方数字与层级证据；行动清单用 2-4 行“- ”开头。不要 JSON、Markdown 标题或开场白。`
}

function buildUserPrompt(body: InterpretBody) {
  const hook = LANGUAGE_HOOKS[body.locale || 'zh-CN'] ?? LANGUAGE_HOOKS['zh-CN']!
  const context = (body.resultContext || '').slice(0, 12000)

  if (body.mode === 'target') {
    const target = body.target || {}
    const label = (target.label || '配对元素').slice(0, 160)
    const section = (target.section || '配对结果').slice(0, 120)
    const group = (target.group || '').slice(0, 120)
    const content = (target.content || '').slice(0, 2600)
    return `请解读以下生命灵数配对元素。

【所在区域】${section}${group ? ` / ${group}` : ''}
【元素标签】${label}
【元素内容】${content}

【配对摘要】
${context}

只解读该元素与配对结构的直接关系。${hook.user}`
  }

  return `请基于以下完整配对摘要生成报告。

${context}

请覆盖双方数字、配对层级、沟通、情绪、生活方式、互补张力、成长课题与可执行建议。${hook.user}`
}

function validateResult(result: LifePathCalcResult | undefined) {
  return !!result?.personA?.profile
    && !!result?.personB?.profile
    && !!result?.matrix
    && Array.isArray(result?.dimensions)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'

  if (!validateResult(body?.result)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid life path pairing result' })
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
