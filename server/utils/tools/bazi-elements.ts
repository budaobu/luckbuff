import type { BaziChart, Pillar } from '~/types/bazi'
import type { DiZhi } from '~/types/user'
import { calcPillars } from '~/utils/bazi/pillars'
import {
  calcGeJu,
  calcRiZhuStrength,
  calcWuxingScore,
  calcXiYongJiShen,
} from '~/utils/bazi/analysisCalc'

export const WUXING_KEYS = ['木', '火', '土', '金', '水'] as const
export type WuxingKey = typeof WUXING_KEYS[number]
export type WuxingLevel = 'missing' | 'low' | 'balanced' | 'strong' | 'dominant'
export type ElementBalanceState = 'balanced' | 'varied' | 'skewed' | 'gap' | 'multi-gap'
export type ElementFocusReason = 'favorable-missing' | 'favorable-low' | 'favorable' | 'missing' | 'low'

export interface BaziElementsInput {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name?: string
}

export interface BaziElementsResult {
  pillars: Array<Pillar & { label: 'year' | 'month' | 'day' | 'hour' }>
  dayMaster: string
  strength: BaziChart['riZhuStrength']
  geju: string
  favorable: string[]
  unfavorable: string[]
  elements: Array<{ key: WuxingKey; score: number; level: WuxingLevel }>
  missing: WuxingKey[]
  low: WuxingKey[]
  dominant: WuxingKey[]
  balanceState: ElementBalanceState
  focus: Array<{ key: WuxingKey; reason: ElementFocusReason }>
}

const HOUR_TO_HOUR_NUMBER: Record<DiZhi, number> = {
  子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
  午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
}

function parseBirthDate(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate' })

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (!Number.isFinite(date.getTime())
    || date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate' })
  }
  return { year, month, day }
}

function elementLevel(score: number): WuxingLevel {
  if (score === 0) return 'missing'
  if (score < 10) return 'low'
  if (score < 25) return 'balanced'
  if (score < 35) return 'strong'
  return 'dominant'
}

function splitElementList(value: string): WuxingKey[] {
  return value
    .split(/[、，,\s]+/)
    .map(item => item.trim())
    .filter((item): item is WuxingKey => (WUXING_KEYS as readonly string[]).includes(item))
}

function buildFocus(
  elements: BaziElementsResult['elements'],
  missing: WuxingKey[],
  low: WuxingKey[],
  favorable: WuxingKey[],
): BaziElementsResult['focus'] {
  const reasonRank: Record<ElementFocusReason, number> = {
    'favorable-missing': 0,
    'favorable-low': 1,
    missing: 2,
    low: 3,
    favorable: 4,
  }

  return elements
    .map(({ key, score }) => {
      const favorableElement = favorable.includes(key)
      let reason: ElementFocusReason
      if (favorableElement && missing.includes(key)) reason = 'favorable-missing'
      else if (favorableElement && low.includes(key)) reason = 'favorable-low'
      else if (favorableElement) reason = 'favorable'
      else if (missing.includes(key)) reason = 'missing'
      else if (low.includes(key)) reason = 'low'
      else return null

      return { key, score, reason }
    })
    .filter((item): item is { key: WuxingKey; score: number; reason: ElementFocusReason } => item !== null)
    .sort((a, b) => reasonRank[a.reason] - reasonRank[b.reason] || a.score - b.score)
    .slice(0, 3)
    .map(({ key, reason }) => ({ key, reason }))
}

export function analyzeBaziElements(input: BaziElementsInput): BaziElementsResult {
  const { year, month, day } = parseBirthDate(input.birthDate)
  const hour = input.birthHour ? HOUR_TO_HOUR_NUMBER[input.birthHour] ?? null : null
  const pillars = calcPillars(year, month, day, hour, input.gender)

  const partialChart: BaziChart = {
    year: pillars.year,
    month: pillars.month,
    day: pillars.day,
    hour: pillars.hour,
    riZhu: pillars.riZhu,
    riZhuStrength: '身弱',
    wuxingScore: { 木: 20, 火: 20, 土: 20, 金: 20, 水: 20 },
    geju: '',
    xiyong: '',
    jishen: '',
    dayuns: [],
    qiyunAge: 0,
    currentAge: 0,
    currentDaYun: null,
  }

  const wuxingScore = calcWuxingScore(partialChart)
  const strength = calcRiZhuStrength(pillars.riZhu, pillars.month.zhi, wuxingScore)
  const { xiyong, jishen } = calcXiYongJiShen(pillars.riZhu, strength, wuxingScore)
  partialChart.riZhuStrength = strength
  partialChart.wuxingScore = wuxingScore
  partialChart.xiyong = xiyong
  partialChart.jishen = jishen
  const geju = calcGeJu(partialChart)

  const elements = WUXING_KEYS.map(key => ({
    key,
    score: Math.round(wuxingScore[key] ?? 0),
    level: elementLevel(Math.round(wuxingScore[key] ?? 0)),
  }))
  const missing = elements.filter(item => item.level === 'missing').map(item => item.key)
  const low = elements.filter(item => item.level === 'low').map(item => item.key)
  const dominant = elements.filter(item => item.level === 'dominant').map(item => item.key)
  const maxScore = Math.max(...elements.map(item => item.score))
  const minScore = Math.min(...elements.map(item => item.score))

  const balanceState: ElementBalanceState = missing.length >= 2
    ? 'multi-gap'
    : missing.length === 1
      ? 'gap'
      : maxScore >= 35
        ? 'skewed'
        : maxScore - minScore <= 18
          ? 'balanced'
          : 'varied'

  const favorable = splitElementList(xiyong)
  const unfavorable = splitElementList(jishen)

  return {
    pillars: ([
      ['year', pillars.year],
      ['month', pillars.month],
      ['day', pillars.day],
      ['hour', pillars.hour],
    ] as const)
      .filter((item): item is ['year' | 'month' | 'day' | 'hour', Pillar] => item[1] !== null)
      .map(([label, pillar]) => ({ ...pillar, label })),
    dayMaster: `${pillars.riZhu}${pillars.day.zhi}`,
    strength,
    geju,
    favorable,
    unfavorable,
    elements,
    missing,
    low,
    dominant,
    balanceState,
    focus: buildFocus(elements, missing, low, favorable),
  }
}

export function buildBaziElementsPrompt(result: BaziElementsResult): string {
  const distribution = result.elements.map(item => `${item.key}${item.score}%`).join('、')
  const format = (items: WuxingKey[]) => items.join('、') || '无'
  const focus = result.focus
    .map(item => `${item.key}（${item.reason}）`)
    .join('、')

  return [
    `四柱：${result.pillars.map(p => `${p.gan}${p.zhi}`).join(' ')}`,
    `日主：${result.dayMaster}；旺衰：${result.strength}；格局：${result.geju}`,
    `五行分布：${distribution}`,
    `缺失：${format(result.missing)}；偏弱：${format(result.low)}；偏旺：${format(result.dominant)}`,
    `喜用：${result.favorable.join('、')}；忌神：${result.unfavorable.join('、')}`,
    `平衡状态：${result.balanceState}`,
    `调节优先级：${focus || '无'}`,
  ].join('\n')
}
