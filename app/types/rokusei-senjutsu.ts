export type RokuseiStarId = 'earth' | 'venus' | 'mars' | 'uranus' | 'jupiter' | 'mercury'

export type RokuseiSign = 'plus' | 'minus'

export type RokuseiCycleRank = 'normal' | 'small' | 'middle' | 'big'

export interface RokuseiCyclePhase {
  index: number
  id: string
  rank: RokuseiCycleRank
}

export interface RokuseiBaziPillar {
  key: 'year' | 'month' | 'day' | 'hour'
  label: string
  ganzhi: string
  shishen: string
  voidBranches: string[]
}

export interface RokuseiAnnualPhase extends RokuseiCyclePhase {
  year: number
}

export interface RokuseiMonthlyPhase extends RokuseiCyclePhase {
  month: number
}

export interface RokuseiDailyPhase extends RokuseiCyclePhase {
  date: string
  isToday: boolean
}

export interface RokuseiFateCycle {
  index: number
  ganzhi: string
  fateStarId: string
  tenGod: string
  startYear: number
  endYear: number
  startAge: number
  endAge: number
  isFateKill: boolean
  isCurrent: boolean
}

export interface RokuseiSenjutsuResult {
  input: {
    birthDate: string
    birthHour: string
    gender: 'male' | 'female'
    locationName: string
  }
  bazi: {
    pillars: RokuseiBaziPillar[]
    dayMaster: string
    dayunDirection: string
    dayunStartDate: string
  }
  birth: {
    year: number
    yearBranch: string
    starNumber: number
    dayGanZhi: string
    starId: RokuseiStarId
    sign: RokuseiSign
    typeKey: string
    voidBranches: string[]
    isReigo: boolean
    oppositeStarId: RokuseiStarId
  }
  annual: {
    year: number
    phase: RokuseiCyclePhase
    oppositePhase: RokuseiCyclePhase
    timeline: RokuseiAnnualPhase[]
  }
  monthly: RokuseiMonthlyPhase[]
  daily: RokuseiDailyPhase[]
  fateCycles: RokuseiFateCycle[]
  activeFateCycle: RokuseiFateCycle | null
  methodology: {
    calendar: string
    starRule: string
    signRule: string
    cycleRule: string
    fateRule: string
    disclaimer: string
    sources: string[]
  }
  generatedAt: string
}

export interface RokuseiInterpretTarget {
  selector?: string
  label?: string
  section?: string
  group?: string
  content?: string
}
