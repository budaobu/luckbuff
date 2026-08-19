import type { DiZhi } from '~/types/user'

interface CalcResult {
  userGanzhi: {
    year: { gan: string, zhi: string }
    month: { gan: string, zhi: string }
    day: { gan: string, zhi: string }
    hour: { gan: string, zhi: string } | null
  }
  dayMaster: { gan: string, wuxing: string }
  xiyongWuxing: string
  jishenWuxing: string
  targetYear: number
  yearGanZhi: {
    gan: string
    zhi: DiZhi
    shengxiao: string
    ganWuxing: string
    zhiWuxing: string
  }
  shiShen: string
  taiSui: { relation: string, delta: number } | null
  score: number
  grade: string
  factors: Array<{ key: string, label: string, delta: number }>
  lucky: { direction: string, wuxing: string, color: string }
  locale: string
}

const GRADE_LABEL: Record<string, Record<string, string>> = {
  'zh-CN': { daji: '大吉', ji: '吉', ping: '平', xiong: '凶', daxiong: '大凶' },
  'zh-TW': { daji: '大吉', ji: '吉', ping: '平', xiong: '凶', daxiong: '大凶' },
  en: { daji: 'Excellent', ji: 'Good', ping: 'Neutral', xiong: 'Challenging', daxiong: 'Very Challenging' },
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
  en: {
    system: 'Please output in English.',
    user: 'Please output all content in English.',
  },
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位久居深山的幽默隐士，精通四柱八字。基于流年运势的 deterministic 计算结果，为海报生成压缩文案。
${langHook.system}

## 角色与语气
- 久居深山、看淡世事的老先生，机智温暖，带一点善意调侃
- 结论先行，口语化，不用术语堆砌，不恐吓，避免绝对化断言
- 所有内容视为传统文化参考，非科学结论

## 输出协议（严格遵守：每行一个前缀，前缀后接内容，不要输出任何其它行、标题或 markdown）
OV: 流年总览一句话，点出干支、生肖与整体基调（36字以内）
SY: 事业一句话（16字以内，宁可短不可超）
CY: 财运一句话（16字以内，宁可短不可超）
GQ: 感情一句话（16字以内，宁可短不可超）
JK: 健康一句话（16字以内，宁可短不可超）
YI: 一条宜做事项（12字以内），共 3 行
JI: 一条忌做事项（12字以内），共 3 行
KY: 开运一句话，须包含给定的幸运方位与色彩（24字以内）

## 约束
- 必须引用计算结果中的干支、十神、太岁关系等具体信息，不编造
- 分数偏低时语气依然温暖，给化解思路而非吓唬
- 不要解释打分过程，不要出现分数数字`
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!
  const gradeLabel = GRADE_LABEL[result.locale]?.[result.grade] || result.grade
  const factorLines = result.factors.map(f => `- ${f.label}（${f.delta > 0 ? '+' : ''}${f.delta}）`).join('\n')

  return `用户出生四柱：${result.userGanzhi.year.gan}${result.userGanzhi.year.zhi}年 ${result.userGanzhi.month.gan}${result.userGanzhi.month.zhi}月 ${result.userGanzhi.day.gan}${result.userGanzhi.day.zhi}日 ${result.userGanzhi.hour ? result.userGanzhi.hour.gan + result.userGanzhi.hour.zhi + '时' : '时辰未知'}
日主：${result.dayMaster.gan}（五行属${result.dayMaster.wuxing}，${result.xiyongWuxing}为喜用，${result.jishenWuxing}为忌）
流年：${result.targetYear}年 ${result.yearGanZhi.gan}${result.yearGanZhi.zhi}（${result.yearGanZhi.shengxiao}年），干五行属${result.yearGanZhi.ganWuxing}，支五行属${result.yearGanZhi.zhiWuxing}
流年十神：${result.shiShen}
太岁关系：${result.taiSui ? `${result.taiSui.relation}太岁` : '无特殊刑冲'}
综合评定：${gradeLabel}
打分因子：
${factorLines}
幸运方位：${result.lucky.direction}方（五行属${result.lucky.wuxing}），幸运色彩：${result.lucky.color}

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
