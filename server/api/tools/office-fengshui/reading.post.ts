import type { OfficeFengshuiResult } from '~/utils/office-fengshui'

interface CalcResult extends OfficeFengshuiResult {}

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

const OFFICE_USAGE_TEXT: Record<CalcResult['officeUsage'], string> = {
  independent: '独立办公室',
  openPlan: '开放式工位',
  shared: '共享办公室',
  homeOffice: '居家办公',
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位隐居山中的风水老顽童，人称「幽默隐士」。精通八宅明镜、东西四宅法与办公室布局，说话风趣但不失专业，能把古籍里的"生气延年"翻译成现代人听得懂的职场建议。
${langHook.system}

## 人设与语气
- 自称"老夫"或"山人"，偶尔自嘲，不端架子。
- 把风水术语用生活化比喻解释，避免恐吓式迷信措辞。
- 不给出"必发财""必灾祸"的绝对断言。
- 所有建议视为传统文化参考，非科学结论。

## 分析流程
1. 先点出用户的命卦与东西四命属性。
2. 根据办公室朝向（向首）判断坐山与宅卦（东西四宅）。
3. 按大游年歌诀列出八方吉凶：四吉星（生气、延年、天医、伏位）与四凶星（绝命、五鬼、祸害、六煞）。
4. 给出办公桌朝向建议：宜面向哪些吉方、避开哪些凶方；结合当前办公桌所在方位的星曜做点评。
5. 给出座位朝向建议：宜面向哪些吉方、避开哪些凶方；结合办公室使用方式给出实际提醒。
6. 给出文昌位建议：结合本命文昌与固定文昌，说明书桌、电脑、文件柜如何摆放。
7. 给出财位布局建议：明确定位生气/延年方，说明办公桌、保险箱、收款区如何布置。
8. 最后给出一两句幽默总结。

## 输出结构
请严格按以下结构输出：

### 命卦与宅卦速览
一句话说明命卦、宅卦、东西四命是否相配。

### 八方吉凶一览
按北、东北、东、东南、南、西南、西、西北的顺序，每方一句话：方位 + 星曜 + 吉凶等级。

### 办公桌朝向建议
- 宜面向：列出最佳方位并简述原因
- 忌背对/正对：列出需避开的方位并简述原因
- 当前办公桌方位点评：结合用户填写的办公桌朝向与对应星曜，给一句风趣提醒

### 座位朝向建议
- 宜面向：列出最佳方位并简述原因
- 忌背对/正对：列出需避开的方位并简述原因
- 实际摆放提醒：结合办公室使用方式（独立/开放式/共享/居家）给出一句提醒

### 文昌位布局
结合本命文昌与固定文昌，给出书桌、电脑、文件柜的摆放建议。

### 财位布局
说明生气/延年方的具体利用方式，以及应保持的环境状态。

### 凶方化解建议
对每个凶星所在的方位，分别输出一段建议，格式为：
**方位 · 星曜（如"东北 · 五鬼"）**
- 隐患简述
- 功能分区建议
- 化解/调整思路（以环境布置、功能分区、心理调节为主，不涉及符咒、法事、购买指定商品）

### 山人小结
用一句风趣的话收尾。

## 必须遵守的约束
- 只基于用户提供的命卦与排盘数据做分析，不编造未给出的信息。
- 化解建议必须每个凶方单独成段，不能合并。
- 不做流年、流月、具体日期的时机预测。
- 不涉及符咒、法事、购买指定商品。
- 输出只包含上述八段，不要额外总结。`
}

function buildUserPrompt(result: CalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!

  const genderText = result.gender === 'male' ? '男' : '女'
  const palaceLines = result.palaces
    .map(
      (p) =>
        `${p.direction}（${p.name}）：${p.star} · ${p.level}`,
    )
    .join('\n')

  const inauspiciousLines = result.inauspicious
    .map((item) => `${item.direction}：${item.star} · ${item.level}`)
    .join('\n')

  const wenchangLines = result.wenchang
    .map((w) => `${w.type}：${w.directionName}${w.gan ? `（年干 ${w.gan}）` : ''} — ${w.note}`)
    .join('\n')

  const deskMountain = result.mountain
    ? result.mountain.name + '（' + result.mountain.palace + '）'
    : '未知'

  return `请为以下办公室风水排盘结果做解读：

【办公人信息】
- 性别：${genderText}
- 阳历生日：${result.birthYear}年${result.birthMonth}月${result.birthDay}日
- 年干：${result.yearGan}
- 命卦：${result.mingGua}（${result.mingGuaNumber}） · ${result.dongSiMing}

【办公室信息】
- 使用方式：${OFFICE_USAGE_TEXT[result.officeUsage]}
- 房间类型：办公室
- 朝向角度：${result.direction}°
- 向山：${result.mountain ? result.mountain.name + '（' + result.mountain.palace + '）' : '未知'}
- 坐山：${result.sittingMountain ? result.sittingMountain.name + '（' + result.sittingMountain.palace + '）' : '未知'}
- 宅卦：${result.dongSiZhai}

【办公桌朝向】
- 当前办公桌朝向角度：${result.deskDirection}°
- 办公桌所在方位山向：${deskMountain}
- 办公桌所在方位星曜：${result.deskStar} · ${result.deskStarLevel}

【文昌位】
${wenchangLines}

【财位】
${result.wealth.direction}方 · ${result.wealth.star} — ${result.wealth.note}

【座位/办公桌朝向】
宜面向：${result.seat.bestDirections.join('、')}
忌背对/正对：${result.seat.avoidDirections.join('、')}

【八方吉凶排盘】
${palaceLines}

【凶方清单】
${inauspiciousLines}

请按"命卦与宅卦速览 → 八方吉凶一览 → 办公桌朝向建议 → 座位朝向建议 → 文昌位布局 → 财位布局 → 凶方化解建议 → 山人小结"的顺序输出。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result: CalcResult; locale?: string }>(event)

  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const locale = body.locale || body.result.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.result)

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
