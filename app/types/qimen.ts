// ============================================================
// 奇门遁甲模块类型定义
// ============================================================

export type QimenQuestionType = 'career' | 'wealth' | 'relationship' | 'study' | 'travel' | 'health' | 'legal' | 'other'

export type QimenGoal = 'can_succeed' | 'when_to_act' | 'which_direction' | 'what_to_avoid'

export interface QimenChartRequest {
  question_type: QimenQuestionType
  question_label: string
  question_goals: QimenGoal[]
  location: string
  timezone?: string
}

export interface PalaceData {
  palace: number
  earth_stem: string
  sky_stem: string | null
  star: string
  door: string | null
  god: string | null
  is_center: boolean
  hosts_center: boolean
}

export interface QimenChartResponse {
  normalized_input: Record<string, any>
  calendar: {
    solar: { ymd_hms: string; timezone: string }
    lunar: { year: number; month: number; day: number; month_text: string; day_text: string; is_leap_month: boolean }
    jieqi: { active_jie: string; active_jie_started_at: string; next_jie: string; next_jie_at: string }
  }
  ganzhi: {
    year: string
    month: string
    day: string
    time: string
    day_xun_exact?: string
    day_xunkong_exact?: string
    time_xun: string
    time_xunkong: string
  }
  chart: {
    dun_type: string
    yuan: string
    ju_number: number
    xunshou: string
    hidden_yi: string
    kongwang: string[]
    kongwang_palaces: number[]
    time_stem_visible: string
    zhifu: { palace: number; star: string }
    zhishi: { palace: number; door: string }
    grid_order: number[]
    palaces: PalaceData[]
  }
  warnings: string[]
}

export interface QimenEnginePayload {
  question_type: string
  question_label?: string
  question_goals?: string[]
  datetime: string
  timezone: string
  calendar_type: 'solar' | 'lunar'
  is_leap_month?: boolean
  location: {
    country: string
    city: string
  }
}

export interface QimenEngineResult {
  status: 'ok' | 'fatal_error' | 'system_pause'
  error_code?: string
  message?: string
  normalized_input?: QimenChartResponse['normalized_input']
  calendar?: QimenChartResponse['calendar']
  ganzhi?: QimenChartResponse['ganzhi']
  chart?: QimenChartResponse['chart']
  warnings?: string[]
}

export interface QimenInterpretRequest {
  userInput: QimenChartRequest
  chartJson: QimenChartResponse
  locale?: string
}

export interface QimenInterpretChunk {
  type: 'chart' | 'text' | 'error' | 'done'
  chart?: QimenChartResponse
  text?: string
  message?: string
}
