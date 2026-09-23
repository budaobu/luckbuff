export interface HoroscopeSign {
  slug: string
  name: string
  nameZh: string
  nameJa: string
  range: string
  element: string
  ruler: string
}

export interface HoroscopePlanetPosition {
  key: string
  nameZh: string
  nameEn: string
  signIndex: number
  degree: number
  isRetrograde: boolean
}

export interface HoroscopeAspect {
  transitKey: string
  transitNameZh: string
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'
  typeZh: string
  nature: 'harmonious' | 'dynamic' | 'focal'
  orb: number
  strength: number
}

export interface HoroscopeScores {
  overall: number
  love: number
  work: number
  wealth: number
  health: number
}

export interface HoroscopeDay {
  date: string
  scores: HoroscopeScores
  luckyNumber: number
  luckyColorKey: string
  luckyDirectionKey: string
  loveHint: string
  workHint: string
  wealthHint: string
  healthHint: string
}

export interface HoroscopeResult {
  sign: HoroscopeSign
  date: string
  generatedAt: string
  timeZone: string
  scores: HoroscopeScores
  luckyNumber: number
  luckyColorKey: string
  luckyDirectionKey: string
  loveHint: string
  workHint: string
  wealthHint: string
  healthHint: string
  compatibility: HoroscopeSign
  summary: string
  sky: {
    moonPhaseAngle: number
    moonPhaseKey: string
    moonSignIndex: number
    planets: HoroscopePlanetPosition[]
    aspects: HoroscopeAspect[]
  }
  methodology: {
    engine: string
    zodiac: string
    scoring: string
    disclaimer: string
  }
}

export interface HoroscopeTopicResult {
  date: string
  generatedAt: string
  timeZone: string
  moonPhaseAngle: number
  moonPhaseKey: string
  moonSignIndex: number
  signs: Array<{
    sign: HoroscopeSign
    rank: number
    scores: HoroscopeScores
    luckyNumber: number
    luckyColorKey: string
    summary: string
  }>
}
