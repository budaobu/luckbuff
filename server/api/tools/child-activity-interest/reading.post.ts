import type { ChildActivityInterestCalcResult } from '~/types/child-activity-interest'
import { getDimensionMeta } from '~/data/child-activity-interest'

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
  return `你是一位陪伴式观察顾问。你根据给定的八字十神结构，把抽象符号翻译为孩子的日常活动倾向与家长可在家尝试的观察小游戏。
${langHook.system}

## 约束（必须严格遵守）

1. 只描述孩子「在什么类型的活动中更容易投入、开心、进入心流」，不做任何能力、潜力、智商、学业、未来成就的判断。
2. 禁止预测孩子未来成就、学业、婚姻、健康或某年某月事件。
3. 禁止出现任何命理预测词汇，如「旺」「衰」「冲」「克」「吉」「凶」「用神」「喜忌」。
4. 不做心理诊断，不使用「多动症」「抑郁」「自闭」「人格障碍」等医学/心理学诊断标签。
5. 严格禁用以下教育焦虑向词汇与表述：「潜能」「天赋」「该报什么班」「该往哪个方向培养」「不能输在起跑线」「优秀」「更优秀」「比别人强」「赢在起点」「趁早培养」「耽误」「开窍」「开发」。
6. 禁止暗示某类孩子比另一类更优秀或更值得培养，禁止比较性表述。
7. 家长活动建议必须严格限定在「观察和陪伴孩子做什么更投入」的范围内：只给在家可操作的轻松小游戏或陪伴方式，禁止建议报班、培训、定向培养、教育投资。
8. 输出只包含两个段落，结构如下：

## 孩子的活动倾向画像
## 家长可以在家尝试的小活动

9. 第一段：基于孩子的主导活动维度，用2~4句话把倾向翻译成具体日常场景（如"更容易在动手拼搭类活动里坐得住"），让家长能对应到真实画面。
10. 第二段：给出1~2条具体、可执行的家长在家观察/陪伴活动。每条都要让家长知道「具体做什么、观察什么、如何判断孩子是否投入」。禁止空泛鸡汤，禁止教育指导。
11. 不要添加总结、免责声明或额外段落。`
}

function formatShiShenCounts(counts: Record<string, number>): string {
  return Object.entries(counts)
    .filter(([k]) => k !== '日主')
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}:${v}`)
    .join('、')
}

function formatDimensionScores(scores: Record<string, number>): string {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${getDimensionMeta(k as any)?.labels['zh-CN'] || k}:${v}`)
    .join('、')
}

function buildUserPrompt(result: ChildActivityInterestCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const p = result.profile
  const dimLabel = result.portrait.primaryLabel
  const secLabel = result.portrait.secondaryLabel

  return `请为以下孩子活动兴趣测试结果生成两段式解读：

【孩子信息】
- 姓名：${p.name || '未填写'}
- 出生日期：${p.birthDate}
- 时辰：${p.birthHour || '未知'}
- 性别：${p.gender === 'male' ? '男' : '女'}
- 日主：${result.chart.riZhu}

【十神统计】
${formatShiShenCounts(result.chart.shishenCounts)}

【活动维度分数】（满分100，分数越高表示该类型活动越容易让孩子投入）
${formatDimensionScores(result.dimensionScores)}

【主导活动维度】
- 主要维度：${dimLabel}${secLabel ? `（次要维度：${secLabel}）` : ''}

【已生成的活动倾向画像】
${result.portrait.scenario}

【已生成的在家观察活动建议】
${result.portrait.activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}

请严格按以下结构输出两段，并用更自然、轻松的语言重新组织，不要直接复制上面的原文：
## 孩子的活动倾向画像
## 家长可以在家尝试的小活动

${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: ChildActivityInterestCalcResult
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
