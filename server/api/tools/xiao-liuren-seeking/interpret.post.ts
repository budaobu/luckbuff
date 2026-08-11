import type { XiaoLiurenResult } from '~/types/xiao-liuren'

interface SeekingContext {
  lostItemDesc?: string
  lastSeenTime?: string
  lastSeenPlace?: string
  relationship?: string
  description?: string
}

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

function formatPosition(name: string): string {
  const map: Record<string, string> = {
    大安: '大安（吉，主安稳、静止）',
    留连: '留连（滞，主拖延、反复）',
    速喜: '速喜（喜，主快速、喜讯）',
    赤口: '赤口（凶，主口舌、惊险）',
    小吉: '小吉（小吉，主小利、和合）',
    空亡: '空亡（空，主虚无、落空）',
  }
  return map[name] || name
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位小六壬寻物占卜解读师。你根据掐指一算所得的落宫位置、起卦方式与失物信息，给出结构化、温和的寻物解读。
${langHook.system}

## 小六壬六宫基础知识
- 大安：吉，主安稳、静止、顺遂。寻物：物品在固定处，易找回。
- 留连：滞，主拖延、反复、纠缠。寻物：物品被拖延或反复移动，需耐心寻找。
- 速喜：喜，主快速、喜讯、短期见效。寻物：近期有好消息，快速找回。
- 赤口：凶，主口舌、官非、惊险。寻物：物品可能因争执或冲突而丢失，需谨慎处理。
- 小吉：小吉，主小利、和合、平顺。寻物：有小希望，需努力寻找。
- 空亡：空，主虚无、落空、不利。寻物：物品可能难以找回，或已遗失。

## 角色与语气
- 卦师口吻：老练温和、带点善意提点，别端着、别写成一板一眼的报告
- 结论先行，给出实际可操作的寻找建议，不夸大吉凶
- 用户大概率带着丢东西的焦虑来测，语气要稳、要让人安心，别调侃、别写段子，更别拿失物开玩笑
- 所有判断视为传统文化参考，非科学结论

## 输出协议（严格逐行输出，每行一个字段，前缀后空一格，不要任何标题、序号、加粗或 markdown 标记）
OV: 一句话点题（能否寻回 + 大致方位，30 字以内，定基调，先给人吃个定心丸）
DIR: 推算方位与藏匿位置（方位 + 距离远近 + 具体地点类型，融合成一句白话，40 字以内）
TIME: 最佳寻找时辰（如「今日申时（15-17点）」或「明日辰时」，带一句为何此时，36 字以内）
PROB: 寻回概率与失物现状（概率高/中/低 + 现状判断：完好/被移动/在他人处/受损等，40 字以内）
TIP: 一条具体寻找建议（去哪里、怎么找，口语化，40 字以内）
TIP: 再一条寻找建议（共 1-2 条，每条单独一行、都以「TIP: 」开头）
NOTE: 一句小六壬卦师的收口提示（温和点拨、安抚人心，收着用，绝不调侃失物或失主，40 字以内）

## 约束
- 严格遵守行前缀 OV: / DIR: / TIME: / PROB: / TIP: / NOTE:，每个前缀单独成行、整行不换行
- 解读必须围绕最终落宫展开，结合失物描述、最后见到时间地点给出针对性分析，不编造
- 允许给出趋势判断，但禁止给出绝对化的命运预言，禁止预测具体日期、金额、姓名等可验证的确定性信息
- 除上述行之外不输出任何其它内容`
}

function buildUserPrompt(result: XiaoLiurenResult, context: SeekingContext, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const pos = result.finalPosition

  let methodText = ''
  if (result.method === 'time' && result.timeContext) {
    methodText = `时间起卦：阳历 ${result.timeContext.solarDate}，农历 ${result.timeContext.lunarDate}，${result.timeContext.hourBranch}时`
  } else if (result.method === 'number' && result.numberContext) {
    methodText = `数字起卦：${result.numberContext.numbers.join('、')}`
  } else if (result.method === 'character' && result.characterContext) {
    methodText = `汉字起卦：「${result.characterContext.text}」（${result.characterContext.strokeHint}）`
  }

  const names = ['大安', '留连', '速喜', '赤口', '小吉', '空亡']
  const stepsText = result.steps
    .map(s => `- ${s.label}：${s.value} → ${names[((s.positionIndex % 6) + 6) % 6]}`)
    .join('\n')

  const seekingLines: string[] = []
  if (context.lostItemDesc) seekingLines.push(`- 失物描述：${context.lostItemDesc}`)
  if (context.lastSeenTime) seekingLines.push(`- 最后见到时间：${context.lastSeenTime}`)
  if (context.lastSeenPlace) seekingLines.push(`- 最后见到地点：${context.lastSeenPlace}`)
  if (context.relationship) seekingLines.push(`- 与失物关系：${context.relationship}`)
  if (context.description) seekingLines.push(`- 补充描述：${context.description}`)

  return `请为以下小六壬寻物占卜结果做解读：

【寻物信息】
${seekingLines.length > 0 ? seekingLines.join('\n') : '（未填写详细信息）'}

【起卦方式】
${methodText}

【落宫过程】
${stepsText}

【最终落宫】
${formatPosition(pos.name)}
- 手指宫位：${pos.finger}
- 核心含义：${pos.meaning}
- 传统口诀：${pos.summary}

请严格按系统提示的逐行协议输出寻物解读，结论先行，语气稳住，给出具体可操作的寻找建议。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: XiaoLiurenResult
    seekingContext?: SeekingContext
    locale?: string
  }>(event)

  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.result, body.seekingContext || {}, locale)

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
