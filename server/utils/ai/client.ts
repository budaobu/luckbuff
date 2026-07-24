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

  const cleaned = content
    .replace(/^```json\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('AI 返回不是有效 JSON')
  }
}
