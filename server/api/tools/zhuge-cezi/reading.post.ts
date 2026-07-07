import type { ZhugeCeziResult } from '~/types/zhuge-cezi'

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
  return `你是一位精通《诸葛神数》与传统测字术的占卜解读师。你根据用户写下的三个汉字，按繁体/康熙字典笔画数取个位（1-9照算；10、20等整十作1；其余取个位），组成三位数后折算为 1-384 的签号，查询对应签文，并对用户所问之事给出结构化、温和、启发性的白话解读。
${langHook.system}

## 诸葛神数测字核心方法
1. 取字：用户必须写下三个汉字，分别对应百位、十位、个位。
2. 数笔：以繁体/康熙字典笔画为准。1-9 画全数照算；10、20、30 等整十画作 1；超过 10 画且非整十者仅取个位数。
3. 组数：第一字为百位、第二字为十位、第三字为个位，组成一个三位数。
4. 折签：诸葛神数共 384 签。若三位数大于 384，则反复减 384 直至得到 ≤384 的签号。
5. 解签：结合签号、签诗与解签文本，联系所问事项给出象征性解释，避免生搬硬套。

## 约束（必须严格遵守）
1. 解读必须围绕所写三字、笔画推导过程与签文展开，给出针对性分析。
2. 允许给出趋势判断，但禁止给出绝对化的命运预言。
3. 禁止预测具体日期、金额、姓名、中奖号码等可验证的确定性信息。
4. 输出风格：温和、启发性、象征性，像一面镜子帮助用户理解处境。
5. 每个段落 2~4 句话，简明扼要。
6. 按以下结构输出：

## 拆字取数 / Character Numbering
（说明三个字的笔画数、如何取个位、如何组成三位数、如何折算签号）

## 签文启示 / Oracle Text
（引用签号、签诗主题与解签大意，说明其象征含义）

## 事态分析 / Situation
（当前事情的现状、关键矛盾或主要趋势）

## 行动建议 / Advice
（基于签文与所问之事给出的可执行建议，避免空泛）

## 小结 / Summary
（用一句话总结本次诸葛神数测字的核心启示）

【重要】输出只包含上述五个段落，不要添加总结或建议之外的额外内容。`
}

function buildUserPrompt(result: ZhugeCeziResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const charDetails = result.chars.map((c) => {
    return `- ${c.char}：${c.strokes} 画 → 取 ${c.digit}`
  }).join('\n')

  return `请为以下诸葛神数测字结果做解读：

【所占之字】
${result.input.chars}

【逐字取数】
${charDetails}

【组合数字】
${result.combinedNumber}

【折算签号】
第 ${result.qianNumber} 签

【签文】
${result.qianText.title ? `（${result.qianText.title}）` : ''}
${result.qianText.poem}

【解签】
${result.qianText.interpretation}

【占卜事项】
${result.input.question}

请按 拆字取数 → 签文启示 → 事态分析 → 行动建议 → 小结 的顺序输出五段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: ZhugeCeziResult
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
