import {
  NUMERIC_ENERGY_SCENARIOS,
  analyzeNumericEnergy,
  buildNumericEnergyPromptData,
  type NumericEnergyScenario,
} from '~~/server/utils/tools/numeric-energy'

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in English.', user: 'Please output all content in English.' },
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!

  return `你是熟悉民间数字能量学的轻松解读助手。基于系统已重新计算的数据生成解读，不预测确定命运。
${langHook.system}

## 角色与语气
- 幽默、温和、克制，有隐士般的观察感，但不使用恐吓、医疗、法律或投资建议口吻
- 相克组合写成张力、筛选或提醒，不写成绝对凶险
- 输出中不出现“幽默隐士”“隐士”等自称或字样

## 输出协议（严格逐行输出）
TITLE: 场景化短标题（不超过 12 字，英文不超过 6 词）
SCORE: 复述展示分数与柔和评语（一句话）
SUMMARY: 一段总评（一句话）
STAR: 数字 | 星曜 | 含义（每个出现的星曜一行）
COMBO: 组合 | 寓意（挑 3-5 个最值得注意的相邻组合；单一数字可省略）
TIP: 轻量行动建议（共 2-3 行）
DISCLAIMER: 说明这是常见体系之一，版本较多，仅供娱乐参考

除上述行之外不要输出任何 markdown 标题、列表标记、前言或总结。`
}

function buildUserPrompt(scenario: NumericEnergyScenario, promptData: string, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  return `场景类型补充：${scenario}\n\n【已重算核心数据】\n${promptData}\n\n请按系统提示的结构解读。\n${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ scenario?: NumericEnergyScenario; input?: unknown; locale?: string }>(event)
  if (!body?.scenario || !NUMERIC_ENERGY_SCENARIOS.includes(body.scenario)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid scenario' })
  }

  // Recalculate server-side instead of trusting an analysis payload from the client.
  const result = analyzeNumericEnergy(body.scenario, body.input)
  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = ['openai', 'newapi', 'gptniux'].includes(config.aiProvider)
  let maxTokens = Number(config.aiMaxTokens) || 1200
  maxTokens = Math.min(maxTokens, 900)

  const upstreamBody = isOpenAi
    ? {
        model: config.aiModel,
        messages: [
          { role: 'system', content: buildSystemPrompt(locale) },
          { role: 'user', content: buildUserPrompt(result.scenario, buildNumericEnergyPromptData(result), locale) },
        ],
        stream: true,
        max_tokens: maxTokens,
      }
    : {
        model: config.aiModel,
        prompt: `${buildSystemPrompt(locale)}\n\n${buildUserPrompt(result.scenario, buildNumericEnergyPromptData(result), locale)}`,
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
