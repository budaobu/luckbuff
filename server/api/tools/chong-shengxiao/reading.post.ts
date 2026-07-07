import type { DiZhi } from '~/types/user'

interface HourInfo {
  zhi: DiZhi
  timeRange: string
  chongShengXiao: string
  sha: string
  luck: string
  tianShenType: string
}

interface CalcResult {
  userGanzhi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  queryDate: string
  lunar: {
    date: string
    lunarDate: string
    yearGanZhi: string
    monthGanZhi: string
    dayGanZhi: string
    dayZhi: DiZhi
    dayShengXiao: string
    dayChongDesc: string
    dayChongZhi: DiZhi
    dayChongShengXiao: string
    daySha: string
    positionXiDesc: string
    positionCaiDesc: string
    positionFuDesc: string
    hours: HourInfo[]
    relationSentence: string
  }
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
  return `你是精通传统黄历与生肖冲合的命理师。基于用户出生四柱与目标日期的 deterministic 黄历数据，生成今日冲生肖的白话解读。
${langHook.system}

## 角色与语气
- 命理师口吻，结论先行，具体点名今日日支生肖、相冲生肖、三合六合与三神方位
- 温暖、积极、不恐吓，避免绝对化断言
- 所有建议视为传统文化参考，非科学结论

## 输出结构（严格按以下顺序，段落之间用单独一行的 \`---\` 分隔，不要额外总结）

第 1 段：标题为「今日冲合总览」。用 1-2 句话概括今日日柱生肖、与谁相冲、整体气场基调。

第 2 段：标题为「时辰提示」。从十二时辰对冲表中挑选 2-3 个吉时说明较宜做什么，再挑选 2-3 个凶时提示需谨慎。

第 3 段：标题为「行事建议」。结合用户日主与今日冲合关系，给出 2-3 条具体建议，可涉及会面、签约、出行等日常场景。

第 4 段：标题为「三神方位」。简要说明喜神、财神、福神方位如何参考使用。

## 约束
- 总字数控制在 250 字左右
- 必须引用计算结果中的具体数据，不编造
- 避免使用「今日」「今天」重复堆砌
- 不给出运势、吉凶、时机类的绝对预测`
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!

  const hourText = result.lunar.hours
    .map(h => `${h.zhi}时 ${h.timeRange} 冲${h.chongShengXiao} 煞${h.sha} ${h.luck}（${h.tianShenType}）`)
    .join('\n')

  return `用户出生四柱：${result.userGanzhi.year.gan}${result.userGanzhi.year.zhi}年 ${result.userGanzhi.month.gan}${result.userGanzhi.month.zhi}月 ${result.userGanzhi.day.gan}${result.userGanzhi.day.zhi}日 ${result.userGanzhi.hour ? result.userGanzhi.hour.gan + result.userGanzhi.hour.zhi + '时' : '时辰未知'}
查询日期：${result.queryDate}（${result.lunar.lunarDate}）
今日干支：${result.lunar.yearGanZhi}年 ${result.lunar.monthGanZhi}月 ${result.lunar.dayGanZhi}日
今日日支生肖：${result.lunar.dayShengXiao}
今日冲生肖：${result.lunar.dayChongDesc}
今日生肖关系：${result.lunar.relationSentence}
今日煞方：${result.lunar.daySha}

【三神方位】
喜神方位：${result.lunar.positionXiDesc}
财神方位：${result.lunar.positionCaiDesc}
福神方位：${result.lunar.positionFuDesc}

【十二时辰对冲表】
${hourText}

请按系统提示要求的结构输出今日冲生肖白话解读。${langHook.user}`
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
