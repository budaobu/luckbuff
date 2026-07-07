import type { BaziChart, WuxingScore } from '~/types/bazi'
import { GAN_WUXING, ZHI_WUXING, WUXING_SHENG, WUXING_KE, GAN_YANG, TIAN_GAN } from './constants'

// 计算五行力量分布
export function calcWuxingScore(chart: BaziChart): WuxingScore {
  const scores: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }

  const pillars = [chart.year, chart.month, chart.day, chart.hour].filter(Boolean) as Array<{
    gan: string
    zhi: string
    canggan: Array<{ gan: string; type: string }>
  }>

  for (const p of pillars) {
    // 天干力量
    const ganWx = GAN_WUXING[p.gan]!
    if (ganWx) scores[ganWx] = (scores[ganWx] || 0) + 15

    // 地支本气力量
    const zhiWx = ZHI_WUXING[p.zhi]!
    if (zhiWx) scores[zhiWx] = (scores[zhiWx] || 0) + 10

    // 藏干力量
    for (const cg of p.canggan) {
      const cgWx = GAN_WUXING[cg.gan]!
      if (!cgWx) continue
      if (cg.type === '本气') scores[cgWx] = (scores[cgWx] || 0) + 8
      else if (cg.type === '中气') scores[cgWx] = (scores[cgWx] || 0) + 4
      else if (cg.type === '余气') scores[cgWx] = (scores[cgWx] || 0) + 2
    }
  }

  // 月支权重加倍（月令最重要）
  const monthZhiWx = ZHI_WUXING[chart.month.zhi]!
  if (monthZhiWx) scores[monthZhiWx] = (scores[monthZhiWx] || 0) + 15

  // 归一化到百分比
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  if (total === 0) return { 木: 20, 火: 20, 土: 20, 金: 20, 水: 20 }

  return {
    木: Math.round((scores['木']! / total) * 100),
    火: Math.round((scores['火']! / total) * 100),
    土: Math.round((scores['土']! / total) * 100),
    金: Math.round((scores['金']! / total) * 100),
    水: Math.round((scores['水']! / total) * 100),
  }
}

// 判断日主强弱
export function calcRiZhuStrength(
  riGan: string,
  monthZhi: string,
  wuxingScore: WuxingScore,
): '身旺' | '身弱' | '从强' | '从弱' {
  const riWx = GAN_WUXING[riGan]!
  const monthWx = ZHI_WUXING[monthZhi]!

  // 得令判断：日主五行与月支五行相同，或月支生助日主
  const deLing = riWx === monthWx || WUXING_SHENG[monthWx]! === riWx

  // 得地判断：日主五行在四柱地支中有根（本气相同）
  // 简化：看五行分数中自身五行是否占比较高
  const selfScore = wuxingScore[riWx as keyof WuxingScore] || 0

  // 得势判断：同类五行（比劫、印枭）总分
  const siblingWx = riWx
  const shengWx = Object.entries(WUXING_SHENG).find(([, v]) => v === riWx)?.[0] || ''
  const siblingScore = wuxingScore[siblingWx as keyof WuxingScore] || 0
  const shengScore = wuxingScore[shengWx as keyof WuxingScore] || 0
  const assistScore = siblingScore + shengScore

  // 从格判断：日主极弱或极强，且五行分布极度偏斜
  const maxScore = Math.max(...Object.values(wuxingScore))
  const minScore = Math.min(...Object.values(wuxingScore))

  if (selfScore <= 8 && assistScore <= 15 && maxScore >= 45) {
    return '从弱'
  }
  if (selfScore >= 35 && assistScore >= 60 && minScore <= 5) {
    return '从强'
  }

  if (deLing || assistScore >= 45 || selfScore >= 25) {
    return '身旺'
  }
  return '身弱'
}

