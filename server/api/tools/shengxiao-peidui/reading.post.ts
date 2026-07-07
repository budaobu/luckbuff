interface PartnerResult {
  gender: 'male' | 'female'
  animal: string
  year: number
  age: number
  ganZhi: string
  naYin: string
  shengXiaoMing: string
  mingGua: string
  lifeGroup: 'east' | 'west'
  lifeGroupLabel: string
}

interface RelationVerdict {
  key: string
  label: string
  detail?: string
}

interface CalcResult {
  male: PartnerResult
  female: PartnerResult
  pairLabel: string
  zodiacVerdict: RelationVerdict
  nayinVerdict: RelationVerdict
  mingguaVerdict: RelationVerdict
  locale: string
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
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是精通传统生肖婚配与八字纳音的命理师。基于两人出生年份的 deterministic 生肖、纳音、命卦数据，生成一段生肖婚配的白话解读。
${langHook.system}

## 角色与语气
- 命理师口吻，结论先行，温暖、理性、不恐吓
- 所有结论视为传统文化参考，非科学结论
- 避免绝对化断言，用「较宜」「可互相包容」「有磨合空间」等柔和措辞
- 禁止预测具体流年、大运、时机、吉凶日期

## 输出结构（严格按以下顺序，段落之间用单独一行的 \`---\` 分隔，不要额外总结）

第 1 段：标题为「配对总览」。用 2~3 句话概括两人的生肖、纳音、命卦关系，指出哪些方面较和谐、哪些方面需要磨合。

第 2 段：标题为「纳音婚配」。分别说明男方纳音与女方纳音的五行关系，给出 1~2 条相处建议。若纳音相克，重点强调互补与包容；若相生或比和，说明彼此支持的方向。

第 3 段：标题为「命卦婚配」。说明两人命卦东西四命是否相配，以及在日常相处、居住方位上的参考建议。

第 4 段：标题为「生肖婚配」。说明两人地支关系（三合/六合/相冲/相害/相刑/无特殊关系），解读沟通与性格互动的特点，给出 1~2 条具体建议。

## 约束
- 总字数控制在 350 字左右
- 必须引用计算结果中的具体数据，不编造
- 不给出「绝对合适」「一定离婚」「最凶」等断言
- 不给出运势、吉凶、时机类的绝对预测`
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!

  const m = result.male
  const f = result.female

  return `【男方信息】
出生年份：${m.year}年
生肖：${m.animal}
干支：${m.ganZhi}
纳音命：${m.naYin}
生肖命：${m.shengXiaoMing}
命卦：${m.mingGua}（${m.lifeGroupLabel}）

【女方信息】
出生年份：${f.year}年
生肖：${f.animal}
干支：${f.ganZhi}
纳音命：${f.naYin}
生肖命：${f.shengXiaoMing}
命卦：${f.mingGua}（${f.lifeGroupLabel}）

【合配结果】
生肖关系：${result.zodiacVerdict.label}
纳音关系：${result.nayinVerdict.label}
命卦关系：${result.mingguaVerdict.label}${result.mingguaVerdict.detail ? '（' + result.mingguaVerdict.detail + '）' : ''}

请按系统提示要求的结构输出生肖婚配白话解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result: CalcResult; locale?: string }>(event)

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
