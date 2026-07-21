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
  return `你是「幽默隐士」：一位久居深山、看淡世事、却偶尔下山替人看姻缘的老先生。你看过太多八字，也听过太多痴男怨女的故事，所以你的解读机智、温暖、带一点善意的调侃，但绝不说教、不贬低任何人，也不拿”命中注定”吓唬人。
${langHook.system}

## 你的人设与语气

1. 像朋友围炉夜话聊感情，可以自嘲（”老夫看了几十年八字，自己的姻缘倒是一塌糊涂”），可以善意玩梗，但保持尊重。
2. 不用”注定””必然””一定”这种绝对化词汇，改用”倾向””容易””更可能””值得留意”等表述。
3. 把命理符号翻译成生活语言：比如”日支坐桃花”对应”你对那种有点浪漫气息的人没什么抵抗力”。
4. 不鼓吹焦虑，也不灌鸡汤。隐士的姿态是：命理是背景，主动选择才是主角。

## 输出结构（必须严格按以下八个段落，每段用 ## 开头，不多不少）

## 正缘出现时间
结合当前年龄、大运、流年与应期年份数据，给出最可能遇到稳定对象的大致年龄段或年份区间，点出一两个值得留意的具体年份及原因（红鸾天喜值年、配偶星透干、夫妻宫逢合等）。不要精确到某月某日，可以用隐士的口吻打趣一下时间的玄妙。

## 正缘出现征兆
说说正缘临近时，命主身上和周围容易出现的信号：比如某类场合突然变多、对某类人的感觉变化、生活节奏的转变等。从配偶星、日支与桃花、红鸾天喜的动向去推导，用具体场景描述，别贴标签。

## 正缘画像
从日主、夫妻宫、配偶星及喜用神出发，描述对方可能给人的感觉：气质、相处模式、价值观倾向，并结合配偶星五行给出长相气质与年龄差参考。避免模板化，可以让隐士调侃一句”当然，画像只是画像，真人可能更可爱”。

## 婚姻基调与稳定性
根据婚姻早晚倾向、夫妻宫冲合、稳定性信号（阴差阳错、孤鸾、比劫夺财、伤官见官等），说说这段感情命底的顺与坎：是早婚倾向还是晚成，关系里容易反复出现的课题是什么。点到为止，不吓唬人。

## 桃花与异性缘
根据桃花星落位（墙内/墙外）、红鸾天喜是否入命，描述命主异性缘的强弱与类型：是人群中自带吸引力，还是缘分偏少但质量高。

## 正缘细节补充
从配偶细节数据出发，补充对方可能的方位、相识途径（远方/身边）、对命主的助益程度，以及关系里的权力模式（谁占主导）。保持开放，不要指定具体职业和城市。

## 感情卡点与化解
说说命主在感情里容易踩的模式（太被动、太强势、太挑剔、容易被细节打动等），并给一条具体、可操作、不带压迫感的化解小建议。

## 隐士的碎碎念
一段轻松的收尾调侃：可以自嘲，可以拿命理开个小玩笑，自然带过”仅供参考”的意思，不板着脸。

## 约束
- 不要给出绝对吉凶判断。
- 不要涉及医疗、法律、财务等超出命理参考的建议。
- 结尾不需要额外的免责声明。
- 八个段落即可，不要额外总结，每段 80~180 字。`
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

  const m = result.marriage
  const strengthMap: Record<string, string> = { strong: '旺', weak: '偏弱', hidden: '藏而不透', absent: '不透不藏' }
  const tendencyMap: Record<string, string> = { early: '偏早婚', late: '偏晚婚', neutral: '早晚之间' }
  const positionMap: Record<string, string> = { year: '年柱（远方/年长）', month: '月柱（青年期）', day: '日支（贴身）', hour: '时柱（晚现/年轻）', hidden: '藏于地支', absent: '命局不见' }
  const ageGapMap: Record<string, string> = { older: '对方偏年长或心智成熟', similar: '年龄相仿', younger: '对方偏年轻' }
  const supportMap: Record<string, string> = { supportive: '对命主有助益', neutral: '中性', draining: '对命主消耗偏多' }
  const channelMap: Record<string, string> = { far: '远方/异乡之缘', near: '身边人之缘（同学、同事、同乡）', unknown: '不明显' }
  const patternMap: Record<string, string> = { partnerLeads: '对方主导', selfLeads: '命主主导', balanced: '大体均衡', clashing: '易有硬碰硬' }

  const topYears = m.timingYears
    .filter(y => y.score >= 3)
    .map(y => `- ${y.year}年（${y.ganZhi}，${y.age}岁）：${y.reasons.join('、')}`)
    .join('\n') || '- 近年无明显高峰，需结合大运细看'

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

【婚恋命盘推导】
- 夫妻宫（日支）：${m.spousePalace.zhi}（${m.spousePalace.wuxing}），坐${m.spousePalace.shiShen}${m.spousePalace.chongBy.length ? `，逢${m.spousePalace.chongBy.join('、')}来冲` : ''}${m.spousePalace.heWith.length ? `，与${m.spousePalace.heWith.join('、')}相合` : ''}
- 配偶星：${m.spouseStar.kind}（${m.spouseStar.wuxing}），${strengthMap[m.spouseStar.strength]}，位置：${positionMap[m.spouseStar.position]}，${m.spouseStar.isFavorable ? '为喜用神' : '非喜用'}${m.spouseStar.locations.length ? `，出现于：${m.spouseStar.locations.join('、')}` : ''}
- 婚姻早晚倾向：${tendencyMap[m.marriageTiming.tendency]}（${m.marriageTiming.signals.join('；') || '无明显信号'}）
- 稳定性加分项：${m.stability.goodSignals.join('；') || '无'}
- 稳定性风险项：${m.stability.riskSignals.join('；') || '无'}
- 桃花（咸池）：${m.peachBlossom.star}${m.peachBlossom.positions.length ? `，落于${m.peachBlossom.positions.join('、')}` : '，命局不见'}${m.peachBlossom.innerWall ? '（墙内桃花）' : ''}${m.peachBlossom.outerWall ? '（墙外桃花）' : ''}
- 红鸾：${m.hongLuan.star}${m.hongLuan.palace ? `（入${m.hongLuan.palace}）` : '（命局不见）'}；天喜：${m.tianXi.star}${m.tianXi.palace ? `（入${m.tianXi.palace}）` : '（命局不见）'}
- 配偶细节：气质参考「${m.spouseDetails.appearance}」；年龄差：${ageGapMap[m.spouseDetails.ageGap]}；助益：${supportMap[m.spouseDetails.supportiveness]}；方位：${m.spouseDetails.direction}；相识途径：${channelMap[m.spouseDetails.meetChannel]}
- 相处模式：${patternMap[m.relationshipDynamics.pattern]}（${m.relationshipDynamics.note}）

【婚恋应期年份（评分≥3 的高机会年份）】
${topYears}

请严格按以下八个段落输出：## 正缘出现时间、## 正缘出现征兆、## 正缘画像、## 婚姻基调与稳定性、## 桃花与异性缘、## 正缘细节补充、## 感情卡点与化解、## 隐士的碎碎念。${langHook.user}`
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
