import type { TianGan, DiZhi } from './user'
import type { WuxingScore } from './bazi'
import type { MarriagePortrait, MarriageFriction } from '~/data/marriage-xiangxing'

export interface MarriageXiangxingPillar {
  gan: TianGan
  zhi: DiZhi
  shishen: string
  canggan: Array<{ gan: TianGan; type: string; shishen: string }>
}

export interface MarriageXiangxingProfile {
  name?: string
  birthDate: string
  birthHour?: string
  gender: 'male' | 'female'
}

export interface MarriageXiangxingChart {
  profile: MarriageXiangxingProfile
  pillars: {
    year: MarriageXiangxingPillar
    month: MarriageXiangxingPillar
    day: MarriageXiangxingPillar
    hour: MarriageXiangxingPillar | null
  }
  riZhu: TianGan
  riZhuStrength: string
  wuxingScore: WuxingScore
  geju: string
  xiyong: string
  jishen: string
  shishenCounts: Record<string, number>
}

export interface MarriageRelation {
  aToBShiShen: string
  bToAShiShen: string
  dayMasterRelation: '比和' | '生' | '被生' | '克' | '被克'
  dayMasterRelationLabel: string
}

export interface MarriageXiangxingCalcResult {
  personA: MarriageXiangxingChart
  personB: MarriageXiangxingChart
  relation: MarriageRelation
  portraitA: MarriagePortrait
  portraitB: MarriagePortrait
  friction: MarriageFriction
  generatedAt: string
}

export interface MarriageXiangxingReadingInput {
  result: MarriageXiangxingCalcResult
  locale?: string
}
