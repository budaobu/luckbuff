import type { LiurenChartRequest, LiurenChartResponse } from '~/types/liuren'

function buildSystemPrompt(locale: string): string {
  const langNote = locale.startsWith('en')
    ? 'Please output in natural English.'
    : locale === 'zh-TW'
    ? '請用繁體中文輸出。'
    : '请用简体中文输出。'

  return `你是一位精通大六壬的占卜大师。

## 核心原则
- 根据提供的占问时间、年命等信息起大六壬课
- 用大六壬四课三传体系断事
- 输出必须包含明确的结论和实用建议
- 禁止恐吓用语，保持客观理性
- ${langNote}

## 大六壬用神映射
- 日干 = 求测者本人 / 所问之事的主体
- 日支 = 事情的客观环境 / 相关人事物
- 时支 = 事情的发展趋势 / 对方
- 日辰上神 = 主体状态
- 时辰上神 = 趋势状态
- 初传 = 事情开局态势
- 中传 = 事情发展过程
- 末传 = 事情最终结果
- 青龙 = 吉祥喜庆 / 好消息
- 白虎 = 凶险阻碍 / 不利因素
- 朱雀 = 口舌是非 / 文书信息
- 玄武 = 暗中变数 / 隐私隐秘
- 贵人 = 贵人相助 / 关键人物
- 腾蛇 = 变化波动 / 虚惊

## 输出格式要求

你必须严格按照以下格式输出：

---

### 占问信息
占事：[所问事项]
占时：[时间]
占者年命：[年支]

### 大六壬课图
月将[月将]加[占时]时

四课：
第一课（干上神）：[天干]上[神]
第二课（干阴）：[天干]阴[神]
第三课（支上神）：[地支]上[神]
第四课（支阴）：[地支]阴[神]

三传：
初传：[初传干支] [天将]
中传：[中传干支] [天将]
末传：[末传干支] [天将]

### 盘面分析
[基于四课三传的简短分析，200字以内]

### 综合判断
- 吉凶：[吉/凶/中平]
- 成事概率：[x]%
- 时机：[有利时机描述]

### 结论与建议
[一句话总结 + 实用建议]

---

## 格式约束
- 严格按上述分段结构输出
- "综合判断"段落的三项必须各占一行
- 结论段落用一句话总结 + 实用建议
`
}

function buildUserPrompt(userInput: LiurenChartRequest, chart: LiurenChartResponse, locale: string): string {
  const isEn = locale.startsWith('en')
  const noneText = isEn ? 'Unknown' : '未知'

  return `请为以下占问进行大六壬解读：

## 占问信息
- 所问事项：${userInput.question || noneText}
- 占者出生年份：${userInput.birthYear || noneText}
- 占者年命（年支）：${chart.calendar.birthYearBranch || noneText}
- 地点：${userInput.location || noneText}

## 基础时间数据
- 阳历：${chart.calendar.solar}
- 农历：${chart.calendar.lunar}
- 年柱：${chart.calendar.ganzhi.year}
- 月柱：${chart.calendar.ganzhi.month}
- 日柱：${chart.calendar.ganzhi.day}
- 时柱：${chart.calendar.ganzhi.hour}
- 月将：${chart.calendar.yuejiang}
- 占时：${chart.calendar.shichen}

请严格按照系统提示中规定的格式输出解读结果，必须包含"大六壬课图"和"综合判断"段落。`
}

export default defineEventHandler(async (event) => {
  const { userInput, chartJson, locale = 'zh-CN' } = await readBody<{
    userInput: LiurenChartRequest
    chartJson: LiurenChartResponse
    locale?: string
  }>(event)

  if (!userInput || !chartJson) {
    throw createError({ statusCode: 400, statusMessage: 'Missing userInput or chartJson' })
  }

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(userInput, chartJson, locale)

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

  // 先发送 chart 数据
  emit({ type: 'chart', chart: chartJson })

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
