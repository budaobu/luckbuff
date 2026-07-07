// ============================================================
// 奇门遁甲常量
// ============================================================

// 天干（含三奇六仪）
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const DI_YI_LIU_YI = ['戊', '己', '庚', '辛', '壬', '癸'] as const
export const SAN_QI = ['乙', '丙', '丁'] as const
export const PAN_GAN_ORDER: string[] = [...DI_YI_LIU_YI, ...SAN_QI]

// 地支
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

// 八门
export const BA_MEN: string[] = ['休门', '死门', '伤门', '杜门', '景门', '惊门', '开门', '生门']
// 按洛书序 1→8→3→4→9→2→7→6 排列（跳过中5）
export const BA_MEN_ORDER: string[] = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门']

// 九星（含天禽寄坤2）
export const JIU_XING: string[] = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英']

// 八神
export const BA_SHEN: string[] = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天']

// 洛书九宫序号（视觉排列 南上北下）
// 4  9  2
// 3  5  7
// 8  1  6
export const LUO_SHU_GRID: number[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
]

// 洛书飞布顺序（阳遁顺飞）
export const LUO_SHU_SHUN: number[] = [1, 8, 3, 4, 9, 2, 7, 6]

// 洛书逆飞顺序（阴遁逆飞）
export const LUO_SHU_NI: number[] = [1, 6, 7, 2, 9, 4, 3, 8]

// 九宫方位名称
export const GONG_DIRECTION: Record<number, string> = {
  1: '北',
  2: '西南',
  3: '东',
  4: '东南',
  5: '中',
  6: '西北',
  7: '西',
  8: '东北',
  9: '南',
}

export const GONG_NAME: Record<number, string> = {
  1: '坎',
  2: '坤',
  3: '震',
  4: '巽',
  5: '中',
  6: '乾',
  7: '兑',
  8: '艮',
  9: '离',
}

// 八门吉凶分类
export const MEN_JI: string[] = ['生门', '开门', '休门']
export const MEN_PING: string[] = ['景门', '杜门']
export const MEN_XIONG: string[] = ['死门', '惊门', '伤门']

// 九星固定地盘位置（宫号）
export const XING_DI_PAN: Record<string, number> = {
  '天蓬': 1,
  '天芮': 2,
  '天冲': 3,
  '天辅': 4,
  '天禽': 5,
  '天心': 6,
  '天柱': 7,
  '天任': 8,
  '天英': 9,
}

// 八门固定地盘位置（宫号）
export const MEN_DI_PAN: Record<string, number> = {
  '休门': 1,
  '死门': 2,
  '伤门': 3,
  '杜门': 4,
  '景门': 9,
  '惊门': 7,
  '开门': 6,
  '生门': 8,
}

// 天干序号 0-based
export const GAN_INDEX: Record<string, number> = {
  '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
  '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9,
}

// 地支序号 0-based
export const ZHI_INDEX: Record<string, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11,
}

// 节气数据：名称、公历月份、公历日期（均值）、局数（阳遁上中下元）
export interface JieqiInfo {
  name: string
  month: number
  day: number
  yangDun: [number, number, number] // 上元、中元、下元
  yinDun: [number, number, number]
  isYang: boolean // 阳遁节气还是阴遁节气
}

export const JIEQI_TABLE: JieqiInfo[] = [
  // 冬至 - 夏至：阳遁
  { name: '冬至', month: 12, day: 21, yangDun: [1, 7, 4], yinDun: [0, 0, 0], isYang: true },
  { name: '小寒', month: 1, day: 5, yangDun: [2, 8, 5], yinDun: [0, 0, 0], isYang: true },
  { name: '大寒', month: 1, day: 20, yangDun: [3, 9, 6], yinDun: [0, 0, 0], isYang: true },
  { name: '立春', month: 2, day: 4, yangDun: [8, 5, 2], yinDun: [0, 0, 0], isYang: true },
  { name: '雨水', month: 2, day: 19, yangDun: [9, 6, 3], yinDun: [0, 0, 0], isYang: true },
  { name: '惊蛰', month: 3, day: 5, yangDun: [1, 7, 4], yinDun: [0, 0, 0], isYang: true },
  { name: '春分', month: 3, day: 20, yangDun: [3, 9, 6], yinDun: [0, 0, 0], isYang: true },
  { name: '清明', month: 4, day: 5, yangDun: [4, 1, 7], yinDun: [0, 0, 0], isYang: true },
  { name: '谷雨', month: 4, day: 20, yangDun: [5, 2, 8], yinDun: [0, 0, 0], isYang: true },
  { name: '立夏', month: 5, day: 5, yangDun: [4, 1, 7], yinDun: [0, 0, 0], isYang: true },
  { name: '小满', month: 5, day: 21, yangDun: [5, 2, 8], yinDun: [0, 0, 0], isYang: true },
  { name: '芒种', month: 6, day: 6, yangDun: [6, 3, 9], yinDun: [0, 0, 0], isYang: true },
  // 夏至 - 冬至：阴遁
  { name: '夏至', month: 6, day: 21, yangDun: [0, 0, 0], yinDun: [9, 3, 6], isYang: false },
  { name: '小暑', month: 7, day: 7, yangDun: [0, 0, 0], yinDun: [8, 2, 5], isYang: false },
  { name: '大暑', month: 7, day: 23, yangDun: [0, 0, 0], yinDun: [7, 1, 4], isYang: false },
  { name: '立秋', month: 8, day: 7, yangDun: [0, 0, 0], yinDun: [2, 5, 8], isYang: false },
  { name: '处暑', month: 8, day: 23, yangDun: [0, 0, 0], yinDun: [1, 4, 7], isYang: false },
  { name: '白露', month: 9, day: 7, yangDun: [0, 0, 0], yinDun: [9, 3, 6], isYang: false },
  { name: '秋分', month: 9, day: 23, yangDun: [0, 0, 0], yinDun: [7, 1, 4], isYang: false },
  { name: '寒露', month: 10, day: 8, yangDun: [0, 0, 0], yinDun: [6, 9, 3], isYang: false },
  { name: '霜降', month: 10, day: 23, yangDun: [0, 0, 0], yinDun: [5, 8, 2], isYang: false },
  { name: '立冬', month: 11, day: 7, yangDun: [0, 0, 0], yinDun: [6, 9, 3], isYang: false },
  { name: '小雪', month: 11, day: 22, yangDun: [0, 0, 0], yinDun: [5, 8, 2], isYang: false },
  { name: '大雪', month: 12, day: 7, yangDun: [0, 0, 0], yinDun: [4, 7, 1], isYang: false },
]

