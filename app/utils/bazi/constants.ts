export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

export const GAN_WUXING: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}

export const GAN_YANG: Record<string, boolean> = {
  甲: true, 乙: false, 丙: true, 丁: false, 戊: true,
  己: false, 庚: true, 辛: false, 壬: true, 癸: false,
}

export const ZHI_WUXING: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
}

export const ZHI_YANG: Record<string, boolean> = {
  子: true, 丑: false, 寅: true, 卯: false, 辰: true, 巳: false,
  午: true, 未: false, 申: true, 酉: false, 戌: true, 亥: false,
}

export const ZHI_CANGGAN: Record<string, { gan: string; type: '本气' | '中气' | '余气' }[]> = {
  子: [{ gan: '癸', type: '本气' }],
  丑: [{ gan: '己', type: '本气' }, { gan: '癸', type: '中气' }, { gan: '辛', type: '余气' }],
  寅: [{ gan: '甲', type: '本气' }, { gan: '丙', type: '中气' }, { gan: '戊', type: '余气' }],
  卯: [{ gan: '乙', type: '本气' }],
  辰: [{ gan: '戊', type: '本气' }, { gan: '乙', type: '中气' }, { gan: '癸', type: '余气' }],
  巳: [{ gan: '丙', type: '本气' }, { gan: '庚', type: '中气' }, { gan: '戊', type: '余气' }],
  午: [{ gan: '丁', type: '本气' }, { gan: '己', type: '中气' }],
  未: [{ gan: '己', type: '本气' }, { gan: '丁', type: '中气' }, { gan: '乙', type: '余气' }],
  申: [{ gan: '庚', type: '本气' }, { gan: '壬', type: '中气' }, { gan: '戊', type: '余气' }],
  酉: [{ gan: '辛', type: '本气' }],
  戌: [{ gan: '戊', type: '本气' }, { gan: '辛', type: '中气' }, { gan: '丁', type: '余气' }],
  亥: [{ gan: '壬', type: '本气' }, { gan: '甲', type: '中气' }],
}

export const WUXING_SHENG: Record<string, string> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
}

export const WUXING_KE: Record<string, string> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
}

export function getShiShen(riGan: string, targetGan: string): string {
  const riWx = GAN_WUXING[riGan]!
  const tgWx = GAN_WUXING[targetGan]!
  const same = GAN_YANG[riGan] === GAN_YANG[targetGan]
  if (riWx === tgWx) return same ? '比肩' : '劫财'
  if (WUXING_SHENG[riWx] === tgWx) return same ? '食神' : '伤官'
  if (WUXING_KE[riWx] === tgWx) return same ? '偏财' : '正财'
  if (WUXING_SHENG[tgWx] === riWx) return same ? '偏印' : '正印'
  if (WUXING_KE[tgWx] === riWx) return same ? '七杀' : '正官'
  return '未知'
}

// 日上起时法（五鼠遁元）：子时天干在 TIAN_GAN 中的索引
export const ZI_SHI_GAN_INDEX: Record<string, number> = {
  甲: 0, 己: 0, 乙: 2, 庚: 2, 丙: 4, 辛: 4, 丁: 6, 壬: 6, 戊: 8, 癸: 8,
}

// 年上起月法（五虎遁年）：寅月天干在 TIAN_GAN 中的索引
export const YIN_MONTH_GAN_INDEX: Record<string, number> = {
  甲: 2, 己: 2, 乙: 4, 庚: 4, 丙: 6, 辛: 6, 丁: 8, 壬: 8, 戊: 0, 癸: 0,
}

// 月令地支（以节为界，从寅月=正月开始）
export const MONTH_ZHI = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'] as const
