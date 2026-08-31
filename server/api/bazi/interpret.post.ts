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
  return `你是一个八字命刊编辑。把命盘数据与本地分析整理成适合杂志海报的简要解读。
${langHook.system}

绝对规则：
- 每条解读独占一行，必须使用下方指定字段前缀和英文竖线分隔
- 不要输出 JSON、markdown、标题、编号、解释、前言或后缀
- 字段值中不要出现竖线、换行或引号
- 总论 36 字内；每段摘要 18 字内；每段解读 72 字内；每条建议 28 字内`
}

function buildUserPrompt(
  chart: BaziChart,
  locale: string,
): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

  const currentDaYunStr = chart.currentDaYun
    ? `${chart.currentDaYun.gan}${chart.currentDaYun.zhi}（${chart.currentDaYun.ageRange[0]}-${chart.currentDaYun.ageRange[1]}岁）`
    : '尚未起运'

  const dayunCompact = chart.dayuns.map(d => `${d.index}.${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]})`).join(', ')

  return `八字命盘：年${chart.year.gan}${chart.year.zhi} 月${chart.month.gan}${chart.month.zhi} 日${chart.day.gan}${chart.day.zhi} 时${chart.hour ? chart.hour.gan + chart.hour.zhi : '未知'}
日主${chart.riZhu}（${chart.riZhuStrength}）| 格局${chart.geju} | 喜用${chart.xiyong} | 忌${chart.jishen}
五行：木${chart.wuxingScore['木']}% 火${chart.wuxingScore['火']}% 土${chart.wuxingScore['土']}% 金${chart.wuxingScore['金']}% 水${chart.wuxingScore['水']}%
当前大运：${currentDaYunStr}
大运：${dayunCompact}

请逐行输出以下字段，不要遗漏或调整字段名：
OV|36字内人生总论
PS|personality|18字内性格摘要
PD|personality|72字内性格解读
PT|personality|标签|标签|标签
PS|career|18字内事业摘要
PD|career|72字内事业与财运解读
PT|career|标签|标签|标签
PS|relationship|18字内感情摘要
PD|relationship|72字内感情解读
PT|relationship|标签|标签|标签
PS|health|18字内健康摘要
PD|health|72字内健康与生活解读
PT|health|标签|标签|标签
SCR|relationship|0到100整数
SCR|career|0到100整数
SCR|wealth|0到100整数
SCR|health|0到100整数
SCR|study|0到100整数
DYD|大运序号|干支|年龄段|0到100整数|吉凶|20字内简评
HIS|年龄|年份|20字内关键时期描述
ADV|28字内建议

要求：
1. PS/PD/PT 四组都必须输出，key 依次为 personality、career、relationship、health
2. DYD 必须包含全部 ${chart.dayuns.length} 步大运
3. HIS 3 条，ADV 4 条
4. 结构化内容必须简明可直接排入杂志版面，语气积极温暖
5. ${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const { chart, locale = 'zh-CN' } = await readBody<{
    chart: BaziChart
    locale?: string
  }>(event)

  if (!chart) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chart' })
  }

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  const maxTokens = Math.min(Number(config.aiMaxTokens) || 8192, 4096)

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(chart, locale)

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
          // 供应商心跳或非 JSON 分片，不需要进入海报。
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
