import type { VedicChart, VedicPlanet } from './vedic'

export interface AstroFortuneTuneCity {
  /** 用户填写的城市名称 */
  name: string
  /** 是否成功解析经纬度 */
  resolved: boolean
  lat?: number
  lng?: number
  cityName?: string
}

export interface AstroFortuneTuneComparison {
  city: AstroFortuneTuneCity
  chart: VedicChart
  /** 上升星座相对出生地变化的度数（整宫制下 sign 变化已能说明，但保留度数差异用于量化） */
  ascendantDeltaDeg: number
  /** 主要 relocated 相位变化摘要 */
  aspectHighlights: AstroFortuneTuneAspectHighlight[]
  /** 该城市与出生地的主要差异一句话 */
  summary: string
}

export interface AstroFortuneTuneAspectHighlight {
  planet1: string
  planet2: string
  /** 0~180，主要相位 */
  orb: number
  /** 相位类型：合、六合、刑、拱、冲等 */
  aspectType: string
  /** 相对出生地 orb 变化（正数表示 tighter，负数表示 looser） */
  orbDelta: number
  note: string
}

export interface AstroFortuneTuneCalcResult {
  /** 出生地星盘 */
  baseChart: VedicChart
  /** 出生地城市名 */
  baseCityName: string
  /** 候选城市对比结果 */
  comparisons: AstroFortuneTuneComparison[]
  /** 是否有城市解析失败 */
  hasUnresolvedCities: boolean
  /** 计算口径标注 */
  calculationMethod: 'vedic_relocation' | 'simplified_fallback'
  /** 口径说明文案 */
  methodNote: string
  generatedAt: string
}

export interface AstroFortuneTuneReading {
  /** 可执行改运指引（段落文本） */
  guidance: string
  /** 推荐城市索引（0 表示出生地更稳，1~3 表示候选城市排序） */
  recommendedCityIndex: number
  /** 推荐城市原因 */
  recommendedReason: string
  /** 每个候选城市的简短建议 */
  citySummaries: { name: string; advice: string }[]
  /** 免责声明 */
  disclaimer: string
  /** 计算口径标注 */
  methodNote: string
}

export interface AstroFortuneTuneRequest {
  birthDate: string
  birthTime: string
  baseCity: string
  gender?: 'male' | 'female' | ''
  timeUncertain?: boolean
  candidateCities: string[]
  locale?: string
}

/** 前端表单数据 */
export interface AstroFortuneTuneFormData {
  birthDate: string
  birthTime: string
  baseCity: string
  gender: 'male' | 'female' | ''
  timeUncertain: boolean
  candidateCities: string[]
}

export interface AstroFortuneTuneSseChartEvent {
  type: 'chart'
  result: AstroFortuneTuneCalcResult
}

export interface AstroFortuneTuneSseTextEvent {
  type: 'text'
  text: string
}

export interface AstroFortuneTuneSseErrorEvent {
  type: 'error'
  message: string
}

export type AstroFortuneTuneSseEvent =
  | AstroFortuneTuneSseChartEvent
  | AstroFortuneTuneSseTextEvent
  | AstroFortuneTuneSseErrorEvent
