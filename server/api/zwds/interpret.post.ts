import type { ZwdsChart } from '~/types/zwds'
import type { UserProfile } from '~/types/user'

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

function getZodiacForYear(year: number): string {
  const zhi = ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未']
  return zhi[year % 12]
}

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']
  return `你是一位精通紫微斗数的命理分析师。请根据命盘数据，用现代、理性、温和的语言进行解读。
${langHook.system}

核心原则：
- 定位「概率性人生参考工具」，不做命运预言
- 不使用绝对化表达（不用"一定""必然""肯定会"）
- 不制造负面情绪，"大凶""破败""克妻"等词汇转化为中性描述
- 将传统命理语言翻译为现代人可理解的生活场景语言
- 提示风险时同步给出应对方向
- 本命各宫解读 50–80 字，大限与流年各 100 字以内

输出格式要求：
- 使用 Markdown 格式
- 用 ## 标题分段，必须包含以下所有章节（顺序固定）
- 每个章节下用正文叙述，可用 **加粗** 突出重点，可用 - 列表分点
- 不要输出任何 JSON、代码块或其他格式`
}

function buildUserPrompt(
  chart: ZwdsChart,
  profile: UserProfile,
  analysisSummary: string,
  locale: string,
): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']

  const currentDaXianStr = chart.currentDaXian
    ? `第${chart.currentDaXian.index}大限 ${chart.currentDaXian.gongName}宫（${chart.currentDaXian.gongZhi}）${chart.currentDaXian.ageRange[0]}-${chart.currentDaXian.ageRange[1]}岁`
    : '尚未起运'

  const currentYear = new Date().getFullYear()

  const gongList = chart.gongs.map(g =>
    `${g.name}(${g.zhi})[主:${g.mainStars.join('+') || '空宫'}][辅:${g.auxStars.join('+') || '无'}][四化:${g.siHua.map(s => `${s.star}化${s.type}`).join('+') || '无'}]`,
  ).join('\n')

  const daXianList = chart.daXians.map(d =>
    `${d.index}.${d.gongName}(${d.gongZhi})${d.ageRange[0]}-${d.ageRange[1]}岁[${d.mainStars.join('+') || '借对宫'}]`,
  ).join('\n')

  const siHuaList = chart.gongs
    .flatMap(g => g.siHua.map(s => `${s.star}化${s.type}→${g.name}宫`))
    .join('，') || '无'

  const truncatedSummary = analysisSummary.length > 600
    ? analysisSummary.slice(0, 600) + '...'
    : analysisSummary

  return `请为以下紫微斗数命盘生成解读报告。

=== 命盘基本信息 ===
年柱：${chart.yearGan}${chart.yearZhi}
性别：${chart.gender === 'male' ? '阳男' : '阴女'}
命宫：${chart.mingGong.zhi}（${chart.mingGong.mainStars.join('、') || '借对宫'}）
身宫：${chart.shenGong.zhi}（${chart.shenGong.mainStars.join('、') || '借对宫'}）
五行局：${chart.wuxingJu}局
当前大限：${currentDaXianStr}
当前年份：${currentYear}年（${getZodiacForYear(currentYear)}）

=== 十二宫星曜分布 ===
${gongList}

=== 四化飞星 ===
${siHuaList}

=== 大限排列 ===
${daXianList}

=== 参考分析 ===
${truncatedSummary}

请按以下章节顺序输出解读（每节 150–300 字）：

## 命格总览 / Life Pattern Overview
结合命宫主星、三方四正（财帛、官禄、迁移）给出整体格局概括。例如「事业导向型」「感情优先型」「财富积累型」等总体判断。

## 命宫解读 / Personality
性格主调、待人处世风格、外在给人的第一印象。结合主星组合和四化影响。

## 事业与财帛 / Career & Finance
工作类型倾向、赚钱方式与财运模式、主动财与被动财的倾向。结合事业宫与财帛宫主星及三方四正。

## 感情与婚姻 / Relationships
感情模式特质、伴侣类型倾向、婚姻中需注意的互动模式。结合夫妻宫与福德宫。

## 健康与抗压 / Health
体质倾向、健康注意事项、抗压能力。结合疾厄宫与命宫。

## 六亲与社交 / Family & Social
与长辈、兄弟姐妹、子女的关系模式，以及人际关系质量。结合父母宫、兄弟宫、子女宫、交友宫。

## 当前大限 / Current Period
当前大限（${currentDaXianStr}）的整体基调（发展期/调整期/收获期/困难期），这十年各领域（感情、事业、财运、健康）的方向性判断。如有重要时间节点转折请提示。

## 流年提示 / Yearly Forecast
${currentYear}年流年太岁入宫影响、流年四化叠盘分析、当年各领域（感情、事业、财运、健康）具体方向性建议。用「顺遂 / 平稳 / 留意 / 谨慎」之一做吉凶评级，附一句话总结。

## 综合建议 / Recommendations
基于命盘特征的 3–5 条实用指引，语言落地，避免过于抽象。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const { chart, profile, summary = '', locale = 'zh-CN' } = await readBody<{
    chart: ZwdsChart
    profile: UserProfile
    summary?: string
    locale?: string
  }>(event)

  if (!chart) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chart' })
  }

  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(chart, profile, summary, locale)

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
