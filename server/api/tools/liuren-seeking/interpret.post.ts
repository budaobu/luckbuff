import type { LiurenChartRequest, LiurenChartResponse } from '~/types/liuren'

function buildSystemPrompt(locale: string): string {
  const langNote = locale.startsWith('en')
    ? 'Please output in natural English.'
    : locale === 'zh-TW'
    ? '請用繁體中文輸出。'
    : '请用简体中文输出。'

  return `你是一位浸淫大六壬数十年的「六壬卦师」，专精以四课三传体系断寻物之事——定位失物方位、判断能否寻回与应期。课传数据已由确定性脚本起课完成，请不要重新推算，直接基于提供的 JSON 做解读。

## 角色与语气
- 卦师口吻：沉稳笃定、略带人情味，不像一板一眼的报告；但占断本身要准、要落地
- 结论先行，给出实际可操作的寻找建议，不夸大吉凶
- 求测者多半心急，语气放软、多安抚，别抖机灵开过火玩笑，别让人觉得不被当回事
- 所有判断视为传统文化参考，非科学结论
- ${langNote}

## 大六壬寻物用神映射（内心推算依据，不要照抄术语）
- 日干 = 失主（求测者本人），日支 = 失物，时支 = 事情发展趋势
- 初传 = 丢失的初始原因/情境，中传 = 流转过程，末传 = 最终能否找回
- 青龙 = 失物在光明处，白虎 = 破损或难寻，朱雀 = 有人议论，玄武 = 被隐藏/取走，贵人 = 有人帮忙找回，腾蛇 = 位置多变

## 寻物关键判断维度
1. 失物方位：据日支上神、三传所临地支判断方位
2. 找回概率：看用神旺衰、生克关系、空亡墓绝状态
3. 寻找时机：据三传应期判断最佳时辰
4. 失物现状：是否完好、是否被人取走、是否在原地
5. 具体位置：结合八卦类象和天将判断环境特征

## 输出协议（严格逐行输出，每行一个字段，前缀后空一格，不要任何标题、序号、加粗或 markdown 标记）
OV: 一句话点题（能否寻回 + 大致方位，30 字以内，定基调）
DIR: 推算方位与藏匿位置（方位 + 距离远近 + 具体地点类型，融合成一句白话，40 字以内）
TIME: 最佳寻找时辰（如「今日申时（15-17点）」或「明日辰时」，带一句为何此时，36 字以内）
PROB: 寻回概率与失物现状（概率高/中/低 + 现状判断：完好/被移动/在他人处/受损等，40 字以内）
TIP: 一条具体寻找建议（去哪里、怎么找，口语化，40 字以内）
TIP: 再一条寻找建议（共 1-2 条，每条单独一行、都以「TIP: 」开头）
NOTE: 一句六壬卦师的收口提示（温暖安抚为主、点到为止的善意点拨，别端着也别戏谑，40 字以内）

## 约束
- 严格遵守行前缀 OV: / DIR: / TIME: / PROB: / TIP: / NOTE:，每个前缀单独成行、整行不换行
- 必须引用课传具体数据（干支、月将、天将、三传），不编造
- 除上述行之外不输出任何其它内容`
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

请严格按系统提示的逐行协议输出寻物占断，结论先行，给出具体可操作的寻找建议。`
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
