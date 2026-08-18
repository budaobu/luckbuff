import type { Palace, QimenPan } from '~~/server/utils/qimen/types'

export interface ZizhanPalaceInfo {
  gong: number
  gongName: string
  direction: string
  tianpan: string
  dipan: string
  men: string | null
  xing: string
  shen: string
  isZhiFu: boolean
  isZhiShi: boolean
}

export interface QimenZizhanChart {
  char: string
  strokes: number
  question?: string
  questionTime: string
  pan: QimenPan
  /** 笔画飞宫原始落宫（1-9，含中5） */
  ziGongRaw: number
  /** 实际参断宫（中5寄坤2） */
  ziGong: number
  /** 天盘日干落宫（求测人） */
  riGanGong: number
  /** 天盘时干落宫（所问事） */
  shiGanGong: number
  ziPalace: ZizhanPalaceInfo
  riPalace: ZizhanPalaceInfo
  shiPalace: ZizhanPalaceInfo
}

export interface QimenZizhanInterpretRequest {
  chart: QimenZizhanChart
  question?: string
  locale?: string
}
