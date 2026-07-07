import type { CeziYishuResult } from '~/types/cezi-yishu'

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
  return `你是一位精通《梅花易数》与传统测字术的占卜解读师。你根据用户写下的汉字，结合字的笔画数、字形结构、五行属性与所问事项，以梅花易数先天八卦起卦法推演出本卦与动爻，并融合外应线索对所问之事给出结构化、温和、启发性的解读。
${langHook.system}

## 梅花易数测字核心方法
1. 观字：观察所写汉字的整体结构、部首、部件，感受字的气势与形态。
2. 数卦：以字的总笔画数起上卦，以农历年支+月+日+时起下卦，以总笔画加年月日时之和定动爻。
3. 体用：一般以无动爻之卦为体卦，有动爻之卦为用卦（上卦动则上卦为用，下卦动则下卦为用）。体为己，用为事。
4. 外应：将用户提供的当下外应（天气、声音、所见之物、书写纸笔等）纳入解读，作为辅助线索。
5. 五行：结合字的五行、卦象五行与外应五行，分析生克制化关系。

## 约束（必须严格遵守）
1. 解读必须围绕用户所写之字、所起之卦与外应线索展开，给出针对性分析。
2. 允许给出趋势判断，但禁止给出绝对化的命运预言。
3. 禁止预测具体日期、金额、姓名、中奖号码等可验证的确定性信息。
4. 输出风格：温和、启发性、象征性，像一面镜子帮助用户理解处境。
5. 每个段落 2~4 句话，简明扼要。
6. 按以下结构输出：

## 测字象义 / Character Symbolism
（从字形、结构、部首、五行等角度解释这个字对所问之事的象征）

## 卦象启示 / Hexagram Insight
（结合本卦、上下卦、体用关系与动爻，给出卦象层面的启示）

## 外应线索 / External Response
（将用户所写的外应信息自然融入，说明其与所占之事的呼应）

## 事态分析 / Situation
（当前事情的现状、关键矛盾或主要趋势）

## 行动建议 / Advice
（基于测字、卦象与外应给出的可执行建议，避免空泛）

## 小结 / Summary
（用一句话总结本次梅花易数测字的核心启示）

【重要】输出只包含上述六个段落，不要添加总结或建议之外的额外内容。`
}

function buildUserPrompt(result: CeziYishuResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const a = result.analysis
  const h = result.hexagram
  const t = result.time
  const d = result.derivation

  const charDetails = a.chars.map((c) => {
    return `- ${c.char}：${c.strokes} 画，部首 ${c.radical}，结构 ${c.structure}，五行 ${c.wuxing}，字义「${c.meaning}」${c.estimated ? '（笔画为系统估算）' : ''}`
  }).join('\n')

  return `请为以下梅花易数测字结果做解读：

【所占之字】
${result.input.chars}

【逐字分析】
${charDetails}

【总笔画数】
${a.totalStrokes} 画

【起卦时间】
公历：${t.gregorian}
农历：${t.lunar.yearGanZhi}年 ${t.lunar.month}月${t.lunar.day}日 ${t.lunar.hourZhi}时
八字：${t.lunar.yearGanZhi} ${t.lunar.monthGanZhi} ${t.lunar.dayGanZhi} ${t.lunar.hourZhi}

【起卦推导】
- 上卦：${d.upperFormula}
- 下卦：${d.lowerFormula}
- 动爻：${d.movingLineFormula}

【推演卦象】
- 本卦：${h.name} ${h.symbol}
- 上卦：${h.upper.name}（${h.upper.nature}）${h.upper.symbol}，五行 ${h.upper.wuxing}
- 下卦：${h.lower.name}（${h.lower.nature}）${h.lower.symbol}，五行 ${h.lower.wuxing}
- 动爻：第 ${h.movingLine} 爻

【所占事项】
${result.input.question}

【外应线索】
${result.input.external}

请按 测字象义 → 卦象启示 → 外应线索 → 事态分析 → 行动建议 → 小结 的顺序输出六段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: CeziYishuResult
    locale?: string
  }>(event)

  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.result, locale)

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
