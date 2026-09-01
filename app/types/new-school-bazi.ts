import type { DiZhi, TianGan } from './user'

export interface NewSchoolPillar {
  gan: TianGan
  zhi: DiZhi
  shishen?: string
  zhiBenQiGan: TianGan
  zhiBenQiShiShen?: string
}

export interface NewSchoolInteraction {
  from: string
  to: string
  relation: '同我' | '生我' | '我生' | '克我' | '我克'
  weight: number
  effect: 'support' | 'weaken' | 'neutral'
}

export interface NewSchoolMissingWord {
  gan: TianGan
  wuxing: '木' | '火' | '土' | '金' | '水'
  shishen: string
  treatment: 'xushi-note-only'
}

export interface NewSchoolBaziChart {
  year: NewSchoolPillar
  month: NewSchoolPillar
  day: NewSchoolPillar
  hour: NewSchoolPillar | null
  riZhu: TianGan
  riZhuStrength: '身旺' | '身弱' | '从旺' | '从弱'
  geju: '身旺格' | '身弱格' | '从旺格' | '从弱格'
  supportScore: number
  wuxingScore: {
    木: number
    火: number
    土: number
    金: number
    水: number
  }
  interactions: NewSchoolInteraction[]
  xiyong: string
  jishen: string
  missingWords: NewSchoolMissingWord[]
  xushiRule: string
  dayuns: Array<{
    index: number
    ageRange: [number, number]
    gan: TianGan
    zhi: DiZhi
  }>
  qiyunAge: number
  currentAge: number
  currentDaYun: {
    index: number
    ageRange: [number, number]
    gan: TianGan
    zhi: DiZhi
  } | null
}
