import {
  calculateBaziChart,
  detectInteractions,
  type BaziChart as OpenFateChart,
  type BranchInteraction,
} from '@openfate/bazi-engine'
import {
  calculateChart,
  SHEN_SHA_META,
  weightedTenGods,
  type BaziChart as SoulChart,
} from '@soul-atelier/bazi'
import { Solar } from 'lunar-javascript'
import type { TianGan, DiZhi } from '~/types/user'

export type BaziChartGender = 'male' | 'female'

export interface BaziChartLocation {
  name: string
  longitude?: number
  latitude?: number
  timezone?: string
}

export interface BaziChartInput {
  birthDate: string
  birthHour: DiZhi
  gender: BaziChartGender
  location?: BaziChartLocation | null
}

export interface BaziChartHiddenStem {
  gan: TianGan
  type: '本气' | '中气' | '余气'
  wuxing: string
  shishen: string
  isMain: boolean
}

export interface BaziPillarShenSha {
  name: string
  classification: '吉' | '凶' | '中性'
  description: string
}

export interface BaziChartPillar {
  key: 'year' | 'month' | 'day' | 'hour'
  label: string
  tag: string | null
  gan: TianGan
  zhi: DiZhi
  ganzhi: string
  ganWuxing: string
  zhiWuxing: string
  shishenGan: string
  hiddenStems: BaziChartHiddenStem[]
  diShi: string
  selfSitting: string
  nayin: string
  xun: string
  xunKong: string[]
  voidKinds: string[]
  shensha: BaziPillarShenSha[]
}

export interface BaziSolarTerm {
  current: string | null
  previous: { name: string; datetime: string }
  next: { name: string; datetime: string }
  progress: number
  siLing: { ganzhi: string; term: string; daysAfterTerm: number }
}

export interface BaziChartBirthInfo {
  solarText: string
  clockText: string
  trueSolarText: string
  trueSolarDateTime: string
  lunarText: string
  lunarDetail: string
  lunarGanzhi: string
  zodiac: string
  season: string
  weekday: string
  festivals: string[]
  timezone: string
  timezoneOffsetMinutes: number
  locationName: string
  coordinates: string | null
  solarTimeStatus: 'uncorrected' | 'corrected' | 'failed' | 'boundary'
  solarTimeStatusText: string
  longitudeOffsetMinutes: number
  equationOfTimeMinutes: number
  standardMeridian: number | null
  solarTimeAlgorithm: string | null
  selectedHour: DiZhi
  effectiveHour: DiZhi
  genderText: string
  dayBoundaryChanged: boolean
  solarTerm: BaziSolarTerm
}

export interface BaziDerivedPillar {
  label: string
  ganzhi: string
  nayin: string
  shishen: string
  shensha: BaziPillarShenSha[]
}

export interface BaziChartExtras {
  taiYuan: BaziDerivedPillar
  mingGong: BaziDerivedPillar
  shenGong: BaziDerivedPillar
}

export interface BaziTenGodItem {
  name: string
  weight: number
  percent: number
  role: string
}

export interface BaziWuxingItem {
  key: '木' | '火' | '土' | '金' | '水'
  label: string
  weight: number
  percent: number
  visibleCount: number
  hiddenCount: number
  role: string
  state: 'favorable' | 'unfavorable' | 'neutral'
  stateLabel: string
  direction: string
  organs: string
  evidence: string
}

export interface BaziChartEnergy {
  strength: string
  strengthLabel: string
  supportRatio: number
  rootStatus: string
  rootQuality: number
  monthCommand: string
  monthCommandDetail: string
  monthProgress: number
  primaryUseGod: string
  supportUseGod: string
  avoidGod: string
  adjustment: string
  tenGods: BaziTenGodItem[]
  wuxing: BaziWuxingItem[]
}

export interface BaziRelationSignal {
  id: string
  group: '天干' | '地支'
  type: string
  value: string
  positions: string[]
  impact: string
  intensity: '轻微' | '中等' | '强烈'
  status: string
}

export interface BaziNatalShenSha {
  name: string
  classification: '吉' | '凶' | '中性'
  positions: string[]
  description: string
}

export interface BaziShenShaCombination {
  name: string
  value: string
  positions: string[]
  note: string
}

export interface BaziChartPattern {
  name: string
  status: string
  monthMainQi: string
  transparency: string
  rootStatus: string
  evidence: string[]
}

export interface BaziChartStructure {
  dayStrength: string
  rootStatus: string
  supportRatio: number
  forceDistribution: string
  pattern: string
  patternEvidence: string
  evidence: string[]
}

export interface BaziNatalThemeSignal {
  id: 'love-attraction' | 'relationship-stability' | 'wealth-capacity' | 'career-structure' | 'learning-structure'
  title: string
  score: number
  evidenceLevel: '保守' | '中等' | '稳定'
  status: '需补强' | '需取舍' | '有优势'
  tags: string[]
}

export interface BaziFlowYearSignal {
  type: string
  value: string
  positions: string[]
  impact: string
}

export interface BaziFlowYear {
  year: number
  age: number
  ganzhi: string
  shishenGan: string
  shishenZhi: string
  intensity: '平稳' | '中等波动' | '高波动'
  energyShifts: string[]
  signals: BaziFlowYearSignal[]
  shensha: BaziPillarShenSha[]
  isCurrent: boolean
  summary: string
}

export interface BaziDaYun {
  index: number
  ganzhi: string
  startYear: number
  endYear: number
  startAge: number
  endAge: number
  shishenGan: string
  shishenZhi: string
  shensha: BaziPillarShenSha[]
  isCurrent: boolean
  liunian: BaziFlowYear[]
}

export interface BaziDayunMeta {
  direction: string
  isForward: boolean
  startText: string
  startDate: string
}

