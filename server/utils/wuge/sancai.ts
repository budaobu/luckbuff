/**
 * 三才配置判定 —— 五格剖象法的「天·人·地」三才五行生克吉凶
 *
 * 数据来源：传统姓名学三才配置规则的可判定简化版。
 * 天格/人格/地格的个位数映射五行，再按三者生克关系定吉凶档位。
 * 规则函数而非 125 组（5^3）穷举表：代码短、可测试、确定性，
 * 需要更精细时可在本文件单点替换为查表。
 */

export type Wuxing5 = '木' | '火' | '土' | '金' | '水'
export type SancaiLuck = '大吉' | '吉' | '半吉' | '凶' | '大凶'

/** 格数（个位）→ 五行：1-2 木，3-4 火，5-6 土，7-8 金，9-0 水 */
export function digitToWuxing(gridValue: number): Wuxing5 {
  const d = Math.abs(gridValue) % 10
  if (d === 1 || d === 2) return '木'
  if (d === 3 || d === 4) return '火'
  if (d === 5 || d === 6) return '土'
  if (d === 7 || d === 8) return '金'
  return '水' // 9, 0
}

/** 五行相生：木生火、火生土、土生金、金生水、水生木 */
const SHENG: Record<Wuxing5, Wuxing5> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
/** 五行相克：木克土、土克水、水克火、火克金、金克木 */
const KE: Record<Wuxing5, Wuxing5> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

function sheng(a: Wuxing5, b: Wuxing5): boolean {
  return SHENG[a] === b
}
function ke(a: Wuxing5, b: Wuxing5): boolean {
  return KE[a] === b
}

export interface SancaiFortune {
  luck: SancaiLuck
  desc: string
}

/**
 * 三才组合吉凶判定。
 *
 * 只看相邻两对关系（天↔人、人↔地），统计相生/相克数：
 *  - 双相生（含连续相生链）→ 大吉
 *  - 一相生、另一对不比和亦不克 → 吉
 *  - 一相生一相克，或两对皆比和 → 半吉
 *  - 一相克另一对无关 / 比和 → 凶
 *  - 双相克（三才相战）→ 大凶
 */
export function sancaiFortune(tian: Wuxing5, ren: Wuxing5, di: Wuxing5): SancaiFortune {
  // 相邻关系：+1 相生，0 比和/无关，-1 相克
  const rel = (a: Wuxing5, b: Wuxing5): number => {
    if (a === b) return 0
    if (sheng(a, b) || sheng(b, a)) return 1
    if (ke(a, b) || ke(b, a)) return -1
    return 0
  }
  const tr = rel(tian, ren)
  const rd = rel(ren, di)
  const shengCount = (tr === 1 ? 1 : 0) + (rd === 1 ? 1 : 0)
  const keCount = (tr === -1 ? 1 : 0) + (rd === -1 ? 1 : 0)

  const combo = `${tian}${ren}${di}`

  if (keCount === 2) {
    return { luck: '大凶', desc: `三才${combo}，上下相战克泄交加，基础运舛，配置大凶，宜避用。` }
  }
  if (shengCount === 2) {
    return { luck: '大吉', desc: `三才${combo}，顺次相生、天人地一气贯通，基础稳固，境遇安泰，配置大吉。` }
  }
  if (shengCount === 1 && keCount === 1) {
    return { luck: '半吉', desc: `三才${combo}，生克参半、吉凶相抵，平稳可守而难期大展，配置半吉。` }
  }
  if (keCount === 1) {
    return { luck: '凶', desc: `三才${combo}，一宫受克、生克失调，基础运受阻，配置偏凶，宜斟酌。` }
  }
  if (shengCount === 1) {
    return { luck: '吉', desc: `三才${combo}，一处相生、余者和顺，基础安泰，配置吉祥。` }
  }
  // 两对皆比和（如 木木木）
  return { luck: '半吉', desc: `三才${combo}，同类比和、气势专一，平顺有余而变化不足，配置半吉。` }
}
