/**
 * 太乙神数排盘类型定义
 *
 * 说明：
 * - 宫位编号采用太乙九宫：1 坎、2 坤、3 震、4 巽、5 中、6 乾、7 兑、8 艮、9 离。
 * - 对外输出时中五宫寄于坤二宫，因此最终神将宫位落在 1-8 宫。
 * - 十六神顺序固定为：太乙、摄提、轩辕、招摇、天符、青龙、咸池、太阴、
 *   天一、地一、文昌、太阳、神光、迁神、死武、斗杓。
 */

/** 阴阳局 */
export type TaiyiYinYang = '阳' | '阴'

/** 超神 / 接气状态 */
export type ChaoShenJieQiState = '超神' | '接气'

/** 问事类型 */
export type QuestionType = 'career' | 'wealth' | 'love' | 'health' | 'travel' | 'other'

/** 单盘层级 */
export type PanLevel = 'year' | 'month' | 'day' | 'hour'

/** 神将吉凶属性 */
export type GodNature = '吉' | '凶' | '中'

/** 单神将信息 */
export interface TaiyiGod {
  /** 神将名 */
  name: string
  /** 所在宫位（1-8，中五寄坤二） */
  palace: number
  /** 吉凶属性 */
  nature: GodNature
}

/** 主要神将宫位 */
export interface TaiyiKeySpirits {
  /** 太乙所在宫 */
  taiyiGong: number
  /** 计神所在宫（太乙对冲宫） */
  jiShenGong: number
  /** 文昌所在宫 */
  wenChangGong: number
  /** 天目所在宫 */
  tianMuGong: number
  /** 地目所在宫（天目对冲宫） */
  diMuGong: number
}

/** 超神接气信息 */
export interface ChaoShenJieQiInfo {
  /** 当前状态 */
  state: ChaoShenJieQiState
  /** 偏移量（年），当前所在半段内的 0-based 年偏移 */
  offset: number
  /** 当前所在 72 年周期位置（1-72） */
  cyclePosition: number
  /** 当前所在一局内的年份位置（1-4） */
  juYearPosition: number
}

/** 单盘数据 */
export interface TaiyiChart {
  /** 盘层级 */
  level: PanLevel
  /** 层级中文名 */
  levelLabel: string
  /** 太乙所在宫（1-8，中五寄坤二） */
  taiyiGong: number
  /** 阴阳局 */
  yinYangJu: TaiyiYinYang
  /** 局数（1-9） */
  juNumber: number
  /** 超神接气信息 */
  chaoShenJieQi: ChaoShenJieQiInfo
  /** 十六神全排（length === 16） */
  gods: TaiyiGod[]
  /** 主要神将宫位 */
  keySpirits: TaiyiKeySpirits
}

/** 四柱干支 */
export interface GanZhiInfo {
  /** 年柱 */
  year: string
  /** 月柱 */
  month: string
  /** 日柱 */
  day: string
  /** 时柱 */
  hour: string
}

/** 太乙积年信息 */
export interface AccumulatedYearsInfo {
  /** 目标公元年份 */
  year: number
  /** 积年数（以公元前 2696 年甲子年为基元第 1 年） */
  accumulatedYears: number
  /** 基元年说明 */
  baseYearNote: string
}

/** 完整太乙排盘结果 */
export interface TaiyiChartResult {
  /** 输入参数 */
  input: {
    birthYear: number
    birthMonth: number
    birthDay: number
    birthHour: number
    question: string
  }
  /** 四柱干支 */
  pillars: GanZhiInfo
  /** 积年信息 */
  accumulatedYears: AccumulatedYearsInfo
  /** 年局 */
  yearChart: TaiyiChart
  /** 月局 */
  monthChart: TaiyiChart
  /** 日局 */
  dayChart: TaiyiChart
  /** 时局 */
  hourChart: TaiyiChart
}

/** calc 端点请求体 */
export interface TaiyiCalcRequest {
  /** 出生/占问公历年 */
  birthYear: number
  /** 出生/占问公历月（1-12） */
  birthMonth: number
  /** 出生/占问公历日（1-31） */
  birthDay: number
  /** 出生/占问公历时（0-23） */
  birthHour: number
  /** 所问事项 */
  question: string
}

/** reading 端点请求体 */
export interface TaiyiReadingRequest {
  /** 完整排盘结果 */
  chart: TaiyiChartResult
  /** 所问事项 */
  question: string
  /** 问事类型 */
  questionType: QuestionType
}
