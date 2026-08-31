import type { TianGan, DiZhi } from './user'

export interface Pillar {
  gan: TianGan
  zhi: DiZhi
  shishen?: string
  canggan: { gan: TianGan; type: '本气' | '中气' | '余气' }[]
}

export interface DaYun {
  index: number
  ageRange: [number, number]
  gan: TianGan
  zhi: DiZhi
  fortune?: '大吉' | '吉' | '平' | '凶' | '大凶'
  score?: number
}

export interface WuxingScore {
  木: number
  火: number
  土: number
  金: number
  水: number
}

export interface BaziChart {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar | null
  riZhu: TianGan
  riZhuStrength: '身旺' | '身弱' | '从强' | '从弱'
  wuxingScore: WuxingScore
  geju: string
  xiyong: string
  jishen: string
  dayuns: DaYun[]
  qiyunAge: number
  currentAge: number
  currentDaYun: DaYun | null
}
