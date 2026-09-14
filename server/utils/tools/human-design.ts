import { computeChart } from 'free-human-design'

export interface HumanDesignInputLocation {
  name?: string
  latitude?: number
  longitude?: number
  timezone?: string
}

export interface HumanDesignInput {
  birthDate: string
  birthTime: string
  timezone: string
  location?: HumanDesignInputLocation | null
  houseSystem?: 'placidus' | 'whole' | 'equal'
}

export interface HumanDesignActivation {
  stream: 'personality' | 'design'
  body: string
  gate: number
  line: number
  color: number
  longitude: number
  retrograde: boolean
}

export interface HumanDesignGate {
  gate: number
  center: string
  activations: Array<{
    stream: 'personality' | 'design'
    body: string
    line: number
  }>
}

export interface HumanDesignCenter {
  id: string
  defined: boolean
  activatedGateCount: number
}

export interface HumanDesignChannel {
  key: string
  gates: [number, number]
  centers: [string, string]
  name: string | null
}

export interface HumanDesignSummary {
  type: 'manifestor' | 'generator' | 'manifesting-generator' | 'projector' | 'reflector'
  strategy: 'inform' | 'respond' | 'respond-inform' | 'invitation' | 'lunar'
  signature: 'peace' | 'satisfaction' | 'success' | 'surprise'
  notSelfTheme: 'anger' | 'frustration' | 'bitterness' | 'disappointment'
  authority: 'emotional' | 'sacral' | 'splenic' | 'ego' | 'self-projected' | 'mental' | 'lunar'
  profile: string
  definition: 'none' | 'single' | 'split' | 'triple-split' | 'quadruple-split'
  definitionComponents: string[][]
  incarnationCross: {
    angle: 'right' | 'juxtaposition' | 'left'
    personalitySun: number
    personalityEarth: number
    designSun: number
    designEarth: number
    code: string
  }
}

export interface HumanDesignChartResult {
  input: {
    birthDate: string
    birthTime: string
    timezone: string
    birthUtc: string
    designUtc: string
    locationName: string
    locationSource: string
    coordinates: string | null
  }
  summary: HumanDesignSummary
  centers: HumanDesignCenter[]
  definedCenters: string[]
  openCenters: string[]
  channels: HumanDesignChannel[]
  gates: HumanDesignGate[]
  activations: HumanDesignActivation[]
  geneKeys: Array<{ key: string, gate: number, line: number }>
  astrology: {
    location: { name: string, lat: number, lng: number, source: string }
    angles: Array<{ key: string, longitude: number, sign: string, degInSign: number, gate: number | null, line: number | null }>
    houses: Array<{ house: number, longitude: number, sign: string, degInSign: number }>
    houseSystem: string
  } | null
  methodology: {
    engine: string
    ephemeris: string
    designMoment: string
    astrologyHouseSystem: string
    noBirthPersistence: boolean
  }
}

const CENTER_ORDER = ['head', 'ajna', 'throat', 'g', 'heart', 'sacral', 'solarplexus', 'spleen', 'root'] as const
const GATE_CENTER: Record<number, string> = {
  64: 'head', 61: 'head', 63: 'head',
  47: 'ajna', 24: 'ajna', 4: 'ajna', 17: 'ajna', 11: 'ajna', 43: 'ajna',
  62: 'throat', 23: 'throat', 56: 'throat', 35: 'throat', 12: 'throat', 45: 'throat', 33: 'throat', 8: 'throat', 31: 'throat', 20: 'throat', 16: 'throat',
  1: 'g', 13: 'g', 25: 'g', 46: 'g', 2: 'g', 15: 'g', 10: 'g', 7: 'g',
  21: 'heart', 40: 'heart', 26: 'heart', 51: 'heart',
  48: 'spleen', 57: 'spleen', 44: 'spleen', 50: 'spleen', 32: 'spleen', 28: 'spleen', 18: 'spleen',
  34: 'sacral', 5: 'sacral', 14: 'sacral', 29: 'sacral', 59: 'sacral', 9: 'sacral', 3: 'sacral', 42: 'sacral', 27: 'sacral',
  6: 'solarplexus', 37: 'solarplexus', 30: 'solarplexus', 55: 'solarplexus', 49: 'solarplexus', 22: 'solarplexus', 36: 'solarplexus',
  53: 'root', 60: 'root', 52: 'root', 19: 'root', 39: 'root', 41: 'root', 58: 'root', 38: 'root', 54: 'root',
}

