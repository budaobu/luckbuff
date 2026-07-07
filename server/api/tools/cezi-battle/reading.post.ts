interface BattleSummary {
  mode: 'name' | 'single'
  winnerSide: 'A' | 'B'
  nameA: string
  nameB: string
  charsA: string[]
  charsB: string[]
  scoreA: number
  scoreB: number
  roundResults: ('A' | 'B' | null)[]
  finalIntegrityA: number
  finalIntegrityB: number
  critsA: number
  critsB: number
  fracturesA: number
  fracturesB: number
}

function isNonNegInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isNumberInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= min && value <= max
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function validateBattleSummary(summary: unknown): { ok: true } | { ok: false; message: string } {
  if (!summary || typeof summary !== 'object') {
    return { ok: false, message: 'Missing battle summary' }
  }

  const s = summary as Record<string, unknown>

  if (s.mode !== 'name' && s.mode !== 'single') {
    return { ok: false, message: 'mode must be "name" or "single"' }
  }
  if (s.winnerSide !== 'A' && s.winnerSide !== 'B') {
    return { ok: false, message: 'winnerSide must be "A" or "B"' }
  }
  if (typeof s.nameA !== 'string' || typeof s.nameB !== 'string') {
    return { ok: false, message: 'nameA and nameB must be strings' }
  }
  if (!isStringArray(s.charsA) || !isStringArray(s.charsB)) {
    return { ok: false, message: 'charsA and charsB must be string arrays' }
  }
  if (!isNonNegInt(s.scoreA) || !isNonNegInt(s.scoreB)) {
    return { ok: false, message: 'scoreA and scoreB must be non-negative integers' }
  }
  if (!isNumberInRange(s.finalIntegrityA, 0, 100) || !isNumberInRange(s.finalIntegrityB, 0, 100)) {
    return { ok: false, message: 'finalIntegrityA and finalIntegrityB must be between 0 and 100' }
  }
  if (
    !isNonNegInt(s.critsA) ||
    !isNonNegInt(s.critsB) ||
    !isNonNegInt(s.fracturesA) ||
    !isNonNegInt(s.fracturesB)
  ) {
    return { ok: false, message: 'crit and fracture counts must be non-negative integers' }
  }
  if (!Array.isArray(s.roundResults)) {
    return { ok: false, message: 'roundResults must be an array' }
  }
  if (s.roundResults.some(r => r !== 'A' && r !== 'B' && r !== null)) {
    return { ok: false, message: 'roundResults items must be "A", "B", or null' }
  }

  const expectedRounds = Math.max(s.charsA.length, s.charsB.length)
  if (s.roundResults.length !== expectedRounds) {
    return {
      ok: false,
      message: `roundResults length (${s.roundResults.length}) must match max(charsA.length, charsB.length) = ${expectedRounds}`,
    }
  }

  const scoreA = s.scoreA as number
  const scoreB = s.scoreB as number
  const winner = s.winnerSide as 'A' | 'B'

  if (winner === 'A' && scoreA < scoreB) {
    return { ok: false, message: 'winnerSide is A but scoreA is less than scoreB' }
  }
  if (winner === 'B' && scoreB < scoreA) {
    return { ok: false, message: 'winnerSide is B but scoreB is less than scoreA' }
  }

  if (s.mode === 'name') {
    const rounds = s.roundResults as ('A' | 'B' | null)[]
    const countA = rounds.filter(r => r === 'A').length
    const countB = rounds.filter(r => r === 'B').length
    if (scoreA !== countA || scoreB !== countB) {
      return {
        ok: false,
        message: `name mode scores (${scoreA}:${scoreB}) do not match roundResults counts (${countA}:${countB})`,
      }
    }
  }

  return { ok: true }
}

function buildSystemPrompt(): string {
  return `你是一位毒舌又风趣的赛事解说员。请使用简体中文，为一场"厕纸/名字大作战"生成一段简短、有趣、真实的战报点评。
风格要求：像成年人之间开玩笑，带一点吐槽和真实感，不鸡汤、不劝诫、不算命、不说教、不给人生建议。
内容要求：提到双方名字、最终比分、暴击次数、折裂次数和最终胜者。
长度要求：控制在100个汉字以内，尽量精炼。`
}

function buildUserPrompt(summary: BattleSummary): string {
  const roundsText = summary.roundResults
    .map((r, i) => `第${i + 1}回合：${r === null ? '平局' : r + '方胜'}`)
    .join('，')
  const winnerName = summary.winnerSide === 'A' ? summary.nameA : summary.nameB

  return `请为以下对战结果写一段有趣的简短战报：

【对战模式】${summary.mode === 'name' ? '名字对战' : '单字对战'}
【红方】${summary.nameA}（${summary.charsA.join('')}）
【蓝方】${summary.nameB}（${summary.charsB.join('')}）
【比分】${summary.scoreA} : ${summary.scoreB}
【胜者】${winnerName}（${summary.winnerSide}方）
【完整度】A方 ${summary.finalIntegrityA}% / B方 ${summary.finalIntegrityB}%
【暴击】A方 ${summary.critsA} 次 / B方 ${summary.critsB} 次
【折裂】A方 ${summary.fracturesA} 次 / B方 ${summary.fracturesB} 次
【逐回合】${roundsText}

请控制在100字以内，只用简体中文输出，不要分段。`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result?: BattleSummary; locale?: string }>(event)

  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const validation = validateBattleSummary(body.result)
  if (!validation.ok) {
    throw createError({ statusCode: 400, statusMessage: validation.message })
  }

  const summary = body.result
  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(summary)

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
