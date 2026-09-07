import type { ZiweiChartResult } from '~~/server/utils/tools/ziwei-chart'

interface InterpretTarget {
  selector?: string
  label?: string
  section?: string
  group?: string
  content?: string
}

interface InterpretBody {
  chart?: ZiweiChartResult
  target?: InterpretTarget
  locale?: 'zh-CN' | 'zh-TW' | 'en'
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

function buildSystemPrompt(locale: string) {
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是“幽默隐士”，一位见多识广的紫微斗数解析大师。
风格：结论先行、简洁务实、温和通透；能把星曜和宫位术语翻译成现实场景，不卖焦虑、不给宿命论。
规则：只基于命盘结构解读，不预测确定事件，不用绝对断语，不提供医疗、法律或投资建议。${lang.system}

这次只解读用户指定的命盘元素：先给一句结论，再说明星曜与宫位的结构原因，最后给一句现实校准。
输出一段 70-140 字的纯文本；不要标题、列表、提问、复述标签，也不要展开其他命盘部分。`
}

function buildUserPrompt(body: InterpretBody, chartContext: string) {
  const locale = body.locale || 'zh-CN'
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const target = body.target || {}
  const label = (target.label || '命盘元素').slice(0, 160)
  const section = (target.section || '紫微命盘').slice(0, 120)
  const group = (target.group || '').slice(0, 120)
  const content = (target.content || '').slice(0, 2600)

  return `请解读以下紫微命盘元素。

【所在区域】${section}${group ? ` / ${group}` : ''}
【元素标签】${label}
【元素内容】${content}

【命盘摘要】
${chartContext}

只解读该元素与本命盘的直接关系，注意宫位、星曜亮度、四化和运限的相互印证；忽略无关部分。${lang.user}`
}

function validateChart(chart: ZiweiChartResult | undefined) {
  return !!chart
    && !!chart.summary
    && !!chart.input
    && Array.isArray(chart.palaces)
    && chart.palaces.length === 12
    && Array.isArray(chart.majorLimits)
    && Array.isArray(chart.currentPeriods?.periods)
}

function formatStar(star: { name: string; brightness: string | null; mutagen: string | null }) {
  return `${star.name}${star.brightness ? `(${star.brightness})` : ''}${star.mutagen ? `化${star.mutagen}` : ''}`
}

function buildChartContext(chart: ZiweiChartResult) {
  const palaces = chart.palaces.map((palace) => {
    const major = palace.majorStars.map(formatStar).join(' ') || '空宫'
    const minor = palace.minorStars.map(formatStar).join(' ')
    const adjective = palace.adjectiveStars.map(star => star.name).join(' ')
    return [
      `${palace.name} ${palace.heavenlyStem}${palace.earthlyBranch}：${major}`,
      minor ? `辅星 ${minor}` : '',
      adjective ? `杂曜 ${adjective}` : '',
      `${palace.decadal.startAge}-${palace.decadal.endAge}`,
      palace.isBodyPalace ? '身宫' : '',
      palace.isOriginalPalace ? '来因宫' : '',
    ].filter(Boolean).join('；')
  })

  return [
    `出生：${chart.input.birthDate} ${chart.input.effectiveTimeText}，${chart.input.genderText}；地点 ${chart.input.locationName}；真太阳时 ${chart.input.trueSolarText || '未校正'}`,
    `基础：${chart.summary.fiveElementsClass}；命宫 ${chart.summary.soulPalace}；身宫 ${chart.summary.bodyPalace}；命主 ${chart.summary.soulStar}；身主 ${chart.summary.bodyStar}`,
    `生年四化：${chart.natalMutagens.map(item => `${item.star}化${item.mutagen}@${item.palace}`).join('、')}`,
    '十二宫：',
    ...palaces.map(item => `- ${item}`),
    `大限：${chart.majorLimits.map(limit => `${limit.yearRange[0]}-${limit.yearRange[1]} ${limit.natalPalace}${limit.isCurrent ? '[当前]' : ''}`).join('；')}`,
    `当前运限：${chart.currentPeriods.periods.map(period => `${period.label} ${period.heavenlyStem}${period.earthlyBranch}@${period.natalPalace}，四化 ${period.mutagenStars.join('/') || '无'}`).join('；')}`,
  ].join('\n')
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)

  if (!validateChart(body?.chart)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid Ziwei chart' })
  }
  if (!body?.target?.label?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing interpretation target' })
  }

  const config = useRuntimeConfig()
  if (!config.aiBaseUrl || !config.aiApiKey || !config.aiModel) {
    throw createError({ statusCode: 503, statusMessage: 'AI interpretation is not configured' })
  }

  const locale = body.locale || 'zh-CN'
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  const configuredTokens = Number(config.aiMaxTokens) || 8192
  const maxTokens = Math.min(1024, configuredTokens)
  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body, buildChartContext(body.chart!))

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

  const res = event.node.res
  res.socket?.setNoDelay?.(true)

  const emit = (payload: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
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
  catch (error) {
    emit({ type: 'error', message: `AI 服务连接失败：${error instanceof Error ? error.message : error}` })
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    emit({ type: 'error', message: `AI 服务错误（${upstream.status}）${detail.slice(0, 240)}` })
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
          const chunk = JSON.parse(payload)
          const token = isOpenAi
            ? chunk.choices?.[0]?.delta?.content
            : (chunk.response ?? chunk.choices?.[0]?.delta?.content)
          if (token) emit({ type: 'text', text: token })
        }
        catch { /* Ignore provider keep-alive lines. */ }
      }
    }
  }
  catch (error) {
    emit({ type: 'error', message: `读取 AI 流失败：${error instanceof Error ? error.message : error}` })
  }
  finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
