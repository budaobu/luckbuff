import type { LiurenChartRequest, LiurenChartResponse } from '~/types/liuren'

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function getGanZhiYear(year: number): string {
  const ganIndex = (year - 4) % 10
  const zhiIndex = (year - 4) % 12
  return TIAN_GAN[ganIndex]! + DI_ZHI[zhiIndex]!
}

function getGanZhiMonth(year: number, month: number): string {
  const yearGanIndex = (year - 4) % 10
  const monthGanStartMap = [2, 4, 6, 8, 0]
  const startGan = monthGanStartMap[yearGanIndex % 5]!
  const monthGan = TIAN_GAN[(startGan + month - 1) % 10]!
  const monthZhi = DI_ZHI[(month + 1) % 12]!
  return monthGan + monthZhi
}

function getGanZhiDay(date: Date): string {
  const baseDate = new Date(1900, 0, 31)
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000))
  const ganIndex = (diffDays % 10 + 10) % 10
  const zhiIndex = (diffDays % 12 + 12) % 12
  return TIAN_GAN[ganIndex]! + DI_ZHI[zhiIndex]!
}

function getShiChenHour(h: number): string {
  if (h >= 23 || h < 1) return '子'
  const idx = Math.floor((h - 1) / 2) + 1
  return DI_ZHI[idx]!
}

function getDayHourGanZhi(dayGan: string, hourZhi: string): string {
  const dayGanIndex = TIAN_GAN.indexOf(dayGan)
  const startGanMap = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]
  const startGan = startGanMap[dayGanIndex]!
  const hourZhiIndex = DI_ZHI.indexOf(hourZhi)
  const hourGan = TIAN_GAN[(startGan + hourZhiIndex) % 10]!
  return hourGan + hourZhi
}

function getYueJiang(month: number): string {
  const yueJiangMap = ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌']
  return yueJiangMap[(month - 1 + 12) % 12]!
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LiurenChartRequest>(event)

  if (!body?.question?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required field: question' })
  }

  if (!body?.birthYear || body.birthYear < 1900 || body.birthYear > 2100) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthYear' })
  }

  if (!body?.location?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required field: location' })
  }

  const birthYearBranch = DI_ZHI[(body.birthYear - 4) % 12]!

  const tz = body.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
  const dt = body.datetime ? new Date(body.datetime) : new Date()

  const yearGz = getGanZhiYear(dt.getFullYear())
  const monthGz = getGanZhiMonth(dt.getFullYear(), dt.getMonth() + 1)
  const dayGz = getGanZhiDay(dt)
  const hourZhi = getShiChenHour(dt.getHours())
  const hourGz = getDayHourGanZhi(dayGz.slice(0, 1), hourZhi)
  const yueJiang = getYueJiang(dt.getMonth() + 1)

  const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']

  const chart: LiurenChartResponse = {
    question: body.question.trim(),
    location: body.location.trim(),
    calendar: {
      solar: dt.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', timeZone: tz, hour12: false,
      }),
      lunar: `${dt.getFullYear()}年${lunarMonths[dt.getMonth()]}月（约）`,
      ganzhi: {
        year: yearGz,
        month: monthGz,
        day: dayGz,
        hour: hourGz,
      },
      yuejiang: yueJiang,
      shichen: hourZhi + '时',
      birthYearBranch,
    },
  }

  return chart
})
