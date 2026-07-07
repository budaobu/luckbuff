import type { LiuYaoResult, WorldCupTeam } from '~/types/liuyao'

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
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位精通《周易》六爻纳甲法的资深预测师，擅长以六爻断卦预测体育赛事胜负。
${langHook.system}

## 输出格式要求（必须严格遵守）

你的输出必须严格按照以下顺序和格式，不得缺少任何部分：

【第一步】输出一行胜率概率（必须，最先输出）：
<!-- probability: {"home": 55.2, "draw": 28.6, "away": 16.2} -->

【第二步】按以下顺序输出 4 个分析段落，每个段落以 ## 标题开头：

## 世应旺衰 / Self-Response Strength
...

## 动爻生克 / Moving Line Interactions
...

## 官鬼分析 / Official-Ghost Direction
...

## 综合判断 / Synthesis
...

【重要约束】
- 每个段落 2~3 句话，简明扼要
- 禁止断言具体比分，禁止使用"确保""一定""必定"等绝对化措辞
- 语言风格：古雅精炼，像资深命理师简要点评
- 预测结果仅供娱乐参考`
}

function buildUserPrompt(
  result: LiuYaoResult,
  homeTeam: WorldCupTeam | null,
  awayTeam: WorldCupTeam | null,
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

  return `请为以下六爻卦象推算世界杯赛事胜率并做简要断卦分析：

【对阵信息】
${homeTeam ? `- 主队（世方）：${homeTeam.name} ${homeTeam.flag || ''}` : '- 主队：未知'}
${awayTeam ? `- 客队（应方）：${awayTeam.name} ${awayTeam.flag || ''}` : '- 客队：未知'}

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

请先输出概率标记，然后按 世应旺衰/Self-Response Strength → 动爻生克/Moving Line Interactions → 官鬼分析/Official-Ghost Direction → 综合判断/Synthesis 的顺序给出简明分析。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const { result, homeTeam, awayTeam, locale = 'zh-CN' } = await readBody<{
    result: LiuYaoResult
    homeTeam?: WorldCupTeam | null
    awayTeam?: WorldCupTeam | null
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
  const userPrompt = buildUserPrompt(result, homeTeam ?? null, awayTeam ?? null, locale)

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
