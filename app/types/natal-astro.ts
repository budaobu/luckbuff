export type NatalAstroGender = 'male' | 'female'

export interface NatalAstroLocation {
  name: string
  latitude: number
  longitude: number
  timezone?: string
}

export interface NatalAstroInput {
  birthDate: string
  birthTime: string
  gender: NatalAstroGender
  birthCity: string
  location: NatalAstroLocation
  timeUncertain?: boolean
}

export interface NatalAstroPoint {
  key: string
  name: string
  nameZh: string
  category: 'luminary' | 'planet' | 'centaur' | 'asteroid' | 'node' | 'lilith' | 'lot' | 'angle'
  categoryZh: string
  longitude: number
  signIndex: number
  sign: string
  signZh: string
  degreeText: string
  house: number
  speed?: number
  isRetrograde?: boolean
  dignity?: string
  dignityZh?: string
  formula?: string
  calculation?: string
}

export interface NatalAstroHouseCusp {
  house: number
  sign: string
  signZh: string
  degreeText: string
  longitude: number
  size: number
}

export interface NatalAstroAspect {
  body1: string
  body2: string
  body1Zh: string
  body2Zh: string
  type: string
  typeZh: string
  symbol: string
  classification: 'major' | 'minor'
  nature: 'harmonious' | 'dynamic' | 'neutral'
  exactAngle: number
  separation: number
  orb: number
  strength: number
  isApplying: boolean | null
  isOutOfSign: boolean
}

export interface NatalAstroBirth {
  localText: string
  utcText: string
  weekday: string
  genderText: string
  timeBasis: string
  locationName: string
  coordinates: string
  timezone: string
  timezoneOffsetText: string
}

export interface NatalAstroAngles {
  ascendant: string
  midheaven: string
  descendant: string
  imumCoeli: string
}

export interface NatalAstroSummary {
  elements: Array<{ key: 'fire' | 'earth' | 'air' | 'water', label: string, points: string[] }>
  modalities: Array<{ key: 'cardinal' | 'fixed' | 'mutable', label: string, points: string[] }>
  polarity: { positive: number, negative: number }
  hemispheres: { north: number, south: number, east: number, west: number }
  quadrants: Array<{ key: string, label: string, points: string[] }>
  retrograde: string[]
  dignities: Array<{ key: string, label: string, points: string[] }>
}

export interface NatalAstroResult {
  birth: NatalAstroBirth
  angles: NatalAstroAngles
  points: NatalAstroPoint[]
  houseCusps: NatalAstroHouseCusp[]
  aspects: NatalAstroAspect[]
  patterns: string[]
  summary: NatalAstroSummary
  methodology: {
    engine: string
    zodiac: string
    houseSystem: string
    timezone: string
    trueSolarTime: string
    disclaimer: string
  }
  generatedAt: string
}