const RIGHT_ANGLE_PROFILES = new Set(['1/3', '1/4', '2/4', '2/5', '3/5', '3/6', '4/6'])
const JUXTAPOSITION_PROFILES = new Set(['4/1'])

const TYPE_KEYS: Record<string, HumanDesignSummary['type']> = {
  manifestor: 'manifestor',
  generator: 'generator',
  'manifesting generator': 'manifesting-generator',
  projector: 'projector',
  reflector: 'reflector',
}

const AUTHORITY_KEYS: Array<[prefix: string, key: HumanDesignSummary['authority']]> = [
  ['emotional', 'emotional'],
  ['sacral', 'sacral'],
  ['splenic', 'splenic'],
  ['ego', 'ego'],
  ['self-projected', 'self-projected'],
  ['mental', 'mental'],
  ['lunar', 'lunar'],
]

const BODY_LABELS: Record<string, string> = {
  sun: '太阳',
  earth: '地球',
  moon: '月亮',
  north_node: '北交点',
  south_node: '南交点',
  mercury: '水星',
  venus: '金星',
  mars: '火星',
  jupiter: '木星',
  saturn: '土星',
  uranus: '天王星',
  neptune: '海王星',
  pluto: '冥王星',
}

const CENTER_LABELS: Record<string, string> = {
  head: '头脑中心',
  ajna: '逻辑中心',
  throat: '喉咙中心',
  g: 'G中心',
  heart: '意志中心',
  sacral: '荐骨中心',
  solarplexus: '情绪中心',
  spleen: '直觉中心',
  root: '根部中心',
}

const SPHERE_LABELS: Record<string, string> = {
  lifeswork: '人生使命',
  evolution: '进化',
  radiance: '光辉',
  purpose: '目的',
  iq: 'IQ',
  eq: 'EQ',
  pearl: '珍珠',
  relating: '关系',
  attraction: '吸引力',
  sq: 'SQ',
  core: '核心',
  culture: '文化',
  stability: '稳定性',
  creativity: '创造力',
}

function normalizeType(value: string) {
  const key = TYPE_KEYS[value.toLowerCase()]
  if (!key) {
    throw new Error(`未知的人类图类型：${value}`)
  }
  return key
}

function normalizeAuthority(value: string) {
  const lower = value.toLowerCase()
  return AUTHORITY_KEYS.find(([prefix]) => lower.startsWith(prefix))?.[1] ?? 'mental'
}

function behavioralFacts(type: HumanDesignSummary['type']) {
  const facts = {
    manifestor: { strategy: 'inform', signature: 'peace', notSelfTheme: 'anger' },
    generator: { strategy: 'respond', signature: 'satisfaction', notSelfTheme: 'frustration' },
    'manifesting-generator': { strategy: 'respond-inform', signature: 'satisfaction', notSelfTheme: 'frustration' },
    projector: { strategy: 'invitation', signature: 'success', notSelfTheme: 'bitterness' },
    reflector: { strategy: 'lunar', signature: 'surprise', notSelfTheme: 'disappointment' },
  } as const
  return facts[type]
}

function definitionComponents(definedCenters: string[], channels: HumanDesignChannel[]) {
  const adjacency = new Map<string, Set<string>>()
  for (const center of definedCenters) adjacency.set(center, new Set())
  for (const channel of channels) {
    const [left, right] = channel.centers
    if (!adjacency.has(left) || !adjacency.has(right)) continue
    adjacency.get(left)!.add(right)
    adjacency.get(right)!.add(left)
  }

  const seen = new Set<string>()
  const components: string[][] = []
  for (const center of CENTER_ORDER) {
    if (!adjacency.has(center) || seen.has(center)) continue
    const component: string[] = []
    const queue: string[] = [center]
    seen.add(center)
    while (queue.length) {
      const current = queue.shift()!
      component.push(current)
      for (const next of adjacency.get(current) ?? []) {
        if (!seen.has(next)) {
          seen.add(next)
          queue.push(next)
        }
      }
    }
    components.push(component)
  }

  const type: HumanDesignSummary['definition'] = components.length === 0
    ? 'none'
    : components.length === 1
      ? 'single'
      : components.length === 2
        ? 'split'
        : components.length === 3
          ? 'triple-split'
          : 'quadruple-split'
  return { type, components }
}

