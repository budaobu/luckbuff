import type { DiZhi } from '~/types/user'

export interface SukuyoPaipanLocation {
  name: string
  latitude: number
  longitude: number
  timezone: string
}

export interface SukuyoPaipanInput {
  birthDate: string
  birthHour: DiZhi
  gender: 'male' | 'female'
  location?: SukuyoPaipanLocation | null
}

export type SukuyoGroupId = 'east' | 'north' | 'west' | 'south'
export type SukuyoCategory = 'stable' | 'harmonious' | 'transformative' | 'rapid' | 'intense' | 'diligent' | 'dual'

export interface SukuyoMansion {
  id: string
  name: string
  nameEn: string
  sequence: number
  group: SukuyoGroupId
  category: SukuyoCategory
  ruler: string
  keywordsZh: string[]
  keywordsEn: string[]
}

export interface SukuyoJudgment {
  method: 'astronomical' | 'civil-lunar'
  mansion: SukuyoMansion
  lunarText?: string
  siderealLongitude?: number
  mansionDegree?: number
  nakshatra?: string
  nakshatraStartLongitude?: number
  pada?: number
  moonSpeedPerDay?: number
  hoursToNextBoundary?: number
  boundaryNear?: boolean
}

export interface SukuyoRelation {
  from: string
  to: string
  role: '命' | '业' | '胎' | '荣' | '衰' | '安' | '危' | '成' | '坏' | '友' | '亲'
  group: '命' | '业胎' | '荣亲' | '友衰' | '安坏' | '危成'
  distance: '近' | '中' | '远' | null
}

export interface SukuyoPaipanResult {
  birth: {
    date: string
    hour: DiZhi
    clockText: string
    trueSolarText: string
    correctionStatus: 'corrected' | 'uncorrected'
    dayBoundaryChanged: boolean
    hourBoundaryChanged: boolean
    locationName: string
    coordinates: string
    timezone: string
    genderText: string
  }
  precise: SukuyoJudgment
  traditional: SukuyoJudgment
  agree: boolean
  traditionalRelation: SukuyoRelation | null
  neighbors: {
    previous: SukuyoMansion
    next: SukuyoMansion
    previousRelation: SukuyoRelation
    nextRelation: SukuyoRelation
  }
  methodology: {
    engine: string
    astronomy: string
    preciseRule: string
    traditionalRule: string
    timeRule: string
    disclaimer: string
  }
  generatedAt: string
}
