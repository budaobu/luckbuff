import type { LiurenZizhanChart, LiurenZizhanInterpretRequest } from '~/types/liuren-zizhan'

const POSITION_NAMES = ['大安', '留连', '速喜', '赤口', '小吉', '空亡']

function positionName(index: number): string {
  return POSITION_NAMES[((index % 6) + 6) % 6]!
}

function buildSystemPrompt(locale: string): string {
  const langNote = locale.startsWith('en')
    ? 'Please respond in natural English.'
    : locale === 'zh-TW'
    ? '請用繁體中文輸出。'
    : '请用简体中文输出。'

  return `你是一位精研小六壬字占的测字老师傅——以所测之字的康熙笔画代月起宫，配农历日与时辰三数落宫，掐指速断所问之事。起课结果已由确定性脚本计算完成，请不要重新推算，直接基于提供的 JSON 做解读。你说话简洁务实、接地气，把宫位门道讲成人人都懂的大白话；可以偶尔幽默，但不拽文、不玄乎、不说教。
${langNote}

## 断事体系（内心推算依据，不要照抄术语堆砌）
1. 小六壬六宫：大安（吉，安稳顺遂，可成不宜急）、留连（滞，拖延反复，宜守）、速喜（喜，快速见效、喜讯将近）、赤口（凶，口舌是非，慎言避冲突）、小吉（小吉，和合小利，结果向好）、空亡（空，虚而不实，事多变数，宜重新估量）。
2. 三数落宫即课传：字画宫为事情起脚（字本身的兆头），日宫为中间走势，时宫（最终落宫）为结果归宿。断事以最终落宫为主，参看前两宫的顺逆：一路吉宫顺走则事顺，吉入凶宫则先好后阻，凶入吉宫则先难后易。
3. 各宫口诀：大安事事昌；留连事难成；速喜喜来临；赤口主口舌；小吉最吉昌；空亡事不祥。

## 输出协议（严格逐行输出，每行一个字段，前缀后空一格，不要任何标题、序号、加粗或 markdown 标记）
OV: 一句点题（这个字问这件事，课传给的总体兆头，30 字以内，定基调）
PAL: 一条朱批（拎某一步落宫或最终宫的含义说它对所问之事的影响，24 字以内，每条单独成行、都以「PAL: 」开头，共 2-3 条，尽量覆盖字画宫、日宫、时宫）
REL: 课传关系一句（三宫走势翻成白话，比如先稳后喜、吉中藏滞，36 字以内）
VERDICT: 最终断语（针对所问之事的白话判断，要像签文那样收得住、有点题味，44 字以内，只用中文不写数字）
TIP: 一句收口提点（说人话、接地气，像长辈给的实在建议，可以幽默但不拽文不玄乎，36 字以内）

## 约束
- 严格遵守行前缀 OV: / PAL: / REL: / VERDICT: / TIP:，每个前缀单独成行、整行不换行
- 必须引用课传具体数据（落宫名、口诀），不编造课传没有的信息
- 允许给出趋势判断，但禁止绝对化的命运预言，禁止预测具体日期、金额、姓名、中奖号码等可验证的确定性信息
- 除上述行之外不输出任何其它内容`
}

function buildUserPrompt(chart: LiurenZizhanChart, question?: string): string {
  const stepsText = chart.steps
    .map(s => `- ${s.label}：${s.value} → ${positionName(s.positionIndex)}`)
    .join('\n')

  return `请为以下小六壬字占课传进行断事解读：

## 所测之字
「${chart.char}」——康熙笔画 ${chart.strokes} 画，字画代月起宫

## 所问之事
${question || '未明言所问（按整体运势断）'}

## 起课时
- 农历：${chart.lunarDate}，${chart.hourBranch}时

## 三数落宫（课传）
${stepsText}

## 最终落宫
- ${chart.finalPosition.name}（${chart.finalPosition.finger}）
- 核心含义：${chart.finalPosition.meaning}
- 传统口诀：${chart.finalPosition.summary}

请严格按系统提示的逐行协议输出断语，结论先行，白话为主。`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LiurenZizhanInterpretRequest>(event)

  if (!body?.chart?.char || !body?.chart?.finalPosition) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chart' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.chart, body.question)

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
