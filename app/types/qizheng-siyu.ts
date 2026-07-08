export interface QizhengSiyuFormData {
  birthDate: string
  birthTime: string
  baseCity: string
  gender: 'male' | 'female' | ''
}

export interface QizhengSiyuPlanet {
  key: string
  name: string
  nameEn: string
  longitude: number
  latitude: number
  distance: number
  speed: number
  isRetrograde: boolean
  signIndex: number
  signNameEn: string
  signNameZh: string
  degreeInSign: number
  house: number
}

export interface QizhengSiyuRemainder {
  key: string
  name: string
  nameEn: string
  longitude: number
  signIndex: number
  signNameEn: string
  signNameZh: string
  degreeInSign: number
  house: number
}

export interface QizhengSiyuAspect {
  body1: string
  body2: string
  body1Name: string
  body2Name: string
  angle: number
  orb: number
  aspectName: string
}

export interface QizhengSiyuHouse {
  number: number
  signIndex: number
  signNameEn: string
  signNameZh: string
  cusp: number
}

export interface QizhengSiyuAngle {
  name: 'Ascendant' | 'Midheaven' | 'Descendant' | 'ImumCoeli'
  nameZh: string
  longitude: number
  signIndex: number
  signNameEn: string
  signNameZh: string
  degreeInSign: number
}

export interface QizhengSiyuChart {
  planets: QizhengSiyuPlanet[]
  remainders: QizhengSiyuRemainder[]
  houses: QizhengSiyuHouse[]
  angles: QizhengSiyuAngle[]
  aspects: QizhengSiyuAspect[]
  baseCityName: string
  localOffsetHours: number
  calculationMethod: 'celestine_qizheng_siyu'
  methodNote: string
  generatedAt: string
}
