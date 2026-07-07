 import type { ZwdsChart } from '~/types/zwds'

const LANGUAGE_HOOKS: Record<'zh-CN' | 'zh-TW' | 'en', { system: string; user: string }> = {
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

function getLangHook(locale: string): { system: string; user: string } {
  if (locale === 'zh-CN' || locale === 'zh-TW' || locale === 'en') {
    return LANGUAGE_HOOKS[locale]
  }
  return LANGUAGE_HOOKS['zh-CN']
}

function buildSystemPrompt(locale: string): string {
  const langHook = getLangHook(locale)
   return `你是一位精通紫微斗数的合婚分析师。请根据两个人的紫微斗数命盘，用现代、理性、温和的语言分析他们的姻缘匹配度、性格契合度、感情模式与相处建议。
 ${langHook.system}

 ## 分析框架（必须严格按以下结构输出，使用 markdown ## 标题）

 ## 合盘总论
 （30-50字概括两人紫微合盘的整体结论，如"两人命宫主星相生，夫妻宫互补，感情基础稳固"等）

 ## 命宫互动
 （对比两人命宫主星组合，分析核心性格是否契合、价值观是否同频、相处中的主要吸引点与摩擦点）

 ## 夫妻宫对比
 （分析两人夫妻宫主星与四化，判断彼此在感情中的需求、期待与表达方式是否匹配）

 ## 福德宫情感模式
 （通过福德宫看两人的情感需求、精神世界与婚姻观，判断是否能长期相互滋养）

 ## 四化飞星关系
 （分析两人命盘中四化飞星的互动，判断缘分牵引、付出回报与情感波动的关键因素）

 ## 大限同步性
 （分析两人当前及未来大限的走势是否同步、是否相互助力，判断感情的长期稳定性）

 ## 综合建议
 （3-5条具体、实用的感情/婚姻建议，语气积极温暖，兼顾命理与现实）

 ## 约束（必须严格遵守）

 1. 分析基于紫微斗数理论，但要用现代白话语言解读
 2. 不给出绝对化的"能成"或"不能成"判断，而是分析匹配度的高低与关键因素
 3. 禁止预测具体时间点（如"2026年8月结婚"），只说大限阶段或年龄段的趋势
 4. 语气积极温暖，避免恐吓性语言；即使有相冲也要给出化解建议
 5. 每条分析要有命理依据，不能空泛
 6. 输出只包含上述七个段落，不要添加总结或免责声明
 7. ${langHook.user}`
 }

 function formatChartCompact(chart: ZwdsChart, name?: string, gender?: string): string {
   const ming = chart.mingGong
   const shen = chart.shenGong
   const fuqi = chart.gongs.find(g => g.name === '夫妻')
   const fude = chart.gongs.find(g => g.name === '福德')

   const currentDaXian = chart.currentDaXian
     ? `第${chart.currentDaXian.index}大限 ${chart.currentDaXian.gongName}宫（${chart.currentDaXian.gongZhi}）${chart.currentDaXian.ageRange[0]}-${chart.currentDaXian.ageRange[1]}岁`
     : '尚未起运'

   const gongList = chart.gongs.map(g =>
     `${g.name}(${g.zhi})[主:${g.mainStars.join('+') || '空宫'}][辅:${g.auxStars.join('+') || '无'}][四化:${g.siHua.map(s => `${s.star}化${s.type}`).join('+') || '无'}]`,
   ).join('\n')

   const sihuaList = chart.gongs
     .flatMap(g => g.siHua.map(s => `${s.star}化${s.type}→${g.name}宫`))
     .join('，') || '无'

   const prefix = name ? `【${name}】` : '【一方】'
   const genderText = gender === 'male' ? '男' : gender === 'female' ? '女' : '未填'

   return `${prefix}
 性别：${genderText}
 年柱：${chart.yearGan}${chart.yearZhi}
 命宫：${ming.zhi}（${ming.mainStars.join('、') || '借对宫'}）
 身宫：${shen.zhi}（${shen.mainStars.join('、') || '借对宫'}）
 五行局：${chart.wuxingJu}局
 夫妻宫：${fuqi ? fuqi.zhi + '（' + (fuqi.mainStars.join('、') || '借对宫') + '）' : '未知'}
 福德宫：${fude ? fude.zhi + '（' + (fude.mainStars.join('、') || '借对宫') + '）' : '未知'}
 当前大限：${currentDaXian}

 === 十二宫分布 ===
 ${gongList}

 === 四化飞星 ===
 ${sihuaList}`
 }

function buildUserPrompt(
  chartA: ZwdsChart,
   chartB: ZwdsChart,
   locale: string,
   nameA?: string,
   nameB?: string,
   genderA?: string,
   genderB?: string,
): string {
  const langHook = getLangHook(locale)

   const daXianCompactA = chartA.daXians.map(d =>
     `${d.index}.${d.gongName}(${d.gongZhi})${d.ageRange[0]}-${d.ageRange[1]}岁[${d.mainStars.join('+') || '借对宫'}]`,
   ).join(', ')
   const daXianCompactB = chartB.daXians.map(d =>
     `${d.index}.${d.gongName}(${d.gongZhi})${d.ageRange[0]}-${d.ageRange[1]}岁[${d.mainStars.join('+') || '借对宫'}]`,
   ).join(', ')

   return `${formatChartCompact(chartA, nameA, genderA)}

 === 大限排列 ===
 ${daXianCompactA}

 ${formatChartCompact(chartB, nameB, genderB)}

 === 大限排列 ===
 ${daXianCompactB}

 请按 合盘总论 → 命宫互动 → 夫妻宫对比 → 福德宫情感模式 → 四化飞星关系 → 大限同步性 → 综合建议 的顺序输出七段分析。${langHook.user}`
 }

 export default defineEventHandler(async (event) => {
   const body = await readBody<{
     chartA: ZwdsChart
     chartB: ZwdsChart
     locale?: string
     nameA?: string
     nameB?: string
     genderA?: string
     genderB?: string
   }>(event)

   if (!body?.chartA || !body?.chartB) {
     throw createError({ statusCode: 400, statusMessage: 'Missing charts' })
   }

   const locale = body.locale || 'zh-CN'
   const config = useRuntimeConfig()
   const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
   let maxTokens = Number(config.aiMaxTokens) || 8192
   if (maxTokens > 327680) maxTokens = 8192

   const systemPrompt = buildSystemPrompt(locale)
   const userPrompt = buildUserPrompt(
     body.chartA,
     body.chartB,
     locale,
     body.nameA,
     body.nameB,
     body.genderA,
     body.genderB,
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
