import type { QizhengSiyuChart } from '~/types/qizheng-siyu'

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
  return `你是一位七政四余命理顾问。你根据用户的本命七政四余星盘，给出性格、潜能、人生主题与注意事项层面的解读。
${langHook.system}

## 约束（必须严格遵守）

1. 只基于星盘结构（七政落宫、星座、四余分布、主要相位）进行解读，不做未来具体事件预测。
2. 禁止预测某年某月会发财、结婚、升职、生病等具体事件。
3. 禁止使用「必发」「一定」「绝对」「大凶」「大吉」等绝对化词汇。
4. 输出包含三个部分，以 ## 开头：
   ## 命宫与气质底色
   ## 七政主题与四余暗线
   ## 自我调适与方向建议
5. 「命宫与气质底色」：从上升星座、命主星（七政中守护上升星座的星体）落宫落座，概括整体气质与外在呈现。
6. 「七政主题与四余暗线」：分别简述日、月、水、金、火、木、土在星座与宫位的主题；罗睺、计都、月孛、紫炁所在宫位与星座的暗线。
7. 「自我调适与方向建议」：给出 3~5 条可落地的建议，包括能量疏导、人际关系、决策风格、职业倾向等。禁止空泛鸡汤。
8. 如果计算结果包含 methodNote 说明时间不确定或服务降级，请在你的建议中再次温和提醒用户仅供参考，不构成决策依据。
9. 不要添加总结段落之外的免责声明或多余内容。`
}

function buildUserPrompt(chart: QizhengSiyuChart, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

  const asc = chart.angles.find(a => a.name === 'Ascendant')
  const mc = chart.angles.find(a => a.name === 'Midheaven')

  const planets = chart.planets.map(p =>
    `${p.name}（${p.nameEn}）${p.signNameZh} ${p.degreeInSign.toFixed(1)}° · ${p.house}宫${p.isRetrograde ? ' · 逆行' : ''}`
  ).join('\n')

  const remainders = chart.remainders.map(r =>
    `${r.name}（${r.nameEn}）${r.signNameZh} ${r.degreeInSign.toFixed(1)}° · ${r.house}宫`
  ).join('\n')

  const aspects = chart.aspects.length
    ? chart.aspects.map(a => `${a.body1Name}-${a.body2Name}：${a.aspectName} ${a.orb}°`).join('、')
    : '无明显主要相位'

  return `请根据以下七政四余星盘结果生成解读：

【计算口径】
${chart.methodNote}

【四角】
上升 ${asc?.signNameZh} ${asc?.degreeInSign.toFixed(1)}° · 天顶 ${mc?.signNameZh} ${mc?.degreeInSign.toFixed(1)}°
出生地：${chart.baseCityName} · 本地经度偏移：${chart.localOffsetHours} 小时

【七政】
${planets}

【四余】
${remainders}

【主要相位】
${aspects}

请严格按以下结构输出三个部分：
## 命宫与气质底色
## 七政主题与四余暗线
## 自我调适与方向建议

${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    chart?: QizhengSiyuChart
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
  const userPrompt = buildUserPrompt(body.chart, locale)

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
