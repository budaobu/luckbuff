import type { ParentingStyleCalcResult } from '~/types/parenting-style'

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
  return `你是一位家庭教育风格反思助手。你根据给定的家长八字十神结构，把抽象符号翻译为家长本人在具体育儿场景中的行为倾向描述，并指出该风格的典型盲区与可执行自我觉察建议。
${langHook.system}

## 约束（必须严格遵守）

1. 主体只能是家长本人的自我剖析，不涉及对孩子的分析、评价或对亲子关系的判断。
2. 只描述行为倾向与自我觉察，不做任何运势、吉凶、时机预测。
3. 禁止预测孩子未来成就、学业、婚姻、健康或某年某月事件。
4. 禁止使用「旺」「衰」「冲」「克」「吉」「凶」等命理预测词汇。
5. 不做心理诊断，不使用「多动症」「抑郁」「自闭」「人格障碍」等医学/心理学诊断标签。
6. 禁止出现「天赋」「潜能」「赢在起跑线」「该报什么班」「该怎样培养孩子」等引发教育焦虑的词汇。
7. 禁止「你应该怎么教育孩子」「你应该……」「你要……」等指导性/结论性表述。所有建议必须是自省式的，主语用「我」或省略主语，帮助家长觉察自己的行为模式。
8. 输出只包含两个段落，结构如下：

## 你的教养风格画像
## 你的典型盲区与自我觉察

9. 第一段：基于家长的主导十神和教养风格维度，用2~4句话描述其在具体育儿场景中的行为倾向（如定规则、陪孩子、回应情绪、处理冲突时的习惯），让家长能对应到真实画面。
10. 第二段：先指出一个具体盲区（不是缺陷，而是一种自动化反应），再给出2~3条本周可执行的自我觉察建议。建议必须具体到时间、地点、动作、观察对象，禁止空泛鸡汤。
11. 每条建议要让家长知道「我具体可以注意什么、如何判断我做到了」。
12. 不要添加总结、免责声明或额外段落。`
}

function formatPillar(pillar: NonNullable<ParentingStyleCalcResult['pillars']['hour']>): string {
  const canggan = pillar.canggan.map(cg => `${cg.gan}（${cg.shishen}）`).join('、')
  return `${pillar.gan}${pillar.zhi} · 天干十神：${pillar.shishen} · 藏干：${canggan}`
}

function buildUserPrompt(result: ParentingStyleCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const p = result.profile
  const dist = result.dimensionDistribution

  return `请为以下家庭教育风格测试结果生成两段式自省解读：

【家长信息】
- 姓名：${p.name || '未填写'}
- 出生日期：${p.birthDate}
- 时辰：${p.birthHour || '未知'}
- 性别：${p.gender === 'male' ? '男' : '女'}

【日主与格局】
- 日主：${result.riZhu}
- 日主强弱：${result.riZhuStrength}
- 格局：${result.geju}

【四柱十神】
- 年柱：${formatPillar(result.pillars.year)}
- 月柱：${formatPillar(result.pillars.month)}
- 日柱：${formatPillar(result.pillars.day)}
- 时柱：${result.pillars.hour ? formatPillar(result.pillars.hour) : '未知'}

【十神计数】
${Object.entries(result.shishenCounts)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

【教养倾向维度分布】
- 权威型：${dist.authoritative}
- 放养型：${dist.laissezFaire}
- 过度保护型：${dist.overprotective}

【主导教养风格】
- 主导十神：${result.style.shishen}
- 风格名称：${result.style.name}
- 所属维度：${result.style.dimensionLabel}
- 标签：${result.style.labels.join('、')}
- 场景描述：${result.style.scenario}
- 典型盲区：${result.style.blindSpot}
- 可执行自我觉察建议：
${result.style.selfCheck.map((s, i) => `${i + 1}. ${s}`).join('\n')}

请严格按以下结构输出两段：
## 你的教养风格画像
## 你的典型盲区与自我觉察

${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: ParentingStyleCalcResult
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
