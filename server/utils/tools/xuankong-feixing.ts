import { buildChartForDate, detectCombinations, displayGrid } from '@soul-atelier/xuankong'
import { tymeEngine } from '@soul-atelier/calendar'
import { toLunar } from 'lunar'
import type {
  XuankongCalcInput,
  XuankongCombination,
  XuankongFormation,
  XuankongMountain,
  XuankongPalace,
  XuankongPalaceKey,
  XuankongPeriod,
  XuankongResult,
  XuankongStar,
  XuankongUsage,
} from '~~/app/types/xuankong-feixing'

const PALACE_META: Record<XuankongPalaceKey, {
  number: number
  name: string
  direction: string
  element: string
  mountains: string[]
}> = {
  kan: { number: 1, name: '坎', direction: '北', element: '水', mountains: ['壬', '子', '癸'] },
  gen: { number: 8, name: '艮', direction: '东北', element: '土', mountains: ['丑', '艮', '寅'] },
  zhen: { number: 3, name: '震', direction: '东', element: '木', mountains: ['甲', '卯', '乙'] },
  xun: { number: 4, name: '巽', direction: '东南', element: '木', mountains: ['辰', '巽', '巳'] },
  li: { number: 9, name: '离', direction: '南', element: '火', mountains: ['丙', '午', '丁'] },
  kun: { number: 2, name: '坤', direction: '西南', element: '土', mountains: ['未', '坤', '申'] },
  dui: { number: 7, name: '兑', direction: '西', element: '金', mountains: ['庚', '酉', '辛'] },
  qian: { number: 6, name: '乾', direction: '西北', element: '金', mountains: ['戌', '乾', '亥'] },
  center: { number: 5, name: '中', direction: '中宫', element: '土', mountains: [] },
}

const MOUNTAIN_NAMES = [
  '壬', '子', '癸',
  '丑', '艮', '寅',
  '甲', '卯', '乙',
  '辰', '巽', '巳',
  '丙', '午', '丁',
  '未', '坤', '申',
  '庚', '酉', '辛',
  '戌', '乾', '亥',
] as const

const PALACE_BY_NUMBER: Record<number, XuankongPalaceKey> = {
  1: 'kan',
  2: 'kun',
  3: 'zhen',
  4: 'xun',
  5: 'center',
  6: 'qian',
  7: 'dui',
  8: 'gen',
  9: 'li',
}

const LUOSHU_PATH = [5, 6, 7, 8, 9, 1, 2, 3, 4]
const SUBSTITUTION_THRESHOLD = 3

const STARS: Record<number, Omit<XuankongStar, 'number' | 'status'>> = {
  1: { name: '一白贪狼', element: '水', nature: '智慧、文昌、人缘' },
  2: { name: '二黑巨门', element: '土', nature: '病符、田宅、静养' },
  3: { name: '三碧禄存', element: '木', nature: '变动、是非、竞争' },
  4: { name: '四绿文曲', element: '木', nature: '文昌、学业、姻缘' },
  5: { name: '五黄廉贞', element: '土', nature: '至猛土煞、宜静不宜动' },
  6: { name: '六白武曲', element: '金', nature: '权威、事业、贵人' },
  7: { name: '七赤破军', element: '金', nature: '口舌、破耗、 创新变动' },
  8: { name: '八白左辅', element: '土', nature: '财帛、不动产、稳定' },
  9: { name: '九紫右弼', element: '火', nature: '喜庆、名气、桃花' },
}

// 沈氏通行替星表。这是公开古籍体系中的常量事实，只用于兼向起替。
const SHEN_SUBSTITUTION: Record<string, number> = {
  壬: 2, 子: 1, 癸: 1, 丑: 7, 艮: 7, 寅: 9,
  甲: 1, 卯: 2, 乙: 2, 辰: 6, 巽: 6, 巳: 6,
  丙: 7, 午: 9, 丁: 9, 未: 2, 坤: 2, 申: 1,
  庚: 9, 酉: 7, 辛: 7, 戌: 6, 乾: 6, 亥: 6,
}

const FORMATION_DETAILS: Record<string, { key: string, description: string }> = {
  旺山旺向: { key: 'wangshanwangxiang', description: '当运山星到坐、向星到向，理气上宜坐实朝空，丁财两得。' },
  上山下水: { key: 'shangshanxiashui', description: '当运山星到向、向星到坐，山水颠倒，需用形势与环境化解。' },
  双星到向: { key: 'shuangxingdaoxiang', description: '山星与向星同到向首，偏旺财气，后方仍需有靠。' },
  双星到坐: { key: 'shuangxingdaozuo', description: '山星与向星同到坐山，偏旺丁气，前方开阔才能引气。' },
}

const YUAN_NAMES = ['地元龙', '天元龙', '人元龙'] as const

