export interface CeziYishuCharAnalysis {
  char: string
  pinyin: string
  strokes: number
  radical: string
  components: string[]
  wuxing: string
  structure: string
  meaning: string
  estimated: boolean
}

export interface CeziYishuTrigram {
  index: number
  name: string
  symbol: string
  nature: string
  wuxing: string
}

export interface CeziYishuTimeInfo {
  gregorian: string
  lunar: {
    year: number
    month: number
    day: number
    yearGanZhi: string
    monthGanZhi: string
    dayGanZhi: string
    hourZhi: string
  }
  numbers: {
    yearZhi: number
    month: number
    day: number
    hourZhi: number
    sum: number
  }
}

export interface CeziYishuHexagram {
  upper: CeziYishuTrigram
  lower: CeziYishuTrigram
  name: string
  symbol: string
  movingLine: number
}

export interface CeziYishuResult {
  input: {
    chars: string
    question: string
    external: string
    datetime: string
  }
  analysis: {
    chars: CeziYishuCharAnalysis[]
    totalStrokes: number
  }
  time: CeziYishuTimeInfo
  derivation: {
    upperFormula: string
    lowerFormula: string
    movingLineFormula: string
  }
  hexagram: CeziYishuHexagram
}

export interface CeziYishuRequest {
  chars: string
  question: string
  external: string
  datetime?: string
}

export interface CeziYishuInterpretRequest {
  result: CeziYishuResult
  locale?: string
}
