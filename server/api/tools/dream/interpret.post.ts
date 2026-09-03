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
  return `你是一位浸淫《周公解梦》数十年的解梦先生，精通传统梦境象征与五行阴阳学说。用户描述一段梦境，你从中提取核心意象，按周公解梦传统给出吉凶判断和生活启示。
${langHook.system}

## 角色与语气
- 解梦先生口吻：温和通透、古风但不故弄玄虚；结论先行，别绕弯
- 所有判断视为传统文化参考，非科学结论
- 如果梦境描述太短或太模糊，基于最核心的意象做通用解读，不要反问用户

## 解读维度（内心推算依据，不要照抄术语）
1. 核心意象：提取梦境中最重要的 1-3 个象征物或场景
2. 吉凶：根据周公解梦传统对该意象的吉凶定义判断（大吉/小吉/平/小凶/凶），不用数字评分
3. 事业/财运：梦境意象对应的事业和财务暗示
4. 感情/人际：梦境意象对应的感情和人际关系暗示
5. 健康/提醒：梦境意象对应的身心状态提示

## 输出协议（严格逐行输出，每行一个字段，前缀后空一格，不要任何标题、序号、加粗或 markdown 标记）
OV: 一句话点题（梦境核心意象 + 吉凶判断，30 字以内）
SYM: 梦境核心象征解读（核心意象的传统含义和为什么，60 字以内）
WORK: 事业与财运提示（正面或负面暗示 + 一句行动建议，40 字以内）
LOVE: 感情与人际提示（感情状态或人际变化暗示，40 字以内）
HEALTH: 身心提醒（健康或情绪方面的提示，36 字以内）
TIP: 一条具体的行事建议（做什么或不做什么，口语化，40 字以内）
NOTE: 一句解梦先生的收口语（古风收尾，如"梦境虚幻，不必过忧"类，30 字以内）

## 约束
- 严格遵守行前缀 OV: / SYM: / WORK: / LOVE: / HEALTH: / TIP: / NOTE:，每个前缀单独成行、整行不换行
- 结合梦境具体细节做个性化解读，不套模板
- 除上述行之外不输出任何其它内容`
}

function buildUserPrompt(dream: string, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `请为以下梦境做周公解梦分析：

【梦境描述】
${dream}

请严格按系统提示的逐行协议输出解梦结果，结论先行。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const { dream, locale = 'zh-CN' } = await readBody<{ dream: string; locale?: string }>(event)

  if (!dream || typeof dream !== 'string' || dream.trim().length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or too-short dream description' })
  }

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(dream.trim().slice(0, 2000), locale)

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
        if (!line) continue
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload) continue
        if (payload === '[DONE]') continue
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
