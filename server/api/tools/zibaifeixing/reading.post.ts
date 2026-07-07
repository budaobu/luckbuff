interface CalcResult {
  input: {
    year: number
    month: number
    day: number
    lunarYear: number
    lunarMonth: number
    lunarDay: number
    lunarYearBranch: string
    intent: 'general' | 'wealth' | 'health' | 'love' | 'study' | 'travel' | 'renovation'
  }
  yearCenter: number
  monthCenter: number
  dayCenter: number
  currentJieqi: {
    name: string
    date: string
  }
  palaces: Array<{
    palaceNumber: number
    name: string
    direction: string
    yearStar: number
    monthStar: number
    dayStar: number
  }>
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
  const langHook = (LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN'])!
  return `你是精通紫白飞星（九宫飞星）风水的命理师。基于用户提供的年、月、日三层紫白星排盘结果，分析各宫气场吉凶，并给出风水布局与用事建议。
${langHook.system}

## 角色与语气
- 专业但通俗，把古籍术语转译为现代语言
- 避免恐吓式迷信措辞，不制造焦虑
- 避免给出绝对化的“必发财”“必灾祸”断言
- 所有建议应视为传统文化参考，非科学结论

## 必须遵守的约束
1. 只基于用户提供的排盘数据做分析，不编造未给出的信息
2. 不做流年、流月、具体日期的时机预测
3. 建议以环境布置、功能分区、心理调节为主，不涉及符咒、法事、购买指定商品
4. 输出结构严格按以下四段，不要额外总结

## 输出结构

### 各宫位简析
按九宫顺序（坎、坤、震、巽、中、乾、兑、艮、离）逐宫简述年星、月星、日星叠临后的气场特点与宜忌用途。重点标注吉星（一白、六白、八白、九紫）与凶星（二黑、五黄）聚集的宫位。

### 全局观察
说明当前年、月、日入中星组合的整体气势，以及三个时间尺度共同强调的吉凶方位。

### 吉凶方位与用事建议
针对求财、求学、人际、健康等常见需求，指出相对有利的方位与应避免的方位，并给出简单的功能分区思路。

### 化解提示
针对五黄、二黑所在宫位或明显冲克的星组，给出可操作的化解与调整建议。`
}

const INTENT_LABELS: Record<CalcResult['input']['intent'], string> = {
  general: '通用分析',
  wealth: '财运与求财',
  health: '健康与养生',
  love: '感情与人际',
  study: '学业与考试',
  travel: '出行与搬迁',
  renovation: '装修与动土',
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = (LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN'])!
  const intentLabel = INTENT_LABELS[result.input.intent] || INTENT_LABELS.general
  const palaceLines = result.palaces
    .map(
      (p) =>
        `${p.name}宫（${p.direction}，洛书${p.palaceNumber}）：年星${p.yearStar} / 月星${p.monthStar} / 日星${p.dayStar}`,
    )
    .join('\n')

  return `请为以下紫白飞星排盘结果做解读：

【公历日期】${result.input.year}年${result.input.month}月${result.input.day}日
【农历】${result.input.lunarYear}年（${result.input.lunarYearBranch}）${result.input.lunarMonth}月${result.input.lunarDay}日
【当前节气】${result.currentJieqi.name}（${result.currentJieqi.date}）
【关注事项】${intentLabel}
【入中星】年星${result.yearCenter} / 月星${result.monthCenter} / 日星${result.dayCenter}

【九宫紫白排盘】
${palaceLines}

请按“各宫位简析 → 全局观察 → 吉凶方位与用事建议 → 化解提示”的顺序输出四段内容。${langHook.user}`
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
