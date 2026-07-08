import type { ZwdsChart } from '~/types/zwds'

const LANGUAGE_HOOKS: Record<'zh-CN' | 'zh-TW' | 'en', { system: string; user: string }> = {
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

function getLangHook(locale: string): { system: string; user: string } {
  if (locale === 'zh-CN' || locale === 'zh-TW' || locale === 'en') {
    return LANGUAGE_HOOKS[locale]
  }
  return LANGUAGE_HOOKS['zh-CN']
}

function buildSystemPrompt(locale: string): string {
  const langHook = getLangHook(locale)
  return `你是一位隐于闹市的紫微斗数老友，人称“幽默隐士”。你看紫薇事业合盘不靠吓人吃饭，专靠洞察与比喻——像酒后跟老友闲聊，随性、风趣、犀利，拒绝说教、鸡汤和模板套话。
${langHook.system}

## 解读风格（必须严格遵守）

- 语气像老朋友喝多了酒，拍着你肩膀说真话：随性、带点小调侃、不端着。
- 判断一针见血，好就好、坑就是坑，不绕弯子。
- 善用生动比喻，把命盘关系翻译成合伙创业、商场博弈、团队分工的故事。
- 禁止出现“相信自己”“只要努力就能成功”等鸡汤，禁止“大师认为”“命运安排”等模板腔。
- 所有分析必须围绕“事业合作 / 合伙人 / 创业搭档”展开，不谈婚恋、桃花、子女、家庭琐事。
- 若双方命盘有明显冲突，要直接点出风险，并给一句带江湖气的化解建议。

## 分析框架（必须严格按以下结构输出，使用 markdown ## 标题）

## 合伙总论
（30-50字概括两人紫微事业合盘的整体结论，如“两人命宫主星相生，事业宫互补，合伙像狙击配观察手”等）

## 命宫互动：谁主谁辅
（对比两人命宫主星组合，分析核心性格是否契合、价值观是否同频、事业场上谁更适合冲前线、谁更适合守后方）

## 事业宫对照：搞钱模式合不合
（分析两人事业宫主星与辅星，判断彼此在事业上的目标、节奏与执行风格是否匹配）

## 财帛宫互补：资源与分账
（通过财帛宫看两人的搞钱能力、资源来源与利益分配倾向，判断能不能一起把蛋糕做大）

## 迁移宫与交友宫：外拓与贵人
（分析迁移宫、交友宫的主星，判断谁更适合对外拓展、谁更擅长维护人脉与贵人关系）

## 四化飞星关系
（分析两人命盘中四化飞星的互动，判断事业缘分牵引、付出回报、资源流动与关键风险）

## 大限同步性
（分析两人当前及未来大限的走势是否同步、是否相互助力，判断事业合伙的长期稳定性）

## 合伙建议
（3-5条具体、实用、带江湖气的事业合作建议，如“财务权必须分清楚”“重大决策别在微信群里做”等）

## 约束（必须严格遵守）

1. 基于紫微斗数理论，用现代白话江湖语言解读。
2. 不给出绝对化的“必成”或“必败”判断，而是分析匹配度高低与关键风险。
3. 禁止预测具体时间点（如“2026年8月公司上市”），只说大限阶段或年龄段的趋势。
4. 语气轻松但信息密度要高，每段都像在给老朋友支招。
5. 每条分析要有命理依据，不能空泛。
6. 输出只包含上述七个段落，不要添加总结或免责声明。
7. ${langHook.user}`
}

function formatChartCompact(chart: ZwdsChart, name?: string, gender?: string): string {
  const ming = chart.mingGong
  const shen = chart.shenGong
  const shiye = chart.gongs.find(g => g.name === '事业')
  const caibo = chart.gongs.find(g => g.name === '财帛')
  const qianyi = chart.gongs.find(g => g.name === '迁移')
  const jiaoyou = chart.gongs.find(g => g.name === '交友')

  const currentDaXian = chart.currentDaXian
    ? `第${chart.currentDaXian.index}大限 ${chart.currentDaXian.gongName}宫（${chart.currentDaXian.gongZhi}）${chart.currentDaXian.ageRange[0]}-${chart.currentDaXian.ageRange[1]}岁`
    : '尚未起运'

  const gongList = chart.gongs.map(g =>
    `${g.name}(${g.zhi})[主:${g.mainStars.join('+') || '空宫'}][辅:${g.auxStars.join('+') || '无'}][四化:${g.siHua.map(s => `${s.star}化${s.type}`).join('+') || '无'}]`,
  ).join('\n')

  const sihuaList = chart.gongs
    .flatMap(g => g.siHua.map(s => `${s.star}化${s.type}→${g.name}宫`))
    .join('，') || '无'

  const prefix = name ? `【${name}】` : '【一方】'
  const genderText = gender === 'male' ? '男' : gender === 'female' ? '女' : '未填'

  return `${prefix}
性别：${genderText}
年柱：${chart.yearGan}${chart.yearZhi}
命宫：${ming.zhi}（${ming.mainStars.join('、') || '借对宫'}）
身宫：${shen.zhi}（${shen.mainStars.join('、') || '借对宫'}）
五行局：${chart.wuxingJu}局
事业宫：${shiye ? shiye.zhi + '（' + (shiye.mainStars.join('、') || '借对宫') + '）' : '未知'}
财帛宫：${caibo ? caibo.zhi + '（' + (caibo.mainStars.join('、') || '借对宫') + '）' : '未知'}
迁移宫：${qianyi ? qianyi.zhi + '（' + (qianyi.mainStars.join('、') || '借对宫') + '）' : '未知'}
交友宫：${jiaoyou ? jiaoyou.zhi + '（' + (jiaoyou.mainStars.join('、') || '借对宫') + '）' : '未知'}
当前大限：${currentDaXian}

=== 十二宫分布 ===
${gongList}

=== 四化飞星 ===
${sihuaList}`
}

function buildUserPrompt(
  chartA: ZwdsChart,
  chartB: ZwdsChart,
  locale: string,
  nameA?: string,
  nameB?: string,
  genderA?: string,
  genderB?: string,
): string {
  const langHook = getLangHook(locale)

  const daXianCompactA = chartA.daXians.map(d =>
    `${d.index}.${d.gongName}(${d.gongZhi})${d.ageRange[0]}-${d.ageRange[1]}岁[${d.mainStars.join('+') || '借对宫'}]`,
  ).join(', ')
  const daXianCompactB = chartB.daXians.map(d =>
    `${d.index}.${d.gongName}(${d.gongZhi})${d.ageRange[0]}-${d.ageRange[1]}岁[${d.mainStars.join('+') || '借对宫'}]`,
  ).join(', ')

  return `${formatChartCompact(chartA, nameA, genderA)}

=== 大限排列 ===
${daXianCompactA}

${formatChartCompact(chartB, nameB, genderB)}

=== 大限排列 ===
${daXianCompactB}

请按 合伙总论 → 命宫互动：谁主谁辅 → 事业宫对照：搞钱模式合不合 → 财帛宫互补：资源与分账 → 迁移宫与交友宫：外拓与贵人 → 四化飞星关系 → 大限同步性 → 合伙建议 的顺序输出七段分析。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    chartA: ZwdsChart
    chartB: ZwdsChart
    locale?: string
    nameA?: string
    nameB?: string
    genderA?: string
    genderB?: string
  }>(event)

  if (!body?.chartA || !body?.chartB) {
    throw createError({ statusCode: 400, statusMessage: 'Missing charts' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(
    body.chartA,
    body.chartB,
    locale,
    body.nameA,
    body.nameB,
    body.genderA,
    body.genderB,
  )

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
