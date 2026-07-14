import { defineEventHandler, readBody, createError, setResponseHeaders } from 'h3'
import type { NamingResult } from '~~/server/utils/baby-naming/engine'

interface ReadingInput {
  surname: string
  gender: 'male' | 'female' | 'neutral'
  chart: NamingResult['chart']
  name: NamingResult['names'][number]
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
  return `你是「幽默隐士」：一位久居深山、看淡世事、却偶尔下山给人起名的老先生。你的解读机智、温暖、带一点善意的调侃，但绝不说教、不贬低任何人，也不替名字主人预言吉凶。
${langHook.system}

## 约束（必须严格遵守）

1. 只做文化、语言学与传统命理的趣味解读，不做任何医疗、心理或人生重大决策建议。
2. 不预测具体流年、大运、吉凶日期；不保证名字能带来好运或厄运。
3. 语气轻松幽默，可以自嘲，可以玩梗，但保持善意与尊重。
4. 如果名字里有明显不雅谐音，温和地指出来，但不嘲笑。
5. 严格按以下 6 个段落输出，每段以 ## 开头，不要添加额外段落：

## 名字初印象
一两句话说说这个名字给你的第一感觉：读起来顺不顺、有没有画面感、像什么样的人。

## 八字五行浅聊
用通俗的话解释这个名字的五行属性与宝宝八字喜用神的关系。不要堆术语，像跟邻居家阿姨聊天一样说清楚。

## 音律字形小评
点评读音的声调搭配、字形结构是否协调，有没有好听的节奏感。

## 寓意与出处
解释名字中每个字的含义和出处（如果提供了典故），用一两个生活化的比喻说明。

## 隐士的碎碎念
一段轻松调侃：假如宝宝带着这个名字长大，可能会遇到什么有趣的场景或外号。语气放轻松，可以自嘲。

## 温馨提示
一句话提醒：起名是文化趣味与心意表达，不能决定人生，仅供参考。轻松收尾，不板着脸。

6. 全文控制在 350~550 字之间，不要输出免责声明以外的额外内容。`
}

function buildUserPrompt(input: ReadingInput, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const { chart, name } = input

  const wuxingLine = Object.entries(chart.wuxingScore)
    .map(([k, v]) => `${k}${v}%`)
    .join(' ')

  const boostLine = name.wuxingBoost
    .map(b => `${b.element}${b.matched ? '✓' : '✗'}`)
    .join(' ')

  const wugeLine = `天格${name.wuge.tiange}(${name.wuge.tiangeFortune}) 人格${name.wuge.renge}(${name.wuge.rengeFortune}) 地格${name.wuge.dige}(${name.wuge.digeFortune}) 外格${name.wuge.waige}(${name.wuge.waigeFortune}) 总格${name.wuge.zongge}(${name.wuge.zonggeFortune})`

  const charDetails = name.chars
    .map(c => `${c.char}（${c.pinyin}，${c.wuxing}，${c.simplifiedStrokes}画，${c.structure}结构）：${c.meaning} 出处：${c.source}`)
    .join('\n')

  return `【宝宝信息】
姓氏：${input.surname}
性别倾向：${input.gender === 'male' ? '男孩' : input.gender === 'female' ? '女孩' : '中性'}

【八字命盘】
四柱：${chart.pillars.year} ${chart.pillars.month} ${chart.pillars.day} ${chart.pillars.hour ?? '未知'}
日主：${chart.riZhu}（${chart.riZhuStrength}）
格局：${chart.geju}
五行分布：${wuxingLine}
喜用神：${chart.xiyong} | 忌神：${chart.jishen}
命理简析：${chart.baziBrief}

【推荐名字】${name.fullName}（${name.pinyin}）
综合评分：${name.score}分（${name.scoreGrade}）
五行补益：${boostLine}
寓意摘要：${name.meaningSummary}
出处摘要：${name.sourceSummary}
谐音风险：${name.homophoneRisk} ${name.homophoneNotes.join('；')}
五格数理：${wugeLine}（整体：${name.wuge.overallLuck}）
分项评分：八字${name.breakdown.baziWuxing.score}/${name.breakdown.baziWuxing.max} 音律${name.breakdown.phonetics.score}/${name.breakdown.phonetics.max} 字形${name.breakdown.structure.score}/${name.breakdown.structure.max} 寓意${name.breakdown.meaning.score}/${name.breakdown.meaning.max} 避讳${name.breakdown.tabooRisk.score}/${name.breakdown.tabooRisk.max} 风格${name.breakdown.styleMatch.score}/${name.breakdown.styleMatch.max}

【名字逐字解析】
${charDetails}

请按 system prompt 中规定的 6 段结构，为这个名字生成「幽默隐士」风格的趣味解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ReadingInput>(event)

  if (!body?.surname || !body?.name || !body?.chart) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
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
