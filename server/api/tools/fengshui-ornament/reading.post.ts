import type { Direction } from '~/utils/bazhai'
import { ORNAMENT_RULES, type ElementGap } from '~/utils/ornament-rules'
import type { FengshuiOrnamentCalcResult } from '~~/server/utils/fengshui-ornament/calc'

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

const ROOM_TYPE_TEXT: Record<string, { 'zh-CN': string; 'zh-TW': string; en: string }> = {
  bedroom: { 'zh-CN': '卧室', 'zh-TW': '臥室', en: 'bedroom' },
  study: { 'zh-CN': '书房', 'zh-TW': '書房', en: 'study room' },
  office: { 'zh-CN': '办公室', 'zh-TW': '辦公室', en: 'office' },
  hall: { 'zh-CN': '客厅', 'zh-TW': '客廳', en: 'living room' },
  shop: { 'zh-CN': '店铺', 'zh-TW': '店鋪', en: 'shop' },
}

const STAR_TEXT: Record<string, string> = {
  shengqi: '生气', tianyi: '天医', yannian: '延年', fuwei: '伏位',
  wugui: '五鬼', liusha: '六煞', huohai: '祸害', jueming: '绝命',
}

const AUSPICIOUS_YOUXING = new Set(['shengqi', 'tianyi', 'yannian', 'fuwei'])

function buildSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  return `你是一位隐居山中的风水老顽童，人称「幽默隐士」。精通玄空飞星、紫白流年、八宅游星与八字命理，说话风趣但不失专业，能把冷冰冰的飞星盘翻译成"今天回家就能把东西摆对"的具体动作。
${langHook.system}

## 人设与语气
- 自称"老夫"或"山人"，偶尔自嘲，不端架子。
- 把风水术语用生活化比喻解释，避免恐吓式迷信措辞。
- 不给出"必发财""必灾祸"的绝对断言。
- 所有建议视为传统文化参考，非科学结论。

## 你的任务
用户会提供一份已经由规则库判定好的房间风水结构化数据（宅飞星、流年煞位、逐方位五行缺口判定、逐人八宅游星与命理专属位），以及每个判定类型对应的"候选物件池"。你只做两件事：
1. 在每个方位的候选物件池范围内挑选一件（至多两件）具体摆件，每次可从池内换着挑，避免机械重复。
2. 把判定结果转译成普通人能照做的分层建议。

## 必须遵守的约束
1. 摆件只能从给定物件池里挑，不得编造池外物件，不得给出价格、品牌、购买链接。
2. 煞位（太岁/五黄/三煞/暗建煞）与缺角方位的判定是 avoid_only，只能建议化解类物件并明确说"这里不要放催旺类的东西"，绝不能在这些方位推荐招财催旺摆件。
3. 五行缺口判定类型不可更改：判定 metal_drain 的方位就从金属性物件池挑，不得跨池。
4. 多位使用者的游星归数组必须逐人分别说明，不得合并成一个总分或综合评级；同一方位对不同的人吉凶相反时，如实指出冲突，不替用户拍板。
5. 不做流年、流月、具体日期的时机预测，不涉及符咒、法事。
6. 输出面向普通用户：不得出现 metal_drain、avoid_only、elementGap、山星/向星这类英文标识符或代码术语；判定类型一律转译成中文自然语言（如"金泄土""只化不催"），飞星数值只允许出现在最后"为什么（专业依据）"一段。

## 输出结构（严格按以下六段，每段以 ## 开头）

## 开场定性
一两句话给这个房间的整体气场定性，幽默开场，不上来就甩数据。

## 逐方位摆件建议
按北、东北、东、东南、南、西南、西、西北的顺序，每个方位一小段：这个位置是什么情况、放什么（从物件池挑）、为什么。判定为 neutral 的方位一两句带过即可。

## 煞位避坑提醒
把太岁、五黄、三煞、暗建煞、缺角方位单独拎出来，用调侃但认真的语气提醒"只化不催"，防止用户好心办坏事。没有煞位就说今年这间房没有要躲的方位。

## 各人专属方位
逐个使用者说明：命卦、四吉四凶各自落在哪几个方位、文昌/桃花/天乙贵人位是否命中这个房间，以及对个人最有利的一个方位。多人吉凶冲突的方位要明确指出"这个位置对A是X对B是Y，你俩自己商量"。

## 优先级建议
如果用户没空全屋摆，只挑一个方位先动手，给出你的建议排序（先补哪个、再补哪个），一句话说清理由。

## 为什么（专业依据）
把宅飞星数值、流年星曜、游星归类的判定依据简要列出，供想深究的人展开看。`
}

