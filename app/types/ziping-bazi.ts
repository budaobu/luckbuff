import type { TianGan, DiZhi } from './user'

export interface ZipingPillar {
  gan: TianGan
  zhi: DiZhi
  shishen?: string
  canggan: { gan: TianGan; type: '本气' | '中气' | '余气' }[]
}

export interface ZipingDaYun {
  index: number
  ageRange: [number, number]
  gan: string
  zhi: string
}

export interface ZipingBaziChart {
  year: ZipingPillar
  month: ZipingPillar
  day: ZipingPillar
  hour: ZipingPillar | null
  riZhu: TianGan
  riZhuStrength: '身旺' | '身弱' | '从强' | '从弱'
  wuxingScore: {
    木: number
    火: number
    土: number
    金: number
    水: number
  }
  geju: string
  xiyong: string
  jishen: string
  dayuns: ZipingDaYun[]
  qiyunAge: number
  currentAge: number
  currentDaYun: ZipingDaYun | null
}
