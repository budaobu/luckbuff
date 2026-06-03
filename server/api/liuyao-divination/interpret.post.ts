import type { LiuYaoResult } from '~/types/liuyao'

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
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']
  return `你是一位精通《周易》六爻纳甲法的资深预测师，擅长以六爻断卦解答问事者的疑惑。
${langHook.system}

## 输出格式要求（必须严格遵守）

你的输出必须严格按照以下顺序和格式，不得缺少任何部分：

【第一步】先输出一行总体判断（一句话概括）：
<!-- summary: 总体吉凶判断 -->

【第二步】按以下顺序输出 5 个分析段落，每个段落以 ## 标题开头：

## 卦象总览 / Hexagram Overview
...

## 世应分析 / Self-Response Analysis
...

## 动爻解读 / Moving Lines Interpretation
...

## 用神分析 / Useful God Analysis
...

## 综合判断 / Synthesis
...

【重要约束】
- 每个段落 2~4 句话，简明扼要
- 结合问事内容有针对性地分析，不要泛泛而谈
- 禁止断言绝对结果，禁止使用"确保""一定""必定"等绝对化措辞
- 语言风格：古雅精炼，像资深命理师简要点评
- 预测结果仅供娱乐参考`
}

function buildUserPrompt(
  result: LiuYaoResult,
  question: string,
  locale: string,
): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']

  const linesText = result.lines_top_down
    ?.map((line, idx) => {
      const yinYang = line.value === 6 || line.value === 8 ? '阴' : '阳'
      const moving = line.isMoving ? `（动爻，${line.value === 6 ? '老阴变阳' : '老阳变阴'}）` : ''
      const shen = result.temporal_context?.六神?.[5 - idx] || ''
      return `- ${line.label}：${yinYang}爻 ${line.value}${moving}${shen ? ` · ${shen}` : ''}`
    })
    .join('\n') || ''

  const transformedText = result.transformed_lines_top_down
    ?.map((line) => {
      const yinYang = line.value === 6 || line.value === 8 ? '阴' : '阳'
      return `- ${line.label}：${yinYang}爻 ${line.value}`
    })
    .join('\n') || ''

  const movingLines = result.lines_top_down?.filter(l => l.isMoving) || []
  const movingText = movingLines.length > 0
    ? movingLines.map(l => `- ${l.label}：${l.value === 6 ? '老阴' : '老阳'}（变${l.value === 6 ? '阳' : '阴'}）`).join('\n')
    : '无动爻（静卦）'

  return `请为以下六爻卦象做断卦分析：

【问事内容】
${question || '未提供具体问事内容，请做一般性卦象分析'}

【时空参数】
${result.temporal_context ? `- 月建：${result.temporal_context.月建}
- 日辰：${result.temporal_context.日辰}
- 时辰：${result.temporal_context.时辰}
- 旬空：${result.temporal_context.旬空}
- 六神（从上到下）：${result.temporal_context.六神?.join(' · ') || '未记录'}` : '未提供'}

【卦象信息】
- 本卦：${result.hexagram?.本卦 || '未知'}
- 变卦：${result.hexagram?.变卦 || '未知'}
- 互卦：${result.hexagram?.互卦 || '未知'}
- 世爻位：第${result.hexagram?.世爻位 || '?'}爻
- 应爻位：第${result.hexagram?.应爻位 || '?'}爻

【六爻排盘（从上到下）】
${linesText}

【变卦排盘（从上到下）】
${transformedText}

【动爻汇总】
${movingText}

${result.analysis_brief ? `【排盘系统简析】\n${result.analysis_brief}\n` : ''}

请先输出总体判断标记，然后按 卦象总览/Hexagram Overview → 世应分析/Self-Response Analysis → 动爻解读/Moving Lines Interpretation → 用神分析/Useful God Analysis → 综合判断/Synthesis 的顺序给出简明分析。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const { result, question = '', locale = 'zh-CN' } = await readBody<{
    result: LiuYaoResult
    question?: string
    locale?: string
  }>(event)

  if (!result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(result, question, locale)

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
