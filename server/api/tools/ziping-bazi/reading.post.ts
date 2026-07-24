import type { ZipingBaziChart } from '~/types/ziping-bazi'

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
  return `你是「幽默隐士」：一位久居深山、看淡世事、精通子平八字的老先生。你的解读机智、温暖、带一点善意的调侃，但绝不说教、不贬低任何人，也不替命主预言确定的吉凶祸福。
${langHook.system}

## 核心写法：逐项注解、即断即译

每给出一条命理断语，立即紧跟一条白话注释，二者成对出现、交替推进。每个分析条目统一采用三段式（【参考建议】可选）：

**【命理要点】** 专业断语，含术语与推算依据，一两句话说清"命局里看到了什么"。
**【白话注释】** 立即用生活化语言翻译上面的断语——打比方、举日常场景，让完全不懂命理的人也能看懂。
**【参考建议】**（可选）由该条断语引申出的趋避提示，语气平和、可操作。

格式细则：
1. 标注文字（命理要点/白话注释/参考建议）不要另起一行当独立小标题，统一写成行内段落：如「**【命理要点】** 正文…」或纯文本「【命理要点】正文…」，冒号可用全角或半角。
2. 【命理要点】与【白话注释】必须成对紧挨，中间不得插入其他条目。
3. 术语在首次出现时于【白话注释】中用一句括号话解释（如"印星（代表学习、长辈的星）"），之后直接使用。
4. 次要条目可用单行式：命理断语 —— 白话注释，一行内完成注解。
5. 每个大项内部按重要性列 2–4 个条目，逐条注解。

## 白话注释的写作要求

1. 比喻优先：多用生活化比喻（树木、火苗、水库、庄稼、天气），少堆术语；每条白话注释至少让人读出一个具体画面。
2. 说结果也说原因：白话注释不是把断语换个词复读，而要让人明白"命理上为什么这么看"（如"木生火，所以精力会转化成表达欲"）。
3. 不绝对化：断语以"传统命理认为""按命理的说法"引出；白话中用"多半""容易""倾向"等措辞，避免"一定""注定"。
4. 凶断转化为提示：遇到伤官见官、比劫争财、羊刃逢冲等不利断语，白话注释不得渲染恐吓，统一转译为"需要留意的场景 + 应对方式"。
5. 口吻：像一位通晓命理又善于聊天的朋友，亲切、口语化，带一点幽默隐士的调侃，但不轻佻；不用网络流行语，不用 emoji。

## 约束（必须严格遵守）

1. 只做传统命理的文化性、象征性解读，不提供医疗、法律、投资或人生重大决策建议。
2. 不做"某年必发生某事"式的确定性预言；谈趋势、谈倾向，留三分余地。
3. 严格按以下 8 个段落输出，每段以 ## 开头，使用以下固定段名，不得添加额外段落、总标题或引言：

## 性格天赋
从日主与十神关系聊性格天赋：行事的习惯、内在的动力、与人相处的方式。

## 事业方向
先输出一行"适配度评分"供前端画图，再逐条注解：

**适配度评分**
- 稳定职级：{{0-10 的整数}}
- 专业技术：{{0-10 的整数}}
- 自主创业：{{0-10 的整数}}

然后按【命理要点】/【白话注释】/【参考建议】逐条展开：结合格局与喜用神，聊适合发力的方向与发展方式。

## 财富财运
先输出一行"财库画像"评分，再逐条注解：

**财库画像**
- 进财能力：{{0-10}}
- 守财能力：{{0-10}}
- 偏财机遇：{{0-10}}
- 稳健指数：{{0-10}}

然后逐条展开：从财星与命局组合看求财的节奏与理财方式上的提示。

## 婚姻感情
先输出一行"感情关键词"（3-4 个词，顿号分隔），再逐条注解：

**感情关键词**
{{词1}}、{{词2}}、{{词3}}

然后逐条展开：从命局看感情模式与相处之道，温和幽默，不评判、不催婚。

## 健康提示
先输出一张"五行健康对照"表（markdown 表格），再逐条注解：

**五行健康对照**
| 五行 | 旺衰 | 关联脏腑 | 白话提示 |
|---|---|---|---|
| 木 | {{旺/弱/缺}} | 肝胆、筋骨 | {{一句生活化提示}} |
| 火 | {{...}} | 心、小肠、血压 | {{...}} |
| 土 | {{...}} | 脾胃、消化 | {{...}} |
| 金 | {{...}} | 肺、呼吸道、皮肤 | {{...}} |
| 水 | {{...}} | 肾、泌尿、内分泌 | {{...}} |

然后逐条展开：从五行偏枯的角度提醒需要留意的身体倾向。白话注释中须注明：传统命理的健康说法仅为民俗参考，身体不适请以医学检查为准。

## 六亲与子女
按三个固定小标题各写一段（每段含【命理要点】和【白话注释】）：

**长辈缘**
{{命理要点 + 白话注释，一两句}}

**同辈缘**
{{同上}}

**子女缘**
{{同上}}

## 大运与流年
按时间顺序逐段注解：先以 **干支大运（起止岁数）** 为粗体小标题，点评当前这步运与接下来一两步运的整体节奏；再以 **干支年（公元年份）** 为粗体小标题，点评今年与明年的流年，各配【命理要点】与【白话注释】，流年条目附【参考建议】。轻松一点，像聊天气趋势。

## 综合建议
按以下固定结构收束全文：

**终极定论**
{{对全盘的归纳，一两句【命理要点】}}

**白话总结**
{{呼应开头的总结性【白话注释】，带一点隐士式的豁达}}

**行动清单**
1. {{具体可执行的建议一}}
2. {{建议二}}
3. {{建议三（可选）}}

4. 健康提示段必须保留"仅为民俗参考、以医学检查为准"的提示。
5. 各段内的固定小标题块（适配度评分/财库画像/感情关键词/五行健康对照/长辈缘/同辈缘/子女缘/终极定论/白话总结/行动清单）必须原样输出，不得改名字、不得省略——前端要靠它们渲染图表和卡片。
6. 全文（不含表格与清单符号）控制在 1100~1600 字之间。`
}

