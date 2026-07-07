import type { TianGan, DiZhi } from './user'
import type { WuxingScore } from './bazi'
import type { ActivityDimensionKey, ActivityPortrait } from '~/data/child-activity-interest'

export interface ChildActivityInterestProfile {
  name?: string
  birthDate: string
  birthHour?: string
  gender: 'male' | 'female'
}

export interface ChildActivityInterestPillar {
  gan: TianGan
  zhi: DiZhi
  shishen: string
  canggan: Array<{ gan: TianGan; type: string; shishen: string }>
}

export interface ChildActivityInterestChart {
  profile: ChildActivityInterestProfile
  pillars: {
    year: ChildActivityInterestPillar
    month: ChildActivityInterestPillar
    day: ChildActivityInterestPillar
    hour: ChildActivityInterestPillar | null
  }
  riZhu: TianGan
  riZhuStrength: string
  wuxingScore: WuxingScore
  geju: string
  xiyong: string
  jishen: string
  shishenCounts: Record<string, number>
}

export interface ChildActivityInterestCalcResult {
  profile: ChildActivityInterestProfile
  chart: ChildActivityInterestChart
  dimensionScores: Record<ActivityDimensionKey, number>
  dominantDimension: ActivityDimensionKey
  secondaryDimension?: ActivityDimensionKey
  portrait: ActivityPortrait
  generatedAt: string
}

export interface ChildActivityInterestReadingInput {
  result: ChildActivityInterestCalcResult
  locale?: string
}
