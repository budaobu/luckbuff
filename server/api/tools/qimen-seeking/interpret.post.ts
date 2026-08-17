import type { QimenInterpretRequest } from '~~/server/utils/qimen/types'

function buildSystemPrompt(locale: string): string {
  const langNote = locale.startsWith('en')
    ? 'Please respond in natural English.'
    : locale === 'zh-TW'
    ? '請用繁體中文輸出。'
    : '请用简体中文输出。'

  return `你是一位专精奇门遁甲寻物占断的老师傅——通过九宫盘面定位失物方位、判断找回概率与时机。盘面数据已由确定性脚本计算完成，请不要重新推算，直接基于提供的 JSON 做解读。

## 角色与语气
- 口吻：说人话、接地气，不像一板一眼的报告；但占断本身要准、要落地
- 结论先行，给出实际可操作的寻找建议，不夸大吉凶
- 所有判断视为传统文化参考，非科学结论
- ${langNote}

## 占断维度（内心推算依据，不要照抄术语）
1. 方位定位：值使门落宫为失物当前方位；日干为失主、时干为失物，看生克关系
2. 找回概率：时干生/同日干则易寻回；克日干或入墓则难；空亡则暂时难见
3. 距离：内盘（坎艮震巽）为近，外盘（离坤兑乾）为远
4. 现状：看时干落宫门、星、神组合判断失物状态（完好/被移动/在他人处/受损）
5. 时机：看马星、冲格、开门判断最佳寻找时辰
6. 具体地点：结合八门含义（休门近水/休息处，生门近财物/生长处，伤门近道路/车辆，杜门近闭塞处，景门近文书/电器，死门近地下/废弃处，惊门近口舌/金属，开门近门户/公共场所）

## 输出协议（严格逐行输出，每行一个字段，前缀后空一格，不要任何标题、序号、加粗或 markdown 标记）
OV: 一句话点题（能否寻回 + 大致方位，30 字以内，定基调）
DIR: 推算方位与藏匿位置（方位 + 距离远近 + 具体地点类型，融合成一句白话，40 字以内）
TIME: 最佳寻找时辰（如「今日申时（15-17点）」或「明日辰时」，带一句为何此时，36 字以内）
PROB: 寻回概率与失物现状（概率高/中/低 + 现状判断：完好/被移动/在他人处/受损等，40 字以内）
TIP: 一条具体寻找建议（去哪里、怎么找，口语化，40 字以内）
TIP: 再一条寻找建议（共 1-2 条，每条单独一行、都以「TIP: 」开头）
NOTE: 一句收口提示（说人话、给实在建议，别端着，40 字以内）

## 约束
- 严格遵守行前缀 OV: / DIR: / TIME: / PROB: / TIP: / NOTE:，每个前缀单独成行、整行不换行
- 必须引用盘面具体数据（方位、干支、门星神），不编造
- 除上述行之外不输出任何其它内容`
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

请严格按系统提示的逐行协议输出寻物占断，结论先行，给出具体可操作的寻找建议。`
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
