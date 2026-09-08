import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'
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
  chart?: BaziChartResult
  chartContext?: string
  target?: InterpretTarget
  locale?: 'zh-CN' | 'zh-TW' | 'en' | 'ja'
}

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': {
    system: '请使用简体中文输出，并保留四柱推命术语。',
    user: '请使用简体中文输出所有内容。',
  },
  'zh-TW': {
    system: '請使用繁體中文輸出，並保留四柱推命術語。',
    user: '請使用繁體中文輸出所有內容。',
  },
  en: {
    system: 'Please output in English while retaining Shichu Suimei terms.',
    user: 'Please output all content in English.',
  },
  ja: {
    system: '日本語で出力し、四柱推命の専門用語はそのまま保持してください。',
    user: 'すべての内容を日本語で出力してください。',
  },
}

const FULL_REPORT_SECTIONS: Record<string, string> = {
  'zh-CN': '总论：\n性格与结构：\n事业：\n财富：\n感情：\n健康与节奏：\n大运流年：\n行动清单：',
  'zh-TW': '總論：\n性格與結構：\n事業：\n財富：\n感情：\n健康與節奏：\n大運流年：\n行動清單：',
  en: 'Overview:\nPersonality & Structure:\nCareer:\nWealth:\nLove:\nHealth & Rhythm:\nLuck Cycles & Years:\nAction List:',
  ja: '総論：\n性格と構造：\n仕事：\n財運：\n恋愛：\n健康とリズム：\n大運・年運：\n行動リスト：',
}

function buildSystemPrompt(mode: InterpretMode, locale: string) {
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const shared = `你是“幽默隐士”，一位熟悉日本四柱推命结构的解析者。
术语口径：年柱、節柱、日柱、時柱；蔵干、通変星、十二運、空亡、大運、年運。
风格：结论先行、简洁务实、温和通透；能把传统术语翻译成现实场景，不卖焦虑、不给宿命论。
规则：只基于命盘结构解读，不预测确定事件，不用绝对断语，不提供医疗、法律或投资建议。${lang.system}`

  if (mode === 'target') {
    return `${shared}

这次只解读用户指定的命式元素：先给一句结论，再说明结构原因，最后给一句现实校准。
输出一段 60-120 字的纯文本；不要标题、列表、提问、复述标签，也不要展开其他命式部分。`
  }

  return `${shared}

请生成完整四柱推命分析报告。输出 900-1500 字纯文本，按以下标签逐行分段，标签后换行：
${FULL_REPORT_SECTIONS[locale] || FULL_REPORT_SECTIONS['zh-CN']}

每段必须绑定通変星、十二運、空亡、五行、大運或年運等命式证据；行动清单用 2-4 行“- ”开头。
不要 JSON、Markdown 标题、代码块或多余开场白。`
}

function buildUserPrompt(body: InterpretBody) {
  const locale = body.locale || 'zh-CN'
  const lang = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const context = (body.chartContext || '').slice(0, 22000)

  if (body.mode === 'target') {
    const target = body.target || {}
    const label = (target.label || '命式元素').slice(0, 160)
    const section = (target.section || '四柱推命命式').slice(0, 120)
    const group = (target.group || '').slice(0, 120)
    const content = (target.content || '').slice(0, 2600)

    return `请解读以下四柱推命命式元素。

【所在区域】${section}${group ? ` / ${group}` : ''}
【元素标签】${label}
【元素内容】${content}

【命式摘要】
${context}

只解读该元素与命局的直接关系，忽略无关部分。${lang.user}`
  }

  return `请基于以下完整四柱推命命式摘要，生成全盘分析报告。

【完整命式】
${context}

请覆盖四柱与蔵干、通変星、十二運、空亡、五行、格局喜忌、关系与神殺，并给出现实化行动建议。${lang.user}`
}

function validateChart(chart: BaziChartResult | undefined) {
  return !!chart
    && Array.isArray(chart.pillars)
    && chart.pillars.length === 4
    && !!chart.energy
    && !!chart.pattern
    && Array.isArray(chart.dayuns)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'

  if (!validateChart(body?.chart)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid Shichu Suimei chart' })
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
