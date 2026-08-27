/**
 * Digital energy core shared by phone, plate, door and bank-card-tail tools.
 *
 * Sources are documented in docs/numeric-energy-algorithm.md. This module only
 * encodes a programmatic folk framework and must never be duplicated per page.
 */

export const NUMERIC_ENERGY_SCENARIOS = ['phone', 'plate', 'door', 'card'] as const
export type NumericEnergyScenario = typeof NUMERIC_ENERGY_SCENARIOS[number]

export type NumericEnergyElement = 'water' | 'wood' | 'fire' | 'earth' | 'metal'
export type NumericEnergyRelation = 'stable' | 'generative' | 'controlling'

export interface NumericEnergyStar {
  digit: number
  count: number
}

export interface NumericEnergyPair {
  left: number
  right: number
  relation: NumericEnergyRelation
  key: `${NumericEnergyRelation}-${number}-${number}`
}

export interface NumericEnergyResult {
  scenario: NumericEnergyScenario
  display: string
  digits: number[]
  digitCount: number
  zeroCount: number
  dominantElement: NumericEnergyElement
  score: number
  scoreBand: 'balanced' | 'flowing' | 'focused'
  stars: NumericEnergyStar[]
  pairs: NumericEnergyPair[]
}

const DIGIT_ELEMENTS: Record<number, NumericEnergyElement> = {
  1: 'water',
  2: 'earth',
  3: 'wood',
  4: 'wood',
  5: 'earth',
  6: 'metal',
  7: 'metal',
  8: 'earth',
  9: 'fire',
  0: 'earth',
}

/** Deterministic display weights, intentionally bounded and non-prognostic. */
const DIGIT_WEIGHTS: Record<number, number> = {
  1: 82,
  2: 68,
  3: 72,
  4: 80,
  5: 65,
  6: 84,
  7: 70,
  8: 88,
  9: 78,
  0: 60,
}

const GENERATION: Record<NumericEnergyElement, NumericEnergyElement> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
}

const CONTROL: Record<NumericEnergyElement, NumericEnergyElement> = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood',
}

function elementForDigit(digit: number): NumericEnergyElement {
  return DIGIT_ELEMENTS[digit] ?? 'earth'
}

function judgePair(left: number, right: number): { relation: NumericEnergyRelation } {
  // He Tu companions are stable even when their five-element labels differ.
  const groupSizes = new Set([left, right])
  const heTuCompanions = [
    [1, 6],
    [2, 7],
    [3, 8],
    [4, 9],
    [5, 0],
  ]
  if (groupSizes.size === 2 && heTuCompanions.some(([a, b]) => (left === a && right === b) || (left === b && right === a))) {
    return { relation: 'stable' }
  }

  const leftElement = elementForDigit(left)
  const rightElement = elementForDigit(right)
  if (leftElement === rightElement) return { relation: 'stable' }
  if (GENERATION[leftElement] === rightElement || GENERATION[rightElement] === leftElement) {
    return { relation: 'generative' }
  }
  return { relation: 'controlling' }
}

function rejectInput(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function extractDigits(input: unknown): string[] {
  if (typeof input !== 'string') rejectInput('Invalid numeric energy input')
  const normalized = input.normalize('NFKC').replace(/[\s._\-—–/\\,+()（）]/g, '')
  const segments = normalized.match(/\d+/g)
  if (!segments?.length) rejectInput('No readable digits')
  return segments
}

export function parseNumericEnergyInput(scenario: NumericEnergyScenario, rawInput: unknown): string {
  const value = scenario === 'card'
    ? (typeof rawInput === 'string' ? rawInput.trim() : '')
    : extractDigits(rawInput).join('')

  if (
    (scenario === 'phone' && !/^\d{7,15}$/.test(value))
    || (scenario === 'plate' && !/^\d{2,12}$/.test(value))
    || (scenario === 'door' && !/^\d{1,20}$/.test(value))
    || (scenario === 'card' && !/^\d{4,8}$/.test(value))
  ) {
    rejectInput(`Invalid ${scenario} number`)
  }

  return value
}

export function analyzeNumericEnergy(scenario: NumericEnergyScenario, rawInput: unknown): NumericEnergyResult {
  const display = parseNumericEnergyInput(scenario, rawInput)
  const digits = Array.from(display, Number)
  const elementCounts: Record<NumericEnergyElement, number> = {
    water: 0,
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
  }

  for (const digit of digits) {
    elementCounts[elementForDigit(digit)] += 1
  }

  const dominantElement = Object.entries(elementCounts)
    .sort((left, right) => right[1] - left[1])
    .at(0)?.[0] as NumericEnergyElement

  const stars = Array.from({ length: 9 }, (_, offset) => offset + 1)
    .map(digit => ({ digit, count: digits.filter(value => value === digit).length }))
    .filter(star => star.count > 0)

  const pairs: NumericEnergyPair[] = []
  let weightedTotal = 0

  for (let index = 0; index < digits.length; index += 1) {
    const digit = digits[index]
    if (digit === undefined) continue
    const digitWeight = DIGIT_WEIGHTS[digit]
    if (digitWeight === undefined) continue
    weightedTotal += digitWeight
    const next = digits[index + 1]
    if (next === undefined) continue
    const judgment = judgePair(digit, next)
    pairs.push({
      left: digit,
      right: next,
      relation: judgment.relation,
      key: `${judgment.relation}-${digit}-${next}`,
    })
    weightedTotal += judgment.relation === 'stable' ? 1 : judgment.relation === 'generative' ? 3 : -2
  }

  const averageScore = weightedTotal / digits.length
  const nonControllingRatio = pairs.length
    ? pairs.filter(pair => pair.relation !== 'controlling').length / pairs.length
    : 1
  const score = Math.min(96, Math.max(42, Math.round(averageScore * 0.88 + nonControllingRatio * 12)))

  return {
    scenario,
    display,
    digits,
    digitCount: digits.length,
    zeroCount: digits.filter(digit => digit === 0).length,
    dominantElement,
    score,
    scoreBand: score >= 80 ? 'flowing' : score >= 62 ? 'balanced' : 'focused',
    stars,
    pairs,
  }
}

export function buildNumericEnergyPromptData(result: NumericEnergyResult): string {
  const starText = result.stars.map(({ digit, count }) => `${digit} ${NUMERIC_ENERGY_STAR_LABELS[digit]}（${DIGIT_ELEMENTS[digit]}）×${count}`).join(', ')
  const pairText = result.pairs.slice(0, 24)
    .map(pair => `${pair.left}${pair.right}:${pair.relation}`)
    .join(', ')

  return [
    `场景类型：${result.scenario}`,
    `分析数字串：${result.display}`,
    `数字个数：${result.digitCount}`,
    `主要五行代码：${result.dominantElement}`,
    `展示分数：${result.score}（${result.scoreBand}）`,
    `星曜出现统计：${starText || '无'}`,
    `相邻组合判定：${pairText || '单一数字，无相邻组合'}`,
  ].join('\n')
}

const NUMERIC_ENERGY_STAR_LABELS: Record<number, string> = {
  1: '一白贪狼',
  2: '二黑巨门',
  3: '三碧禄存',
  4: '四绿文曲',
  5: '五黄廉贞',
  6: '六白武曲',
  7: '七赤破军',
  8: '八白左辅',
  9: '九紫右弼',
}
