import type { TianGan, DiZhi } from '~/types/user'
import type { GongName, MainStar, AuxStar } from '~/types/zwds'

// ========== 基础常量 ==========

/** 地支顺序（紫微斗数以寅为正月起点） */
export const ZHI_ORDER: DiZhi[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']

/** 宫位顺序（以命宫为起点逆时针） */
export const GONG_ORDER: GongName[] = [
  '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
  '迁移', '交友', '事业', '田宅', '福德', '父母',
]

/** 十四正曜主星 */
export const MAIN_STARS: MainStar[] = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞',
  '天府', '太阴', '贪狼', '巨门', '天相', '天梁',
  '七杀', '破军',
]

/** 辅星列表 */
export const AUX_STARS: AuxStar[] = [
  '文昌', '文曲', '左辅', '右弼', '天魁', '天钺',
  '禄存', '擎羊', '陀罗', '火星', '铃星', '地空', '地劫',
]

/** 天干阴阳 */
export const GAN_YANG: Record<TianGan, boolean> = {
  甲: true, 乙: false, 丙: true, 丁: false, 戊: true,
  己: false, 庚: true, 辛: false, 壬: true, 癸: false,
}

// ========== 四化规则（按年干） ==========

export interface SiHuaRule {
  禄: MainStar | AuxStar
  权: MainStar | AuxStar
  科: MainStar | AuxStar
  忌: MainStar | AuxStar
}

export const SI_HUA_RULES: Record<TianGan, SiHuaRule> = {
  甲: { 禄: '廉贞', 权: '破军', 科: '武曲', 忌: '太阳' },
  乙: { 禄: '天机', 权: '天梁', 科: '紫微', 忌: '太阴' },
  丙: { 禄: '天同', 权: '天机', 科: '文昌', 忌: '廉贞' },
  丁: { 禄: '太阴', 权: '天同', 科: '天机', 忌: '巨门' },
  戊: { 禄: '贪狼', 权: '太阴', 科: '右弼', 忌: '天机' },
  己: { 禄: '武曲', 权: '贪狼', 科: '天梁', 忌: '文曲' },
  庚: { 禄: '太阳', 权: '武曲', 科: '太阴', 忌: '天同' },
  辛: { 禄: '巨门', 权: '太阳', 科: '文曲', 忌: '文昌' },
  壬: { 禄: '天梁', 权: '紫微', 科: '左辅', 忌: '武曲' },
  癸: { 禄: '破军', 权: '巨门', 科: '太阴', 忌: '贪狼' },
}

// ========== 五行局（简化：按命宫天干） ==========

/** 根据命宫天干定五行局数（简化规则） */
export function getWuXingJu(mingGongGan: TianGan): number {
  const map: Record<TianGan, number> = {
    甲: 6, 己: 6, // 火六局
    乙: 5, 庚: 5, // 土五局
    丙: 4, 辛: 4, // 金四局
    丁: 3, 壬: 3, // 木三局
    戊: 2, 癸: 2, // 水二局
  }
  return map[mingGongGan] ?? 6
}

// ========== 紫微星系（相对紫微的逆时针偏移） ==========
// 从紫微开始逆时针，每宫1颗。索引0=紫微，-1=逆时针1宫
// 空位用 null 表示

export const ZIWEI_XINGStars: { star: MainStar | null; offset: number }[] = [
  { star: '紫微', offset: 0 },
  { star: '天机', offset: -1 },
  { star: null, offset: -2 },
  { star: '太阳', offset: -3 },
  { star: '武曲', offset: -4 },
  { star: '天同', offset: -5 },
  { star: null, offset: -6 },
  { star: '廉贞', offset: -7 },
]

/** 天府星系（相对天府的顺时针偏移） */
export const TIANFU_XINGStars: { star: MainStar | null; offset: number }[] = [
  { star: '天府', offset: 0 },
  { star: '太阴', offset: 1 },
  { star: '贪狼', offset: 2 },
  { star: '巨门', offset: 3 },
  { star: '天相', offset: 4 },
  { star: '天梁', offset: 5 },
  { star: '七杀', offset: 6 },
  { star: null, offset: 7 },
  { star: '破军', offset: 8 },
  { star: null, offset: 9 },
]

// ========== 辅星安星规则 ==========

/** 文昌：从戌起子逆数到年干 */
export function getWenChangPos(yearGan: TianGan): number {
  // 戌=8, 从戌起子(0)，逆数（减）到年干
  const ganIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(yearGan)
  // 戌起子逆数：戌=子, 酉=丑, 申=寅, 未=卯, 午=辰, 巳=巳, 辰=午, 卯=未, 寅=申, 丑=酉
  return (8 - ganIndex + 12) % 12
}

