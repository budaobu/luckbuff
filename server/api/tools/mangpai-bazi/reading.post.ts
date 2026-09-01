import type { MangpaiCalcResult, MangpaiSection } from '~/types/mangpai-bazi'

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

const SECTION_IDS = new Set(['family', 'career', 'wealth', 'marriage', 'health', 'timing'])

function buildSystemPrompt(locale: string): string {
  const hook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  return `你是山中的幽默隐士，熟悉盲派八字。结论要像签筒边的一句直断：快、准、稳，可带一点善意调侃，但不绕圈、不写论文。
${hook.system}

## 盲派推理规则

1. 先分宾主体用：日主与其要做的事为体，财官、六亲、岁运为宾；体能不能承载，或宾方夺走主体目标，就是做功受阻。
2. 用取象定事项：把干支还原成具体生活象，如文书、库柜、车马、门庭、灯烛、契约、炉灶、江河；不堆砌术语。
3. 用做功定成败：生、克、合、冲、刑、害要看是否完成目标。合而能开为成，冲而得用为动，刑害夹击为耗。
4. 用宫位定六亲：年柱看祖上长辈，月柱看父母兄弟与门户，日支看配偶内宅，时柱看子女晚景。
5. 用大运流年定应期：大运开库、换气、引动四柱，流年填实、合冲日支或关键宫位时可给年份；没有清晰引动就不写年份。
6. 十二神煞只作流年象意补充：太岁为岁君与变动，青龙为喜气生长，丧门为吊丧忧疑，六合为合作牵线，官符为文书规则，小耗为细碎耗损，大耗为破费挪移，朱雀为口舌文书，白虎为急痛压力，贵神为贵人解围，吊客为探望牵挂，病符为倦怠节律。同一神煞须回到宫位与做功判断，不单字定吉凶。

## 安全边界

- 财官婚姻六亲可以直断趋势和关键年份，但不用绝对宿命口吻。
- 健康只提作息、情绪、压力、节律等倾向，不给疾病名称、诊断或医疗建议。
- 官非只提文书、规则、合作边界等压力，不认定案由或结果。
- 涉及寿元、重症、死亡，一律转换为阶段性提醒；不断死期、不绝症式断凶。

## 输出协议

只输出 7 行，使用半角竖线分隔。字段内不得再出现竖线、换行、JSON、markdown、编号、标题。应期只写四位公元年，多年用中文顿号分隔；无应期则第四段留空。

OV|36字内总纲，点出宾主体用与今年主象
SEC|family|六亲精断，26到46字，点宫位与取象|16到24字做功依据|可选年份
SEC|career|事业官运，26到46字，点官星、权柄或事业门径|16到24字做功依据|可选年份
SEC|wealth|财运，26到46字，点财库、进财或破耗方式|16到24字做功依据|可选年份
SEC|marriage|婚姻情感，26到46字，点日支、配偶宫或情感动作|16到24字做功依据|可选年份
SEC|health|健康倾向提示，24到40字，只说作息情绪压力|16到24字做功依据|通常留空
SEC|timing|近几年应期，30到48字，按先后说清关键年份的动作|16到24字做功依据|至少3个年份

六段必须把十二神煞的象意织进去，全篇至少覆盖六个不同神煞；不要逐个罗列神煞表。依据只写取象、做功、宾主或宫位逻辑，不写置信度、评分、概率或百分比。`
}

function compactChart(result: MangpaiCalcResult): string {
  const chart = result.chart
  const pillar = (label: string, value: typeof chart.year | null) =>
    value ? `${label}${value.gan}${value.zhi}` : `${label}未知`

  const dayun = chart.currentDaYun
    ? `${chart.currentDaYun.gan}${chart.currentDaYun.zhi}运（${chart.currentDaYun.ageRange[0]}-${chart.currentDaYun.ageRange[1]}岁）`
    : '未入大运'
  const years = result.liunian
    .map(item => `${item.year}年${item.gan}${item.zhi}（${item.shishen}${item.relations.length ? `、与日支${item.relations.join('')}` : ''}）`)
    .join('；')
  const gods = result.shensha.natal
    .map(item => `${item.gan}${item.zhi}${item.god}`)
    .join('，')
  const ring = result.shensha.ring
    .map(item => `${item.branch}${item.name}`)
    .join(' ')

  return [
    `四柱：${pillar('年', chart.year)} ${pillar('月', chart.month)} ${pillar('日', chart.day)} ${pillar('时', chart.hour)}`,
    `日主：${result.dayMaster.gan}（${result.dayMaster.wuxing}，${chart.riZhuStrength}）；格局：${chart.geju}；喜用：${chart.xiyong}；忌神：${chart.jishen}`,
    `五行：木${chart.wuxingScore['木']} 火${chart.wuxingScore['火']} 土${chart.wuxingScore['土']} 金${chart.wuxingScore['金']} 水${chart.wuxingScore['水']}`,
    `大运：${dayun}；起运：${chart.qiyunAge}岁`,
    `流年：${years}`,
    `十二神煞规则：${result.shensha.rule}`,
    `命局神煞：${gods}`,
    `流年环：${ring}`,
  ].join('\n')
}

