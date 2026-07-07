export type DimensionId = 'A' | 'B' | 'C' | 'D'

export interface Dimension {
  id: DimensionId
  left: string
  right: string
  leftColor: string
  rightColor: string
}

export interface ScoreEffect {
  dimension: DimensionId
  side: 1 | -1
  weight: number
}

export interface Option {
  id: string
  text: string
  effects: ScoreEffect[]
  triggerHidden?: boolean
}

export interface Question {
  id: string
  text: string
  options: Option[]
  isHidden?: boolean
}

export interface Personality {
  code: string
  name: string
  alias: string
  description: string
  pros: string
  cons: string
  bestMatch: string
  worstMatch: string
  quote: string
  percentage: number
  scores: Record<DimensionId, number>
  mascot: {
    gradient: [string, string]
    symbol: string
  }
}

export type Answer = { questionId: string; optionId: string }

export type FbtiView = 'home' | 'quiz' | 'loading' | 'result' | 'encyclopedia'
