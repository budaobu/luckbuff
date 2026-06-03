import type { QimenChartResponse } from './qimen'

export interface WorldCupFixture {
  uid: string
  slug: string
  homeTeam: string
  awayTeam: string
  summary: string
  startTime: string
  endTime: string | null
  venue: string
  isPlaceholder: boolean
}

export interface WorldCupFixturesData {
  updatedAt: string
  source: string
  total: number
  events: WorldCupFixture[]
}

export interface QimenWorldcupRequest {
  homeTeam: string
  awayTeam: string
  matchTime: string
  venue: string
  timezone: string
}

export interface QimenWorldcupResponse {
  match: {
    homeTeam: string
    awayTeam: string
    matchTime: string
    venue: string
  }
  chart: QimenChartResponse
}

export interface QimenWorldcupInterpretRequest {
  match: QimenWorldcupRequest
  chartJson: QimenChartResponse
  locale?: string
}

export interface QimenWorldcupInterpretChunk {
  type: 'chart' | 'text' | 'error' | 'done'
  chart?: QimenChartResponse
  text?: string
  message?: string
}

export interface MatchProbability {
  homeWin: number
  draw: number
  awayWin: number
}

export interface PredictionResult {
  match: string
  matchTime: string
  chartSummary: string
  probabilities: MatchProbability
  conclusion: string
}
