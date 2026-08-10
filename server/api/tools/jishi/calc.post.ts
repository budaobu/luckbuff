import type { DiZhi } from '~/types/user'
import { toLunar, formatLunarParts } from 'lunar'
import {
  getDayPillar,
  getMonthZhi,
  getJianChu,
  getJieQiInfo,
  getShiChenTianShen,
  SHI_CHEN_RANGE,
  type TianGan,
  type Pillar,
  type ShiChenTianShen,
  type JieQiInfo,
} from '~~/server/utils/bazi'

interface CalcInput {
  date: string
  locale?: string
}

interface CalcResult {
  date: string
  dayPillar: Pillar
  dayGanZhi: string
  monthZhi: DiZhi
  jianChu: string
  jieQi: JieQiInfo
  shiChen: ShiChenTianShen[]
  /** 农历日期，如「六月廿八」（含闰月标记） */
  lunarDate: string
  /** 公历星期（0=周日 … 6=周六） */
  weekDay: number
  locale: string
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

export default defineEventHandler(async (event): Promise<CalcResult> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.date) {
    throw createError({ statusCode: 400, statusMessage: 'Missing date' })
  }

  const { year, month, day } = parseDate(body.date)
  const locale = body.locale || 'zh-CN'

  const dayPillar = getDayPillar(year, month, day)
  const monthZhi = getMonthZhi(year, month, day)

  // 农历月/日 + 星期。`lunar` 的 formatLunarParts 直接给「六月」「廿八」段，
  // 闰月前面加「闰」。星期用本地构造的 Date，与服务端时区无关（当天公历日固定）。
  const gregorian = new Date(year, month - 1, day)
  const { lunar } = toLunar(gregorian)
  const parts = formatLunarParts(lunar)
  const lunarMonth = parts.find(p => p.type === 'month')?.value ?? ''
  const lunarDay = parts.find(p => p.type === 'day')?.value ?? ''
  const lunarDate = `${lunar.isLeapMonth ? '闰' : ''}${lunarMonth}${lunarDay}`
  const weekDay = gregorian.getDay()

  return {
    date: body.date,
    dayPillar: {
      gan: dayPillar.gan as TianGan,
      zhi: dayPillar.zhi as DiZhi,
    },
    dayGanZhi: `${dayPillar.gan}${dayPillar.zhi}`,
    monthZhi,
    jianChu: getJianChu(monthZhi, dayPillar.zhi as DiZhi),
    jieQi: getJieQiInfo(year, month, day),
    shiChen: getShiChenTianShen(dayPillar.zhi as DiZhi),
    lunarDate,
    weekDay,
    locale,
  }
})