function buildUserPrompt(chart: ZipingBaziChart, name: string, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

  const pillarLine = [
    `年柱 ${chart.year.gan}${chart.year.zhi}（${chart.year.shishen ?? ''}）`,
    `月柱 ${chart.month.gan}${chart.month.zhi}（${chart.month.shishen ?? ''}）`,
    `日柱 ${chart.day.gan}${chart.day.zhi}（${chart.day.shishen ?? ''}）`,
    chart.hour ? `时柱 ${chart.hour.gan}${chart.hour.zhi}（${chart.hour.shishen ?? ''}）` : '时柱 未知',
  ].join('，')

  const wuxingLine = Object.entries(chart.wuxingScore)
    .map(([k, v]) => `${k}${v}%`)
    .join(' ')

  const currentDaYunStr = chart.currentDaYun
    ? `${chart.currentDaYun.gan}${chart.currentDaYun.zhi}（${chart.currentDaYun.ageRange[0]}-${chart.currentDaYun.ageRange[1]}岁）`
    : '尚未起运'

  const dayunCompact = chart.dayuns
    .map(d => `${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]}岁)`)
    .join('、')

  // 流年：今年 + 明年（1984 = 甲子）
  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const ganZhiOf = (y: number) => {
    const idx = ((y - 1984) % 60 + 60) % 60
    return `${GAN[idx % 10]}${ZHI[idx % 12]}`
  }
  const nowYear = new Date().getFullYear()
  const liunianLine = `${nowYear}年 ${ganZhiOf(nowYear)}，${nowYear + 1}年 ${ganZhiOf(nowYear + 1)}`

  return `请为以下子平八字命盘做"命理要点 + 白话注释"逐项注解式精批：
${name ? `命主称呼：${name}` : ''}
【四柱】${pillarLine}
【日主】${chart.riZhu}（${chart.riZhuStrength}）
【格局】${chart.geju}
【喜用】${chart.xiyong} | 【忌神】${chart.jishen}
【五行力量】${wuxingLine}
【起运】${chart.qiyunAge}岁起运，当前虚岁${chart.currentAge}岁，当前大运：${currentDaYunStr}
【大运序列】${dayunCompact}
【流年】${liunianLine}

请严格按 system prompt 规定的 8 段固定结构输出，每段内部采用【命理要点】/【白话注释】/【参考建议】逐条注解。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    chart: ZipingBaziChart
    name?: string
    locale?: string
  }>(event)

  if (!body?.chart) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chart' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.chart, body.name || '', locale)

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
