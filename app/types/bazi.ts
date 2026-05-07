import type { TianGan, DiZhi } from './user'

export interface Pillar {
  gan: TianGan
  zhi: DiZhi
  shishen?: string
  canggan: { gan: TianGan; type: '本气' | '中气' | '余气' }[]
}

export interface DaYun {
  index: number
  ageRange: [number, number]
  gan: TianGan
  zhi: DiZhi
  fortune?: '大吉' | '吉' | '平' | '凶' | '大凶'
  score?: number
}

export interface WuxingScore {
  木: number
  火: number
  土: number
  金: number
  水: number
}

export interface BaziChart {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar | null
  riZhu: TianGan
  riZhuStrength: '身旺' | '身弱' | '从强' | '从弱'
  wuxingScore: WuxingScore
  geju: string
  xiyong: string
  jishen: string
  dayuns: DaYun[]
  qiyunAge: number
  currentAge: number
  currentDaYun: DaYun | null
}

// === AI 结构化结果 ===

export interface AiDimensionCard {
  summary: string
  detail: string
  tags: string[]
}

export interface AiDayunScore {
  index: number
  ganZhi: string
  ageRange: string
  /** 综合评分（兼容旧数据） */
  score: number
  /** 开盘分：这步大运开始时的运势 */
  open: number
  /** 收盘分：这步大运结束时的运势 */
  close: number
  /** 最高分：这步大运期间运势最高点 */
  high: number
  /** 最低分：这步大运期间运势最低点 */
  low: number
  fortune: string
  analysis: string
}

export interface AiHistoricalPrediction {
  age: number
  year: number
  description: string
}

export interface BaziAiResult {
  /** 性格特质 */
  personality: AiDimensionCard
  /** 事业与财运 */
  career: AiDimensionCard & { wealthTrend: string }
  /** 感情与婚姻 */
  relationship: AiDimensionCard & { timing: string }
  /** 健康与生活 */
  health: AiDimensionCard & { seasons: string }
  /** 人生总论 */
  overview: string

  /** 运势五维评分 */
  dimensionScores: {
    感情运: number
    事业运: number
    财运: number
    健康运: number
    学业运: number
  }

  /** 大运评分（含分析） */
  dayunScores: AiDayunScore[]

  /** 历史事件校准 */
  historicalPredictions: AiHistoricalPrediction[]

  /** 综合建议 */
  comprehensiveAdvice: string[]
}
