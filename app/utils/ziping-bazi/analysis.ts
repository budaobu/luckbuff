import type { ZipingBaziChart } from '~/types/ziping-bazi'
import {
  TIAN_GAN,
  DI_ZHI,
  ZHI_CANGGAN,
  GAN_WUXING,
  ZHI_WUXING,
  WUXING_SHENG,
  WUXING_KE,
  GAN_YANG,
} from './constants'

export function calcZipingWuxingScore(chart: ZipingBaziChart) {
  const scores: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }

  const pillars = [chart.year, chart.month, chart.day, chart.hour].filter(Boolean) as Array<{
    gan: string
    zhi: string
    canggan: Array<{ gan: string; type: string }>
  }>

  for (const p of pillars) {
    const ganWx = GAN_WUXING[p.gan]!
    if (ganWx) scores[ganWx] = (scores[ganWx] || 0) + 15

    const zhiWx = ZHI_WUXING[p.zhi]!
    if (zhiWx) scores[zhiWx] = (scores[zhiWx] || 0) + 10

    for (const cg of p.canggan) {
      const cgWx = GAN_WUXING[cg.gan]!
      if (!cgWx) continue
      if (cg.type === '本气') scores[cgWx] = (scores[cgWx] || 0) + 8
      else if (cg.type === '中气') scores[cgWx] = (scores[cgWx] || 0) + 4
      else if (cg.type === '余气') scores[cgWx] = (scores[cgWx] || 0) + 2
    }
  }

  const monthZhiWx = ZHI_WUXING[chart.month.zhi]!
  if (monthZhiWx) scores[monthZhiWx] = (scores[monthZhiWx] || 0) + 15

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

export function calcZipingRiZhuStrength(
  riGan: string,
  monthZhi: string,
  wuxingScore: ZipingBaziChart['wuxingScore'],
): '身旺' | '身弱' | '从强' | '从弱' {
  const riWx = GAN_WUXING[riGan]!
  const monthWx = ZHI_WUXING[monthZhi]!

  const deLing = riWx === monthWx || WUXING_SHENG[monthWx]! === riWx

  const selfScore = wuxingScore[riWx as keyof typeof wuxingScore] || 0

  const siblingWx = riWx
  const shengWx = Object.entries(WUXING_SHENG).find(([, v]) => v === riWx)?.[0] || ''
  const siblingScore = wuxingScore[siblingWx as keyof typeof wuxingScore] || 0
  const shengScore = wuxingScore[shengWx as keyof typeof wuxingScore] || 0
  const assistScore = siblingScore + shengScore

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

export function calcZipingXiYongJiShen(
  riGan: string,
  riZhuStrength: string,
  wuxingScore: ZipingBaziChart['wuxingScore'],
): { xiyong: string; jishen: string } {
  const riWx = GAN_WUXING[riGan]!

  if (riZhuStrength === '从强') {
    const sheng = WUXING_SHENG[riWx]!
    const xiyong = `${riWx}、${sheng}`
    const ke = Object.entries(WUXING_KE).find(([, v]) => v === riWx)?.[0] || ''
    const beiKe = WUXING_KE[riWx]!
    const jishen = `${ke}、${beiKe}`
    return { xiyong, jishen }
  }

  if (riZhuStrength === '身旺' || riZhuStrength === '从弱') {
    const ke = Object.entries(WUXING_KE).find(([, v]) => v === riWx)?.[0] || ''
    const beiKe = WUXING_KE[riWx]!
    const xiyong = `${ke}、${beiKe}`
    const sheng = WUXING_SHENG[riWx]!
    const jishen = `${riWx}、${sheng}`
    return { xiyong, jishen }
  }

  const sheng = WUXING_SHENG[riWx]!
  const xiyong = `${riWx}、${sheng}`
  const ke = Object.entries(WUXING_KE).find(([, v]) => v === riWx)?.[0] || ''
  const beiKe = WUXING_KE[riWx]!
  const jishen = `${ke}、${beiKe}`
  return { xiyong, jishen }
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

export function calcZipingGeJu(chart: ZipingBaziChart): string {
  const { month } = chart

  const monthCangganBenqi = month.canggan.find(c => c.type === '本气')
  if (monthCangganBenqi) {
    const benqiGan = monthCangganBenqi.gan
    const touGan = [month.gan, chart.day.gan, chart.hour?.gan].filter(Boolean)
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

  const linGuanZhi: Record<string, string> = {
    甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳',
    己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子',
  }
  if (month.zhi === linGuanZhi[chart.riZhu]) {
    return '建禄格'
  }

  if (chart.riZhuStrength === '从强') return '从旺格'
  if (chart.riZhuStrength === '从弱') return '从弱格'

  const monthSS = getShiShenFromRelation(chart.riZhu, month.gan)
  if (monthSS && monthSS !== '比肩' && monthSS !== '劫财') {
    return `${monthSS}格`
  }

  return '普通格'
}

export function getShiShen(riGan: string, targetGan: string): string {
  return getShiShenFromRelation(riGan, targetGan)
}