function incarnationCross(activations: HumanDesignActivation[], profile: string): HumanDesignSummary['incarnationCross'] {
  const sun = (stream: 'personality' | 'design', body: 'sun' | 'earth') =>
    activations.find(item => item.stream === stream && item.body === body)?.gate ?? 0
  const personalitySun = sun('personality', 'sun')
  const personalityEarth = sun('personality', 'earth')
  const designSun = sun('design', 'sun')
  const designEarth = sun('design', 'earth')
  const angle: HumanDesignSummary['incarnationCross']['angle'] = RIGHT_ANGLE_PROFILES.has(profile)
    ? 'right'
    : JUXTAPOSITION_PROFILES.has(profile)
      ? 'juxtaposition'
      : 'left'
  return {
    angle,
    personalitySun,
    personalityEarth,
    designSun,
    designEarth,
    code: `${personalitySun}/${personalityEarth} | ${designSun}/${designEarth}`,
  }
}

function julianToIso(julianDay: number) {
  return new Date((julianDay - 2440587.5) * 86400000).toISOString()
}

export function calculateHumanDesignChart(input: HumanDesignInput): HumanDesignChartResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) {
    throw new Error('出生日期无效')
  }
  if (!/^\d{2}:\d{2}$/.test(input.birthTime)) {
    throw new Error('出生时间无效')
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: input.timezone })
  }
  catch {
    throw new Error('时区无效')
  }

  const hasCoordinates = Number.isFinite(input.location?.latitude) && Number.isFinite(input.location?.longitude)
  const raw = computeChart({
    birthdate: input.birthDate,
    birthtime: input.birthTime,
    timezone: input.timezone,
    ...(hasCoordinates ? { location: { lat: input.location!.latitude!, lng: input.location!.longitude! } } : {}),
    houseSystem: input.houseSystem ?? 'placidus',
  })

  const activations: HumanDesignActivation[] = [
    ...raw.humanDesign.activations.personality,
    ...raw.humanDesign.activations.design,
  ]
  const channels: HumanDesignChannel[] = raw.humanDesign.definedChannels.map(channel => ({
    key: channel.key,
    gates: [channel.gates[0], channel.gates[1]],
    centers: [channel.centers[0], channel.centers[1]],
    name: channel.name,
  }))
  const definition = definitionComponents(raw.humanDesign.definedCenters, channels)
  const profile = raw.humanDesign.profile ?? ''
  if (!profile || !/^[1-6]\/[1-6]$/.test(profile)) {
    throw new Error('无法推导人生角色')
  }
  const type = normalizeType(raw.humanDesign.type)
  const facts = behavioralFacts(type)

  const gateMap = new Map<number, HumanDesignGate>()
  for (const activation of activations) {
    const gate = gateMap.get(activation.gate) ?? {
      gate: activation.gate,
      center: GATE_CENTER[activation.gate] ?? 'unknown',
      activations: [],
    }
    gate.activations.push({
      stream: activation.stream,
      body: activation.body,
      line: activation.line,
    })
    gateMap.set(activation.gate, gate)
  }

  const centers: HumanDesignCenter[] = CENTER_ORDER.map((id) => {
    const activatedGateCount = [...gateMap.values()].filter(gate => gate.center === id).length
    return {
      id,
      defined: raw.humanDesign.centers[id] === true,
      activatedGateCount,
    }
  })

  const geneKeys = Object.entries(raw.geneKeys.spheres).map(([key, value]) => ({
    key,
    gate: value.gk,
    line: value.line,
  }))

  const angles = raw.astrology
    ? Object.entries(raw.astrology.angles)
        .filter(([key]) => key !== '_meta')
        .map(([key, value]) => ({
          key,
          longitude: value.longitude,
          sign: value.sign,
          degInSign: value.degInSign,
          gate: value.gateLine?.gate ?? null,
          line: value.gateLine?.line ?? null,
        }))
    : []
  const houses = raw.astrology?.houses.cusps.map(cusp => ({
    house: cusp.house,
    longitude: cusp.longitude,
    sign: cusp.sign,
    degInSign: cusp.degInSign,
  })) ?? []

  const location = raw.astrology?.location ?? raw.input.location
  const locationName = input.location?.name?.trim() || location?.city || input.timezone
  const locationSource = hasCoordinates ? 'provided' : location?.source || 'timezone'

  return {
    input: {
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      timezone: input.timezone,
      birthUtc: raw.input.birth_utc,
      designUtc: julianToIso(raw._meta.jd_design),
      locationName,
      locationSource,
      coordinates: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : null,
    },
    summary: {
      type,
      ...facts,
      authority: normalizeAuthority(raw.humanDesign.authority),
      profile,
      definition: definition.type,
      definitionComponents: definition.components,
      incarnationCross: incarnationCross(activations, profile),
    },
    centers,
    definedCenters: raw.humanDesign.definedCenters,
    openCenters: raw.humanDesign.openCenters,
    channels,
    gates: [...gateMap.values()].sort((left, right) => left.gate - right.gate),
    activations,
    geneKeys,
    astrology: raw.astrology
      ? {
          location: {
            name: locationName,
            lat: raw.astrology.location.lat,
            lng: raw.astrology.location.lng,
            source: raw.astrology.location.source,
          },
          angles,
          houses,
          houseSystem: raw.astrology.houses.system,
        }
      : null,
    methodology: {
      engine: 'free-human-design 1.0.1',
      ephemeris: 'VSOP87 + lunar theory (astronomia)',
      designMoment: '约 88 度太阳弧之前的设计时刻',
      astrologyHouseSystem: input.houseSystem ?? 'placidus',
      noBirthPersistence: true,
    },
  }
}

