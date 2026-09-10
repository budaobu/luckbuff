export type TaiyiJiStyle = 'year' | 'month' | 'day' | 'hour'
export type TaiyiAcumMethod = 0 | 1 | 2 | 3

export interface TaiyiPaipanCalcInput {
  datetime: string
  timezone?: string
  location?: string
  longitude?: number
  latitude?: number
}

export interface TaiyiPaipanSolarTime {
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

export interface TaiyiPaipanPillar {
  label: 'year' | 'month' | 'day' | 'hour'
  ganzhi: string
  xunKong: string[]
}

export interface TaiyiPaipanPalace {
  position: '子' | '丑' | '艮' | '寅' | '卯' | '辰' | '巽' | '巳' | '午' | '未' | '坤' | '申' | '酉' | '戌' | '乾' | '亥' | '中'
  palaceNumber: number | null
  gods: string[]
}

export interface TaiyiPaipanDoorPalace {
  palaceNumber: number
  palaceName: string
  direction: string
  element: string
  door: string | null
  wangZhuai: string
  isTaiyi: boolean
}

export interface TaiyiPaipanResult {
  input: {
    requestedTime: string
    requestedTimezone: string
    location: string
    longitude?: number
    latitude?: number
    engineTime: string
    engineTimeBasis: string
  }
  solarTime: TaiyiPaipanSolarTime
  summary: {
    jiStyle: TaiyiJiStyle
    jiStyleText: string
    method: TaiyiAcumMethod
    methodText: string
    dunType: 'yang' | 'yin'
    dunTypeText: string
    juNumber: number
    juText: string
    sancai: string
    accNumber: number
    jiyuan: string
    fiveYuanJu: string
    taiSui: string
    heGod: string
    jiGod: string
    taiyiPalace: number
    taiyiPalaceName: string
    taiyiHomeAway: string
    wenchang: string
    wenchangState: string
    shiji: string
    shijiXiu: string
    dingMu: string
    yearXiu: string
    threeDoors: string
    fiveGenerals: string
    homeAwayRelation: string
    victoryJudgement: string
    yangJiu: string
    baiLiu: string
    yearGua: string
    dayGua: string
    hourGua: string
  }
  pillars: TaiyiPaipanPillar[]
  calendars: {
    solarText: string
    lunarText: string
    jieQi: string
    dayOfficer: string
    dayXiu: string
    yearGanZhi: string
  }
  spirits: {
    label: string
    value: string
  }[]
  calculations: Array<{
    label: string
    value: number
    descriptions: string[]
    general: number
    viceGeneral: number
  }>
  bases: Array<{ label: string, value: string }>
  chart: {
    palaces: TaiyiPaipanPalace[]
    doors: TaiyiPaipanDoorPalace[]
  }
  patterns: Array<{ name: string, detail: string }>
  methodology: {
    engine: string
    method: string
    calendar: string
    timeBasis: string
    trueSolarTime: string
    disclaimer: string
  }
}

export interface TaiyiPaipanInterpretTarget {
  selector?: string
  label?: string
  section?: string
  group?: string
  content?: string
}
