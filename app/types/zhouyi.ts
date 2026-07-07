export interface GuaInput {
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHourIndex: number
  query: string
  currentHour?: number
  currentMinute?: number
}

export interface GuaResult {
  benGuaId: number
  bianGuaId: number
  dongYao: number
  methodName: string
  calcDetail: string
}

export interface GuaStrategy {
  name: string
  calc(input: GuaInput): GuaResult
}

export interface GuaInfo {
  id: number
  name: string
  shangGua: number
  xiaGua: number
  meaning: string
  guaci: string
}

// ==================== 梅花易数扩展类型 ====================

export interface MeihuaResult extends GuaResult {
  /** 上卦八卦序号 1-8 */
  shangGuaId: number
  /** 下卦八卦序号 1-8 */
  xiaGuaId: number
  /** 互卦 ID */
  huGuaId: number

  // 体用（按动爻位置判定）
  tiGuaId: number
  yongGuaId: number
  tiWuxing: string
  yongWuxing: string

  // 生克判断
  shengkeRelation: string // '用生体' | '体克用' | '比和' | '用克体' | '体生用'
  shengkeResult: string   // '大吉' | '吉' | '平' | '凶' | '泄耗'

  // 季节旺衰
  seasonWuxing: string
  tiWangshuai: string
  yongWangshuai: string

  // 策略建议
  strategyType?: string
  strategyAction?: string
  strategyNextStep?: string
  jiRate?: number
  changePath?: string

  // 爻位风险
  positionRisk?: {
    coefficient: number
    riskLevel: string
    warning: string | null
  }

  // 时间层次
  timeLevels: {
    yongGua: string
    huGua: string
    bianGua: string
  }

  // 农历日期（仅时间起卦有）
  lunarDate?: {
    year: number
    month: number
    day: number
    isLeap: boolean
    dizhi: string
    dizhiNum: number
  }
}

// ==================== AI 断语结构化类型 ====================

export interface ZhouyiAiSection {
  title: string
  content: string
  icon?: string
}

export interface ZhouyiAiInterpretation {
  /** 总览/核心判断 */
  '总览': string
  /** 动爻爻辞解读 */
  '动爻解读': string
  /** 体用生克分析 */
  '体用分析': string
  /** 互卦中期发展 */
  '互卦分析': string
  /** 变卦最终结果 */
  '变卦分析': string
  /** 推断应期 */
  '应期推断': string
  /** 策略建议 */
  '策略建议': string
  /** 温馨提示/免责声明 */
  '温馨提示': string
}

// ==================== 起卦方式 ====================

export type QiguaMethod = 'time' | 'numbers' | 'character'

export interface TimeQiguaInput {
  method: 'time'
  year: number
  month: number
  day: number
  hour: number
  query: string
  gender?: 'male' | 'female'
  birthYear?: number
}

export interface NumbersQiguaInput {
  method: 'numbers'
  num1: number
  num2: number
  num3?: number
  query: string
  gender?: 'male' | 'female'
  birthYear?: number
}

export interface CharacterQiguaInput {
  method: 'character'
  char: string
  query: string
  gender?: 'male' | 'female'
  birthYear?: number
}

export type QiguaInput = TimeQiguaInput | NumbersQiguaInput | CharacterQiguaInput
