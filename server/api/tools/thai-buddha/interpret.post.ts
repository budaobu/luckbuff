import { getAuthSession } from '~~/server/utils/auth-session'
import {
  compactThaiBuddhaContext,
  isValidThaiBuddhaResult,
  type ThaiBuddhaResult,
} from '~~/server/utils/tools/thai-buddha'

type InterpretMode = 'target' | 'full'

interface InterpretBody {
  mode?: InterpretMode
  result?: unknown
  target?: {
    label?: string
    section?: string
    group?: string
    content?: string
  }
  locale?: string
}

const LANGUAGE_HOOKS: Record<string, { system: string, user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in English.', user: 'Please output all content in English.' },
  ja: { system: '日本語で出力してください。', user: 'すべての内容を日本語で出力してください。' },
}

function buildSystemPrompt(mode: InterpretMode, locale: string) {
  const lang = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const shared = `你是“幽默隐士”，一位熟悉泰国星期佛、Thai Horasat 与 Maha Thaksa 的解读师。
风格：结论先行、温和务实；把佛姿、行星、颜色、方位与八宫翻译成现实观察。
规则：只基于已排好的星期佛结果解读；区分传统文化信仰与现实事实；不预测确定事件，不用绝对断语，不提供医疗、法律或投资建议。${lang.system}`

  if (mode === 'target') {
    return `${shared}

这次只解读用户指定的元素：先给一句结论，再说明佛姿或八宫依据，最后给一句现实校准。
输出一段 60-120 字纯文本；不要标题、列表、提问或复述标签。`
  }

  return `${shared}

请生成完整星期佛报告。输出 1000-1500 字纯文本，按以下标签逐行分段，标签后换行：
总论：
佛姿与象征：
性格与事业：
颜色与时机：
方位与八宫：
命名与选择：
行动清单：
边界提醒：

每段必须绑定佛姿、行星、颜色或八宫证据；行动清单用 2-4 行“- ”开头；不要 JSON、Markdown 标题、代码块或多余开场白。`
}

function buildUserPrompt(body: InterpretBody) {
  const locale = body.locale ?? 'zh-CN'
  const lang = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const context = compactThaiBuddhaContext(body.result as ThaiBuddhaResult).slice(0, 22000)

  if (body.mode === 'target') {
    const target = body.target ?? {}
    const label = (target.label ?? '星期佛元素').slice(0, 160)
    const section = (target.section ?? '泰国星期佛').slice(0, 120)
    const group = (target.group ?? '').slice(0, 120)
    const content = (target.content ?? '').slice(0, 2600)
    return `请解读以下泰国星期佛元素。

【所在区域】${section}${group ? ` / ${group}` : ''}
【元素标签】${label}
【元素内容】${content}

【完整结果摘要】
${context}

只解读该元素与整个星期佛结构的直接关系，忽略无关部分。${lang.user}`
  }

  return `请基于以下完整泰国星期佛结果生成登录用户专属报告。

【完整结果】
${context}

请覆盖佛姿故事、传统性格、事业倾向、日/幸运色与忌色、吉日、Maha Thaksa 八宫方位、泰文命名字母提示和行动建议。${lang.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'

  if (!body || !isValidThaiBuddhaResult(body.result)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid Thai Buddha result' })
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

  const locale = body!.locale ?? 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  if (!config.aiBaseUrl || !config.aiApiKey || !config.aiModel) {
    throw createError({ statusCode: 503, statusMessage: 'AI 服务未配置：aiBaseUrl、aiApiKey 与 aiModel 必须同时提供' })
  }

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
        if (!line || !line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const chunk = JSON.parse(payload)
          const token = isOpenAi
            ? chunk.choices?.[0]?.delta?.content
            : (chunk.response ?? chunk.choices?.[0]?.delta?.content)
          if (token) emit({ type: 'text', text: token })
        }
        catch { /* provider keep-alive */ }
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
