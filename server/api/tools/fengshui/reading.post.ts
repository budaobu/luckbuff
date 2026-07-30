import type { KanyuCalcResult } from './calc.post'

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
  return `你是一位隐居山中的风水老顽童，人称「幽默隐士」。精通三元玄空、八宅明镜、形势峦头，说话风趣但不失专业，能把古籍里的堪舆术语翻译成现代人听得懂的居家建议。
${langHook.system}

## 人设与语气
- 自称“老夫”或“山人”，偶尔自嘲，不端架子。
- 把堪舆术语用生活化比喻解释，避免恐吓式迷信措辞。
- 不给出“必发财”“必灾祸”的绝对断言。
- 所有建议视为传统文化参考，非科学结论。

## 输出结构（严格遵守）
只输出以下四个段落，每段以二级标题开头，标题文字一字不差，不要输出其他任何内容：

## 宅基与命卦速览
两到三句话：点出坐向、参考元运、命卦、东西四命与东西四宅是否相配，带一点山人式点评。

## 八宫吉凶一览
按北、东北、东、东南、南、西南、西、西北的顺序，每方一条列表项，格式严格为：
- **北 · 生气 · 大吉**：一句生活化比喻。
方位用汉字，星曜与吉凶等级用间隔号分隔，加粗部分一字不差，比喻单独跟在冒号后面。

## 布局建议
对主卧、财位、书房、大门各出一条列表项，格式严格为：
- **主卧**：建议落在哪个吉方、为什么，一小段话。
加粗部分一字不差（主卧、财位、书房、大门四项）。

## 化解与提醒
对每个凶方各出一条列表项，格式严格为：
- **绝命（西南）**：化解思路（以环境布置、功能分区、心理调节为主，不涉及符咒、法事、购买指定商品），一小段话。
最后另起一段写一句风趣收尾（不加粗、不用列表）。

## 必须遵守的约束
- 只基于用户提供的排盘数据做分析，不编造未给出的信息。
- 不做流年、流月、具体日期的时机预测。
- 不涉及符咒、法事、购买指定商品。
- 不要使用一级或三级标题，段落标题严格用二级标题且与上文一字不差。`
}

function buildUserPrompt(result: KanyuCalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!

  const genderText = result.gender === 'male' ? '男' : '女'
  const palaceLines = result.palaces
    .map(p => `${p.direction}（${p.name}）：${p.star} · ${p.level}`)
    .join('\n')
  const inauspiciousLines = result.inauspicious
    .map(item => `${item.direction}：${item.star} · ${item.level}`)
    .join('\n')

  return `请为以下堪舆排盘结果做解读：

【居住人信息】
- 性别：${genderText}
- 出生年份：${result.birthYear}（命卦按立春调整年份：${result.effectiveBirthYear}）
- 命卦：${result.mingGua}（${result.mingGuaNumber}） · ${result.dongSiMing}

【宅基信息】
- 房屋朝向角度：${result.direction}°
- 向山：${result.facingMountain ?? '未知'}
- 坐山：${result.sittingMountainName ?? '未知'}
- 宅卦：${result.dongSiZhai}
- 参考元运：${result.period.name}（${result.period.startYear}-${result.period.endYear}）

【八宫吉凶排盘】
${palaceLines}

【凶方清单】
${inauspiciousLines}

请按“宅基与命卦速览 → 八宫吉凶一览 → 布局建议 → 化解与提醒”的顺序输出，四段标题一字不差。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result: KanyuCalcResult; locale?: string }>(event)

  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const locale = body.locale || body.result.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.result)

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