function parsePeriods(value: string, minYear: number, maxYear: number): number[] {
  const matches = value.match(/(?:^|\D)(\d{4})(?=\D|$)/g) ?? []
  return matches
    .map(item => Number.parseInt(item.replace(/\D/g, ''), 10))
    .filter(year => Number.isInteger(year) && year >= minYear && year <= maxYear)
    .filter((year, index, list) => list.indexOf(year) === index)
    .slice(0, 4)
}

function parseStructuredLine(line: string, minYear: number, maxYear: number): { type: 'overview', text: string } | { type: 'section', section: MangpaiSection } | null {
  const clean = line.trim().replace(/\r$/, '')
  const parts = clean.split('|').map(part => part.trim())
  if (parts[0] === 'OV' && parts[1]) {
    return { type: 'overview', text: parts[1].replace(/\s+/g, ' ').slice(0, 80) }
  }

  if (parts[0] === 'SEC' && parts[1] && SECTION_IDS.has(parts[1]) && parts[2] && parts[3]) {
    return {
      type: 'section',
      section: {
        id: parts[1] as MangpaiSection['id'],
        text: parts[2].replace(/\s+/g, ' ').slice(0, 110),
        basis: parts[3].replace(/\s+/g, ' ').slice(0, 70),
        periods: parsePeriods(parts[4] ?? '', minYear, maxYear),
      },
    }
  }
  return null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result?: MangpaiCalcResult; locale?: string }>(event)
  const result = body?.result

  if (
    !result?.chart?.year?.gan
    || !result.chart.month?.gan
    || !result.chart.day?.gan
    || !result.dayMaster?.gan
    || !Array.isArray(result.shensha?.ring)
    || result.shensha.ring.length !== 12
    || !Array.isArray(result.liunian)
    || result.liunian.length < 1
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid calc result' })
  }

  const locale = body?.locale ?? 'zh-CN'
  const config = useRuntimeConfig()
  if (!config.aiBaseUrl || !config.aiApiKey || !config.aiModel) {
    throw createError({ statusCode: 500, statusMessage: 'AI service is not configured' })
  }

  const maxTokens = Math.min(Number(config.aiMaxTokens) || 2600, 2600)
  const minYear = result.currentYear - 1
  const maxYear = result.currentYear + 6

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
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
    if ('flush' in res && typeof (res as any).flush === 'function') (res as any).flush()
  }

  let upstream: Response
  try {
    upstream = await fetch(config.aiBaseUrl as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.aiApiKey}`,
      },
      body: JSON.stringify({
        model: config.aiModel,
        stream: true,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: buildSystemPrompt(locale) },
          {
            role: 'user',
            content: `请基于以下盲派排盘动态推理，不要套用具体干支断语表：\n${compactChart(result)}\n\n${LANGUAGE_HOOKS[locale]?.user ?? LANGUAGE_HOOKS['zh-CN']!.user}`,
          },
        ],
      }),
    })
  }
  catch (error) {
    emit({ type: 'error', message: `AI 服务连接失败：${(error as Error).message}` })
    res.end()
    return
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    emit({ type: 'error', message: `AI 服务错误（${upstream.status}）${detail ? `：${detail.slice(0, 220)}` : ''}` })
    res.end()
    return
  }

  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let contentLine = ''
  const seen = new Set<string>()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue

        try {
          const parsed = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string } }>
            response?: string
          }
          const token = parsed.choices?.[0]?.delta?.content ?? parsed.response ?? ''
          if (!token) continue

          contentLine += token
          const pieces = contentLine.split('\n')
          contentLine = pieces.pop() ?? ''
          for (const piece of pieces) {
            if (!piece.trim()) continue
            const parsedLine = parseStructuredLine(piece, minYear, maxYear)
            if (!parsedLine) continue
            const key = parsedLine.type === 'overview' ? 'OV' : parsedLine.section.id
            if (seen.has(key)) continue
            seen.add(key)
            emit(parsedLine)
          }
        }
        catch {
          // Ignore supplier heartbeat chunks.
        }
      }
    }
  }
  catch (error) {
    emit({ type: 'error', message: `读取 AI 流时出错：${(error as Error).message}` })
  }
  finally {
    if (contentLine.trim()) {
      const finalLine = parseStructuredLine(contentLine, minYear, maxYear)
      if (finalLine) {
        const key = finalLine.type === 'overview' ? 'OV' : finalLine.section.id
        if (!seen.has(key)) {
          seen.add(key)
          emit(finalLine)
        }
      }
    }
    emit({ type: 'complete', received: seen.size })
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
