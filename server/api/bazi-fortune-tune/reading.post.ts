import type { BaziChart, WuxingScore } from '~/types/bazi'
import type { BaziFortuneTuneReading } from '~/types/bazi-fortune-tune'
import { GAN_WUXING, WUXING_SHENG, WUXING_KE, GAN_YANG } from '~/utils/bazi/constants'

const WUXING_MATERIALS: Record<string, string[]> = {
  木: ['檀木手串', '绿幽灵水晶', '植物纤维织物', '翡翠', '绿松石'],
  火: ['红玛瑙', '紫水晶', '红绳', '石榴石', '羊毛/羊绒制品'],
  土: ['黄水晶', '和田玉/玉石', '陶瓷饰品', '蜜蜡', '黄碧玺'],
  金: ['银饰', '白金', '钛钢', '白水晶', '金属表带'],
  水: ['黑曜石', '海蓝宝', '珍珠', '黑玛瑙', '蓝宝石'],
}

const WUXING_COLORS: Record<string, string[]> = {
  木: ['绿色', '青色', '翠色'],
  火: ['红色', '紫色', '粉色'],
  土: ['黄色', '棕色', '米色', '咖色'],
  金: ['白色', '银色', '金色', '金属色'],
  水: ['黑色', '蓝色', '深灰色'],
}

const WUXING_MONTHS: Record<string, string[]> = {
  木: ['寅月（立春-惊蛰）', '卯月（惊蛰-清明）'],
  火: ['巳月（立夏-芒种）', '午月（芒种-小暑）'],
  土: ['辰月（清明-立夏）', '未月（小暑-立秋）', '戌月（寒露-立冬）', '丑月（小寒-立春）'],
  金: ['申月（立秋-白露）', '酉月（白露-寒露）'],
  水: ['亥月（立冬-大雪）', '子月（大雪-小寒）'],
}

const SHICHEN_WUXING: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
}

function pickTopWuxing(wuxingScore: WuxingScore, exclude: string[] = []): string {
  const sorted = Object.entries(wuxingScore)
    .filter(([wx]) => !exclude.includes(wx))
    .sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] || '土'
}

function parseXiyong(xiyong: string): string[] {
  return ['木', '火', '土', '金', '水'].filter(wx => xiyong.includes(wx))
}

function explainLogic(
  riZhu: string,
  riZhuStrength: string,
  xiyongList: string[],
  topWeakWuxing: string | null,
): string {
  const riWx = GAN_WUXING[riZhu]
  if (riZhuStrength === '身旺' || riZhuStrength === '从强') {
    return `日主${riZhu}五行属${riWx}，判定为${riZhuStrength}。改运方向以「克泄耗」为主，首选${xiyongList.join('、')}属性的材质与颜色，帮助平衡过旺的${riWx}气。`
  }
  if (riZhuStrength === '身弱' || riZhuStrength === '从弱') {
    return `日主${riZhu}五行属${riWx}，判定为${riZhuStrength}。改运方向以「生扶」为主，首选${xiyongList.join('、')}属性的材质与颜色，补足日主能量。`
  }
  return `日主${riZhu}五行属${riWx}，喜用神为${xiyongList.join('、')}。建议围绕喜用神选择材质与颜色，避免${topWeakWuxing || '忌神'}属性的饰品。`
}

function buildHandPosition(
  riZhu: string,
  riZhuStrength: string,
  gender: 'male' | 'female' | undefined,
  xiyongList: string[],
): string {
  // 传统：男左女右。身强喜克泄耗者，用「泄气」的一侧（通常与性别同侧或依习惯）；身弱喜生扶者，用「纳气」的一侧。
  // 简化规则：
  // - 身弱/从弱需要汇聚能量 → 按传统纳气手位：男左女右
  // - 身旺/从强需要耗散能量 → 戴对侧或双手，避免能量过聚
  // - 若喜用神为阳干属性且身强，可戴常用手对侧
  const baseHand = gender === 'female' ? '右手' : '左手'
  const oppositeHand = gender === 'female' ? '左手' : '右手'

  if (riZhuStrength === '身旺' || riZhuStrength === '从强') {
    return `建议优先戴在${oppositeHand}，或左右手交替佩戴，以疏导过旺的日主能量；日常办公/运动时可暂戴${baseHand}。`
  }
  return `建议优先戴在${baseHand}，有助于汇聚${xiyongList.join('、')}之气；若需增强社交表达，可在重要场合换至${oppositeHand}。`
}

function buildTiming(xiyongList: string[], jishenList: string[]): string {
  const boostMonths = xiyongList.flatMap(wx => WUXING_MONTHS[wx] || [])
  const reduceMonths = jishenList.flatMap(wx => WUXING_MONTHS[wx] || [])
  const boostHours = Object.entries(SHICHEN_WUXING)
    .filter(([, wx]) => xiyongList.includes(wx))
    .map(([dz]) => `${dz}时`)
  return [
    `在${boostMonths.join('、') || '喜用神当令的月份'}佩戴效果较佳。`,
    `每日${boostHours.slice(0, 4).join('、') || '喜用神当令的时辰'}是启动或调整饰品的较好时机。`,
    reduceMonths.length
      ? `${reduceMonths.join('、')}忌神当令，建议减少重配饰或改为低调佩戴。`
      : '忌神当令期间可减少新饰品启用。',
  ].join('')
}

