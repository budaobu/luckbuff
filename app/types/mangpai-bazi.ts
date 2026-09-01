import type { BaziChart, DaYun, Pillar } from './bazi'
import type { DiZhi, TianGan } from './user'

export const MANGPAI_GODS = [
  '太岁',
  '青龙',
  '丧门',
  '六合',
  '官符',
  '小耗',
  '大耗',
  '朱雀',
  '白虎',
  '贵神',
  '吊客',
  '病符',
] as const

export type MangpaiGodName = typeof MANGPAI_GODS[number]

export interface MangpaiGod {
  branch: DiZhi
  name: MangpaiGodName
}

export interface MangpaiShensha {
  flowYearBranch: DiZhi
  rule: string
  ring: MangpaiGod[]
  natal: Array<Pillar & { god: MangpaiGodName }>
}

export interface MangpaiLiunian {
  year: number
  gan: TianGan
  zhi: DiZhi
  shishen: string
  relations: string[]
  god: MangpaiGodName
}

export interface MangpaiCalcResult {
  chart: BaziChart
  dayMaster: { gan: TianGan; wuxing: string }
  currentYear: number
  flowYear: {
    year: number
    gan: TianGan
    zhi: DiZhi
  }
  liunian: MangpaiLiunian[]
  shensha: MangpaiShensha
}

export interface MangpaiSection {
  id: 'family' | 'career' | 'wealth' | 'marriage' | 'health' | 'timing'
  text: string
  basis: string
  periods: number[]
}

export interface MangpaiPosterData {
  overview: string
  sections: Partial<Record<MangpaiSection['id'], MangpaiSection>>
}
