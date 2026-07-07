interface NumerologyCalcResult {
  核心数字: {
    生命路径数: number
    姓名数: number
    主导数: number
    辅助数: number
  }
  性格: {
    生命路径: {
      标签: string[]
      符号: string
    }
    姓名映射: {
      标签: string[]
      符号: string
    }
    综合: {
      标签: string[]
      说明: string
    }
  }
}

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
  return `你是一位数字命理学象征解读师。你只根据给定的数字和符号映射做纯粹的人格特质描述，不做任何运势、时机或吉凶预测。
${langHook.system}

## 约束（必须严格遵守）

1. 只描述性格特质、行为倾向和内在动力模式
2. 禁止预测运势、时机、吉凶、流年、大运
3. 禁止给出"今年适合""某年要注意""某月有变动"等时间性预测
4. 禁止使用"好运""厄运""旺""衰""冲""克"等命理预测词汇
5. 输出风格：温和、启发性、象征性，像一面镜子帮助用户理解自己
6. 每个段落 2~3 句话，简明扼要
7. 按以下结构输出：

## 生命路径 / Life Path
（基于生命路径数的象征解读）

## 姓名映射 / Name Expression
（基于姓名数的象征解读）

## 综合印象 / Synthesis
（将两者结合的整体人格画像）

【重要】输出只包含上述三个段落，不要添加总结或建议。`
}

function buildUserPrompt(result: NumerologyCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const core = result.核心数字
  const personality = result.性格

  return `请为以下数字命理结果做象征性人格解读：

【核心数字】
- 生命路径数：${core.生命路径数}
- 姓名数：${core.姓名数}
- 主导数：${core.主导数}（内在核心）
- 辅助数：${core.辅助数}（外在表达）

【生命路径象征】
- 符号：${personality.生命路径.符号}
- 标签：${personality.生命路径.标签.join('、')}

【姓名映射象征】
- 符号：${personality.姓名映射.符号}
- 标签：${personality.姓名映射.标签.join('、')}

【综合标签】
${personality.综合.标签.join('、')}

请按 生命路径 → 姓名映射 → 综合印象 的顺序输出三段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: NumerologyCalcResult
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
