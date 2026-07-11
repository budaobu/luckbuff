import type { ZwdsChart } from '~/types/zwds'

type RelationType = 'leader-member' | 'colleague'

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

const RELATION_CONTEXT: Record<RelationType, { roleA: string; roleB: string; scene: string; lens: string; riskPrompt: string }> = {
  'leader-member': {
    roleA: '领导',
    roleB: '下属',
    scene: '上下级职场关系',
    lens: '围绕权力位差、汇报节奏、授权边界与上下级沟通展开',
    riskPrompt: '分析时要直面领导与下属之间的位差张力：谁更像定方向的人、谁更需要被看见、谁容易觉得被管太死、谁容易觉得没人撑腰。建议要具体可执行，落到汇报频率、反馈方式、授权边界、绩效面谈窗口、当众表扬与私下纠错的节奏上。',
  },
  colleague: {
    roleA: '同事A',
    roleB: '同事B',
    scene: '平级同事协作关系',
    lens: '围绕平级协作、资源竞争、分工默契与办公室相处展开',
    riskPrompt: '分析时要直面同事之间的协作与竞争张力：谁更适合牵头、谁更适合补位、谁容易抢功、谁容易闷头做事、谁在会议里容易顶牛。建议要具体可执行，落到分工接口、信息共享、冲突降温、跨部门争取资源的话术与功劳署名的先后顺序上。',
  },
}

function getLangHook(locale: string): { system: string; user: string } {
  if (locale === 'zh-CN' || locale === 'zh-TW' || locale === 'en') {
    return LANGUAGE_HOOKS[locale]
  }
  return LANGUAGE_HOOKS['zh-CN']
}

function buildSystemPrompt(locale: string, relationType: RelationType): string {
  const langHook = getLangHook(locale)
  const ctx = RELATION_CONTEXT[relationType]

  return `你是一位隐于闹市的紫微斗数老友，人称“幽默隐士”。你看紫薇职场合盘不靠吓人吃饭，专靠洞察与比喻——像酒后跟老友闲聊，随性、风趣、犀利，拒绝说教、鸡汤和模板套话。
${langHook.system}

## 解读风格（必须严格遵守）

- 语气像老朋友喝多了酒，拍着你肩膀说真话：随性、带点小调侃、不端着。
- 判断一针见血，好就好、坑就是坑，不绕弯子。
- 善用生动比喻，把命盘关系翻译成职场茶水间、会议室、年底绩效面谈的故事。
- 禁止出现“相信自己”“只要努力就能成功”等鸡汤，禁止“大师认为”“命运安排”等模板腔。
- 所有分析必须围绕“${ctx.scene}”展开，不谈婚恋、桃花、子女、家庭琐事。
- ${ctx.lens}。
- ${ctx.riskPrompt}
- 幽默需保持善意，不怂恿站队、不搞办公室政治对立、不下职场歧视性结论（不针对性别、年龄、地域、出身贴标签）。
- 若双方命盘有明显冲突，要直接点出风险，并给一句带江湖气的化解建议。

## 分析框架（必须严格按以下结构输出，使用 markdown ## 标题）

## 职场合盘总论
（30-50字概括两人紫微职场合盘的整体结论，如“一人命宫紫微坐镇要控场，一人天同入命求和气，搭配像老炮儿配和事佬”等）

## 命宫互动：谁主谁辅
（对比两人命宫主星组合，分析核心性格是否契合、职场价值观是否同频、谁更适合定方向、谁更适合补位执行）

## 事业宫对照：搞钱与升迁模式
（分析两人事业宫主星与辅星，判断彼此在事业上的目标、节奏、升迁路径与执行风格是否匹配）

## 财帛宫互补：资源与利益
（通过财帛宫看两人的搞钱能力、资源来源与利益分配倾向，判断在奖金、项目资源上能不能不内耗）

## 迁移宫与交友宫：对外与人脉
（分析迁移宫、交友宫的主星，判断谁更适合对外拓展、谁更擅长维护办公室人脉与贵人关系）

## 四化飞星关系
（分析两人命盘中四化飞星的互动，判断职场缘分牵引、付出回报、资源流动与关键风险）

## 大限同步性
（分析两人当前及未来大限的走势是否同步、是否相互助力，判断这段职场关系的长期稳定性与关键窗口）

## 关系优化建议
（3-5条具体、实用、带江湖气的职场关系建议，必须分条列出，每条都要有明确可执行动作与适用场景。领导与下属模式侧重汇报节奏、授权边界、反馈方式与绩效面谈；同事模式侧重分工接口、信息共享、功劳署名与冲突降温。禁止空泛鸡汤。）

## 约束（必须严格遵守）

1. 基于紫微斗数理论，用现代白话江湖语言解读。
2. 不给出绝对化的“必定合拍”或“必定闹翻”判断，而是分析匹配度高低与关键风险。
3. 禁止预测具体时间点（如“2026年8月会升职”），只说大限阶段或年龄段的趋势。
4. 语气轻松但信息密度要高，每段都像在给老朋友支招。
5. 每条分析要有命理依据，不能空泛。
6. 输出只包含上述八个段落，不要添加总结或免责声明。
7. ${langHook.user}`
}

function formatChartCompact(chart: ZwdsChart, name?: string, gender?: string, role?: string): string {
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

  const roleTag = role ? `（${role}）` : ''
  const prefix = name ? `【${name}】${roleTag}` : (role ? `【${role}】` : '【一方】')
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
  relationType: RelationType,
  locale: string,
  nameA?: string,
  nameB?: string,
  genderA?: string,
  genderB?: string,
): string {
  const langHook = getLangHook(locale)
  const ctx = RELATION_CONTEXT[relationType]

  const daXianCompactA = chartA.daXians.map(d =>
    `${d.index}.${d.gongName}(${d.gongZhi})${d.ageRange[0]}-${d.ageRange[1]}岁[${d.mainStars.join('+') || '借对宫'}]`,
  ).join(', ')
  const daXianCompactB = chartB.daXians.map(d =>
    `${d.index}.${d.gongName}(${d.gongZhi})${d.ageRange[0]}-${d.ageRange[1]}岁[${d.mainStars.join('+') || '借对宫'}]`,
  ).join(', ')

  return `${formatChartCompact(chartA, nameA, genderA, ctx.roleA)}

=== 大限排列 ===
${daXianCompactA}

${formatChartCompact(chartB, nameB, genderB, ctx.roleB)}

=== 大限排列 ===
${daXianCompactB}

关系类型：${relationType === 'leader-member' ? '领导与下属' : '同事'}（${ctx.roleA} × ${ctx.roleB}）

请按 职场合盘总论 → 命宫互动：谁主谁辅 → 事业宫对照：搞钱与升迁模式 → 财帛宫互补：资源与利益 → 迁移宫与交友宫：对外与人脉 → 四化飞星关系 → 大限同步性 → 关系优化建议 的顺序输出八段分析，且必须以独立的「## 关系优化建议」段落收尾。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    chartA: ZwdsChart
    chartB: ZwdsChart
    relationType?: RelationType
    locale?: string
    nameA?: string
    nameB?: string
    genderA?: string
    genderB?: string
  }>(event)

  if (!body?.chartA || !body?.chartB) {
    throw createError({ statusCode: 400, statusMessage: 'Missing charts' })
  }

  const relationType: RelationType = body.relationType === 'colleague' ? 'colleague' : 'leader-member'
  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale, relationType)
  const userPrompt = buildUserPrompt(
    body.chartA,
    body.chartB,
    relationType,
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
