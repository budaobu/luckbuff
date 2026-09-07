export interface QimenPaipanCalcInput {
  datetime: string
  timezone?: string
  location?: string
  longitude?: number
  latitude?: number
}

export interface QimenPaipanSource {
  book: string
  section: string
}

export interface QimenPaipanPattern {
  category: string
  name: string
  auspiciousness: string
  palace?: string
  detail: string
  relation?: string
  sources: QimenPaipanSource[]
}

export interface QimenPaipanPalace {
  palace: number
  name: string
  trigram: string
  direction: string
  element: string
  earthStem: string
  earthDoor: string
  skyStem: string
  door: string
  originalStar: string
  star: string
  god: string
  isCenter: boolean
  hostsCenter: boolean
  isVoid: boolean
  hostingNote?: string
}

export interface QimenPaipanPillar {
  label: 'year' | 'month' | 'day' | 'hour'
  ganzhi: string
  xunKongDirection: string[]
  guXu: string[]
}

export interface QimenPaipanResult {
  input: {
    requestedTime: string
    requestedTimezone: string
    location: string
    longitude?: number
    latitude?: number
    engineTime: string
    engineTimeBasis: string
  }
  solarTime: {
    status: 'corrected' | 'boundary' | 'uncorrected'
    statusText: string
    requestedTimeText: string
    trueSolarTime: string | null
    correctedEngineTimeText: string | null
    longitudeOffsetMinutes: number | null
    equationOfTimeMinutes: number | null
    standardMeridian: number | null
    algorithm: string | null
    dayBoundaryChanged: boolean
    hourBoundaryChanged: boolean
  }
  summary: {
    dunType: 'yang' | 'yin'
    dunTypeText: string
    juNumber: number
    yuan: string
    solarTerm: string
    method: string
    xunShou: string
    hiddenYi: string
    zhiFu: string
    zhiFuPalace: string
    zhiShi: string
    zhiShiPalace: string
  }
  pillars: QimenPaipanPillar[]
  chart: {
    palaces: QimenPaipanPalace[]
    timeXun: string
    timeXunKong: string[]
    timeXunKongDirections: string[]
    timeXunKongPalaces: number[]
    timeGuXu: string[]
    centerHosting: string
  }
  signals: {
    yearXunKong: string[]
    yearGuXu: string[]
    monthXunKong: string[]
    monthGuXu: string[]
    dayXunKong: string[]
    dayGuXu: string[]
    hourXunKong: string[]
    hourGuXu: string[]
  }
  patterns: QimenPaipanPattern[]
  methodology: {
    engine: string
    method: string
    calendar: string
    timeBasis: string
    trueSolarTime: string
    disclaimer: string
  }
}

export interface QimenPaipanInterpretTarget {
  selector?: string
  label?: string
  section?: string
  group?: string
  content?: string
}
