import type { HumanDesignChartResult } from '~~/server/utils/tools/human-design'

export interface CosmosCenter {
  key: string
  cn: string
  theme: string
  color: number
  gates: number[]
  layout: { x: number, y: number, w: number, h: number }
}

export interface CosmosChannel {
  a: number
  b: number
  name: string
  theme: string
  centers: [string, string]
}

export interface CosmosBody {
  key: string
  cn: string
}

export interface CosmosGeneKey {
  stage: '激活序列' | '金星序列' | '珍珠序列'
  name: string
  key: number
  partner: number
}

export interface CosmosData {
  centerStatus: Record<string, 'defined' | 'undefined' | 'open'>
  activatedGates: Set<number>
  hangingGates: Array<{ gate: number, center: string, partners: number[] }>
  definedChannels: CosmosChannel[]
  geneKeys: CosmosGeneKey[]
  crossGates: number[]
}

export const COSMOS_CENTERS: Record<string, CosmosCenter> = {
  head: { key: 'head', cn: '头顶', theme: '灵感与压力', color: 0xf5e6c8, gates: [64, 61, 63], layout: { x: 0, y: 6, w: 2.2, h: 0.9 } },
  ajna: { key: 'ajna', cn: '逻辑', theme: '概念化与理解', color: 0xa78bfa, gates: [47, 24, 4, 17, 43, 11], layout: { x: 0, y: 4.5, w: 2.4, h: 0.9 } },
  throat: { key: 'throat', cn: '喉咙', theme: '行动与表达', color: 0x4fd8ff, gates: [62, 23, 56, 16, 20, 31, 8, 33, 35, 12, 45], layout: { x: 0, y: 2.8, w: 1.6, h: 1.1 } },
  g: { key: 'g', cn: 'G中心', theme: '方向与爱', color: 0x5ee7a8, gates: [1, 13, 25, 46, 2, 15, 10, 7], layout: { x: 0, y: 0.6, w: 1.8, h: 1.3 } },
  heart: { key: 'heart', cn: '意志力', theme: '自我与价值', color: 0xff6b9d, gates: [21, 26, 40, 51], layout: { x: 2.2, y: 0.6, w: 1.3, h: 1.1 } },
  solarplexus: { key: 'solarplexus', cn: '情绪', theme: '情绪与渴望', color: 0xffb347, gates: [6, 22, 30, 36, 37, 49, 55], layout: { x: 2.8, y: 2.4, w: 1.3, h: 1 } },
  sacral: { key: 'sacral', cn: '荐骨', theme: '生殖与生命力', color: 0xff7b54, gates: [5, 9, 14, 29, 34, 42, 3, 27, 59], layout: { x: 0, y: -2.1, w: 2.4, h: 1.2 } },
  spleen: { key: 'spleen', cn: '直觉', theme: '直觉与生存', color: 0x8ce99a, gates: [48, 57, 44, 50, 32, 28, 18], layout: { x: -2.8, y: 2.4, w: 1.3, h: 1 } },
  root: { key: 'root', cn: '根部', theme: '压力与驱动', color: 0xe05a5a, gates: [58, 38, 54, 53, 60, 52, 39, 19, 41], layout: { x: 0, y: -4.4, w: 2.2, h: 1.1 } },
}

