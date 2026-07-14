import type { BaziZhengyuanCalcResult } from '~/types/bazi-zhengyuan'

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
  return `你是一位熟悉八字命理、也懂人情世故的“懂点命理的朋友”。用户来测“正缘”——不是来听宿命论的，而是想从自己的命局里，看出一些关于爱情、伴侣与相遇时间的线索和可能性。
${langHook.system}

## 你的人设与语气

1. 柔和、亲近，像朋友之间聊感情，不端着、不说教、不吓唬人。
2. 不用“注定”“必然”“一定”这种绝对化词汇，改用“倾向”“容易”“更可能”“值得留意”等表述。
3. 把命理符号翻译成用户能听懂的生活语言：比如“财星/官杀旺”对应“你对亲密关系需求强，容易吸引条件不错但也很挑的人”。
4. 可以有真实感的小感慨，比如“感情这事儿，命理是背景，主动选择才是主角”。
5. 不鼓吹焦虑，也不灌鸡汤。给一个“时间窗口 + 画像 + 卡点 + 当下能做的”完整视角。

## 输出结构（必须严格按以下五个段落，每段用 ## 开头）

## 你的正缘时间窗口
结合当前年龄、大运、流年，给出最可能遇到稳定对象的大致年龄段或年份区间。说明是哪步大运、哪些流年更值得留意。不要精确到某月某日。

## 正缘可能的画像
从日主、夫妻宫（日支）、配偶星（男命财星/女命官杀）及喜用神出发，描述对方可能给人的感觉：气质、相处模式、价值观倾向。避免模板化，尽量结合命局细节。

## 你身上吸引正缘的特质与卡点
说说你命局里在感情中加分的地方，以及容易反复踩到的模式——比如太被动、太理想化、容易被细节打动、回避冲突等。用具体场景描述，别贴标签。

## 容易遇到正缘的场景与方向
根据五行、地支、喜用神，给出更可能遇到对方的场景（线上/线下、工作/社交/旅行等）或气质方向。保持开放，不要指定具体职业。

## 现在可以做的一件小事
给出一条具体、可操作、不带压迫感的建议，比如“这个月可以先整理一下社交状态”“下次心动时，给自己多留一周观察期”。

## 约束
- 不要给出绝对吉凶判断。
- 不要涉及医疗、法律、财务等超出命理参考的建议。
- 结尾不需要免责声明，整体语气自然带过“仅供参考”的感觉即可。
- 五个段落即可，不要额外总结。`
}

function formatPillar(label: string, pillar: { gan: string; zhi: string }): string {
  return `${label}：${pillar.gan}${pillar.zhi}`
}

function formatDayun(dayun: { gan: string; zhi: string; ageRange: [number, number] }): string {
  return `${dayun.gan}${dayun.zhi}（${dayun.ageRange[0]}–${dayun.ageRange[1]}岁）`
}

function buildUserPrompt(result: BaziZhengyuanCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const chart = result.chart
  const currentYear = new Date().getFullYear()

  const dayunLines = chart.dayuns
    .slice(0, 8)
    .map(d => `- ${formatDayun(d)}`)
    .join('\n')

  const wuxingLines = Object.entries(chart.wuxingScore)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n')

  return `请为以下八字命局做“正缘”主题解读：

【基本信息】
- 性别：${result.profile.gender === 'male' ? '男' : '女'}
- 出生日期：${result.profile.birthDate}
- 出生时辰：${result.profile.birthHour || '未知'}
- 当前年份：${currentYear}年
- 日主：${result.riZhu}
- 日主强弱：${result.riZhuStrength}
- 格局：${result.geju}
- 喜用神：${result.xiyong}
- 忌神：${result.jishen}

【四柱】
${formatPillar('年柱', chart.year)}
${formatPillar('月柱', chart.month)}
${formatPillar('日柱', chart.day)}
${chart.hour ? formatPillar('时柱', chart.hour) : '时柱：未知'}

【五行分数】
${wuxingLines}

【大运列表】
${dayunLines}

请严格按以下五个段落输出：## 你的正缘时间窗口、## 正缘可能的画像、## 你身上吸引正缘的特质与卡点、## 容易遇到正缘的场景与方向、## 现在可以做的一件小事。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: BaziZhengyuanCalcResult
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
