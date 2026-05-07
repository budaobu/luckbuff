import type { ZhouyiAiInterpretation } from '~/types/zhouyi'

export function useAiStream() {
  const content = ref('')
  const interpretation = ref<ZhouyiAiInterpretation | null>(null)
  const streaming = ref(false)
  const started = ref(false)
  const error = ref<string | null>(null)

  async function startStream(prompt: string, systemPrompt?: string, useStream = false) {
    content.value = ''
    interpretation.value = null
    streaming.value = true
    started.value = false
    error.value = null

    const requestBody = JSON.stringify({ prompt, systemPrompt, stream: useStream })

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      })

      if (!response.ok) {
        const responseText = await response.text()
        let errMsg = `HTTP ${response.status}`
        try {
          const errData = JSON.parse(responseText)
          errMsg = errData.message || errData.statusMessage || JSON.stringify(errData)
        } catch { /* ignore */ }
        throw new Error(errMsg)
      }

      const contentType = response.headers.get('content-type') || ''
      const isEventStream = contentType.includes('text/event-stream')

      if (!isEventStream) {
        // 非流式响应：直接读取完整 JSON
        const data = await response.json()

        // 优先使用服务端解析好的结构化数据
        if (data.interpretation) {
          interpretation.value = data.interpretation
          started.value = true
          // 同时拼接成文本用于兜底展示
          content.value = Object.entries(data.interpretation)
            .map(([k, v]) => `## ${k}\n${v}`)
            .join('\n\n')
        } else {
          // 降级：读取原始文本
          const text = data.choices?.[0]?.message?.content
            || data.content
            || data.response
            || ''
          if (text) {
            started.value = true
            content.value = text
          }
        }
      } else {
        // SSE 流式响应（暂不支持结构化解析）
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          for (const line of decoder.decode(value).split('\n').filter(Boolean)) {
            const raw = line.startsWith('data: ') ? line.slice(6) : line
            if (raw === '[DONE]') continue
            try {
              const data = JSON.parse(raw)
              const token = data.response
                ?? data.choices?.[0]?.delta?.content
              if (token) {
                if (!started.value) started.value = true
                content.value += token
              }
            } catch { /* 非 JSON 行忽略 */ }
          }
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      streaming.value = false
    }
  }

  function reset() {
    content.value = ''
    interpretation.value = null
    streaming.value = false
    started.value = false
    error.value = null
  }

  return { content, interpretation, streaming, started, error, startStream, reset }
}
