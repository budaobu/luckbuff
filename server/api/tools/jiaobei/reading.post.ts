import type { JiaobeiCalcResult } from '~~/server/utils/tools/jiaobei-data'

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

function getLangHook(locale: string): { system: string; user: string } {
  return LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
}

function buildSystemPrompt(locale: string): string {
  const langHook = getLangHook(locale)
  return `你是一位掷筊杯（跋杯）解卦师。你只根据用户所问之事、掷出的三次筊杯结果与卦辞做象征性、启发性解读，不做确定性命运预测，不替用户做重大人生决策。
${langHook.system}

## 约束（必须严格遵守）

1. 结合用户所问之事、筊杯组合与卦辞进行解读
2. 提供启发性视角，帮助用户看清现状与可能方向
3. 禁止给出"一定""必然""命中注定"等绝对化判断
4. 禁止预测具体日期、具体时间、具体金额
5. 禁止使用恐吓性语言制造焦虑
6. 每个段落 2~4 句话，简明扼要
7. 按以下结构输出：

## 卦辞今译
（用现代语言转述卦辞大意，不逐字翻译）

## 问事指引
（结合用户所问之事，指出当前态势与应对方向）

## 行动建议
（给出具体、温和、可执行的建议）

【重要】输出只包含上述三个段落，不要添加总结、祝福或免责声明。`
}

function buildUserPrompt(result: JiaobeiCalcResult, locale: string): string {
  const langHook = getLangHook(locale)
  const f = result.fortune
  return `请为以下掷筊杯结果做解读：

【所问之事】${result.question || '（用户未填写具体问题，请做通用解读）'}

【筊杯结果】第 ${f.number} 卦
【三次掷杯】${result.tosses.join(' → ')}
【卦名】${f.name || '（无卦名）'}
【吉凶】${f.level}

【卦辞】
${f.poem}

【解卦】
${f.explanation}

【断曰】
${f.advice || '（无）'}

【典故】
${f.story || '（无）'}

请按 卦辞今译 → 问事指引 → 行动建议 的顺序输出三段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result?: JiaobeiCalcResult; locale?: string }>(event)

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
