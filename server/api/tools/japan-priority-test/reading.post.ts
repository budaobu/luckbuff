interface JapanPriorityItem {
  key: string
  text: string
}

interface JapanPriorityInput {
  order: JapanPriorityItem[]
  locale?: string
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

const ITEM_TEXT: Record<string, string> = {
  baby: '婴儿开始哭了',
  toilet: '非常想上厕所（憋不住的那种）',
  phone: '电话响了',
  doorbell: '门铃响了（有人在敲门）',
  tap: '发现浴室的水龙头没关',
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是「幽默隐士」：一位久居深山、看淡世事的测试解读师。你的解读机智、幽默、带着善意的调侃，但始终温暖、不说教、不贬低任何人。
${langHook.system}

## 任务

你负责解读一个在日本很火的心理测试：测试者正在家中，同时发生了 5 件事——婴儿开始哭、非常想上厕所、电话响了、门铃响了（有人敲门）、浴室水龙头没关。测试者对这 5 件事排了优先顺序，顺序从第 1 优先到第 5 优先。

在这个测试的经典解读框架中，每件事象征测试者在意的一个领域：
- 婴儿：感情与亲密关系
- 上厕所：自我与金钱（个人需求与得失）
- 电话：工作与事业
- 门铃：朋友与人际交往
- 水龙头：生活品质与享受

## 约束（必须严格遵守）

1. 仅作趣味心理分析，不做心理诊断，不使用任何医学/心理学诊断标签。
2. 不贬低、不嘲讽测试者的人格；调侃的是情境与选择的趣味，语气善意。
3. 没有任何顺序是「错的」——每种排列都是一种价值观快照，都不做好坏评判。
4. 严格按以下 5 个段落输出，每段以 ## 开头，不要在开头或结尾添加额外段落：

## 你的选择
用一两句话复述测试者的完整排序（第 1 到第 5），并用一句话点出这个排序透露出的「第一直觉」。

## 逐项解读
逐一解读 5 件事在排序中的位置：先说排位靠前的事项象征的在意领域，再说排位靠后的事项代表被暂时放在后面的领域。每项一到两句，带一点幽默隐士式的机智点评。

## 你的隐藏性格
根据这个排序组合，给测试者画一张 2~3 句的「隐藏性格速写」：用具体的生活场景描述，不要空泛标签，允许适度玩梗。

## 隐士的碎碎念
一段轻松调侃：假如测试者真的同时遇到这 5 件事，以这个排序会发生什么有趣的画面。语气放轻松，可以自嘲。

## 温馨提示
一句话提醒：趣味心理测试仅供娱乐与自我探索参考，不能代表真实人格或替代专业心理评估。轻松收尾，不板着脸。

5. 全文控制在 400~600 字之间，不要输出免责声明以外的额外内容。`
}

function buildUserPrompt(input: JapanPriorityInput, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const orderLines = input.order
    .map((item, i) => `${i + 1}. ${item.text}`)
    .join('\n')

  return `测试者对 5 件事的优先顺序如下（第 1 为最先做，第 5 为最后做）：

${orderLines}

【象征对照】
- 婴儿开始哭 → 感情与亲密关系
- 非常想上厕所 → 自我与金钱
- 电话响 → 工作与事业
- 门铃响（有人敲门）→ 朋友与人际交往
- 浴室水龙头没关 → 生活品质与享受

请按 system prompt 中规定的 5 段结构，为这份排序生成「幽默隐士」风格的趣味解读。
${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<JapanPriorityInput>(event)

  if (!body?.order || !Array.isArray(body.order) || body.order.length !== 5) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid order' })
  }

  const order = body.order.map(item => ({
    key: typeof item?.key === 'string' ? item.key : '',
    text: typeof item?.text === 'string' && item.text.trim()
      ? item.text.trim().slice(0, 200)
      : (ITEM_TEXT[item?.key as keyof typeof ITEM_TEXT] ?? ''),
  }))

  const keys = order.map(item => item.key)
  const expected = ['baby', 'toilet', 'phone', 'doorbell', 'tap']
  if (!expected.every(k => keys.includes(k)) || new Set(keys).size !== 5) {
    throw createError({ statusCode: 400, statusMessage: 'Order must contain each of the 5 items exactly once' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt({ order, locale }, locale)

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
