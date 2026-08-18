import type { QimenZizhanChart, QimenZizhanInterpretRequest } from '~/types/qimen-zizhan'

const GONG_WUXING: Record<number, string> = {
  1: '水', 2: '土', 3: '木', 4: '木', 5: '土', 6: '金', 7: '金', 8: '土', 9: '火',
}

function palaceLine(label: string, p: QimenZizhanChart['ziPalace'], extra = ''): string {
  const men = p.men || '（中宫无门）'
  const jiGong = p.gong === 5 ? '，中五寄坤二宫参断' : ''
  const tags = [p.isZhiFu ? '值符在此' : '', p.isZhiShi ? '值使在此' : ''].filter(Boolean).join('，')
  return `- ${label}：${p.gongName}${p.gong}宫（${p.direction}，五行属${GONG_WUXING[p.gong]}${jiGong}）｜${p.xing}星 · ${men} · ${p.shen}神｜天盘${p.tianpan} / 地盘${p.dipan}${tags ? `｜${tags}` : ''}${extra}`
}

function buildSystemPrompt(locale: string): string {
  const langNote = locale.startsWith('en')
    ? 'Please respond in natural English.'
    : locale === 'zh-TW'
    ? '請用繁體中文輸出。'
    : '请用简体中文输出。'

  return `你是一位精研奇门遁甲字占的测字老师傅——以求测时辰起时家奇门转盘局，以所测之字的康熙笔画数飞入洛书九宫定「字宫」，按用神体系断事。盘面数据已由确定性脚本计算完成，请不要重新推算，直接基于提供的 JSON 做解读。你说话简洁务实、接地气，把盘面门道讲成人人都懂的大白话；可以偶尔幽默，但不拽文、不玄乎、不说教。
${langNote}

## 断事体系（内心推算依据，不要照抄术语堆砌）
1. 字宫：所测之字笔画飞入之宫，为字之用神宫。宫中星、门、神组合是事情的核心状态。
2. 日干宫为求测人，时干宫为所问之事（事体）；看字宫与日干宫、时干宫的五行生克（生我/我生为顺，克我/我克为阻，比和为稳）。
3. 八门：开门、休门、生门为吉门；死门、惊门、伤门多阻隔；景门、杜门中平（景门主文书消息，杜门主闭塞酝酿）。
4. 九星：天心、天辅、天禽为吉；天任、天冲小吉；天柱、天英平平带小凶；天蓬、天芮多凶险。
5. 八神：值符最贵（贵人相助）；太阴主暗中成全；六合主合作人和；九地主稳、九天主动；腾蛇主虚惊缠绕；白虎主阻力硬碰；玄武主暧昧不明、防人之心。
6. 天地盘干组合（十干克应）可参看，但说给人听时必须翻成白话。

## 输出协议（严格逐行输出，每行一个字段，前缀后空一格，不要任何标题、序号、加粗或 markdown 标记）
OV: 一句点题（这个字问这件事，盘面给的总体兆头，30 字以内，定基调）
PAL: 一条字宫批注（拎出字宫的星/门/神其一，说它对所问之事的含义，24 字以内，每条单独成行、都以「PAL: 」开头，共 2-3 条，星门神尽量都覆盖到）
REL: 宫位关系一句（字宫与日干宫/时干宫的生克关系，翻成白话，36 字以内）
VERDICT: 最终断语（针对所问之事给出的白话判断，要像古籍签文那样收得住、有点题味，44 字以内，只用中文不写数字）
TIP: 一句收口提点（说人话、接地气，像长辈给的实在建议，可以幽默但不拽文不玄乎，36 字以内）

## 约束
- 严格遵守行前缀 OV: / PAL: / REL: / VERDICT: / TIP:，每个前缀单独成行、整行不换行
- 必须引用盘面具体数据（宫位、干支、星门神），不编造盘面没有的信息
- 允许给出趋势判断，但禁止绝对化的命运预言，禁止预测具体日期、金额、姓名、中奖号码等可验证的确定性信息
- 除上述行之外不输出任何其它内容`
}

function buildUserPrompt(chart: QimenZizhanChart, question?: string): string {
  const { pan } = chart
  const ziRawNote = chart.ziGongRaw === 5 ? '（笔画入中五宫，寄坤二宫参断）' : ''
  const riJiaNote = pan.riGanzhi.startsWith('甲') ? '（日干为甲，遁于六仪，以值符宫为用）' : ''
  const shiJiaNote = pan.shiGanzhi.startsWith('甲') ? '（时干为甲，遁于六仪，值符随时干，以值符宫为用）' : ''

  return `请为以下奇门字占盘面进行断事解读：

## 所测之字
「${chart.char}」——康熙笔画 ${chart.strokes} 画，飞入${chart.ziPalace.gongName}${chart.ziGong}宫为字宫${ziRawNote}

## 所问之事
${question || '未明言所问（按整体运势断）'}

## 起局
- ${pan.yinYang === 'yang' ? '阳遁' : '阴遁'}${pan.juShu}局 · 节气${pan.jieqi}
- 日干支：${pan.riGanzhi}（日干为求测人）${riJiaNote}
- 时干支：${pan.shiGanzhi}（时干为所问事）${shiJiaNote}

## 用神宫位
${palaceLine('字宫（所测之字）', chart.ziPalace)}
${palaceLine('日干宫（求测人）', chart.riPalace)}
${palaceLine('时干宫（所问事）', chart.shiPalace)}

## 九宫全盘（JSON，供参看十干克应与格局）
${JSON.stringify(pan.palaces, null, 2)}

请严格按系统提示的逐行协议输出断语，结论先行，白话为主。`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<QimenZizhanInterpretRequest>(event)

  if (!body?.chart?.pan || !body?.chart?.char) {
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