function buildYearlyTips(chart: BaziChart): { year: number; ganZhi: string; wuxing: string; direction: 'enhance' | 'reduce' | 'stable'; summary: string }[] {
  const startYear = new Date().getFullYear()
  const years: { year: number; ganZhi: string; wuxing: string; direction: 'enhance' | 'reduce' | 'stable'; summary: string }[] = []
  const ganCycle = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const zhiCycle = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const baseGanIdx = ganCycle.indexOf('甲')
  const baseZhiIdx = zhiCycle.indexOf('子')
  const offset = startYear - 1984 // 1984 为甲子年
  const xiyongList = parseXiyong(chart.xiyong)
  const jishenList = ['木', '火', '土', '金', '水'].filter(wx => chart.jishen.includes(wx))

  for (let i = 0; i < 5; i++) {
    const year = startYear + i
    const gan = ganCycle[(baseGanIdx + offset + i) % 10]!
    const zhi = zhiCycle[(baseZhiIdx + offset + i) % 12]!
    const yearWx = GAN_WUXING[gan]
    if (!yearWx) continue
    let direction: 'enhance' | 'reduce' | 'stable' = 'stable'
    if (xiyongList.includes(yearWx)) direction = 'enhance'
    else if (jishenList.includes(yearWx)) direction = 'reduce'
    const summary = direction === 'enhance'
      ? `${year}年${gan}${zhi}为${yearWx}年，与喜用神同气，宜多佩戴推荐材质/颜色。`
      : direction === 'reduce'
        ? `${year}年${gan}${zhi}为${yearWx}年，属忌神气场，建议减少新购饰品或改以基础款为主。`
        : `${year}年${gan}${zhi}为${yearWx}年，气场中性，维持现有搭配即可。`
    years.push({ year, ganZhi: `${gan}${zhi}`, wuxing: yearWx, direction, summary })
  }
  return years
}

function buildSearchKeyword(xiyongList: string[], locale: string): string {
  if (locale === 'en') {
    return `Search: ${xiyongList.join('/')} element crystal jewelry`
  }
  if (locale === 'zh-TW') {
    return `可搜尋：${xiyongList.join('')}屬性水晶飾品`
  }
  return `可搜索：${xiyongList.join('')}属性水晶手链`
}

export default defineEventHandler(async (event) => {
  const { chart, profile, locale = 'zh-CN', includeYearly = false } = await readBody<{
    chart: BaziChart
    profile?: { name?: string; gender?: 'male' | 'female'; birthDate?: string; birthHour?: DiZhi }
    locale?: string
    includeYearly?: boolean
  }>(event)

  if (!chart) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chart' })
  }

  const xiyongList = parseXiyong(chart.xiyong)
  const jishenList = ['木', '火', '土', '金', '水'].filter(wx => chart.jishen.includes(wx))

  // 若喜用神为空，回退到「缺什么补什么」的提示而非真正采用该模型
  if (xiyongList.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid chart: missing xiyong' })
  }

  // 取最缺的五行用于解释（仅作说明，不影响建议主路径）
  const wuxingEntries = Object.entries(chart.wuxingScore)
  if (wuxingEntries.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid chart: missing wuxingScore' })
  }
  const minWuxing = wuxingEntries.sort((a, b) => a[1] - b[1])[0]![0]

  const materials = [...new Set(xiyongList.flatMap(wx => WUXING_MATERIALS[wx] || []))].slice(0, 6)
  const colors = [...new Set(xiyongList.flatMap(wx => WUXING_COLORS[wx] || []))].slice(0, 5)

  const handPosition = buildHandPosition(chart.riZhu, chart.riZhuStrength, profile?.gender, xiyongList)
  const timing = buildTiming(xiyongList, jishenList)

  const stylingTips = [
    `日常优先选择${colors.slice(0, 3).join('、')}等色系，避免大面积${jishenList.flatMap(wx => WUXING_COLORS[wx] || []).slice(0, 3).join('、')}。`,
    `材质上${materials.slice(0, 3).join('、')}更易与命局形成共振。`,
    '饰品尺寸宜适中，过重反而造成心理负担；保持清洁与完好即可。',
  ]

  const disclaimer = locale === 'en'
    ? 'For entertainment and reference only. This is not medical advice or a guarantee of any outcome.'
    : locale === 'zh-TW'
      ? '以上內容僅供參考與娛樂，非醫療建議，亦不構成任何療效或結果承諾。'
      : '以上内容仅供参考与娱乐，非医疗建议，亦不构成任何疗效或结果承诺。'

  const reading: BaziFortuneTuneReading = {
    riZhuStrength: chart.riZhuStrength,
    xiyong: chart.xiyong,
    jishen: chart.jishen,
    logicSummary: explainLogic(chart.riZhu, chart.riZhuStrength, xiyongList, minWuxing),
    materials,
    colors,
    handPosition,
    timing,
    stylingTips,
    yearlyTips: includeYearly ? buildYearlyTips(chart) : [],
    searchKeyword: buildSearchKeyword(xiyongList, locale),
    disclaimer,
  }

  return reading
})
