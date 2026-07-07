import type { ParentChildBaziCalcResult } from '~/types/parent-child-bazi'

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
  return `你是一位亲子沟通顾问。你根据给定的八字十神结构，把抽象符号翻译为具体的亲子互动场景与可执行建议。
${langHook.system}

## 约束（必须严格遵守）

1. 只描述性格倾向、沟通模式与教养方式差异，不做任何运势、吉凶、时机预测。
2. 禁止预测孩子未来成就、学业、婚姻、健康或某年某月事件。
3. 禁止使用「旺」「衰」「冲」「克」「吉」「凶」等命理预测词汇。
4. 不做心理诊断，不使用「多动症」「抑郁」「自闭」「人格障碍」等医学/心理学诊断标签。
5. 输出只包含两个段落，结构如下：

## 孩子性格画像与日常场景
## 合盘摩擦点与本周行动建议

6. 第一段：基于孩子的主导十神，用2~4句话描述孩子在家的具体行为场景（如写作业、与兄弟姐妹相处、面对批评时的反应），让家长能对应到真实画面。
7. 第二段：先指出一个具体冲突点（如「规则执行 vs 质疑规则」「目标导向 vs 过程享受」），再给出本周可执行的1~2条行动建议。建议必须具体到时间、地点、动作，禁止空泛鸡汤。
8. 每个行动建议都要让家长知道「具体做什么、做多久、如何判断做了」。
9. 不要添加总结、免责声明或额外段落。`
}

function buildUserPrompt(result: ParentChildBaziCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const p = result.parent.profile
  const c = result.child.profile

  return `请为以下亲子相性结果生成两段式解读：

【家长信息】
- 姓名：${p.name || '未填写'}
- 出生日期：${p.birthDate}
- 时辰：${p.birthHour || '未知'}
- 日主：${result.parent.riZhu}

【孩子信息】
- 姓名：${c.name || '未填写'}
- 出生日期：${c.birthDate}
- 时辰：${c.birthHour || '未知'}
- 日主：${result.child.riZhu}

【合盘关系】
- 家长对孩子是什么十神：${result.relation.parentToChildShiShen}
- 孩子对家长是什么十神：${result.relation.childToParentShiShen}
- 日主五行互动：${result.relation.dayMasterRelation} · ${result.relation.dayMasterRelationLabel}

【孩子主导十神画像】
- 主导十神：${result.childTraits.dominantShiShen}
- 标签：${result.childTraits.labels.join('、')}
- 场景：${result.childTraits.scenario}
- 沟通提示：${result.childTraits.communicationTip}

【家长教养风格】
- 家长风格：${result.parentRole.labels.join('、')}
- 场景：${result.parentRole.scenario}
- 常见盲点：${result.parentRole.blindSpot}

【合盘摩擦点】
- 类型：${result.friction?.title || '暂未识别'}
- 冲突描述：${result.friction?.conflict || '双方节奏存在差异'}
- 本周行动建议：
${(result.friction?.actions || []).map((a, i) => `${i + 1}. ${a}`).join('\n')}

请严格按以下结构输出两段：
## 孩子性格画像与日常场景
## 合盘摩擦点与本周行动建议

${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: ParentChildBaziCalcResult
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
