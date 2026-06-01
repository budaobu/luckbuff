import type { HuangdaoDay } from '~/types/huangdao'
import type { DiZhi } from '~/types/user'

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
  return `你是一位精通中国传统择日学的资深命理师，擅长根据黄历信息和个人生辰为用户挑选最适合的吉日吉时。
${langHook.system}

## 输出格式要求

你的输出必须是 Markdown 格式，严格按以下结构组织：

【第一步】先输出一行总体判断（一句话概括）：
<!-- summary: 总体择日判断 -->

【第二步】按以下顺序输出 4 个分析段落，每个段落以 ## 标题开头：

## 择日总论 / Overview
...

## 最佳吉日推荐 / Top Dates
...

## 择日建议 / General Advice
...

## 忌讳提醒 / Things to Avoid
...

【重要约束】
- 每个段落 3~5 句话，简明扼要
- 结合用户生辰与黄历信息有针对性地分析，不要泛泛而谈
- 禁止断言绝对结果，禁止使用"确保""一定""必定"等绝对化措辞
- 语言风格：古雅精炼，像资深命理师简要点评
- 不要在输出末尾添加免责声明、总结或"以上分析..."之类的收尾话术，前端会独立显示免责声明
- 预测结果仅供娱乐参考`
}

function buildUserPrompt(
  days: HuangdaoDay[],
  profile: { name?: string; gender: string; birthDate: string; birthHour?: DiZhi },
  matter: string,
  locale: string,
): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

  const daysText = days.map(d => {
    const yiStr = d.yi.join('、') || '无'
    const jiStr = d.ji.join('、') || '无'
    const jishenStr = d.jiShen.join('、') || '无'
    return `- ${d.date}（${d.week}）${d.dayGanZhi}日 · ${d.naYin} · 值神${d.tianShen}（${d.tianShenLuck}）
    宜：${yiStr}
    忌：${jiStr}
    吉神：${jishenStr}
    匹配度：${d.matchScore}分`
  }).join('\n')

  const hour = profile.birthHour
    ? {
        子: '23:00-01:00', 丑: '01:00-03:00', 寅: '03:00-05:00', 卯: '05:00-07:00',
        辰: '07:00-09:00', 巳: '09:00-11:00', 午: '11:00-13:00', 未: '13:00-15:00',
        申: '15:00-17:00', 酉: '17:00-19:00', 戌: '19:00-21:00', 亥: '21:00-23:00',
      }[profile.birthHour] || ''
    : ''

  return `请为以下用户提供黄道吉日择日分析：

【用户信息】
- 姓名：${profile.name || '未提供'}
- 性别：${profile.gender === 'male' ? '男' : '女'}
- 生辰：${profile.birthDate}${hour ? ' ' + hour : ''}

【择日事项】
${matter || '一般性吉日选择'}

【候选吉日】（已按黄历宜忌初步筛选）
${daysText}

请从候选吉日中选出最适合此用户的最佳日期，给出推荐理由和推荐时辰。

${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const { days, profile, matter = '', locale = 'zh-CN' } = await readBody<{
    days: HuangdaoDay[]
    profile: { name?: string; gender: string; birthDate: string; birthHour?: DiZhi }
    matter?: string
    locale?: string
  }>(event)

  if (!days || !Array.isArray(days) || days.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Missing days data' })
  }

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(days, profile, matter, locale)

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
