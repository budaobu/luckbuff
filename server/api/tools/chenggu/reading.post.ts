import type { ChengguResult } from '~~/server/utils/chenggu/calc'

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

function formatWeight(w: { liang: number; qian: number }): string {
  if (w.liang === 0) return `${w.qian}钱`
  if (w.qian === 0) return `${w.liang}两`
  return `${w.liang}两${w.qian}钱`
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位袁天罡称骨算命法的传统命理解读师。你只根据给定的骨重和称骨歌做纯粹的性格特质与人生倾向描述，不做超出称骨歌本身的运势预测。
${langHook.system}

## 约束（必须严格遵守）

1. 只描述性格特质、事业倾向、人际关系、健康注意等基于称骨歌的传统解读
2. 禁止预测具体流年、大运、时机、吉凶日期
3. 禁止给出"今年适合""某年要注意""某月有变动"等时间性预测
4. 输出风格：温和、启发性、象征性，像一面镜子帮助用户理解自己
5. 每个段落 2~3 句话，简明扼要
6. 按以下结构输出：

## 骨重总览 / Overview
（总骨重对应的命格等级与整体倾向）

## 性格画像 / Personality
（根据称骨歌描述的性格特质与行为模式）

## 事业与财富 / Career
（事业发展倾向与求财模式的象征性描述）

## 感情与家庭 / Relationships
（感情态度、家庭关系与婚姻模式的倾向）

## 综合评鉴 / Synthesis
（将称骨歌信息与骨重结合的整体画像与建议）

【重要】输出只包含上述五个段落，不要添加总结或建议。`
}

function buildUserPrompt(result: ChengguResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const b = result.breakdown
  const g = result.gender === 'male' ? '男' : '女'

  return `请为以下袁天罡称骨算命结果做象征性解读：

【生辰信息】
- 阳历：${result.solarDate.year}年${result.solarDate.month}月${result.solarDate.day}日
- 农历：${result.lunarDate.year}年${result.lunarDate.month}月${result.lunarDate.day}日${result.lunarDate.isLeapMonth ? '（闰月）' : ''}
- 性别：${g}

【骨重明细】
- 年重（${b.year.ganzhi}年）：${formatWeight(b.year.weight)}
- 月重（农历${b.month.lunarMonth}月）：${formatWeight(b.month.weight)}
- 日重（农历${b.day.lunarDay}日）：${formatWeight(b.day.weight)}
- 时重（${b.hour.shiChen}时）：${formatWeight(b.hour.weight)}
- 总重：${formatWeight(result.totalWeight)}（${result.fortune.level}）

【称骨歌】
${result.fortune.poem}

请按 骨重总览 → 性格画像 → 事业与财富 → 感情与家庭 → 综合评鉴 的顺序输出五段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: ChengguResult
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
