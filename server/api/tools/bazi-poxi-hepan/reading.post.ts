import type { BaziChart } from '~/types/bazi'

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
  return `你是一位隐于闹市的命理老友，人称“幽默隐士”。你看八字合盘不靠吓人吃饭，专靠洞察与比喻——像酒后跟老友闲聊，随性、风趣、犀利，拒绝说教、鸡汤和模板套话。
${langHook.system}

## 解读风格（必须严格遵守）

- 语气像老朋友喝多了酒，拍着你肩膀说真话：随性、带点小调侃、不端着。
- 判断一针见血，好就好、坑就是坑，不绕弯子。
- 善用生动比喻，把命理关系翻译成婆媳日常相处、家庭生活的故事。
- 禁止出现“相信自己”“只要努力就能成功”等鸡汤，禁止“大师认为”“命运安排”等模板腔。
- 所有分析必须围绕“婆媳关系 / 婆媳相处”展开，不谈婚恋、桃花、子女、事业合伙。
- 幽默需保持善意不刻薄，不制造对立情绪，不使用地域或代际刻板印象。
- 若双方命理有明显冲突，要直接点出风险，并给一句带生活气的化解建议。
- 每条分析落点要有具体可用的相处建议，而不是单纯挑刺。

## 分析框架（必须严格按以下结构输出，使用 markdown ## 标题）

## 婆媳总论
（30-50字概括两人婆媳八字合盘的整体结论，如“甲木婆婆遇庚金媳妇，一个爱张罗、一个爱做主，家里得像两支球队约法三章”等）

## 日柱互动：谁主谁辅
（分析两人日柱天干地支的关系：天干五合、地支六合/三合/冲/刑/害等，判断日常相处中谁更适合拿主意、谁更适合打配合）

## 五行互补：日常相处的资源与短板
（对比两人命盘的五行分布，判断谁能补上谁的资源缺口。如一方火旺急躁、另一方水旺柔和，则后者能浇点“凉茶”）

## 十神关系：家庭角色分工
（从十神角度判断两人在婆媳关系中的天然角色：谁像家里的“定海神针”、谁像“创新派”、谁容易操心、谁容易嫌管束等）

## 性格匹配：一起过日子的化学反应
（基于日主强弱、格局、喜用神，分析相处中的契合点与摩擦点，语言轻松带梗）

## 大运同步：长期能不能同频
（分析两人当前及未来大运走势是否同步、是否相互助力，判断婆媳关系的长期稳定性与关键窗口）

## 婆媳相处建议
（3-5条具体、实用、带生活气的相处建议，如“大事让儿子传话，小事直接聊”“过节礼物提前问，别靠猜”等）

## 约束（必须严格遵守）

1. 基于八字命理理论，用现代白话江湖语言解读。
2. 不给出绝对化的“必定和睦”或“必定不和”判断，而是分析匹配度高低与关键风险。
3. 禁止预测具体时间点（如“2026年8月会吵架”），只说大运阶段或年龄段的趋势。
4. 语气轻松但信息密度要高，每段都像在给老朋友支招。
5. 每条分析要有命理依据，不能空泛。
6. 输出只包含上述七个段落，不要添加总结或免责声明。
7. ${langHook.user}`
}

function buildUserPrompt(
  chartA: BaziChart,
  chartB: BaziChart,
  locale: string,
  nameA?: string,
  nameB?: string,
): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

  const currentDaYunStrA = chartA.currentDaYun
    ? `${chartA.currentDaYun.gan}${chartA.currentDaYun.zhi}（${chartA.currentDaYun.ageRange[0]}-${chartA.currentDaYun.ageRange[1]}岁）`
    : '尚未起运'

  const currentDaYunStrB = chartB.currentDaYun
    ? `${chartB.currentDaYun.gan}${chartB.currentDaYun.zhi}（${chartB.currentDaYun.ageRange[0]}-${chartB.currentDaYun.ageRange[1]}岁）`
    : '尚未起运'

  const dayunCompactA = chartA.dayuns.map(d => `${d.index}.${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]})`).join(', ')
  const dayunCompactB = chartB.dayuns.map(d => `${d.index}.${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]})`).join(', ')

  const prefixA = nameA ? `【婆婆】${nameA}` : '【婆婆】'
  const prefixB = nameB ? `【媳妇】${nameB}` : '【媳妇】'

  return `${prefixA}
八字：年${chartA.year.gan}${chartA.year.zhi} 月${chartA.month.gan}${chartA.month.zhi} 日${chartA.day.gan}${chartA.day.zhi} 时${chartA.hour ? chartA.hour.gan + chartA.hour.zhi : '未知'}
日主${chartA.riZhu}（${chartA.riZhuStrength}）| 格局${chartA.geju} | 喜用${chartA.xiyong} | 忌${chartA.jishen}
五行：木${chartA.wuxingScore['木']}% 火${chartA.wuxingScore['火']}% 土${chartA.wuxingScore['土']}% 金${chartA.wuxingScore['金']}% 水${chartA.wuxingScore['水']}%
当前大运：${currentDaYunStrA}
大运：${dayunCompactA}
起运年龄：${chartA.qiyunAge}岁 | 当前年龄：${chartA.currentAge}岁

${prefixB}
八字：年${chartB.year.gan}${chartB.year.zhi} 月${chartB.month.gan}${chartB.month.zhi} 日${chartB.day.gan}${chartB.day.zhi} 时${chartB.hour ? chartB.hour.gan + chartB.hour.zhi : '未知'}
日主${chartB.riZhu}（${chartB.riZhuStrength}）| 格局${chartB.geju} | 喜用${chartB.xiyong} | 忌${chartB.jishen}
五行：木${chartB.wuxingScore['木']}% 火${chartB.wuxingScore['火']}% 土${chartB.wuxingScore['土']}% 金${chartB.wuxingScore['金']}% 水${chartB.wuxingScore['水']}%
当前大运：${currentDaYunStrB}
大运：${dayunCompactB}
起运年龄：${chartB.qiyunAge}岁 | 当前年龄：${chartB.currentAge}岁

请按 婆媳总论 → 日柱互动：谁主谁辅 → 五行互补：日常相处的资源与短板 → 十神关系：家庭角色分工 → 性格匹配：一起过日子的化学反应 → 大运同步：长期能不能同频 → 婆媳相处建议 的顺序输出七段分析。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    chartA: BaziChart
    chartB: BaziChart
    locale?: string
    nameA?: string
    nameB?: string
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
  const userPrompt = buildUserPrompt(body.chartA, body.chartB, locale, body.nameA, body.nameB)

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
