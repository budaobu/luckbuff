import type { QuestionType, TaiyiChartResult } from '../../../utils/taiyi/types'

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

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  career: '事业',
  wealth: '财运',
  love: '感情',
  health: '健康',
  travel: '出行',
  other: '其他',
}

const QUESTION_FOCUS: Record<QuestionType, string> = {
  career: '事业方向重点参看天符、青龙、文昌三神。天符主权威与机会，青龙主变动与进取，文昌主文书与贵人。',
  wealth: '财运方向重点参看天符、太阴、神光三神。天符主财源机会，太阴主积蓄与暗中助力，神光主灵光与转折。',
  love: '感情方向重点参看咸池、太阴、天一三神。咸池主桃花与情欲，太阴主温柔与暗藏，天一主专一与守护。',
  health: '健康方向重点参看死武、太阳、太乙三神。死武主病厄与损耗，太阳主阳气与恢复，太乙主根本与元神。',
  travel: '出行方向重点参看斗杓、迁神、青龙三神。斗杓主方向与引路，迁神主迁移与变动，青龙主行程顺逆。',
  other: '其他事项以太乙宫为根本，辅以十六神吉凶分布综合论断。',
}

function getPalaceLabel(palace: number): string {
  const labels: Record<number, string> = {
    1: '坎一（北）',
    2: '坤二（西南）',
    3: '震三（东）',
    4: '巽四（东南）',
    5: '中五（寄坤二）',
    6: '乾六（西北）',
    7: '兑七（西）',
    8: '艮八（东北）',
    9: '离九（南）',
  }
  return labels[palace] ?? `宫${palace}`
}

function formatGods(gods: { name: string; palace: number; nature: string }[]): string {
  return gods.map(g => `- ${g.name}：${getPalaceLabel(g.palace)}，${g.nature}`).join('\n')
}

function formatKeySpirits(chart: TaiyiChartResult['yearChart']): string {
  return `- 太乙：${getPalaceLabel(chart.keySpirits.taiyiGong)}
- 计神：${getPalaceLabel(chart.keySpirits.jiShenGong)}
- 文昌：${getPalaceLabel(chart.keySpirits.wenChangGong)}
- 天目：${getPalaceLabel(chart.keySpirits.tianMuGong)}
- 地目：${getPalaceLabel(chart.keySpirits.diMuGong)}`
}

function formatChart(chart: TaiyiChartResult['yearChart'], label: string): string {
  return `【${label}】
太乙宫：${getPalaceLabel(chart.taiyiGong)}
阴阳局：${chart.yinYangJu}${chart.juNumber}局
超神接气：${chart.chaoShenJieQi.state}（72年周期位 ${chart.chaoShenJieQi.cyclePosition}，一局内第 ${chart.chaoShenJieQi.juYearPosition} 年）
主要神将：
${formatKeySpirits(chart)}
十六神分布：
${formatGods(chart.gods)}`
}

function buildSystemPrompt(locale: string, questionType: QuestionType): string {
  const langHook = (LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN'])!
  return `你是一位太乙神数占事解读师。你根据用户输入的出生/占问时间所推演出的年、月、日、时四盘太乙九宫，结合具体问事类型，给出针对性强、文风古雅而不失白话的占断。
${langHook.system}

## 太乙神数十六神基础知识
- 太乙：吉，为诸神之主，主根本、元神、大势。
- 摄提：凶，主阻滞、惊扰、外来压力。
- 轩辕：吉，主贵显、文明、名声。
- 招摇：凶，主虚惊、变动、小人。
- 天符：吉，主权威、机遇、财禄。
- 青龙：吉，主进取、变动、行程。
- 咸池：凶，主桃花、情欲、是非。
- 太阴：吉，主阴柔、暗藏、积蓄、贵人。
- 天一：吉，主守护、专一、安稳。
- 地一：中，主根基、潜伏、蓄势。
- 文昌：吉，主文书、学业、贵人、功名。
- 太阳：吉，主光明、阳气、恢复、显露。
- 神光：吉，主灵光、转折、顿悟、机缘。
- 迁神：中，主迁移、变动、往来。
- 死武：凶，主病厄、损耗、终结、阻碍。
- 斗杓：中，主方向、引路、时序。

## 问事类型侧重
${QUESTION_FOCUS[questionType]}

## 约束（必须严格遵守）
1. 解读必须围绕问事类型展开，不得做泛泛排盘解说。
2. 输出四段，顺序固定：
   - 总论：以四盘太乙宫与超神接气状态定大势。
   - 太乙宫主断：以太乙所在宫为核心，论断此事根本趋势。
   - 与问事相关的神将论断：结合问事类型侧重的神将给出方向。
   - 时间节点提示：给出大致时间窗口或节气提示，禁止绝对化日期。
3. 每段 80-120 字，语言为白话文，略带古风气质，不晦涩。
4. 允许趋势判断，禁止绝对命运预言、具体金额、姓名、可验证日期。
5. 不要输出“## 总论”等标题，直接输出四段正文，段间空一行。

【重要】只输出四段正文，不要总结、不要建议、不要额外 disclaimers。`
}

function buildUserPrompt(chart: TaiyiChartResult, question: string, questionType: QuestionType, locale: string): string {
  const langHook = (LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN'])!
  const typeLabel = QUESTION_TYPE_LABELS[questionType]

  return `请为以下太乙神数排盘结果做占事解读。

【所问事项】
${question}

【问事类型】
${typeLabel}

【四柱干支】
年柱：${chart.pillars.year}
月柱：${chart.pillars.month}
日柱：${chart.pillars.day}
时柱：${chart.pillars.hour}

【积年信息】
积年数：${chart.accumulatedYears.accumulatedYears}
基元：${chart.accumulatedYears.baseYearNote}

【四盘盘面】
${formatChart(chart.yearChart, '年局')}

${formatChart(chart.monthChart, '月局')}

${formatChart(chart.dayChart, '日局')}

${formatChart(chart.hourChart, '时局')}

请按 总论 → 太乙宫主断 → 与问事相关的神将论断 → 时间节点提示 的顺序输出四段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    chart: TaiyiChartResult
    question: string
    questionType: QuestionType
    locale?: string
  }>(event)

  if (!body?.chart || !body.question || !body.questionType) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chart, question or questionType' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale, body.questionType)
  const userPrompt = buildUserPrompt(body.chart, body.question, body.questionType, locale)

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
