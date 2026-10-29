import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'
import { elementKeyByLabel } from './model'

export type BaziSegmentEffect = 'rings' | 'orbit' | 'lattice' | 'stream' | 'star' | 'pulse' | 'pillar'

export interface BaziSegmentField {
  path: string
  value: string
}

export interface BaziSegmentConfig {
  id: string
  parentId: string
  key: string
  titleKey: string
  methodKey: string
  icon: string
  effect: BaziSegmentEffect
  accent: string
  source: BaziSegmentField[]
  judgment: BaziSegmentField[]
}

interface BaziSegmentContext {
  pillar?: BaziChartResult['pillars'][number]
  element?: BaziChartResult['energy']['wuxing'][number]
  dayun?: BaziChartResult['dayuns'][number]
  liunian?: BaziChartResult['dayuns'][number]['liunian'][number]
}

interface BaziSegmentRule {
  parentKind: 'overview' | 'pillar' | 'element' | 'dayun' | 'liunian'
  key: string
  titleKey: string
  methodKey: string
  icon: string
  effect: BaziSegmentEffect
  accent: string
  source: (result: BaziChartResult, context: BaziSegmentContext) => BaziSegmentField[]
  judgment: (result: BaziChartResult, context: BaziSegmentContext) => BaziSegmentField[]
}

function field(path: string, value: unknown): BaziSegmentField {
  const text = Array.isArray(value) ? value.join(' / ') : value
  return { path, value: text === undefined || text === null || text === '' ? '—' : String(text) }
}

