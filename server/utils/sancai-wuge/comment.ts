/**
 * 三才五格候选的本地极短点评 —— 确定性模板，零请求。
 *
 * 用途：备选名录（4 个次推）的一句点评；主推候选在 AI 点评失败时的兜底文案。
 * 调性：克制、庄重，不调侃（起名是给孩子定终身的事）。
 * 只基于本地已算好的五格吉凶 / 三才 / 整体运势，不引入任何随机或外部数据。
 */

import type { SancaiWugeCandidate } from '~/types/sancai-wuge'

const GRID_ORDER = ['tiange', 'renge', 'dige', 'waige', 'zongge'] as const

/** 找出五格里最弱的一格（rank 最低；并列时按天→人→地→外→总顺序取前者） */
function weakestGrid(candidate: SancaiWugeCandidate) {
  const rank = (f: string) =>
    f.includes('大吉') ? 4 : f.includes('半吉') ? 2 : f.includes('吉') ? 3 : f.includes('大凶') ? 0 : 1
  let weakest = candidate.grids.renge
  let min = 99
  for (const key of GRID_ORDER) {
    const g = candidate.grids[key]
    const r = rank(g.fortune)
    if (r < min) {
      min = r
      weakest = g
    }
  }
  return weakest
}

/** 一句极短点评（≤ ~28 字），确定性生成 */
export function buildBriefComment(candidate: SancaiWugeCandidate): string {
  const { overallLuck, sancai, grids } = candidate

  // 五格全吉、三才亦吉：最高评价
  if ((overallLuck === '上吉' || overallLuck === '吉') && (sancai.luck === '大吉' || sancai.luck === '吉')) {
    return `五格${overallLuck}，三才${sancai.combo}${sancai.luck}，人格${grids.renge.fortune}主运，难得好名。`
  }
  // 五格吉但三才平/凶：肯定五格，点到三才
  if (overallLuck === '上吉' || overallLuck === '吉' || overallLuck === '中吉') {
    return `五格${overallLuck}，人格${grids.renge.fortune}，唯三才${sancai.combo}${sancai.luck}，可作佳选。`
  }
  // 有明显弱格：点出最弱格，建议斟酌
  const weak = weakestGrid(candidate)
  if (overallLuck === '平') {
    return `五格平顺，${weak.name}${weak.fortune}稍弱，三才${sancai.luck}，中规中矩之选。`
  }
  // 需谨慎
  return `${weak.name}${weak.fortune}偏弱，三才${sancai.combo}${sancai.luck}，宜再斟酌或作备选。`
}
