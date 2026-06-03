export interface VedicAscendant {
  longitude: number
  sign: number
  signName: string
  signNameZh: string
  degree: number
  nakshatra: string
  nakshatraPada: number
}

export interface VedicPlanet {
  graha: string
  longitude: number
  sign: number
  signName: string
  signNameZh: string
  degree: number
  house: number
  isRetrograde: boolean
  nakshatra: string
  nakshatraPada: number
}

export interface VedicDashaPeriod {
  graha: string
  startDate: string
  endDate: string
  years: number
  isCurrent: boolean
}

export interface VedicValidation {
  rule: string
  pass: boolean
  detail: string
}

export interface VedicBirthData {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  lat: number
  lng: number
  utcOffset: number
}

export interface VedicChart {
  ascendant: VedicAscendant
  planets: VedicPlanet[]
  houseStartSign: number
  dasha: VedicDashaPeriod[]
  ayanamsha: number
  julianDay: number
  timezone?: string
  timeUncertain: boolean
  validations: VedicValidation[]
  birthData: VedicBirthData
  cityName?: string
}

export type VedicDimension = 'core' | 'career' | 'love' | 'annual'

export interface VedicFormData {
  birthDate: string
  birthTime: string
  city: string
  gender: 'male' | 'female' | ''
  dimensions: VedicDimension[]
  timeUncertain: boolean
}

export interface VedicSseChartEvent {
  type: 'chart'
  chart: VedicChart
}

export interface VedicSseTextEvent {
  type: 'text'
  text: string
}

export interface VedicSseErrorEvent {
  type: 'error'
  message: string
}

export type VedicSseEvent = VedicSseChartEvent | VedicSseTextEvent | VedicSseErrorEvent
