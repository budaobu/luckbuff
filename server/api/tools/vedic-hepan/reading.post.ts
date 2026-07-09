import type { VedicHepanCalcResult } from '~/types/vedic-hepan'

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
  return `你是一位混迹人间多年的隐士老友，占星只是你茶余饭后看人的一把尺子。你说话随性、风趣、接地气，擅长用生活里的比喻把星盘关系讲明白；可以损，但不刻薄；一针见血，但拒绝空泛套话。
${langHook.system}

## 任务
基于双人吠陀占星本命盘数据（上升星座、行星宫位、跨盘相位、宫位叠加），为一对情侣/伴侣写一份合婚解读。解读必须拆成以下五张卡片，每张卡片以 ## 标题 开头：

## 缘分基调总览
## 性格化学反应
## 情感相处模式
## 潜在雷区
## 隐士一句锐评

## 约束（必须严格遵守）

1. 不许预测具体事件（如“某年会结婚/离婚/发财/生病”），不许说“一定”“绝对”“必分”“天作之合”。
2. 不许用“旺夫”“克妻”“上等婚”“下等婚”等传统合婚黑话。
3. 不许下医学/心理诊断，不许贴“抑郁”“人格障碍”“依恋障碍”等标签。
4. 必须具体到宫位和相位讲：比如“甲方的金星落在乙方的第7宫”“两人的日月形成拱相”等。
5. 五张卡片内容都不能空泛，要结合真实星盘数据给出“这对人在一起会呈现出什么画风”。
6. 语气像老朋友聊天，可以用损、调侃、比喻，但要让人能感觉到 warmth，不是冷冰冰的命理报告。
7. 每张卡片控制在 150~250 字左右；「隐士一句锐评」用一句话或一段话收尾，要犀利、有记忆点。
8. 不要添加卡片以外的总结、免责声明或额外段落。`
}

function planetNameZh(name: string): string {
  const map: Record<string, string> = {
    Sun: '太阳', Moon: '月亮', Mars: '火星', Mercury: '水星',
    Jupiter: '木星', Venus: '金星', Saturn: '土星', Rahu: '罗睺', Ketu: '计都',
  }
  return map[name] || name
}

function formatChartSummary(person: VedicHepanCalcResult['personA']): string {
  const c = person.chart
  const currentDasha = c.dasha.find(d => d.isCurrent)
  const planets = c.planets
    .filter(p => ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.graha))
    .map(p => `${planetNameZh(p.graha)}${p.isRetrograde ? '（逆）' : ''}在${p.signNameZh}（${p.house}宫）`)
    .join('、')
  return `【${person.name}】\n出生城市：${person.cityName}\n上升星座：${c.ascendant.signNameZh}（${c.ascendant.signName}）${c.ascendant.degree.toFixed(1)}° · ${c.ascendant.nakshatra} pada ${c.ascendant.nakshatraPada}\n当前大运：${currentDasha ? currentDasha.graha : '—'}\n主要行星：${planets}`
}

function dedupeAspects(aspects: VedicHepanCalcResult['crossAspects']): VedicHepanCalcResult['crossAspects'] {
  const seen = new Set<string>()
  return aspects.filter((a) => {
    const key = [a.planetA, a.planetB].sort().join('-') + `-${a.aspectType}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function formatAspects(aspects: VedicHepanCalcResult['crossAspects']): string {
  const unique = dedupeAspects(aspects)
  if (!unique.length) return '无显著跨盘相位。'
  return unique
    .map(a => `${a.note} · ${a.aspectType} · ${a.orb}°`)
    .join('\n')
}

function formatOverlays(overlays: VedicHepanCalcResult['aPlanetsInB'] | VedicHepanCalcResult['bPlanetsInA'], label: string): string {
  if (!overlays.length) return ''
  const lines = overlays.map(o => `${label}的${planetNameZh(o.planet)}落在${o.house}宫`)
  return lines.join('、')
}

function buildUserPrompt(result: VedicHepanCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const a = result.personA
  const b = result.personB

  return `请根据以下双人吠陀占星合盘数据生成五张卡片式解读。

【计算口径】
${result.methodNote}

【上升星座对比】
${a.name}上升：${result.ascendantComparison.aSignZh}（${result.ascendantComparison.aSign}）
${b.name}上升：${result.ascendantComparison.bSignZh}（${result.ascendantComparison.bSign}）

${formatChartSummary(a)}

${formatChartSummary(b)}

【跨盘主要相位】
${formatAspects(result.crossAspects)}

【宫位叠加】
${formatOverlays(result.aPlanetsInB, a.name)}
${formatOverlays(result.bPlanetsInA, b.name)}

请严格按以下五张卡片结构输出，每张以 ## 标题 开头：
## 缘分基调总览
## 性格化学反应
## 情感相处模式
## 潜在雷区
## 隐士一句锐评

${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: VedicHepanCalcResult
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
