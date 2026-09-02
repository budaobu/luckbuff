import type { DiZhi } from '~/types/user'
import { buildNewSchoolPromptData, calcNewSchoolBazi, type NewSchoolGender } from '~~/server/utils/tools/new-school-bazi'

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in English.', user: 'Please output all content in English.' },
}

const METHOD_NOTICE: Record<string, string> = {
  'zh-CN': '本工具采用新派方法论，结论可能与传统子平八字不同。',
  'zh-TW': '本工具採用新派方法論，結論可能與傳統子平八字不同。',
  en: 'This tool uses the New School methodology; results may differ from traditional Zi Ping BaZi.',
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!

  return `你是一位说人话的命理观察者，气质接近一位住在山边的幽默隐士：看得很淡，讲得清楚，偶尔轻巧地开个玩笑。你使用李涵辰新派体系的简化规则：地支只看本气，天干与天干、地支与地支相邻作用而隔位不作用，先判旺衰再取用神，格局仅作辅助；命局缺字按虚字标注，不改判原局。
输出要有观点，但不恐吓、不神化、不做医疗法律投资建议，不预言确定事件。不要称自己为“隐士”，也不要在输出中出现“幽默隐士”“隐士”等字样。
${langHook.system}

## 输出协议
严格逐行输出，不使用 Markdown 标题、列表符号、代码块或前后导语：
TITLE: 新派命局短标题，不超过 10 字
SUMMARY: 用两句话说清旺衰、用神和整体节奏
POINT: 关键推演 1，不超过 36 字
POINT: 关键推演 2，不超过 36 字
POINT: 关键推演 3，不超过 36 字
ACTION: 可执行提示，不超过 28 字
ACTION: 可执行提示，不超过 28 字
DISCLAIMER: 一句话说明这是方法论框架下的文化解读，仅供参考

语气要克制、口语化、有画面感；术语后用半角括号补一个短注。`
}

function buildUserPrompt(promptData: string, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  return `【已重算新派核心数据】
${promptData}

请按 system prompt 的逐行协议输出，不要复述本提示，不要输出方法论差异声明。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    gender?: NewSchoolGender
    birthDate?: string
    birthHour?: DiZhi | null
    name?: string
    locale?: string
  }>(event)

  if (!body?.gender || !['male', 'female'].includes(body.gender)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid gender' })
  }
  if (!body?.birthDate || typeof body.birthDate !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid birthDate' })
  }

  const [year, month, day] = body.birthDate.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate format' })
  }

  const chart = calcNewSchoolBazi(year, month, day, body.birthHour ?? null, body.gender)
  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()

  if (!config.aiBaseUrl || !config.aiApiKey || !config.aiModel) {
    throw createError({ statusCode: 503, statusMessage: 'AI service is not configured' })
  }

  const isOpenAi = ['openai', 'newapi', 'gptniux'].includes(config.aiProvider)
  let maxTokens = Number(config.aiMaxTokens) || 1200
  maxTokens = Math.min(maxTokens, 1200)

  const upstreamBody = isOpenAi
    ? {
        model: config.aiModel,
        messages: [
          { role: 'system', content: buildSystemPrompt(locale) },
          { role: 'user', content: buildUserPrompt(buildNewSchoolPromptData(chart), locale) },
        ],
        stream: true,
        max_tokens: maxTokens,
      }
    : {
        model: config.aiModel,
        prompt: `${buildSystemPrompt(locale)}\n\n${buildUserPrompt(buildNewSchoolPromptData(chart), locale)}`,
        stream: true,
        options: { num_predict: maxTokens },
      }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  event._handled = true
  event.node.res.statusCode = 200
  const res = event.node.res
  res.socket?.setNoDelay?.(true)

  const emit = (payload: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
    if ('flush' in res && typeof (res as any).flush === 'function') (res as any).flush()
  }

  emit({ type: 'text', text: `METHOD: ${METHOD_NOTICE[locale] ?? METHOD_NOTICE['zh-CN']}\n` })

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
  catch (error: any) {
    emit({ type: 'error', message: error?.message || 'AI service connection failed' })
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '')
    emit({ type: 'error', message: `AI service error (${upstream.status})${text ? `: ${text.slice(0, 240)}` : ''}` })
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
          const parsed = JSON.parse(payload)
          const token = isOpenAi
            ? parsed.choices?.[0]?.delta?.content
            : (parsed.response ?? parsed.choices?.[0]?.delta?.content)
          if (token) emit({ type: 'text', text: token })
        }
        catch {}
      }
    }
  }
  catch (error: any) {
    emit({ type: 'error', message: error?.message || 'AI stream failed' })
  }
  finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
