import type { LiuYaoResult } from '~/types/liuyao'

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

interface SeekingContext {
  description?: string
  lastSeenTime?: string
  lastSeenPlace?: string
  lostItemDesc?: string
  relationship?: string
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位浸淫《周易》数十年的「六爻卦师」，专精六爻纳甲寻物断卦——通过本卦、变卦、动爻与用神的生克关系，定位失物方位、判断找回概率与时机。卦象排盘已由确定性脚本完成，请不要重新推算，直接基于提供的卦象数据做断卦。
${langHook.system}

## 角色与语气
- 卦师口吻：老练通透、带点江湖气和善意的提点，别端着、别写成一板一眼的报告；但断卦本身要准、要落地
- 结论先行，给出实际可操作的寻找建议，不夸大吉凶
- 所有判断视为传统文化参考，非科学结论

## 占断维度（内心推算依据，不要照抄术语）
1. 方位定位：以用神（失物）五行对应方位为主，参看用神所在卦宫（乾西北/坎北/艮东北/震东/巽东南/离南/坤西南/兑西）
2. 找回概率：用神旺相、得月建日辰生扶则易寻回；休囚、入墓、旬空则难，需待出空或冲实
3. 现状：看用神与世爻、应爻的关系及动爻变化判断失物状态（完好/被移动/在他人处/受损）
4. 时机：看用神逢值、逢合、出空、冲墓之期判断最佳寻找时辰
5. 具体地点：结合用神五行与六亲含义（父母主衣物文书/屋宅，妻财主财物饮食，兄弟主同辈处，官鬼主藏匿遗失，子孙主游玩处）

## 输出协议（严格逐行输出，每行一个字段，前缀后空一格，不要任何标题、序号、加粗或 markdown 标记）
OV: 一句话点题（能否寻回 + 大致方位，30 字以内，定基调）
DIR: 推算方位与藏匿位置（方位 + 距离远近 + 具体地点类型，融合成一句白话，40 字以内）
TIME: 最佳寻找时辰（如「今日申时（15-17点）」或「明日辰时」，带一句为何此时，36 字以内）
PROB: 寻回概率与失物现状（概率高/中/低 + 现状判断：完好/被移动/在他人处/受损等，40 字以内）
TIP: 一条具体寻找建议（去哪里、怎么找，口语化，40 字以内）
TIP: 再一条寻找建议（共 1-2 条，每条单独一行、都以「TIP: 」开头）
NOTE: 一句六爻卦师的收口提示（通透点拨或善意调侃，别端着，40 字以内）

## 约束
- 严格遵守行前缀 OV: / DIR: / TIME: / PROB: / TIP: / NOTE:，每个前缀单独成行、整行不换行
- 必须引用卦象具体数据（本卦/变卦/动爻/用神/五行方位），不编造
- 除上述行之外不输出任何其它内容`
}

function buildUserPrompt(
  result: LiuYaoResult,
  seekingContext: SeekingContext,
  locale: string,
): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!

  const linesText = result.lines_top_down
    ?.map((line, idx) => {
      const yinYang = line.value === 6 || line.value === 8 ? '阴' : '阳'
      const moving = line.isMoving ? `（动爻，${line.value === 6 ? '老阴变阳' : '老阳变阴'}）` : ''
      const shen = result.temporal_context?.六神?.[5 - idx] || ''
      return `- ${line.label}：${yinYang}爻 ${line.value}${moving}${shen ? ` · ${shen}` : ''}`
    })
    .join('\n') || ''

  const transformedText = result.transformed_lines_top_down
    ?.map((line) => {
      const yinYang = line.value === 6 || line.value === 8 ? '阴' : '阳'
      return `- ${line.label}：${yinYang}爻 ${line.value}`
    })
    .join('\n') || ''

  const movingLines = result.lines_top_down?.filter(l => l.isMoving) || []
  const movingText = movingLines.length > 0
    ? movingLines.map(l => `- ${l.label}：${l.value === 6 ? '老阴' : '老阳'}（变${l.value === 6 ? '阳' : '阴'}）`).join('\n')
    : '无动爻（静卦）'

  const ctx = seekingContext || {}

  return `请为以下六爻寻物卦象做断卦分析：

【占事类型】寻物（寻找丢失的物品）

【寻物信息】
${ctx.description ? `- 具体描述：${ctx.description}` : ''}
${ctx.lastSeenTime ? `- 最后见到时间：${ctx.lastSeenTime}` : ''}
${ctx.lastSeenPlace ? `- 最后见到地点：${ctx.lastSeenPlace}` : ''}
${ctx.lostItemDesc ? `- 失物描述：${ctx.lostItemDesc}` : ''}
${ctx.relationship ? `- 与失物关系：${ctx.relationship}` : ''}

【时空参数】
${result.temporal_context ? `- 月建：${result.temporal_context.月建}
- 日辰：${result.temporal_context.日辰}
- 时辰：${result.temporal_context.时辰}
- 旬空：${result.temporal_context.旬空}
- 六神（从上到下）：${result.temporal_context.六神?.join(' · ') || '未记录'}` : '未提供'}

【卦象信息】
- 本卦：${result.hexagram?.本卦 || '未知'}
- 变卦：${result.hexagram?.变卦 || '未知'}
- 互卦：${result.hexagram?.互卦 || '未知'}
- 世爻位：第${result.hexagram?.世爻位 || '?'}爻
- 应爻位：第${result.hexagram?.应爻位 || '?'}爻

【六爻排盘（从上到下）】
${linesText}

【变卦排盘（从上到下）】
${transformedText}

【动爻汇总】
${movingText}

${result.analysis_brief ? `【排盘系统简析】\n${result.analysis_brief}\n` : ''}

请严格按系统提示的逐行协议输出寻物断卦，结论先行，给出具体可操作的寻找建议。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const { result, seekingContext, locale = 'zh-CN' } = await readBody<{
    result: LiuYaoResult
    seekingContext?: SeekingContext
    locale?: string
  }>(event)

  if (!result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(result, seekingContext || {}, locale)

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
