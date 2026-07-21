import type { BaziChart } from './bazi'
import type { DiZhi } from './user'

export interface ZhengyuanTimingYear {
  year: number
  ganZhi: string
  age: number
  score: number
  reasons: string[]
}

export interface ZhengyuanMarriageProfile {
  spousePalace: {
    zhi: DiZhi
    wuxing: string
    shiShen: string
    peachBlossom: boolean
    chongBy: string[]
    heWith: string[]
  }
  spouseStar: {
    kind: '正财' | '偏财' | '正官' | '七杀'
    wuxing: string
    found: boolean
    locations: string[]
    strength: 'strong' | 'weak' | 'hidden' | 'absent'
    isFavorable: boolean
    position: 'year' | 'month' | 'day' | 'hour' | 'hidden' | 'absent'
  }
  marriageTiming: {
    tendency: 'early' | 'late' | 'neutral'
    signals: string[]
  }
  stability: {
    riskSignals: string[]
    goodSignals: string[]
  }
  peachBlossom: {
    star: DiZhi
    positions: string[]
    innerWall: boolean
    outerWall: boolean
  }
  hongLuan: { star: DiZhi, palace: string | null }
  tianXi: { star: DiZhi, palace: string | null }
  spouseDetails: {
    appearance: string
    ageGap: 'older' | 'similar' | 'younger'
    supportiveness: 'supportive' | 'neutral' | 'draining'
    direction: string
    meetChannel: 'far' | 'near' | 'unknown'
  }
  relationshipDynamics: {
    pattern: 'partnerLeads' | 'selfLeads' | 'balanced' | 'clashing'
    note: string
  }
  timingYears: ZhengyuanTimingYear[]
}

export interface BaziZhengyuanCalcResult {
  profile: {
    name?: string
    birthDate: string
    birthHour?: string
    gender: 'male' | 'female'
  }
  chart: BaziChart
  riZhu: string
  riZhuStrength: string
  geju: string
  xiyong: string
  jishen: string
  marriage: ZhengyuanMarriageProfile
}
