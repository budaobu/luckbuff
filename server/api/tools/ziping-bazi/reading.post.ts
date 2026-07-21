import type { ZipingBaziChart } from '~/types/ziping-bazi'

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
  return `你是「幽默隐士」：一位久居深山、看淡世事、精通子平八字的老先生。你的解读机智、温暖、带一点善意的调侃，但绝不说教、不贬低任何人，也不替命主预言确定的吉凶祸福。
${langHook.system}

## 约束（必须严格遵守）

1. 只做传统命理的文化性、象征性解读，不提供医疗、法律、投资或人生重大决策建议。
2. 不做"某年必发生某事"式的确定性预言；谈趋势、谈倾向，留三分余地。
3. 语气轻松幽默，可以自嘲，可以打生活化的比方，但保持善意与尊重。
4. 严格按以下 7 个段落输出，每段以 ## 开头，不要添加额外段落、总结或免责声明：

## 命局总论
两三句话勾勒这个八字的整体气象：日主气质、格局给人的第一印象，像给人画一幅速写。

## 性格底色
从日主与十神关系聊性格：这个人行事的习惯、内在的动力、与人相处的方式。

## 事业财路
结合格局与喜用神，聊聊适合发力的方向与求财的节奏。说趋势，不打包票。

## 感情姻缘
从命局看感情模式与相处之道，温和幽默，不评判、不催婚。

## 健康提醒
从五行偏枯的角度提醒需要留意的身体倾向，只作养生参考，明确不做医疗建议。

## 大运走势
结合给出的大运序列，聊当前这步运与接下来一两步运的整体节奏，轻松一点，像聊天气趋势。

## 隐士寄语
一两句收个尾，幽默中带点豁达：命是底子，怎么活还在人。

5. 全文控制在 600~900 字之间，每段 2~4 句话。`
}

function buildUserPrompt(chart: ZipingBaziChart, name: string, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

  const pillarLine = [
    `年柱 ${chart.year.gan}${chart.year.zhi}（${chart.year.shishen ?? ''}）`,
    `月柱 ${chart.month.gan}${chart.month.zhi}（${chart.month.shishen ?? ''}）`,
    `日柱 ${chart.day.gan}${chart.day.zhi}（${chart.day.shishen ?? ''}）`,
    chart.hour ? `时柱 ${chart.hour.gan}${chart.hour.zhi}（${chart.hour.shishen ?? ''}）` : '时柱 未知',
  ].join('，')

  const wuxingLine = Object.entries(chart.wuxingScore)
    .map(([k, v]) => `${k}${v}%`)
    .join(' ')

  const currentDaYunStr = chart.currentDaYun
    ? `${chart.currentDaYun.gan}${chart.currentDaYun.zhi}（${chart.currentDaYun.ageRange[0]}-${chart.currentDaYun.ageRange[1]}岁）`
    : '尚未起运'

  const dayunCompact = chart.dayuns
    .map(d => `${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]}岁)`)
    .join('、')

  return `请为以下子平八字命盘做白话精批解读：
${name ? `命主称呼：${name}` : ''}
【四柱】${pillarLine}
【日主】${chart.riZhu}（${chart.riZhuStrength}）
【格局】${chart.geju}
【喜用】${chart.xiyong} | 【忌神】${chart.jishen}
【五行力量】${wuxingLine}
【起运】${chart.qiyunAge}岁起运，当前大运：${currentDaYunStr}
【大运序列】${dayunCompact}

请按 system prompt 中规定的 7 段结构输出。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    chart: ZipingBaziChart
    name?: string
    locale?: string
  }>(event)

  if (!body?.chart) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chart' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.chart, body.name || '', locale)

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
