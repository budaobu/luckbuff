import type { XiaoLiurenPosition, XiaoLiurenStep } from './xiao-liuren'

export interface LiurenZizhanChart {
  char: string
  strokes: number
  questionTime: string
  lunarDate: string
  lunarDay: number
  hourBranch: string
  steps: XiaoLiurenStep[]
  finalPosition: XiaoLiurenPosition
}

export interface LiurenZizhanInterpretRequest {
  chart: LiurenZizhanChart
  question?: string
  locale?: string
}
