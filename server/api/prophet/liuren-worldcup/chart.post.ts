import type { LiurenWorldcupRequest, LiurenChartData } from '~/types/liuren-worldcup'

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function getGanZhiYear(year: number): string {
  const ganIndex = (year - 4) % 10
  const zhiIndex = (year - 4) % 12
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex]
}

// 简化月干支计算：以节气为界（简化版，按农历月近似）
function getGanZhiMonth(year: number, month: number): string {
  const yearGanIndex = (year - 4) % 10
  // 年干决定月干起始：甲己年起丙寅，乙庚年起戊寅，丙辛年起庚寅，丁壬年起壬寅，戊癸年起甲寅
  const monthGanStartMap = [2, 4, 6, 8, 0] // 丙戊庚壬甲的索引
  const startGan = monthGanStartMap[yearGanIndex % 5]
  const monthGan = TIAN_GAN[(startGan + month - 1) % 10]
  const monthZhi = DI_ZHI[(month + 1) % 12] // 寅月为正月
  return monthGan + monthZhi
}

function getGanZhiDay(date: Date): string {
  // 简化日干支计算（基于1900-01-31为甲子的基准）
  const baseDate = new Date(1900, 0, 31)
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000))
  const ganIndex = (diffDays % 10 + 10) % 10
  const zhiIndex = (diffDays % 12 + 12) % 12
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex]
}

function getShiChenHour(h: number): string {
  if (h >= 23 || h < 1) return '子'
  const idx = Math.floor((h - 1) / 2) + 1
  return DI_ZHI[idx]
}

function getDayHourGanZhi(dayGan: string, hourZhi: string): string {
  // 日干定子时天干：甲己日起甲子，乙庚日起丙子，丙辛日起戊子，丁壬日起庚子，戊癸日起壬子
  const dayGanIndex = TIAN_GAN.indexOf(dayGan)
  const startGanMap = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]
  const startGan = startGanMap[dayGanIndex]
  const hourZhiIndex = DI_ZHI.indexOf(hourZhi)
  const hourGan = TIAN_GAN[(startGan + hourZhiIndex) % 10]
  return hourGan + hourZhi
}

// 月将（根据中气确定）
function getYueJiang(month: number, day: number): string {
  // 简化：按月份对应月将（实际应以中气为界）
  // 正月建寅，月将在亥（登明）
  const yueJiangMap = ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌']
  return yueJiangMap[(month - 1 + 12) % 12]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LiurenWorldcupRequest>(event)

  if (!body?.homeTeam || !body?.awayTeam || !body?.matchTime) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields: homeTeam, awayTeam, matchTime' })
  }

  if (!body?.birthYear || body.birthYear < 1900 || body.birthYear > 2100) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthYear' })
  }

  // 根据出生年份计算年支
  const birthYearBranch = DI_ZHI[(body.birthYear - 4) % 12]

  const dt = new Date(body.matchTime)
  if (isNaN(dt.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid matchTime' })
  }

  const tz = body.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'

  // 计算基础干支
  const yearGz = getGanZhiYear(dt.getFullYear())
  const monthGz = getGanZhiMonth(dt.getFullYear(), dt.getMonth() + 1)
  const dayGz = getGanZhiDay(dt)
  const hourZhi = getShiChenHour(dt.getHours())
  const hourGz = getDayHourGanZhi(dayGz[0], hourZhi)
  const yueJiang = getYueJiang(dt.getMonth() + 1, dt.getDate())

  // 农历简化表示
  const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
  // 简化农历日（不做精确转换）
  const lunarDayApprox = dt.getDate()

  const chart: LiurenChartData = {
    match: {
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      matchTime: body.matchTime,
      venue: body.venue,
    },
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
