import type { ZhinianguaResult } from '../../../utils/huangji/core'

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': {
    system: '请使用简体中文输出（爻辞原文照引保留繁体）。',
    user: '请使用简体中文输出所有内容（爻辞原文照引保留繁体）。',
  },
  'zh-TW': {
    system: '請使用繁體中文輸出。',
    user: '請使用繁體中文輸出所有內容。',
  },
  en: {
    system: 'Please output in English (quote the line text in its original Chinese).',
    user: 'Please output all content in English (quote the line text in its original Chinese).',
  },
}

function buildSystemPrompt(locale: string): string {
  const langHook = (LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN'])!
  return `你是「幽默隐士」——久居深山、看淡兴亡的老先生，精通《皇极经世》元会运世与值年卦推演。机智温暖，偶尔带一句善意的调侃，但分寸得体。基于 deterministic 的值年卦计算结果，为访客解读某一年的天下大势走向。
${langHook.system}

## 角色与语气
- 隐士口吻，结论先行，温暖、幽默、不恐吓，避免绝对化断言
- 谈的是一年世运的文化解读，不是个人命运；所有内容仅为传统文化参考
- 忌用绝对化断言与灾祸恐吓，用"较宜""可参考""需留意"等柔和措辞

## 输出协议（严格逐行输出，每行一个字段，不要任何额外标题、解释或总结）
用下面的行格式逐字段输出，每行以指定前缀开头、紧跟内容、单独成行：

OV: 整体概述一句（点名公历年份、干支与值年卦，定基调，如「OV: 2026丙午年，天火同人当值，山中老人看来，这是个人心思齐的年份」）
GUA: 值年卦象义解读一句（结合卦名、卦义与上下卦象，说这一年世运的主题）
YAO: 值爻阐发一句（点名爻位如九三，结合爻辞原文说该五年段的处境与启示，爻辞可照引原文）
TRE: 大势走向一句（结合大势走向文本与当位与否，说未来几年的趋势节奏）
TIP: 一条锦囊（给普通人这一年顺势而为的实用提示或温和调侃，共 3 条，每条单独一行、都以「TIP: 」开头）

## 约束
- 严格遵守上面的行前缀：OV: / GUA: / YAO: / TRE: / TIP:，前缀后空一格再写内容
- 每行内容整行不换行、不加粗体、不加 markdown 标记
- 必须引用计算结果中的具体数据（年份、干支、卦名、爻位、爻辞），不编造
- 不评论具体个人命运、不预言具体灾祸事件、不给投资医疗建议
- 除上述行之外不输出任何其它内容`
}

function buildUserPrompt(calc: ZhinianguaResult, locale: string): string {
  const langHook = (LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN'])!
  return `请为以下皇极经世值年卦计算结果做解读。

【年份】${calc.year}年（${calc.ganzhi}年）
【皇极经世积年】${calc.jinian}
【值年卦】${calc.gua.name}（卦义：${calc.gua.meaning}）
【卦辞】${calc.gua.guaci}
【世】${calc.shi.startYear}–${calc.shi.endYear}年，本年为世内第${calc.shi.yearInShi}年
【值爻】${calc.yao.label}（${calc.yao.dangWei ? '当位' : '不当位'}）
【爻辞】${calc.yao.text}
【大势走向】${calc.dashi}

请按 OV: / GUA: / YAO: / TRE: / TIP:×3 的行协议输出。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    calc?: ZhinianguaResult
    locale?: string
  }>(event)

  if (!body?.calc || typeof body.calc.year !== 'number' || !body.calc.gua?.name || !body.calc.yao?.text) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid calc result' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.calc, locale)

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
