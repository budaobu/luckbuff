import { getShiShen } from '../../../app/utils/bazi/constants.ts'
import { getDayPillar, getDiZhiRelation, SHENG_XIAO, type DiZhi, type TianGan } from '../bazi.ts'
import type { BaziChartResult } from './bazi-chart'
import type { TodayAlmanac } from '../../../app/types/today-almanac'

export const BAZI_PAIPAN_TOPICS = ['wealth', 'marriage', 'career', 'fate', 'noble', 'study'] as const
export type BaziPaipanTopic = typeof BAZI_PAIPAN_TOPICS[number]

export interface BaziTopicLensField {
  id: string
  label: string
  value: string
  evidence: string
  pillarKeys: Array<'year' | 'month' | 'day' | 'hour'>
}

export interface BaziTodayLens {
  date: string
  ganzhi: string
  tenGod: string
  relations: Array<{
    type: '合' | '冲' | '害' | '刑'
    pillarKey: 'year' | 'month' | 'day' | 'hour'
    value: string
  }>
  dailyShenSha: string[]
}

export interface BaziTopicLens {
  topic: BaziPaipanTopic
  date: string
  scope: 'today'
  natal: BaziTopicLensField[]
  today: BaziTodayLens | null
  todayFields: BaziTopicLensField[]
  focusPillarKeys: Array<'year' | 'month' | 'day' | 'hour'>
  nobleHints: string[]
  aiContext: string
}

interface TodaySlice {
  date: string
  ganzhi: string
  tenGod: string
  relations: BaziTodayLens['relations']
  dailyShenSha: string[]
  nobleHints: string[]
}

type Field = BaziTopicLensField
type PillarKey = Field['pillarKeys'][number]

function field(id: string, label: string, value: string, evidence: string, pillarKeys: PillarKey[] = []): Field {
  return { id, label, value, evidence, pillarKeys }
}

function tenGodText(chart: BaziChartResult, names: string[]) {
  return chart.energy.tenGods
    .filter(item => names.includes(item.name))
    .map(item => `${item.name} ${item.percent}%`)
    .join(' / ') || '未显'
}

function pillarsByTenGod(chart: BaziChartResult, names: string[]) {
  return chart.pillars.filter(pillar =>
    names.includes(pillar.shishenGan)
    || pillar.hiddenStems.some(hidden => names.includes(hidden.shishen)),
  )
}

function shenShaFields(chart: BaziChartResult, pattern: RegExp, idPrefix: string, label: string): Field[] {
  return chart.shensha
    .filter(item => pattern.test(item.name))
    .map(item => field(
      `${idPrefix}-${item.name}`,
      label,
      item.name,
      `${item.classification} · ${item.positions.join('/')} · ${item.description}`,
      chart.pillars
        .filter(pillar => item.positions.includes(pillar.label))
        .map(pillar => pillar.key),
    ))
}

function currentDayun(chart: BaziChartResult, date: string) {
  const year = Number(date.slice(0, 4))
  return chart.dayuns.find(dayun => year >= dayun.startYear && year <= dayun.endYear)
    ?? chart.dayuns.find(dayun => dayun.isCurrent)
    ?? chart.dayuns[0]
    ?? null
}

