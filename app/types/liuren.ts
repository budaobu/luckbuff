export interface LiurenChartRequest {
  question: string
  birthYear: number
  location: string
  timezone: string
  datetime?: string
}

export interface LiurenGanzhi {
  year: string
  month: string
  day: string
  hour: string
}

export interface LiurenCalendar {
  solar: string
  lunar: string
  ganzhi: LiurenGanzhi
  yuejiang: string
  shichen: string
  birthYearBranch: string
}

export interface LiurenChartResponse {
  calendar: LiurenCalendar
  question: string
  location: string
}

export interface LiurenInterpretRequest {
  userInput: LiurenChartRequest
  chartJson: LiurenChartResponse
  locale?: string
}

export interface LiurenInterpretChunk {
  type: 'chart' | 'text' | 'error' | 'done'
  chart?: LiurenChartResponse
  text?: string
  message?: string
}
