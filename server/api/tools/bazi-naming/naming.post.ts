import type { BaziChart } from '~/types/bazi'

interface NamingInput {
  surname: string
  gender?: 'male' | 'female'
  chart: BaziChart
  locale?: string
  nameStyle?: string
}

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

  return `你是一位精通八字命理与传统姓名学的起名大师。你的任务是根据用户提供的生辰八字命盘与姓氏，分析五行喜忌，推荐能够补益命局、寓意吉祥的中文名字。

${langHook.system}

## 八字起名核心原则

1. **分析八字**：先看日主强弱、五行分布、喜用神与忌神。
2. **五行补益**：优先选用喜用神五行的字，避免忌神五行的字。
3. **音形义兼顾**：名字要读音优美、书写流畅、寓意吉祥，避免不雅谐音。
4. **三才配置**：姓名天、人、地三才的五行配置宜相生相合，避免严重相克。
5. **性别倾向**：男性名字偏阳刚大气，女性名字偏温婉雅致。
6. **现代审美**：推荐符合现代汉语使用习惯、易于书写与称呼的名字。

## 输出格式

请严格按以下结构输出，每个名字独立成段，使用 "。"" 开头：

### 推荐名字 N：{名字}
- **拼音**：{拼音}
- **五行属性**：{字1}（{五行}）· {字2}（{五行}）
- **八字契合**：{为什么这个名字适合该八字，结合喜用神说明}
- **字义寓意**：{字义与整体寓意解读}
- **三才配置**：{天格五行} · {人格五行} · {地格五行}（{吉凶判断}）

## 约束

- 共推荐 5–8 个名字，包含单字名与双字名。
- 每个名字必须给出拼音、五行属性、八字契合理由、字义寓意和三才配置。
- 不要添加总结性段落、免责声明或 AI 身份说明。
- 所有解释必须基于八字命理与姓名学原理，不能空泛。`
}

function buildUserPrompt(input: NamingInput, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const genderText =
    input.gender === 'male' ? '男' : input.gender === 'female' ? '女' : '不限'
  const chart = input.chart

  const currentDaYunStr = chart.currentDaYun
    ? `${chart.currentDaYun.gan}${chart.currentDaYun.zhi}（${chart.currentDaYun.ageRange[0]}-${chart.currentDaYun.ageRange[1]}岁）`
    : '尚未起运'

  const dayunCompact = chart.dayuns
    .map(d => `${d.index}.${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]})`)
    .join(', ')

  const styleHint = input.nameStyle?.trim()
    ? `\n【名字风格偏好】${input.nameStyle.trim()}`
    : ''

  return `请为以下信息推荐名字：

【姓氏】${input.surname}
【性别】${genderText}${styleHint}

八字命盘：年${chart.year.gan}${chart.year.zhi} 月${chart.month.gan}${chart.month.zhi} 日${chart.day.gan}${chart.day.zhi} 时${chart.hour ? chart.hour.gan + chart.hour.zhi : '未知'}
日主${chart.riZhu}（${chart.riZhuStrength}）| 格局${chart.geju} | 喜用${chart.xiyong} | 忌${chart.jishen}
五行：木${chart.wuxingScore['木']}% 火${chart.wuxingScore['火']}% 土${chart.wuxingScore['土']}% 金${chart.wuxingScore['金']}% 水${chart.wuxingScore['水']}%
当前大运：${currentDaYunStr}
大运：${dayunCompact}
起运年龄：${chart.qiyunAge}岁
当前年龄：${chart.currentAge}岁

请根据八字五行喜忌，结合姓氏推荐 5–8 个吉祥好名，并按指定格式输出。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<NamingInput>(event)

  if (!body?.surname || typeof body.surname !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid surname' })
  }
  if (!body?.chart || typeof body.chart !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid chart' })
  }

  const locale = body.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body, locale)

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
