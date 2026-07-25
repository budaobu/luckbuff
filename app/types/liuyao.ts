// ============================================================
// 六爻世界杯预测模块类型定义
// ============================================================

/** 爻值：6=老阴(动)、7=少阳、8=少阴、9=老阳(动) */
export type LineValue = 6 | 7 | 8 | 9

/** 单个爻的完整信息 */
export interface LineInfo {
  position: number // 1~6，从下到上
  value: LineValue
  isMoving: boolean
  label: '初爻' | '二爻' | '三爻' | '四爻' | '五爻' | '上爻'
}

/** 地理位置 */
export interface GeoLocation {
  city?: string
  longitude?: number
  latitude?: number
  timezone?: string
}

/** 摇卦输入 */
export interface LiuYaoInput {
  line_values: LineValue[]
  cast_datetime: string // ISO 8601
  location?: GeoLocation
  subject_home: string // 主队ID，如 "BRA"
  subject_away: string // 客队ID，如 "MAR"
}

/** 时空上下文 */
export interface TemporalContext {
  月建: string
  日辰: string
  时辰: string
  旬空: string
  六神: string[]
  true_solar_calibration?: {
    longitude: number
    offset_minutes: number
    adjusted_datetime: string
  }
  lunar?: {
    date_text?: string
    year_ganzhi?: string
    month_ganzhi?: string
    day_ganzhi?: string
    time_ganzhi?: string
    month_build?: string
    day_xunkong_text?: string
    jieqi?: string | null
  }
}

/** 引擎单行爻完整信息（纳甲/六亲/六神/旺衰） */
export interface LiuyaoEngineLine {
  position: number // 1~6，从下到上
  label: string
  value: LineValue
  state: string // 少阳/少阴/老阳/老阴
  polarity: 'yin' | 'yang'
  moving: boolean
  najia_stem?: string
  najia_branch?: string
  najia_ganzhi?: string
  branch_element?: string // 五行：木火土金水
  relation?: string // 六亲：父母/兄弟/妻财/官鬼/子孙
  shi?: boolean
  ying?: boolean
  role?: '世' | '应' | null
  six_spirit?: string
  temporal?: {
    month_effect?: { kind: string; label: string; score: number } | null
    day_effect?: { kind: string; label: string; score: number } | null
    voided_by_day_xunkong?: boolean
    score?: number
    notes?: string[]
  }
}

/** 卦宫归属 */
export interface LiuyaoPalaceAssignment {
  palace?: string
  palace_element?: string
  sequence_label?: string
  shi_line?: number
  ying_line?: number
}

/** 卦象基础信息（引擎原始字段） */
export interface LiuyaoHexagramInfo {
  number?: number // 六十四卦序（与 zhouyi LIUSHISI_GUA id 一致）
  name?: string
  upper_trigram?: string
  lower_trigram?: string
  upper_element?: string
  lower_element?: string
}

/** 动爻断卦规则 */
export interface LiuyaoFocusRule {
  moving_count?: number
  strategy?: string
  primary_targets?: string[]
  secondary_targets?: string[]
  guidance?: string
}

/** 卦象摘要 */
export interface HexagramSummary {
  本卦: string
  变卦: string
  互卦: string
  世爻位: number
  应爻位: number
}

/** 排盘结果（后端返回） */
export interface LiuYaoResult {
  status: 'ok' | 'fatal_error' | 'system_pause'
  error_code?: string
  label_order_input?: string
  label_order_source?: string
  diagram_top_down?: string
  lines_top_down?: LineInfo[]
  transformed_lines_top_down?: LineInfo[]
  temporal_context?: TemporalContext
  temporal_summary?: string
  hexagram?: HexagramSummary
  subject_home?: string
  subject_away?: string
  analysis_brief?: string
  seeking_context?: {
    description?: string
    lastSeenTime?: string
    lastSeenPlace?: string
    lostItemDesc?: string
    relationship?: string
  }
  // ===== 引擎原始排盘数据（报告组件用） =====
  moving_lines?: number[]
  palace_assignment?: LiuyaoPalaceAssignment
  focus_rule?: LiuyaoFocusRule
  primary_hexagram?: LiuyaoHexagramInfo
  transformed_hexagram?: LiuyaoHexagramInfo
  nuclear_hexagram?: LiuyaoHexagramInfo
  /** 带纳甲/六亲/六神/旺衰的完整爻信息（自上而下） */
  lines_detail_top_down?: LiuyaoEngineLine[]
  transformed_lines_detail_top_down?: LiuyaoEngineLine[]
}

// ============================================================
// 赛事数据类型
// ============================================================

/** 世界杯队伍 */
export interface WorldCupTeam {
  id: string
  name: string
  nameEn?: string
  flag?: string // emoji flag
  host?: boolean
  qualified_via?: string
}

/** 小组 */
export interface WorldCupGroup {
  name: string
  teams: WorldCupTeam[]
}

/** 淘汰赛对阵 */
export interface KnockoutMatch {
  id: string
  stage: string
  home: WorldCupTeam
  away: WorldCupTeam
  scheduled_at: string
  venue: string
  finished: boolean
  winner: string | null
}

/** 赛事数据结构 */
export interface TournamentData {
  tournament: string
  format: {
    teams: number
    groups: number
    matches: number
    advance_per_group: string
    knockout_entry: string
  }
  groups: Record<string, WorldCupTeam[]>
}

/** bracket.json */
export interface BracketData {
  updated_at: string
  stage: string
  matches: KnockoutMatch[]
}

// ============================================================
// 组件 Props 类型
// ============================================================

/** 赛事选择器 Props */
export interface TournamentPickerProps {
  groups: Record<string, WorldCupTeam[]>
  eliminated?: string[] // 已淘汰的队伍 ID 列表
}

/** 摇卦工作台 Props */
export interface TossWorkbenchProps {
  maxTosses?: number
  onComplete?: (values: LineValue[]) => void
}

/** 世应标签 */
export interface SubjectBinding {
  home: WorldCupTeam | null
  away: WorldCupTeam | null
}

// ============================================================
// AI 流式状态
// ============================================================

export interface AiStreamState {
  content: string
  streaming: boolean
  started: boolean
  error: string | null
}
