type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

function extractSseText(chunk: unknown): string {
  const value = chunk as {
    choices?: Array<{ delta?: { content?: unknown }, message?: { content?: unknown } }>
    response?: unknown
  }
  return String(
    value.choices?.[0]?.delta?.content
      ?? value.choices?.[0]?.message?.content
      ?? value.response
      ?? '',
  )
}

function textEvent(text: string): Uint8Array {
  // Endpoints support either the OpenAI or Ollama shape. Including both lets
  // the central retry remain transparent to every existing SSE parser.
  const payload = JSON.stringify({
    choices: [{ delta: { content: text } }],
    response: text,
  })
  return new TextEncoder().encode(`data: ${payload}\n\ndata: [DONE]\n\n`)
}

// The AI gateway intermittently closes an SSE completion with no choices even
// though the request is valid. Existing tool endpoints each have private SSE
// loops, so retrying here repairs every reader without changing their behavior.
export function wrapFetchWithEmptyAiStreamRetry(
  fetchLike: FetchLike,
  upstreamUrl: string,
  minOutputTokens = 8192,
  maxOutputTokens = minOutputTokens,
): FetchLike {
  const withOutputTokens = (baseInit: RequestInit | undefined, tokens: number) => {
    if (!baseInit?.body || typeof baseInit.body !== 'string') return baseInit
    try {
      const body = JSON.parse(baseInit.body) as {
        max_tokens?: unknown
        options?: { num_predict?: unknown }
      }
      let changed = false
      if (typeof body.max_tokens === 'number' && body.max_tokens < tokens) {
        body.max_tokens = tokens
        changed = true
      }
      if (typeof body.options?.num_predict === 'number' && body.options.num_predict < tokens) {
        body.options.num_predict = tokens
        changed = true
      }
      return changed ? { ...baseInit, body: JSON.stringify(body) } : baseInit
    } catch {
      return baseInit
    }
  }

  return async (input, init) => {
    const requestUrl = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url
    const requestInit = requestUrl === upstreamUrl
      ? withOutputTokens(init, minOutputTokens)
      : init

    const response = await fetchLike(input, requestInit)
    const contentType = response.headers.get('content-type') ?? ''
    if (requestUrl !== upstreamUrl || !response.ok || !response.body || !contentType.includes('text/event-stream')) {
      return response
    }

    const retryInput = input instanceof Request ? input.clone() : input
    const fallbackInput = input instanceof Request ? input.clone() : input
    const firstReader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let hasContent = false
    let finishReason: string | undefined
    let secondReader: ReadableStreamDefaultReader<Uint8Array> | null = null
    let downstreamClosed = false

    const parse = (value: Uint8Array) => {
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const chunk = JSON.parse(payload)
          if (extractSseText(chunk).trim()) hasContent = true
          const reason = chunk.choices?.[0]?.finish_reason ?? chunk.done_reason
          if (reason) finishReason = String(reason)
        } catch { /* provider keep-alive or comment */ }
      }
    }

    const pump = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) return
        if (downstreamClosed) {
          await reader.cancel().catch(() => {})
          return
        }
        try {
          controller?.enqueue(value)
        } catch {
          downstreamClosed = true
          await reader.cancel().catch(() => {})
          return
        }
        parse(value)
      }
    }

    let controller: ReadableStreamDefaultController<Uint8Array> | null = null
    const stream = new ReadableStream<Uint8Array>({
      start(streamController) {
        controller = streamController
        void (async () => {
          try {
            await pump(firstReader)

            if (!hasContent && !downstreamClosed) {
              // Reasoning models can exhaust a small endpoint budget before
              // emitting visible content. Escalate to the deployment maximum.
              let retryBody: unknown
              try {
                retryBody = requestInit?.body && typeof requestInit.body === 'string'
                  ? JSON.parse(requestInit.body)
                  : null
              } catch { retryBody = null }
              const currentTokens = typeof retryBody?.max_tokens === 'number'
                ? retryBody.max_tokens
                : retryBody?.options?.num_predict
              const exhaustedBudget = finishReason === 'length' || finishReason === 'max_tokens'
              const escalatedInit = exhaustedBudget && typeof currentTokens === 'number' && currentTokens < maxOutputTokens
                ? withOutputTokens(requestInit, maxOutputTokens)
                : requestInit
              if (escalatedInit !== requestInit) {
                console.warn(`[ai-stream] output budget exhausted at ${currentTokens}; retrying with ${maxOutputTokens}`)
              } else {
                console.warn('[ai-stream] empty completion; retrying once')
              }
              const second = await fetchLike(retryInput, escalatedInit)
              if (!second.ok || !second.body) {
                const detail = await second.text().catch(() => '')
                controller?.enqueue(textEvent(`AI 服务暂时没有返回内容 (${second.status})${detail ? `: ${detail.slice(0, 160)}` : ''}`))
              } else {
                secondReader = second.body.getReader()
                await pump(secondReader)
                if (!hasContent && !downstreamClosed) {
                  console.error('[ai-stream] retry completion was also empty')
                  // The gateway sometimes hangs the stream until it closes
                  // without choices, while the same request succeeds non-stream.
                  let baseBody: Record<string, unknown> | null = null
                  try {
                    const rawBody = init?.body ?? (fallbackInput instanceof Request
                      ? await fallbackInput.clone().text()
                      : '')
                    baseBody = typeof rawBody === 'string' && rawBody.trim()
                      ? JSON.parse(rawBody)
                      : null
                  } catch { /* keep streaming-only behavior */ }

                  if (baseBody && typeof baseBody === 'object') {
                    const fallback = await fetchLike(fallbackInput, {
                      ...escalatedInit,
                      body: JSON.stringify({ ...baseBody, stream: false }),
                    })
                    const payload = await fallback.json().catch(() => null) as {
                      choices?: Array<{ message?: { content?: unknown } }>
                      response?: unknown
                    } | null
                    const text = payload?.choices?.[0]?.message?.content ?? payload?.response
                    if (fallback.ok && typeof text === 'string' && text.trim()) {
                      controller?.enqueue(textEvent(text))
                      hasContent = true
                    } else if (!downstreamClosed) {
                      const detail = typeof text === 'string' ? text.slice(0, 160) : ''
                      controller?.enqueue(textEvent(`AI 服务暂时没有返回内容 (${fallback.status})${detail ? `: ${detail}` : ''}`))
                    }
                  } else if (!downstreamClosed) {
                    controller?.enqueue(textEvent('AI 返回内容为空，请重试'))
                  }
                }
              }
            }

            if (!downstreamClosed) {
              // Preserve a terminator if the upstream omitted it after an error.
              controller?.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              controller?.close()
            }
          } catch (error) {
            console.error('[ai-stream] retry failed:', error)
            if (!downstreamClosed) {
              try {
                controller?.enqueue(textEvent('AI 服务连接中断，请重试'))
                controller?.close()
              } catch { /* client already disconnected */ }
            }
          }
        })()
      },
      cancel() {
        downstreamClosed = true
        void firstReader.cancel().catch(() => {})
        void secondReader?.cancel().catch(() => {})
      },
    })

    return new Response(stream, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  }
}
