export type ZechengWuxing = '木' | '火' | '土' | '金' | '水'

export interface ZechengCityChar {
  char: string
  wx: ZechengWuxing | null
  basis: string | null
}

export interface ZechengXiuDetail {
  name: string
  yao: string
  wx: ZechengWuxing
  beast: string
}

export interface ZechengCityRecord {
  name: string
  fullName: string
  province: string
  aliases?: string[]
  lng: number
  lat: number
  fenye: {
    xiu: string[]
    ci: string
    guo: string
    zhou: string | null
    source: string
    extended?: boolean
  }
  chars: ZechengCityChar[]
}

export interface ZechengPerson {
  pillarsText: string
  favorable: string[]
  unfavorable: string[]
  strength: string
  patternName: string
  branches: string[]
  hasHour: boolean
  selectedHour: string | null
  effectiveHour: string | null
  solarTimeStatusText: string
  yimaBranch: string | null
  yimaWhere: string | null
  originName: string
  originProvince: string
  originLng: number
  originLat: number
}

export interface ZechengCityResult {
  name: string
  fullName: string
  province: string
  fenye: ZechengCityRecord['fenye']
  xiuDetail: ZechengXiuDetail[]
  chars: ZechengCityChar[]
}

export interface ZechengTrack {
  key: 'fangwei' | 'yima' | 'fenye' | 'ziwuxing'
  label: string
  weight: number
  tendency: number
  suspended: boolean
  basis: string
}

export interface ZechengVerdict {
  grade: '吉' | '中平' | '平' | '下'
  gradeWord: string
  score: number
}

export interface ZechengRankItem {
  name: string
  province: string
  score: number
  grade: ZechengVerdict['grade']
  gradeWord: string
  fang: string | null
  xiu: string[]
  brief: string
}

export interface ZechengCompareResult {
  mode: 'compare'
  person: ZechengPerson
  city: ZechengCityResult
  bearingDeg: number | null
  fang: string | null
  distanceKm: number
  sameCity: boolean
  tracks: ZechengTrack[]
  totalWeight: number
  verdict: ZechengVerdict
  rank: { position: number; poolSize: number } | null
}

export interface ZechengRankResult {
  mode: 'rank'
  person: ZechengPerson
  top: ZechengRankItem[]
  poolSize: number
}

export type ZechengResponse = ZechengCompareResult | ZechengRankResult
