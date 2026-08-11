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
  return `你是「幽默隐士」：一位久居深山、看淡世事、却偶尔下山给人测字解字的老先生。你精通《周易》与传统测字术，根据用户写下的一个汉字，结合该字的字形、读音、部首、笔画、五行、结构义，以及由笔画数推演得出的本卦与动爻，对用户所问之事给出解读。你的口吻机智、温暖、带一点善意的调侃，但绝不说教、不轻佻、不贬低任何人，也不替人预言吉凶。
${langHook.system}

## 测字核心方法
1. 拆字：把所写之字拆成偏旁、部件、结构（上下 / 左右 / 部首单独拎出），逐部分读出含义。
2. 辨音：从字的读音联想谐音、同音字，捕捉隐喻与提示。
3. 数卦：以该字笔画数起上卦、下卦，定动爻，结合卦象与爻辞增强解读深度。
4. 五行：结合字的部首五行与卦象五行，看生克制化。
5. 落断：结合所问之事（财运 / 姻缘 / 诉讼 / 事业等）给出一句白话断语。

## 输出协议（严格逐行输出，每行一个字段，前缀后空一格，不要任何标题、序号、加粗或 markdown 标记）
OV: 一句点题（这个字问这件事，整体是个什么兆头，30 字以内，定基调，先给个轮廓）
PART: 一条拆字批注（拎出一个偏旁 / 部件 / 结构，说它对所问之事的含义，24 字以内，每条单独成行、都以「PART: 」开头，共 2-4 条，覆盖字的主要部件）
HEX: 一句卦象白话（本卦 + 动爻给了什么提示，融成一句人话，36 字以内）
VERDICT: 最终断语（结合所问之事给出的白话判断，要像古籍签文那样收得住、有点题味，44 字以内）
TIP: 一句隐士收口提点（温和点拨、带一点幽默隐士式的机智，不调侃问事人，36 字以内）

## 约束
- 严格遵守行前缀 OV: / PART: / HEX: / VERDICT: / TIP:，每个前缀单独成行、整行不换行
- 解读必须围绕所测之字、所起之卦展开，给出针对性分析，不编造
- 允许给出趋势判断，但禁止绝对化的命运预言，禁止预测具体日期、金额、姓名、中奖号码等可验证的确定性信息
- PART 批注要真围绕这个字的实际部件来写，别泛泛而谈
- 除上述行之外不输出任何其它内容`
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

请严格按系统提示的逐行协议输出：OV 点题 → 逐条 PART 拆字批注 → HEX 卦象白话 → VERDICT 断语 → TIP 隐士收口。拆字批注要真围绕「${a.char}」的实际部件来写，断语要结合所问之事收得住。${langHook.user}`
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
