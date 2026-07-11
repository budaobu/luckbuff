import type {
  AstroZhichangCalcResult,
  AstroZhichangChart,
  AstroZhichangRelationType,
} from '~/types/astro-zhichang-hepan'

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': { system: '请使用简体中文输出。', user: '请使用简体中文输出所有内容。' },
  'zh-TW': { system: '請使用繁體中文輸出。', user: '請使用繁體中文輸出所有內容。' },
  en: { system: 'Please output in English.', user: 'Please output all content in English.' },
}

const RELATION_CONTEXT: Record<AstroZhichangRelationType, { roleA: string; roleB: string; scene: string; lens: string; risk: string; advice: string }> = {
  'leader-subordinate': {
    roleA: '领导',
    roleB: '下属',
    scene: '领导与下属的上下级关系',
    lens: '围绕权力位差、汇报节奏、授权边界、绩效反馈与上下级沟通展开',
    risk: '直面位差张力：谁习惯压场、谁需要被看见、谁容易觉得被管太死、谁容易觉得没人撑腰；别把上下级说成主仆，更别怂恿一方压另一方。',
    advice: '汇报频率与格式、反馈时机（公开表扬/私下纠偏）、授权清单、升职谈话窗口、边界与背锅预案，每条都要能落地。',
  },
  colleague: {
    roleA: '同事A',
    roleB: '同事B',
    scene: '平级同事的协作关系',
    lens: '围绕平级协作、资源竞争、分工默契、会议沟通与办公室相处展开',
    risk: '直面协作与竞争张力：谁适合牵头、谁适合补位、谁容易抢功、谁闷头做事、谁在会议里顶牛；别挑拨对立、别教人站队。',
    advice: '分工接口、信息共享节奏、冲突降温话术、争取资源的表达、抢功劳的署名约定，每条都要能落地。',
  },
}

function buildSystemPrompt(locale: string, relationType: AstroZhichangRelationType): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const ctx = RELATION_CONTEXT[relationType]

  return `你是一位混迹人间多年的隐士老友，占星只是你茶余饭后看人的一把尺子。你说话随性、风趣、接地气，擅长用生活里的比喻把星盘关系讲明白；可以损，但不刻薄；一针见血，但拒绝空泛套话——就像酒后跟老友闲聊，不端着。
${langHook.system}

## 任务
基于双人西方占星本命盘数据（回归黄道 + Placidus 宫位：上升、MC、行星落宫、跨盘相位、宫位叠加），为${ctx.scene}写一份职场合盘解读。解读必须拆成以下五张卡片，每张卡片以 ## 标题 开头，且**最后一张必须是「关系优化建议」**：

## 职场合盘总论
## 性格与行事化学反应
## 事业宫位与权力位差
## 跨盘相位：协作与雷区
## 关系优化建议

## 各卡片要求

- 「职场合盘总论」：3-5 句点明这段${ctx.scene}的整体画风，要具体到上升/MC/日月金火，别写"两人性格互补"这种万能句。
- 「性格与行事化学反应」：用太阳、月亮、水星、火星的星座与落宫，讲两人上班时一个像什么、一个像什么，碰撞出什么火花与毛刺。
- 「事业宫位与权力位差」：${ctx.lens}。必须引用第 10 宫（事业/声望）、MC、第 6 宫（日常事务/协作）、土星与木星落宫，讲清谁在外场谁在内场、谁扛责任谁出资源。
- 「跨盘相位：协作与雷区」：引用真实跨盘相位（合/六合/刑/拱/冲，带容许度）和宫位叠加（如"${ctx.roleA}的金星落在${ctx.roleB}的第10宫"），说清顺的地方与拧巴的地方。
- 「关系优化建议」：这是**独立且最重要的一张卡片**，必须分条列出 3-5 条**具体可执行**的建议，围绕 ${ctx.advice}。禁止空泛鸡汤（"多沟通""互相理解"算空泛），每条要有明确动作 + 适用场景，像老友支招，最好带一两句江湖气的俏皮话。

## 约束（必须严格遵守）

1. 全程围绕"${ctx.scene}"，${ctx.lens}；不谈婚恋、桃花、子女、家庭琐事。
2. ${ctx.risk}
3. 必须具体到宫位与相位：点名星座、第几宫、行星、相位类型与容许度，禁止脱离星盘数据的空话。
4. 不许预测具体事件与时间（如"某年升职/被裁"），不许说"一定""绝对""必分""天作之合"。
5. 不许下医学/心理诊断，不许贴"抑郁""人格障碍""PUA"等标签。
6. 幽默需保持善意：不怂恿站队、不搞办公室政治式对立、不下职场歧视性结论（性别、年龄、地域、学历歧视一律禁止）。
7. 每张卡片 150~260 字；「关系优化建议」分条列出，每条独立成句。
8. 输出只包含上述五张卡片，不要添加卡片以外的总结、免责声明或额外段落。
9. ${langHook.user}`
}

