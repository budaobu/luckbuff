import type { DiZhi } from '~/types/user'
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
    locale,
  }
})
