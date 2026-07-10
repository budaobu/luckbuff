import type { BztiBirthdayPersonalityCalcResult } from '~/data/bzti-birthday-personality'

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
  return `你是一位 BZTI 生日人格解读师。你根据用户的八字结构信号，为其生日人格类型做个性化、象征性的解读。不做运势、吉凶或时机预测。
${langHook.system}

## 约束（必须严格遵守）

1. 只描述性格特质、行为模式、内在动力与人际倾向。
2. 禁止预测运势、流年、大运、吉凶、婚恋、事业成败。
3. 禁止给出"今年""某年""某月"等时间性判断。
4. 禁止使用"旺""衰""冲""克""吉""凶"等命理预测词汇。
5. 输出风格直接、有分寸幽默、不说教，像朋友间的观察笔记。
6. 每个段落 2~4 句话，简明扼要。
7. 按以下结构输出：

## 核心人格画像
## 能量优势
## 潜在盲区
## 关系模式
## 成长建议

【重要】输出只包含上述五个段落，不要添加总结、建议列表或免责声明。`
}

function formatPillar(pillar: NonNullable<BztiBirthdayPersonalityCalcResult['pillars']['hour']>): string {
  const canggan = pillar.canggan.map(cg => `${cg.gan}（${cg.shishen}）`).join('、')
  return `${pillar.gan}${pillar.zhi} · 天干十神：${pillar.shishen} · 藏干：${canggan}`
}

function buildUserPrompt(result: BztiBirthdayPersonalityCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const p = result.pillars
  const type = result.type
  const effectiveLocale = locale === 'zh-TW' ? 'zh-TW' : locale === 'en' ? 'en' : 'zh-CN'

  const typeName = type.name[effectiveLocale] || type.name['zh-CN']
  const typeAlias = type.alias[effectiveLocale] || type.alias['zh-CN']
  const typeSummary = type.summary[effectiveLocale] || type.summary['zh-CN']
  const typeTags = (type.tags[effectiveLocale] || type.tags['zh-CN'] || []).join('、')

  return `请为以下 BZTI 生日人格结果做象征性解读：

【基本信息】
- 日主：${result.riZhu}
- 日主强弱：${result.riZhuStrength}
- 格局：${result.geju}

【四柱十神】
- 年柱：${formatPillar(p.year)}
- 月柱：${formatPillar(p.month)}
- 日柱：${formatPillar(p.day)}
- 时柱：${p.hour ? formatPillar(p.hour) : '未知'}

【十神计数】
${Object.entries(result.shishenCounts)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

【五行分数】
${Object.entries(result.wuxingScore)
  .map(([k, v]) => `- ${k}: ${v}%`)
  .join('\n')}

【BZTI 生日人格】
- 类型：${typeName}（${type.code}）
- 标签：${typeAlias}
- 关键词：${typeTags}
- 简述：${typeSummary}

请按 核心人格画像 → 能量优势 → 潜在盲区 → 关系模式 → 成长建议 的顺序输出五段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: BztiBirthdayPersonalityCalcResult
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
