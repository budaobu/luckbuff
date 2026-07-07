import type { MarriageXiangxingCalcResult } from '~/types/marriage-xiangxing'

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
  return `你是一位亲密关系沟通顾问。你根据给定的八字十神结构，把抽象符号翻译为具体的亲密关系互动场景与可执行建议。
${langHook.system}

## 约束（必须严格遵守）

1. 只描述双方的相处模式、沟通风格与情绪表达方式差异，不做任何运势、吉凶、时机预测。
2. 禁止判断「婚姻是否该继续」「是否般配」「能不能结婚」「会不会离婚」等结论性判断。
3. 禁止使用「上等婚」「中等婚」「下等婚」「旺夫」「克妻」「相冲」「相克」「不合」等传统合婚黑话。
4. 不做心理诊断，不使用「多动症」「抑郁」「自闭」「人格障碍」「依恋障碍」等医学/心理学诊断标签。
5. 输出只包含两个段落，结构如下：

## 双方关系人格画像
## 合盘摩擦点与可执行相处建议

6. 第一段：分别描述甲方和乙方在亲密关系中的沟通风格、情绪表达方式、对规则与自由的诉求，翻译成具体互动场景（如吵架后的处理方式、日常决策习惯、空间需求）。
7. 第二段：先指出一个具体冲突点（如「沟通节奏差异」「规则执行 vs 质疑变通」「独处需求 vs 日常连接」），再给出 2~3 条本周可执行的相处建议。建议必须具体到时间、地点、动作，禁止空泛鸡汤。
8. 每个行动建议都要让双方知道「具体做什么、做多久、如何判断做了」。
9. 不要添加总结、免责声明或额外段落。`
}

function buildUserPrompt(result: MarriageXiangxingCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const a = result.personA.profile
  const b = result.personB.profile

  return `请为以下婚姻相性结果生成两段式解读：

【甲方信息】
- 姓名：${a.name || '未填写'}
- 出生日期：${a.birthDate}
- 时辰：${a.birthHour || '未知'}
- 日主：${result.personA.riZhu}

【乙方信息】
- 姓名：${b.name || '未填写'}
- 出生日期：${b.birthDate}
- 时辰：${b.birthHour || '未知'}
- 日主：${result.personB.riZhu}

【合盘关系】
- 甲方对乙方是什么十神：${result.relation.aToBShiShen}
- 乙方对甲方是什么十神：${result.relation.bToAShiShen}
- 日主五行互动：${result.relation.dayMasterRelation} · ${result.relation.dayMasterRelationLabel}

【甲方关系人格画像】
- 主导十神：${result.portraitA.shishen}
- 标签：${result.portraitA.labels.join('、')}
- 沟通风格：${result.portraitA.communicationStyle}
- 情绪表达：${result.portraitA.emotionalExpression}
- 规则与自由：${result.portraitA.rulesVsFreedom}
- 场景：${result.portraitA.scenario}

【乙方关系人格画像】
- 主导十神：${result.portraitB.shishen}
- 标签：${result.portraitB.labels.join('、')}
- 沟通风格：${result.portraitB.communicationStyle}
- 情绪表达：${result.portraitB.emotionalExpression}
- 规则与自由：${result.portraitB.rulesVsFreedom}
- 场景：${result.portraitB.scenario}

【合盘摩擦点】
- 类型：${result.friction?.title || '暂未识别'}
- 冲突描述：${result.friction?.conflict || '双方节奏存在差异'}
- 可执行建议：
${(result.friction?.actions || []).map((action, i) => `${i + 1}. ${action}`).join('\n')}

请严格按以下结构输出两段：
## 双方关系人格画像
## 合盘摩擦点与可执行相处建议

${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: MarriageXiangxingCalcResult
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
