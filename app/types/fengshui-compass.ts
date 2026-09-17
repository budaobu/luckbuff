export interface CompassSize {
  width: number
  height: number
  tianChiRadius?: number
}

export interface CompassLineStyle {
  borderColor: string
  scaleColor: string
  scaleHighlightColor: string
}

export interface CompassScaleStyle {
  minLineHeight: number
  midLineHeight: number
  maxLineHeight: number
  numberFontSize?: number
}

export interface CompassLayer {
  name: string | string[]
  startAngle?: number
  fontSize?: number
  textColor?: string | string[]
  vertical?: boolean
  togetherStyle?: 'empty' | 'equally'
  shape?: 'circle' | 'polygon'
  data: string[] | string[][]
}

export interface FengShuiCompassConfig {
  info: {
    id: string | number
    name?: string
    preview?: string
  }
  animation?: {
    enable: boolean
    duration?: number
    delay?: number
  }
  compassSize: CompassSize
  data: CompassLayer[]
  line: CompassLineStyle
  rotate: number
  latticeFill: Array<[number, number, string]>
  isShowTianxinCross?: boolean
  isShowScale?: boolean
  scaclStyle: CompassScaleStyle
  autoFontSize?: boolean
}

export interface ConstellationPoint {
  id: string
  x: string
  y: string
}

export interface ConstellationLine {
  start: Pick<ConstellationPoint, 'x' | 'y'>
  end: Pick<ConstellationPoint, 'x' | 'y'>
}

export interface ConstellationMansion {
  name: string
  stars: ConstellationPoint[]
  lines: ConstellationLine[]
}

export type TwentyEightConstellations = ConstellationMansion[]
