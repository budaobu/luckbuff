import type { TianGan, DiZhi } from './user'
import type { WuxingScore } from './bazi'
import type { ParentingStyleProfile, ParentingStyleDimension } from '~/data/parenting-style'

export interface ParentingStylePillar {
  gan: TianGan
  zhi: DiZhi
  shishen: string
  canggan: Array<{ gan: TianGan; type: string; shishen: string }>
}

export interface ParentingStyleCalcResult {
  profile: {
    name?: string
    birthDate: string
    birthHour?: string
    gender: 'male' | 'female'
  }
  pillars: {
    year: ParentingStylePillar
    month: ParentingStylePillar
    day: ParentingStylePillar
    hour: ParentingStylePillar | null
  }
  riZhu: TianGan
  riZhuStrength: string
  wuxingScore: WuxingScore
  geju: string
  xiyong: string
  jishen: string
  shishenCounts: Record<string, number>
  dimensionDistribution: Record<ParentingStyleDimension, number>
  style: ParentingStyleProfile
  generatedAt: string
}

export interface ParentingStyleReadingInput {
  result: ParentingStyleCalcResult
  locale?: string
}
