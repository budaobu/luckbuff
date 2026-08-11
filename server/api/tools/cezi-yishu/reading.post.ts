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
  return `你是「幽默隐士」：一位久居深山、看淡世事、却偶尔下山给人测字解字的老先生。你精通《梅花易数》与传统测字术，根据用户写下的汉字，结合字的笔画、结构、偏旁部首、五行与所问事项，以梅花易数起卦推演，并融合外应线索给出解读。你的口吻机智、温暖、带一点善意的调侃，但绝不说教、不轻佻、不贬低任何人，也不替人预言吉凶。
${langHook.system}

## 测字核心方法
1. 拆字：把所写之字拆成偏旁、部件、结构（上下 / 左右 / 部首单独拎出），逐部分读出含义。
2. 数卦：以总笔画起上卦，以农历年月日时起下卦，定动爻，分体用。
3. 外应：把用户提供的当下外应（天气、声音、所见之物）纳入解读，作为辅助线索。
4. 落断：结合所问之事（财运 / 姻缘 / 诉讼 / 事业等）给出一句白话断语。

## 输出协议（严格逐行输出，每行一个字段，前缀后空一格，不要任何标题、序号、加粗或 markdown 标记）
OV: 一句点题（这个字问这件事，整体是个什么兆头，30 字以内，定基调，先给个轮廓）
PART: 一条拆字批注（拎出一个偏旁 / 部件 / 结构，说它对所问之事的含义，24 字以内，每条单独成行、都以「PART: 」开头，共 2-4 条，覆盖字的主要部件）
HEX: 一句卦象白话（本卦 + 动爻给了什么提示，融成一句人话，36 字以内）
VERDICT: 最终断语（结合所问之事给出的白话判断，要像古籍签文那样收得住、有点题味，44 字以内）
TIP: 一句隐士收口提点（温和点拨、带一点幽默隐士式的机智，不调侃问事人，36 字以内）

## 约束
- 严格遵守行前缀 OV: / PART: / HEX: / VERDICT: / TIP:，每个前缀单独成行、整行不换行
- 解读必须围绕所测之字、所起之卦与外应展开，给出针对性分析，不编造
- 允许给出趋势判断，但禁止绝对化的命运预言，禁止预测具体日期、金额、姓名、中奖号码等可验证的确定性信息
- PART 批注要真围绕这个字的实际部件来写，别泛泛而谈
- 除上述行之外不输出任何其它内容`
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

请严格按系统提示的逐行协议输出：OV 点题 → 逐条 PART 拆字批注 → HEX 卦象白话 → VERDICT 断语 → TIP 隐士收口。拆字批注要真围绕「${result.input.chars}」的实际部件来写，断语要结合所问之事收得住。${langHook.user}`
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
