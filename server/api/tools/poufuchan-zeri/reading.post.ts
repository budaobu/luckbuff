import type { DiZhi } from '~/types/user'

interface RankedCandidate {
  rank: number
  date: string
  lunarDate: string
  dayGanZhi: string
  week: string
  dizhi: DiZhi
  timeRange: string
  hourGanZhi: string
  tianShen: string
  tianShenType: '黄道' | '黑道'
  dayScore: number
  hourScore: number
  totalScore: number
  tags: string[]
}

interface PersonResult {
  birthDate: string
  birthHour: DiZhi | null
  pillars: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  shengXiao: string
}

interface ScoredDay {
  date: string
  lunarDate: string
  dayGanZhi: string
  shengXiao: string
  tianShen: string
  tianShenLuck: string
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  chongDesc: string
  week: string
  dayScore: number
}

interface CalcResult {
  window: { startDate: string; endDate: string }
  mother: PersonResult
  father: PersonResult
  days: ScoredDay[]
  ranked: RankedCandidate[]
  best: RankedCandidate
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
  return `你是「幽默隐士」——久居深山、看淡世事的老先生，精通八字择日与黄历宜忌。机智温暖，偶尔带一句善意的调侃，但分寸得体。基于 deterministic 的择日打分结果，为待产家庭解读剖腹产候选时辰。
${langHook.system}

## 角色与语气
- 隐士口吻，结论先行，温暖、幽默、不恐吓，避免绝对化断言
- 所有内容仅为传统文化参考，绝不提供医学建议
- 必须明确提示：最终手术时间以主治医生医嘱和医院安排为准

## 输出协议（严格逐行输出，每行一个字段，不要任何额外标题、解释或总结）
用下面的行格式逐字段输出，每行以指定前缀开头、紧跟内容、单独成行：

OV: 整体概述一句（点名预产期窗口、父母生肖与宝宝候选日子的配合，定基调）
BEST: 最优推荐时刻一句话点评（必须点名公历日期、时辰干支与得分亮点，如「BEST: 9月3日壬辰时 · 时干生日干、黄道金匮值时，山中老人最看好这一刻」）
TIP: 一条锦囊（针对高分候选时段的实用提示或温和调侃，共 3 条，每条单独一行、都以「TIP: 」开头）
NOTE: 温馨提示一句（强调谨遵医嘱、以医院安排为准，工具仅供文化参考）

## 约束
- 严格遵守上面的行前缀：OV: / BEST: / TIP: / NOTE:，前缀后空一格再写内容
- 每行内容整行不换行、不加粗体、不加 markdown 标记
- 忌用绝对化断言，用"较宜""可参考""需留意"等柔和措辞
- 必须引用计算结果中的具体数据（日期、干支、分数、标签），不编造
- 不评论胎儿性别、健康、命运优劣等医学或宿命话题
- 除上述行之外不输出任何其它内容`
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!

  const top = result.ranked.slice(0, 8)
  const topText = top.map(c =>
    `第${c.rank}名：${c.date}（${c.week}，${c.lunarDate}）${c.dizhi}时 ${c.timeRange} ${c.hourGanZhi}时 · ${c.tianShenType}${c.tianShen} · 总分${c.totalScore}（日${c.dayScore}/时${c.hourScore}）${c.tags.length ? ' · ' + c.tags.join('、') : ''}`,
  ).join('\n')

  const best = result.best
  const bestDay = result.days.find(d => d.date === best.date)

  return `预产期窗口：${result.window.startDate} 至 ${result.window.endDate}

母亲：${result.mother.birthDate} 生（生肖${result.mother.shengXiao}），四柱 ${result.mother.pillars.year.gan}${result.mother.pillars.year.zhi}年 ${result.mother.pillars.month.gan}${result.mother.pillars.month.zhi}月 ${result.mother.pillars.day.gan}${result.mother.pillars.day.zhi}日
父亲：${result.father.birthDate} 生（生肖${result.father.shengXiao}），四柱 ${result.father.pillars.year.gan}${result.father.pillars.year.zhi}年 ${result.father.pillars.month.gan}${result.father.pillars.month.zhi}月 ${result.father.pillars.day.gan}${result.father.pillars.day.zhi}日

【AI 推荐最优时刻】
${best.date}（${best.week}，${best.lunarDate}，${best.dayGanZhi}日）${best.dizhi}时 ${best.timeRange}（${best.hourGanZhi}时，${best.tianShenType}${best.tianShen}值时），总分 ${best.totalScore}
当日宜：${bestDay?.yi.join('、') || '无'}
当日忌：${bestDay?.ji.join('、') || '无'}
当日吉神：${bestDay?.jiShen.join('、') || '无'}
亮点标签：${best.tags.join('、') || '无'}

【候选时辰榜单（前 8 名）】
${topText}

请按系统提示要求的结构输出择日解读。${langHook.user}`
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