const SEGMENT_RULES: BaziSegmentRule[] = [
  {
    parentKind: 'overview',
    key: 'birth-info',
    titleKey: 'bazi3d.segment.birthInfo',
    methodKey: 'bazi3d.method.calendar',
    icon: 'i-lucide-calendar-clock',
    effect: 'rings',
    accent: '#38bdf8',
    source: (result) => {
      return [
        field('birth.solarText', result.birth.solarText),
        field('birth.clockText', result.birth.clockText),
        field('birth.trueSolarText', result.birth.trueSolarText),
        field('birth.selectedHour', result.birth.selectedHour),
        field('birth.effectiveHour', result.birth.effectiveHour),
        field('birth.lunarDetail', result.birth.lunarDetail),
        field('birth.timezone', result.birth.timezone),
      ]
    },
    judgment: result => [
      field('birth.solarTimeStatus', result.birth.solarTimeStatus),
      field('birth.solarTimeStatusText', result.birth.solarTimeStatusText),
      field('birth.dayBoundaryChanged', result.birth.dayBoundaryChanged),
      field('birth.solarTerm.previous', result.birth.solarTerm.previous.name),
      field('birth.solarTerm.next', result.birth.solarTerm.next.name),
      field('birth.solarTerm.progress', `${result.birth.solarTerm.progress}%`),
    ],
  },
  {
    parentKind: 'overview',
    key: 'day-strength',
    titleKey: 'bazi3d.segment.dayStrength',
    methodKey: 'bazi3d.method.strength',
    icon: 'i-lucide-scale',
    effect: 'pulse',
    accent: '#fbbf24',
    source: result => [
      field('energy.strength', result.energy.strength),
      field('energy.supportRatio', `${result.energy.supportRatio}%`),
      field('calculation.dayElement', result.pillars.find(pillar => pillar.key === 'day')?.ganWuxing),
      field('calculation.supportElement', '生日主的五行'),
      field('calculation.totalWeight', result.energy.wuxing.reduce((sum, item) => sum + item.weight, 0).toFixed(2)),
      field('energy.rootStatus', result.energy.rootStatus),
      field('energy.monthCommand', result.energy.monthCommand),
      field('energy.monthCommandDetail', result.energy.monthCommandDetail),
    ],
    judgment: (result) => {
      const dayElement = result.pillars.find(pillar => pillar.key === 'day')?.ganWuxing
      const dayItem = result.energy.wuxing.find(item => item.key === dayElement)
      const supportElement = result.energy.wuxing.find(item => item.role === '印星')
      const supportWeight = (dayItem?.weight ?? 0) + (supportElement?.weight ?? 0)
      const totalWeight = result.energy.wuxing.reduce((sum, item) => sum + item.weight, 0)
      return [
        field('calculation.dayElementWeight', dayItem?.weight),
        field('calculation.supportElement', supportElement?.label),
        field('calculation.supportElementWeight', supportElement?.weight),
        field('calculation.supportWeight', supportWeight.toFixed(2)),
        field('calculation.totalWeight', totalWeight.toFixed(2)),
        field('calculation.supportRatioFormula', `(${dayItem?.weight ?? 0} + ${supportElement?.weight ?? 0}) ÷ ${totalWeight.toFixed(2)} × 100 = ${result.energy.supportRatio}%`),
        field('calculation.strengthThresholds', '≥48% 身强；40%-47.9% 中和偏弱；<40% 身弱'),
        field('energy.rootQuality', `${result.energy.rootQuality}%`),
        field('energy.primaryUseGod', result.energy.primaryUseGod),
        field('energy.supportUseGod', result.energy.supportUseGod),
        field('energy.avoidGod', result.energy.avoidGod),
        field('energy.adjustment', result.energy.adjustment),
      ]
    },
  },
  {
    parentKind: 'overview',
    key: 'natal-signals',
    titleKey: 'bazi3d.segment.natalSignals',
    methodKey: 'bazi3d.method.signal',
    icon: 'i-lucide-git-merge',
    effect: 'stream',
    accent: '#22d3ee',
    source: result => [
      ...result.relations.map(item => field(
        `relations[${item.id}]`,
        `${item.group} · ${item.value}${item.type} · ${item.positions.join('/')} · ${item.impact}`,
      )),
      ...result.shensha.map(item => field(
        `shensha[${item.name}]`,
        `${item.classification} · ${item.positions.join('/')} · ${item.description}`,
      )),
    ],
    judgment: result => [
      ...result.relations.map(item => field(`relations[${item.id}].status`, `${item.status} · ${item.intensity}`)),
      ...result.shenshaCombinations.map(item => field(
        `shenshaCombinations[${item.name}]`,
        `${item.value} · ${item.positions.join('/')} · ${item.note}`,
      )),
    ],
  },
  {
    parentKind: 'overview',
    key: 'structure',
    titleKey: 'bazi3d.segment.structure',
    methodKey: 'bazi3d.method.signal',
    icon: 'i-lucide-frame',
    effect: 'lattice',
    accent: '#f97316',
    source: result => [
      field('pattern.name', result.pattern.name),
      field('pattern.monthMainQi', result.pattern.monthMainQi),
      field('pattern.transparency', result.pattern.transparency),
      field('pattern.rootStatus', result.pattern.rootStatus),
      field('energy.primaryUseGod', result.energy.primaryUseGod),
    ],
    judgment: result => [
      field('pattern.status', result.pattern.status),
      ...result.pattern.evidence.map((item, index) => field(`pattern.evidence[${index}]`, item)),
      field('structure.patternEvidence', result.structure.patternEvidence),
    ],
  },

  {
    parentKind: 'pillar',
    key: 'detail',
    titleKey: 'bazi3d.pillarDetail',
    methodKey: 'bazi3d.method.pillar',
    icon: 'i-lucide-columns-3',
    effect: 'pillar',
    accent: '#a5b4fc',
    source: (_result, context) => {
      const pillar = context.pillar
      return [
        field('pillar.label', pillar?.label),
        field('pillar.ganzhi', pillar?.ganzhi),
        field('pillar.gan', pillar?.gan),
        field('pillar.ganWuxing', pillar?.ganWuxing),
        field('pillar.zhi', pillar?.zhi),
        field('pillar.zhiWuxing', pillar?.zhiWuxing),
        field('pillar.shishenGan', pillar?.shishenGan),
        ...(pillar?.hiddenStems ?? []).map((item, index) => field(
          `pillar.hiddenStems[${index}]`,
          `${item.gan} · ${item.type} · ${item.wuxing} · ${item.shishen}`,
        )),
        field('pillar.nayin', pillar?.nayin),
        field('pillar.diShi', pillar?.diShi),
        field('pillar.selfSitting', pillar?.selfSitting),
        field('pillar.xun', pillar?.xun),
        field('pillar.xunKong', pillar?.xunKong),
        field('pillar.key', pillar?.key),
        field('pillar.shensha.length', pillar?.shensha.length),
        ...(pillar?.shensha ?? []).map((item, index) => field(
          `pillar.shensha[${index}]`,
          `${item.name} · ${item.classification} · ${item.description}`,
        )),
      ]
    },
    judgment: (_result, context) => {
      const pillar = context.pillar
      return [
        field('pillar.tag', pillar?.tag),
        field('pillar.selfSitting', pillar?.selfSitting),
        field('pillar.shishenGan', pillar?.shishenGan),
        ...(pillar?.hiddenStems ?? []).map((item, index) => field(
          `pillar.hiddenStems[${index}].isMain`,
          `${item.isMain} · ${item.wuxing} · ${item.shishen}`,
        )),
        field('pillar.diShi', pillar?.diShi),
        field('pillar.voidKinds', pillar?.voidKinds),
        ...(pillar?.shensha ?? []).map(item => field(
          `pillar.shensha[${item.name}].classification`,
          item.classification,
        )),
        field('pillar.ganWuxing + pillar.shishenGan', `${pillar?.ganWuxing} · ${pillar?.shishenGan}`),
        field('pillar.zhiWuxing + main hidden stem', `${pillar?.zhiWuxing} · ${pillar?.hiddenStems[0]?.wuxing} · ${pillar?.hiddenStems[0]?.shishen}`),
      ]
    },
  },

  {
    parentKind: 'element',
    key: 'detail',
    titleKey: 'bazi3d.element',
    methodKey: 'bazi3d.method.balance',
    icon: 'i-lucide-chart-pie',
    effect: 'orbit',
    accent: '#4ade80',
    source: (result, context) => {
      const element = context.element
      return [
        field('element.key', element?.key),
        field('element.role', element?.role),
        field('element.weight', element?.weight),
        field('element.percent', `${element?.percent}%`),
        field('element.visibleCount', element?.visibleCount),
        field('element.hiddenCount', element?.hiddenCount),
        field('element.state', element?.state),
        field('element.direction', element?.direction),
        field('energy.strength', result.energy.strength),
        field('energy.supportRatio', `${result.energy.supportRatio}%`),
        field('element.organs', element?.organs),
        field('energy.adjustment', result.energy.adjustment),
      ]
    },
    judgment: (result, context) => {
      const element = context.element
      return [
        field('element.stateLabel', element?.stateLabel),
        field('element.evidence', element?.evidence),
        field('energy.primaryUseGod', result.energy.primaryUseGod),
        field('energy.supportUseGod', result.energy.supportUseGod),
        field('energy.avoidGod', result.energy.avoidGod),
        field('energy.rootStatus', result.energy.rootStatus),
        field('energy.adjustment', result.energy.adjustment),
      ]
    },
  },

  {
    parentKind: 'dayun',
    key: 'detail',
    titleKey: 'baziChart.dayunTitle',
    methodKey: 'bazi3d.method.cycle',
    icon: 'i-lucide-milestone',
    effect: 'stream',
    accent: '#818cf8',
    source: (result, context) => {
      const dayun = context.dayun
      const currentYear = dayun?.liunian.find(item => item.isCurrent) ?? dayun?.liunian[0]
      return [
        field('dayunMeta.direction', result.dayunMeta.direction),
        field('dayunMeta.startText', result.dayunMeta.startText),
        field('dayunMeta.startDate', result.dayunMeta.startDate),
        ...result.dayuns.map(item => field(
          `dayuns[${item.index}]`,
          `${item.startYear}-${item.endYear} · ${item.ganzhi} · ${item.startAge}-${item.endAge}`,
        )),
        field('dayun.ganzhi', dayun?.ganzhi),
        field('dayun.startYear', dayun?.startYear),
        field('dayun.endYear', dayun?.endYear),
        field('dayun.startAge', dayun?.startAge),
        field('dayun.endAge', dayun?.endAge),
        field('dayun.index', dayun?.index),
        field('dayun.shensha.length', dayun?.shensha.length),
        ...(dayun?.shensha ?? []).map((item, index) => field(
          `dayun.shensha[${index}]`,
          `${item.name} · ${item.classification} · ${item.description}`,
        )),
        ...(dayun?.liunian ?? []).map(item => field(
          `dayun.liunian[${item.year}]`,
          `${item.ganzhi} · ${item.age} · ${item.intensity}`,
        )),
        ...(currentYear ? [
          field('dayun.currentLiunian.year', currentYear.year),
          field('dayun.currentLiunian.ganzhi', currentYear.ganzhi),
          field('dayun.currentLiunian.age', currentYear.age),
          field('dayun.currentLiunian.shishen', `${currentYear.shishenGan} / ${currentYear.shishenZhi}`),
          field('dayun.currentLiunian.intensity', currentYear.intensity),
          field('dayun.currentLiunian.summary', currentYear.summary),
          ...currentYear.energyShifts.map((item, index) => field(`dayun.currentLiunian.energyShifts[${index}]`, item)),
          ...currentYear.signals.map((item, index) => field(
            `dayun.currentLiunian.signals[${index}]`,
            `${item.value}${item.type} · ${item.positions.join('/')} · ${item.impact}`,
          )),
        ] : []),
      ]
    },
    judgment: (result, context) => {
      const dayun = context.dayun
      return [
        ...result.dayuns.map(item => field(
          `dayuns[${item.index}].isCurrent`,
          `${item.isCurrent} · ${item.shishenGan} / ${item.shishenZhi}`,
        )),
        field('dayun.isCurrent', dayun?.isCurrent),
        field('dayun.shishenGan', dayun?.shishenGan),
        field('dayun.shishenZhi', dayun?.shishenZhi),
        ...(dayun?.shensha ?? []).map(item => field(
          `dayun.shensha[${item.name}].classification`,
          item.classification,
        )),
        ...(dayun?.liunian ?? []).map(item => field(
          `dayun.liunian[${item.year}].isCurrent`,
          `${item.isCurrent} · ${item.summary}`,
        )),
      ]
    },
  },

  {
    parentKind: 'liunian',
    key: 'detail',
    titleKey: 'bazi3d.annualSummary',
    methodKey: 'bazi3d.method.cycle',
    icon: 'i-lucide-calendar-check',
    effect: 'orbit',
    accent: '#f43f5e',
    source: (_result, context) => {
      const liunian = context.liunian
      return [
        field('liunian.year', liunian?.year),
        field('liunian.ganzhi', liunian?.ganzhi),
        field('liunian.age', liunian?.age),
        field('liunian.shishenGan', liunian?.shishenGan),
        field('liunian.shishenZhi', liunian?.shishenZhi),
        ...(liunian?.energyShifts ?? []).map((item, index) => field(
          `liunian.energyShifts[${index}]`,
          item,
        )),
        field('liunian.signals.length', liunian?.signals.length),
        ...(liunian?.signals ?? []).map((item, index) => field(
          `liunian.signals[${index}]`,
          `${item.value}${item.type} · ${item.positions.join('/')} · ${item.impact}`,
        )),
      ]
    },
    judgment: (_result, context) => {
      const liunian = context.liunian
      return [
        field('liunian.intensity', liunian?.intensity),
        field('liunian.isCurrent', liunian?.isCurrent),
        field('liunian.summary', liunian?.summary),
        field('liunian.shishenGan', liunian?.shishenGan),
        ...(liunian?.signals ?? []).map((item, index) => field(
          `liunian.signals[${index}].impact`,
          `${item.type} · ${item.impact}`,
        )),
      ]
    },
  },
]