export const COSMOS_CHANNEL_LIST: CosmosChannel[] = [
  { a: 64, b: 47, name: '抽象', theme: '经验片段的困惑与理解', centers: ['head', 'ajna'] },
  { a: 61, b: 24, name: '觉知', theme: '内在奥秘的追问与反复思量', centers: ['head', 'ajna'] },
  { a: 63, b: 4, name: '逻辑', theme: '怀疑与模式检验', centers: ['head', 'ajna'] },
  { a: 17, b: 62, name: '接纳', theme: '组织观念并表达为细节', centers: ['ajna', 'throat'] },
  { a: 43, b: 23, name: '结构化', theme: '洞见转成语言', centers: ['ajna', 'throat'] },
  { a: 11, b: 56, name: '好奇', theme: '观念成为故事', centers: ['ajna', 'throat'] },
  { a: 1, b: 8, name: '启发', theme: '创造力与典范', centers: ['g', 'throat'] },
  { a: 7, b: 31, name: '领导', theme: '为未来发声', centers: ['g', 'throat'] },
  { a: 13, b: 33, name: '回顾见证', theme: '退隐回顾并叙述', centers: ['g', 'throat'] },
  { a: 10, b: 20, name: '觉醒', theme: '自我行为的即时表达', centers: ['g', 'throat'] },
  { a: 10, b: 34, name: '探索', theme: '力量服务于自我行为', centers: ['g', 'sacral'] },
  { a: 10, b: 57, name: '完善形态', theme: '在当下感知中保全自身', centers: ['g', 'spleen'] },
  { a: 20, b: 34, name: '魅力', theme: '保持忙碌并当下行动', centers: ['throat', 'sacral'] },
  { a: 20, b: 57, name: '脑波', theme: '洞察觉知透过表达流出', centers: ['throat', 'spleen'] },
  { a: 34, b: 57, name: '力量', theme: '骶骨力量与即时觉知', centers: ['sacral', 'spleen'] },
  { a: 16, b: 48, name: '才能表达', theme: '深度储备经过熟练而表达', centers: ['throat', 'spleen'] },
  { a: 21, b: 45, name: '资源管理', theme: '资源控制与分配', centers: ['heart', 'throat'] },
  { a: 12, b: 22, name: '开放', theme: '情绪开放进入表达', centers: ['throat', 'solarplexus'] },
  { a: 35, b: 36, name: '变迁', theme: '经由新经历形成经验', centers: ['throat', 'solarplexus'] },
  { a: 25, b: 51, name: '发起', theme: '冲击触及自我精神', centers: ['g', 'heart'] },
  { a: 2, b: 14, name: '节拍', theme: '资源获得方向', centers: ['g', 'sacral'] },
  { a: 5, b: 15, name: '节律', theme: '固定节律与节奏范围', centers: ['sacral', 'g'] },
  { a: 29, b: 46, name: '发现', theme: '投入一段亲身经历', centers: ['sacral', 'g'] },
  { a: 44, b: 26, name: '传承交付', theme: '识别模式并交付价值', centers: ['spleen', 'heart'] },
  { a: 37, b: 40, name: '社群', theme: '支持、劳动与约定', centers: ['solarplexus', 'heart'] },
  { a: 27, b: 50, name: '保存', theme: '照料与责任边界', centers: ['sacral', 'spleen'] },
  { a: 59, b: 6, name: '亲密结合', theme: '靠近与情绪边界', centers: ['sacral', 'solarplexus'] },
  { a: 42, b: 53, name: '成熟', theme: '从开端走向完成', centers: ['sacral', 'root'] },
  { a: 3, b: 60, name: '突变', theme: '限制中的新秩序', centers: ['sacral', 'root'] },
  { a: 9, b: 52, name: '专注', theme: '稳定地聚焦细部', centers: ['sacral', 'root'] },
  { a: 19, b: 49, name: '综合', theme: '需要与原则的协商', centers: ['root', 'solarplexus'] },
  { a: 39, b: 55, name: '情绪表达', theme: '触动情绪与精神状态', centers: ['root', 'solarplexus'] },
  { a: 41, b: 30, name: '经验识别', theme: '从想象走向体验', centers: ['root', 'solarplexus'] },
  { a: 18, b: 58, name: '判断', theme: '活力用于判断和改进', centers: ['spleen', 'root'] },
  { a: 28, b: 38, name: '抗争', theme: '为意义投入抗争', centers: ['spleen', 'root'] },
  { a: 32, b: 54, name: '转化', theme: '发展动力与延续判断', centers: ['spleen', 'root'] },
]

export const COSMOS_BODIES: CosmosBody[] = [
  { key: 'sun', cn: '太阳' },
  { key: 'earth', cn: '地球' },
  { key: 'moon', cn: '月亮' },
  { key: 'north_node', cn: '北交点' },
  { key: 'south_node', cn: '南交点' },
  { key: 'mercury', cn: '水星' },
  { key: 'venus', cn: '金星' },
  { key: 'mars', cn: '火星' },
  { key: 'jupiter', cn: '木星' },
  { key: 'saturn', cn: '土星' },
  { key: 'uranus', cn: '天王星' },
  { key: 'neptune', cn: '海王星' },
  { key: 'pluto', cn: '冥王星' },
]

export const COSMOS_GATE_ARC = 360 / 64
export const COSMOS_LINE_ARC = COSMOS_GATE_ARC / 6
export const COSMOS_GATE_41_START = 302
export const COSMOS_GATE_ORDER = Array.from({ length: 64 }, (_, index) => ((40 + index) % 64) + 1)

export const COSMOS_TYPE_INFO: Record<HumanDesignChartResult['summary']['type'], { cn: string, typeKey: string, strategy: string, signature: string, notSelf: string }> = {
  manifestor: { cn: '显示者', typeKey: 'Manifestor', strategy: '告知，然后行动', signature: '平静', notSelf: '愤怒' },
  generator: { cn: '生产者', typeKey: 'Generator', strategy: '等待回应', signature: '满足', notSelf: '挫败' },
  'manifesting-generator': { cn: '显示生产者', typeKey: 'Manifesting Generator', strategy: '等待回应，然后快速行动', signature: '满足', notSelf: '挫败与愤怒' },
  projector: { cn: '投射者', typeKey: 'Projector', strategy: '等待邀请', signature: '成功', notSelf: '苦涩' },
  reflector: { cn: '反映者', typeKey: 'Reflector', strategy: '等待月亮周期', signature: '惊喜', notSelf: '失望' },
}

