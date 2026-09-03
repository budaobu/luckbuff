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

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位温和通达的佛教文化讲解者，为用户介绍其生肖对应的本命佛（守护神），并给出修行与生活启示。
${langHook.system}

## 角色与语气
- 语气温和、正信、不迷信；结合佛教文化传统但避免过度神秘化
- 结论先行，内容实在
- 所有内容视为传统文化参考，非宗教劝诱

## 输出协议（严格逐行输出，每行一个字段，前缀后空一格，不要任何标题、序号、加粗或 markdown 标记）
OV: 一句话点题（本命佛 + 核心寓意，30 字以内）
SYM: 本命佛的佛教含义（名号含义与象征，50 字以内）
CHAR: 与生肖的性格关联（该生肖者的典型性格特质与守护关系，40 字以内）
WORK: 事业与人生提示（本命佛对事业方向的正面指引，40 字以内）
LOVE: 感情与人际提示（本命佛对感情人际的正面启示，40 字以内）
TIP: 一条修行或生活建议（佩戴/念诵/行善等具体建议，40 字以内）
NOTE: 一句温和的收口语（30 字以内）

## 约束
- 严格遵守行前缀 OV: / SYM: / CHAR: / WORK: / LOVE: / TIP: / NOTE:，每个前缀单独成行、整行不换行
- 不鼓励购买贵重法器或商业行为
- 除上述行之外不输出任何其它内容`
}

function buildUserPrompt(zodiac: string, buddha: string, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `请为以下生肖介绍其本命佛：

【生肖】${zodiac}
【本命佛】${buddha}

请严格按系统提示的逐行协议输出解读，结论先行。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const { zodiac, buddha, locale = 'zh-CN' } = await readBody<{ zodiac: string; buddha: string; locale?: string }>(event)

  if (!zodiac || !buddha) {
    throw createError({ statusCode: 400, statusMessage: 'Missing zodiac or buddha' })
  }

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(zodiac, buddha, locale)

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
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  event._handled = true
  event.node.res.statusCode = 200
  const res = event.node.res
  res.socket?.setNoDelay?.(true)

  const emit = (payload: Record<string, unknown>) => {
    const chunk = `data: ${JSON.stringify(payload)}\n\n`
    const ok = res.write(chunk)
    if (!ok) res.socket?.setNoDelay?.(true)
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
        if (!line || !line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
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