export interface BaziChartResult {
  pillars: BaziChartPillar[]
  birth: BaziChartBirthInfo
  extras: BaziChartExtras
  energy: BaziChartEnergy
  relations: BaziRelationSignal[]
  shensha: BaziNatalShenSha[]
  shenshaCombinations: BaziShenShaCombination[]
  pattern: BaziChartPattern
  structure: BaziChartStructure
  natalThemes: BaziNatalThemeSignal[]
  dayuns: BaziDaYun[]
  dayunMeta: BaziDayunMeta
  methodology: {
    school: string
    calendar: string
    trueSolarTime: string
    dayBoundary: string
    monthRule: string
    scorePolicy: string
    engines: string[]
  }
  generatedAt: string
}

type ElementName = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

const ELEMENT_ZH: Record<ElementName, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
}

const ELEMENT_DIRECTION: Record<ElementName, string> = {
  wood: '东方',
  fire: '南方',
  earth: '中央',
  metal: '西方',
  water: '北方',
}

const ELEMENT_ORGANS: Record<ElementName, string> = {
  wood: '肝、胆',
  fire: '心、小肠',
  earth: '脾、胃',
  metal: '肺、大肠',
  water: '肾、膀胱',
}

const ELEMENT_GENERATES: Record<ElementName, ElementName> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
}

const ELEMENT_CONTROLS: Record<ElementName, ElementName> = {
  wood: 'earth',
  fire: 'metal',
  earth: 'water',
  metal: 'wood',
  water: 'fire',
}

const TEN_GOD_ORDER = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '正印', '偏印'] as const
const TEN_GOD_ROLES: Record<string, string> = {
  比肩: '自我/同辈',
  劫财: '竞争/协作',
  食神: '表达/输出',
  伤官: '创新/突破',
  偏财: '机会/流动财',
  正财: '稳定/执行财',
  七杀: '压力/规则',
  正官: '秩序/责任',
  正印: '学习/庇护',
  偏印: '研究/直觉',
}

const PILLAR_LABELS = {
  year: '年柱',
  month: '月柱',
  day: '日柱',
  hour: '时柱',
} as const

const HOUR_MIDPOINT: Record<DiZhi, number> = {
  子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
  午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
}

const RELATION_META: Record<string, { name: string; impact: string; intensity: BaziRelationSignal['intensity'] }> = {
  CLASH: { name: '冲', impact: '主变动、冲击、位置被推动', intensity: '强烈' },
  COMBINATION_2: { name: '合', impact: '主牵绊、合作、能量合化', intensity: '中等' },
  TRINE: { name: '三合', impact: '主协同、成局、力量汇聚', intensity: '强烈' },
  DIRECTIONAL: { name: '方合', impact: '主方向性集团力量', intensity: '强烈' },
  PUNISHMENT: { name: '刑', impact: '主内耗、规则压力、隐性摩擦', intensity: '中等' },
  DESTRUCTION: { name: '破', impact: '主松动、破局、原有连接变弱', intensity: '轻微' },
  HARM: { name: '害', impact: '主暗耗、不顺、细节牵制', intensity: '轻微' },
}

const SOUL_RELATION_META: Record<string, { name: string; impact: string; intensity: BaziRelationSignal['intensity'] }> = {
  'stem-combine': { name: '天干五合', impact: '主资源、立场或表达被合绊', intensity: '中等' },
  'stem-clash': { name: '天干相冲', impact: '主外部规则与自我行动直接碰撞', intensity: '中等' },
  'branch-combine': { name: '六合', impact: '主牵绊、合作、能量合化', intensity: '中等' },
  'branch-clash': { name: '相冲', impact: '主变动、冲击、位置被推动', intensity: '强烈' },
  'branch-harm': { name: '相害', impact: '主暗耗、不顺、细节牵制', intensity: '轻微' },
  'branch-punish': { name: '相刑', impact: '主内耗、规则压力、隐性摩擦', intensity: '中等' },
  'branch-triple': { name: '三合', impact: '主协同、成局、力量汇聚', intensity: '强烈' },
  'branch-half-combine': { name: '半合', impact: '主局部联动、趋势待引动', intensity: '中等' },
  'branch-meeting': { name: '会局', impact: '主方向性集团力量', intensity: '强烈' },
  'branch-hidden-combine': { name: '藏干暗合', impact: '主隐性资源与暗中联系', intensity: '轻微' },
  'branch-destroy': { name: '相破', impact: '主松动、破局、原有连接变弱', intensity: '轻微' },
}

const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']
const LUNAR_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

function branchFromTime(hour: number, minute = 0): DiZhi {
  const minuteOfDay = hour * 60 + minute
  const normalized = ((minuteOfDay % 1440) + 1440) % 1440
  const index = normalized >= 1380 || normalized < 60 ? 0 : Math.floor((normalized - 60) / 120) + 1
  return ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][index] as DiZhi
}

function elementZh(element: string): string {
  return ELEMENT_ZH[element as ElementName] ?? '未知'
}

function shenshaClassZh(value: string): '吉' | '凶' | '中性' {
  if (value === 'ji') return '吉'
  if (value === 'xiong') return '凶'
  return '中性'
}

function mapShensha(items: Array<{ name: string; classification: string }>): BaziPillarShenSha[] {
  return items.map(item => ({
    name: item.name,
    classification: shenshaClassZh(item.classification),
    description: SHEN_SHA_META[item.name]?.description ?? '传统神煞结构信号。',
  }))
}

type SoulPillar = NonNullable<SoulChart['year']>
type SoulPillarKey = 'year' | 'month' | 'day' | 'hour'

function pillarMap(soulChart: SoulChart): Array<{ key: SoulPillarKey, pillar: SoulPillar }> {
  return (['year', 'month', 'day', 'hour'] as const)
    .map(key => ({ key, pillar: soulChart[key] }))
    .filter((item): item is { key: SoulPillarKey, pillar: SoulPillar } => Boolean(item.pillar))
}

