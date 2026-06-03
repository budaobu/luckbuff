import type { WorldCupFixture } from './qimen-worldcup'

export interface LiurenWorldcupRequest {
  homeTeam: string
  awayTeam: string
  matchTime: string
  venue: string
  timezone: string
  birthYear: number
}

export interface LiurenChartData {
  match: {
    homeTeam: string
    awayTeam: string
    matchTime: string
    venue: string
  }
  calendar: {
    solar: string
    lunar: string
    ganzhi: {
      year: string
      month: string
      day: string
      hour: string
    }
    yuejiang: string
    shichen: string
    birthYearBranch: string
  }
}

export interface LiurenWorldcupInterpretRequest {
  match: LiurenWorldcupRequest
  chart: LiurenChartData
  locale?: string
}

export interface LiurenWorldcupInterpretChunk {
  type: 'chart' | 'text' | 'error' | 'done'
  chart?: LiurenChartData
  text?: string
  message?: string
}

export interface MatchProbability {
  homeWin: number
  draw: number
  awayWin: number
}

export interface LiurenPredictionResult {
  match: string
  matchTime: string
  chartSummary: string
  probabilities: MatchProbability
  conclusion: string
}