function formatChart(p: AstroZhichangCalcResult['personA']): string {
  const c: AstroZhichangChart = p.chart
  const planets = c.planets
    .map(pl => `${pl.nameZh}${pl.isRetrograde ? '（逆）' : ''}${pl.signNameZh}${pl.degree}°（${pl.house}宫）`)
    .join('、')
  const tenth = c.planets.filter(pl => pl.house === 10).map(pl => pl.nameZh).join('、') || '无'
  const sixth = c.planets.filter(pl => pl.house === 6).map(pl => pl.nameZh).join('、') || '无'
  const saturn = c.planets.find(pl => pl.name === 'Saturn')
  const jupiter = c.planets.find(pl => pl.name === 'Jupiter')
  return `【${p.roleLabel}·${p.name}】（出生城市：${p.cityName}，时区 UTC${p.timezone >= 0 ? '+' : ''}${p.timezone}）
上升：${c.ascendant.signNameZh}（第1宫头）　MC（天顶）：${c.midheaven.signNameZh}
主要行星：${planets}
第10宫（事业）行星：${tenth}　第6宫（事务/协作）行星：${sixth}
土星落宫：${saturn ? saturn.house + '宫' : '—'}　木星落宫：${jupiter ? jupiter.house + '宫' : '—'}`
}

function dedupeAspects(aspects: AstroZhichangCalcResult['crossAspects']) {
  const seen = new Set<string>()
  return aspects.filter((a) => {
    const key = [a.planetA, a.planetB].sort().join('-') + `-${a.aspectType}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function formatAspects(aspects: AstroZhichangCalcResult['crossAspects']): string {
  const unique = dedupeAspects(aspects)
  if (!unique.length) return '无显著跨盘主要相位。'
  return unique.slice(0, 16).map(a => `${a.note}`).join('\n')
}

function formatOverlays(overlays: AstroZhichangCalcResult['aPlanetsInB'], label: string, target: string): string {
  if (!overlays.length) return ''
  const career = overlays.filter(o => [10, 6, 2, 1].includes(o.house))
  const lines = (career.length ? career : overlays).map(o => `${label}的${o.planet}落在${target}的第${o.house}宫`)
  return lines.join('、')
}

function buildUserPrompt(result: AstroZhichangCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const ctx = RELATION_CONTEXT[result.relationType]
  const a = result.personA
  const b = result.personB

  return `请根据以下双人西方占星（回归黄道 + Placidus 宫位制）合盘数据，按系统提示的五张卡片结构输出，最后一张必须是「关系优化建议」并分条列出。

【关系类型】${ctx.scene}（${ctx.roleA} = ${a.name}，${ctx.roleB} = ${b.name}）

【计算口径】
${result.methodNote}

${formatChart(a)}

${formatChart(b)}

【上升对比】
${a.roleLabel}上升：${result.ascendantComparison.aSignZh}　${b.roleLabel}上升：${result.ascendantComparison.bSignZh}
${a.roleLabel}MC：${result.careerFocus.personA.mcSignZh}（10宫行星：${result.careerFocus.personA.tenthHousePlanets.join('、') || '无'}）
${b.roleLabel}MC：${result.careerFocus.personB.mcSignZh}（10宫行星：${result.careerFocus.personB.tenthHousePlanets.join('、') || '无'}）

【跨盘主要相位】
${formatAspects(result.crossAspects)}

【事业相关宫位叠加】
${formatOverlays(result.aPlanetsInB, a.roleLabel, b.roleLabel)}
${formatOverlays(result.bPlanetsInA, b.roleLabel, a.roleLabel)}

请严格按以下五张卡片输出，每张以 ## 标题 开头，最后一张「关系优化建议」必须分条列出 3-5 条具体可执行建议：
## 职场合盘总论
## 性格与行事化学反应
## 事业宫位与权力位差
## 跨盘相位：协作与雷区
## 关系优化建议

${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result: AstroZhichangCalcResult; locale?: string }>(event)
  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const locale = body.locale || 'zh-CN'
  const relationType: AstroZhichangRelationType = body.result.relationType === 'colleague' ? 'colleague' : 'leader-subordinate'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale, relationType)
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
        if (!line || !line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const parsed = JSON.parse(payload)
          const token = isOpenAi
            ? parsed.choices?.[0]?.delta?.content
            : (parsed.response ?? parsed.choices?.[0]?.delta?.content)
          if (token) emit({ type: 'text', text: token })
        } catch {
          // ignore malformed chunk
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