const TOPIC_LENS_CONFIG: Record<BaziPaipanTopic, {
  scope: 'today'
  natal: (chart: BaziChartResult, date: string) => Field[]
  useToday: boolean
}> = {
  wealth: {
    scope: 'today',
    useToday: true,
    natal: (chart, date) => [
      field('wealth-star', '财星', tenGodText(chart, ['正财', '偏财']), '十神权重与落点', pillarsByTenGod(chart, ['正财', '偏财']).map(p => p.key)),
      field('output-to-wealth', '食伤生财', pillarsByTenGod(chart, ['食神', '伤官']).map(p => `${p.label}${p.ganzhi}`).join(' / ') || '未成组', '食伤与财星同看'),
      field('peer-wealth', '比劫夺财', tenGodText(chart, ['比肩', '劫财']), '同辈与竞争份额', pillarsByTenGod(chart, ['比肩', '劫财']).map(p => p.key)),
      field(
        'wealth-store',
        '财库',
        chart.pillars
          .filter(p => ['辰', '戌', '丑', '未'].includes(p.zhi) && p.hiddenStems.some(hidden => ['正财', '偏财'].includes(hidden.shishen)))
          .map(p => `${p.label}${p.zhi}`)
          .join(' / ') || '未见财库',
        '辰戌丑未藏干按十神口径复核',
      ),
      field('current-dayun-wealth', '当前大运财星', currentDayun(chart, date) ? `${currentDayun(chart, date)!.ganzhi} · ${currentDayun(chart, date)!.shishenGan}/${currentDayun(chart, date)!.shishenZhi}` : '未起运', '当前大运十神'),
    ],
  },
  marriage: {
    scope: 'today',
    useToday: true,
    natal: chart => {
      const spouseNames = chart.birth.genderText === '女' ? ['正官', '七杀'] : ['正财', '偏财']
      const spouseStar = pillarsByTenGod(chart, spouseNames)
      return [
        field('spouse-palace', '日支配偶宫', `${chart.pillars[2]?.ganzhi} · ${chart.pillars[2]?.selfSitting}`, '日支与自坐十二运', ['day']),
        field('spouse-star', '配偶星', tenGodText(chart, spouseNames), '按原局性别口径取财官', spouseStar.map(p => p.key)),
        field('spouse-relations', '合冲信号', chart.relations.filter(item => item.positions.includes('日柱')).map(item => `${item.value}${item.type}`).join(' / ') || '未见引动', '原局关系引擎'),
        ...shenShaFields(chart, /红鸾|天喜|桃花/, 'marriage-star', '婚恋神煞'),
      ]
    },
  },
  career: {
    scope: 'today',
    useToday: true,
    natal: chart => [
      field('officer-seal', '官杀与印星', `${tenGodText(chart, ['正官', '七杀'])}；${tenGodText(chart, ['正印', '偏印'])}`, '责任、规则与承接', pillarsByTenGod(chart, ['正官', '七杀', '正印', '偏印']).map(p => p.key)),
      field('month-pattern', '月令格局', `${chart.pattern.name} · ${chart.pattern.status}`, chart.pattern.evidence.join('；'), ['month']),
      field('career-theme', '事业结构信号', chart.natalThemes.filter(item => item.id === 'career-structure').map(item => `${item.score}/100 ${item.status}`).join(' / ') || '未检出', '本命主题信号引擎'),
    ],
  },
  fate: {
    scope: 'today',
    useToday: false,
    natal: chart => [
      field('day-strength', '日主旺衰', `${chart.energy.strength} · 支持比${chart.energy.supportRatio}% · ${chart.energy.rootStatus}`, chart.energy.monthCommandDetail),
      field('pattern', '格局', `${chart.pattern.name} · ${chart.pattern.status}`, chart.pattern.evidence.join('；')),
      field('use-gods', '用神喜忌', `用${chart.energy.primaryUseGod}；辅${chart.energy.supportUseGod}；忌${chart.energy.avoidGod}`, chart.energy.adjustment),
      field('elements', '五行分布', chart.energy.wuxing.map(item => `${item.label}${item.percent}%`).join(' '), '可见与藏干信号加权'),
    ],
  },
  noble: {
    scope: 'today',
    useToday: true,
    natal: chart => shenShaFields(chart, /天乙贵人|天德贵人|月德贵人|文昌/, 'noble-star', '贵人类神煞'),
  },
  study: {
    scope: 'today',
    useToday: true,
    natal: chart => [
      field('resource-star', '印星', tenGodText(chart, ['正印', '偏印']), '学习、记忆与庇护', pillarsByTenGod(chart, ['正印', '偏印']).map(p => p.key)),
      field('output-star', '食伤', tenGodText(chart, ['食神', '伤官']), '表达与输出', pillarsByTenGod(chart, ['食神', '伤官']).map(p => p.key)),
      ...shenShaFields(chart, /文昌|学堂|词馆/, 'study-star', '文星神煞'),
      field('month-command', '月令', `${chart.energy.monthCommand} · ${chart.energy.monthCommandDetail}`, '司令与月令口径', ['month']),
    ],
  },
}

function buildTodaySlice(chart: BaziChartResult, date: string, almanac?: TodayAlmanac): TodaySlice {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number]
  const dayPillar = getDayPillar(year, month, day)
  const dayMaster = chart.pillars[2]?.gan as TianGan
  const relations = chart.pillars.flatMap(pillar => getDiZhiRelation(dayPillar.zhi as DiZhi, pillar.zhi).relations
    .map(type => ({
      type,
      pillarKey: pillar.key,
      value: `${dayPillar.zhi}${type}${pillar.zhi}`,
    })))

  const dailyShenSha = almanac
    ? [...almanac.jiShen, ...almanac.xiongSha].filter(Boolean)
    : []
  const nobleHints = almanac
    ? [
        ...almanac.luckyZodiacs.map(item => `生肖${item.zodiac}（${item.relation}）`),
        ...[almanac.positions.yangGui, almanac.positions.yinGui].filter(Boolean).map(value => `贵人方${value}`),
      ]
    : []

  return {
    date,
    ganzhi: `${dayPillar.gan}${dayPillar.zhi}`,
    tenGod: getShiShen(dayMaster, dayPillar.gan),
    relations,
    dailyShenSha,
    nobleHints,
  }
}

