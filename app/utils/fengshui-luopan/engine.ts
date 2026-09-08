import {
  DIRECTIONAL_HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  TRIGRAMS,
  TWENTY_FOUR_MOUNTAINS,
} from './constants'
import { normalizeDegrees } from './heading'
import type { LuopanDirection } from '~/types/fengshui-luopan'

function nearestCircleItem<T extends { degree?: number }>(items: readonly T[], degree: number) {
  return items.reduce((best, item) => {
    if (typeof item.degree !== 'number') return best
    const distance = Math.abs(normalizeDegrees(degree - item.degree + 180) - 180)
    const bestDistance = Math.abs(normalizeDegrees(degree - (best.degree ?? 0) + 180) - 180)
    return distance < bestDistance ? item : best
  }, items[0]!)
}

export function resolveLuopanDirection(rawDegree: number): LuopanDirection {
  const degree = normalizeDegrees(rawDegree)
  const mountainIndex = Math.floor(((degree + 7.5) % 360) / 15) % TWENTY_FOUR_MOUNTAINS.length
  const mountain = TWENTY_FOUR_MOUNTAINS[mountainIndex]!
  const trigram = nearestCircleItem(TRIGRAMS, degree)
  const branchIndex = Math.floor(((degree + 15) % 360) / 30) % EARTHLY_BRANCHES.length
  const branch = EARTHLY_BRANCHES[branchIndex]!
  const stem = nearestCircleItem(DIRECTIONAL_HEAVENLY_STEMS, degree)

  const element = mountain.kind === 'branch'
    ? EARTHLY_BRANCHES.find(item => item.label === mountain.label)?.element
    : mountain.kind === 'stem'
      ? HEAVENLY_STEMS.find(item => item.label === mountain.label)?.element
      : trigram.element

  return {
    degree,
    mountain: mountain.label,
    trigram: trigram.label,
    heavenlyStem: stem.label,
    earthlyBranch: branch.label,
    element: element ?? trigram.element,
  }
}
