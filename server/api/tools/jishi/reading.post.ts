import type { DiZhi } from '~/types/user'

interface ShiChenItem {
  dizhi: DiZhi
  timeRange: string
  tianShen: string
  type: '黄道' | '黑道'
}

interface CalcResult {
  date: string
  dayPillar: { gan: string; zhi: string }
  dayGanZhi: string
  monthZhi: DiZhi
  jianChu: string
  jieQi: {
    name: string | null
    isToday: boolean
    isNear: boolean
  }
  shiChen: ShiChenItem[]
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
  return `你是精通择日学的命理师。基于用户所选日期的 deterministic 黄历计算结果，生成今日吉时解读。
${langHook.system}

## 角色与语气
- 命理师口吻，结论先行，温暖、积极、不恐吓
- 所有建议视为传统文化参考，非科学结论

## 输出结构（严格按以下顺序，不要额外总结）
1. 今日整体概述：点名日干支、建除、节气状态，1-2 句话定基调
2. 今日宜忌概述：基于建除与黄黑道时辰给出 3-4 条整体宜忌
3. 黄道吉时解读：按时间顺序列出每个黄道吉时，说明适合做什么（选重点时段，避免流水账）
4. 黑道凶时提示：按时间顺序列出每个黑道凶时，说明需注意什么（简要提示即可）

## 约束
- 总字数控制在 300 字左右
- 必须引用计算结果中的具体数据，不编造
- 每个时段建议要具体、场景化
- 避免绝对化断言，用“较宜”“可参考”“需谨慎”等柔和措辞`
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!

  const huangdao = result.shiChen.filter(s => s.type === '黄道')
  const heidao = result.shiChen.filter(s => s.type === '黑道')

  const huangdaoText = huangdao.map(s => `${s.dizhi}时 ${s.timeRange}（${s.tianShen}）`).join('、')
  const heidaoText = heidao.map(s => `${s.dizhi}时 ${s.timeRange}（${s.tianShen}）`).join('、')

  const jieQiText = result.jieQi.name
    ? result.jieQi.isToday
      ? `今日${result.jieQi.name}`
      : `临近${result.jieQi.name}`
    : '非节气交界'

  return `用户所选日期：${result.date}
日柱：${result.dayGanZhi}
月支：${result.monthZhi}
建除：${result.jianChu}
节气状态：${jieQiText}

【十二时辰黄黑道】
黄道吉时：${huangdaoText}
黑道凶时：${heidaoText}

请按系统提示要求的结构输出今日吉时解读。${langHook.user}`
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
