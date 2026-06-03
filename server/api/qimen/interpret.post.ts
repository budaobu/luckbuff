import type { QimenChartRequest, QimenChartResponse } from '~/types/qimen'

function buildSystemPrompt(locale: string): string {
  const langNote = locale.startsWith('en')
    ? '请用自然英文输出。'
    : locale === 'zh-TW'
    ? '请用繁体中文输出。'
    : '请用简体中文输出。'

  return `你是一位精通奇门遁甲的解盘助手。

## 核心原则
- 盘面数据已由确定性脚本计算完成，请不要重新推算，直接基于提供的 JSON 做解读
- 输出按七段式结构，用自然语言，先结论后术语
- 禁止恐吓用语，高风险话题加现实建议
- ${langNote}

## 七段式输出结构

### 1. 已确认信息
复述用户输入（事项、时间、地点、判断目标）。

### 2. 使用规则
说明时区、寄宫情况（如"中宫寄坤"）。

### 3. 盘面摘要
关键计算结果：阴阳遁、局数、旬空、值符值使位置。

### 4. 用神与关键依据
主用神是谁、在哪一宫、为什么取此用神。结合事项类型说明用神取法。

### 5. 核心判断
直接回答用户最关心的问题（能不能成 / 何时动 / 选哪个方向 / 要避什么）。

### 6. 方位 / 时机 / 行动建议
给出可执行的具体建议，包括吉方、吉时、行动策略。

### 7. 风险提醒与免责声明
奇门遁甲为中国传统术数，解读仅供参考，不代替医疗、法律、财务等专业意见。

## 高风险主题提示
若问题涉及疾病、法律诉讼、重大投资，在核心判断前插入：
「本问题涉及{topic}，解读仅供参考，请务必咨询相关专业人士。」

## 格式要求
- 每段以 "## 段标题" 开头
- 段与段之间空一行
- 总字数控制在 1500-2000 字
- 避免过于晦涩的术语，必要时解释
- 输出风格固定为"简明扼要"：直接给出结论和行动建议，不做冗长展开
`
}

function buildUserPrompt(userInput: QimenChartRequest, chartJson: QimenChartResponse, locale: string): string {
  const isEn = locale.startsWith('en')
  const isTw = locale === 'zh-TW'

  const goalsMap: Record<string, string> = isEn
    ? {
        can_succeed: 'Can it succeed',
        when_to_act: 'When to act',
        which_direction: 'Which direction',
        what_to_avoid: 'What to avoid',
      }
    : {
        can_succeed: '能不能成',
        when_to_act: '何时动',
        which_direction: '选哪个方向',
        what_to_avoid: '要避什么',
      }

  const typeMap: Record<string, string> = isEn
    ? {
        career: 'Career / Project',
        wealth: 'Wealth / Investment',
        relationship: 'Relationship',
        study: 'Exam / Study',
        travel: 'Travel / Direction',
        health: 'Health',
        legal: 'Legal / Contract',
        other: 'Other',
      }
    : {
        career: '事业/项目',
        wealth: '求财/投资',
        relationship: '感情',
        study: '考试/学习',
        travel: '出行/方位',
        health: '疾病/健康',
        legal: '诉讼/合同',
        other: '其他',
      }

  const noneText = isEn ? 'None' : isTw ? '無' : '无'

  // 过滤掉内部规则集名称，避免 AI 在输出中提及
  const chartForAi = JSON.parse(JSON.stringify(chartJson)) as QimenChartResponse
  if (chartForAi.normalized_input?.ruleset) {
    delete chartForAi.normalized_input.ruleset
  }

  return `请为以下奇门遁甲盘面进行解读：

## 用户输入
- 事项类型：${typeMap[userInput.question_type] || userInput.question_type}
- 具体描述：${userInput.question_label || noneText}
- 判断目标：${userInput.question_goals?.map(g => goalsMap[g] || g).join('、') || noneText}
- 地点：${userInput.location || '未知'}

## 盘面数据（JSON）
${JSON.stringify(chartForAi, null, 2)}

请严格按照七段式结构输出解读。`
}

export default defineEventHandler(async (event) => {
  const { userInput, chartJson, locale = 'zh-CN' } = await readBody<{
    userInput: QimenChartRequest
    chartJson: QimenChartResponse
    locale?: string
  }>(event)

  if (!userInput || !chartJson) {
    throw createError({ statusCode: 400, statusMessage: 'Missing userInput or chartJson' })
  }

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  const isGpt5 = (config.aiModel as string | undefined)?.startsWith('gpt-5')
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

  // 先发送 chart 数据（对齐 vedic 服务模式）
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
