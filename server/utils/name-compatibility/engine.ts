import { calcWuge, type WugeResult } from '../wuge/calc'
import { digitToWuxing, type Wuxing5 } from '../wuge/sancai'

export interface NameCompatibilityInput {
  nameA: string
  nameB: string
}

export type ElementFlow = 'same' | 'a-to-b' | 'b-to-a' | 'a-shapes-b' | 'b-shapes-a'
export type FortuneBand = 'good' | 'mixed' | 'caution'
export type RelationshipPattern = 'resonant' | 'nourishing' | 'dynamic' | 'balanced' | 'cautious'

export interface NameCompatibilitySide {
  name: string
  personalityElement: Wuxing5
  personalityFortune: string
  totalFortune: string
  totalBand: FortuneBand
  totalValue: number
}

export interface NameCompatibilityResult {
  nameA: NameCompatibilitySide
  nameB: NameCompatibilitySide
  elementFlow: ElementFlow
  pattern: RelationshipPattern
  interaction: 'shared-rhythm' | 'supportive' | 'stimulating' | 'complementary' | 'needs-boundaries'
  sharedSignals: string[]
  cautionSignals: string[]
}

const SHENG: Record<Wuxing5, Wuxing5> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const KE: Record<Wuxing5, Wuxing5> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

function validateName(value: unknown, label: 'A' | 'B'): string {
  const name = String(value ?? '').trim()
  if (!/^[一-龥]{2,4}$/.test(name)) {
    throw createError({ statusCode: 400, statusMessage: `Name ${label} must contain 2-4 Chinese characters` })
  }
  return name
}

function band(fortune: string): FortuneBand {
  if (fortune === '大吉' || fortune === '吉') return 'good'
  if (fortune === '半吉') return 'mixed'
  return 'caution'
}

function toSide(result: WugeResult): NameCompatibilitySide {
  const personalityElement = digitToWuxing(result.grids.renge.value)
  return {
    name: result.input,
    personalityElement,
    personalityFortune: result.grids.renge.fortune.fortune,
    totalFortune: result.grids.zongge.fortune.fortune,
    totalBand: band(result.grids.zongge.fortune.fortune),
    totalValue: result.grids.zongge.value,
  }
}

function elementFlow(a: Wuxing5, b: Wuxing5): ElementFlow {
  if (a === b) return 'same'
  if (SHENG[a] === b) return 'a-to-b'
  if (SHENG[b] === a) return 'b-to-a'
  if (KE[a] === b) return 'a-shapes-b'
  return 'b-shapes-a'
}

function buildPattern(
  flow: ElementFlow,
  a: NameCompatibilitySide,
  b: NameCompatibilitySide,
): { pattern: RelationshipPattern; interaction: NameCompatibilityResult['interaction'] } {
  const bothGood = a.totalBand === 'good' && b.totalBand === 'good'
  const eitherCaution = a.totalBand === 'caution' || b.totalBand === 'caution'

  if (flow === 'same' && bothGood) return { pattern: 'resonant', interaction: 'shared-rhythm' }
  if (flow === 'a-to-b' || flow === 'b-to-a') return { pattern: 'nourishing', interaction: 'supportive' }
  if (flow === 'a-shapes-b' || flow === 'b-shapes-a') return { pattern: 'dynamic', interaction: 'stimulating' }
  if (eitherCaution) return { pattern: 'cautious', interaction: 'needs-boundaries' }
  return { pattern: 'balanced', interaction: 'complementary' }
}

function buildSignals(flow: ElementFlow, a: NameCompatibilitySide, b: NameCompatibilitySide): {
  shared: string[]
  caution: string[]
} {
  const shared: string[] = []
  const caution: string[] = []

  if (flow === 'same') shared.push('personality-element-same')
  if (flow === 'a-to-b' || flow === 'b-to-a') shared.push('personality-element-generates')
  if (flow === 'a-shapes-b' || flow === 'b-shapes-a') shared.push('personality-element-shapes')
  if (a.totalBand === 'good') shared.push('total-grid-a-good')
  if (b.totalBand === 'good') shared.push('total-grid-b-good')
  if (a.totalBand === 'mixed' || b.totalBand === 'mixed') caution.push('total-grid-mixed')
  if (a.totalBand === 'caution') caution.push('total-grid-a-caution')
  if (b.totalBand === 'caution') caution.push('total-grid-b-caution')

  return { shared, caution }
}

export async function analyzeNameCompatibility(input: NameCompatibilityInput): Promise<NameCompatibilityResult> {
  const nameA = validateName(input.nameA, 'A')
  const nameB = validateName(input.nameB, 'B')
  if (nameA === nameB) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter two different names' })
  }

  const [wugeA, wugeB] = await Promise.all([calcWuge(nameA), calcWuge(nameB)])
  if (!wugeA.result) throw createError({ statusCode: 400, statusMessage: wugeA.error || 'Invalid name A' })
  if (!wugeB.result) throw createError({ statusCode: 400, statusMessage: wugeB.error || 'Invalid name B' })

  const sideA = toSide(wugeA.result)
  const sideB = toSide(wugeB.result)
  const flow = elementFlow(sideA.personalityElement, sideB.personalityElement)
  const { pattern, interaction } = buildPattern(flow, sideA, sideB)
  const { shared, caution } = buildSignals(flow, sideA, sideB)

  return {
    nameA: sideA,
    nameB: sideB,
    elementFlow: flow,
    pattern,
    interaction,
    sharedSignals: shared,
    cautionSignals: caution,
  }
}

export function buildNameCompatibilityPrompt(result: NameCompatibilityResult): string {
  const flowText: Record<ElementFlow, string> = {
    same: '双方人格五行相同',
    'a-to-b': `${result.nameA.personalityElement}生${result.nameB.personalityElement}`,
    'b-to-a': `${result.nameB.personalityElement}生${result.nameA.personalityElement}`,
    'a-shapes-b': `${result.nameA.personalityElement}克${result.nameB.personalityElement}`,
    'b-shapes-a': `${result.nameB.personalityElement}克${result.nameA.personalityElement}`,
  }

  return [
    `姓名A：${result.nameA.name}；人格五行：${result.nameA.personalityElement}；人格数理：${result.nameA.personalityFortune}；总格：${result.nameA.totalValue}（${result.nameA.totalFortune}）`,
    `姓名B：${result.nameB.name}；人格五行：${result.nameB.personalityElement}；人格数理：${result.nameB.personalityFortune}；总格：${result.nameB.totalValue}（${result.nameB.totalFortune}）`,
    `五行关系：${flowText[result.elementFlow]}`,
    `关系模式：${result.pattern}`,
    `共同信号：${result.sharedSignals.join('、') || '无'}`,
    `注意信号：${result.cautionSignals.join('、') || '无'}`,
  ].join('\n')
}
