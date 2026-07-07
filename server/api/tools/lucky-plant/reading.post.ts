import type { PlantRecommendation } from './data/plants'

interface LuckyPlantCalcResult {
  profile: {
    name: string
    birthDate: string
    gender?: 'male' | 'female'
  }
  derived: {
    season: string
    seasonLabel: string
    natalElement: string
    natalElementLabel: string
    xiYong: string
    xiYongLabel: string
    reasoning: string
  }
  recommendations: PlantRecommendation[]
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

function getLangHook(locale: string): { system: string; user: string } {
  return LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
}

function buildSystemPrompt(locale: string): string {
  const langHook = getLangHook(locale)
  return `你是一位熟悉传统五行与家居风水的植物顾问。你根据用户的生辰季节与五行喜用，为推荐的植物给出个性化风水解读与养护建议。
${langHook.system}

## 约束（必须严格遵守）

1. 只从植物象征、五行调和、空间能量与养护角度进行解读
2. 禁止预测具体运势、时机、流年、投资回报或中奖结果
3. 禁止使用「一定」「必然」「绝对会发财」等确定性财富承诺
4. 输出风格：温和、实用、有启发性，像一位经验丰富的园艺风水顾问
5. 每个植物解读控制在 4~6 句话，包含：风水含义 + 摆放建议 + 养护要点
6. 按以下结构输出：

## 整体五行调和建议
（基于出生季节与喜用五行，给出 2~3 句整体建议）

## 推荐植物逐一解读
（为每株植物分别输出一个小节，标题用植物名）

## 日常养护总览
（给出浇水、光照、施肥、换盆的通用注意事项）

【重要】输出只包含上述三个部分，不要添加总结或免责声明。`
}

function buildUserPrompt(result: LuckyPlantCalcResult, locale: string): string {
  const langHook = getLangHook(locale)
  const { profile, derived, recommendations } = result

  const plantList = recommendations
    .map(
      (p, idx) =>
        `${idx + 1}. ${p.name}（五行${p.element}）\n   标签：${p.tags.join('、')}\n   风水含义：${p.meaning}\n   养护要点：${p.care}\n   匹配理由：${p.matchReason}`,
    )
    .join('\n\n')

  return `请为以下「幸运植物」测算结果做风水解读：

【用户档案】
- 姓名：${profile.name}
- 出生日期：${profile.birthDate}
- 性别：${profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '未填写'}

【五行推算】
- 出生季节：${derived.seasonLabel}
- 先天五行偏旺：${derived.natalElementLabel}
- 喜用五行：${derived.xiYongLabel}
- 推算依据：${derived.reasoning}

【推荐植物】
${plantList}

请按「整体五行调和建议 → 推荐植物逐一解读 → 日常养护总览」的顺序输出。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: LuckyPlantCalcResult
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
  }
  catch (e: any) {
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
        }
        catch {
          // non-JSON chunk: ignore
        }
      }
    }
  }
  catch (e: any) {
    emit({ type: 'error', message: `读取 AI 流时出错：${e?.message ?? e}` })
  }
  finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
