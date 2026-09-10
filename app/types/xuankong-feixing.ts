export type XuankongPalaceKey =
  | 'kan'
  | 'gen'
  | 'zhen'
  | 'xun'
  | 'li'
  | 'kun'
  | 'dui'
  | 'qian'
  | 'center'

export type XuankongUsage = 'residential' | 'office' | 'shop'

export interface XuankongCalcInput {
  direction: number
  completionDate: string
  inspectionDate?: string
  usage?: XuankongUsage
  locale?: 'zh-CN' | 'zh-TW' | 'en'
}

export interface XuankongStar {
  number: number
  name: string
  element: string
  nature: string
  status?: string
}

export interface XuankongMountain {
  name: string
  palaceKey: XuankongPalaceKey
  palaceName: string
  palaceNumber: number
  direction: string
  yuan: 0 | 1 | 2
  yuanName: string
  yinYang: 'yang' | 'yin'
  yinYangName: string
  centerAngle: number
  startAngle: number
  endAngle: number
}

export interface XuankongPalace {
  key: XuankongPalaceKey
  palaceNumber: number
  name: string
  direction: string
  element: string
  mountains: string[]
  earth: number
  period: number
  mountain: number
  water: number
  periodStar: XuankongStar
  mountainStar: XuankongStar
  waterStar: XuankongStar
  annualStar: number
  monthlyStar: number
  isCenter: boolean
  isSitting: boolean
  isFacing: boolean
  displayRow: 0 | 1 | 2
  displayCol: 0 | 1 | 2
}

export interface XuankongFormation {
  key: string
  name: string
  description: string
}

export interface XuankongCombination {
  name: string
  kind: 'auspicious' | 'inauspicious'
  palaceKeys: XuankongPalaceKey[]
  palaceNames: string[]
  note: string
}

export interface XuankongPeriod {
  number: number
  name: string
  startYear: number
  endYear: number
  cycle: '上元' | '中元' | '下元'
}

export interface XuankongResult {
  input: {
    direction: number
    completionDate: string
    inspectionDate: string
    usage: XuankongUsage | null
  }
  orientation: {
    facing: XuankongMountain
    sitting: XuankongMountain
    facingLabel: string
    sittingLabel: string
    label: string
    deviationFromCenter: number
    boundaryDistance: number
    substitutionThreshold: number
    mountains: XuankongMountain[]
  }
  summary: {
    method: '下卦' | '替卦'
    methodNote: string
    period: XuankongPeriod
    formation: XuankongFormation
    annualCenter: number
    monthlyCenter: number
    lunarYear: number
    lunarMonth: number
  }
  chart: {
    grid: XuankongPalaceKey[][]
    palaces: XuankongPalace[]
  }
  combinations: XuankongCombination[]
  methodology: {
    engine: string
    method: string
    calendar: string
    substitutionTable: string
    timeBasis: string
    disclaimer: string
  }
}

export interface XuankongInterpretTarget {
  selector?: string
  label?: string
  section?: string
  group?: string
  content?: string
}
