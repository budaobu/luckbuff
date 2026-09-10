import type { ZibaifeixingResult } from '~~/server/utils/tools/zibaifeixing-paipan'
import { compactZibaifeixingContext } from '~~/server/utils/tools/zibaifeixing-paipan'
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
  chart?: ZibaifeixingResult
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
  const shared = `你是“幽默隐士”，一位见多识广的紫白飞星与九宫飞星老师傅。
风格：结论先行、简洁务实、温和通透；用生活场景解释气场与功能分区，不制造焦虑。
规则：只基于给定盘面解读，不预测确定事件，不用绝对断语，不提供医疗、法律或投资建议。${lang.system}`

  if (mode === 'target') {
    return `${shared}

只解读用户指定的九宫元素：先给一句结论，再说明年月日时叠临证据，最后给一句空间使用建议。
输出 60-120 字纯文本；不要标题、列表、提问或复述标签。`
  }

  return `${shared}

请生成完整紫白飞星分析报告。输出 900-1500 字纯文本，按以下标签逐行分段，标签后换行：
盘面总论：
四层时间轴：
九宫方位：
重点方位：
空间布局：
行动清单：

每段必须绑定年、月、日、时盘面证据；行动清单用 2-4 行“- ”开头。不要 JSON、Markdown 标题或开场白。`
}

function buildUserPrompt(body: InterpretBody) {
  const lang = LANGUAGE_HOOKS[body.locale || 'zh-CN'] || LANGUAGE_HOOKS['zh-CN']!
  const context = (body.chartContext || '').slice(0, 22000)

  if (body.mode === 'target') {
    const target = body.target || {}
    const label = (target.label || '盘面元素').slice(0, 160)
    const section = (target.section || '紫白飞星盘').slice(0, 120)
    const group = (target.group || '').slice(0, 120)
    const content = (target.content || '').slice(0, 2600)
    return `请解读以下紫白飞星盘元素。

【所在区域】${section}${group ? ` / ${group}` : ''}
【元素标签】${label}
【元素内容】${content}

【完整盘面摘要】
${context}

只解读该元素与年月日时四层盘的直接关系。${lang.user}`
  }

  return `请基于以下完整紫白飞星盘摘要，生成全盘 AI 分析报告。

【完整盘面】
${context}

请覆盖年月日时四层入中、九宫叠临、吉凶方位、重点煞位与空间分区建议。${lang.user}`
}

function validateChart(chart: ZibaifeixingResult | undefined) {
  return !!chart
    && Array.isArray(chart.palaces)
    && chart.palaces.length === 9
    && Array.isArray(chart.layers)
    && chart.layers.length === 4
    && Array.isArray(chart.sectorSignals)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'

  if (!validateChart(body?.chart)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid Zibaifeixing chart' })
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
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
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
