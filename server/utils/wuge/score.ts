/**
 * 三才五格综合评分 —— sancai-wuge 专用打分
 *
 * 与 baby-naming/engine.ts 的六维打分不同：本工具只讲三才五格，
 * 不含八字喜用/音律/字形/风格等维度。分数完全由「五格吉凶 + 三才配置」聚合。
 * wugeFortuneRank / wugeOverallLuck / gradeFromScore 为 engine.ts 同思路的纯函数副本，
 * 复制至此而非 import，避免改动耦合八字的 engine.ts、保持两个工具独立演进。
 */

import type { SancaiFortune, SancaiLuck } from './sancai'
import type { SancaiWugeGrid } from '~/types/sancai-wuge'

/** 吉凶档位 → 数值rank：大吉4 / 吉3 / 半吉2 / 凶1 / 大凶0 */
export function wugeFortuneRank(fortune: string): number {
  if (fortune.includes('大吉')) return 4
  if (fortune.includes('半吉') || fortune.includes('平')) return 2
  if (fortune.includes('吉')) return 3
  if (fortune.includes('大凶')) return 0
  return 1 // 凶
}

/** 五格整体运势档：上吉/吉/中吉/平/需谨慎 */
export function wugeOverallLuck(fortunes: string[]): string {
  const ranks = fortunes.map(wugeFortuneRank)
  const badCount = ranks.filter(r => r <= 1).length // 凶或大凶
  const goodCount = ranks.filter(r => r >= 3).length // 吉或大吉
  if (badCount === 0 && goodCount >= 4) return '上吉'
  if (badCount === 0 && goodCount >= 3) return '吉'
  if (badCount <= 1 && goodCount >= 3) return '中吉'
  if (badCount <= 1) return '平'
  return '需谨慎'
}

/** 综合分 → 等级（沿用全站起名工具的阈值口径） */
export function gradeFromScore(score: number): string {
  if (score >= 92) return '极佳'
  if (score >= 85) return '优秀'
  if (score >= 75) return '良好'
  if (score >= 65) return '中等'
  return '一般'
}

/** 评分传入的单格：直接用共享的 SancaiWugeGrid（fortune 已是吉凶字符串） */
export type ScoreGridInput = Pick<SancaiWugeGrid, 'fortune'>

export interface ScoreInput {
  tiange: ScoreGridInput
  renge: ScoreGridInput
  dige: ScoreGridInput
  waige: ScoreGridInput
  zongge: ScoreGridInput
  sancai: SancaiFortune
}

const SANCAI_RANK: Record<SancaiLuck, number> = {
  大吉: 1.0,
  吉: 0.8,
  半吉: 0.55,
  凶: 0.25,
  大凶: 0,
}

/**
 * 综合评分（0-100）：
 *  - 五格吉凶  60 分（人格/总格权重 1.5，天/地/外 1.0，按 rank/4 归一）
 *  - 三才配置  30 分（按吉凶档位映射）
 *  - 人格·总格 10 分（传统认为人格主一生主运、总格主中后运，单列加权）
 */
export function scoreCandidate(grids: ScoreInput): number {
  const rank = (g: ScoreGridInput) => wugeFortuneRank(g.fortune)

  // 五格 60：人格/总格权重 1.5
  const weighted: Array<[number, number]> = [
    [rank(grids.tiange), 1.0],
    [rank(grids.renge), 1.5],
    [rank(grids.dige), 1.0],
    [rank(grids.waige), 1.0],
    [rank(grids.zongge), 1.5],
  ]
  const sum = weighted.reduce((acc, [r, w]) => acc + (r / 4) * w, 0)
  const weightTotal = weighted.reduce((acc, [, w]) => acc + w, 0)
  const wugeScore = Math.round((sum / weightTotal) * 60)

  // 三才 30
  const sancaiScore = Math.round((SANCAI_RANK[grids.sancai.luck] ?? 0) * 30)

  // 人格·总格 10：各 0-5，吉(3)及以上记满 5
  const bonus = (r: number) => (r >= 3 ? 5 : r)
  const bonusScore = Math.min(10, bonus(rank(grids.renge)) + bonus(rank(grids.zongge)))

  return Math.max(0, Math.min(100, wugeScore + sancaiScore + bonusScore))
}