// 六十甲子
export const JIAZI_60: string[] = (() => {
  const result: string[] = []
  for (let i = 0; i < 60; i++) {
    result.push(TIAN_GAN[i % 10]! + DI_ZHI[i % 12]!)
  }
  return result
})()

// 旬首（每旬第一个是甲或己）
export const XUN_SHOU: string[] = [
  '甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅',
]

// 地盘干硬编码查表
// 阳遁：从坎1宫开始按洛书序顺布戊己庚辛壬癸丁丙乙（跳5）
// 阴遁：从坎1宫开始按洛书序逆布戊己庚辛壬癸丁丙乙（跳5）
// 格式: { 局数: { 宫号: 干 } }
// 阳遁1-9局
export const YANG_DUN_DI_PAN: Record<number, Record<number, string>> = {
  1: { 1: '戊', 8: '己', 3: '庚', 4: '辛', 9: '壬', 2: '癸', 7: '丁', 6: '丙', 5: '乙' },
  2: { 1: '己', 8: '庚', 3: '辛', 4: '壬', 9: '癸', 2: '丁', 7: '丙', 6: '乙', 5: '戊' },
  3: { 1: '庚', 8: '辛', 3: '壬', 4: '癸', 9: '丁', 2: '丙', 7: '乙', 6: '戊', 5: '己' },
  4: { 1: '辛', 8: '壬', 3: '癸', 4: '丁', 9: '丙', 2: '乙', 7: '戊', 6: '己', 5: '庚' },
  5: { 1: '壬', 8: '癸', 3: '丁', 4: '丙', 9: '乙', 2: '戊', 7: '己', 6: '庚', 5: '辛' },
  6: { 1: '癸', 8: '丁', 3: '丙', 4: '乙', 9: '戊', 2: '己', 7: '庚', 6: '辛', 5: '壬' },
  7: { 1: '丁', 8: '丙', 3: '乙', 4: '戊', 9: '己', 2: '庚', 7: '辛', 6: '壬', 5: '癸' },
  8: { 1: '丙', 8: '乙', 3: '戊', 4: '己', 9: '庚', 2: '辛', 7: '壬', 6: '癸', 5: '丁' },
  9: { 1: '乙', 8: '戊', 3: '己', 4: '庚', 9: '辛', 2: '壬', 7: '癸', 6: '丁', 5: '丙' },
}

// 阴遁1-9局
export const YIN_DUN_DI_PAN: Record<number, Record<number, string>> = {
  1: { 1: '戊', 6: '己', 7: '庚', 2: '辛', 9: '壬', 4: '癸', 3: '丁', 8: '丙', 5: '乙' },
  2: { 1: '己', 6: '庚', 7: '辛', 2: '壬', 9: '癸', 4: '丁', 3: '丙', 8: '乙', 5: '戊' },
  3: { 1: '庚', 6: '辛', 7: '壬', 2: '癸', 9: '丁', 4: '丙', 3: '乙', 8: '戊', 5: '己' },
  4: { 1: '辛', 6: '壬', 7: '癸', 2: '丁', 9: '丙', 4: '乙', 3: '戊', 8: '己', 5: '庚' },
  5: { 1: '壬', 6: '癸', 7: '丁', 2: '丙', 9: '乙', 4: '戊', 3: '己', 8: '庚', 5: '辛' },
  6: { 1: '癸', 6: '丁', 7: '丙', 2: '乙', 9: '戊', 4: '己', 3: '庚', 8: '辛', 5: '壬' },
  7: { 1: '丁', 6: '丙', 7: '乙', 2: '戊', 9: '己', 4: '庚', 3: '辛', 8: '壬', 5: '癸' },
  8: { 1: '丙', 6: '乙', 7: '戊', 2: '己', 9: '庚', 4: '辛', 3: '壬', 8: '癸', 5: '丁' },
  9: { 1: '乙', 6: '戊', 7: '己', 2: '庚', 9: '辛', 4: '壬', 3: '癸', 8: '丁', 5: '丙' },
}
