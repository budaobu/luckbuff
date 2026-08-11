/**
 * 三才五格起名 —— 候选结果共享类型
 * server 引擎与页面/海报组件共用，保证海报与结果列表用同一份结构化数据。
 */

/** 五行（三才配置用） */
export type SancaiWuxing = '木' | '火' | '土' | '金' | '水'

/** 81 数理 / 三才 吉凶档位 */
export type SancaiFortuneTier = '大吉' | '吉' | '半吉' | '凶' | '大凶'

/** 五格之一 */
export interface SancaiWugeGrid {
  key: 'tiange' | 'renge' | 'dige' | 'waige' | 'zongge'
  /** 中文格名（天格/人格/…），server 给，海报直接展示 */
  name: string
  value: number
  fortune: SancaiFortuneTier
  /** 81 数理断语 */
  fortuneDesc: string
}

/** 三才配置 */
export interface SancaiConfig {
  tian: SancaiWuxing
  ren: SancaiWuxing
  di: SancaiWuxing
  /** 组合串，如「木火土」 */
  combo: string
  luck: SancaiFortuneTier
  desc: string
}

/** 姓名单字（含姓与名，按顺序） */
export interface SancaiWugeChar {
  char: string
  strokes: number
  wuxing: SancaiWuxing
  meaning: string
}

/** 单个候选名 */
export interface SancaiWugeCandidate {
  /** 含姓全名 */
  fullName: string
  /** 名（不含姓） */
  givenName: string
  pinyin: string
  chars: SancaiWugeChar[]
  grids: {
    tiange: SancaiWugeGrid
    renge: SancaiWugeGrid
    dige: SancaiWugeGrid
    waige: SancaiWugeGrid
    zongge: SancaiWugeGrid
  }
  sancai: SancaiConfig
  /** 五格整体运势：上吉/吉/中吉/平/需谨慎 */
  overallLuck: string
  /** 综合评分 0-100 */
  score: number
  /** 等级：极佳/优秀/良好/中等/一般 */
  grade: string
  /** 本地模板一句极短点评（次推展示；主推作 AI 失败兜底） */
  briefComment: string
}

/** 起名结果：已排序截断（前 5 个），topName 为评分最高者 */
export interface SancaiWugeNamingResult {
  surname: string
  gender: 'male' | 'female'
  candidates: SancaiWugeCandidate[]
  topName: SancaiWugeCandidate | null
}
