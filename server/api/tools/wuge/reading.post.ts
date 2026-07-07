import type { WugeResult } from '~~/server/utils/wuge/calc'

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
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  return `你是一位姓名学五格剖象法解读师。你只根据给定的五格数理做纯粹的人格特质与运势倾向描述，不做超出数理本身的预测。
${langHook.system}

## 约束（必须严格遵守）

1. 只描述性格特质、事业倾向、人际关系、健康注意等基于五格数理的传统解读
2. 禁止预测具体流年、大运、时机、吉凶日期
3. 禁止给出"今年适合""某年要注意""某月有变动"等时间性预测
4. 输出风格：温和、启发性、象征性，像一面镜子帮助用户理解自己
5. 每个段落 2~3 句话，简明扼要
6. 按以下结构输出：

## 天格 / Heaven Grid
（基于天格数理的祖先/先天运势解读）

## 人格 / Personality Grid
（基于人格数理的主运/性格核心解读）

## 地格 / Earth Grid
（基于地格数理的早年/基础运解读）

## 外格 / External Grid
（基于外格数理的社交/外部关系解读）

## 总格 / Total Grid
（基于总格数理的晚年/总体运势解读）

## 综合评鉴 / Synthesis
（将五格结合的整体姓名画像与建议）

【重要】输出只包含上述六个段落，不要添加总结或建议。`
}

function buildUserPrompt(result: WugeResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const g = result.grids

  const gridLine = (label: string, grid: { name: string; value: number; fortune: { fortune: string; desc: string } }) =>
    `${label}（${grid.name}）：${grid.value} — ${grid.fortune.fortune}，${grid.fortune.desc}`

  return `请为以下五格剖象法结果做象征性解读：

【姓名】${result.input}
【拆字】${result.surname} · ${result.givenName}

【五格数理】
${gridLine('天格', g.tiange)}
${gridLine('人格', g.renge)}
${gridLine('地格', g.dige)}
${gridLine('外格', g.waige)}
${gridLine('总格', g.zongge)}

【各字笔画】
${result.chars.map((c: { char: string; strokes: number }) => `${c.char}：${c.strokes} 画`).join('\n')}

请按 天格 → 人格 → 地格 → 外格 → 总格 → 综合评鉴 的顺序输出六段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: WugeResult
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
