import type { BaziChart } from '~/types/bazi'

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
  return `你是一位精通八字命理的合婚分析大师。你的任务是根据两个人的八字命盘，深入分析他们的姻缘匹配度、性格互补性、感情发展趋势与婚姻建议。
${langHook.system}

## 分析框架（必须严格按以下结构输出，使用 markdown ## 标题）

## 合盘总论
（30-50字概括两人八字合婚的整体结论，如"两人日柱相合，五行互补，婚姻基础稳固"等）

## 日柱配对分析
（分析两人日柱天干地支的关系：天干五合、地支六合/三合/冲/刑/害等，判断核心缘分的深浅与稳定性）

## 五行互补性
（对比两人命盘的五行分布，分析是否存在互补关系。如一方火旺缺木，另一方木旺，则形成互补）

## 十神关系
（从十神角度分析两人在感情中的角色定位：谁更主动、谁更包容、谁主导经济、谁主导家庭等）

## 性格匹配度
（基于两人日主强弱、格局、喜用神，分析性格上的契合点与可能的摩擦点）

## 大运同步性
（分析两人当前及未来大运的走势是否同步、是否相互助力，判断婚姻的长期稳定性）

## 合婚建议
（3-5条具体、实用的感情/婚姻建议，语气积极温暖，兼顾命理与现实）

## 约束（必须严格遵守）

1. 分析基于八字命理理论，但要用现代白话语言解读
2. 不给出绝对化的"能成"或"不能成"判断，而是分析匹配度的高低与关键因素
3. 禁止预测具体时间点（如"2026年8月结婚"），只说大运阶段或年龄段的趋势
4. 语气积极温暖，避免恐吓性语言；即使有相冲也要给出化解建议
5. 每条分析要有命理依据，不能空泛
6. 输出只包含上述七个段落，不要添加总结或免责声明
7. ${langHook.user}`
}

function buildUserPrompt(
  chartA: BaziChart,
  chartB: BaziChart,
  locale: string,
  nameA?: string,
  nameB?: string,
): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

  const currentDaYunStrA = chartA.currentDaYun
    ? `${chartA.currentDaYun.gan}${chartA.currentDaYun.zhi}（${chartA.currentDaYun.ageRange[0]}-${chartA.currentDaYun.ageRange[1]}岁）`
    : '尚未起运'

  const currentDaYunStrB = chartB.currentDaYun
    ? `${chartB.currentDaYun.gan}${chartB.currentDaYun.zhi}（${chartB.currentDaYun.ageRange[0]}-${chartB.currentDaYun.ageRange[1]}岁）`
    : '尚未起运'

  const dayunCompactA = chartA.dayuns.map(d => `${d.index}.${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]})`).join(', ')
  const dayunCompactB = chartB.dayuns.map(d => `${d.index}.${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]})`).join(', ')

  const prefixA = nameA ? `【甲方】${nameA}` : '【甲方】'
  const prefixB = nameB ? `【乙方】${nameB}` : '【乙方】'

  return `${prefixA}
八字：年${chartA.year.gan}${chartA.year.zhi} 月${chartA.month.gan}${chartA.month.zhi} 日${chartA.day.gan}${chartA.day.zhi} 时${chartA.hour ? chartA.hour.gan + chartA.hour.zhi : '未知'}
日主${chartA.riZhu}（${chartA.riZhuStrength}）| 格局${chartA.geju} | 喜用${chartA.xiyong} | 忌${chartA.jishen}
五行：木${chartA.wuxingScore['木']}% 火${chartA.wuxingScore['火']}% 土${chartA.wuxingScore['土']}% 金${chartA.wuxingScore['金']}% 水${chartA.wuxingScore['水']}%
当前大运：${currentDaYunStrA}
大运：${dayunCompactA}
起运年龄：${chartA.qiyunAge}岁 | 当前年龄：${chartA.currentAge}岁

${prefixB}
八字：年${chartB.year.gan}${chartB.year.zhi} 月${chartB.month.gan}${chartB.month.zhi} 日${chartB.day.gan}${chartB.day.zhi} 时${chartB.hour ? chartB.hour.gan + chartB.hour.zhi : '未知'}
日主${chartB.riZhu}（${chartB.riZhuStrength}）| 格局${chartB.geju} | 喜用${chartB.xiyong} | 忌${chartB.jishen}
五行：木${chartB.wuxingScore['木']}% 火${chartB.wuxingScore['火']}% 土${chartB.wuxingScore['土']}% 金${chartB.wuxingScore['金']}% 水${chartB.wuxingScore['水']}%
当前大运：${currentDaYunStrB}
大运：${dayunCompactB}
起运年龄：${chartB.qiyunAge}岁 | 当前年龄：${chartB.currentAge}岁

请按 合盘总论 → 日柱配对分析 → 五行互补性 → 十神关系 → 性格匹配度 → 大运同步性 → 合婚建议 的顺序输出七段分析。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    chartA: BaziChart
    chartB: BaziChart
    locale?: string
    nameA?: string
    nameB?: string
  }>(event)

  if (!body?.chartA || !body?.chartB) {
    throw createError({ statusCode: 400, statusMessage: 'Missing charts' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.chartA, body.chartB, locale, body.nameA, body.nameB)

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
