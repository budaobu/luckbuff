export type XiaoLiurenMethod = 'time' | 'number' | 'character'

export interface XiaoLiurenTimeInput {
  method: 'time'
  datetime?: string
  timezone?: string
}

export interface XiaoLiurenNumberInput {
  method: 'number'
  numbers: [number, number, number]
}

export interface XiaoLiurenCharacterInput {
  method: 'character'
  text: string
}

export type XiaoLiurenRequest = {
  question?: string
  gender?: 'male' | 'female' | null
  birthYear?: number | null
} & (XiaoLiurenTimeInput | XiaoLiurenNumberInput | XiaoLiurenCharacterInput)

export interface XiaoLiurenPosition {
  name: string
  index: number
  finger: string
  meaning: string
  summary: string
}

export interface XiaoLiurenStep {
  label: string
  value: string | number
  positionIndex: number
}

export interface XiaoLiurenResult {
  method: XiaoLiurenMethod
  finalPosition: XiaoLiurenPosition
  steps: XiaoLiurenStep[]
  input: {
    question?: string
    gender?: 'male' | 'female' | null
    birthYear?: number | null
  }
  // 时间起卦专用
  timeContext?: {
    solarDate: string
    lunarDate: string
    lunarMonth: number
    lunarDay: number
    hourBranch: string
    hourBranchIndex: number
  }
  // 数字起卦专用
  numberContext?: {
    numbers: [number, number, number]
  }
  // 汉字起卦专用
  characterContext?: {
    text: string
    charCount: number
    strokeHint: string
  }
}

export interface XiaoLiurenInterpretRequest {
  result: XiaoLiurenResult
  locale?: string
}
