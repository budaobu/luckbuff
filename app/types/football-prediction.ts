export type FootballPredictionMethod = 'liuyao' | 'qimen' | 'liuren'

export interface FootballPredictionRequest {
  homeTeam: string
  awayTeam: string
  competition?: string
  venue?: string
  kickoff: string
  castAt?: string
  timezone?: string
  birthYear?: number
}

export interface FootballProbability {
  home: number
  draw: number
  away: number
}

export interface FootballScorePrediction {
  home: number
  away: number
}

export interface FootballSignal {
  key: 'shi' | 'ying' | 'moving' | 'homePalace' | 'awayPalace' | 'keyPalace' | 'homeState' | 'awayState' | 'birthRelation'
  value: string
}

export interface FootballPredictionResult {
  method: FootballPredictionMethod
  match: {
    homeTeam: string
    awayTeam: string
    competition: string
    venue: string
    kickoff: string
    timezone: string
  }
  prediction: {
    outcome: 'home' | 'draw' | 'away'
    probabilities: FootballProbability
    primaryScore: FootballScorePrediction
    alternateScores: FootballScorePrediction[]
    confidence: 'balanced' | 'leaning' | 'clear'
  }
  signals: FootballSignal[]
  liuyao?: {
    primary: string
    transformed: string
    nuclear: string
    monthBuild: string
    dayGanzhi: string
    timeGanzhi: string
    void: string
    lines: Array<{ value: number; moving: boolean }>
  }
  qimen?: {
    title: string
    yuan: string
    dayGanzhi: string
    timeGanzhi: string
    zhifu: string
    zhishi: string
    void: string
  }
  liuren?: {
    yearGanzhi: string
    monthGanzhi: string
    dayGanzhi: string
    hourGanzhi: string
    yuejiang: string
    shichen: string
    birthYear: number
    birthYearBranch: string
  }
  generatedAt: string
}