function buildContexts(result: BaziChartResult): Array<{ parentId: string, context: BaziSegmentContext }> {
  return [
    { parentId: 'overview', context: {} },
    ...result.pillars.map(pillar => ({
      parentId: `pillar:${pillar.key}`,
      context: { pillar } satisfies BaziSegmentContext,
    })),
    ...result.energy.wuxing.map(element => ({
      parentId: `element:${elementKeyByLabel(element.key)}`,
      context: { element } satisfies BaziSegmentContext,
    })),
    ...result.dayuns.map(dayun => ({
      parentId: `dayun:${dayun.index}`,
      context: { dayun } satisfies BaziSegmentContext,
    })),
    ...result.dayuns.flatMap(dayun => dayun.liunian.map(liunian => ({
      parentId: `liunian:${liunian.year}`,
      context: { liunian } satisfies BaziSegmentContext,
    }))),
  ]
}

export function buildBaziPaipanSegmentConfigs(result: BaziChartResult): BaziSegmentConfig[] {
  return buildContexts(result).flatMap(({ parentId, context }) => {
    const parentKind = parentId === 'overview'
      ? 'overview'
      : parentId.split(':', 1)[0] as BaziSegmentRule['parentKind']

    return SEGMENT_RULES
      .filter(rule => rule.parentKind === parentKind)
      .map(rule => ({
        id: `${parentId}/${rule.key}`,
        parentId,
        key: rule.key,
        titleKey: rule.titleKey,
        methodKey: rule.methodKey,
        icon: rule.icon,
        effect: rule.effect,
        accent: rule.accent,
        source: rule.source(result, context),
        judgment: rule.judgment(result, context),
      }))
  })
}
