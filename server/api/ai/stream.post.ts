export default defineEventHandler(async (event) => {
  let body: any
  try {
    body = await readBody(event)
  } catch (e: any) {
    throw createError({ statusCode: 400, message: `readBody failed: ${e.message || e}` })
  }

  const { prompt, systemPrompt, stream: requestStream } = body || {}

  const config = useRuntimeConfig()

  const isOpenAiFormat = config.aiProvider === 'openai' || config.aiProvider === 'newapi'

  const isGpt5 = config.aiModel?.startsWith('gpt-5')
  let maxTokens = Number(config.aiMaxTokens) || 8192
  // 防止 env 里填了过大的值导致上游拒绝
  if (maxTokens > 32768) maxTokens = 8192

  const upstreamBody = isOpenAiFormat
    ? {
        model: config.aiModel,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        stream: requestStream === true,
        max_tokens: maxTokens,
      }
    : {
        model: config.aiModel,
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        stream: requestStream === true,
        options: { num_predict: maxTokens },
      }

  const response = await fetch(config.aiBaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.aiApiKey}`,
    },
    body: JSON.stringify(upstreamBody),
  })

  if (!response.ok) {
    let message = `AI 服务错误 (${response.status})`
    let rawBody = ''
    try {
      rawBody = await response.text()
      const errorData = JSON.parse(rawBody)
      message = errorData.error?.message || JSON.stringify(errorData)
    } catch {
      if (rawBody) message += ` | ${rawBody.slice(0, 500)}`
    }
    throw createError({
      statusCode: response.status,
      message: `${message} | promptLen=${prompt?.length ?? 0} bodyLen=${JSON.stringify(upstreamBody).length}`,
    })
  }

  // 流式模式：直接 pipe 上游 SSE 流到客户端
  if (requestStream === true) {
    event.node.res.statusCode = 200
    event.node.res.setHeader('Content-Type', 'text/event-stream')
    event.node.res.setHeader('Cache-Control', 'no-cache, no-transform')
    event.node.res.setHeader('Connection', 'keep-alive')

    if (response.body) {
      const reader = response.body.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          event.node.res.write(value)
        }
      } finally {
        event.node.res.end()
      }
    } else {
      event.node.res.end()
    }
    return
  }

  // 非流式：读取上游 JSON 响应
  const data = await response.json()

  // 如果上游返回了 error 字段，直接透传错误信息
  if (data.error) {
    throw createError({
      statusCode: data.error.status || 500,
      message: data.error.message || JSON.stringify(data.error),
    })
  }

  // 尝试从 AI 回复内容中提取 JSON（兼容 gpt-5 可能包裹 markdown 代码块的情况）
  const aiContent = data.choices?.[0]?.message?.content || data.content || data.response || ''
  if (aiContent) {
    let jsonStr = aiContent.trim()
    // 去掉可能的 markdown 代码块标记
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }
    try {
      const parsed = JSON.parse(jsonStr)
      // 把解析后的结构化数据放到 data.interpretation 字段中
      data.interpretation = parsed
    } catch (e) {
      // 解析失败时，保留原始 content，前端可以降级为文本展示
      data.interpretation = null
    }
  }

  return data
})
