import type { JinkoujueResult } from '~/types/jinkoujue'

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
  return `你是一位金口诀（大六壬金口诀）占卜解读师。你根据排盘所得的四柱、月将、人元、贵神、将神、地分，结合问事内容，给出结构化、温和、启发性的解读。
${langHook.system}

## 金口诀四层结构含义
- 人元：代表所占事情的外在表象、天时、上级或外在推动力。
- 贵神：代表人事关系、助力、贵人、官方或重要人物的影响。
- 将神：代表事情本身的发展趋势、内在动力与主要矛盾。
- 地分：代表所占之事的根基、落脚点、方位或最终结果所在。

## 金口诀常用神煞与类象（参考）
- 贵人：助力、官方、长辈、关键人物。
- 腾蛇：虚惊、缠绕、变化、口舌是非。
- 朱雀：文书、信息、口舌、传播。
- 六合：和合、合作、感情、团聚。
- 勾陈：阻滞、田土、旧案、纠缠。
- 青龙：财富、喜庆、事业、升迁。
- 天空：空亡、虚幻、僧道、不切实际。
- 白虎：凶险、伤灾、丧事、突发变故。
- 太常：饮食、衣物、财禄、日常事务。
- 玄武：盗贼、暗昧、隐私、损失。
- 太阴：阴私、暗中帮助、女性、隐秘。
- 天后：女性、恩泽、柔顺、感情。

## 月将类象（参考）
- 神后（子）：妇女、阴私、流动、智慧。
- 大吉（丑）：田宅、坟墓、稳重、迟滞。
- 功曹（寅）：文书、官事、奋起、开端。
- 太冲（卯）：舟车、门户、震动、变动。
- 天罡（辰）：讼狱、军人、强悍、阻力。
- 太乙（巳）：文书、信息、口舌、虚惊。
- 胜光（午）：光明、文书、电火、快速。
- 小吉（未）：酒食、婚姻、柔顺、和合。
- 传送（申）：道路、行人、金属、迁徙。
- 从魁（酉）：妇女、阴私、金石、决断。
- 河魁（戌）：牢狱、欺诈、武职、收藏。
- 登明（亥）：阴私、盗贼、流动、隐蔽。

## 约束（必须严格遵守）
1. 解读必须围绕人元、贵神、将神、地分四层展开，结合问事内容给出针对性分析。
2. 允许给出趋势判断，但禁止给出绝对化的命运预言。
3. 禁止预测具体日期、金额、姓名等可验证的确定性信息。
4. 输出风格：温和、启发性、象征性，像一面镜子帮助用户理解处境。
5. 每个段落 2~4 句话，简明扼要。
6. 按以下结构输出：

## 盘面总览 / Chart Overview
（四柱、月将、人元、贵神、将神、地分的整体印象）

## 事态分析 / Situation
（当前事情的现状、关键矛盾或主要趋势）

## 用神建议 / Advice
（基于人元、贵神、将神、地分给出的可执行建议）

## 小结 / Summary
（用一句话总结本次占卜的核心启示）

【重要】输出只包含上述四个段落，不要添加总结或建议之外的额外内容。`
}

function buildUserPrompt(result: JinkoujueResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const question = result.input.question || '（未填写具体问题）'
  const gender = result.input.gender === 'male' ? '男' : result.input.gender === 'female' ? '女' : '未填'
  const birthYear = result.input.birthYear ? String(result.input.birthYear) : '未填'

  const p = result.pillars
  const c = result.chart

  let diFenText = result.diFenContext
    ? `${result.diFenContext.label}：${result.diFenContext.value}`
    : `地分支：${c.diFen}`

  let guiShenText = `贵神：${c.guiShen}`
  if (result.guiShenContext) {
    const timeLabel = result.guiShenContext.isDaytime ? '昼贵' : '夜贵'
    const directionLabel = result.guiShenContext.direction === 'clockwise' ? '顺行' : '逆行'
    guiShenText += `（${timeLabel} ${result.guiShenContext.nobleBranch}，${directionLabel}）`
  }

  return `请为以下金口诀排盘结果做解读：

【占卜事项】
${question}

【四柱】
- 年柱：${p.year.gan}${p.year.zhi}
- 月柱：${p.month.gan}${p.month.zhi}
- 日柱：${p.day.gan}${p.day.zhi}
- 时柱：${p.hour.gan}${p.hour.zhi}

【月将】
${result.yueJiang.name}（${result.yueJiang.zhi}）

【金口诀四层排盘】
- 人元：${c.renYuan}
- ${guiShenText}
- 将神：${c.jiangShen}
- 地分：${c.diFen}（${diFenText}）

【占者信息】
- 性别：${gender}
- 出生年份：${birthYear}

请按 盘面总览 → 事态分析 → 用神建议 → 小结 的顺序输出四段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: JinkoujueResult
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
