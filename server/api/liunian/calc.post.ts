import type { DiZhi } from '~/types/user'
import {
  getUserPillars,
  getSimplifiedXiYongJiShen,
  getDiZhiRelation,
  getWuxingDirection,
  SHENG_XIAO,
  type TianGan,
  type Pillar,
} from '~~/server/utils/bazi'
import { GAN_WUXING, ZHI_WUXING, getShiShen } from '~/utils/bazi/constants'
import { getNextZodiacYear, getYearGanZhi, scoreToGrade, type LiunianGrade } from '~/utils/liunian'

interface CalcInput {
  birthDate: string
  birthHour?: DiZhi | null
  targetYear?: number | null
  locale?: string
}

interface ScoreFactor {
  key: string
  label: string
  delta: number
}

interface CalcResult {
  userGanzhi: {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar | null
  }
  dayMaster: { gan: TianGan, wuxing: string }
  xiyongWuxing: string
  jishenWuxing: string
  targetYear: number
  yearGanZhi: {
    gan: TianGan
    zhi: DiZhi
    shengxiao: string
    ganWuxing: string
    zhiWuxing: string
  }
  /** 流年天干对日主的十神 */
  shiShen: string
  /** 流年支与生年支的太岁关系（值/冲/刑/害/合），无特殊关系为 null */
  taiSui: { relation: '值' | '冲' | '刑' | '害' | '合', delta: number } | null
  score: number
  grade: LiunianGrade
  factors: ScoreFactor[]
  lucky: { direction: string, wuxing: string, color: string }
  locale: string
}

// 流年天干十神的基础分（对日主而言的先天吉凶倾向）
const SHI_SHEN_SCORE: Record<string, number> = {
  正财: 10,
  偏财: 8,
  正官: 10,
  正印: 8,
  食神: 8,
  比肩: 2,
  偏印: 2,
  伤官: -6,
  七杀: -8,
  劫财: -6,
}

const WUXING_COLOR: Record<string, string> = {
  木: '青绿',
  火: '红紫',
  土: '黄褐',
  金: '白金',
  水: '黑蓝',
}

function parseBirthDate(date: string): void {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate format' })
  }
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate' })
  }
}

export default defineEventHandler(async (event): Promise<CalcResult> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birthDate' })
  }
  parseBirthDate(body.birthDate)

  const locale = body.locale || 'zh-CN'
  const targetYear = Number.isInteger(body.targetYear) && body.targetYear! >= 1900 && body.targetYear! <= 2100
    ? body.targetYear!
    : getNextZodiacYear()

  // 用户四柱与日主
  const pillars = getUserPillars(body.birthDate, body.birthHour)
  const dayGan = pillars.day.gan
  const dayWuxing = GAN_WUXING[dayGan]!
  const { xiyong: xiyongWuxing, jishen: jishenWuxing } = getSimplifiedXiYongJiShen(dayGan)

  // 流年干支（生肖年口径）
  const { gan, zhi } = getYearGanZhi(targetYear)
  const yearGan = gan as TianGan
  const yearZhi = zhi as DiZhi
  const ganWuxing = GAN_WUXING[yearGan]!
  const zhiWuxing = ZHI_WUXING[yearZhi]!

  // 打分：基础 60，叠加十神 / 喜忌 / 日支关系 / 太岁关系
  const factors: ScoreFactor[] = []
  let score = 60

  const shiShen = getShiShen(dayGan, yearGan)
  const shiShenDelta = SHI_SHEN_SCORE[shiShen] ?? 0
  score += shiShenDelta
  factors.push({ key: 'shiShen', label: `流年干${yearGan}为日主${shiShen}`, delta: shiShenDelta })

  if (ganWuxing === xiyongWuxing) {
    score += 8
    factors.push({ key: 'ganXiyong', label: `流年干五行属${ganWuxing}，为喜用`, delta: 8 })
  }
  else if (ganWuxing === jishenWuxing) {
    score -= 8
    factors.push({ key: 'ganJishen', label: `流年干五行属${ganWuxing}，为忌神`, delta: -8 })
  }
  if (zhiWuxing === xiyongWuxing) {
    score += 8
    factors.push({ key: 'zhiXiyong', label: `流年支五行属${zhiWuxing}，为喜用`, delta: 8 })
  }
  else if (zhiWuxing === jishenWuxing) {
    score -= 8
    factors.push({ key: 'zhiJishen', label: `流年支五行属${zhiWuxing}，为忌神`, delta: -8 })
  }

  const dayZhiRel = getDiZhiRelation(pillars.day.zhi, yearZhi)
  if (dayZhiRel.relations.length > 0) {
    score += dayZhiRel.score * 4
    factors.push({
      key: 'dayZhi',
      label: `流年支${yearZhi}与日支${pillars.day.zhi}相${dayZhiRel.relations.join('、')}`,
      delta: dayZhiRel.score * 4,
    })
  }

  let taiSui: CalcResult['taiSui'] = null
  const birthYearZhi = pillars.year.zhi
  if (birthYearZhi === yearZhi) {
    taiSui = { relation: '值', delta: -6 }
  }
  else {
    const rel = getDiZhiRelation(birthYearZhi, yearZhi)
    if (rel.relations.includes('冲')) taiSui = { relation: '冲', delta: -10 }
    else if (rel.relations.includes('刑')) taiSui = { relation: '刑', delta: -4 }
    else if (rel.relations.includes('害')) taiSui = { relation: '害', delta: -4 }
    else if (rel.relations.includes('合')) taiSui = { relation: '合', delta: 4 }
  }
  if (taiSui) {
    score += taiSui.delta
    factors.push({
      key: 'taiSui',
      label: `生年支${birthYearZhi}与流年支${yearZhi}${taiSui.relation === '值' ? '相同（值太岁）' : `相${taiSui.relation}`}`,
      delta: taiSui.delta,
    })
  }

  score = Math.max(5, Math.min(98, score))

  return {
    userGanzhi: pillars,
    dayMaster: { gan: dayGan, wuxing: dayWuxing },
    xiyongWuxing,
    jishenWuxing,
    targetYear,
    yearGanZhi: {
      gan: yearGan,
      zhi: yearZhi,
      shengxiao: SHENG_XIAO[yearZhi],
      ganWuxing,
      zhiWuxing,
    },
    shiShen,
    taiSui,
    score,
    grade: scoreToGrade(score),
    factors,
    lucky: {
      direction: getWuxingDirection(xiyongWuxing),
      wuxing: xiyongWuxing,
      color: WUXING_COLOR[xiyongWuxing] ?? '青绿',
    },
    locale,
  }
})