function normalizeDegree(value: number) {
  const deg = value % 360
  return deg < 0 ? deg + 360 : deg
}

function shortestDelta(a: number, b: number) {
  const diff = normalizeDegree(a - b)
  return diff > 180 ? 360 - diff : diff
}

function buildMountainCatalog(): XuankongMountain[] {
  const palaces: XuankongPalaceKey[] = ['kan', 'gen', 'zhen', 'xun', 'li', 'kun', 'dui', 'qian']
  const mountains: XuankongMountain[] = []
  let index = 0

  for (const palaceKey of palaces) {
    const meta = PALACE_META[palaceKey]!
    meta.mountains.forEach((name, yuan) => {
      const centerAngle = normalizeDegree(345 + index * 15)
      mountains.push({
        name,
        palaceKey,
        palaceName: meta.name,
        palaceNumber: meta.number,
        direction: meta.direction,
        yuan: yuan as 0 | 1 | 2,
        yuanName: YUAN_NAMES[yuan]!,
        yinYang: isMountainYang(palaceKey, yuan as 0 | 1 | 2) ? 'yang' : 'yin',
        yinYangName: isMountainYang(palaceKey, yuan as 0 | 1 | 2) ? '阳' : '阴',
        centerAngle,
        startAngle: normalizeDegree(centerAngle - 7.5),
        endAngle: normalizeDegree(centerAngle + 7.5),
      })
      index += 1
    })
  }

  return mountains
}

function isMountainYang(palaceKey: XuankongPalaceKey, yuan: 0 | 1 | 2) {
  const cardinal = palaceKey === 'kan' || palaceKey === 'li' || palaceKey === 'zhen' || palaceKey === 'dui'
  return cardinal ? yuan === 0 : yuan !== 0
}

function findMountain(direction: number, mountains: XuankongMountain[]) {
  const normalized = normalizeDegree(direction)
  const index = Math.floor(normalizeDegree(normalized - 337.5) / 15)
  return mountains[index] ?? null
}

function fly(center: number, direction: 'forward' | 'reverse') {
  const chart = {} as Record<XuankongPalaceKey, number>
  let star = ((center - 1 + 9) % 9) + 1

  for (const number of LUOSHU_PATH) {
    const key = PALACE_BY_NUMBER[number]!
    chart[key] = ((star - 1 + 9) % 9) + 1
    star = direction === 'forward' ? star + 1 : star - 1
  }
  return chart
}

function directionFor(centerStar: number, mountain: XuankongMountain, catalog: XuankongMountain[]) {
  const yinYang = centerStar === 5
    ? mountain.yinYang
    : catalog.find(item => item.palaceKey === PALACE_BY_NUMBER[centerStar] && item.yuan === mountain.yuan)!.yinYang
  return yinYang === 'yang' ? 'forward' : 'reverse'
}

function star(number: number, status?: string): XuankongStar {
  return { number, ...STARS[number]!, status }
}

function starStatus(number: number, period: number) {
  const shengQi = ((period % 9) + 1)
  if (number === period) return '当令旺气'
  if (number === shengQi) return '生气'
  if (number === ((period + 7 - 1) % 9) + 1) return '退气'
  return '失令'
}

function periodRange(year: number): Pick<XuankongPeriod, 'startYear' | 'endYear'> {
  const start = 1864 + Math.floor((year - 1864) / 20) * 20
  return { startYear: start, endYear: start + 19 }
}

function periodCycle(number: number): XuankongPeriod['cycle'] {
  if (number <= 3) return '上元'
  if (number <= 6) return '中元'
  return '下元'
}

function formationDetail(name: string): XuankongFormation {
  const detail = FORMATION_DETAILS[name]!
  if (detail) return { ...detail, name }
  return {
    key: 'no-basic',
    name: '未入四局',
    description: '替卦盘未形成旺山旺向、上山下水或双星到坐/向的基本四局，需以九宫星组和特殊格局为主判断。',
  }
}

function validateDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createError({ statusCode: 400, statusMessage: '日期格式应为 YYYY-MM-DD' })
  }
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day || month > 12 || day > 31) {
    throw createError({ statusCode: 400, statusMessage: '日期无效' })
  }
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: '日期无效' })
  }
  return { year: year!, month: month!, day: day! }
}

function lunarDate(date: Date) {
  const lunar = toLunar(date).lunar
  return { year: Number(lunar.year), month: Number(lunar.month) }
}

