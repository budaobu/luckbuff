import type { AstroDiceCalcResult } from '~/types/astro-dice'

const GRADE_LABEL: Record<string, Record<string, string>> = {
  'zh-CN': { daji: '大吉', ji: '吉', ping: '平', xiong: '凶' },
  'zh-TW': { daji: '大吉', ji: '吉', ping: '平', xiong: '凶' },
  en: { daji: 'Excellent', ji: 'Good', ping: 'Neutral', xiong: 'Challenging' },
}

const LANGUAGE_HOOKS: Record<string, { system: string, user: string }> = {
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
  return `你是一位久居深山的幽默隐士，闲来也玩西洋占星骰子。基于服务端随机掷出的行星/星座/宫位组合与确定性打分，为海报生成压缩文案。
${langHook.system}

## 角色与语气
- 久居深山、看淡世事的老先生，机智温暖，带一点善意调侃
- 结论先行，口语化，不用术语堆砌，不恐吓，避免绝对化断言
- 所有内容视为传统文化参考，非科学结论

## 占星骰子解读规则
- 行星=什么（哪股能量在行动），星座=怎样（能量以什么风格表达），宫位=在哪里（落在哪个生活领域）
- 庙旺（入庙/擢升）的组合语气可以更笃定；失势/落陷的组合给化解思路而非吓唬
- 交点（北交/南交）按成长方向/惯性模式解读，不当作实体行星

## 输出协议（严格遵守：每行一个前缀，前缀后接内容，不要输出任何其它行、标题或 markdown）
OV: 组合总览一句话，点出行星+星座+宫位的核心主题（36字以内）
PL: 行星维度一句话（16字以内，宁可短不可超）
SG: 星座维度一句话（16字以内，宁可短不可超）
HS: 宫位维度一句话（16字以内，宁可短不可超）
KY: 开运一句话，须包含给定的幸运色彩与方位（24字以内）

## 约束
- 必须引用组合中的行星、星座、宫位与庙旺状态，不编造
- 分数偏低时语气依然温暖，给化解思路而非吓唬
- 不要解释打分过程，不要出现分数数字`
}

function buildUserPrompt(result: AstroDiceCalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!
  const gradeLabel = GRADE_LABEL[result.locale]?.[result.grade] || result.grade
  const factorLines = result.factors.length
    ? result.factors.map(f => `- ${f.label}（${f.delta > 0 ? '+' : ''}${f.delta}）`).join('\n')
    : '- 无显著加减分因子，组合能量平稳'

  return `占星骰子掷出组合：
行星：${result.planet.nameZh}（${result.planet.nameEn}，${result.planet.glyph}，关键词：${result.planet.keywordZh}）
星座：${result.sign.nameZh}（${result.sign.nameEn}，${result.sign.glyph}，关键词：${result.sign.keywordZh}）
宫位：${result.house.nameZh}（${result.house.nameEn}，${result.house.glyph}，关键词：${result.house.keywordZh}）
庙旺状态：${result.dignity.label}
综合评定：${gradeLabel}
打分因子：
${factorLines}
幸运色彩：${result.lucky.color}，幸运方位：${result.lucky.direction}方

请按系统提示的行协议输出海报文案。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result: AstroDiceCalcResult, locale?: string }>(event)

  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const result = body.result
  const locale = body.locale || result.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(result)

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