/** 文曲：从辰起子顺数到年干 */
export function getWenQuPos(yearGan: TianGan): number {
  const ganIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(yearGan)
  // 辰起子顺数：辰=子, 巳=丑, 午=寅, 未=卯, 申=辰, 酉=巳, 戌=午, 亥=未, 子=申, 丑=酉
  return (2 + ganIndex) % 12
}

/** 左辅：从辰起正月顺数到生月 */
export function getZuoFuPos(lunarMonth: number): number {
  // 辰=2, 起正月(1)，顺数到生月
  return (2 + lunarMonth - 1) % 12
}

/** 右弼：从戌起正月逆数到生月 */
export function getYouBiPos(lunarMonth: number): number {
  // 戌=8, 起正月(1)，逆数到生月
  return (8 - (lunarMonth - 1) + 12) % 12
}

/** 禄存：年干决定 */
export function getLuCunPos(yearGan: TianGan): number {
  const map: Record<TianGan, number> = {
    甲: 0, 乙: 1, 丙: 3, 丁: 4, 戊: 3,
    己: 4, 庚: 6, 辛: 7, 壬: 9, 癸: 10,
  }
  return map[yearGan] ?? 0
}

/** 擎羊：禄存前一位（顺） */
export function getQingYangPos(yearGan: TianGan): number {
  return (getLuCunPos(yearGan) + 1) % 12
}

/** 陀罗：禄存前一位（逆） */
export function getTuoLuoPos(yearGan: TianGan): number {
  return (getLuCunPos(yearGan) - 1 + 12) % 12
}

/** 天魁：年干决定
 * 口诀：甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢马虎
 */
export function getTianKuiPos(yearGan: TianGan): number {
  // 丑=1(牛), 子=0(鼠), 亥=11(猪), 卯=3(兔), 午=6(马)
  const map: Record<TianGan, number> = {
    甲: 1, 乙: 0, 丙: 11, 丁: 11, 戊: 1,
    己: 0, 庚: 1, 辛: 6, 壬: 3, 癸: 3,
  }
  return map[yearGan] ?? 1
}

/** 天钺：年干决定
 * 口诀：甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢马虎
 */
export function getTianYuePos(yearGan: TianGan): number {
  // 未=7(羊), 申=8(猴), 酉=9(鸡), 巳=5(蛇), 寅=2(虎)
  const map: Record<TianGan, number> = {
    甲: 7, 乙: 8, 丙: 9, 丁: 9, 戊: 7,
    己: 8, 庚: 7, 辛: 2, 壬: 5, 癸: 5,
  }
  return map[yearGan] ?? 7
}

/** 火星：年支和时辰决定（简化：固定按年支） */
export function getHuoXingPos(yearZhi: DiZhi): number {
  const map: Record<DiZhi, number> = {
    子: 1, 丑: 3, 寅: 5, 卯: 7, 辰: 9, 巳: 11,
    午: 1, 未: 3, 申: 5, 酉: 7, 戌: 9, 亥: 11,
  }
  return map[yearZhi] ?? 1
}

/** 铃星：年支决定（简化） */
export function getLingXingPos(yearZhi: DiZhi): number {
  const map: Record<DiZhi, number> = {
    子: 10, 丑: 0, 寅: 2, 卯: 4, 辰: 6, 巳: 8,
    午: 10, 未: 0, 申: 2, 酉: 4, 戌: 6, 亥: 8,
  }
  return map[yearZhi] ?? 10
}

/** 地空：年支决定（简化：从亥起子逆数） */
export function getDiKongPos(yearZhi: DiZhi): number {
  const zhiIndex = ZHI_ORDER.indexOf(yearZhi)
  // 亥=9, 起子(10)，逆数
  return (9 - zhiIndex + 12) % 12
}

/** 地劫：年支决定（简化：从亥起子顺数） */
export function getDiJiePos(yearZhi: DiZhi): number {
  const zhiIndex = ZHI_ORDER.indexOf(yearZhi)
  // 亥=9, 起子(10)，顺数
  return (9 + zhiIndex) % 12
}

// ========== 大限起限岁数（按生年地支） ==========

export function getQiXianAge(yearZhi: DiZhi): number {
  const map: Record<DiZhi, number> = {
    子: 2, 丑: 3, 寅: 4, 卯: 5, 辰: 6, 巳: 7,
    午: 2, 未: 3, 申: 4, 酉: 5, 戌: 6, 亥: 7,
  }
  return map[yearZhi] ?? 2
}
