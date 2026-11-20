import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'
import type { BaziTopicLens } from '~~/server/utils/tools/bazi-paipan-topic-lens'

export type BaziRoomPhase = 'idle' | 'topic' | 'calculating' | 'revealed'
export type BaziRoomLinkType = 'combine' | 'clash' | 'generates' | 'controls' | 'harm'
export type BaziRoomFlowStage = 'boot' | 'start' | 'question' | 'birth' | 'calculating' | 'slideshow'
export type BaziRoomSlideId = 'natal' | 'topic-natal' | 'topic-current' | 'reading' | 'full-chart'

export interface BaziRoomPillar {
  key: 'year' | 'month' | 'day' | 'hour' | 'today' | 'flowYear' | 'flowMonth' | 'flowDay' | 'flowHour'
  label: string
  gan: string
  zhi: string
  position: [number, number, number]
  highlighted: boolean
}

export interface BaziRoomLink {
  id: string
  type: BaziRoomLinkType
  from: BaziRoomPillar['key']
  to: BaziRoomPillar['key']
  label: string
}

export interface BaziRoomSceneModel {
  phase: BaziRoomPhase
  flowStage: BaziRoomFlowStage
  pillars: BaziRoomPillar[]
  currentPillars: BaziRoomPillar[]
  links: BaziRoomLink[]
  chart: BaziChartResult | null
  topicLens: BaziTopicLens | null
  focusX: number
  compassSpeed: number
  keeperGesture: 'idle' | 'invite' | 'calculating' | 'present'
  slideId: BaziRoomSlideId | null
  slideTitle: string
  slideDetail: string
  slideIndex: number
  slideCount: number
}

const BASE_PILLARS: BaziRoomPillar[] = [
  { key: 'year', label: '年', gan: '〇', zhi: '〇', position: [-0.52, 1.78, -2.48], highlighted: false },
  { key: 'month', label: '月', gan: '〇', zhi: '〇', position: [0.08, 1.62, -2.58], highlighted: false },
  { key: 'day', label: '日', gan: '〇', zhi: '〇', position: [0.72, 1.78, -2.48], highlighted: false },
  { key: 'hour', label: '时', gan: '〇', zhi: '〇', position: [1.32, 1.58, -2.38], highlighted: false },
]

function linkTypeFromTenGod(tenGod: string): BaziRoomLinkType {
  if (['正印', '偏印', '食神', '伤官'].includes(tenGod)) return 'generates'
  if (['正财', '偏财', '正官', '七杀'].includes(tenGod)) return 'controls'
  return 'combine'
}

function linkTypeFromRelation(type: string): BaziRoomLinkType {
  if (type === '合') return 'combine'
  if (type === '冲') return 'clash'
  if (type === '刑') return 'harm'
  return 'harm'
}

export function buildBaziRoomSceneModel(options: {
  phase: BaziRoomPhase
  flowStage: BaziRoomFlowStage
  currentPillars?: BaziRoomPillar[]
  slideId?: BaziRoomSlideId | null
  slideTitle?: string
  slideDetail?: string
  slideIndex?: number
  slideCount?: number
  result: BaziChartResult | null
  lens: BaziTopicLens | null
}): BaziRoomSceneModel {
  const {
    phase, flowStage, currentPillars = [], slideId = null, slideTitle = '', slideDetail = '',
    slideIndex = 0, slideCount = 1, result, lens,
  } = options
  if (!result) {
    return {
      phase,
      flowStage,
      pillars: BASE_PILLARS,
      currentPillars,
      links: [],
      chart: result,
      topicLens: lens,
      focusX: 0,
      compassSpeed: flowStage === 'calculating' ? 2.2 : 0.28,
      keeperGesture: flowStage === 'calculating'
        ? 'calculating'
        : flowStage === 'start' || flowStage === 'question' || flowStage === 'birth'
          ? 'invite'
          : flowStage === 'slideshow'
            ? 'present'
            : 'invite',
      slideId,
      slideTitle,
      slideDetail,
      slideIndex,
      slideCount,
    }
  }

  const focus = new Set(lens?.focusPillarKeys ?? [])
  const pillars: BaziRoomPillar[] = result.pillars.map((pillar, index) => ({
    key: pillar.key,
    label: pillar.label.slice(0, 1),
    gan: pillar.gan,
    zhi: pillar.zhi,
    position: BASE_PILLARS[index]?.position ?? [0.45, 1.65, -2.45],
    highlighted: focus.size === 0 || focus.has(pillar.key),
  }))

  const todayBase: BaziRoomPillar = {
    key: 'today',
    label: '今',
    gan: lens?.today?.ganzhi.slice(0, 1) ?? '〇',
    zhi: lens?.today?.ganzhi.slice(1, 2) ?? '〇',
    position: [0.45, 2.32, -2.68],
    highlighted: true,
  }
  if (lens?.today) pillars.push(todayBase)

  const links: BaziRoomLink[] = []
  if (lens?.today) {
    links.push({
      id: 'today-ten-god',
      type: linkTypeFromTenGod(lens.today.tenGod),
      from: 'today',
      to: 'day',
      label: lens.today.tenGod,
    })
    for (const relation of lens.today.relations) {
      links.push({
        id: `today-${relation.pillarKey}-${relation.type}`,
        type: linkTypeFromRelation(relation.type),
        from: 'today',
        to: relation.pillarKey,
        label: relation.value,
      })
    }
  }

  const focusValues = pillars
    .filter(pillar => pillar.key !== 'today' && pillar.highlighted)
    .map(pillar => pillar.position[0])
  const focusX = focusValues.length
    ? focusValues.reduce((sum, value) => sum + value, 0) / focusValues.length
    : 0

  return {
    phase,
    flowStage,
    pillars,
    currentPillars,
    links,
    chart: result,
    topicLens: lens,
    focusX: phase === 'revealed' ? focusX : 0.45,
    compassSpeed: flowStage === 'calculating' ? 2.6 : 0.3,
    keeperGesture: flowStage === 'calculating'
      ? 'calculating'
      : flowStage === 'slideshow'
        ? 'present'
        : 'invite',
    slideId,
    slideTitle,
    slideDetail,
    slideIndex,
    slideCount,
  }
}