function timezoneOffsetMinutes(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  let timestamp = Date.UTC(year, month - 1, day, hour, minute)
  let offset = 0
  for (let index = 0; index < 3; index += 1) {
    const parts = formatter.formatToParts(new Date(timestamp))
    const value = (type: string) => Number(parts.find(part => part.type === type)?.value ?? 0)
    const asUtc = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second'))
    offset = Math.round((asUtc - timestamp) / 60000)
    timestamp = Date.UTC(year, month - 1, day, hour, minute) - offset * 60000
  }
  return offset
}

function lunarText(month: number, day: number): string {
  return `${LUNAR_MONTHS[month - 1] ?? `${month}月`}${LUNAR_DAYS[day - 1] ?? `${day}日`}`
}

function seasonFromLunarMonth(month: number): string {
  if (month <= 3) return '春'
  if (month <= 6) return '夏'
  if (month <= 9) return '秋'
  return '冬'
}

function formatMinuteOfDay(minuteOfDay: number): string {
  const normalized = ((Math.round(minuteOfDay) % 1440) + 1440) % 1440
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`
}

function buildWeightedElements(soulChart: SoulChart, monthProgress: number): Record<ElementName, { weight: number, visible: number, hidden: number }> {
  const result = {
    wood: { weight: 0, visible: 0, hidden: 0 },
    fire: { weight: 0, visible: 0, hidden: 0 },
    earth: { weight: 0, visible: 0, hidden: 0 },
    metal: { weight: 0, visible: 0, hidden: 0 },
    water: { weight: 0, visible: 0, hidden: 0 },
  }

  for (const { key, pillar } of pillarMap(soulChart)) {
    result[pillar.stem.element as ElementName].weight += key === 'day' ? 0.5 : 1
    result[pillar.stem.element as ElementName].visible += 1
    result[pillar.branch.element as ElementName].weight += 1
    result[pillar.branch.element as ElementName].visible += 1

    const hiddenCount = pillar.hiddenStems.length
    pillar.hiddenStems.forEach((hidden) => {
      const weight = hidden.type === 'main'
        ? (hiddenCount === 1 ? 1 : 0.6)
        : hidden.type === 'middle'
          ? (hiddenCount === 2 ? 0.4 : 0.2)
          : (hiddenCount === 3 ? 0.2 : 0)
      result[hidden.element as ElementName].weight += weight
      result[hidden.element as ElementName].hidden += 1
    })

    const monthMain = pillar.hiddenStems[0]
    if (key === 'month' && monthMain) {
      result[monthMain.element as ElementName].weight += monthProgress
    }
  }

  return result
}

function buildEnergy(soulChart: SoulChart): BaziChartEnergy {
  const dayElement = soulChart.dayMaster.element as ElementName
  const generator = ELEMENT_GENERATES[dayElement]
  const controller = ELEMENT_CONTROLS[dayElement]
  const output = ELEMENT_GENERATES[dayElement]
  const wealth = ELEMENT_CONTROLS[dayElement]
  const monthProgress = Math.min(0.95, Math.max(0, soulChart.siLing.daysAfterTerm / 30.44))
  const weighted = buildWeightedElements(soulChart, monthProgress)
  const totalWeight = Object.values(weighted).reduce((sum, item) => sum + item.weight, 0)
  const supportRatio = Math.round(((weighted[dayElement].weight + weighted[generator].weight) / totalWeight) * 1000) / 10
  const strength = supportRatio >= 48 ? '身强' : supportRatio >= 40 ? '中和偏弱' : '身弱'

  let rootMass = 0
  let effectiveRoot = false
  for (const { pillar } of pillarMap(soulChart)) {
    pillar.hiddenStems.forEach((hidden) => {
      if (hidden.element !== dayElement) return
      rootMass += hidden.type === 'main' ? 1 : hidden.type === 'middle' ? 0.5 : 0.25
      effectiveRoot ||= hidden.type === 'main'
    })
  }
  const rootStatus = effectiveRoot ? '有效根' : rootMass > 0 ? '余气弱根' : '无有效根'

  const monthElement = soulChart.month.branch.element as ElementName
  const monthCommand = monthElement === dayElement
    ? '得令'
    : monthElement === generator ? '得令 · 生扶'
      : monthElement === controller ? '失令 · 受控'
      : monthElement === output ? '泄令' : '耗令'

  const favorableElements = strength === '身强'
    ? [controller, output, wealth]
    : [dayElement, generator]
  const avoidElements = strength === '身强'
    ? [dayElement, generator]
    : [controller, output, wealth]

  const tenGodWeights = weightedTenGods(soulChart)
  const monthMainTenGod = soulChart.month.hiddenStems[0]
    ? soulChart.month.hiddenStemTenStars[0]
    : soulChart.month.stemTenStar
  if (monthMainTenGod) {
    tenGodWeights.set(monthMainTenGod, (tenGodWeights.get(monthMainTenGod) ?? 0) + monthProgress)
  }
  const tenGodTotal = [...tenGodWeights.values()].reduce((sum, value) => sum + value, 0)

  const tenGods: BaziTenGodItem[] = TEN_GOD_ORDER.map((name) => {
    const weight = tenGodWeights.get(name) ?? 0
    return {
      name,
      weight: Math.round(weight * 100) / 100,
      percent: Math.round((weight / tenGodTotal) * 100),
      role: TEN_GOD_ROLES[name] ?? '',
    }
  }).sort((a, b) => b.percent - a.percent)

  const wuxing: BaziWuxingItem[] = (Object.keys(weighted) as ElementName[]).map((element) => {
    const state: BaziWuxingItem['state'] = favorableElements.includes(element)
      ? 'favorable'
      : avoidElements.includes(element) ? 'unfavorable' : 'neutral'
    return {
      key: ELEMENT_ZH[element] as BaziWuxingItem['key'],
      label: ELEMENT_ZH[element],
      weight: Math.round(weighted[element].weight * 100) / 100,
      percent: Math.round((weighted[element].weight / totalWeight) * 100),
      visibleCount: weighted[element].visible,
      hiddenCount: weighted[element].hidden,
      role: element === dayElement ? '日主'
        : element === generator ? '印星'
          : element === controller ? '官杀'
            : element === output ? '食伤' : '财星',
      state,
      stateLabel: state === 'favorable' ? '喜用方向' : state === 'unfavorable' ? '忌神方向' : '中性',
      direction: ELEMENT_DIRECTION[element],
      organs: ELEMENT_ORGANS[element],
      evidence: `天干/地支 ${weighted[element].visible} 处，藏干信号 ${weighted[element].hidden} 处`,
    }
  }).sort((a, b) => b.percent - a.percent)

  const primaryElement = favorableElements[0] ?? dayElement
  const supportElement = favorableElements[1] ?? generator
  const avoidGod = avoidElements.reduce((max, element) => weighted[element].weight > weighted[max].weight ? element : max, avoidElements[0] ?? controller)

  return {
    strength,
    strengthLabel: strength === '身强' ? '支持比充足' : '支持比偏弱',
    supportRatio,
    rootStatus,
    rootQuality: Math.round((rootMass / 3) * 100),
    monthCommand,
    monthCommandDetail: `${soulChart.siLing.term}后 ${soulChart.siLing.daysAfterTerm} 天，司令 ${soulChart.siLing.stem.name}`,
    monthProgress: Math.round(monthProgress * 1000) / 10,
    primaryUseGod: ELEMENT_ZH[primaryElement],
    supportUseGod: ELEMENT_ZH[supportElement],
    avoidGod: ELEMENT_ZH[avoidGod],
    adjustment: strength === '身强'
      ? '优先泄、耗、控，降低过旺日主的对抗成本。'
      : '优先印比托底，再谈财官开发；先解决支撑，再加负载。',
    tenGods,
    wuxing,
  }
}

function mapDerivedPillar(label: string, pillar: {
  sixtyCycleName: string
  sound: string
  stemTenStar: string
  shenSha: Array<{ name: string; classification: string }>
} | null): BaziDerivedPillar {
  if (!pillar) {
    return { label, ganzhi: '—', nayin: '—', shishen: '—', shensha: [] }
  }
  return {
    label,
    ganzhi: pillar.sixtyCycleName,
    nayin: pillar.sound,
    shishen: pillar.stemTenStar,
    shensha: mapShensha(pillar.shenSha),
  }
}

function mapBranchInteraction(interaction: BranchInteraction): BaziRelationSignal {
  const meta = RELATION_META[interaction.type] ?? {
    name: interaction.type,
    impact: interaction.description,
    intensity: '中等' as const,
  }
  return {
    id: `${interaction.type}-${interaction.branches.join('')}-${interaction.pillars.join('/')}`,
    group: '地支',
    type: meta.name,
    value: interaction.branches.join(''),
    positions: interaction.pillars.map(key => key === 'annual' ? '流年' : PILLAR_LABELS[key as keyof typeof PILLAR_LABELS] ?? key),
    impact: meta.impact,
    intensity: meta.intensity,
    status: '生效',
  }
}

function mapSoulInteraction(group: '天干' | '地支', interaction: { kind: string; label: string; positions: string[] }): BaziRelationSignal {
  const meta = SOUL_RELATION_META[interaction.kind] ?? {
    name: interaction.kind,
    impact: interaction.label,
    intensity: '中等' as const,
  }
  return {
    id: `${interaction.kind}-${interaction.label}-${interaction.positions.join('/')}`,
    group,
    type: meta.name,
    value: interaction.label,
    positions: interaction.positions.map(key => PILLAR_LABELS[key as keyof typeof PILLAR_LABELS] ?? key),
    impact: meta.impact,
    intensity: meta.intensity,
    status: '生效',
  }
}

function buildRelations(openChart: OpenFateChart, soulChart: SoulChart): BaziRelationSignal[] {
  const signals = [
    ...openChart.interactions.map(mapBranchInteraction),
    ...soulChart.interactions.stems.map(item => mapSoulInteraction('天干', item)),
    ...soulChart.interactions.branches.map(item => mapSoulInteraction('地支', item)),
  ]
  const seen = new Set<string>()
  return signals.filter((signal) => {
    const key = `${signal.group}-${signal.value}-${signal.positions.join('/')}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildShensha(soulChart: SoulChart): {
  shensha: BaziNatalShenSha[]
  combinations: BaziShenShaCombination[]
  pillarShensha: Record<SoulPillarKey, BaziPillarShenSha[]>
} {
  const shensha: BaziNatalShenSha[] = soulChart.shenSha.map(item => ({
    name: item.name,
    classification: shenshaClassZh(item.classification),
    positions: item.pillars.map(key => PILLAR_LABELS[key]),
    description: SHEN_SHA_META[item.name]?.description ?? '传统神煞结构信号。',
  }))

  const pillarShensha: Record<SoulPillarKey, BaziPillarShenSha[]> = {
    year: [],
    month: [],
    day: [],
    hour: [],
  }
  for (const item of soulChart.shenSha) {
    for (const key of item.pillars) {
      pillarShensha[key].push({
        name: item.name,
        classification: shenshaClassZh(item.classification),
        description: SHEN_SHA_META[item.name]?.description ?? '',
      })
    }
  }

  const combinations: BaziShenShaCombination[] = []
  for (const { key } of pillarMap(soulChart)) {
    const names = new Set(pillarShensha[key].map(item => item.name))
    if (names.has('天乙贵人') && names.has('文昌')) {
      combinations.push({
        name: '天乙文昌同宫',
        value: PILLAR_LABELS[key],
        positions: [PILLAR_LABELS[key]],
        note: '贵人帮助与文星表达同宫，学业和公众表达更容易获得支持。',
      })
    }
    const literaryStars = ['文昌', '学堂', '词馆'].filter(name => names.has(name))
    if (literaryStars.length >= 2) {
      combinations.push({
        name: '文星成组',
        value: literaryStars.join(' · '),
        positions: [PILLAR_LABELS[key]],
        note: '学习、研究、文书与抽象理解信号集中。',
      })
    }
    if (names.has('天德贵人') && names.has('月德贵人')) {
      combinations.push({
        name: '天月德同宫',
        value: PILLAR_LABELS[key],
        positions: [PILLAR_LABELS[key]],
        note: '德德合力集中，该宫位更容易出现缓冲、修复与贵人协调。',
      })
    }
    if (names.has('将星') && names.has('华盖')) {
      combinations.push({
        name: '将星华盖',
        value: PILLAR_LABELS[key],
        positions: [PILLAR_LABELS[key]],
        note: '领导力与独立研究气质并存，适合有规则的专业场景。',
      })
    }
  }

  return { shensha, combinations, pillarShensha }
}

function buildPattern(soulChart: SoulChart, energy: BaziChartEnergy): BaziChartPattern {
  const mainHidden = soulChart.month.hiddenStems[0]
  const patternGod = mainHidden
    ? soulChart.month.hiddenStemTenStars[0]
    : soulChart.month.stemTenStar
  const monthMainQi = mainHidden
    ? `${elementZh(mainHidden.element)}·${soulChart.month.hiddenStemTenStars[0]}`
    : elementZh(soulChart.month.branch.element)
  const stemTenGods = pillarMap(soulChart)
    .filter(({ key }) => key !== 'day')
    .map(({ pillar }) => pillar.stemTenStar)
  const transparentCount = stemTenGods.filter(name => name === patternGod).length
  const allTenGods = [
    ...stemTenGods,
    ...soulChart.month.hiddenStemTenStars,
  ]
  const neutralized = patternGod === '七杀'
    && (allTenGods.includes('食神') || allTenGods.includes('正印'))
    && !(energy.rootStatus === '无有效根' && energy.supportRatio < 40)
  const status = transparentCount > 0
    ? `${neutralized ? '成格' : '破格'} · ${patternGod}格`
    : `${patternGod}格 · 未透`

  return {
    name: `${patternGod}格`,
    status,
    monthMainQi,
    transparency: transparentCount > 0 ? '透干' : '未透干',
    rootStatus: energy.rootStatus,
    evidence: [
      `月令主气：${soulChart.month.branch.name} 中 ${monthMainQi}`,
      `司令依据：${soulChart.siLing.term}后 ${soulChart.siLing.daysAfterTerm} 天，取 ${soulChart.siLing.stem.name}`,
      `透明检查：${transparentCount > 0 ? `${patternGod} 透出 ${transparentCount} 处` : `${patternGod} 未透干`}`,
      `支持比：${energy.supportRatio}%；根气：${energy.rootStatus}`,
    ],
  }
}

function themeStatus(score: number): BaziNatalThemeSignal['status'] {
  return score >= 70 ? '有优势' : score >= 40 ? '需取舍' : '需补强'
}

function themeEvidence(tags: string[]): BaziNatalThemeSignal['evidenceLevel'] {
  const decisive = tags.filter(tag => /忌神|占比|强度|清晰度|冲|刑|破|桃花|贵人|将星/.test(tag)).length
  return decisive >= 3 ? '稳定' : decisive >= 2 ? '中等' : '保守'
}

function buildNatalThemes(
  energy: BaziChartEnergy,
  relations: BaziRelationSignal[],
  shensha: BaziNatalShenSha[],
  birth: Pick<BaziChartBirthInfo, 'genderText'>,
  pattern: BaziChartPattern,
): BaziNatalThemeSignal[] {
  const roleElement = (role: string) => energy.wuxing.find(item => item.role === role)
  const output = roleElement('食伤')
  const wealth = roleElement('财星')
  const officer = roleElement('官杀')
  const resource = roleElement('印星')
  const spouse = birth.genderText === '女' ? officer : wealth
  const spouseTenGods = birth.genderText === '女' ? ['正官', '七杀'] : ['正财', '偏财']
  const clearSpouseStar = energy.tenGods
    .filter(item => spouseTenGods.includes(item.name))
    .sort((a, b) => b.percent - a.percent)[0]
  const hasPeachBlossom = shensha.some(item => item.name === '桃花')
  const hasWenChang = shensha.some(item => item.name === '文昌')
  const hasGeneralStar = shensha.some(item => item.name === '将星')
  const natalConflictCount = relations.filter(item =>
    item.group === '地支' && ['冲', '刑', '破'].includes(item.type)
    && item.positions.some(position => ['年柱', '月柱', '日柱'].includes(position)),
  ).length

  const loveTags = [
    ...(hasPeachBlossom ? ['桃花'] : []),
    ...(output && output.percent >= 8 ? ['表达魅力'] : []),
    ...(spouse && spouse.percent >= 8 ? ['关系星显度'] : []),
  ]
  const loveScore = Math.max(12, Math.min(92, Math.round(
    30
    + (output?.percent ?? 0) * 1.5
    + (hasPeachBlossom ? 8 : 0)
    + (clearSpouseStar && clearSpouseStar.percent >= 8 ? 8 : 0)
    - natalConflictCount * 5,
  )))

  const stabilityTags = [
    ...(spouse?.state === 'unfavorable' ? ['配偶星忌神'] : []),
    ...(clearSpouseStar ? ['配偶星清晰度'] : []),
    ...(hasPeachBlossom ? ['桃花'] : []),
    ...relations
      .filter(item => item.group === '地支' && ['冲', '刑', '破'].includes(item.type) && item.positions.includes('日柱'))
      .map(item => item.value + item.type),
  ]
  const stabilityScore = Math.max(8, Math.min(94, Math.round(
    38
    + (spouse?.percent ?? 0) * 0.8
    + (clearSpouseStar ? 6 : 0)
    + (spouse?.state === 'favorable' ? 14 : spouse?.state === 'unfavorable' ? -14 : -4)
    - natalConflictCount * 8
    - (hasPeachBlossom ? 4 : 0),
  )))

  const wealthSupport = output && wealth && output.state !== 'unfavorable' && wealth.percent >= 4
  const wealthTags = [
    ...(wealth?.state === 'unfavorable' ? ['财元素忌神'] : []),
    ...(wealth && wealth.percent >= 8 ? ['财星占比'] : []),
    ...(wealthSupport ? ['食伤生财'] : []),
    ...(wealth && wealth.percent >= 12 ? ['财元素强度'] : []),
  ]
  const wealthScore = Math.max(8, Math.min(94, Math.round(
    32
    + (wealth?.percent ?? 0) * 1.2
    + (wealthSupport ? 8 : 0)
    + (wealth?.state === 'favorable' ? 14 : wealth?.state === 'unfavorable' ? -14 : 0),
  )))

  const careerRelations = relations.filter(item =>
    item.group === '地支'
    && ['冲', '刑', '破'].includes(item.type)
    && item.positions.some(position => ['年柱', '月柱', '日柱'].includes(position)),
  )
  const careerTags = [
    ...(officer && officer.percent >= 8 ? ['官杀占比'] : []),
    ...(officer?.state === 'unfavorable' ? ['官杀元素忌神'] : []),
    ...careerRelations.map(item => item.value + item.type),
    ...(resource && resource.percent >= 8 ? ['印星承接'] : []),
    ...(hasGeneralStar ? ['将星'] : []),
  ]
  const careerScore = Math.max(8, Math.min(94, Math.round(
    34
    + (officer?.percent ?? 0) * 0.9
    + (officer?.state === 'favorable' ? 14 : officer?.state === 'unfavorable' ? -8 : 0)
    - Math.min(12, careerRelations.length * 4)
    + (resource && resource.percent >= 8 ? 6 : 0)
    + (hasGeneralStar ? 4 : 0)
    + (pattern.status.includes('破格') ? -6 : 0),
  )))

  const learningTags = [
    ...(resource?.state === 'unfavorable' ? ['印元素忌神'] : []),
    ...(resource && resource.percent >= 8 ? ['印星占比'] : []),
    ...(resource && resource.percent >= 16 ? ['印元素强度'] : []),
    ...(output && output.percent >= 8 ? ['表达输出'] : []),
    ...(hasWenChang ? ['文昌贵人'] : []),
  ]
  const learningScore = Math.max(8, Math.min(94, Math.round(
    34
    + (resource?.percent ?? 0) * 1.4
    + (resource?.state === 'favorable' ? 14 : resource?.state === 'unfavorable' ? -6 : 0)
    + (hasWenChang ? 8 : 0)
    + (output && output.percent >= 8 ? 4 : 0),
  )))

  const themes: Array<Omit<BaziNatalThemeSignal, 'status' | 'evidenceLevel'>> = [
    { id: 'love-attraction', title: '恋爱吸引信号', score: loveScore, tags: loveTags },
    { id: 'relationship-stability', title: '长期关系稳定信号', score: stabilityScore, tags: stabilityTags },
    { id: 'wealth-capacity', title: '财富承载', score: wealthScore, tags: wealthTags },
    { id: 'career-structure', title: '事业结构力', score: careerScore, tags: careerTags },
    { id: 'learning-structure', title: '学习结构力', score: learningScore, tags: learningTags },
  ]

  return themes.map(theme => ({
    ...theme,
    status: themeStatus(theme.score),
    evidenceLevel: themeEvidence(theme.tags),
  }))
}

function buildFlowYears(openChart: OpenFateChart, soulChart: SoulChart, currentYear: number, startYear: number): BaziFlowYear[] {
  const annualMap = new Map<number, NonNullable<SoulChart['decadeFortunes'][number]['annualFortunes'][number]>>()
  for (const decade of soulChart.decadeFortunes) {
    for (const annual of decade.annualFortunes) annualMap.set(annual.year, annual)
  }

  return Array.from({ length: 100 }, (_, offset) => startYear + offset).flatMap((year) => {
    const annual = annualMap.get(year)
    if (!annual) return []
    const triggers = detectInteractions({
      year: openChart.pillars.year.branch,
      month: openChart.pillars.month.branch,
      day: openChart.pillars.day.branch,
      hour: openChart.pillars.hour?.branch ?? '',
    }, annual.branch.name)
      .filter(interaction => interaction.branches.includes(annual.branch.name))
      .map(mapBranchInteraction)
      .map(signal => ({
        type: signal.type,
        value: signal.value,
        positions: signal.positions,
        impact: signal.impact,
      }))
    const intensity: BaziFlowYear['intensity'] = triggers.some(item => item.type === '冲' || item.type === '刑')
      ? '高波动'
      : triggers.length >= 2 || triggers.some(item => item.type === '合' || item.type === '三合')
        ? '中等波动'
        : '平稳'
    return [{
      year,
      age: annual.age,
      ganzhi: annual.sixtyCycleName,
      shishenGan: annual.stemTenStar,
      shishenZhi: annual.hiddenStemTenStars[0] ?? '',
      intensity,
      energyShifts: [
        `${annual.stemTenStar}显象 · ${TEN_GOD_ROLES[annual.stemTenStar] ?? ''}`,
        `流年支${elementZh(annual.branch.element)}气势被引动`,
      ],
      signals: triggers,
      shensha: mapShensha(annual.shenSha),
      isCurrent: year === currentYear,
      summary: intensity === '平稳'
        ? '结构引动较少，按原有节奏推进。'
        : intensity === '中等波动'
          ? '合绊或局部联动增强，安排前先确认资源与边界。'
          : '冲刑或多方引动增强，重大决定先拆分验证。',
    }]
  })
}

function buildDayuns(openChart: OpenFateChart, soulChart: SoulChart, currentYear: number): BaziDaYun[] {
  const firstCycle = openChart.daYun.cycles[0]
  const flowYears = buildFlowYears(openChart, soulChart, currentYear, firstCycle?.startYear ?? currentYear)
  const flowByYear = new Map(flowYears.map(item => [item.year, item]))

  return openChart.daYun.cycles.map((cycle) => {
    const matchedDecade = soulChart.decadeFortunes.find(decade => decade.sixtyCycleName === cycle.ganZhi)
    const liunian = Array.from({ length: 10 }, (_, offset) => flowByYear.get(cycle.startYear + offset))
      .filter((item): item is BaziFlowYear => Boolean(item))
    return {
      index: cycle.index,
      ganzhi: cycle.ganZhi,
      startYear: cycle.startYear,
      endYear: cycle.endYear,
      startAge: cycle.startAge,
      endAge: cycle.endAge,
      shishenGan: cycle.stemTenGod,
      shishenZhi: cycle.branchTenGod,
      shensha: mapShensha(matchedDecade?.shenSha ?? []),
      isCurrent: currentYear >= cycle.startYear && currentYear <= cycle.endYear,
      liunian,
    }
  })
}

export async function calculateBaziChartResult(input: BaziChartInput): Promise<BaziChartResult> {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.birthDate)
  if (!match) {
    throw createError({ statusCode: 400, statusMessage: '出生日期格式必须是 YYYY-MM-DD' })
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1900 || year > 2100) {
    throw createError({ statusCode: 400, statusMessage: '出生年份需在 1900-2100' })
  }

  const inputHour = HOUR_MIDPOINT[input.birthHour]
  const timezone = input.location?.timezone || 'Asia/Shanghai'
  const openChart = calculateBaziChart({
    year,
    month,
    day,
    hour: inputHour,
    minute: 0,
    gender: input.gender,
    timezoneId: timezone,
    longitude: input.location?.longitude,
    enableTrueSolarTime: input.location?.longitude !== undefined,
    dayBoundaryMode: 'ZI_HOUR_23',
  })

  const calculation = openChart.calendar.calculationSolar
  const soulChart = calculateChart({
    year: calculation.year,
    month: calculation.month,
    day: calculation.day,
    hour: calculation.hour ?? inputHour,
    minute: calculation.minute ?? 0,
    gender: input.gender,
    tzOffsetMinutes: 480,
  }, { adjustPalacesPastZhongQi: true })

  const openPillars = [
    openChart.pillars.year.ganZhi,
    openChart.pillars.month.ganZhi,
    openChart.pillars.day.ganZhi,
    openChart.pillars.hour?.ganZhi,
  ].join(' ')
  const soulPillars = [
    soulChart.year.sixtyCycleName,
    soulChart.month.sixtyCycleName,
    soulChart.day.sixtyCycleName,
    soulChart.hour?.sixtyCycleName,
  ].join(' ')
  if (openPillars !== soulPillars) {
    throw createError({
      statusCode: 500,
      statusMessage: `排盘引擎交叉校验失败：OpenFate=${openPillars}，Soul=${soulPillars}`,
    })
  }

  const lunarSolar = Solar.fromYmdHms(
    calculation.year,
    calculation.month,
    calculation.day,
    calculation.hour ?? 0,
    calculation.minute ?? 0,
    0,
  )
  const lunar = lunarSolar.getLunar()
  const previousJie = lunar.getPrevJie()
  const nextJie = lunar.getNextJie()
  const energy = buildEnergy(soulChart)
  const pattern = buildPattern(soulChart, energy)
  const relations = buildRelations(openChart, soulChart)
  const { shensha, combinations, pillarShensha } = buildShensha(soulChart)
  const currentYear = new Date().getFullYear()
  const effectiveHour = openChart.solarTimeInfo
    ? branchFromTime(Number(openChart.solarTimeInfo.trueSolarTime.slice(0, 2)), Number(openChart.solarTimeInfo.trueSolarTime.slice(3, 5)))
    : input.birthHour
  const dayBoundaryChanged = openChart.calendar.civilSolar.year !== calculation.year
    || openChart.calendar.civilSolar.month !== calculation.month
    || openChart.calendar.civilSolar.day !== calculation.day
  const solarTimeStatus: BaziChartBirthInfo['solarTimeStatus'] = !openChart.solarTimeInfo
    ? (input.location?.name ? 'failed' : 'uncorrected')
    : effectiveHour !== input.birthHour || dayBoundaryChanged ? 'boundary' : 'corrected'

  const pillars: BaziChartPillar[] = pillarMap(soulChart).map(({ key, pillar }) => ({
    key,
    label: PILLAR_LABELS[key],
    tag: key === 'month' ? '月令核心' : key === 'day' ? '日主核心' : null,
    gan: pillar.stem.name as TianGan,
    zhi: pillar.branch.name as DiZhi,
    ganzhi: pillar.sixtyCycleName,
    ganWuxing: elementZh(pillar.stem.element),
    zhiWuxing: elementZh(pillar.branch.element),
    shishenGan: pillar.stemTenStar,
    hiddenStems: pillar.hiddenStems.map((hidden, index) => ({
      gan: hidden.name as TianGan,
      type: hidden.type === 'main' ? '本气' : hidden.type === 'middle' ? '中气' : '余气',
      wuxing: elementZh(hidden.element),
      shishen: pillar.hiddenStemTenStars[index] ?? '',
      isMain: hidden.type === 'main',
    })),
    diShi: pillar.terrain,
    selfSitting: pillar.selfSitting,
    nayin: pillar.sound,
    xun: openChart.pillars[key]?.xun ?? '',
    xunKong: [...pillar.voidBranches],
    voidKinds: pillar.voidKinds.map(kind => kind === 'year' ? '年空' : '日空'),
    shensha: pillarShensha[key],
  }))

  const forceLeader = [...energy.wuxing].sort((a, b) => b.percent - a.percent)[0]
  const patternName = pattern.name.replace('格', '')
  const patternForce = energy.tenGods.find(item => item.name === patternName)?.percent ?? 0
  const natalThemes = buildNatalThemes(
    energy,
    relations,
    shensha,
    { genderText: input.gender === 'male' ? '男' : '女' },
    pattern,
  )

  return {
    pillars,
    birth: {
      solarText: `${openChart.calendar.civilSolar.year}-${String(openChart.calendar.civilSolar.month).padStart(2, '0')}-${String(openChart.calendar.civilSolar.day).padStart(2, '0')}`,
      clockText: formatMinuteOfDay((openChart.calendar.civilSolar.hour ?? 0) * 60 + (openChart.calendar.civilSolar.minute ?? 0)),
      trueSolarText: openChart.solarTimeInfo?.trueSolarTime ?? formatMinuteOfDay(inputHour * 60),
      trueSolarDateTime: openChart.solarTimeInfo?.trueSolarDateTime ?? lunarSolar.toYmdHms(),
      lunarText: lunarText(openChart.calendar.lunar.month, openChart.calendar.lunar.day),
      lunarDetail: `${lunar.getYearInGanZhiExact()}年 ${openChart.calendar.lunar.isLeapMonth ? '闰' : ''}${lunarText(openChart.calendar.lunar.month, openChart.calendar.lunar.day)} ${effectiveHour}时`,
      lunarGanzhi: lunar.getYearInGanZhiExact(),
      zodiac: openChart.calendar.zodiac,
      season: seasonFromLunarMonth(calculation.month),
      weekday: lunar.getWeekInChinese(),
      festivals: lunar.getFestivals(),
      timezone,
      timezoneOffsetMinutes: timezoneOffsetMinutes(
        openChart.calendar.civilSolar.year,
        openChart.calendar.civilSolar.month,
        openChart.calendar.civilSolar.day,
        openChart.calendar.civilSolar.hour ?? 0,
        openChart.calendar.civilSolar.minute ?? 0,
        timezone,
      ),
      locationName: input.location?.name || '未填写',
      coordinates: input.location?.longitude !== undefined && input.location?.latitude !== undefined
        ? `${input.location.latitude.toFixed(4)}°${input.location.latitude >= 0 ? 'N' : 'S'}, ${input.location.longitude.toFixed(4)}°${input.location.longitude >= 0 ? 'E' : 'W'}`
        : null,
      solarTimeStatus,
      solarTimeStatusText: !openChart.solarTimeInfo
        ? (input.location?.name
          ? '出生地点未能解析坐标，已按所选时辰中值排盘，未做真太阳时校正。'
          : '未填出生地点，按所选时辰中值排盘，未做真太阳时校正。')
        : dayBoundaryChanged
          ? '真太阳时跨过日柱边界；已采用真太阳时换日后的日柱。'
          : effectiveHour !== input.birthHour
            ? `真太阳时跨入${effectiveHour}时边界；时柱已按真太阳时校正。`
            : '已按出生地点完成真太阳时校正，时辰未跨边界。',
      longitudeOffsetMinutes: Math.round(openChart.solarTimeInfo?.longitudeCorrectionMinutes ?? 0),
      equationOfTimeMinutes: Math.round((openChart.solarTimeInfo?.equationOfTimeMinutes ?? 0) * 10) / 10,
      standardMeridian: openChart.solarTimeInfo?.standardMeridian ?? null,
      solarTimeAlgorithm: openChart.solarTimeInfo?.algorithm ?? null,
      selectedHour: input.birthHour,
      effectiveHour,
      genderText: input.gender === 'male' ? '男' : '女',
      dayBoundaryChanged,
      solarTerm: {
        current: lunar.getJieQi() || null,
        previous: { name: previousJie.getName(), datetime: previousJie.getSolar().toYmdHms() },
        next: { name: nextJie.getName(), datetime: nextJie.getSolar().toYmdHms() },
        progress: energy.monthProgress,
        siLing: {
          ganzhi: soulChart.siLing.stem.name,
          term: soulChart.siLing.term,
          daysAfterTerm: soulChart.siLing.daysAfterTerm,
        },
      },
    },
    extras: {
      taiYuan: mapDerivedPillar('胎元', soulChart.fetalOrigin),
      mingGong: mapDerivedPillar('命宫', soulChart.lifePalace),
      shenGong: mapDerivedPillar('身宫', soulChart.bodyPalace),
    },
    energy,
    relations,
    shensha,
    shenshaCombinations: combinations,
    pattern,
    structure: {
      dayStrength: energy.strength,
      rootStatus: energy.rootStatus,
      supportRatio: energy.supportRatio,
      forceDistribution: `${forceLeader?.label ?? '—'} ${forceLeader?.percent ?? 0}%`,
      pattern: pattern.status,
      patternEvidence: `取格线索：${pattern.monthMainQi}；${pattern.name}${patternForce > 0 ? `力量 ${patternForce}%` : ''}`,
      evidence: pattern.evidence,
    },
    natalThemes,
    dayuns: buildDayuns(openChart, soulChart, currentYear),
    dayunMeta: {
      direction: openChart.daYun.isForward ? '顺行' : '逆行',
      isForward: openChart.daYun.isForward,
      startText: `${openChart.daYun.startOffset.years}年${openChart.daYun.startOffset.months}个月${openChart.daYun.startOffset.days}天`,
      startDate: openChart.daYun.startDate,
    },
    methodology: {
      school: '子平法（月令为纲，扶抑格局并用，兼顾调候）',
      calendar: '阳历（公历）',
      trueSolarTime: input.location?.longitude !== undefined && openChart.solarTimeInfo
        ? `已启用：${openChart.solarTimeInfo.trueSolarTime}`
        : '未启用：缺少出生地点坐标',
      dayBoundary: '23:00 换日',
      monthRule: '依节气，而非农历月',
      scorePolicy: '强弱/用神/信号为确定性启发结果，不预测具体事件',
      engines: ['@openfate/bazi-engine', '@soul-atelier/bazi'],
    },
    generatedAt: new Date().toISOString(),
  }
}
