import { generateSancaiWugeNames } from '../../../utils/sancai-wuge/engine'

interface NamingInput {
  surname: string
  gender?: 'male' | 'female'
  locale?: string
}

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': {
    system: '请使用简体中文输出。',
    user: '请使用简体中文输出。',
  },
  'zh-TW': {
    system: '請使用繁體中文輸出。',
    user: '請使用繁體中文輸出。',
  },
  en: {
    system: 'Please output in English.',
    user: 'Please output in English.',
  },
}

/**
 * 务实老师傅 · 克制版：起名是给孩子定终身的事，家长带着焦虑来，
 * 点评要收得更狠——只一句，温暖、有分寸，绝不调侃、绝不预言吉凶。
 * 五格/三才/评分等数字由本地引擎算好喂入，LLM 不得改动，只写一句感受。
 */
function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!

  return `你是一位经验丰富的起名老师傅。
${langHook.system}

此刻家长正为给孩子定名而郑重踌躇。你的任务，只为系统已测算好的那个首推名字，写一句克制、温暖的点评。

## 必须严格遵守
1. 只输出一句点评，不超过 40 字，前后不要任何前缀、标题、引号或解释。
2. 名字的五格数值、三才配置、评分等均由系统测定并随输入给出，你不得更改、不得复述数字、不得重新推算。
3. 语气庄重而温暖：从容、有温度，但绝不调侃名字、不玩梗、不开玩笑。
4. 不预言吉凶祸福，不承诺名字带来好运，只做文化寓意与音律感受上的善意肯定。
5. 可说这个名字读来如何、寓意何处动人；点到即止，留白为宜。`
}

function buildUserPrompt(topName: {
  fullName: string
  pinyin: string
  sancai: { combo: string; luck: string }
  overallLuck: string
  chars: { char: string; meaning: string }[]
}, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const meanings = topName.chars.map(c => `${c.char}（${c.meaning}）`).join('、')

  return `系统已为求名者测得首推之名，请你为其写一句点评。

【姓名】${topName.fullName}
【读音】${topName.pinyin}
【三才配置】${topName.sancai.combo}（${topName.sancai.luck}）
【五格运势】${topName.overallLuck}
【名字寓意】${meanings}

请只写一句克制而温暖的点评（不超过 40 字）。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<NamingInput>(event)

  if (!body?.surname || typeof body.surname !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid surname' })
  }

  const locale = body.locale || 'zh-CN'
  const gender = body.gender === 'female' ? 'female' : 'male'

  // ---- 本地确定性引擎出候选（设 SSE 头之前同步算）----
  let naming
  try {
    naming = await generateSancaiWugeNames(body.surname, gender)
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: `候选生成失败：${e?.message ?? e}` })
  }
  if (!naming.candidates.length || !naming.topName) {
    throw createError({ statusCode: 422, statusMessage: '未能为该姓氏测得合适候选，请换个姓氏试试' })
  }

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  // 只需一句点评，收紧 token 上限
  const maxTokens = 512

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(naming.topName, locale)

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

  // 帧一：结构化候选（chart-then-text 之 chart），前端据此秒渲染证书海报
  emit({ type: 'candidates', result: naming })

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
    // AI 挂了不影响证书：前端用主推候选的本地 briefComment 兜底
    emit({ type: 'error', message: `AI 点评连接失败：${e?.message ?? e}` })
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
