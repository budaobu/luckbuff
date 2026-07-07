import type { BaziChart } from './bazi'
import type { DiZhi, UserProfile } from './user'

export interface BaziFortuneTuneYearTip {
  year: number
  ganZhi: string
  wuxing: string
  direction: 'enhance' | 'reduce' | 'stable'
  summary: string
}

export interface BaziFortuneTuneReading {
  /** 日主强弱结论 */
  riZhuStrength: string
  /** 喜用神 */
  xiyong: string
  /** 忌神 */
  jishen: string
  /** 核心逻辑说明 */
  logicSummary: string
  /** 推荐材质列表 */
  materials: string[]
  /** 推荐颜色列表 */
  colors: string[]
  /** 佩戴手位建议 */
  handPosition: string
  /** 佩戴时机建议 */
  timing: string
  /** 日常搭配提示 */
  stylingTips: string[]
  /** 可选：逐年调整提示（原局版可留空） */
  yearlyTips: BaziFortuneTuneYearTip[]
  /** 外部搜索关键词提示（最多一句） */
  searchKeyword: string
  /** 免责声明 */
  disclaimer: string
}

export interface BaziFortuneTuneRequest {
  chart: BaziChart
  profile?: Pick<UserProfile, 'name' | 'gender' | 'birthDate' | 'birthHour'>
  locale?: string
  includeYearly?: boolean
}
