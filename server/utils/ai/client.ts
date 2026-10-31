import { useRuntimeConfig } from '#imports'
import { jsonrepair } from 'jsonrepair'

// 转义字符串值内部的裸双引号。判定：引号两侧的有效字符（跳过空白）若都不是
// 结构字符（{[,: 或 :,}]），则视为内容引号。只在 JSON.parse 失败后的修复链里
// 调用，不会碰到合法 JSON（合法 JSON 的内容引号必然已转义）。
function escapeStrayQuotes(text: string): string {
  const out: string[] = []
  let escaped = false
  const isSpace = (c: string) => c === ' ' || c === '\t' || c === '\n' || c === '\r'
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (escaped) { out.push(ch); escaped = false; continue }
    if (ch === '\\') { out.push(ch); escaped = true; continue }
    if (ch !== '"') { out.push(ch); continue }
    let p = i - 1
    while (p >= 0 && isSpace(text[p]!)) p--
    let n = i + 1
    while (n < text.length && isSpace(text[n]!)) n++
    const prev = p >= 0 ? text[p]! : ''
    const next = n < text.length ? text[n]! : ''
    const structural = prev === '' || next === '' || '{[,:'.includes(prev) || ':,}]'.includes(next)
    out.push(structural ? '"' : '\\"')
  }
  return out.join('')
}

// 修复链：直接解析 → jsonrepair（换行/尾逗号/缺括号）→ 裸引号转义后再解析/修复
function parseTolerant(text: string): unknown {
  try { return JSON.parse(text) } catch { /* next */ }
  try { return JSON.parse(jsonrepair(text)) } catch { /* next */ }
  const unquoted = escapeStrayQuotes(text)
  try { return JSON.parse(unquoted) } catch { /* next */ }
  return JSON.parse(jsonrepair(unquoted))
}

const isOpenAiProvider = (provider: string) => {
  return provider === 'openai' || provider === 'newapi' || provider === 'gptniux'
}

interface CallAIJsonOptions {
  timeoutMs?: number
  maxTokens?: number
  model?: string
}

interface AICompletion {
  content: string
  finishReason?: string
  raw?: unknown
}

async function readOpenAiStream(upstream: Response): Promise<AICompletion> {
  const reader = upstream.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let content = ''
  let finishReason: string | undefined
  let raw: unknown

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue

        let chunk: any
        try {
          chunk = JSON.parse(payload)
        } catch {
          continue
        }
        raw = chunk
        if (chunk.error) {
          const message = chunk.error.message || chunk.error.code || 'AI streaming error'
          throw new Error(`AI 流返回错误: ${message}`)
        }

        const choice = chunk.choices?.[0]
        content += choice?.delta?.content ?? choice?.message?.content ?? ''
        if (choice?.finish_reason) finishReason = choice.finish_reason
      }
    }
  } finally {
    reader.releaseLock()
  }

  return { content, finishReason, raw }
}

async function requestOpenAiJson(
  config: { aiBaseUrl: unknown, aiApiKey: unknown },
  model: string,
  system: string,
  user: string,
  maxTokens: number,
  signal: AbortSignal,
): Promise<AICompletion> {
  const upstream = await fetch(config.aiBaseUrl as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.aiApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      stream: true,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
    signal,
  })

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '')
    throw new Error(`AI 服务错误 (${upstream.status})${text ? ': ' + text.slice(0, 300) : ''}`)
  }

  return readOpenAiStream(upstream)
}

async function callAIJsonOnce(system: string, user: string, opts: CallAIJsonOptions = {}): Promise<unknown> {
  const config = useRuntimeConfig()
  const provider = (config.aiProvider as string) || 'openai'
  const isOpenAi = isOpenAiProvider(provider)
  const configuredMaxTokens = Number(config.aiMaxTokens) || 8192
  let maxTokens = Math.min(opts.maxTokens ?? configuredMaxTokens, configuredMaxTokens)
  const model = opts.model || config.aiModel

  const controller = new AbortController()
  // The compatible gateway can take over a minute before its first byte. A
  // long ceiling also keeps large streamed translations from being cut midway.
  const timeoutMs = Math.max(opts.timeoutMs ?? 300_000, 20 * 60_000)
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let completion: AICompletion
  if (isOpenAi) {
    try {
      completion = await requestOpenAiJson(config, model, system, user, maxTokens, controller.signal)
    } finally {
      clearTimeout(timeout)
    }
  } else {
    const upstreamBody = {
      model,
      prompt: `${system}\n\n${user}`,
      stream: false,
      options: { num_predict: maxTokens },
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
    completion = {
      content: parsed?.response ?? parsed?.message?.content ?? '',
      finishReason: parsed?.done_reason,
      raw: parsed,
    }
  }

  if (typeof completion.content !== 'string' || !completion.content.trim()) {
    throw new Error(`AI 返回内容为空 [debug: finish_reason=${completion.finishReason}, raw=${JSON.stringify(completion.raw).slice(0, 500)}]`)
  }

  // Strip outer markdown fence (model may wrap despite instructions)
  let cleaned = completion.content.trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

  // Fast path
  try {
    return JSON.parse(cleaned)
  } catch (fastErr) {
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
        try { return parseTolerant(cleaned.slice(start, end + 1)) } catch { /* fall through */ }
      }
      // Quote-aware matching can desync on unescaped quotes inside strings;
      // greedy first-opener→last-closer + repair tolerates that.
      const lastClose = cleaned.lastIndexOf(closeChar)
      if (lastClose > start) {
        try { return parseTolerant(cleaned.slice(start, lastClose + 1)) } catch { /* fall through */ }
      }
    }
    const parseMsg = fastErr instanceof Error ? fastErr.message : String(fastErr)
    throw new Error(`AI 返回不是有效 JSON [debug: finish_reason=${completion.finishReason}, parseErr=${parseMsg}, contentLen=${cleaned.length}, tail=${JSON.stringify(cleaned.slice(-200))}]`)
  }
}

function isRetryableAIJsonError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return message.includes('AI 返回内容为空')
    || message.includes('AI 返回不是有效 JSON')
    || message.includes('AI 流返回错误')
    || message.includes('AI 服务错误 (429)')
    || /AI 服务错误 \(5\d\d\)/.test(message)
}

// The gateway occasionally returns an empty/malformed completion after a long
// wait. One structural retry is cheaper than surfacing avoidable admin errors.
export async function callAIJson(system: string, user: string, opts: CallAIJsonOptions = {}): Promise<unknown> {
  let lastError: unknown
  const configuredMaxTokens = Number(useRuntimeConfig().aiMaxTokens) || 8192
  let attemptMaxTokens = Math.min(opts.maxTokens ?? configuredMaxTokens, configuredMaxTokens)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await callAIJsonOnce(system, user, { ...opts, maxTokens: attemptMaxTokens })
    } catch (error) {
      lastError = error
      if (!isRetryableAIJsonError(error)) throw error
      const message = error instanceof Error ? error.message : String(error)
      const exhaustedBudget = /finish_reason=(length|max_tokens)/.test(message)
      if (exhaustedBudget && attemptMaxTokens < configuredMaxTokens) {
        console.warn(`[ai-json] output budget exhausted at ${attemptMaxTokens}; retrying with ${configuredMaxTokens}`)
        attemptMaxTokens = configuredMaxTokens
      }
    }
  }
  throw lastError
}
