import type { DiZhi } from '~/types/user'
import { getUserPillars, getSimplifiedXiYongJiShen } from '~~/server/utils/bazi'

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in English.', user: 'Please output all content in English.' },
}

const BAZI_KEYWORDS = ['事业', '工作', '跳槽', '婚姻', '感情', '恋爱', '财运', '钱', '八字', '命', '事业运', 'career', 'work', 'marriage', 'love', 'wealth', 'money', 'bazi']

function routeEngine(question: string, hasBirth: boolean): 'bazi' | 'general' {
  if (hasBirth) return 'bazi'
  const lower = question.toLowerCase()
  return BAZI_KEYWORDS.some(k => lower.includes(k)) ? 'bazi' : 'general'
}

function buildSystemPrompt(locale: string, engine: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const engineHint = engine === 'bazi'
    ? '用户提供了生辰，请基于其八字命盘数据做针对性分析。'
    : '用户未提供生辰，请基于《周易》变通智慧和传统文化象征做通用解读。'
  return `你是一位见多识广的命理顾问，擅长将八字、周易、奇门等多种术数融会贯通，为用户解答关于人生方向的困惑。
${langHook.system}

## 角色与语气
- 顾问口吻：温和通透、务实落地；结论先行，不绕弯
- 命理判断视为传统文化参考，非科学结论
- 建议要具体可操作，避免空话
${engineHint}

## 输出协议（严格逐行输出，每行一个字段，前缀后空一格，不要任何标题、序号、加粗或 markdown 标记）
OV: 一句话直答（对用户问题的核心判断，30 字以内）
INSIGHT: 深层分析（命理或周易层面的核心洞察，60 字以内）
WORK: 事业/财运方面的建议（如适用，40 字以内）
LOVE: 感情/人际方面的建议（如适用，40 字以内）
ACTION: 具体行动建议（接下来做什么或不做什么，50 字以内）
TIMING: 时机提示（什么时候做比较合适，36 字以内）
NOTE: 一句收口提醒（30 字以内）

## 约束
- 严格遵守行前缀 OV: / INSIGHT: / WORK: / LOVE: / ACTION: / TIMING: / NOTE:，每个前缀单独成行
- 如果某维度与用户问题无关，可写「不涉及」
- 除上述行之外不输出任何其它内容`
}

function buildUserPrompt(question: string, baziContext: string, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const ctx = baziContext ? `\n【命盘数据】\n${baziContext}\n` : ''
  return `请回答以下命理问题：

【用户提问】
${question}${ctx}
请严格按系统提示的逐行协议输出解答，结论先行。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const {
    question,
    birthDate,
    birthHour,
    locale = 'zh-CN',
  } = await readBody<{
    question: string
    birthDate?: string
    birthHour?: DiZhi
    locale?: string
  }>(event)

  if (!question || typeof question !== 'string' || question.trim().length < 4) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or too-short question' })
  }

  // Route engine
  const hasBirth = !!birthDate
  const engine = routeEngine(question.trim(), hasBirth)

  // Build bazi context if available
  let baziContext = ''
  if (engine === 'bazi' && birthDate) {
    try {
      const pillars = getUserPillars(birthDate, birthHour || undefined)
      const dayGan = (pillars.day as any)?.gan || (pillars.day as any)?.ganZhi?.[0] || ''
      const xiyongResult = getSimplifiedXiYongJiShen(dayGan as any)
      const xiyong = xiyongResult?.xiyong || ''
      const pillarStr = (p: any) => p ? `${p.ganZhi || p.ganZhiText || ''}（${p.wuxing || ''}）` : '未提供'
      baziContext = [
        `- 年柱：${pillarStr(pillars.year)}`,
        `- 月柱：${pillarStr(pillars.month)}`,
        `- 日柱：${pillarStr(pillars.day)}`,
        pillars.hour ? `- 时柱：${pillarStr(pillars.hour)}` : '- 时柱：未提供',
        `- 喜用神五行：${xiyong || '未推算'}`,
      ].join('\n')
    } catch {
      baziContext = ''
    }
  }

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale, engine)
  const userPrompt = buildUserPrompt(question.trim().slice(0, 1000), baziContext, locale)

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
        if (!line || !line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
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
