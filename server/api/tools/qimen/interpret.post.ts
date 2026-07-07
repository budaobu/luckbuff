import type { QimenInterpretRequest } from '~~/server/utils/qimen/types'

function buildSystemPrompt(locale: string): string {
  const langNote = locale.startsWith('en')
    ? '请用自然英文输出。'
    : locale === 'zh-TW'
    ? '请用繁体中文输出。'
    : '请用简体中文输出。'

  return `你是一位精通奇门遁甲的解盘助手。

## 核心原则
- 盘面数据已由确定性脚本计算完成，请不要重新推算，直接基于提供的 JSON 做解读
- 结论先行，总字数不超过 300 字
- 按占事类型聚焦分析：
  - 竞争博弈：看克应关系、对宫、生克
  - 决策判断：看直使门吉凶、值符落宫
  - 寻人寻物：看直使宫方位、八门落宫
  - 择时选吉：看吉门落宫、推荐替代时辰
  - 一般占问：综合判断值符值使、八门吉凶、九星旺衰
- 语气平实，不夸大吉凶
- ${langNote}

## 输出结构
1. 一句话总结（30字以内）
2. 核心判断（聚焦用户问题类型）
3. 方位/时机/行动建议（如适用）
4. 风险提醒：奇门遁甲为中国传统术数，解读仅供参考

## 格式
- 不使用 Markdown 标题，用自然段落
- 总字数 200-300 字
- 避免过于晦涩的术语
`
}

function buildUserPrompt(req: QimenInterpretRequest): string {
  const { pan, eventType, description, extra } = req

  const typeLabels: Record<string, string> = {
    competition: '竞争博弈',
    decision: '行动决策',
    seeking: '寻人寻物',
    timing: '择时选吉',
    general: '一般占问',
  }

  let extraInfo = ''
  if (extra && Object.keys(extra).length > 0) {
    extraInfo = '\n## 补充信息\n' + JSON.stringify(extra, null, 2)
  }

  return `请为以下奇门遁甲盘面进行解读：

## 占事类型
${typeLabels[eventType] || eventType}

## 描述
${description || '无'}
${extraInfo}

## 盘面数据
- 局数：${pan.yinYang === 'yang' ? '阳遁' : '阴遁'}${pan.juShu}局
- 节气：${pan.jieqi}
- 日干支：${pan.riGanzhi}
- 时干支：${pan.shiGanzhi}
- 值符宫：${pan.zhiFuGong}宫（${pan.palaces.find(p => p.gong === pan.zhiFuGong)?.direction}）
- 值使宫：${pan.zhiShiGong}宫（${pan.palaces.find(p => p.gong === pan.zhiShiGong)?.direction}）

## 九宫数据（JSON）
${JSON.stringify(pan.palaces, null, 2)}

请严格按照输出结构解读，结论先行。`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<QimenInterpretRequest>(event)

  if (!body?.pan || !body?.eventType) {
    throw createError({ statusCode: 400, statusMessage: 'Missing pan or eventType' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  const isGpt5 = (config.aiModel as string | undefined)?.startsWith('gpt-5')
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body)

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
