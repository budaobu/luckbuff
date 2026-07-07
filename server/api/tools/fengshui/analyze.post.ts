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
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  return `你是一位传统堪舆风水顾问，人称「堪舆子」，江南三元派世家传人。精通三元玄空飞星、八宅明镜、形势峦头，兼修择日学与八字命理。
${langHook.system}

## 你的学术立场
- 主修三元玄空飞星（沈竹礽一脉）
- 兼通八宅明镜（东西四宅法）
- 重形势峦头，以「龙穴砂水向」为纲
- 对「日本风水」「现代简化风水」持保留态度
- 坦承局限：「风水为辅，人为为主」

## 分析流程
请按以下步骤进行分析：

1. **确定宅基信息**
   - 根据宅朝向角度判断坐向（如 180° 为坐南朝北）
   - 根据入住/建造年份确定元运（三元九运）
   - 当前为九运（2024-2043）

2. **八宅命卦分析**
   - 根据出生年份与性别计算命卦
   - 判断东西四命
   - 给出四吉四凶方

3. **玄空飞星分析**
   - 判断当旺星、次旺星
   - 分析宅运旺衰
   - 指出旺位与凶位

4. **综合布局建议**
   - 主卧、书房、财位的建议方位
   - 需要避开的方位
   - 具体可操作的风水调整

5. **流年注意**
   - 当年需特别留意之处

## 输出格式

## 宅基信息
（坐向、元运、命卦）

## 八宅分析
（命卦、四吉四凶方、适合的房间布局）

## 玄空飞星
（当旺星分布、旺位凶位判断）

## 布局建议
（主卧、财位、书房、需要避开的方位，具体可操作）

## 流年注意
（当年需特别留意之处）

【重要约束】
- 不说「你命中注定…」（这是算命，非堪舆）
- 不说「必须摆XX才能化解」（商业套路）
- 不无故恐吓：凶局未到明显发作程度，说明隐患即可
- 引经据典但用白话解释
- 输出只包含上述五个段落，不要添加总结或建议
- 禁止预测具体流年、大运、时机、吉凶日期
- 每个段落 3~5 句话，简明扼要`
}

function buildUserPrompt(
  gender: string,
  birthDate: string,
  birthHour: string | undefined,
  direction: number,
  buildYear: number | undefined,
  moveInYear: number | undefined,
  locale: string,
): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!

  const genderText = gender === 'male' ? '男' : '女'
  const hourText = birthHour || '未知'

  // 计算出生年份后两位用于命卦
  const birthYear = new Date(birthDate).getFullYear()
  const yearSuffix = String(birthYear).slice(-2)

  // 方向转坐向
  const directionToSitting = (d: number) => {
    const normalized = ((d % 360) + 360) % 360
    const directions = ['子（北）', '丑（东北偏北）', '艮（东北）', '寅（东北偏东）', '卯（东）', '辰（东南偏东）', '巽（东南）', '巳（东南偏南）', '午（南）', '未（西南偏南）', '坤（西南）', '申（西南偏西）', '酉（西）', '戌（西北偏西）', '乾（西北）', '亥（西北偏北）']
    // 坐向 = 朝向的反方向
    const sitting = (normalized + 180) % 360
    const idx = Math.round(sitting / 22.5) % 16
    return directions[idx]
  }

  const sitting = directionToSitting(direction)
  const facing = (() => {
    const normalized = ((direction % 360) + 360) % 360
    const directions = ['子（北）', '丑（东北偏北）', '艮（东北）', '寅（东北偏东）', '卯（东）', '辰（东南偏东）', '巽（东南）', '巳（东南偏南）', '午（南）', '未（西南偏南）', '坤（西南）', '申（西南偏西）', '酉（西）', '戌（西北偏西）', '乾（西北）', '亥（西北偏北）']
    const idx = Math.round(normalized / 22.5) % 16
    return directions[idx]
  })()

  // 元运判断
  const yunYear = moveInYear || buildYear || new Date().getFullYear()
  const getYun = (year: number) => {
    if (year >= 2024 && year <= 2043) return '九运（2024-2043）'
    if (year >= 2004 && year <= 2023) return '八运（2004-2023）'
    if (year >= 1984 && year <= 2003) return '七运（1984-2003）'
    if (year >= 1964 && year <= 1983) return '六运（1964-1983）'
    if (year >= 1944 && year <= 1963) return '五运（1944-1963）'
    if (year >= 1924 && year <= 1943) return '四运（1924-1943）'
    if (year >= 1904 && year <= 1923) return '三运（1904-1923）'
    if (year >= 1884 && year <= 1903) return '二运（1884-1903）'
    return '一运（1864-1883）'
  }

  const yun = getYun(yunYear)

  return `请为以下住宅做风水堪舆分析：

【居住人信息】
- 性别：${genderText}
- 出生日期：${birthDate}
- 出生时辰：${hourText}
- 出生年份后两位：${yearSuffix}

【宅基信息】
- 宅朝向角度：${direction}°
- 坐山（后方）：${sitting}
- 朝向（前方）：${facing}
- 入住年份：${moveInYear || '未知'}
- 建造年份：${buildYear || '未知'}
- 参考元运：${yun}

请按 宅基信息 → 八宅分析 → 玄空飞星 → 布局建议 → 流年注意 的顺序输出五段解读。

${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    gender: string
    birthDate: string
    birthHour?: string
    direction: number
    buildYear?: number
    moveInYear?: number
    locale?: string
  }>(event)

  if (!body?.gender || !body?.birthDate || body?.direction === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(
    body.gender,
    body.birthDate,
    body.birthHour,
    body.direction,
    body.buildYear,
    body.moveInYear,
    locale,
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
