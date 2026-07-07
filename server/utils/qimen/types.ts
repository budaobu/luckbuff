// ============================================================
// 奇门遁甲类型定义
// ============================================================

export type YinYang = 'yang' | 'yin'
export type PanGan = 'wu' | 'ji' | 'geng' | 'xin' | 'ren' | 'gui' | 'yi' | 'bing' | 'ding'
export type Men = '休门' | '生门' | '伤门' | '杜门' | '景门' | '死门' | '惊门' | '开门'
export type Xing = '天蓬' | '天芮' | '天冲' | '天辅' | '天禽' | '天心' | '天柱' | '天任' | '天英'
export type Shen = '值符' | '腾蛇' | '太阴' | '六合' | '白虎' | '玄武' | '九地' | '九天'
export type EventType = 'competition' | 'decision' | 'seeking' | 'timing' | 'general'

export interface Palace {
  gong: number
  direction: string
  dipan: PanGan
  tianpan: PanGan
  men: Men | null
  xing: Xing
  shen: Shen
  isZhiFu: boolean
  isZhiShi: boolean
}

export interface QimenPan {
  juShu: number
  yinYang: YinYang
  shiGanzhi: string
  riGanzhi: string
  jieqi: string
  palaces: Palace[]
  zhiFuGong: number
  zhiShiGong: number
}

export interface QimenGenerateRequest {
  questionTime: string
  eventType: EventType
  description?: string
}

export interface QimenCompetitionExtra {
  opponentDesc?: string
  myGoal?: string
}

export interface QimenSeekingExtra {
  lastSeenTime?: string
  lastSeenPlace?: string
  targetDesc?: string
  relationship?: string
}

export interface QimenTimingExtra {
  eventKind?: string
  timeRange?: string
  targetDirection?: string
}

export type QimenExtra = QimenCompetitionExtra | QimenSeekingExtra | QimenTimingExtra | Record<string, never>

export interface QimenGeneratePayload {
  questionTime: string
  eventType: EventType
  description?: string
  extra?: QimenExtra
}

export interface QimenInterpretRequest {
  pan: QimenPan
  eventType: EventType
  description?: string
  extra?: QimenExtra
  locale?: string
}