function todayFields(today: TodaySlice): Field[] {
  const fields = [
    field('today-ganzhi', '今日柱', today.ganzhi, '与 /tools/jishi 同用日柱口径'),
    field('today-ten-god', '流日十神', today.tenGod, '今日日干相对命局日主'),
  ]
  if (today.relations.length) {
    fields.push(field('today-relations', '合冲刑害', today.relations.map(item => `${item.pillarKey === 'year' ? '年' : item.pillarKey === 'month' ? '月' : item.pillarKey === 'day' ? '日' : '时'}${item.value}`).join(' / '), '今日地支相对命局各支', today.relations.map(item => item.pillarKey)))
  }
  if (today.dailyShenSha.length) fields.push(field('today-shensha', '当日神煞', today.dailyShenSha.join(' / '), '今日黄历引擎'))
  return fields
}

export function isBaziPaipanTopic(value: unknown): value is BaziPaipanTopic {
  return typeof value === 'string' && BAZI_PAIPAN_TOPICS.includes(value as BaziPaipanTopic)
}

export function buildBaziTopicLens(options: {
  chart: BaziChartResult
  topic: BaziPaipanTopic
  date: string
  almanac?: TodayAlmanac
}): BaziTopicLens {
  const config = TOPIC_LENS_CONFIG[options.topic]
  const natal = config.natal(options.chart, options.date)
  const today = config.useToday ? buildTodaySlice(options.chart, options.date, options.almanac) : null
  const todayFieldList = today ? todayFields(today) : []
  const focusPillarKeys = [...new Set([...natal, ...todayFieldList].flatMap(item => item.pillarKeys))]

  const aiContext = [
    `题目：${options.topic}`,
    `日期：${options.date}`,
    `四柱：${options.chart.pillars.map(pillar => `${pillar.label}${pillar.ganzhi}`).join(' ')}`,
    ...natal.map(item => `${item.label}：${item.value}（${item.evidence}）`),
    ...(today ? [`今日柱：${today.ganzhi}；流日十神：${today.tenGod}`, ...todayFieldList.map(item => `${item.label}：${item.value}`)] : []),
    ...(config.useToday && today?.nobleHints.length ? [`今日贵人提示：${today.nobleHints.join('、')}`] : []),
  ].join('\n')

  return {
    topic: options.topic,
    date: options.date,
    scope: config.scope,
    natal,
    today,
    todayFields: todayFieldList,
    focusPillarKeys,
    nobleHints: today?.nobleHints ?? [],
    aiContext,
  }
}

export function buildBaziChenyu(topic: BaziPaipanTopic, lens: BaziTopicLens): string {
  const todayTenGod = lens.today?.tenGod
  const choices: Record<BaziPaipanTopic, string[]> = {
    wealth: ['小步取实，不追热闹', '先守口袋，再谈机会'],
    marriage: ['先辨诚意，再靠近', '慢一点，反而稳'],
    career: ['抓住主线，少较劲', '今日宜收束一件事'],
    fate: ['看清结构，再迈步', '稳住自己，顺势走'],
    noble: ['开口问路，贵人近', '留一扇门给人帮'],
    study: ['读薄一层，用一点', '先懂一处，再贪多'],
  }
  const index = todayTenGod ? todayTenGod.charCodeAt(0) % choices[topic].length : 0
  return choices[topic][index] ?? choices[topic][0]!
}

export function buildBaziTopicFallback(lens: BaziTopicLens): string {
  const evidence = lens.natal
    .slice(0, 2)
    .map(item => `${item.label}是${item.value}`)
    .join('，')
  const today = lens.today
    ? `今日${lens.today.ganzhi}是${lens.today.tenGod}，先看它与命局的引动`
    : '这一题先看本命结构，不用追流日'
  const actions: Record<BaziPaipanTopic, string> = {
    wealth: '今天只收一笔能落袋的小成果。',
    marriage: '把话说清楚，比多猜一步更有用。',
    career: '先做完主线里最小的一件事。',
    fate: '照自己的节奏走，不用硬改方向。',
    noble: '主动问一次，别把机会留在群里。',
    study: '把今天读到的重点复述一遍。',
  }
  return `${evidence}。${today}。${actions[lens.topic]}`
}

export function baziTopicZodiacHint(lens: BaziTopicLens): string | null {
  if (!lens.nobleHints.length) return null
  const zodiac = lens.nobleHints.find(item => item.startsWith('生肖'))
  const branch = zodiac?.match(/生肖(.)/)?.[1]
  if (!branch) return null
  const entry = Object.entries(SHENG_XIAO).find(([, name]) => name === branch)
  return entry ? `生肖${branch}（${entry[0]}）` : zodiac
}
