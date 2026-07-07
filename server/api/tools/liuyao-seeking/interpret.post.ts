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

interface SeekingContext {
  description?: string
  lastSeenTime?: string
  lastSeenPlace?: string
  lostItemDesc?: string
  relationship?: string
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位精通《周易》六爻纳甲法的资深预测师，专精六爻寻物断卦。你擅长通过卦象分析失物的方位、找回概率、当前状态和寻找时机。
${langHook.system}

## 输出格式要求（必须严格遵守）

你的输出必须严格按照以下顺序和格式，不得缺少任何部分：

【第一步】先输出一行总体判断（一句话概括失物能否找回及关键线索）：
<!-- summary: 总体判断 -->

【第二步】按以下顺序输出 5 个分析段落，每个段落以 ## 标题开头：

## 卦象总览 / Hexagram Overview
简要概述本卦、变卦、互卦的卦象特征，以及世应关系对寻物的暗示。

## 失物方位 / Lost Item Direction
根据卦象分析失物当前所在的大致方位（东、南、西、北、东南、东北、西南、西北、或上下），以及可能的具体环境特征（室内/室外、高处/低处、明亮/阴暗处等）。

## 找回概率 / Recovery Probability
分析失物能否找回的概率。结合用神旺衰、动爻变化、旬空状态等判断。如时干生日干或同宫则易找回；入墓、空亡则难找回，需待出空或冲墓。

## 当前状态 / Current Status
分析失物当前的状态：是否仍在原处附近、是否已被他人拾取、是否已损坏、是否在移动中。

## 寻找建议 / Search Advice
给出具体可行的寻找建议：最佳寻找时间、重点搜索区域、寻找时的注意事项。

【重要约束】
- 每个段落 2~4 句话，简明扼要
- 结合寻物信息有针对性地分析，不要泛泛而谈
- 禁止断言绝对结果，禁止使用"确保""一定""必定"等绝对化措辞
- 语言风格：古雅精炼，像资深命理师简要点评
- 预测结果仅供娱乐参考`
}

function buildUserPrompt(
  result: LiuYaoResult,
  seekingContext: SeekingContext,
  locale: string,
): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

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

  const ctx = seekingContext || {}

  return `请为以下六爻寻物卦象做断卦分析：

【占事类型】寻物（寻找丢失的物品）

【寻物信息】
${ctx.description ? `- 具体描述：${ctx.description}` : ''}
${ctx.lastSeenTime ? `- 最后见到时间：${ctx.lastSeenTime}` : ''}
${ctx.lastSeenPlace ? `- 最后见到地点：${ctx.lastSeenPlace}` : ''}
${ctx.lostItemDesc ? `- 失物描述：${ctx.lostItemDesc}` : ''}
${ctx.relationship ? `- 与失物关系：${ctx.relationship}` : ''}

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

请先输出总体判断标记，然后按 卦象总览/Hexagram Overview → 失物方位/Lost Item Direction → 找回概率/Recovery Probability → 当前状态/Current Status → 寻找建议/Search Advice 的顺序给出简明分析。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const { result, seekingContext, locale = 'zh-CN' } = await readBody<{
    result: LiuYaoResult
    seekingContext?: SeekingContext
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
  const userPrompt = buildUserPrompt(result, seekingContext || {}, locale)

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
