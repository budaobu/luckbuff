import type { LuopanProfileId, LuopanRingId } from '~/types/fengshui-luopan'

export interface LuopanMountain {
  label: string
  kind: 'stem' | 'branch' | 'trigram'
}

export const TRIGRAMS = [
  { label: '坎', element: '水', degree: 0 },
  { label: '艮', element: '土', degree: 45 },
  { label: '震', element: '木', degree: 90 },
  { label: '巽', element: '木', degree: 135 },
  { label: '离', element: '火', degree: 180 },
  { label: '坤', element: '土', degree: 225 },
  { label: '兑', element: '金', degree: 270 },
  { label: '乾', element: '金', degree: 315 },
] as const

export const EARTHLY_BRANCHES = [
  { label: '子', element: '水' },
  { label: '丑', element: '土' },
  { label: '寅', element: '木' },
  { label: '卯', element: '木' },
  { label: '辰', element: '土' },
  { label: '巳', element: '火' },
  { label: '午', element: '火' },
  { label: '未', element: '土' },
  { label: '申', element: '金' },
  { label: '酉', element: '金' },
  { label: '戌', element: '土' },
  { label: '亥', element: '水' },
] as const

export const HEAVENLY_STEMS = [
  { label: '甲', element: '木' },
  { label: '乙', element: '木' },
  { label: '丙', element: '火' },
  { label: '丁', element: '火' },
  { label: '庚', element: '金' },
  { label: '辛', element: '金' },
  { label: '壬', element: '水' },
  { label: '癸', element: '水' },
] as const

// Later Heaven Bagua order: 子 begins true north and each mountain spans 15 degrees.
export const TWENTY_FOUR_MOUNTAINS: LuopanMountain[] = [
  { label: '壬', kind: 'stem' },
  { label: '子', kind: 'branch' },
  { label: '癸', kind: 'stem' },
  { label: '丑', kind: 'branch' },
  { label: '艮', kind: 'trigram' },
  { label: '寅', kind: 'branch' },
  { label: '甲', kind: 'stem' },
  { label: '卯', kind: 'branch' },
  { label: '乙', kind: 'stem' },
  { label: '辰', kind: 'branch' },
  { label: '巽', kind: 'trigram' },
  { label: '巳', kind: 'branch' },
  { label: '丙', kind: 'stem' },
  { label: '午', kind: 'branch' },
  { label: '丁', kind: 'stem' },
  { label: '未', kind: 'branch' },
  { label: '坤', kind: 'trigram' },
  { label: '申', kind: 'branch' },
  { label: '庚', kind: 'stem' },
  { label: '酉', kind: 'branch' },
  { label: '辛', kind: 'stem' },
  { label: '戌', kind: 'branch' },
  { label: '乾', kind: 'trigram' },
  { label: '亥', kind: 'branch' },
]

export const DIRECTIONAL_HEAVENLY_STEMS = TWENTY_FOUR_MOUNTAINS
  .map((mountain, index) => ({ ...mountain, degree: index * 15 }))
  .filter((mountain): mountain is LuopanMountain & { degree: number } => mountain.kind === 'stem')

export const LUOPAN_PROFILES: Record<LuopanProfileId, LuopanRingId[]> = {
  complete: ['trigrams', 'mountains', 'stems', 'branches', 'elements'],
  reading: ['mountains', 'stems', 'branches', 'elements'],
  compact: ['trigrams', 'mountains'],
}
