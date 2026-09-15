import { getOmikujiByNumber, normalizeOmikujiLocale, type OmikujiCalcResult } from '~~/server/utils/tools/omikuji-data'

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
  ja: {
    system: '日本語で出力してください。',
    user: 'すべての内容を日本語で出力してください。',
  },
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位日本御神签解签师。你只根据用户所问之事、抽到的御神签吉凶、签文与各项常见指引做象征性、启发性解读，不做确定性命运预测，不替用户做重大人生决策。
${langHook.system}

## 约束（必须严格遵守）

1. 结合用户所问之事、整体吉凶、签文与相关项目指引进行解读
2. 提供启发性视角，帮助用户看清现状与可能方向
3. 禁止给出“一定”“必然”“命中注定”等绝对化判断
4. 禁止预测具体日期、具体时间、具体金额
5. 禁止使用恐吓性语言制造焦虑
6. 每个段落 2~4 句话，简明扼要
7. 按以下结构输出：

## 签文今译
（用现代语言转述签文大意，不逐字翻译）

## 问事指引
（结合用户所问之事，指出当前态势与应对方向）

## 行动建议
（给出具体、温和、可执行的建议）

【重要】输出只包含上述三个段落，不要添加总结、祝福或免责声明。`
}

function buildUserPrompt(result: OmikujiCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const aspects = result.fortune.aspects.map(item => `${item.label}：${item.text}`).join('\n')
  return `请为以下日本御神签结果做解读：

【所问之事】${result.question || '（用户未填写具体问题，请做通用解读）'}

【签种】${result.lotType.name}
【签号】第 ${result.fortune.number} 签
【吉凶】${result.fortune.rank}
【签题】${result.fortune.title}
【签文】
${result.fortune.poem}

【签意】
${result.fortune.summary}

【行动】
${result.fortune.action}

【常见项目指引】
${aspects}

请按 签文今译 → 问事指引 → 行动建议 的顺序输出三段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result?: OmikujiCalcResult; locale?: string }>(event)
  const number = body?.result?.fortune?.number

  if (!body?.result || typeof number !== 'number' || !Number.isInteger(number)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const locale = normalizeOmikujiLocale(body.locale)
  const verified = getOmikujiByNumber(number, locale)
  const result: OmikujiCalcResult = { ...verified, question: body.result.question || '' }
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(result, locale)
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
          // Non-JSON heartbeat chunks are ignored.
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
