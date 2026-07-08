import type { AstroFortuneTuneCalcResult, AstroFortuneTuneReading } from '~/types/astro-fortune-tune'

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': {
    system: '请使用简体中文输出。',
    user: '请使用简体中文输出所有内容。',
  },
  'zh-TW': {
    system: '請使用繁體中文輸出。',
    user: '請使用繁體中文輸出所有內容。',
  },
  en: {
    system: 'Please output in English.',
    user: 'Please output all content in English.',
  },
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位占星改运顾问。你根据用户出生地星盘与候选城市 relocated 星盘的差异，给出迁居/择地层面的可执行建议。
${langHook.system}

## 约束（必须严格遵守）

1. 只分析上升星座、天顶/天底/下降方向、主要相位变化对气质、机遇、行动力、人际环境的影响，不做未来具体事件预测。
2. 禁止预测某年某月会发财、结婚、升职、生病等具体事件。
3. 禁止使用「必发」「一定」「绝对」「大凶」「大吉」等绝对化词汇。
4. 输出包含三个部分，以 ## 开头：
   ## 各城市核心差异
   ## 改运行动指引
   ## 推荐选择
5. 「各城市核心差异」：对 comparisons 中的每个候选城市，用 1~2 句话说明 relocated 后上升/主要相位的变化，以及这种变化倾向带来什么气质或环境适配。
6. 「改运行动指引」：给出 3~5 条可执行建议，具体到城市选择优先级、居住方位、日常生活调整、社交策略等。建议必须可落地，禁止空泛鸡汤。
7. 「推荐选择」：明确推荐一个城市（可用出生地作为「保持现状」选项），并给出简洁理由。如果 relocated 差异很小，推荐保持现状并说明原因。
8. 如果计算结果中包含 methodNote 说明时间不确定或服务降级，请在你的建议中再次温和提醒用户仅供参考，不构成决策依据。
9. 不要添加总结段落之外的免责声明或多余内容。`
}

function buildUserPrompt(result: AstroFortuneTuneCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const { baseChart, baseCityName, comparisons, methodNote } = result

  const baseAsc = baseChart.ascendant
  const baseSummary = `出生地：${baseCityName}，上升 ${baseAsc.signName}(${baseAsc.signNameZh}) ${baseAsc.degree.toFixed(1)}°，${baseAsc.nakshatra} pada ${baseAsc.nakshatraPada}`

  const cityDetails = comparisons.map((c, idx) => {
    if (!c.city.resolved) {
      return `${idx + 1}. ${c.city.name}：未成功解析，使用出生地星盘占位。`
    }
    const asc = c.chart.ascendant
    const highlights = c.aspectHighlights.length
      ? c.aspectHighlights.map(h => h.note).join('；')
      : '主要相位无明显变化'
    return `${idx + 1}. ${c.city.cityName || c.city.name}：上升 ${asc.signName}(${asc.signNameZh}) ${asc.degree.toFixed(1)}°（较出生地偏移 ${c.ascendantDeltaDeg.toFixed(1)}°）。相位变化：${highlights}。`
  }).join('\n')

  return `请根据以下占星改运计算结果生成迁居/择地建议：

【计算口径】
${methodNote}

【出生地星盘】
${baseSummary}

【候选城市对比】
${cityDetails}

请严格按以下结构输出三个部分：
## 各城市核心差异
## 改运行动指引
## 推荐选择

${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: AstroFortuneTuneCalcResult
    locale?: string
  }>(event)

  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.result, locale)

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
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  event._handled = true
  event.node.res.statusCode = 200
  const res = event.node.res
  res.socket?.setNoDelay?.(true)

  const emit = (payload: Record<string, unknown>) => {
    const chunk = `data: ${JSON.stringify(payload)}\n\n`
    const ok = res.write(chunk)
    if (!ok) res.socket?.setNoDelay?.(true)
    if ('flush' in res && typeof (res as any).flush === 'function') {
      ;(res as any).flush()
    }
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
  catch (e: any) {
    emit({ type: 'error', message: `AI 服务连接失败：${e?.message ?? e}` })
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '')
    emit({ type: 'error', message: `AI 服务错误 (${upstream.status})${text ? ': ' + text.slice(0, 300) : ''}` })
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
        if (!line) continue
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload) continue
        if (payload === '[DONE]') continue
        try {
          const parsed = JSON.parse(payload)
          const token = isOpenAi
            ? parsed.choices?.[0]?.delta?.content
            : (parsed.response ?? parsed.choices?.[0]?.delta?.content)
          if (token) emit({ type: 'text', text: token })
        }
        catch {
          // non-JSON chunk: ignore
        }
      }
    }
  }
  catch (e: any) {
    emit({ type: 'error', message: `读取 AI 流时出错：${e?.message ?? e}` })
  }
  finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