export async function calculateXuankongFeixing(input: XuankongCalcInput): Promise<XuankongResult> {
  if (typeof input.direction !== 'number' || !Number.isFinite(input.direction)) {
    throw createError({ statusCode: 400, statusMessage: '请输入向首罗盘度数' })
  }
  if (input.direction < 0 || input.direction >= 360) {
    throw createError({ statusCode: 400, statusMessage: '向首度数需在 0°（含）至 360°（不含）之间' })
  }

  const completion = validateDate(input.completionDate)
  if (completion.year < 1800 || completion.year > 2100) {
    throw createError({ statusCode: 400, statusMessage: '建成/装修年份支持 1800–2100' })
  }
  const inspection = input.inspectionDate ? validateDate(input.inspectionDate) : validateDate(new Date().toISOString().slice(0, 10))
  const allowedUsages: XuankongUsage[] = ['residential', 'office', 'shop']
  const usage = allowedUsages.includes(input.usage as XuankongUsage) ? input.usage as XuankongUsage : null

  const catalog = buildMountainCatalog()
  const direction = normalizeDegree(input.direction)
  const facing = findMountain(direction, catalog)
  if (!facing) throw createError({ statusCode: 500, statusMessage: '无法定位二十四山向首' })

  const sittingDirection = normalizeDegree(direction + 180)
  const sitting = findMountain(sittingDirection, catalog)
  if (!sitting) throw createError({ statusCode: 500, statusMessage: '无法定位二十四山坐山' })

  const baseChart = buildChartForDate(completion.year, completion.month, completion.day, sitting.name, tymeEngine)
  const period = baseChart.period
  const periodChart = Object.fromEntries(baseChart.palaces.map(item => [item.key, item.period])) as Record<XuankongPalaceKey, number>

  const facingDeviation = shortestDelta(direction, facing.centerAngle)
  const useSubstitution = facingDeviation > SUBSTITUTION_THRESHOLD
  const mountainCenter = useSubstitution
    ? SHEN_SUBSTITUTION[sitting.name]!
    : periodChart[sitting.palaceKey]!
  const waterCenter = useSubstitution
    ? SHEN_SUBSTITUTION[facing.name]!
    : periodChart[facing.palaceKey]!

  const mountainChart = fly(mountainCenter, directionFor(mountainCenter, sitting, catalog))
  const waterChart = fly(waterCenter, directionFor(waterCenter, facing, catalog))

  const values = {} as Record<XuankongPalaceKey, { period: number, mountain: number, water: number, earth: number }>
  values.center = {
    period: periodChart.center!,
    mountain: mountainChart.center!,
    water: waterChart.center!,
    earth: 5,
  }
  for (const item of baseChart.palaces) {
    if (item.key === 'center') continue
    values[item.key] = {
      period: periodChart[item.key]!,
      mountain: mountainChart[item.key]!,
      water: waterChart[item.key]!,
      earth: item.earth,
    }
  }

  const formationName = classifyFormation(period, sitting.palaceKey, facing.palaceKey, mountainChart, waterChart)
  const detectionPalaces = Object.entries(values).map(([key, value]) => ({
    key: key as XuankongPalaceKey,
    period: value.period,
    mountain: value.mountain,
    water: value.water,
    earth: value.earth,
  })) as any[]
  const detected = detectCombinations(
    period,
    formationName as any,
    facing.palaceKey as any,
    detectionPalaces,
  )

  const grid = displayGrid(baseChart).map(row => row.map(item => item?.key ?? 'center'))
  const lunar = lunarDate(new Date(inspection.year, inspection.month - 1, inspection.day))
  const annualCenter = ((11 - (lunar.year % 9) - 1 + 18) % 9) + 1
  const monthBase = ['子', '午', '卯', '酉'].includes(zodiacBranch(lunar.year))
    ? 8
    : ['辰', '戌', '丑', '未'].includes(zodiacBranch(lunar.year)) ? 5 : 2
  const monthlyCenter = ((monthBase - (lunar.month - 1) - 1 + 18) % 9) + 1
  const annualChart = fly(annualCenter, 'forward')
  const monthlyChart = fly(monthlyCenter, 'forward')

  const palaces: XuankongPalace[] = (Object.keys(PALACE_META) as XuankongPalaceKey[]).map((key) => {
    const meta = PALACE_META[key]!
    const value = values[key]!
    const cell = grid.flatMap((row, displayRow) => row.map((cellKey, displayCol) => ({ cellKey, displayRow, displayCol })))
      .find(item => item.cellKey === key)!
    return {
      key,
      palaceNumber: meta.number,
      name: meta.name,
      direction: meta.direction,
      element: meta.element,
      mountains: meta.mountains,
      earth: value.earth,
      period: value.period,
      mountain: value.mountain,
      water: value.water,
      periodStar: star(value.period, starStatus(value.period, period)),
      mountainStar: star(value.mountain, starStatus(value.mountain, period)),
      waterStar: star(value.water, starStatus(value.water, period)),
      annualStar: annualChart[key]!,
      monthlyStar: monthlyChart[key]!,
      isCenter: key === 'center',
      isSitting: key === sitting.palaceKey,
      isFacing: key === facing.palaceKey,
      displayRow: cell.displayRow as 0 | 1 | 2,
      displayCol: cell.displayCol as 0 | 1 | 2,
    }
  })

  const combinations: XuankongCombination[] = detected.map(item => ({
    name: item.name,
    kind: item.kind,
    palaceKeys: (item.palaces ?? []) as XuankongPalaceKey[],
    palaceNames: (item.palaces ?? []).map((key: any) => PALACE_META[key as XuankongPalaceKey]!.name),
    note: item.note,
  }))

  const range = periodRange(baseChart.year)
  const periodInfo: XuankongPeriod = {
    number: period,
    name: `${periodCycle(period)}${period}运`,
    startYear: range.startYear,
    endYear: range.endYear,
    cycle: periodCycle(period),
  }

  return {
    input: {
      direction,
      completionDate: input.completionDate,
      inspectionDate: `${inspection.year}-${String(inspection.month).padStart(2, '0')}-${String(inspection.day).padStart(2, '0')}`,
      usage,
    },
    orientation: {
      facing,
      sitting,
      facingLabel: `向${facing.name}`,
      sittingLabel: `坐${sitting.name}`,
      label: baseChart.label,
      deviationFromCenter: Math.round(facingDeviation * 10) / 10,
      boundaryDistance: Math.round((7.5 - facingDeviation) * 10) / 10,
      substitutionThreshold: SUBSTITUTION_THRESHOLD,
      mountains: catalog,
    },
    summary: {
      method: useSubstitution ? '替卦' : '下卦',
      methodNote: useSubstitution
        ? `向首偏离${facing.name}山中心 ${facingDeviation.toFixed(1)}°，超过 ${SUBSTITUTION_THRESHOLD}°，按沈氏通行替星表起替卦。`
        : `向首在${facing.name}山中心 ${facingDeviation.toFixed(1)}° 范围内，按下卦盘起星。`,
      period: periodInfo,
      formation: formationDetail(formationName),
      annualCenter,
      monthlyCenter,
      lunarYear: lunar.year,
      lunarMonth: lunar.month,
    },
    chart: { grid, palaces },
    combinations,
    methodology: {
      engine: '@soul-atelier/xuankong 0.2.1 + Luckbuff substitution extension',
      method: '三元玄空飞星 · 立春定运 · 下卦/替卦双法',
      calendar: '建成/装修日期先作立春-aware 干支年归界，再定三元九运',
      substitutionTable: '沈氏玄空通行替星表；兼向偏离山中心超过 3° 起替',
      timeBasis: '流年/流月叠加按检测日期的农历年月计算',
      disclaimer: '玄空飞星结果仅供传统文化研究与环境规划参考，不构成科学结论、投资、医疗或专业工程建议。',
    },
  }
}

