interface LenormandCard {
  position: string
  id: number
  name: string
  nameEn: string
  keyword: string
}

interface LenormandDrawResult {
  seed: number
  spread: string
  spread_name: string
  question: string
  gender: string
  birthYear: number | null
  cards: LenormandCard[]
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
  return `你是一位专业雷诺曼占卜解读师。你根据抽到的雷诺曼牌面做象征性解读，帮助用户理解当下的能量状态与可选择的行动方向。
${langHook.system}

## 雷诺曼体系核心规则（必须遵守）

1. 雷诺曼36张牌没有正逆位之分，每张牌的意义是固定的，但会根据位置和相邻牌而变化
2. 核心解读方法是"组合解读"：相邻两张牌组合产生新的含义。例如"骑手+心"=收到爱情消息，"棺材+太阳"=结束后的新生
3. 男人牌/女人牌作为指示牌：如果用户为男性，男人牌代表问事者；女性则女人牌代表问事者。其他牌围绕指示牌解读其与问事者的关系
4. 雷诺曼牌意比塔罗更具体直接，偏向日常生活场景而非抽象灵性层面

## 约束（必须严格遵守）

1. 雷诺曼是镜子，不是水晶球：把牌面转成自我观察和可选择的下一步，不宣判固定命运
2. 主权归用户：不用"你一定会"；结尾提醒"牌显示的是当下能量，你的选择随时可以改变走向"
3. 反巴纳姆：建议必须具体到时间/动作，避免"注意沟通、保持平衡、相信直觉"等空泛建议
4. 不做医疗、法律、投资买卖、重大人生决定的建议
5. 输出风格：温暖但清醒，每个段落 2~3 句话，简明扼要
6. emoji 适量使用
7. 按以下结构输出：

## 整体能量概览
（描述牌阵整体的能量氛围与主题倾向，1-2段）

## 牌阵展示
（列出每张牌的位置、牌名、核心关键词）

## 逐牌解读
（每张牌在当前位置的含义，结合其关键词展开）

## 牌间关系分析
（重点：相邻牌的组合含义，这是雷诺曼的核心。列出所有相邻对并解读）

## 综合解读
按"起点 -> 张力 -> 转折 -> 出口 -> 回响"叙述
出口必须是本周可执行的具体动作

## 能量总结
3-4 字能量总结词

## 开放式问题
把主权交还用户的开放式问题

【重要】输出只包含上述段落，不要添加总结或建议。`
}

function buildUserPrompt(result: LenormandDrawResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

  const genderText = result.gender
    ? (result.gender === 'male' ? '男' : '女')
    : '未指定'

  const birthYearText = result.birthYear ? `${result.birthYear}年` : '未提供'

  const spreadInfo = `牌阵：${result.spread_name}
问题：${result.question || '（无具体问题）'}
性别：${genderText}
出生年份：${birthYearText}
seed：${result.seed}`

  const cardsInfo = result.cards.map((c: LenormandCard, i: number) => {
    return `\n【位置 ${i + 1}】${c.position}\n- 牌名：${c.name}（${c.nameEn}）\n- 编号：${c.id}\n- 关键词：${c.keyword}`
  }).join('')

  // 相邻牌组合
  const pairs: string[] = []
  for (let i = 0; i < result.cards.length - 1; i++) {
    pairs.push(`${result.cards[i]!.name} + ${result.cards[i + 1]!.name}`)
  }

  return `请为以下雷诺曼牌阵做深度解读：

${spreadInfo}

${cardsInfo}

【相邻牌组合】（雷诺曼核心解读法）
${pairs.length > 0 ? pairs.join('\n') : '单张牌，无相邻组合'}

请按 整体能量概览 → 牌阵展示 → 逐牌解读 → 牌间关系分析 → 综合解读 → 能量总结 → 开放式问题 的顺序输出。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: LenormandDrawResult
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
