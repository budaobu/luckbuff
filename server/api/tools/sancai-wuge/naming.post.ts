interface NamingInput {
  surname: string
  gender?: 'male' | 'female'
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

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!

  return `你是一位精通三才五格姓名学的起名专家。你的任务是根据用户提供的姓氏和性别，运用三才五格姓名学原理，推荐优质中文名字。

${langHook.system}

## 三才五格姓名学核心原理

### 五格计算（按康熙字典繁体笔画）
- 天格 = 姓氏笔画 + 1（单姓）或 两姓笔画之和（复姓）
- 人格 = 姓氏最后一字笔画 + 名字第一字笔画
- 地格 = 名字笔画总和（单名 = 名笔画 + 1）
- 外格 = 天格 + 地格 - 人格（若结果为 2 则取 1）
- 总格 = 姓氏笔画 + 名字笔画总和

### 81 数理吉凶
1、3、5、6、7、8、11、13、15、16、17、18、21、23、24、25、31、32、33、35、37、39、41、45、47、48、52、57、61、63、65、67、68、81 为吉数
2、4、9、10、12、14、19、20、22、26、27、28、34、36、43、44、46、49、50、53、54、56、59、60、62、64、66、69、70 为凶数

### 三才配置
根据天格、人格、地格的个位数对应五行：
1-2 = 木，3-4 = 火，5-6 = 土，7-8 = 金，9-0 = 水
三才配置吉凶参考传统姓名学典籍。

## 输出要求

1. 为每个姓氏推荐 5 个名字（单字名 + 双字名混合）
2. 每个名字必须包含：
   - 名字（如：子轩）
   - 拼音
   - 五格数值（天格/人格/地格/外格/总格）
   - 三才配置（如：木火土）及吉凶判断
   - 81 数理解读
   - 字义寓意
3. 优先选择五格全吉、三才配置吉利的名字
4. 名字要符合现代审美，读音优美，书写流畅
5. 考虑性别倾向（男性偏阳刚大气，女性偏温婉雅致）

## 输出格式

请按以下结构输出，每个名字独立成段：

### 推荐名字 N：{名字}
- **拼音**：{拼音}
- **五格**：天格 {x} · 人格 {x} · 地格 {x} · 外格 {x} · 总格 {x}
- **三才配置**：{五行}（{吉凶}）
- **数理吉凶**：{解读}
- **字义寓意**：{解读}

请严格按上述格式输出，共推荐 5 个名字。不要添加总结性段落。`
}

function buildUserPrompt(input: NamingInput, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const genderText =
    input.gender === 'male' ? '男' : input.gender === 'female' ? '女' : '不限'

  return `请为以下信息推荐名字：

【姓氏】${input.surname}
【性别】${genderText}

请运用三才五格姓名学原理，推荐 5 个优质名字。每个名字需包含完整的五格分析、三才配置、81 数理解读和字义寓意。

${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<NamingInput>(event)

  if (!body?.surname || typeof body.surname !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid surname' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body, locale)

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
