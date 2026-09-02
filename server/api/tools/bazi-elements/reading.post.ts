import {
  analyzeBaziElements,
  buildBaziElementsPrompt,
  type BaziElementsInput,
} from '~~/server/utils/tools/bazi-elements'

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in natural English.', user: 'Please output all content in English.' },
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!

  return `你是冷静、务实的八字五行调节顾问。系统已经完成确定性排盘，你不能重新排盘，也不能把缺项简单等同于必须补充。
${langHook.system}

## 解读原则
- 先看日主旺衰、喜用与忌神，再解释五行分布的含义。
- “缺失”只代表命局计数弱或不见，调节建议必须结合喜用判断。
- 用日常可执行的色彩、环境、作息、食物、运动与方位来表达，不做医疗、投资、法律建议。
- 不使用恐吓或宿命断言，不给数字评分。

## 输出协议（严格逐行输出）
OV: 一句话点题，说明命局五行的主要特点
GAP: 解释缺失或偏弱项，以及它们和喜用的关系
USE: 解释喜用如何引导调节方向
ADJUST: 给出优先调节顺序与原因
TIP: 一条具体可执行建议
TIP: 再一条具体可执行建议
NOTE: 温和的文化娱乐参考提醒

除上述行之外，不要输出 markdown、标题、列表标记、前言或总结。`
}

function buildUserPrompt(input: BaziElementsInput, promptData: string, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const hour = input.birthHour || '未知'

  return `请解读以下已重算的八字五行分布。

【输入】
- 性别：${input.gender === 'male' ? '男' : '女'}
- 阳历生日：${input.birthDate}
- 时辰：${hour}

【已重算核心数据】
${promptData}

请按系统提示的逐行协议解读，重点解释“缺口 + 喜用”的组合，而不是只复述缺项。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<BaziElementsInput> & { locale?: string }>(event)
  if (body?.gender !== 'male' && body?.gender !== 'female') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid gender' })
  }
  if (!body.birthDate) throw createError({ statusCode: 400, statusMessage: 'Missing birthDate' })

  const result = analyzeBaziElements({
    gender: body.gender,
    birthDate: body.birthDate,
    birthHour: body.birthHour,
    name: body.name,
  })
  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = ['openai', 'newapi', 'gptniux'].includes(config.aiProvider)
  const maxTokens = Math.min(Number(config.aiMaxTokens) || 1000, 900)
  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt({
    gender: body.gender,
    birthDate: body.birthDate,
    birthHour: body.birthHour,
    name: body.name,
  }, buildBaziElementsPrompt(result), locale)

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
    const chunk = `data: ${JSON.stringify(payload)}\n\n`
    res.write(chunk)
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
    emit({ type: 'error', message: `AI service error (${upstream.status})${text ? `: ${text.slice(0, 240)}` : ''}` })
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
          const token = isOpenAi
            ? parsed.choices?.[0]?.delta?.content
            : (parsed.response ?? parsed.choices?.[0]?.delta?.content)
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
