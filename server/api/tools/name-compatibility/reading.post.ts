import {
  analyzeNameCompatibility,
  buildNameCompatibilityPrompt,
  type NameCompatibilityInput,
} from '~~/server/utils/name-compatibility/engine'

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in natural English.', user: 'Please output all content in English.' },
}

function buildSystemPrompt(locale: string): string {
  const hook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  return `你是温和的姓名关系观察者。系统已经用五格剖象法完成确定性计算，你不能重新排盘，也不能给出缘分百分比。
${hook.system}

## 解读原则
* 只解释人格五行、总格数理与关系信号，不预测婚期、离婚、复合或具体事件。
* 相同五行写成共振，相生写成滋养，相克写成张力或磨合，不做绝对吉凶。
* 建议落在沟通节奏、边界、分工、共同活动与情绪表达。

## 输出协议（严格逐行输出）
OV: 一句话概括两人姓名场的关系基调
MATCH: 解释人格五行相同、相生或相克的互动方式
GRID: 解释双方总格数理与共同或注意信号
FLOW: 给出相处节奏与互补方向
TIP: 一条具体沟通或相处建议
TIP: 再一条具体建议
NOTE: 温和的文化娱乐参考提醒

除上述行之外，不要输出 markdown、百分比、标题、列表或总结。`
}

function buildUserPrompt(input: NameCompatibilityInput, promptData: string, locale: string): string {
  const hook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  return `请解读以下姓名配对数据。\n\n【已重算核心数据】\n${promptData}\n\n请按逐行协议解读。${hook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<NameCompatibilityInput> & { locale?: string }>(event) as NameCompatibilityInput & { locale?: string }
  const result = await analyzeNameCompatibility(body)
  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = ['openai', 'newapi', 'gptniux'].includes(config.aiProvider)
  const maxTokens = Math.min(Number(config.aiMaxTokens) || 900, 800)
  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body, buildNameCompatibilityPrompt(result), locale)
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

  emit({ type: 'result', result })

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
    emit({ type: 'error', message: `AI service error (${upstream.status})${text ? `: ${text.slice(0, 220)}` : ''}` })
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
          const token = isOpenAi ? parsed.choices?.[0]?.delta?.content : (parsed.response ?? parsed.choices?.[0]?.delta?.content)
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
