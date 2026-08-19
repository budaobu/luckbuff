interface PalaceResult {
  key: string
  wants: 'sha' | 'shui'
  theme: string
  elements: string[]
  score: number
  status: 'ji' | 'xiong' | 'ping'
}

interface CalcResult {
  direction: number
  facing: string
  sitting: string
  usage?: string
  palaces: PalaceResult[]
  score: number
  grade: string
  best: string | null
  worst: string | null
  locale: string
}

const PALACE_NAME: Record<string, Record<string, string>> = {
  'zh-CN': { kan: '坎宫（北）', kun: '坤宫（西南）', zhen: '震宫（东）', xun: '巽宫（东南）', qian: '乾宫（西北）', dui: '兑宫（西）', gen: '艮宫（东北）', li: '离宫（南）' },
  'zh-TW': { kan: '坎宮（北）', kun: '坤宮（西南）', zhen: '震宮（東）', xun: '巽宮（東南）', qian: '乾宮（西北）', dui: '兌宮（西）', gen: '艮宮（東北）', li: '離宮（南）' },
  'en': { kan: 'Kan (North)', kun: 'Kun (Southwest)', zhen: 'Zhen (East)', xun: 'Xun (Southeast)', qian: 'Qian (Northwest)', dui: 'Dui (West)', gen: 'Gen (Northeast)', li: 'Li (South)' },
}

const ELEMENT_NAME: Record<string, Record<string, string>> = {
  'zh-CN': { door: '大门', window: '窗户', balcony: '阳台', bathroom: '卫生间', kitchen: '厨房灶台', tallFurniture: '高柜家具', appliance: '电器', aquarium: '鱼缸水景' },
  'zh-TW': { door: '大門', window: '窗戶', balcony: '陽台', bathroom: '衛生間', kitchen: '廚房灶台', tallFurniture: '高櫃家具', appliance: '電器', aquarium: '魚缸水景' },
  'en': { door: 'main door', window: 'window', balcony: 'balcony', bathroom: 'bathroom', kitchen: 'stove/kitchen', tallFurniture: 'tall furniture', appliance: 'appliances', aquarium: 'aquarium/water feature' },
}

const GRADE_LABEL: Record<string, Record<string, string>> = {
  'zh-CN': { daji: '大吉', ji: '吉', ping: '平', xiong: '凶', daxiong: '大凶' },
  'zh-TW': { daji: '大吉', ji: '吉', ping: '平', xiong: '凶', daxiong: '大凶' },
  'en': { daji: 'Excellent', ji: 'Good', ping: 'Neutral', xiong: 'Challenging', daxiong: 'Very Challenging' },
}

const LANGUAGE_HOOKS: Record<string, { system: string, user: string }> = {
  'zh-CN': {
    system: '请使用简体中文输出。',
    user: '请使用简体中文输出所有内容。',
  },
  'zh-TW': {
    system: '請使用繁體中文輸出。',
    user: '請使用繁體中文輸出所有內容。',
  },
  'en': {
    system: 'Please output in English.',
    user: 'Please output all content in English.',
  },
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位久居深山的幽默隐士，精通金锁玉关（过路阴阳）风水。基于 deterministic 的九宫砂水打分结果，为海报生成压缩文案。
${langHook.system}

## 角色与语气
- 久居深山、看淡世事的老先生，机智温暖，带一点善意调侃
- 结论先行，口语化，不用术语堆砌，不恐吓，避免绝对化断言
- 所有内容视为传统文化参考，非科学结论

## 输出协议（严格遵守：每行一个前缀，前缀后接内容，不要输出任何其它行、标题或 markdown）
OV: 宅运总览一句话，点出坐向与整体砂水格局基调（40字以内）
JX: 最佳方位一句话，须含方位名与宫位主题（18字以内）
ZX: 最需调整方位一句话，须含方位名与问题要素（18字以内，没有明显凶位就写"八方还算匀称"之类）
YI: 一条布局宜做事项（14字以内），共 3 行
JI: 一条布局忌做事项（14字以内），共 3 行
KY: 开运一句话，结合住宅用途给出调整思路（26字以内）

## 约束
- 必须引用计算结果中的坐向、宫位、要素等具体信息，不编造
- 口诀依据：一二三四（坎坤震巽）要砂，六七八九（乾兑艮离）要水；砂位见水、水位见砂为反局
- 卫生间为浊水，砂位见之重点提醒；化解建议以功能分区、遮挡、整洁通风为主，不涉及符咒法事与指定商品
- 分数偏低时语气依然温暖，给化解思路而非吓唬
- 不要解释打分过程，不要出现分数数字`
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!
  const locale = result.locale in PALACE_NAME ? result.locale : 'zh-CN'
  const palaceName = PALACE_NAME[locale]!
  const elementName = ELEMENT_NAME[locale]!
  const gradeLabel = GRADE_LABEL[locale]?.[result.grade] || result.grade
  const usageText = result.usage
    ? { residential: '住宅', office: '办公', shop: '商铺' }[result.usage] || result.usage
    : '未指定'

  const palaceLines = result.palaces
    .map((p) => {
      const els = p.elements.map(e => elementName[e] || e).join('、') || '无要素'
      const statusText = p.status === 'ji' ? '吉' : p.status === 'xiong' ? '凶' : '平'
      return `- ${palaceName[p.key] || p.key}（要${p.wants === 'sha' ? '砂' : '水'}）：${els} → ${statusText}`
    })
    .join('\n')

  return `请为以下金锁玉关风水测算结果生成海报文案：

【坐向】坐${palaceName[result.sitting] || result.sitting}向${palaceName[result.facing] || result.facing}（朝向角 ${result.direction}°）
【房屋用途】${usageText}
【综合评定】${gradeLabel}
【最佳宫位】${result.best ? palaceName[result.best] || result.best : '无'}
【最需注意宫位】${result.worst ? palaceName[result.worst] || result.worst : '无'}

【八方砂水明细】
${palaceLines}

请按系统提示的行协议输出海报文案。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result: CalcResult, locale?: string }>(event)

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
