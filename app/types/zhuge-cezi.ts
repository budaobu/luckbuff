export interface ZhugeCeziCharInfo {
  char: string
  strokes: number
  digit: number
}

export interface ZhugeShenqian {
  number: string
  title: string
  poem: string
  interpretation: string
}

export interface ZhugeCeziResult {
  input: {
    chars: string
    question: string
  }
  chars: ZhugeCeziCharInfo[]
  combinedNumber: number
  qianNumber: number
  qianText: ZhugeShenqian
}

export interface ZhugeCeziRequest {
  chars: string
  question: string
}

export interface ZhugeCeziInterpretRequest {
  result: ZhugeCeziResult
  locale?: string
}
