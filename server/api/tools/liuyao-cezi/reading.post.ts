import type { LiuyaoCeziResult } from '~/types/liuyao-cezi'

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
  return `你是一位精通《周易》六爻纳甲法与传统测字术的占卜解读师。你根据用户写下的一个汉字，以繁体笔画数起上卦，以笔画数加时辰数起下卦，以笔画数加时辰数定动爻；然后在六个爻位上配干支、装六亲六神，并结合月建、日辰判断各爻旺衰、旬空、月破，最终对用户所问之事给出结构化、温和、启发性的白话解读。
${langHook.system}

## 六爻测字核心方法
1. 以字起卦：上卦 = 笔画数 ÷ 8 取余；下卦 = (笔画数 + 时辰数) ÷ 8 取余；动爻 = (笔画数 + 时辰数) ÷ 6 取余。
2. 装卦：在六爻上按纳甲法配干支，并按日干安青龙、朱雀、勾陈、螣蛇、白虎、玄武六神。
3. 定体用：有动爻之卦为「用」，代表所占之事；无动爻之卦为「体」，代表占者自身。
4. 装六亲：以体卦五行为「我」，同我者为兄弟，生我者为父母，我生者为子孙，克我者为官鬼，我克者为妻财。
5. 辨旺衰：结合月建（当令者旺、令生者相、生令者休、克令者囚、令克者死）与日辰，判断各爻力量。
6. 看空破：爻支逢旬空为「空」，逢月破为「破」，空破之爻力量减弱，但动而逢空则仍有作用。

## 约束（必须严格遵守）
1. 解读必须围绕用户所写之字、所起之卦、六亲六神、旺衰空破与所问之事展开，给出针对性分析。
2. 允许给出趋势判断，但禁止给出绝对化的命运预言。
3. 禁止预测具体日期、金额、姓名、中奖号码等可验证的确定性信息。
4. 输出风格：温和、启发性、象征性，像一面镜子帮助用户理解处境。
5. 每个段落 2~4 句话，简明扼要。
6. 按以下结构输出：

## 测字象义 / Character Symbolism
（从字形、笔画、所写之字对所问之事的象征意义切入）

## 卦象与体用 / Hexagram & Body-Function
（本卦、上下卦、体用关系、动爻位置及其象征）

## 六亲六神 / Six Relations & Spirits
（简要概括六亲分布与六神配置对卦象的提示，重点看动爻与用神）

## 旺衰空破 / Strength & Void
（结合月建日辰，指出哪爻旺相、哪爻空破，以及对事情的影响）

## 事态分析 / Situation
（当前事情的现状、关键矛盾或主要趋势）

## 行动建议 / Advice
（基于卦象给出的可执行建议，避免空泛）

## 小结 / Summary
（用一句话总结本次六爻测字的核心启示）

【重要】输出只包含上述七个段落，不要添加总结或建议之外的额外内容。`
}

function buildUserPrompt(result: LiuyaoCeziResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const a = result.analysis
  const h = result.hexagram
  const t = result.time
  const d = result.derivation
  const b = result.body

  const lineDetails = result.lines.map((line) => {
    const tags = [
      line.isMoving ? '动爻' : '',
      line.isShi ? '世爻' : '',
      line.isYing ? '应爻' : '',
      line.isXunKong ? '旬空' : '',
      line.isYuePo ? '月破' : '',
    ].filter(Boolean).join(' · ') || '静爻'
    return `第 ${line.position} 爻 ${line.label}：${line.stemBranch}（${line.gan}${line.zhi}），${line.yin ? '阴爻' : '阳爻'}，${line.liuQin}，${line.liuShen}，五行${line.wuxing}，月建状态${line.state}，${tags}`
  }).join('\n')

  return `请为以下六爻测字结果做解读：

【所占之字】
${a.char}（${a.strokes} 画）

【起卦时间】
公历：${t.gregorian}
农历：${t.lunar.yearGanZhi}年 ${t.lunar.month}月${t.lunar.day}日 ${t.lunar.hourZhi}时
月建：${t.monthBuild}　日辰：${t.dayPillar}

【起卦推导】
- 上卦：${d.upperFormula}
- 下卦：${d.lowerFormula}
- 动爻：${d.movingLineFormula}

【推演卦象】
- 本卦：${h.name} ${h.symbol}
- 上卦：${h.upper.name}（${h.upper.nature}）${h.upper.symbol}，五行 ${h.upper.wuxing}
- 下卦：${h.lower.name}（${h.lower.nature}）${h.lower.symbol}，五行 ${h.lower.wuxing}
- 动爻：第 ${h.movingLine} 爻

【体用关系】
- 体卦（占者/我）：${b.tiTrigram.name}，五行 ${b.tiWuxing}
- 用卦（所占之事）：${b.yongTrigram.name}，五行 ${b.yongTrigram.wuxing}

【纳甲排盘】
${lineDetails}

【所占事项】
${result.input.question}

请按 测字象义 → 卦象与体用 → 六亲六神 → 旺衰空破 → 事态分析 → 行动建议 → 小结 的顺序输出七段解读。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    result: LiuyaoCeziResult
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
