export interface LiuyaoCeziRequest {
  char: string
  question: string
  datetime?: string
}

export interface LiuyaoCeziCharAnalysis {
  char: string
  strokes: number
  estimated: boolean
}

export interface LiuyaoCeziTimeInfo {
  gregorian: string
  lunar: {
    year: number
    month: number
    day: number
    yearGanZhi: string
    monthGanZhi: string
    dayGanZhi: string
    hourZhi: string
    hourIndex: number
  }
  monthBuild: string
  dayPillar: string
}

export interface LiuyaoCeziTrigram {
  index: number
  name: string
  symbol: string
  nature: string
  wuxing: string
}

export interface LiuyaoCeziHexagram {
  upper: LiuyaoCeziTrigram
  lower: LiuyaoCeziTrigram
  name: string
  symbol: string
  movingLine: number
}

export interface LiuyaoCeziLine {
  position: number
  label: string
  yin: boolean
  stemBranch: string
  gan: string
  zhi: string
  liuQin: string
  liuShen: string
  wuxing: string
  state: string
  isMoving: boolean
  isXunKong: boolean
  isYuePo: boolean
  isShi: boolean
  isYing: boolean
}

export interface LiuyaoCeziBody {
  tiTrigram: LiuyaoCeziTrigram
  yongTrigram: LiuyaoCeziTrigram
  tiWuxing: string
}

export interface LiuyaoCeziResult {
  input: {
    char: string
    question: string
    datetime: string
  }
  analysis: LiuyaoCeziCharAnalysis
  time: LiuyaoCeziTimeInfo
  derivation: {
    strokes: number
    hourNumber: number
    upperFormula: string
    lowerFormula: string
    movingLineFormula: string
  }
  hexagram: LiuyaoCeziHexagram
  body: LiuyaoCeziBody
  lines: LiuyaoCeziLine[]
}

export interface LiuyaoCeziInterpretRequest {
  result: LiuyaoCeziResult
  locale?: string
}
