import type { HumanDesignChartResult } from '~~/server/utils/tools/human-design'
import { buildHumanDesignContext, isValidHumanDesignResult } from '~~/server/utils/tools/human-design'
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
  chart?: HumanDesignChartResult
  chartContext?: string
  target?: InterpretTarget
  locale?: 'zh-CN' | 'zh-TW' | 'en' | 'ja'
}

const LANGUAGE_HOOKS: Record<string, { system: string, user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in English.', user: 'Please output all content in English.' },
  ja: { system: '日本語で出力してください。', user: 'すべての内容を日本語で出力してください。' },
}

function buildSystemPrompt(mode: InterpretMode, locale: string) {
  const lang = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const shared = `你是“幽默隐士”，一位务实通透的人类图解析者。风格：结论先行、具体可执行、温和不吓人；把能量类型、策略、权威和结构信号翻译成现实选择方式。规则：只基于图中结构解读，不预测确定事件，不用宿命论和绝对断语，不提供医疗、法律或投资建议。${lang.system}`

  if (mode === 'target') {
    return `${shared}

这次只解读用户指定的图形或字段：先给一句结论，再说明结构原因，最后给一句现实校准。输出一段 60-120 字的纯文本；不要标题、列表、提问、复述标签，也不要展开其他图内部分。`
  }

  return `${shared}

请生成完整人类图分析报告。输出 900-1500 字纯文本，按以下标签逐行分段，标签后换行：
总论：
能量类型与策略：
内在权威：
人生角色与轮回交叉：
定义与中心：
闸门与通道：
基因钥匙与占星参照：
行动清单：

每段必须绑定命盘证据；行动清单用 2-4 行“- ”开头。不要 JSON、Markdown 标题、代码块或多余开场白。`
}

function buildUserPrompt(body: InterpretBody) {
  const locale = body.locale ?? 'zh-CN'
  const lang = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const context = (body.chartContext ?? '').slice(0, 24000)

  if (body.mode === 'target') {
    const target = body.target ?? {}
    const label = (target.label ?? '人类图元素').slice(0, 160)
    const section = (target.section ?? '人类图').slice(0, 120)
    const group = (target.group ?? '').slice(0, 120)
    const content = (target.content ?? '').slice(0, 2600)
    return `请解读以下人类图元素。\n\n【所在区域】${section}${group ? ` / ${group}` : ''}\n【元素标签】${label}\n【元素内容】${content}\n\n【完整图结构摘要】\n${context}\n\n只解读该元素与整张图的直接关系，忽略无关部分。${lang.user}`
  }

  return `请基于以下完整人类图结构，生成全图 AI 分析报告。\n\n【完整人类图】\n${context}\n\n请覆盖能量类型、策略、权威、人生角色、轮回交叉、定义、中心、闸门通道、基因钥匙与占星参照，并给出现实化行动建议。${lang.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'

  if (!isValidHumanDesignResult(body?.chart)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid Human Design chart' })
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

  const locale = body!.locale ?? 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  const configuredTokens = Number(config.aiMaxTokens) || 8192
  const maxTokens = Math.min(mode === 'full' ? 12000 : 2048, configuredTokens)
  const upstreamBody = isOpenAi
    ? {
        model: config.aiModel,
        messages: [
          { role: 'system', content: buildSystemPrompt(mode, locale) },
          { role: 'user', content: buildUserPrompt({ ...body!, mode }) },
        ],
        stream: true,
        max_tokens: maxTokens,
      }
    : {
        model: config.aiModel,
        prompt: `${buildSystemPrompt(mode, locale)}\n\n${buildUserPrompt({ ...body!, mode })}`,
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
