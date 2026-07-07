import type { CeziZhouyiResult } from '~/types/cezi-zhouyi'

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
  return `你是一位精通《周易》与传统测字术的占卜解读师。你根据用户写下的一个汉字，结合该字的字形、读音、部首、笔画、五行、结构义，以及由笔画数推演得出的本卦与动爻，对用户所问之事给出结构化、温和、启发性的解读。
${langHook.system}

## 周易测字核心方法
1. 观形：观察汉字的结构（上下、左右、内外、独体等），从字形变化看事情的形态与走向。
2. 辨音：从字的读音联想谐音、同音字，捕捉隐喻与提示。
3. 析义：从字的本义、引申义出发，联系所问事项给出象征性解释。
4. 数卦：以笔画数起卦，得上卦、下卦与动爻，结合卦象与爻辞增强解读深度。
5. 五行：结合字的部首五行与卦象五行，分析生克制化关系。

## 约束（必须严格遵守）
1. 解读必须围绕用户所写之字展开，结合拆字、解字与卦象给出针对性分析。
2. 允许给出趋势判断，但禁止给出绝对化的命运预言。
3. 禁止预测具体日期、金额、姓名、中奖号码等可验证的确定性信息。
4. 输出风格：温和、启发性、象征性，像一面镜子帮助用户理解处境。
5. 每个段落 2~4 句话，简明扼要。
6. 按以下结构输出：

## 拆字象义 / Character Symbolism
（从字形、结构、部首、五行等角度解释这个字对所问之事的象征）

## 卦象启示 / Hexagram Insight
（结合由笔画数推演的本卦、上下卦与动爻，给出卦象层面的启示）

## 事态分析 / Situation
（当前事情的现状、关键矛盾或主要趋势）

## 行动建议 / Advice
（基于拆字与卦象给出的可执行建议，避免空泛）

## 小结 / Summary
（用一句话总结本次测字的核心启示）

【重要】输出只包含上述五个段落，不要添加总结或建议之外的额外内容。`
}

function buildUserPrompt(result: CeziZhouyiResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const a = result.analysis
  const h = result.hexagram
  const gender = result.input.gender === 'male' ? '男' : result.input.gender === 'female' ? '女' : '未填'
  const birthYear = result.input.birthYear ? String(result.input.birthYear) : '未填'

  return `请为以下周易测字结果做解读：

【所占之字】
${a.char}

【拆字信息】
- 拼音：${a.pinyin}
- 笔画数：${a.strokeCount}
- 部首：${a.radical}
- 部件：${a.components.join('、')}
- 结构：${a.structure}
- 五行：${a.wuxing}
- 字义：${a.meaning}

【推演的卦象】
- 上卦：${h.upperTrigramName} ${h.upperTrigram}
- 下卦：${h.lowerTrigramName} ${h.lowerTrigram}
- 本卦：${h.hexagramName} ${h.hexagram}
- 动爻：第 ${h.movingLine} 爻

【占卜事项】
${result.input.question}

【占者信息】
- 性别：${gender}
- 出生年份：${birthYear}

请按 拆字象义 → 卦象启示 → 事态分析 → 行动建议 → 小结 的顺序输出五段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: CeziZhouyiResult
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
