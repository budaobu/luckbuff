import type { DiZhi } from '~/types/user'

export interface QizhengPaipanLocation {
  name: string
  latitude: number
  longitude: number
  timezone: string
}

export interface QizhengPaipanInput {
  birthDate: string
  birthHour: DiZhi
  gender: 'male' | 'female'
  location?: QizhengPaipanLocation | null
}

export interface QizhengPaipanBasic {
  solarText: string
  trueSolarText: string
  lunarText: string
  zodiac: string
  locationName: string
  timezone: string
  coordinates: string
  genderText: string
  dayNight: string
  sunrise: string
  sunset: string
  moonrise: string
  moonset: string
  timeBasis: string
}

export interface QizhengPaipanPillar {
  key: 'year' | 'month' | 'day' | 'hour'
  label: string
  ganzhi: string
  nayin: string
}

export interface QizhengPlanet {
  key: string
  name: string
  category: '七政' | '四余'
  longitude: number
  branch: string
  branchDegree: number
  mansion: string
  mansionDegree: number
  latitude: number
  distance: number | null
  speed: number
  isRetrograde: boolean
  status: string[]
}

export interface QizhengPalace {
  name: string
  branch: string
  shortName: string
  headLongitude: number
  lord: string
  stars: string[]
  shensha: string[]
}

export interface QizhengRelation {
  type: '同宫' | '对照' | '三合' | '四正'
  label: string
  members: string[]
  orb: number
}

export interface QizhengPeriod {
  label: string
  detail: string
  isCurrent?: boolean
}

export interface QizhengFlowYear {
  year: number
  age: number
  palace: string
  shortName: string
  ganzhi: string
  isCurrent: boolean
}

export interface QizhengPaipanResult {
  basic: QizhengPaipanBasic
  pillars: QizhengPaipanPillar[]
  jieqi: {
    previous: string
    next: string
  }
  liming: {
    lifePalace: string
    lifeLord: string
    bodyPalace: string
    bodyLord: string
    basis: string
  }
  planets: QizhengPlanet[]
  palaces: QizhengPalace[]
  relations: QizhengRelation[]
  keyShensha: Array<{ name: string, branch: string, note: string }>
  dayuns: QizhengPeriod[]
  flowYears: QizhengFlowYear[]
  methodology: {
    engine: string
    astronomy: string
    method: string
    time: string
    disclaimer: string
  }
  generatedAt: string
}
