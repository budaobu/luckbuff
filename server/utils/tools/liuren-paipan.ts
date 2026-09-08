import { calculateBaziChart } from '@openfate/bazi-engine'
import { getLiuRenBySiZhu, getNianMing } from 'liuren-ts-lib'
import type {
  LiurenPaipanCourse,
  LiurenPaipanPillar,
  LiurenPaipanResult,
  LiurenPaipanTransmission,
} from '~~/app/types/liuren-paipan'

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
const BRANCH_PINYIN: Record<string, string> = {
  子: 'zi',
  丑: 'chou',
  寅: 'yin',
  卯: 'mao',
  辰: 'chen',
  巳: 'si',
  午: 'wu',
  未: 'wei',
  申: 'shen',
  酉: 'you',
  戌: 'xu',
  亥: 'hai',
}
const XUN_KONG: Record<string, string[]> = {
  甲子: ['戌', '亥'],
  甲戌: ['申', '酉'],
  甲申: ['午', '未'],
  甲午: ['辰', '巳'],
  甲辰: ['寅', '卯'],
  甲寅: ['子', '丑'],
}

function timePartsInZone(instant: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(formatter.formatToParts(instant).map(part => [part.type, part.value]))
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  }
}

function validateTimezone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: '时区无效' })
  }
}

function formatZoneTime(parts: { year: number, month: number, day: number, hour: number, minute: number }) {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')} ${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
}

function parseSolarDateTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value)
  if (!match) {
    throw createError({ statusCode: 500, statusMessage: '真太阳时校正结果无效' })
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6]),
  }
}

function branchFromMinutes(minutes: number) {
  const normalized = ((minutes + 60) % 1440 + 1440) % 1440
  return BRANCHES[Math.floor(normalized / 120)] || '子'
}

const SIXTY_JIA_ZI = Array.from({ length: 60 }, (_, index) => {
  const gan = '甲乙丙丁戊己庚辛壬癸'[index % 10]
  const zhi = BRANCHES[index % 12]
  return `${gan}${zhi}`
})

function xunForGanZhi(ganZhi: string) {
  const index = SIXTY_JIA_ZI.indexOf(ganZhi)
  if (index < 0) return { xun: '', xunKong: [] }
  const xun = SIXTY_JIA_ZI[Math.floor(index / 10) * 10] || ''
  return { xun, xunKong: XUN_KONG[xun] || [] }
}

function buildPillar(label: LiurenPaipanPillar['label'], ganzhi: string): LiurenPaipanPillar {
  return { label, ganzhi, ...xunForGanZhi(ganzhi) }
}

function objectValues(source: Record<string, string> | undefined) {
  return BRANCHES.map(branch => source?.[BRANCH_PINYIN[branch] || ''] || '')
}

function buildCourses(source: Record<string, string[]>): LiurenPaipanCourse[] {
  const labels: Array<LiurenPaipanCourse['label']> = ['first', 'second', 'third', 'fourth']
  const keys = ['ke1', 'ke2', 'ke3', 'ke4'] as const
  const titles = ['日干上神', '干上阴神', '日辰上神', '辰上阴神']
  return keys.map((key, index) => {
    const [upper = '', lower = '', god = ''] = source[key] || []
    return {
      label: labels[index]!,
      title: titles[index] || '',
      text: [upper, lower].filter(Boolean).join(''),
      upper,
      lower,
      god,
    }
  })
}

