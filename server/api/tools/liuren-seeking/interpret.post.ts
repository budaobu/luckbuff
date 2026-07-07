import type { LiurenChartRequest, LiurenChartResponse } from '~/types/liuren'

function buildSystemPrompt(locale: string): string {
  const langNote = locale.startsWith('en')
    ? 'Please output in natural English.'
    : locale === 'zh-TW'
    ? '請用繁體中文輸出。'
    : '请用简体中文输出。'

  return `你是一位精通大六壬的占卜大师，专门擅长用大六壬四课三传体系断寻物之事。

## 核心原则
- 根据提供的占问时间、年命等信息起大六壬课
- 用大六壬四课三传体系专门断寻物
- 输出必须包含明确的结论和实用建议
- 禁止恐吓用语，保持客观理性
- ${langNote}

## 大六壬寻物用神映射
- 日干 = 失主（求测者本人）
- 日支 = 失物
- 时支 = 事情的发展趋势
- 日辰上神 = 失主当前状态
- 时辰上神 = 失物当前状态与去向
- 初传 = 失物丢失的初始原因/情境
- 中传 = 失物中间流转过程
- 末传 = 最终能否找回的结果
- 青龙 = 吉祥喜庆 / 失物在光明处
- 白虎 = 凶险阻碍 / 失物破损或难寻
- 朱雀 = 口舌是非 / 有人议论失物
- 玄武 = 暗中变数 / 失物被隐藏/偷窃
- 贵人 = 贵人相助 / 有人帮忙找回
- 腾蛇 = 变化波动 / 失物位置多变

## 寻物关键判断维度
1. **失物方位**：根据日支上神、三传所临地支判断失物所在方位
2. **找回概率**：看用神旺衰、生克关系、空亡墓绝状态
3. **寻找时机**：根据三传应期判断最佳寻找时间
4. **失物状态**：是否完好、是否被人取走、是否在原地
5. **具体位置**：结合八卦类象和天将判断具体环境特征

## 输出格式要求

你必须严格按照以下格式输出：

---

### 占问信息
占事：寻物
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

### 寻物分析
[基于四课三传的寻物专项分析，包括方位、概率、时机等，300字以内]

### 综合判断
- 失物方位：[具体方位]
- 找回概率：[高/中/低]，约[x]%
- 应期：[大致时间范围]
- 失物状态：[完好/破损/已被取走等]

### 结论与建议
[一句话总结 + 具体的寻找建议]

---

## 格式约束
- 严格按上述分段结构输出
- "综合判断"段落的四项必须各占一行
- 结论段落用一句话总结 + 实用建议
- 如果用户提供了失物描述，在分析中必须结合失物特征给出针对性判断
`
}

function buildUserPrompt(userInput: LiurenChartRequest & { seekingContext?: Record<string, string> }, chart: LiurenChartResponse, locale: string): string {
  const isEn = locale.startsWith('en')
  const noneText = isEn ? 'Unknown' : '未知'
  const sc = userInput.seekingContext || {}

  return `请为以下寻物占问进行大六壬解读：

## 占问信息
- 所问事项：寻物
- 占者出生年份：${userInput.birthYear || noneText}
- 占者年命（年支）：${chart.calendar.birthYearBranch || noneText}
- 地点：${userInput.location || noneText}

## 寻物上下文
- 具体描述：${sc.description || noneText}
- 最后见到时间：${sc.lastSeenTime || noneText}
- 最后见到地点：${sc.lastSeenPlace || noneText}
- 失物描述：${sc.lostItemDesc || noneText}
- 与失物关系：${sc.relationship || noneText}

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
    userInput: LiurenChartRequest & { seekingContext?: Record<string, string> }
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
