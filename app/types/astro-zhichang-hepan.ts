export type AstroZhichangRelationType = 'leader-subordinate' | 'colleague'

export interface AstroZhichangPlanet {
  /** 英文行星名：Sun/Moon/Mercury/Venus/Mars/Jupiter/Saturn/Uranus/Neptune/Pluto */
  name: string
  /** 中文行星名 */
  nameZh: string
  /** 黄经 0-360 */
  longitude: number
  /** 星座序号 1-12 */
  sign: number
  signName: string
  signNameZh: string
  /** 星座内度数 */
  degree: number
  /** 落宫 1-12 */
  house: number
  isRetrograde: boolean
}

export interface AstroZhichangAngle {
  longitude: number
  sign: number
  signName: string
  signNameZh: string
  degree: number
}

export interface AstroZhichangChart {
  ascendant: AstroZhichangAngle
  midheaven: AstroZhichangAngle
  planets: AstroZhichangPlanet[]
  /** 12 宫头黄经（Placidus） */
  houseCusps: { house: number; longitude: number; signName: string; signNameZh: string }[]
  /** 上升星座序号（用于整宫叠加外的快速参考） */
  ascendantSign: number
}

export interface AstroZhichangPerson {
  name: string
  roleLabel: string
  gender: 'male' | 'female' | ''
  birthCity: string
  cityName: string
  lat: number
  lng: number
  timezone: number
  timeUncertain: boolean
  chart: AstroZhichangChart
}

export interface AstroZhichangAspect {
  planetA: string
  planetB: string
  personA: string
  personB: string
  orb: number
  aspectType: string
  idealDeg: number
  nature: 'harmony' | 'tension' | 'blend'
  note: string
}

export interface AstroZhichangHouseOverlay {
  owner: string
  planet: string
  house: number
}

export interface AstroZhichangCalcResult {
  relationType: AstroZhichangRelationType
  personA: AstroZhichangPerson
  personB: AstroZhichangPerson
  /** 跨盘主要相位 */
  crossAspects: AstroZhichangAspect[]
  /** A 行星落 B 宫位 */
  aPlanetsInB: AstroZhichangHouseOverlay[]
  /** B 行星落 A 宫位 */
  bPlanetsInA: AstroZhichangHouseOverlay[]
  ascendantComparison: {
    aSign: string
    aSignZh: string
    bSign: string
    bSignZh: string
  }
  /** 事业相关重点摘要（10宫/MC/6宫/2宫/土星/木星/太阳）供前端与 prompt 使用 */
  careerFocus: {
    personA: { tenthHousePlanets: string[]; mcSignZh: string; saturnHouse: number; jupiterHouse: number; sunHouse: number }
    personB: { tenthHousePlanets: string[]; mcSignZh: string; saturnHouse: number; jupiterHouse: number; sunHouse: number }
  }
  methodNote: string
  generatedAt: string
}

export interface AstroZhichangFormPerson {
  name: string
  gender: 'male' | 'female' | ''
  birthDate: string
  birthTime: string
  birthCity: string
  timeUncertain: boolean
}

export interface AstroZhichangFormData {
  relationType: AstroZhichangRelationType
  personA: AstroZhichangFormPerson
  personB: AstroZhichangFormPerson
}

export interface AstroZhichangSseTextEvent { type: 'text'; text: string }
export interface AstroZhichangSseErrorEvent { type: 'error'; message: string }
export type AstroZhichangSseEvent = AstroZhichangSseTextEvent | AstroZhichangSseErrorEvent