export const COSMOS_PROFILE_INFO: Record<string, string> = {
  '1/3': '研究者/烈士',
  '1/4': '研究者/机会主义者',
  '2/4': '隐士/机会主义者',
  '2/5': '隐士/异端',
  '3/5': '烈士/异端',
  '3/6': '烈士/人生典范',
  '4/6': '机会主义者/人生典范',
  '4/1': '机会主义者/研究者',
  '5/1': '异端/研究者',
  '5/2': '异端/隐士',
  '6/2': '人生典范/隐士',
  '6/3': '人生典范/烈士',
}

export const COSMOS_DEFINITION_INFO: Record<HumanDesignChartResult['summary']['definition'], string> = {
  none: '无定义（反映者）',
  single: '单一分定义',
  split: '二分定义',
  'triple-split': '三分定义',
  'quadruple-split': '四分定义',
}

export const COSMOS_SIGN_CN: Record<string, string> = {
  Aries: '白羊', Taurus: '金牛', Gemini: '双子', Cancer: '巨蟹',
  Leo: '狮子', Virgo: '处女', Libra: '天秤', Scorpio: '天蝎',
  Sagittarius: '射手', Capricorn: '摩羯', Aquarius: '水瓶', Pisces: '双鱼',
}

export const COSMOS_ANGLE_CN: Record<string, string> = {
  ascendant: '上升', descendant: '下降', mc: '天顶', ic: '天底',
}

export function norm360(value: number) {
  return ((value % 360) + 360) % 360
}

export function lonToSign(longitude: number) {
  const normalized = norm360(longitude)
  const idx = Math.floor(normalized / 30)
  const cnByIndex = ['白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼']
  return { idx, cn: cnByIndex[idx] ?? '', deg: normalized % 30 }
}

export function buildCosmosData(result: HumanDesignChartResult): CosmosData {
  const activatedGates = new Set(result.gates.map(item => item.gate))
  const resultChannelKeys = new Set(result.channels.map(item => item.key))
  const definedChannels = COSMOS_CHANNEL_LIST.filter(channel => resultChannelKeys.has(`${Math.min(channel.a, channel.b)}-${Math.max(channel.a, channel.b)}`))
  const centerStatus: CosmosData['centerStatus'] = {}
  const hangingGates: CosmosData['hangingGates'] = []

  for (const center of Object.values(COSMOS_CENTERS)) {
    centerStatus[center.key] = result.definedCenters.includes(center.key)
      ? 'defined'
      : center.gates.some(gate => activatedGates.has(gate)) ? 'undefined' : 'open'
  }

  for (const gate of activatedGates) {
    const channelsOfGate = COSMOS_CHANNEL_LIST.filter(channel => channel.a === gate || channel.b === gate)
    const hasComplete = channelsOfGate.some(channel => definedChannels.some(defined => defined.a === channel.a && defined.b === channel.b))
    if (!hasComplete) {
      hangingGates.push({
        gate,
        center: Object.values(COSMOS_CENTERS).find(center => center.gates.includes(gate))?.key ?? '',
        partners: channelsOfGate.map(channel => channel.a === gate ? channel.b : channel.a),
      })
    }
  }

  const lifeWork = result.activations.find(item => item.stream === 'personality' && item.body === 'sun')?.gate ?? 0
  const evolution = result.activations.find(item => item.stream === 'design' && item.body === 'sun')?.gate ?? 0
  const radiance = result.activations.find(item => item.stream === 'personality' && item.body === 'earth')?.gate ?? 0
  const purpose = result.activations.find(item => item.stream === 'design' && item.body === 'earth')?.gate ?? 0
  const derived = (offset: number) => ((lifeWork + offset) % 64) + 1
  const geneSeeds: Array<{ stage: CosmosGeneKey['stage'], name: string, key: number }> = [
    { stage: '激活序列', name: '人生工作', key: lifeWork },
    { stage: '激活序列', name: '进化', key: evolution },
    { stage: '激活序列', name: '光芒', key: radiance },
    { stage: '激活序列', name: '目的', key: purpose },
    { stage: '金星序列', name: '目的', key: lifeWork },
    { stage: '金星序列', name: '吸引', key: derived(31) },
    { stage: '金星序列', name: 'IQ', key: derived(15) },
    { stage: '金星序列', name: 'EQ', key: derived(47) },
    { stage: '金星序列', name: 'SQ', key: derived(23) },
    { stage: '金星序列', name: '核心', key: derived(55) },
    { stage: '珍珠序列', name: '天职', key: derived(7) },
    { stage: '珍珠序列', name: '文化', key: derived(39) },
    { stage: '珍珠序列', name: '珍珠', key: derived(19) },
  ]
  const geneKeys: CosmosGeneKey[] = geneSeeds.map(item => ({
    ...item,
    partner: ((item.key + 31) % 64) + 1,
  }))

  return {
    centerStatus,
    activatedGates,
    hangingGates,
    definedChannels,
    geneKeys,
    crossGates: [
      result.summary.incarnationCross.personalitySun,
      result.summary.incarnationCross.personalityEarth,
      result.summary.incarnationCross.designSun,
      result.summary.incarnationCross.designEarth,
    ].filter(Boolean),
  }
}