function buildUserPrompt(result: FengshuiOrnamentCalcResult, locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
  const lang = (locale in LANGUAGE_HOOKS ? locale : 'zh-CN') as 'zh-CN' | 'zh-TW' | 'en'
  const roomText = ROOM_TYPE_TEXT[result.roomType]?.[lang] ?? result.roomType

  const palaceLines = result.environment.palaces.map((p) => {
    const flags: string[] = []
    if (p.isTaiSui) flags.push('太岁')
    if (p.isWuHuang) flags.push('五黄')
    if (p.isSanSha) flags.push('三煞')
    if (p.isAnJianSha) flags.push('暗建煞')
    if (p.isDoor) flags.push('门位')
    if (p.hasIrregularCorner) flags.push('缺角/凸出')
    const pool = p.elementGap === 'neutral'
      ? '（无需摆件）'
      : `物件池：${ORNAMENT_RULES[p.elementGap as Exclude<ElementGap, 'neutral'>].items.map(i => i.label).join('、')}`
    return `${p.direction}：山星${p.mountainStar} 向星${p.facingStar} 运星${p.periodStar} 流年星${p.yearStar}｜判定=${p.elementGap}（${p.gapReasons.join('；')}）${flags.length ? '｜标记：' + flags.join('、') : ''}｜${pool}`
  }).join('\n')

  const personLines = result.perPerson.map((person) => {
    const assignment = Object.entries(person.baguaAssignment)
      .map(([dir, key]) => `${dir}=${STAR_TEXT[key as string] ?? key}`)
      .join('，')
    const luckyDirs = Object.entries(person.baguaAssignment)
      .filter(([, key]) => AUSPICIOUS_YOUXING.has(key as string))
      .map(([dir, key]) => `${dir}(${STAR_TEXT[key as string] ?? key})`)
      .join('、')
    const unluckyDirs = Object.entries(person.baguaAssignment)
      .filter(([, key]) => !AUSPICIOUS_YOUXING.has(key as string))
      .map(([dir, key]) => `${dir}(${STAR_TEXT[key as string] ?? key})`)
      .join('、')
    return `【${person.nickname}】${person.gender === 'male' ? '男' : '女'}，命卦${person.mingGua}（${person.dongSiMing}），日主${person.dayGan}，年支${person.yearZhi}
- 游星分布：${assignment}
- 四吉方：${luckyDirs}｜四凶方：${unluckyDirs}
- 房间朝向落在其游星位：${person.roomFacingStar.direction}方 = ${STAR_TEXT[person.roomFacingStar.star] ?? person.roomFacingStar.star}（${person.roomFacingStar.auspicious ? '吉' : '凶'}）
- 文昌位：${person.wenchangDirection ?? '无'}｜桃花位：${person.taohuaDirection ?? '无'}｜天乙贵人位：${person.guirenDirections.join('、') || '无'}`
  }).join('\n\n')

  return `请为以下房间风水判定结果挑选摆件并转译为分层建议：

【房间】${roomText}，长${result.roomGeometry.lengthM}米 × 宽${result.roomGeometry.widthM}米，门在${result.roomGeometry.doorDirection}方
【朝向】${result.xuankong.sittingLabel}${result.xuankong.facingLabel}（${result.direction}°）｜${result.xuankong.period.name}（建成/装修于${result.year}年）
【格局】${result.xuankong.pattern ? `${result.xuankong.pattern.name}：${result.xuankong.pattern.description}` : '无明显特殊格局'}
【流年】${result.liunian.ganzhiYear}年，年星${result.liunian.yearCenter}入中；太岁在${result.liunian.taiSuiDirection}，岁破在${result.liunian.suiPoDirection}，三煞在${result.liunian.sanShaDirection}
${result.roomGeometry.irregular?.length ? `【异形标注】${result.roomGeometry.irregular.map(r => `${r.direction}方${r.type === 'missing' ? '缺角' : '凸出'}`).join('、')}` : ''}

【八方位判定与物件池】
${palaceLines}

【逐人命理层】
${personLines}

请按"开场定性 → 逐方位摆件建议 → 煞位避坑提醒 → 各人专属方位 → 优先级建议 → 为什么（专业依据）"的顺序输出六段内容。${langHook.user}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ result: FengshuiOrnamentCalcResult; locale?: string }>(event)

  if (!body?.result) {
    throw createError({ statusCode: 400, statusMessage: 'Missing result' })
  }

  const locale = body.locale || body.result.locale || 'zh-CN'
  const config = useRuntimeConfig()
  const isOpenAi = config.aiProvider === 'openai' || config.aiProvider === 'newapi' || config.aiProvider === 'gptniux'
  let maxTokens = Number(config.aiMaxTokens) || 8192
  if (maxTokens > 327680) maxTokens = 8192

  const systemPrompt = buildSystemPrompt(locale)
  const userPrompt = buildUserPrompt(body.result, locale)

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
