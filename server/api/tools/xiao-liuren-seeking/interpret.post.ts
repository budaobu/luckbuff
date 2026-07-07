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

## 约束（必须严格遵守）
1. 解读必须围绕最终落宫展开，结合失物描述、最后见到时间地点给出针对性分析。
2. 允许给出趋势判断，但禁止给出绝对化的命运预言。
3. 禁止预测具体日期、金额、姓名等可验证的确定性信息。
4. 输出风格：温和、启发性、象征性，像一面镜子帮助用户理解处境。
5. 每个段落 2~4 句话，简明扼要。
6. 按以下结构输出：

## 落宫总览 / Overview
（最终落宫的整体含义与对寻物的影响）

## 失物方位 / Direction
（基于落宫推断失物可能所在的方位或环境特征）

## 找回概率 / Probability
（判断找回的可能性高低，以及影响找回的关键因素）

## 当前状态 / Current Status
（失物当前可能处于什么状态：静止、移动、被他人拾取等）

## 寻找建议 / Advice
（基于落宫给出的可执行寻找建议，避免空泛）

## 小结 / Summary
（用一句话总结本次寻物占卜的核心启示）

【重要】输出只包含上述六个段落，不要添加总结或建议之外的额外内容。`
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

请按 落宫总览 → 失物方位 → 找回概率 → 当前状态 → 寻找建议 → 小结 的顺序输出六段解读。${langHook.user}`
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
