import type { DiZhi } from '~/types/user'

export type KyuseiDirectionKey =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'northeast'
  | 'southeast'
  | 'southwest'
  | 'northwest'
  | 'center'

export type KyuseiSignalKey =
  | 'fiveYellow'
  | 'darkSword'
  | 'yearBreaker'
  | 'monthBreaker'
  | 'honmeiKill'
  | 'honmeiTargetKill'

export type KyuseiBoardKey = 'year' | 'month' | 'day' | 'hour'

export type KyuseiRelationKey =
  | 'sameElement'
  | 'nourishes'
  | 'drains'
  | 'controls'
  | 'controlledBy'

export interface KyuseiPaipanLocation {
  name: string
  latitude: number
  longitude: number
  timezone: string
}

export interface KyuseiPaipanInput {
  birthDate: string
  birthHour: DiZhi
  gender: 'male' | 'female'
  location?: KyuseiPaipanLocation | null
}

export interface KyuseiStarMeta {
  star: number
  element: 'water' | 'earth' | 'wood' | 'metal' | 'fire'
  direction: KyuseiDirectionKey
}

export interface KyuseiPaipanBasic {
  birthDate: string
  birthHour: DiZhi
  gender: 'male' | 'female'
  solarYear: number
  solarMonthIndex: number
  boundaryInstant: string
  timezone: string
  locationName: string
}

export interface KyuseiSignal {
  key: KyuseiSignalKey
  board: KyuseiBoardKey
  palace: number
  direction: KyuseiDirectionKey | 'center'
}

export interface KyuseiBoardStar {
  palace: number
  direction: KyuseiDirectionKey
  star: number
}

export interface KyuseiBoard {
  key: KyuseiBoardKey
  centerStar: number
  stars: KyuseiBoardStar[]
  signals: KyuseiSignal[]
}

export interface KyuseiAffinity {
  star: number
  relation: KyuseiRelationKey
  score: number
}

export interface KyuseiPaipanResult {
  basic: KyuseiPaipanBasic
  natal: {
    yearStar: KyuseiStarMeta
    monthStar: KyuseiStarMeta
    dayStar: KyuseiStarMeta
    hourStar: KyuseiStarMeta
    inclinedPalace: {
      palace: number
      direction: KyuseiDirectionKey
      centerAdjusted: boolean
    }
  }
  boards: KyuseiBoard[]
  compatibility: {
    primary: KyuseiRelationKey
    score: number
    affinities: KyuseiAffinity[]
  }
  methodology: {
    engine: string
    yearBoundary: string
    monthBoundary: string
    hourRule: string
    disclaimer: string
  }
  generatedAt: string
}
