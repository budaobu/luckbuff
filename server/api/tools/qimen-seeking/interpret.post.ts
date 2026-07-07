import type { QimenInterpretRequest } from '~~/server/utils/qimen/types'

function buildSystemPrompt(locale: string): string {
  const langNote = locale.startsWith('en')
    ? 'Please respond in natural English.'
    : locale === 'zh-TW'
    ? '請用繁體中文輸出。'
    : '请用简体中文输出。'

  return `你是一位精通奇门遁甲寻物占断的解盘助手，专精于通过奇门遁甲九宫盘面定位失物方位、判断找回概率与时机。

## 核心原则
- 盘面数据已由确定性脚本计算完成，请不要重新推算，直接基于提供的 JSON 做解读
- 结论先行，总字数不超过 400 字
- 寻物占断聚焦以下维度：
  1. **方位定位**：值使门落宫为失物当前所在方位；日干落宫为失主，时干落宫为失物；看两者生克关系
  2. **找回概率**：时干生日干或同宫则易找回；时干克日干或入墓则难找回；空亡则暂时难见
  3. **距离判断**：近看本宫，远看对宫；内盘（坎艮震巽）为近，外盘（离坤兑乾）为远
  4. **状态判断**：看时干落宫的门、星、神组合判断失物当前状态（完好/受损/已转移）
  5. **找回时机**：看马星、冲格、开门等判断最佳寻找时间窗口
  6. **具体位置**：结合八门含义推断（休门近水/休息处，生门近财物/生长处，伤门近道路/车辆，杜门近闭塞处，景门近文书/电器，死门近地下/废弃处，惊门近口舌/金属，开门近门户/公共场所）
- 语气平实，不夸大吉凶，给出实际可操作的寻找建议
- ${langNote}

## 输出结构
1. **一句话总结**（30字以内）：能否找回 + 大致方位
2. **方位定位**：失物当前所在方位与距离
3. **找回概率**：高/中/低 + 判断依据
4. **状态分析**：失物当前状态（完好/受损/被转移）
5. **寻找建议**：最佳寻找时间 + 具体地点类型 + 行动方向
6. **风险提醒**：奇门遁甲为中国传统术数，解读仅供参考

## 格式
- 不使用 Markdown 标题，用自然段落
- 总字数 250-400 字
- 避免过于晦涩的术语，用白话解释
- 给出具体可操作的寻找建议，不要泛泛而谈
`
}

function buildUserPrompt(req: QimenInterpretRequest): string {
  const { pan, description, extra } = req

  let extraInfo = ''
  if (extra && Object.keys(extra).length > 0) {
    extraInfo = '\n## 补充信息\n' + JSON.stringify(extra, null, 2)
  }

  return `请为以下奇门遁甲寻物盘面进行解读：

## 占事类型
寻人寻物

## 描述
${description || '无'}
${extraInfo}

## 盘面数据
- 局数：${pan.yinYang === 'yang' ? '阳遁' : '阴遁'}${pan.juShu}局
- 节气：${pan.jieqi}
- 日干支：${pan.riGanzhi}（日干为失主）
- 时干支：${pan.shiGanzhi}（时干为失物）
- 值符宫：${pan.zhiFuGong}宫（${pan.palaces.find(p => p.gong === pan.zhiFuGong)?.direction}）
- 值使宫：${pan.zhiShiGong}宫（${pan.palaces.find(p => p.gong === pan.zhiShiGong)?.direction}）

## 九宫数据（JSON）
${JSON.stringify(pan.palaces, null, 2)}

请严格按照输出结构解读，结论先行，给出具体可操作的寻物建议。`
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
