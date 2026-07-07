import type { DiZhi } from '~/types/user'

interface CalcResult {
  userGanzhi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  userZhi: DiZhi[]
  userGan: string[]
  xiyongWuxing: string
  jishenWuxing: string
  qiguaRizhi: DiZhi
  qiguaRigan: string
  wuxingEnergy: {
    wuxing: string
    tendency: 'shun' | 'ni' | 'ping'
    label: string
  }
  renji: {
    yi: Array<{ shengxiao: string; dizhi: DiZhi; relations: string[]; score: number }>
    ji: Array<{ shengxiao: string; dizhi: DiZhi; relations: string[]; score: number }>
  }
  jishi: {
    ji: Array<{ dizhi: DiZhi; timeRange: string; score: number; reason: string }>
    xiong: Array<{ dizhi: DiZhi; timeRange: string; score: number; reason: string }>
  }
  fangwei: {
    ji: Array<{ direction: string; wuxing: string }>
    xiong: Array<{ direction: string; wuxing: string }>
  }
  scene: string
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

const SCENE_LABEL: Record<string, Record<string, string>> = {
  'zh-CN': {
    work: '工作',
    business: '商务谈判',
    contract: '签约',
    family: '家庭',
    social: '社交',
  },
  'zh-TW': {
    work: '工作',
    business: '商務談判',
    contract: '簽約',
    family: '家庭',
    social: '社交',
  },
  en: {
    work: 'work',
    business: 'business negotiation',
    contract: 'contract signing',
    family: 'family',
    social: 'social',
  },
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是精通四柱八字与择日的命理师。基于用户出生四柱与起卦日柱的 deterministic 计算结果，生成今日运势综合建议。
${langHook.system}

## 角色与语气
- 命理师口吻，结论先行，具体点名属相、时辰、方位
- 温暖、积极、不恐吓，避免绝对化断言
- 所有建议视为传统文化参考，非科学结论

## 输出结构（严格按以下顺序，不要额外总结）
1. 以五行能量定性开篇（顺势/逆势/平稳），1 句话定基调
2. 人际宜忌：点名宜见、忌见属相及场景化说明
3. 吉时推荐：点名最吉时辰与需回避时辰
4. 方位宜忌：点名吉方、凶方及场景化落座/朝向建议
5. 事项宜忌：根据 calc 结果自行推断 3 条宜做事项、3 条忌做事项

## 约束
- 总字数控制在 250 字左右
- 必须引用计算结果中的具体数据，不编造
- 场景化措辞需贴合用户选择的场景（工作/商务谈判/签约/家庭/社交）
- 宜忌事项由你根据五行顺逆、属相吉凶、时辰方位综合判断生成`
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!
  const sceneLabel = SCENE_LABEL[result.locale]?.[result.scene] || result.scene

  const yiZodiac = result.renji.yi.map(z => `${z.shengxiao}（${z.dizhi}）`).join('、')
  const jiZodiac = result.renji.ji.map(z => `${z.shengxiao}（${z.dizhi}）`).join('、')
  const jiShi = result.jishi.ji.map(s => `${s.dizhi}时 ${s.timeRange}`).join('、')
  const xiongShi = result.jishi.xiong.map(s => `${s.dizhi}时 ${s.timeRange}`).join('、')
  const jiFang = result.fangwei.ji.map(f => `${f.direction}方（${f.wuxing}）`).join('、')
  const xiongFang = result.fangwei.xiong.map(f => `${f.direction}方（${f.wuxing}）`).join('、')

  return `用户出生四柱：${result.userGanzhi.year.gan}${result.userGanzhi.year.zhi}年 ${result.userGanzhi.month.gan}${result.userGanzhi.month.zhi}月 ${result.userGanzhi.day.gan}${result.userGanzhi.day.zhi}日 ${result.userGanzhi.hour ? result.userGanzhi.hour.gan + result.userGanzhi.hour.zhi + '时' : '时辰未知'}
日主天干：${result.userGanzhi.day.gan}（${result.xiyongWuxing}为喜用，${result.jishenWuxing}为忌）
起卦日柱：${result.qiguaRigan}${result.qiguaRizhi}日
五行能量：${result.wuxingEnergy.label}（日干五行 ${result.wuxingEnergy.wuxing}）
场景：${sceneLabel}

【人际宜忌】
宜见属相：${yiZodiac || '无'}
忌见属相：${jiZodiac || '无'}

【吉时推荐】
吉时：${jiShi || '无'}
需回避：${xiongShi || '无'}

【方位宜忌】
吉方：${jiFang || '无'}
凶方：${xiongFang || '无'}

请按系统提示要求的结构输出今日运势综合建议。${langHook.user}`
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
