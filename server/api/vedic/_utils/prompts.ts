import type { VedicChart, VedicDimension } from '~/types/vedic'

interface PromptOptions {
  chart: VedicChart
  cityName: string
  dimensions: VedicDimension[]
  gender: string
  timeUncertain: boolean
  locale: string
}

export const VEDIC_SYSTEM_PROMPT = `你是一位专业的吠陀占星分析师，精通 Jyotish 传统体系。
分析时严格遵守以下原则：
1. 所有结论必须同时列出支持信号和制约信号（正反双审），不做单边断言
2. 使用「倾向、可能、适合、需要注意」等表达，禁止绝对化预言
3. 出生时间精度不足时，主动降低 D9/D10 等高敏感分盘的结论强度，并标注「时间精度不足，仅供参考」
4. 语言贴近真实生活，不玄学化、不制造焦虑、不吓人
5. 默认中文输出；如收到 locale=en，则用自然英文输出`

export function buildPrompt(opts: PromptOptions): { systemPrompt: string; userPrompt: string } {
  const { chart, cityName, dimensions, gender, timeUncertain, locale } = opts

  const precisionNote = timeUncertain
    ? '\n⚠️ 用户标注出生时间不确定。请对依赖时间精度的结论（D9 Navamsha、D10 Dasamsha、第 7/10/4 宫的宫主时间）显式标注「时间精度不足，仅供参考」，并明显降低确定性表述。\n'
    : ''

  const genderNote = gender === 'male'
    ? '\n用户性别：男性。'
    : gender === 'female'
    ? '\n用户性别：女性。'
    : ''

  const dimSections = dimensions.map(d => DIM_PROMPTS[d] ?? '').filter(Boolean).join('\n\n')

  const localeNote = locale.startsWith('en')
    ? '\n请用自然英文输出。'
    : locale === 'zh-TW'
    ? '\n请用繁体中文输出。'
    : '\n请用简体中文输出。'

  const userPrompt = `${CHART_CONTEXT_PROMPT}

${formatChart(chart, cityName)}
${precisionNote}${genderNote}

请按以下维度进行分析：

${dimSections}

---
输出格式要求：
- 每个维度以 ## 标题开头（如 ## 性格结构）
- 每条核心结论后附：**支持信号**：… ｜ **制约信号**：…
- 使用「倾向、可能、适合、需要注意」等表达，禁止绝对化断言
- 语言贴近真实生活，不玄学化${localeNote}`

  return { systemPrompt: VEDIC_SYSTEM_PROMPT, userPrompt }
}

function formatChart(chart: VedicChart, cityName: string): string {
  const { ascendant, planets, dasha, birthData, ayanamsha } = chart

  const pList = planets.map(p =>
    `${p.graha}: ${p.signName}(${p.signNameZh}) ${p.degree.toFixed(1)}° / 第 ${p.house} 宫 / ${p.nakshatra} pada ${p.nakshatraPada}${p.isRetrograde ? ' ℞' : ''}`,
  ).join('\n')

  const currentDasha = dasha.find(d => d.isCurrent)
  const dashaList = dasha.slice(0, 6).map(d =>
    `${d.graha} 大运 ${d.startDate} → ${d.endDate}${d.isCurrent ? '（当前）' : ''}`,
  ).join('\n')

  const b = birthData
  const offsetSign = b.utcOffset >= 0 ? '+' : ''
  return `## 星盘数据

出生：${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')} ${String(b.hour).padStart(2, '0')}:${String(b.minute).padStart(2, '0')}，${cityName}（${b.lat.toFixed(2)}, ${b.lng.toFixed(2)}, UTC${offsetSign}${b.utcOffset}）
Ayanamsha（Lahiri）：${ayanamsha}°　宫位制：Whole Sign

上升 / Lagna：${ascendant.signName}(${ascendant.signNameZh}) ${ascendant.degree.toFixed(1)}°（${ascendant.nakshatra} pada ${ascendant.nakshatraPada}）

行星位置：
${pList}

当前大运：${currentDasha ? `${currentDasha.graha}（${currentDasha.startDate} → ${currentDasha.endDate}）` : '未知'}
大运列表（Vimshottari Dasha）：
${dashaList}`
}

const CHART_CONTEXT_PROMPT = '以下吠陀占星数据使用 Swiss Ephemeris 精算（Lahiri Ayanamsha，Whole Sign 宫位制），符合 Jyotish 主流标准。'

const DIM_PROMPTS: Record<VedicDimension, string> = {
  core: `## 性格结构

分析重点：
1. 上升星座（Lagna）对外在气质、行事风格的影响
2. 月亮星座对情绪底色、内心安全感的影响
3. 太阳星座对自我认同与核心驱动力的影响
4. 主要行星合相 / 互容关系揭示的核心人生主题
5. 整体性格优势，以及容易重复的行为模式

每条结论附支持信号和制约信号。`,

  career: `## 事业与财富

分析重点：
1. 适合的职业方向与工作环境（第 10 宫、10 宫主星、木星、土星位置）
2. 财富增长模式（第 2 宫、第 11 宫、金星）
3. 最适合的变现方式：打工 / 创业 / 自由职业 / 内容变现 / 咨询等
4. 当前大运对事业节奏的影响
5. 未来 1 年、3 年的主要机会窗口与需要警惕的风险

每条结论附支持信号和制约信号。`,

  love: `## 感情与关系

使用婚姻三阶段模型（第 7 宫关系确立 / 第 9 宫承诺与法律 / 第 11 宫社会公开）：
1. 在亲密关系中的核心需求（第 7 宫、金星）
2. 容易被什么气质 / 类型吸引，以及背后的原因
3. 关系中容易出现的模式与难点
4. 当前大运对感情状态的影响
5. 未来 1 年、3 年的关系动向

语气温和，不制造焦虑，不做绝对化预言。`,

  annual: `## 年度运势（未来 12 个月）

基于当前 Vimshottari Dasha，按时间阶段分析：
- 事业机会与节奏建议
- 财富趋势与注意事项
- 感情动向
- 情绪与身体需要关注的方面
- 每个阶段最适合采取的行动

最后输出「未来 12 个月行动建议清单」（5 条以内，要求可执行、落地）。`,
}
