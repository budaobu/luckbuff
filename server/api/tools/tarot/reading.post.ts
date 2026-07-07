interface TarotCard {
  position: string
  card: string
  orientation: string
  is_major: boolean
  element: string
}

interface TarotDrawResult {
  seed: number
  spread: string
  spread_name: string
  question: string
  gender: string
  time_factor: string
  cards: TarotCard[]
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

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位专业塔罗牌解读师。你根据抽到的牌面做象征性解读，帮助用户理解当下的能量状态与可选择的行动方向。
${langHook.system}

## 约束（必须严格遵守）

1. 塔罗是镜子，不是水晶球：把牌面转成自我观察和可选择的下一步，不宣判固定命运
2. 主权归用户：不用"你一定会"；结尾提醒"牌显示的是当下能量，你的选择随时可以改变走向"
3. 反巴纳姆：建议必须具体到时间/动作，避免"注意沟通、保持平衡、相信直觉、一切都会好"等空泛建议
4. 不做医疗、法律、投资买卖、重大人生决定的建议
5. 输出风格：温暖但清醒，每个段落 2~3 句话，简明扼要
6. emoji 适量使用
7. 按以下结构输出：

## 整体能量概览
（描述牌阵整体的能量氛围与主题倾向）

## 牌阵展示
（列出每张牌的位置、牌名、正逆位）

## 逐牌解读
（每张牌的关键词、透镜解读、深层讯息）

## 牌间关系分析
（花色/元素分布、大阿卡纳比例、相邻牌的关系标注）

## 综合解读
按"起点 -> 张力 -> 转折 -> 出口 -> 回响"叙述
出口必须是本周可执行的具体动作

## 能量总结
3-4 字能量总结词

## 开放式问题
把主权交还用户的开放式问题

【重要】输出只包含上述段落，不要添加总结或建议。`
}

function buildUserPrompt(result: TarotDrawResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

  const genderText = result.gender
    ? (result.gender === 'male' ? '男' : '女')
    : '未指定'

  const spreadInfo = `牌阵：${result.spread_name}\n问题：${result.question || '（无具体问题）'}\n性别：${genderText}\nseed：${result.seed}\ntime_factor：${result.time_factor}`

  const cardsInfo = result.cards.map((c: TarotCard, i: number) => {
    return `\n【位置 ${i + 1}】${c.position}\n- 牌名：${c.card}\n- 正逆位：${c.orientation}\n- ${c.is_major ? '大阿卡纳' : '小阿卡纳'} · ${c.element}元素`
  }).join('')

  // Element distribution
  const elements: Record<string, number> = {}
  for (const c of result.cards) {
    elements[c.element] = (elements[c.element] || 0) + 1
  }
  const elementDist = Object.entries(elements)
    .map(([e, n]) => `${e}:${n}`)
    .join(' ')

  const majorCount = result.cards.filter((c: TarotCard) => c.is_major).length
  const majorRatio = Math.round((majorCount / result.cards.length) * 100)

  return `请为以下塔罗牌阵做深度解读：

${spreadInfo}

${cardsInfo}

【牌阵统计】
- 元素分布：${elementDist}
- 大阿卡纳比例：${majorRatio}%

请按 整体能量概览 → 牌阵展示 → 逐牌解读 → 牌间关系分析 → 综合解读 → 能量总结 → 开放式问题 的顺序输出。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: TarotDrawResult
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
  const userPrompt = buildUserPrompt(body.result, locale)

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