export function isValidHumanDesignResult(value: unknown): value is HumanDesignChartResult {
  if (!value || typeof value !== 'object') return false
  const result = value as Partial<HumanDesignChartResult>
  return !!result.input
    && !!result.summary
    && Array.isArray(result.centers)
    && result.centers.length === 9
    && Array.isArray(result.channels)
    && Array.isArray(result.gates)
    && Array.isArray(result.activations)
    && result.activations.length === 26
    && Array.isArray(result.geneKeys)
}

export function buildHumanDesignContext(result: HumanDesignChartResult) {
  const centerText = result.centers
    .map(center => `${CENTER_LABELS[center.id] ?? center.id}${center.defined ? '定义' : '开放'}(${center.activatedGateCount}闸)`)
    .join('、')
  const activationText = result.activations
    .map((item) => {
      const stream = item.stream === 'personality' ? '个性' : '设计'
      const body = BODY_LABELS[item.body] ?? item.body
      return `${stream}${body} ${item.gate}.${item.line}${item.retrograde ? 'R' : ''}`
    })
    .join('；')
  const channelText = result.channels
    .map(channel => `${channel.key} ${channel.name ?? ''}（${channel.centers.map(center => CENTER_LABELS[center] ?? center).join('-')}）`)
    .join('；')
  const geneKeyText = result.geneKeys
    .map(item => `${SPHERE_LABELS[item.key] ?? item.key} ${item.gate}.${item.line}`)
    .join('；')
  const astrologyText = result.astrology
    ? result.astrology.angles.map(angle => `${angle.key} ${angle.sign} ${angle.degInSign.toFixed(2)}° 闸${angle.gate ?? '-'}.${angle.line ?? '-'}`).join('；')
    : '未提供出生坐标，仅用时区代表位置计算人类图'

  return [
    `能量类型：${result.summary.type}`,
    `策略：${result.summary.strategy}`,
    `内在权威：${result.summary.authority}`,
    `人生角色：${result.summary.profile}`,
    `定义：${result.summary.definition}`,
    `轮回交叉：${result.summary.incarnationCross.code}（${result.summary.incarnationCross.angle}）`,
    `中心：${centerText}`,
    `通道：${channelText || '无'}`,
    `激活闸门：${result.gates.map(gate => `${gate.gate}（${gate.activations.map(item => `${item.stream === 'personality' ? '个性' : '设计'}${BODY_LABELS[item.body] ?? item.body}.${item.line}`).join('/')}）`).join('、')}`,
    `26个激活点：${activationText}`,
    `基因钥匙：${geneKeyText}`,
    `占星参照：${astrologyText}`,
    `出生：${result.input.birthDate} ${result.input.birthTime} ${result.input.timezone}；地点：${result.input.locationName}；设计时刻：${result.input.designUtc}`,
  ].join('\n')
}
