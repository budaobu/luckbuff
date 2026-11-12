import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'
import { calculateBaziChartResult } from '~~/server/utils/tools/bazi-chart'
import { getAuthSession } from '~~/server/utils/auth-session'
import {
  buildBaziChenyu,
  buildBaziTopicFallback,
  buildBaziTopicLens,
  isBaziPaipanTopic,
  type BaziPaipanTopic,
  type BaziTopicLens,
} from '~~/server/utils/tools/bazi-paipan-topic-lens'
import type { TodayAlmanac } from '~/types/today-almanac'
import { $fetch } from 'ofetch'
import {
  resolveBaziLensDate,
  validateBaziBirthInput,
  type BaziPaipanBirthInput,
} from './lens.post'

type InterpretMode = 'target' | 'full' | 'topic'

interface InterpretTarget {
  selector?: string
  label?: string
  section?: string
  group?: string
  content?: string
}

interface InterpretBody {
  mode?: InterpretMode
  chart?: BaziChartResult
  chartContext?: string
  target?: InterpretTarget
  locale?: 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko'
  topic?: string
  date?: string
  birth?: BaziPaipanBirthInput
}

type Locale = NonNullable<InterpretBody['locale']>

const LANGUAGE_HOOKS: Record<Locale, { system: string; user: string; limit: string }> = {
  'zh-CN': {
    system: '请使用简体中文输出。',
    user: '请使用简体中文输出所有内容。',
    limit: '控制在 140-220 个汉字。',
  },
  'zh-TW': {
    system: '請使用繁體中文輸出。',
    user: '請使用繁體中文輸出所有內容。',
    limit: '控制在 140-220 個漢字。',
  },
  en: {
    system: 'Please output in English.',
    user: 'Please output all content in English.',
    limit: 'Use 90-150 English words.',
  },
  ja: {
    system: '日本語で出力してください。',
    user: 'すべて日本語で出力してください。',
    limit: '140〜220字程度にしてください。',
  },
  ko: {
    system: '한국어로 출력해 주세요.',
    user: '모든 내용을 한국어로 출력해 주세요.',
    limit: '140~220자 정도로 작성하세요.',
  },
}

function languageHook(locale?: string) {
  return LANGUAGE_HOOKS[(locale || 'zh-CN') as Locale] ?? LANGUAGE_HOOKS['zh-CN']!
}

function buildSystemPrompt(mode: InterpretMode, locale: string) {
  const lang = languageHook(locale)
  const shared = `你是命盘室的掌柜，负责把八字结构讲成能用的当日建议。
风格：结论先行、简短口语、有一点干幽默；不装文言，不卖焦虑。
边界：只依据服务端给的切片，不编造黄历、神煞或宜忌；不恐吓，不断言生死、疾病、破财，不用绝对化断语。${lang.system}`

  if (mode === 'topic') {
    return `${shared}

输出一段尝鲜版解读，直接进入正文；不要标题、列表、提问、开场白或总结。${lang.limit}`
  }

  if (mode === 'target') {
    return `${shared}

这次只解读用户指定的命盘元素：先给一句结论，再说明结构原因，最后给一句现实校准。
输出一段 60-120 字的纯文本；不要标题、列表、提问、复述标签，也不要展开其他命盘部分。`
  }

  return `${shared}

请生成完整八字命盘分析报告。输出 900-1500 字纯文本，按以下标签逐行分段，标签后换行：
总论：
性格与结构：
事业：
财富：
感情：
健康与节奏：
大运流年：
行动清单：

每段必须绑定命盘证据；行动清单用 2-4 行“- ”开头。不要 JSON、Markdown 标题、代码块或多余开场白。`
}

function buildTargetPrompt(body: InterpretBody, locale: Locale) {
  const lang = languageHook(locale)
  const context = (body.chartContext || '').slice(0, 22000)
  const target = body.target || {}
  const label = (target.label || '命盘元素').slice(0, 160)
  const section = (target.section || '命盘').slice(0, 120)
  const group = (target.group || '').slice(0, 120)
  const content = (target.content || '').slice(0, 2600)

  return `请解读以下八字命盘元素。

【所在区域】${section}${group ? ` / ${group}` : ''}
【元素标签】${label}
【元素内容】${content}

【命盘摘要】
${context}

只解读该元素与命局的直接关系，忽略无关部分。${lang.user}`
}

function buildTargetFallback(body: InterpretBody, locale: Locale) {
  const label = (body.target?.label || '命盘元素').slice(0, 120)
  const evidence = (body.target?.content || body.chartContext || '').replace(/\s+/g, ' ').slice(0, 180)
  const templates: Record<Locale, (label: string, evidence: string) => string> = {
    'zh-CN': (label, evidence) => `${label}的结构含义是：${evidence}。建议只调整一件与它直接相关的事。`,
    'zh-TW': (label, evidence) => `${label}的結構含義是：${evidence}。建議只調整一件與它直接相關的事。`,
    en: (label, evidence) => `${label} means: ${evidence}. Adjust one directly related part today.`,
    ja: (label, evidence) => `${label}の構造的意味：${evidence}。今日は関連する一つだけ調整しましょう。`,
    ko: (label, evidence) => `${label}의 구조적 의미: ${evidence}. 오늘은 직접 관련된 한 가지만 조정하세요.`,
  }
  return templates[locale](label, evidence)
}

