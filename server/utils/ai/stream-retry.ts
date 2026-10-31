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
export function wrapFetchWithEmptyAiStreamRetry(fetchLike: FetchLike, upstreamUrl: string): FetchLike {
  return async (input, init) => {
    const requestUrl = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url
    const response = await fetchLike(input, init)
    const contentType = response.headers.get('content-type') ?? ''
    if (requestUrl !== upstreamUrl || !response.ok || !response.body || !contentType.includes('text/event-stream')) {
      return response
    }

    const retryInput = input instanceof Request ? input.clone() : input
    const firstReader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let hasContent = false
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
          if (extractSseText(JSON.parse(payload)).trim()) hasContent = true
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
              console.warn('[ai-stream] empty completion; retrying once')
              const second = await fetchLike(retryInput, init)
              if (!second.ok || !second.body) {
                const detail = await second.text().catch(() => '')
                controller?.enqueue(textEvent(`AI 服务暂时没有返回内容 (${second.status})${detail ? `: ${detail.slice(0, 160)}` : ''}`))
              } else {
                secondReader = second.body.getReader()
                await pump(secondReader)
                if (!hasContent && !downstreamClosed) {
                  console.error('[ai-stream] retry completion was also empty')
                  controller?.enqueue(textEvent('AI 返回内容为空，请重试'))
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
