import type { DiZhi } from '~/types/user'

interface LunarDayInfo {
  date: string
  lunarDate: string
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
  yearNaYin: string
  monthNaYin: string
  dayNaYin: string
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  tianShen: string
  tianShenLuck: string
  tianShenType: string
  jieQi: string
  shengXiao: string
  week: string
  monthInChinese: string
  dayInChinese: string
  chongDesc: string
  chongShengXiao: string
  sha: string
  nineStar: string
  xunKong: string
  positionTaiSuiDesc: string
  positionXiDesc: string
  positionYangGuiDesc: string
  positionYinGuiDesc: string
  positionCaiDesc: string
  positionFuDesc: string
  lu: string
}

interface CalcResult {
  userGanzhi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  targetDate: string
  lunar: LunarDayInfo
  scenes: string[]
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

const SCENE_LABEL: Record<string, Record<string, string>> = {
  'zh-CN': {
    haircut: '理发',
    lottery: '买彩票',
    contract: '签合同',
    move: '搬家',
    travel: '出行',
    job: '求职',
    opening: '开业',
    date: '相亲',
  },
  'zh-TW': {
    haircut: '理髮',
    lottery: '買彩票',
    contract: '簽合同',
    move: '搬家',
    travel: '出行',
    job: '求職',
    opening: '開業',
    date: '相親',
  },
  en: {
    haircut: 'haircut',
    lottery: 'buying lottery',
    contract: 'signing contract',
    move: 'moving house',
    travel: 'traveling',
    job: 'job hunting',
    opening: 'business opening',
    date: 'blind date',
  },
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是精通传统黄历与八字择日的命理师。基于用户出生四柱与目标日期的 deterministic 黄历数据，生成今日宜忌的个性化解读。
${langHook.system}

## 角色与语气
- 命理师口吻，结论先行，具体点名宜忌、吉神凶煞、生肖冲合
- 温暖、积极、不恐吓，避免绝对化断言
- 所有建议视为传统文化参考，非科学结论

## 输出结构（严格按以下格式，段落之间用单独一行的 \`---\` 分隔，不要额外总结）

第 1 段：以「日柱·整体基调」作为标题行（例如 \`庚午日·火旺金炼，动中取吉\`），下面用 1-2 句话概括今日整体气场与行事原则。

第 2 段：标题为 \`今日气场：\`。结合用户日主天干与今日日柱干支的生克关系，说明今日气场倾向。注意同一段内避免「今日」「今天」重复出现。

第 3 段：标题为 \`今日{场景}：宜\` 或 \`今日{场景}：忌\`（根据黄历数据判断吉凶），其中 \`{场景}\` 是固定占位符，必须原样保留，不要替换成真实场景名。正文针对用户选择的场景给出具体建议，可包含 \`行动建议：\` 小标题。如果用户未选择场景，仍保留 \`{场景}\` 占位符。

第 4 段：标题为 \`宜：\`。从黄历「宜」中挑选 3-5 项，每项后简短说明。

第 5 段：标题为 \`忌：\`。从黄历「忌」中挑选 3-5 项，每项后简短说明。

## 约束
- 总字数控制在 300 字左右
- 必须引用计算结果中的具体数据，不编造
- 宜忌事项必须来自黄历原始数据，不可自行杜撰
- 场景化措辞需贴合用户选择的场景或自定义场景
- 同一段落内避免「今日」「今天」重复词`
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!
  const sceneMap = SCENE_LABEL[result.locale] || SCENE_LABEL['zh-CN']!
  const sceneLabels = result.scenes.map(s => sceneMap[s] || s).join('、')

  return `用户出生四柱：${result.userGanzhi.year.gan}${result.userGanzhi.year.zhi}年 ${result.userGanzhi.month.gan}${result.userGanzhi.month.zhi}月 ${result.userGanzhi.day.gan}${result.userGanzhi.day.zhi}日 ${result.userGanzhi.hour ? result.userGanzhi.hour.gan + result.userGanzhi.hour.zhi + '时' : '时辰未知'}
目标日期：${result.targetDate}（${result.lunar.lunarDate}）
今日干支：${result.lunar.yearGanZhi}年 ${result.lunar.monthGanZhi}月 ${result.lunar.dayGanZhi}日
今日生肖：${result.lunar.shengXiao}
星期：${result.lunar.week}
${result.lunar.jieQi ? '节气：' + result.lunar.jieQi : ''}

【黄历宜忌】
宜：${result.lunar.yi.join('、') || '无'}
忌：${result.lunar.ji.join('、') || '无'}

【吉神凶煞】
吉神：${result.lunar.jiShen.join('、') || '无'}
凶煞：${result.lunar.xiongSha.join('、') || '无'}
十二天神：${result.lunar.tianShen}（${result.lunar.tianShenLuck}）
冲煞：${result.lunar.chongDesc}${result.lunar.sha ? ' · ' + result.lunar.sha : ''}

【用户场景】
${sceneLabels || '（未选择特定场景）'}

请按系统提示要求的结构输出今日宜忌个性化解读。${langHook.user}`
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
