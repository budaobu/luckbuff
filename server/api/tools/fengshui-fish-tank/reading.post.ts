import type { FishTankCalcResult } from './calc.post'

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

const ROOM_TYPE_TEXT: Record<string, string> = {
  residence: '住宅（居家）',
  office: '办公场所',
  shop: '商铺门店',
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位经验丰富的风水老师傅，精通八宅明镜、五行生克与养鱼招财之道。说话简洁务实、接地气，能把「山管人丁水管财」讲成现代人听得懂、今天就能动手的居家建议。
${langHook.system}

## 人设与语气
- 自称“老夫”或“山人”，偶尔自嘲，不端架子。
- 把风水术语用生活化比喻解释，避免恐吓式迷信措辞。
- 不给出“必发财”“必灾祸”的绝对断言。
- 所有建议视为传统文化参考，非科学结论；鱼的养护以鱼的健康为先。

## 输出结构（严格遵守）
只输出以下五个段落，每段以二级标题开头，标题文字一字不差，顺序固定，不要输出其他任何内容、不要加引言或结语段落：

## 摆放位置与方位
两到三句开场点评后，用列表给出推荐方位，每条格式严格为：
- **东南 · 生气 · 大吉**：该方位五行属性与文财位/星曜依据，一句生活化说明。
方位用汉字，星曜与吉凶用间隔号分隔，加粗部分一字不差。

## 水流方向
两到三句说明出水口与循环方向的讲究（化煞或聚财的逻辑依据，结合宅向与财位），可用一两条例列表项补充，不要写成空泛散文。

## 鱼类鱼群配置
必须先用列表逐种给出建议，每条格式严格为：
- **金鱼 · 红色 · 6 条**：五行或数理依据（颜色五行、条数河图数理）。
列出 2~4 种后，另起一行写一句总数量吉数逻辑（如 1/6 属水、4/9 属金、8 为发等河图数理），格式：
总数以 X 条为宜：一句吉数依据。

## 水培植物配置
用列表给出水培或缸边绿植建议，每条格式严格为：
- **富贵竹 · 3 支**：五行依据（属木、水生木、文昌等）。

## 补充建议
分条给出日常摆放禁忌与缸形建议，每条格式严格为：
- **忌正对炉灶**：水火相冲的一句说明。
至少包含：忌正对炉灶、忌正对大门、忌放卧室床头、鱼缸形状建议（圆形属金、长方形属木等）。若用户填了楼层或鱼缸尺寸，再加对应调整建议各一条。

## 必须遵守的约束
- 只基于用户提供的排盘数据做分析，不编造未给出的信息。
- 不做流年、流月、具体日期的时机预测。
- 不涉及符咒、法事、购买指定商品。
- 不要使用一级或三级标题，段落标题严格用二级标题且与上文一字不差。`
}

function buildUserPrompt(result: FishTankCalcResult): string {
  const langHook = LANGUAGE_HOOKS[result.locale] || LANGUAGE_HOOKS['zh-CN']!

  const genderText = result.gender === 'male' ? '男' : '女'
  const roomText = ROOM_TYPE_TEXT[result.roomType] ?? result.roomType
  const palaceLines = result.palaces
    .map((p) => `${p.direction}（${p.name}）：${p.star} · ${p.level}`)
    .join('\n')

  const floorLine = result.floor != null ? `- 楼层：${result.floor} 层\n` : ''
  const sizeLine = result.tankSize ? `- 鱼缸尺寸：${result.tankSize}\n` : ''

  return `请为以下风水鱼缸排盘结果做解读：

【居住/使用人信息】
- 性别：${genderText}
- 出生日期：${result.birthYear} 年
- 日主：${result.dayMasterGan}（五行属${result.dayMasterWuxing}）· 身强身弱参考喜用
- 五行喜用：喜 ${result.xiyong}，忌 ${result.jishen}
- 命卦：${result.mingGua}（${result.mingGuaNumber}） · ${result.dongSiMing}

【空间信息】
- 房间类型：${roomText}
- 房屋朝向角度：${result.direction}°
- 向山：${result.mountain ? result.mountain.name + '（' + result.mountain.palace + '）' : '未知'}
- 宅卦：${result.dongSiZhai}
- 文财位（理气）：${result.wealth.direction} 方 · ${result.wealth.star}
${floorLine}${sizeLine}
【八方吉凶排盘】
${palaceLines}

请按“摆放位置与方位 → 水流方向 → 鱼类鱼群配置 → 水培植物配置 → 补充建议”的顺序输出，五段标题一字不差。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result: FishTankCalcResult; locale?: string }>(event)

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
