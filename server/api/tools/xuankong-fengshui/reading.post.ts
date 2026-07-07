interface CalcResult {
  direction: number
  year: number
  period: {
    number: number
    name: string
    startYear: number
    endYear: number
  }
  sittingMountain: {
    name: string
    palace: string
    palaceNumber: number
    yin: boolean
  }
  facingMountain: {
    name: string
    palace: string
    palaceNumber: number
    yin: boolean
  }
  sittingLabel: string
  facingLabel: string
  pattern: {
    key: string
    name: string
    description: string
  } | null
  palaces: Array<{
    name: string
    direction: string
    palaceNumber: number
    periodStar: number
    mountainStar: number
    facingStar: number
  }>
  warning: string | null
  usage?: string
  locale: string
}

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
  return `你是精通玄空飞星风水的命理师。基于用户提供的坐向、元运、九宫飞星排盘结果，给出各宫位吉凶分析、全局格局解读、化解与催旺建议。
${langHook.system}

## 角色与语气
- 专业但通俗，把古籍术语转译为现代语言
- 避免恐吓式迷信措辞，不制造焦虑
- 避免给出绝对化的“必发财”“必灾祸”断言
- 所有建议应视为传统文化参考，非科学结论

## 必须遵守的约束
1. 只基于用户提供的排盘数据做分析，不编造未给出的信息
2. 不做流年、流月、具体日期的时机预测
3. 化解建议以环境布置、功能分区、心理调节为主，不涉及符咒、法事、购买指定商品
4. 输出结构严格按以下四段，不要额外总结

## 输出结构

### 各宫位简析
按九宫顺序（坎、坤、震、巽、中、乾、兑、艮、离）逐宫简述运星、山星、向星组合的气场特点与宜忌用途。重点标注当运旺星（与元运数字相同）所在宫位。

### 全局格局
说明当前格局（如旺山旺向、上山下水、双星到向、双星到坐等）的含义，以及对住宅/办公/商铺的整体影响。

### 化解建议
针对凶星（二黑、五黄）聚集或上山下水、冲克明显之处，给出可操作的布局调整建议。

### 催旺建议
针对当旺财星、丁星所在方位，给出功能分区与布置思路。`
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!
  const usageText = result.usage
    ? { residential: '住宅', office: '办公', shop: '商铺' }[result.usage] || result.usage
    : '未指定'

  const palaceLines = result.palaces
    .map(
      (p) =>
        `${p.name}宫（${p.direction}，洛书${p.palaceNumber}）：运星${p.periodStar} / 山星${p.mountainStar} / 向星${p.facingStar}`,
    )
    .join('\n')

  return `请为以下玄空飞星排盘结果做解读：

【坐向】${result.sittingLabel} ${result.facingLabel}
【元运】${result.period.name}（${result.period.startYear}–${result.period.endYear}）
【起建/入住年份】${result.year}
【房屋用途】${usageText}

【九宫飞星排盘】
${palaceLines}

【格局判断】${result.pattern ? `${result.pattern.name}：${result.pattern.description}` : '无明显特殊格局'}

${result.warning ? `【兼向提示】${result.warning}` : ''}

请按“各宫位简析 → 全局格局 → 化解建议 → 催旺建议”的顺序输出四段内容。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result: CalcResult; locale?: string }>(event)

  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const locale = body.locale || body.result.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.result)

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
  } catch (e: any) {
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
        } catch {
          // non-JSON chunk: ignore
        }
      }
    }
  } catch (e: any) {
    emit({ type: 'error', message: `读取 AI 流时出错：${e?.message ?? e}` })
  } finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