function calculateNianMing(birthDate: string | undefined, gender: 'male' | 'female' | undefined) {
  if (!birthDate || (gender !== 'male' && gender !== 'female')) return null
  const date = new Date(`${birthDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    throw createError({ statusCode: 400, statusMessage: '出生日期无效' })
  }
  const result = getNianMing(date, gender === 'male' ? '男' : '女')
  return {
    birthYearGanZhi: result.year,
    genderText: gender === 'male' ? '男' as const : '女' as const,
    luNianGanZhi: result.luNian,
  }
}

export async function calculateLiurenPaipan(input: {
  datetime: string
  timezone?: string
  location?: string
  longitude?: number
  latitude?: number
  birthDate?: string
  gender?: 'male' | 'female'
}): Promise<LiurenPaipanResult> {
  const instant = new Date(input.datetime)
  if (Number.isNaN(instant.getTime())) {
    throw createError({ statusCode: 400, statusMessage: '起课时间无效' })
  }

  const timezone = input.timezone?.trim() || 'Asia/Shanghai'
  validateTimezone(timezone)
  if ((input.longitude === undefined) !== (input.latitude === undefined)) {
    throw createError({ statusCode: 400, statusMessage: '真太阳时校正需要完整的经纬度' })
  }
  if (input.longitude !== undefined && (input.longitude < -180 || input.longitude > 180)) {
    throw createError({ statusCode: 400, statusMessage: '经度无效' })
  }
  if (input.latitude !== undefined && (input.latitude < -90 || input.latitude > 90)) {
    throw createError({ statusCode: 400, statusMessage: '纬度无效' })
  }
  if (input.birthDate && !/^(\d{4})-(\d{2})-(\d{2})$/.test(input.birthDate)) {
    throw createError({ statusCode: 400, statusMessage: '出生日期格式必须是 YYYY-MM-DD' })
  }

  const parts = timePartsInZone(instant, timezone)
  let engineParts = timePartsInZone(instant, 'Asia/Shanghai')
  let solarTime: LiurenPaipanResult['solarTime'] = {
    status: 'uncorrected',
    statusText: '未填地点或未解析坐标；按所选时区标准时转换到 UTC+8 起课，未做真太阳时校正。',
    requestedTimeText: formatZoneTime(parts),
    trueSolarTime: null,
    correctedEngineTimeText: null,
    longitudeOffsetMinutes: null,
    equationOfTimeMinutes: null,
    standardMeridian: null,
    algorithm: null,
    dayBoundaryChanged: false,
    hourBoundaryChanged: false,
  }

  if (input.longitude !== undefined && input.latitude !== undefined) {
    const solarChart = calculateBaziChart({
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute,
      gender: 'male',
      timezoneId: timezone,
      longitude: input.longitude,
      enableTrueSolarTime: true,
      dayBoundaryMode: 'ZI_HOUR_23',
    })
    const info = solarChart.solarTimeInfo
    if (!info) {
      throw createError({ statusCode: 422, statusMessage: '无法完成真太阳时校正，请检查地点坐标或时间' })
    }

    const trueParts = parseSolarDateTime(info.trueSolarDateTime)
    const originalWallMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
    const trueWallMs = Date.UTC(trueParts.year, trueParts.month - 1, trueParts.day, trueParts.hour, trueParts.minute)
    const correctionMinutes = (trueWallMs - originalWallMs) / 60000
    const correctedInstant = new Date(instant.getTime() + correctionMinutes * 60000)
    engineParts = timePartsInZone(correctedInstant, 'Asia/Shanghai')

    const dayBoundaryChanged = engineParts.year !== parts.year
      || engineParts.month !== parts.month
      || engineParts.day !== parts.day
    const hourBoundaryChanged = branchFromMinutes(parts.hour * 60 + parts.minute)
      !== branchFromMinutes(engineParts.hour * 60 + engineParts.minute)
    const boundary = dayBoundaryChanged || hourBoundaryChanged
    solarTime = {
      status: boundary ? 'boundary' : 'corrected',
      statusText: dayBoundaryChanged
        ? `已启用真太阳时：${info.trueSolarTime.slice(0, 5)}；校正后跨过日期边界，四柱已重排。`
        : hourBoundaryChanged
          ? `已启用真太阳时：${info.trueSolarTime.slice(0, 5)}；校正后跨入新时辰边界。`
          : `已按地点完成真太阳时校正：${info.trueSolarTime.slice(0, 5)}；未跨时辰边界。`,
      requestedTimeText: formatZoneTime(parts),
      trueSolarTime: info.trueSolarTime.slice(0, 5),
      correctedEngineTimeText: formatZoneTime(engineParts),
      longitudeOffsetMinutes: Math.round(info.longitudeCorrectionMinutes * 10) / 10,
      equationOfTimeMinutes: Math.round(info.equationOfTimeMinutes * 10) / 10,
      standardMeridian: info.standardMeridian,
      algorithm: info.algorithm,
      dayBoundaryChanged,
      hourBoundaryChanged,
    }
  }

  const calendar = calculateBaziChart({
    year: engineParts.year,
    month: engineParts.month,
    day: engineParts.day,
    hour: engineParts.hour,
    minute: engineParts.minute,
    gender: 'male',
    timezoneId: 'Asia/Shanghai',
    enableTrueSolarTime: false,
    dayBoundaryMode: 'ZI_HOUR_23',
  })
  const ganzhi = {
    year: calendar.pillars.year.ganZhi,
    month: calendar.pillars.month.ganZhi,
    day: calendar.pillars.day.ganZhi,
    hour: calendar.pillars.hour?.ganZhi || '',
  }
  if (!ganzhi.hour) {
    throw createError({ statusCode: 422, statusMessage: '未能取得时柱，无法起大六壬课' })
  }

  const raw = getLiuRenBySiZhu(ganzhi.year, ganzhi.month, ganzhi.day, ganzhi.hour)
  const rawRecord = raw as unknown as {
    dateInfo: Record<string, any>
    tianDiPan: Record<string, Record<string, string>>
    siKe: Record<string, string[]>
    sanChuan: Record<string, any>
    dunGan: Record<string, string>
    jianChu: Record<string, string>
    shenSha: LiurenPaipanResult['shenSha']
    yinYangGuiRen: Record<string, Record<string, string>>
  }
  const pillars = (['year', 'month', 'day', 'hour'] as const)
    .map(label => buildPillar(label, ganzhi[label]))

  const palaces = BRANCHES.map(branch => ({
    branch,
    skyBranch: rawRecord.tianDiPan.tianPan?.[BRANCH_PINYIN[branch] || ''] || '—',
    god: rawRecord.tianDiPan.tianJiang?.[BRANCH_PINYIN[branch] || ''] || '—',
    hiddenGan: rawRecord.dunGan[BRANCH_PINYIN[branch] || ''] || '',
    jianChu: rawRecord.jianChu[BRANCH_PINYIN[branch] || ''] || '—',
    isVoid: rawRecord.dateInfo.kong.includes(branch),
  }))

  const transmissionLabels: Array<LiurenPaipanTransmission['label']> = ['chu', 'zhong', 'mo']
  const transmissionKeys = ['chuChuan', 'zhongChuan', 'moChuan'] as const
  const transmissions = transmissionKeys.map((key, index) => {
    const [branch = '', god = '', sixRelative = '', hiddenGan = ''] = rawRecord.sanChuan[key] || []
    return {
      label: transmissionLabels[index]!,
      branch,
      god,
      sixRelative,
      hiddenGan,
    }
  })

  return {
    input: {
      requestedTime: instant.toISOString(),
      requestedTimezone: timezone,
      location: input.location?.trim() || '未填写',
      longitude: input.longitude,
      latitude: input.latitude,
      engineTime: formatZoneTime(engineParts),
      engineTimeBasis: solarTime.status === 'uncorrected'
        ? '已转换为 UTC+8 标准时后起课'
        : '已按真太阳时转换为 UTC+8 后起课',
    },
    solarTime,
    summary: {
      monthGeneral: rawRecord.dateInfo.yuejiang,
      hourBranch: ganzhi.hour.slice(1),
      dayGan: ganzhi.day.slice(0, 1),
      dayBranch: ganzhi.day.slice(1),
      xunShou: rawRecord.dateInfo.xun,
      xunKong: rawRecord.dateInfo.kong || [],
      coursePattern: rawRecord.sanChuan.keTi || '未定课体',
      nianMing: calculateNianMing(input.birthDate, input.gender),
    },
    pillars,
    courses: buildCourses(rawRecord.siKe),
    transmissions,
    chart: {
      palaces,
      yangGuiRen: objectValues(rawRecord.yinYangGuiRen.yangGuiRen),
      yinGuiRen: objectValues(rawRecord.yinYangGuiRen.yinGuiRen),
    },
    marks: {
      yiMa: rawRecord.dateInfo.yima,
      dingMa: rawRecord.dateInfo.dingma,
      tianMa: rawRecord.dateInfo.tianma,
    },
    shenSha: rawRecord.shenSha,
    methodology: {
      engine: 'liuren-ts-lib 3.1.0',
      method: '月将加时，四课三传，课体与神煞映射',
      calendar: '定气节气；UTC+8 排盘基准',
      timeBasis: '有坐标时先做真太阳时校正，再按 23:00 换日推四柱',
      trueSolarTime: solarTime.statusText,
      disclaimer: '大六壬排盘结果仅供文化研究与传统命理参考，不构成医疗、法律、财务或重大决策建议。',
    },
  }
}

export function compactLiurenPaipanContext(result: LiurenPaipanResult): string {
  const palaceLines = result.chart.palaces.map(palace => [
    `地盘${palace.branch}`,
    `天盘${palace.skyBranch}`,
    palace.god,
    palace.hiddenGan ? `遁${palace.hiddenGan}` : '',
    palace.jianChu,
    palace.isVoid ? '空' : '',
  ].filter(Boolean).join('/'))

  return [
    `起课：${result.input.engineTime}；时区：${result.input.requestedTimezone}；地点：${result.input.location}`,
    `真太阳时：${result.solarTime.trueSolarTime || '未校正'}；${result.solarTime.statusText}`,
    `月将：${result.summary.monthGeneral}；占时：${result.summary.hourBranch}时`,
    `四柱：${result.pillars.map(pillar => pillar.ganzhi).join(' ')}`,
    `旬首：${result.summary.xunShou}；旬空：${result.summary.xunKong.join('、')}`,
    `年命：${result.summary.nianMing ? `${result.summary.nianMing.birthYearGanZhi}(${result.summary.nianMing.genderText})，行年${result.summary.nianMing.luNianGanZhi}` : '未提供'}`,
    `四课：${result.courses.map(course => `${course.title}=${course.text}${course.god ? `(${course.god})` : ''}`).join('；')}`,
    `三传：${result.transmissions.map(item => `${item.branch}${item.god}${item.sixRelative ? `/${item.sixRelative}` : ''}${item.hiddenGan ? `/遁${item.hiddenGan}` : ''}`).join('→')}`,
    `课体：${result.summary.coursePattern}`,
    `天地盘：${palaceLines.join('；')}`,
    `神煞：${result.shenSha.map(item => `${item.name}${item.value}`).join('、')}`,
    `规则：${result.methodology.method}；${result.methodology.timeBasis}`,
  ].join('\n')
}
