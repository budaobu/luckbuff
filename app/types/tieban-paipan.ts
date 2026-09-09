export interface TiebanPaipanCalcInput {
  birthDate: string
  birthTime: string
  gender: 'male' | 'female'
  location?: string
  longitude?: number
  latitude?: number
  timezone?: string
}

export interface TiebanPaipanPillar {
  label: 'year' | 'month' | 'day' | 'hour'
  ganzhi: string
  nayin: string
}

export interface TiebanSolarTime {
  status: 'corrected' | 'boundary' | 'uncorrected'
  statusText: string
  requestedTimeText: string
  trueSolarTimeText: string | null
  correctedTimeText: string | null
  longitudeOffsetMinutes: number | null
  equationOfTimeMinutes: number | null
  standardMeridian: number | null
  algorithm: string | null
  dayBoundaryChanged: boolean
  hourBoundaryChanged: boolean
}

export interface TiebanVerse {
  id: number
  volume: string
  ages: string
  text: string
  available: boolean
}

export interface TiebanFormulaItem {
  label: string
  formula: string
  verse: TiebanVerse
}

export interface TiebanFlowYear {
  age: number
  ganzhi: string
  sound: string
  marker: string
  letter: string
  correction: number
  correctedCorrection: number
  correctedLetter: string
  formula: string
  verse: TiebanVerse
  correctedFormula: string
  correctedVerse: TiebanVerse
}

export interface TiebanPaipanResult {
  input: {
    requestedDate: string
    requestedTime: string
    timezone: string
    location: string
    longitude?: number
    latitude?: number
    engineTimeText: string
    engineTimeBasis: string
  }
  birth: {
    solarText: string
    lunarText: string
    lunarDetail: string
    zodiac: string
    genderText: '男' | '女'
    minuteQuarter: {
      label: string
      stem: string
      value: number
    }
  }
  solarTime: TiebanSolarTime
  pillars: TiebanPaipanPillar[]
  numbers: {
    lunarMonthValue: number
    hourBranchValue: number
    innate: number
    sound: string
    soundValue: number
    dayNayinElement: string
    hourNayinElement: string
    dayLife: number
    timeFortune: number
    kaokeGroup: string
    kaokeQuarter: '初刻' | '正刻'
    lifeNumber: number
    acquired: number
    minuteFormula: string
  }
  natal: {
    hexagram: string
    base: number
    ordinal: number
    formulas: TiebanFormulaItem[]
  }
  flowYears: TiebanFlowYear[]
  corpus: {
    status: 'available' | 'partial'
    availableCount: number
    requestedCount: number
    missingCount: number
    source: string
    fidelity: string
  }
  methodology: {
    engine: string
    calendar: string
    timeBasis: string
    kaoke: string
    corpus: string
    disclaimer: string
  }
}

export interface TiebanPaipanInterpretTarget {
  selector?: string
  label?: string
  section?: string
  group?: string
  content?: string
}
