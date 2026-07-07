export type Grade = 'L' | 'M' | 'H'

export type DimensionId =
  | 'S1' | 'S2' | 'S3'
  | 'E1' | 'E2' | 'E3'
  | 'A1' | 'A2' | 'A3'
  | 'Ac1' | 'Ac2' | 'Ac3'
  | 'So1' | 'So2' | 'So3'

export type ModelId = 'S' | 'E' | 'A' | 'Ac' | 'So'

export interface SbtiOption {
  id: string
  text: string
  score: number
  triggerHidden?: boolean
  drunkLock?: boolean
}

export interface SbtiQuestion {
  id: string
  text: string
  dimension: DimensionId
  options: SbtiOption[]
  isHidden?: boolean
}

export interface SbtiDimension {
  id: DimensionId
  model: ModelId
  name: string
}

export type Rarity = 'N' | 'R' | 'SR' | 'SSR'

export interface SbtiPersonality {
  code: string
  name: string
  alias: string
  quote: string
  description: string
  rarity: Rarity
  percent: number
  pattern: string
  traits: string
  gradient: [string, string]
  icon: string
}

export interface SbtiAnswer {
  questionId: string
  optionId: string
}

export type SbtiView = 'home' | 'quiz' | 'loading' | 'result' | 'encyclopedia'

export interface SbtiResult extends SbtiPersonality {
  similarity: number
  gradeCode: string
}
