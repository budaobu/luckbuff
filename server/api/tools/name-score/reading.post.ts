import type { BaziChart } from '~/types/bazi'
import type { DiZhi } from '~/types/user'

interface ReadingInput {
  name: string
  gender: 'male' | 'female'
  birthDate?: string
  birthHour?: DiZhi
  chart?: BaziChart | null
  locale?: string
}

const LANGUAGE_HOOKS: Record<string, { system: string; scoreFormat: string }> = {
  'zh-CN': {
    system: '请使用简体中文输出。',
    scoreFormat: '综合评分：{score} 分，吉凶：{fortune}',
  },
  'zh-TW': {
    system: '請使用繁體中文輸出。',
    scoreFormat: '綜合評分：{score} 分，吉凶：{fortune}',
  },
  en: {
    system: 'Please output all content in English.',
    scoreFormat: 'Overall Score: {score}/100, Fortune: {fortune}',
  },
}

function buildSystemPrompt(locale: string): string {
  const hook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  return `你是一位姓名学测试打分专家。请根据用户提供的姓名、性别以及可选的生辰八字，从传统文化与五行象征角度进行姓名测试打分。
${hook.system}

## 输出结构（必须严格按以下章节输出，使用 ## 标题）

## 综合评分
给出 0-100 分的综合评分，并给出“吉/凶/中平”的总体判断。格式参考：${hook.scoreFormat}

## 名字五行分析
分析姓名中每个字的五行属性（木、火、土、金、水），说明整体五行气场，以及是否存在某种五行偏旺或偏弱。

## 八字五行匹配度
如果提供了生辰八字：结合八字四柱与五行力量分布，判断名字五行对八字命局的补益或克制关系，指出八字可能缺失或需要补强的五行元素，并给出匹配度评价（如“高度契合/部分契合/需要调和”）。
如果没有提供生辰八字：说明仅凭姓名进行五行分析，建议提供生辰以获得更精准的匹配解读。

## 用字建议与总评
给出用字音、形、义及五行搭配方面的参考建议，并以一段温和、启发性的总评作结。

## 约束（必须遵守）
1. 只进行姓名五行与八字五行的象征性匹配分析，不做超出姓名与八字本身的预测。
2. 禁止预测具体流年、大运、时机、吉凶日期。
3. 禁止给出“今年适合改名”“某月有变动”等时间性建议。
4. 输出风格：温和、启发性、象征性，像一面镜子帮助用户理解自己的名字。
5. 每个段落 2~4 句话，简明扼要，避免冗长。
6. 只输出上述四个章节，不要添加额外总结。`
}

function formatPillar(chart: BaziChart, key: 'year' | 'month' | 'day'): string {
  const p = chart[key]
  return `${p.gan}${p.zhi}`
}

function formatHourPillar(chart: BaziChart): string {
  return chart.hour ? `${chart.hour.gan}${chart.hour.zhi}` : '（未知）'
}

function buildUserPrompt(input: ReadingInput, locale: string): string {
  const hook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const genderText = input.gender === 'male' ? '男' : '女'

  let baziSection = ''
  if (input.chart) {
    const c = input.chart
    baziSection = `
【生辰八字】
四柱：${formatPillar(c, 'year')} 年 / ${formatPillar(c, 'month')} 月 / ${formatPillar(c, 'day')} 日 / ${formatHourPillar(c)} 时
日主：${c.riZhu}（${c.riZhuStrength}）
格局：${c.geju}
喜用五行：${c.xiyong}
忌神五行：${c.jishen}
五行力量：木 ${c.wuxingScore.木}% / 火 ${c.wuxingScore.火}% / 土 ${c.wuxingScore.土}% / 金 ${c.wuxingScore.金}% / 水 ${c.wuxingScore.水}%
`
  } else {
    baziSection = `
【生辰八字】
用户未提供出生日期，仅基于姓名进行五行分析。
`
  }

  return `请为以下信息进行姓名测试打分：

【姓名】${input.name}
【性别】${genderText}
${input.birthDate ? `【出生日期】${input.birthDate}` : ''}
${input.birthHour ? `【出生时辰】${input.birthHour}时` : ''}
${baziSection}

请按“综合评分 → 名字五行分析 → 八字五行匹配度 → 用字建议与总评”的顺序输出四段分析。${hook.system}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ReadingInput>(event)

  if (!body?.name || typeof body.name !== 'string' || body.name.trim().length < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid name' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body, locale)

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
