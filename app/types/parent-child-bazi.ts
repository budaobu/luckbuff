import type { TianGan, DiZhi } from './user'
import type { WuxingScore } from './bazi'
import type { ChildTraitProfile, ParentRoleProfile, FrictionRule } from '~/data/parent-child-bazi'

export interface ParentChildBaziPillar {
  gan: TianGan
  zhi: DiZhi
  shishen: string
  canggan: Array<{ gan: TianGan; type: string; shishen: string }>
}

export interface ParentChildProfile {
  name?: string
  birthDate: string
  birthHour?: string
  gender: 'male' | 'female'
}

export interface ParentChildChart {
  profile: ParentChildProfile
  pillars: {
    year: ParentChildBaziPillar
    month: ParentChildBaziPillar
    day: ParentChildBaziPillar
    hour: ParentChildBaziPillar | null
  }
  riZhu: TianGan
  riZhuStrength: string
  wuxingScore: WuxingScore
  geju: string
  xiyong: string
  jishen: string
  shishenCounts: Record<string, number>
}

export interface ParentChildRelation {
  parentToChildShiShen: string
  childToParentShiShen: string
  dayMasterRelation: '比和' | '生' | '被生' | '克' | '被克'
  dayMasterRelationLabel: string
}

export interface ParentChildChildTraits {
  dominantShiShen: string
  labels: string[]
  scenario: string
  communicationTip: string
}

export interface ParentChildFriction {
  key: string
  title: string
  conflict: string
  actions: string[]
}

export interface ParentChildBaziCalcResult {
  parent: ParentChildChart
  child: ParentChildChart
  relation: ParentChildRelation
  childTraits: ParentChildChildTraits
  parentRole: ParentRoleProfile
  friction: ParentChildFriction | null
  generatedAt: string
}

export interface ParentChildBaziReadingInput {
  result: ParentChildBaziCalcResult
  locale?: string
}
