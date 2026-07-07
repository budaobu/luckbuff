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
  return `你是一位精通八字命理的财富分析大师。你的任务是根据用户的八字命盘，深入分析其财富格局、财运走势与最佳求财方向。
${langHook.system}

## 分析框架（必须严格按以下结构输出，使用 markdown ## 标题）

## 财富格局总论
（30-50字概括整体财富格局，如"身旺财旺，食伤生财，一生财运亨通"等）

## 日主与财星关系
（分析日主强弱、财星在命盘中的位置与旺衰，判断命主与财富的基本关系）

## 正财与偏财分析
（正财代表稳定收入、工资薪酬；偏财代表投资收益、意外之财。分别分析两者的强弱与获取方式）

## 财富等级评估
（根据命盘结构，给出财富水平的定性量级判断。必须用以下等级体系给出明确判断，并附命理依据：
- 温饱线：一生温饱无忧，积蓄有限
- 小康级：房产/存款可达数十万~百万量级
- 中产级：房产/资产可达数百万~千万量级
- 富裕级：资产可达数千万~过亿量级
- 巨富级：资产过亿，具备阶层跨越潜力
注意：不给出精确数字，但必须有明确的量级范围判断）

## 大运财运走势
（分析当前大运及未来几步大运的财运变化趋势，指出哪些年龄段财运较旺、哪些需要保守）

## 最佳求财方向
（根据五行喜忌，给出有利的求财行业、方位、合作伙伴类型等建议）

## 财富建议
（3-5条具体、实用的财富建议，语气积极温暖）

## 约束（必须严格遵守）

1. 分析基于八字命理理论，但要用现代白话语言解读
2. 不给出精确金额（如"能赚100万"），但必须给出定性的财富量级范围（如"中产级，数百万~千万量级"）
3. 禁止预测具体时间点（如"2026年8月发财"），只说年龄段或大运阶段
4. 语气积极温暖，避免恐吓性语言
5. 每条分析要有命理依据，不能空泛
6. 输出只包含上述六个段落，不要添加总结或免责声明
7. ${langHook.user}`
}

function buildUserPrompt(chart: BaziChart, locale: string, name?: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

  const currentDaYunStr = chart.currentDaYun
    ? `${chart.currentDaYun.gan}${chart.currentDaYun.zhi}（${chart.currentDaYun.ageRange[0]}-${chart.currentDaYun.ageRange[1]}岁）`
    : '尚未起运'

  const dayunCompact = chart.dayuns.map(d => `${d.index}.${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]})`).join(', ')

  const userPrefix = name ? `姓名：${name}\n` : ''

  return `${userPrefix}八字命盘：年${chart.year.gan}${chart.year.zhi} 月${chart.month.gan}${chart.month.zhi} 日${chart.day.gan}${chart.day.zhi} 时${chart.hour ? chart.hour.gan + chart.hour.zhi : '未知'}
日主${chart.riZhu}（${chart.riZhuStrength}）| 格局${chart.geju} | 喜用${chart.xiyong} | 忌${chart.jishen}
五行：木${chart.wuxingScore['木']}% 火${chart.wuxingScore['火']}% 土${chart.wuxingScore['土']}% 金${chart.wuxingScore['金']}% 水${chart.wuxingScore['水']}%
当前大运：${currentDaYunStr}
大运：${dayunCompact}
起运年龄：${chart.qiyunAge}岁
当前年龄：${chart.currentAge}岁

请按 财富格局总论 → 日主与财星关系 → 正财与偏财分析 → 财富等级评估 → 大运财运走势 → 最佳求财方向 → 财富建议 的顺序输出七段分析。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    chart: BaziChart
    locale?: string
    name?: string
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
  const userPrompt = buildUserPrompt(body.chart, locale, body.name)

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
