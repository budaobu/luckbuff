import type { TianGan, DiZhi } from './user'

/** 宫位名称 */
export type GongName =
  | '命宫' | '兄弟' | '夫妻' | '子女' | '财帛' | '疾厄'
  | '迁移' | '交友' | '事业' | '田宅' | '福德' | '父母'

/** 单宫数据结构 */
export interface ZwdsGong {
  name: GongName
  zhi: DiZhi
  /** 主星列表（按优先级排序） */
  mainStars: MainStar[]
  /** 辅星列表 */
  auxStars: AuxStar[]
  /** 四化标记 */
  siHua: SiHuaItem[]
  /** 是否为命宫 */
  isMing?: boolean
  /** 是否为身宫 */
  isShen?: boolean
  /** 是否为当前大限 */
  isCurrentDaXian?: boolean
}

/** 十四正曜主星 */
export type MainStar =
  | '紫微' | '天机' | '太阳' | '武曲' | '天同' | '廉贞'
  | '天府' | '太阴' | '贪狼' | '巨门' | '天相' | '天梁'
  | '七杀' | '破军'

/** 辅星 */
export type AuxStar =
  | '文昌' | '文曲' | '左辅' | '右弼' | '天魁' | '天钺'
  | '禄存' | '擎羊' | '陀罗' | '火星' | '铃星' | '地空' | '地劫'

/** 四化项 */
export interface SiHuaItem {
  type: '禄' | '权' | '科' | '忌'
  star: MainStar | AuxStar
}

/** 大限 */
export interface ZwdsDaXian {
  index: number
  gongName: GongName
  gongZhi: DiZhi
  ageRange: [number, number]
  mainStars: MainStar[]
}

/** 命盘完整数据 */
export interface ZwdsChart {
  /** 十二宫（按地支顺序：寅卯辰巳午未申酉戌亥子丑） */
  gongs: ZwdsGong[]
  /** 命宫 */
  mingGong: ZwdsGong
  /** 身宫 */
  shenGong: ZwdsGong
  /** 大限列表 */
  daXians: ZwdsDaXian[]
  /** 年干 */
  yearGan: TianGan
  /** 年支 */
  yearZhi: DiZhi
  /** 性别 */
  gender: 'male' | 'female'
  /** 当前大限 */
  currentDaXian: ZwdsDaXian | null
  /** 当前年龄 */
  currentAge: number
  /** 五行局 */
  wuxingJu: number
  /** 生日（农历近似） */
  lunarDay: number
  /** 生月（农历，寅=1） */
  lunarMonth: number
}

// === AI 解读 ===
// 紫微斗数 AI 解读采用 markdown 流式输出，由前端实时分段解析渲染为卡片
// 不再使用固定的 JSON 结构化类型，以支持更自然、更丰富的解读表达
export interface ZwdsAiStreamState {
  content: string
  streaming: boolean
  started: boolean
  error: string | null
}
