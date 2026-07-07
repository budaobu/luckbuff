import type { DiZhi } from '~/types/user'

interface WuxingColorSet {
  wuxing: string
  colors: string[]
  reason: string
}

interface CalcResult {
  userGanzhi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  riGan: string
  riGanWuxing: string
  queryDate: string
  queryGanzhi: { gan: string; zhi: string }
  queryRiGan: string
  queryRiGanWuxing: string
  daJi: WuxingColorSet
  ciJi: WuxingColorSet
  buYi: WuxingColorSet
  xiyongWuxing: string
  jishenWuxing: string
  locale: string
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
  return `你是精通四柱八字与五行色彩搭配的命理师。基于用户出生四柱与所选日期的 deterministic 计算结果，生成个性化的五行穿衣指南白话解读。
${langHook.system}

## 角色与语气
- 命理师口吻，结论先行，具体点名颜色、五行与搭配建议
- 温暖、积极、实用，避免恐吓或绝对化断言
- 所有建议视为传统文化参考，非科学结论

## 输出结构（严格按以下顺序，每段之间用单独一行的 --- 分隔，不要额外总结）
1. 基调：以所选日期的干支与五行定性开篇，1 句话定基调
2. 大吉色：推荐具体颜色、适合穿搭场景与搭配技巧
3. 次吉色：推荐具体颜色、适合作为辅助色或内搭
4. 不宜色：说明为何不建议、如需穿着如何化解
5. 综合建议：根据用户日主喜用五行，给出 2-3 条整体穿搭建议

## 约束
- 总字数控制在 250 字左右
- 必须引用计算结果中的具体颜色数据，不编造
- 建议需贴合日常穿搭场景（通勤、约会、会议、休闲等）
- 若用户日主喜用五行与大吉色五行一致，可强调为「双重加分」
- 段与段之间必须只输出单独一行的 ---，不要加其他标记`
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!

  return `用户出生四柱：${result.userGanzhi.year.gan}${result.userGanzhi.year.zhi}年 ${result.userGanzhi.month.gan}${result.userGanzhi.month.zhi}月 ${result.userGanzhi.day.gan}${result.userGanzhi.day.zhi}日 ${result.userGanzhi.hour ? result.userGanzhi.hour.gan + result.userGanzhi.hour.zhi + '时' : '时辰未知'}
日主天干：${result.riGan}（${result.riGanWuxing}）
日主喜用五行：${result.xiyongWuxing}，忌神五行：${result.jishenWuxing}
查询日期：${result.queryDate}
查询日柱：${result.queryGanzhi.gan}${result.queryGanzhi.zhi}日（日干五行 ${result.queryRiGanWuxing}）

【五行穿衣颜色计算结果】
大吉色（${result.daJi.wuxing}）：${result.daJi.colors.join('、')} —— ${result.daJi.reason}
次吉色（${result.ciJi.wuxing}）：${result.ciJi.colors.join('、')} —— ${result.ciJi.reason}
不宜色（${result.buYi.wuxing}）：${result.buYi.colors.join('、')} —— ${result.buYi.reason}

请按系统提示要求的结构输出五行穿衣指南白话解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result: CalcResult; locale?: string }>(event)

  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const result = body.result
  const locale = body.locale || result.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(result)

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
  }
  catch (e: any) {
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
        }
        catch {
          // non-JSON chunk: ignore
        }
      }
    }
  }
  catch (e: any) {
    emit({ type: 'error', message: `读取 AI 流时出错：${e?.message ?? e}` })
  }
  finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
