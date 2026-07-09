import type { VedicChart, VedicPlanet } from './vedic'

export interface VedicHepanPersonInput {
  name?: string
  gender?: 'male' | 'female' | ''
  birthDate: string
  birthTime: string
  birthCity: string
  timeUncertain?: boolean
}

export interface VedicHepanAspect {
  planetA: string
  planetB: string
  personA: string
  personB: string
  orb: number
  aspectType: string
  idealDeg: number
  /** 关系象征说明，供 prompt 引用 */
  note: string
}

export interface VedicHepanHouseOverlay {
  /** A 的某颗星落在 B 的第几宫 */
  owner: string
  planet: string
  house: number
}

export interface VedicHepanCalcResult {
  personA: {
    name: string
    chart: VedicChart
    cityName: string
  }
  personB: {
    name: string
    chart: VedicChart
    cityName: string
  }
  /** 跨盘主要相位 */
  crossAspects: VedicHepanAspect[]
  /** 宫位叠加：A 的行星落 B 的哪些宫位 */
  aPlanetsInB: VedicHepanHouseOverlay[]
  /** 宫位叠加：B 的行星落 A 的哪些宫位 */
  bPlanetsInA: VedicHepanHouseOverlay[]
  /** 上升星座对比 */
  ascendantComparison: {
    aSign: string
    aSignZh: string
    bSign: string
    bSignZh: string
    aSignName: string
    bSignName: string
  }
  /** 计算口径说明 */
  methodNote: string
  generatedAt: string
}

/** 前端表单数据 */
export interface VedicHepanFormData {
  personA: {
    name: string
    gender: 'male' | 'female' | ''
    birthDate: string
    birthTime: string
    birthCity: string
    timeUncertain: boolean
  }
  personB: {
    name: string
    gender: 'male' | 'female' | ''
    birthDate: string
    birthTime: string
    birthCity: string
    timeUncertain: boolean
  }
}

export interface VedicHepanSseEvent {
  type: 'text'
  text: string
}
