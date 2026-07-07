import type { TianGan, DiZhi } from './user'
import type { WuxingScore } from './bazi'

export interface BaziPersonalityPillar {
  gan: TianGan
  zhi: DiZhi
  shishen: string
  canggan: Array<{ gan: TianGan; type: string; shishen: string }>
}

export interface BaziPersonalityArchetype {
  key: string
  name: string
  tags: string[]
  summary: string
}

export interface BaziPersonalityMapCalcResult {
  profile: {
    name?: string
    birthDate: string
    birthHour?: string
    gender: 'male' | 'female'
  }
  pillars: {
    year: BaziPersonalityPillar
    month: BaziPersonalityPillar
    day: BaziPersonalityPillar
    hour: BaziPersonalityPillar | null
  }
  riZhu: TianGan
  riZhuStrength: string
  wuxingScore: WuxingScore
  geju: string
  xiyong: string
  jishen: string
  shishenCounts: Record<string, number>
  dimensions: Record<string, number>
  dimensionOrder: string[]
  archetype: BaziPersonalityArchetype
}