function classifyFormation(
  period: number,
  sittingKey: XuankongPalaceKey,
  facingKey: XuankongPalaceKey,
  mountainChart: Record<XuankongPalaceKey, number>,
  waterChart: Record<XuankongPalaceKey, number>,
) {
  if (mountainChart[sittingKey] === period && waterChart[facingKey] === period) return '旺山旺向'
  if (mountainChart[facingKey] === period && waterChart[sittingKey] === period) return '上山下水'
  if (mountainChart[facingKey] === period && waterChart[facingKey] === period) return '双星到向'
  if (mountainChart[sittingKey] === period && waterChart[sittingKey] === period) return '双星到坐'
  return '未入四局'
}

function zodiacBranch(year: number) {
  return ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][((year - 4) % 12 + 12) % 12]!
}

export function compactXuankongContext(result: XuankongResult) {
  const palaces = result.chart.palaces.map(palace => [
    `${palace.name}宫(${palace.direction})`,
    `运${palace.period}/山${palace.mountain}/向${palace.water}`,
    `流年${palace.annualStar}/流月${palace.monthlyStar}`,
    palace.isSitting ? '坐宫' : '',
    palace.isFacing ? '向宫' : '',
  ].filter(Boolean).join(' '))

  return [
    `坐向：${result.orientation.sittingLabel}${result.orientation.facingLabel}；向首度数：${result.input.direction}°`,
    `起盘方法：${result.summary.method}；${result.summary.methodNote}`,
    `元运：${result.summary.period.name}（${result.summary.period.startYear}–${result.summary.period.endYear}）`,
    `建成/装修：${result.input.completionDate}；流年流月：${result.input.inspectionDate}`,
    `格局：${result.summary.formation.name}；${result.summary.formation.description}`,
    `特殊格局：${result.combinations.map(item => `${item.name}${item.palaceNames.length ? `@${item.palaceNames.join('/')}` : ''}`).join('、') || '未检出'}`,
    `九宫：${palaces.join('；')}`,
    `规则：${result.methodology.method}；${result.methodology.calendar}；${result.methodology.substitutionTable}`,
  ].join('\n')
}