// 计算喜用神和忌神
export function calcXiYongJiShen(
  riGan: string,
  riZhuStrength: string,
  wuxingScore: WuxingScore,
): { xiyong: string; jishen: string } {
  const riWx = GAN_WUXING[riGan]!

  if (riZhuStrength === '从强') {
    // 从强：喜生扶，忌克泄耗
    const sheng = WUXING_SHENG[riWx]!
    const xiyong = `${riWx}、${sheng}`
    const ke = Object.entries(WUXING_KE).find(([, v]) => v === riWx)?.[0] || ''
    const beiKe = WUXING_KE[riWx]!
    const jishen = `${ke}、${beiKe}`
    return { xiyong, jishen }
  }

  if (riZhuStrength === '从弱') {
    // 从弱：喜克泄耗，忌生扶
    const ke = Object.entries(WUXING_KE).find(([, v]) => v === riWx)?.[0] || ''
    const beiKe = WUXING_KE[riWx]!
    const xiyong = `${ke}、${beiKe}`
    const sheng = WUXING_SHENG[riWx]!
    const jishen = `${riWx}、${sheng}`
    return { xiyong, jishen }
  }

  if (riZhuStrength === '身旺') {
    // 身旺：喜克泄耗，忌生扶
    const ke = Object.entries(WUXING_KE).find(([, v]) => v === riWx)?.[0] || ''
    const beiKe = WUXING_KE[riWx]!
    const xiyong = `${ke}、${beiKe}`
    const sheng = WUXING_SHENG[riWx]!
    const jishen = `${riWx}、${sheng}`
    return { xiyong, jishen }
  }

  // 身弱：喜生扶，忌克泄耗
  const sheng = WUXING_SHENG[riWx]!
  const xiyong = `${riWx}、${sheng}`
  const ke = Object.entries(WUXING_KE).find(([, v]) => v === riWx)?.[0] || ''
  const beiKe = WUXING_KE[riWx]!
  const jishen = `${ke}、${beiKe}`
  return { xiyong, jishen }
}

// 格局判定（简化版）
export function calcGeJu(chart: BaziChart): string {
  const { month, day, hour } = chart

  // 月支本气透干为首选格局
  const monthCangganBenqi = month.canggan.find(c => c.type === '本气')
  if (monthCangganBenqi) {
    const benqiGan = monthCangganBenqi.gan
    // 检查月干、时干、年干是否有透出的
    const touGan = [month.gan, day.gan, hour?.gan].filter(Boolean)
    if (touGan.includes(benqiGan)) {
      const ss = getShiShenFromRelation(chart.riZhu, benqiGan)
      if (ss === '正官') return '正官格'
      if (ss === '七杀') return '七杀格'
      if (ss === '正财') return '正财格'
      if (ss === '偏财') return '偏财格'
      if (ss === '正印') return '正印格'
      if (ss === '偏印') return '偏印格'
      if (ss === '食神') return '食神格'
      if (ss === '伤官') return '伤官格'
    }
  }

  // 特殊格局判断
  const allGans = [chart.year.gan, chart.month.gan, chart.day.gan, chart.hour?.gan].filter(Boolean) as string[]
  const allZhis = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour?.zhi].filter(Boolean) as string[]

  // 建禄格：月支为日主临官位
  const linGuanZhi: Record<string, string> = {
    甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳',
    己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子',
  }
  if (month.zhi === linGuanZhi[chart.riZhu]) {
    return '建禄格'
  }

  // 从旺格/从弱格已在身强弱中判断
  if (chart.riZhuStrength === '从强') return '从旺格'
  if (chart.riZhuStrength === '从弱') return '从弱格'

  // 默认取月支十神作为格局
  const monthSS = getShiShenFromRelation(chart.riZhu, month.gan)
  if (monthSS && monthSS !== '比肩' && monthSS !== '劫财') {
    return `${monthSS}格`
  }

  return '普通格'
}

function getShiShenFromRelation(riGan: string, targetGan: string): string {
  const riWx = GAN_WUXING[riGan]!
  const tgWx = GAN_WUXING[targetGan]!
  const same = GAN_YANG[riGan] === GAN_YANG[targetGan]
  if (riWx === tgWx) return same ? '比肩' : '劫财'
  if (WUXING_SHENG[riWx]! === tgWx) return same ? '食神' : '伤官'
  if (WUXING_KE[riWx]! === tgWx) return same ? '偏财' : '正财'
  if (WUXING_SHENG[tgWx]! === riWx) return same ? '偏印' : '正印'
  if (WUXING_KE[tgWx]! === riWx) return same ? '七杀' : '正官'
  return ''
}
