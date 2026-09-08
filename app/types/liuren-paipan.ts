export interface LiurenPaipanCalcInput {
  datetime: string
  timezone?: string
  location?: string
  longitude?: number
  latitude?: number
  birthDate?: string
  gender?: 'male' | 'female'
}

export interface LiurenPaipanSourceTime {
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

export interface LiurenPaipanPillar {
  label: 'year' | 'month' | 'day' | 'hour'
  ganzhi: string
  xun: string
  xunKong: string[]
}

export interface LiurenPaipanCourse {
  label: 'first' | 'second' | 'third' | 'fourth'
  title: string
  text: string
  upper: string
  lower: string
  god: string
}

export interface LiurenPaipanTransmission {
  label: 'chu' | 'zhong' | 'mo'
  branch: string
  god: string
  sixRelative: string
  hiddenGan: string
}

export interface LiurenPaipanPalace {
  branch: string
  skyBranch: string
  god: string
  hiddenGan: string
  jianChu: string
  isVoid: boolean
}

export interface LiurenPaipanShenSha {
  name: string
  value: string
  description?: string
}

export interface LiurenPaipanNianMing {
  birthYearGanZhi: string
  genderText: '男' | '女'
  luNianGanZhi: string
}

export interface LiurenPaipanResult {
  input: {
    requestedTime: string
    requestedTimezone: string
    location: string
    longitude?: number
    latitude?: number
    engineTime: string
    engineTimeBasis: string
  }
  solarTime: LiurenPaipanSourceTime
  summary: {
    monthGeneral: string
    hourBranch: string
    dayGan: string
    dayBranch: string
    xunShou: string
    xunKong: string[]
    coursePattern: string
    nianMing: LiurenPaipanNianMing | null
  }
  pillars: LiurenPaipanPillar[]
  courses: LiurenPaipanCourse[]
  transmissions: LiurenPaipanTransmission[]
  chart: {
    palaces: LiurenPaipanPalace[]
    yangGuiRen: string[]
    yinGuiRen: string[]
  }
  marks: {
    yiMa: string
    dingMa: string
    tianMa: string
  }
  shenSha: LiurenPaipanShenSha[]
  methodology: {
    engine: string
    method: string
    calendar: string
    timeBasis: string
    trueSolarTime: string
    disclaimer: string
  }
}

export interface LiurenPaipanInterpretTarget {
  selector?: string
  label?: string
  section?: string
  group?: string
  content?: string
}
