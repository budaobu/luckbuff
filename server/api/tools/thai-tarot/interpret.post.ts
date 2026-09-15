import type { ThaiTarotResult } from '~~/server/utils/tools/thai-tarot'
import { buildThaiTarotContext, isValidThaiTarotResult } from '~~/server/utils/tools/thai-tarot'
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
  result?: ThaiTarotResult
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
  const shared = `你是泰式塔罗解读师。使用泰语语境下的 Rider-Waite-Smith 塔罗符号，把牌义翻译成现实观察和可检验的小行动。规则：只基于抽到的牌解读；区分牌面象征与现实事实；不确定时用“可能提示”而不是断言；不做医疗、法律、投资或安全决定；不预测确定结局，也不替他人读心。${lang.system}`

  if (mode === 'target') {
    return `${shared}\n\n只解读用户指定的元素：先给一句结论，再说明牌义证据，最后给一句可检验的行动。输出 60-120 字纯文本，不要标题、列表、复述标签或反问。`
  }

  return `${shared}\n\n生成完整泰式塔罗报告。输出 1200-1800 字纯文本，按以下标签逐行分段，标签后换行：\n总论：\n牌阵结构与能量：\n逐牌解读：\n牌间关系：\n现实领域：\n行动清单：\n边界与校准：\n\n每段必须绑定本次抽牌证据；逐牌解读正序展开；行动清单用 2-5 行“- ”开头；不得输出 JSON、Markdown 标题、代码块或额外开场白。`
}

function buildUserPrompt(body: InterpretBody) {
  const locale = body.locale ?? 'zh-CN'
  const lang = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const context = buildThaiTarotContext(body.result!).slice(0, 24000)

  if (body.mode === 'target') {
    const target = body.target ?? {}
    const label = (target.label ?? '塔罗元素').slice(0, 160)
    const section = (target.section ?? '泰式塔罗').slice(0, 120)
    const group = (target.group ?? '').slice(0, 120)
    const content = (target.content ?? '').slice(0, 2600)
    return `请解读以下泰式塔罗元素。\n\n【所在区域】${section}${group ? ` / ${group}` : ''}\n【元素标签】${label}\n【元素内容】${content}\n\n【完整抽牌摘要】\n${context}\n\n只解读该元素与整副牌阵的关系，忽略无关部分。${lang.user}`
  }

  return `请基于以下完整泰式塔罗抽牌生成登录用户专属报告。\n\n【完整抽牌】\n${context}\n\n请覆盖牌阵结构、逐牌正逆位、元素与花色分布、大/小阿卡纳比例、相邻牌张力、爱情与关系、工作与金钱、身心平衡、Yes/No 倾向、时间提示和行动清单。${lang.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const mode = body?.mode === 'full' ? 'full' : 'target'

  if (!isValidThaiTarotResult(body?.result)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid Thai tarot result' })
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
