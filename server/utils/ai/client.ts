import { useRuntimeConfig } from '#imports'

const isOpenAiProvider = (provider: string) => {
  return provider === 'openai' || provider === 'newapi' || provider === 'gptniux'
}

interface CallAIJsonOptions {
  timeoutMs?: number
  maxTokens?: number
}

export async function callAIJson(system: string, user: string, opts: CallAIJsonOptions = {}): Promise<unknown> {
  const config = useRuntimeConfig()
  const provider = (config.aiProvider as string) || 'openai'
  const isOpenAi = isOpenAiProvider(provider)
  let maxTokens = opts.maxTokens ?? (Number(config.aiMaxTokens) || 8192)
  if (maxTokens > 327680) maxTokens = 8192

  const upstreamBody = isOpenAi
    ? {
        model: config.aiModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        stream: false,
        max_tokens: maxTokens,
      }
    : {
        model: config.aiModel,
        prompt: `${system}\n\n${user}`,
        stream: false,
        options: { num_predict: maxTokens },
      }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000)

  let upstream: Response
  try {
    upstream = await fetch(config.aiBaseUrl as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.aiApiKey}`,
      },
      body: JSON.stringify(upstreamBody),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '')
    throw new Error(`AI 服务错误 (${upstream.status})${text ? ': ' + text.slice(0, 300) : ''}`)
  }

  const parsed = await upstream.json().catch(() => null)
  if (!parsed) {
    throw new Error('AI 返回解析失败')
  }

  const content = isOpenAi
    ? parsed.choices?.[0]?.message?.content
    : (parsed.response ?? parsed.message?.content)

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('AI 返回内容为空')
  }

  // Strip outer markdown fence (model may wrap despite instructions)
  let cleaned = content.trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

  // Fast path
  try {
    return JSON.parse(cleaned)
  } catch {
    // Slow path: find and extract the outermost JSON object or array.
    // Handles prose before/after the JSON, or partial fences mid-content.
    const firstBrace = cleaned.indexOf('{')
    const firstBracket = cleaned.indexOf('[')
    let start = -1
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace
    } else if (firstBracket !== -1) {
      start = firstBracket
    }
    if (start !== -1) {
      const closeChar = cleaned[start] === '{' ? '}' : ']'
      const openChar = cleaned[start]!
      let depth = 0, inString = false, escape = false, end = -1
      for (let i = start; i < cleaned.length; i++) {
        const ch = cleaned[i]!
        if (escape) { escape = false; continue }
        if (ch === '\\' && inString) { escape = true; continue }
        if (ch === '"') { inString = !inString; continue }
        if (inString) continue
        if (ch === openChar) depth++
        else if (ch === closeChar) { depth--; if (depth === 0) { end = i; break } }
      }
      if (end !== -1) {
        try { return JSON.parse(cleaned.slice(start, end + 1)) } catch { /* fall through */ }
      }
    }
    throw new Error('AI 返回不是有效 JSON')
  }
}