function buildFullPrompt(body: InterpretBody, locale: Locale) {
  const lang = languageHook(locale)
  return `请基于以下完整八字命盘摘要，生成全盘 AI 分析报告。

【完整命盘】
${(body.chartContext || '').slice(0, 22000)}

请覆盖全部结构信号、五行十神、格局喜忌、关系与神煞，并给出现实化行动建议。${lang.user}`
}

function buildTopicPrompt(lens: BaziTopicLens, locale: Locale) {
  const lang = languageHook(locale)
  return `请基于以下服务端切片，生成该题的今日尝鲜版解读。

${lens.aiContext}

要求：先给结论，再给一条现实校准；引用至少两个切片证据；不要输出“服务端切片”这个词。${lang.user}`
}

function validateChart(chart: BaziChartResult | undefined) {
  return !!chart
    && Array.isArray(chart.pillars)
    && chart.pillars.length === 4
    && !!chart.energy
    && !!chart.pattern
    && Array.isArray(chart.dayuns)
}

async function resolveTopicLens(body: InterpretBody, topic: BaziPaipanTopic) {
  validateBaziBirthInput(body.birth!)
  const date = resolveBaziLensDate(body.date)
  const chart = await calculateBaziChartResult({
    birthDate: body.birth!.birthDate,
    birthHour: body.birth!.birthHour as any,
    gender: body.birth!.gender,
    location: body.birth!.location?.name ? body.birth!.location : null,
  })
  const almanac = await $fetch<TodayAlmanac>('/api/tools/jinri-huangli/calc', {
    method: 'POST',
    body: { date },
  }).catch(() => undefined)

  return buildBaziTopicLens({ chart, topic, date, almanac })
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InterpretBody>(event)
  const topic = isBaziPaipanTopic(body?.topic) ? body.topic : null
  const mode: InterpretMode = topic ? 'topic' : body?.mode === 'full' ? 'full' : 'target'
  let topicLens: BaziTopicLens | null = null

  if (topic) {
    topicLens = await resolveTopicLens(body!, topic)
  }
  else if (!validateChart(body?.chart)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid Bazi chart' })
  }
  if (mode === 'target' && !body?.target?.label?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing interpretation target' })
  }
  if (mode === 'full') {
    const session = await getAuthSession(event)
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: 'Sign in to view the full report' })
    }
  }

  const locale = body!.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  const configuredTokens = Number(config.aiMaxTokens) || 8192
  const maxTokens = Math.min(mode === 'full' ? 12000 : mode === 'topic' ? 520 : 2048, configuredTokens)
  const systemPrompt = buildSystemPrompt(mode, locale)
  const userPrompt = mode === 'topic' && topicLens
    ? buildTopicPrompt(topicLens, locale)
    : mode === 'full'
      ? buildFullPrompt(body!, locale)
      : buildTargetPrompt(body!, locale)

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
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  const res = event.node.res
  res.socket?.setNoDelay?.(true)

  const emit = (payload: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
    if ('flush' in res && typeof (res as any).flush === 'function') {
      ;(res as any).flush()
    }
  }

  const emitFallback = () => {
    if (mode === 'topic' && topicLens) {
      emit({ type: 'reading', text: buildBaziTopicFallback(topicLens) })
      return
    }
    if (mode === 'target') {
      emit({ type: 'text', text: buildTargetFallback(body!, locale) })
      return
    }
    emit({ type: 'error', message: 'AI 服务暂不可用' })
  }

  if (topicLens) emit({ type: 'chenyu', text: buildBaziChenyu(topicLens.topic, topicLens) })

  let upstream: Response
  let receivedReading = false
  try {
    upstream = await fetch(config.aiBaseUrl as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.aiApiKey}`,
      },
      body: JSON.stringify(upstreamBody),
      signal: AbortSignal.timeout(18000),
    })
  }
  catch (error) {
    emitFallback()
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  if (!upstream.ok || !upstream.body) {
    emitFallback()
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
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue

        try {
          const chunk = JSON.parse(payload)
          const token = isOpenAi
            ? chunk.choices?.[0]?.delta?.content
            : (chunk.response ?? chunk.choices?.[0]?.delta?.content)
          if (token) emit({ type: mode === 'topic' ? 'reading' : 'text', text: token })
          receivedReading = true
        }
        catch { /* Ignore provider keep-alive lines. */ }
      }
    }
  }
  catch (error) {
    if (receivedReading) {
      emit({ type: 'error', message: `读取 AI 流失败：${error instanceof Error ? error.message : error}` })
    }
  }
  finally {
    if (!receivedReading) emitFallback()
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
