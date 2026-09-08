import type { QizhengPaipanResult } from '~~/app/types/qizheng-paipan'
import { getAuthSession } from '~~/server/utils/auth-session'

type InterpretMode = 'target' | 'full'

interface InterpretTarget {
  selector?: string
  label?: string
  section?: string
  group?: string
  content?: string
}

interface InterpretBody {
  mode?: InterpretMode
  chart?: QizhengPaipanResult
  chartContext?: string
  target?: InterpretTarget
  locale?: 'zh-CN' | 'zh-TW' | 'en'
}

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in English.', user: 'Please output all content in English.' },
}

function buildSystemPrompt(mode: InterpretMode, locale: string) {
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const shared = `你是“幽默隐士”，一位见多识广的七政四余解析大师。
风格：结论先行、简洁务实、温和通透；能把星曜、宫位、宿度、神煞和大限翻译成现实场景，不卖焦虑、不给宿命论。
规则：只基于已排好的七政四余盘解读，不重新排盘，不用绝对断语，不提供医疗、法律或投资建议。${lang.system}`

  if (mode === 'target') {
    return `${shared}

这次只解读用户指定的盘面元素：先给一句结论，再说明星曜或宫位原因，最后给一句现实校准。
输出一段 60-120 字的纯文本；不要标题、列表、提问、复述标签，也不要展开其他盘面部分。`
  }

  return `${shared}

请生成完整七政四余排盘分析报告。输出 900-1500 字纯文本，按以下标签逐行分段，标签后换行：
总论：
命身与星势：
十二宫重点：
宿度关系：
大限流年：
行动清单：
风险提醒：

每段必须绑定星曜、宫位、宿度或神煞证据；行动清单用 2-4 行“- ”开头。不要 JSON、Markdown 标题、代码块或多余开场白。`
}

function buildUserPrompt(body: InterpretBody) {
  const locale = body.locale || 'zh-CN'
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const context = (body.chartContext || '').slice(0, 22000)

  if (body.mode === 'target') {
    const target = body.target || {}
    const label = (target.label || '盘面元素').slice(0, 160)
    const section = (target.section || '七政四余盘').slice(0, 120)
    const group = (target.group || '').slice(0, 120)
    const content = (target.content || '').slice(0, 2600)
    return `请解读以下七政四余盘面元素。

【所在区域】${section}${group ? ` / ${group}` : ''}
【元素标签】${label}
【元素内容】${content}

【命盘摘要】
${context}

只解读该元素与全盘的直接关系，忽略无关部分。${lang.user}`
  }

  return `请基于以下完整七政四余命盘摘要，生成全盘 AI 分析报告。

【完整命盘】
${context}

请覆盖命身宫、十一曜、二十八宿、十二宫、星曜关系、神煞与大限流年，并给出现实化行动建议。${lang.user}`
}

function compactContext(chart: QizhengPaipanResult) {
  return [
    `出生：${chart.basic.solarText}；真太阳时：${chart.basic.trueSolarText}；地点：${chart.basic.locationName}；${chart.basic.dayNight}`,
    `四柱：${chart.pillars.map(item => item.ganzhi).join(' ')}；节气：${chart.jieqi.previous} → ${chart.jieqi.next}`,
    `命宫：${chart.liming.lifePalace}；身宫：${chart.liming.bodyPalace}；${chart.liming.basis}`,
    `十一曜：${chart.planets.map(item => `${item.name}@${item.branch}${item.branchDegree}°/${item.mansion}${item.mansionDegree}°${item.status.length ? `(${item.status.join(',')})` : ''}`).join('；')}`,
    `十二宫：${chart.palaces.map(item => `${item.name}@${item.branch}(${item.stars.join('/') || '空'}；${item.shensha.join('/') || '无煞'})`).join('；')}`,
    `关系：${chart.relations.map(item => `${item.label}(${item.orb}°)`).join('；') || '未检出'}`,
    `大运：${chart.dayuns.map(item => `${item.label}${item.isCurrent ? '[当前]' : ''}`).join('、')}`,
    `流年：${chart.flowYears.map(item => `${item.year}${item.ganzhi}@${item.palace}${item.isCurrent ? '[当前]' : ''}`).join('、')}`,
    `规则：${chart.methodology.engine}；${chart.methodology.method}`,
  ].join('\n')
}

function validateChart(chart: QizhengPaipanResult | undefined) {
  return !!chart
    && Array.isArray(chart.planets) && chart.planets.length === 11
    && Array.isArray(chart.pillars) && chart.pillars.length === 4
    && Array.isArray(chart.palaces) && chart.palaces.length === 12
    && Array.isArray(chart.dayuns)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'

  if (!validateChart(body?.chart)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid Qizheng chart' })
  }
  if (mode === 'target' && !body?.target?.label?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing interpretation target' })
  }
  if (mode === 'full') {
    const session = await getAuthSession(event)
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: 'Sign in to view the full report' })
    }
  }

  const locale = body!.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  const configuredTokens = Number(config.aiMaxTokens) || 8192
  const maxTokens = Math.min(mode === 'full' ? 12000 : 2048, configuredTokens)
  const systemPrompt = buildSystemPrompt(mode, locale)
  const userPrompt = buildUserPrompt({ ...body!, mode })
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
