import type { DiZhi } from '~/types/user'
import { toLunar, formatLunarParts } from 'lunar'
import { getUserPillars, getDivinationDayPillar } from '~~/server/utils/bazi'
import { GAN_WUXING, WUXING_SHENG, WUXING_KE } from '~/utils/bazi/constants'
import type { TianGan } from '~~/server/utils/bazi'

interface CalcInput {
  birthDate: string
  birthHour?: DiZhi | null
  queryDate: string
  locale?: string
}

interface WuxingColorSet {
  wuxing: string
  colors: string[]
  reason: string
}

export interface WuxingChuanyiResult {
  userGanzhi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  riGan: TianGan
  riGanWuxing: string
  queryDate: string
  queryGanzhi: { gan: string; zhi: string }
  queryRiGan: TianGan
  queryRiGanWuxing: string
  daJi: WuxingColorSet
  ciJi: WuxingColorSet
  buYi: WuxingColorSet
  xiyongWuxing: string
  jishenWuxing: string
  /** 查询日农历日期，如「六月廿八」（含闰月标记） */
  lunarDate: string
  /** 查询日公历星期（0=周日 … 6=周六） */
  weekDay: number
  locale: string
}

const WUXING_COLORS: Record<string, string[]> = {
  木: ['绿色', '青色', '翠绿'],
  火: ['红色', '粉色', '紫色', '橙色'],
  土: ['黄色', '棕色', '卡其色', '米色'],
  金: ['白色', '金色', '银色', '杏色'],
  水: ['黑色', '蓝色', '灰色', '深蓝色'],
}

function parseDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date format' })
  }
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
  }
  return { year, month, day }
}

function getWuxingByGan(gan: TianGan): string {
  return GAN_WUXING[gan] ?? '木'
}

function getShengWo(wuxing: string): string {
  for (const [from, to] of Object.entries(WUXING_SHENG)) {
    if (to === wuxing) return from
  }
  return wuxing
}

function getKeWo(wuxing: string): string {
  for (const [from, to] of Object.entries(WUXING_KE)) {
    if (to === wuxing) return from
  }
  return wuxing
}

function getSimplifiedXiYongJiShen(riGan: TianGan): { xiyong: string; jishen: string } {
  const wx = getWuxingByGan(riGan)
  const xiyong = getShengWo(wx)
  const jishen = getKeWo(wx)
  return { xiyong, jishen }
}

export default defineEventHandler(async (event): Promise<WuxingChuanyiResult> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birthDate' })
  }
  if (!body?.queryDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing queryDate' })
  }

  parseDate(body.birthDate)
  const { year, month, day } = parseDate(body.queryDate)
  const locale = body.locale || 'zh-CN'

  const userPillars = getUserPillars(body.birthDate, body.birthHour)
  const queryDayPillar = getDivinationDayPillar(new Date(year, month - 1, day))

  const riGan = userPillars.day.gan
  const riGanWuxing = getWuxingByGan(riGan)
  const queryRiGan = queryDayPillar.gan
  const queryRiGanWuxing = getWuxingByGan(queryRiGan)

  const { xiyong: xiyongWuxing, jishen: jishenWuxing } = getSimplifiedXiYongJiShen(riGan)

  const daJiWuxing = getShengWo(queryRiGanWuxing)
  const ciJiWuxing = queryRiGanWuxing
  const buYiWuxing = getKeWo(queryRiGanWuxing)

  const daJi: WuxingColorSet = {
    wuxing: daJiWuxing,
    colors: WUXING_COLORS[daJiWuxing] || [],
    reason: `生当日五行${queryRiGanWuxing}，为大吉贵人色`,
  }
  const ciJi: WuxingColorSet = {
    wuxing: ciJiWuxing,
    colors: WUXING_COLORS[ciJiWuxing] || [],
    reason: `与当日五行${queryRiGanWuxing}相同，为次吉合作色`,
  }
  const buYi: WuxingColorSet = {
    wuxing: buYiWuxing,
    colors: WUXING_COLORS[buYiWuxing] || [],
    reason: `克当日五行${queryRiGanWuxing}，为不宜消耗色`,
  }

  // 查询日农历月/日 + 星期，供纸刊日历海报头部使用（与 jishi 同源）。
  const gregorian = new Date(year, month - 1, day)
  const { lunar } = toLunar(gregorian)
  const parts = formatLunarParts(lunar)
  const lunarMonth = parts.find(p => p.type === 'month')?.value ?? ''
  const lunarDay = parts.find(p => p.type === 'day')?.value ?? ''
  const lunarDate = `${lunar.isLeapMonth ? '闰' : ''}${lunarMonth}${lunarDay}`
  const weekDay = gregorian.getDay()

  return {
    userGanzhi: {
      year: userPillars.year,
      month: userPillars.month,
      day: userPillars.day,
      hour: userPillars.hour,
    },
    riGan,
    riGanWuxing,
    queryDate: body.queryDate,
    queryGanzhi: queryDayPillar,
    queryRiGan,
    queryRiGanWuxing,
    daJi,
    ciJi,
    buYi,
    xiyongWuxing,
    jishenWuxing,
    lunarDate,
    weekDay,
    locale,
  }
})
