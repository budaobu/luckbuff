import { calculateBaziChart } from '@openfate/bazi-engine'
import { Solar } from 'lunar-javascript'
import type {
  TaiyiAcumMethod,
  TaiyiPaipanDoorPalace,
  TaiyiPaipanPillar,
  TaiyiPaipanResult,
} from '~~/app/types/taiyi-paipan'
import {
  NUM_TO_GONG,
  NUM_TO_LUOSHU,
} from './taiyi-paipan-constants'
import { TaiyiPaipanEngine } from './taiyi-paipan-engine'
import { formatWallTime, xunKong } from './taiyi-paipan-utils'

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

const DOOR_DIRECTIONS: Record<number, string> = {
  1: '北', 2: '西南', 3: '东', 4: '东南', 5: '中', 6: '西北', 7: '西', 8: '东北', 9: '南',
}

const DOOR_ELEMENTS: Record<number, string> = {
  1: '水', 2: '土', 3: '木', 4: '木', 5: '土', 6: '金', 7: '金', 8: '土', 9: '火',
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

function parseSolarDateTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value)
  if (!match) throw createError({ statusCode: 422, statusMessage: '真太阳时校正结果无效' })
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

function buildPillarsFromLunar(lunar: any, hour: number): TaiyiPaipanPillar[] {
  const dayLunar = hour >= 23 ? lunar.nextDay() : lunar
  const ganzhiByLabel = {
    year: lunar.getYearInGanZhiByLiChun(),
    month: lunar.getMonthInGanZhiExact(),
    day: dayLunar.getDayInGanZhi(),
    hour: lunar.getTimeInGanZhi(),
  }
  return (['year', 'month', 'day', 'hour'] as const).map((label) => {
    const ganzhi = ganzhiByLabel[label] || ''
    return { label, ganzhi, xunKong: xunKong(ganzhi) }
  })
}

export async function calculateTaiyiPaipan(input: {
  datetime: string
  timezone?: string
  location?: string
  longitude?: number
  latitude?: number
  jiStyle?: 'year' | 'month' | 'day' | 'hour'
  method?: TaiyiAcumMethod
}): Promise<TaiyiPaipanResult> {
  const instant = new Date(input.datetime)
  if (Number.isNaN(instant.getTime())) throw createError({ statusCode: 400, statusMessage: '起局时间无效' })
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

  const requestedParts = timePartsInZone(instant, timezone)
  let engineParts = timePartsInZone(instant, 'Asia/Shanghai')
  const trueSolarSupported = requestedParts.year >= 1800 && requestedParts.year <= 2100
  let solarTime: TaiyiPaipanResult['solarTime'] = {
    status: 'uncorrected',
    statusText: '未填地点或未解析坐标；按所选时区标准时转换到 UTC+8 起局，未做真太阳时校正。',
    requestedTimeText: formatWallTime(requestedParts),
    trueSolarTime: null,
    correctedEngineTimeText: null,
    longitudeOffsetMinutes: null,
    equationOfTimeMinutes: null,
    standardMeridian: null,
    algorithm: null,
    dayBoundaryChanged: false,
    hourBoundaryChanged: false,
  }

  if (input.longitude !== undefined && input.latitude !== undefined && !trueSolarSupported) {
    solarTime.statusText = '年份超出真太阳时校正支持范围；按 UTC+8 标准时排盘，未做静默替换。'
  }

  if (input.longitude !== undefined && input.latitude !== undefined && trueSolarSupported) {
    const solarChart = calculateBaziChart({
      year: requestedParts.year,
      month: requestedParts.month,
      day: requestedParts.day,
      hour: requestedParts.hour,
      minute: requestedParts.minute,
      gender: 'male',
      timezoneId: timezone,
      longitude: input.longitude,
      enableTrueSolarTime: true,
      dayBoundaryMode: 'ZI_HOUR_23',
    })
    const info = solarChart.solarTimeInfo
    if (!info) throw createError({ statusCode: 422, statusMessage: '无法完成真太阳时校正，请检查地点坐标或时间' })
    const trueParts = parseSolarDateTime(info.trueSolarDateTime)
    const originalWallMs = Date.UTC(requestedParts.year, requestedParts.month - 1, requestedParts.day, requestedParts.hour, requestedParts.minute)
    const trueWallMs = Date.UTC(trueParts.year, trueParts.month - 1, trueParts.day, trueParts.hour, trueParts.minute)
    const correctedInstant = new Date(instant.getTime() + ((trueWallMs - originalWallMs) / 60000) * 60000)
    engineParts = timePartsInZone(correctedInstant, 'Asia/Shanghai')
    const dayBoundaryChanged = engineParts.year !== requestedParts.year
      || engineParts.month !== requestedParts.month
      || engineParts.day !== requestedParts.day
    const hourBoundaryChanged = branchFromMinutes(requestedParts.hour * 60 + requestedParts.minute)
      !== branchFromMinutes(engineParts.hour * 60 + engineParts.minute)
    solarTime = {
      status: dayBoundaryChanged || hourBoundaryChanged ? 'boundary' : 'corrected',
      statusText: dayBoundaryChanged
        ? `已启用真太阳时：${info.trueSolarTime.slice(0, 5)}；校正后跨过日期边界，太乙局已重排。`
        : hourBoundaryChanged
          ? `已启用真太阳时：${info.trueSolarTime.slice(0, 5)}；校正后跨入新时辰边界。`
          : `已按地点完成真太阳时校正：${info.trueSolarTime.slice(0, 5)}。`,
      requestedTimeText: formatWallTime(requestedParts),
      trueSolarTime: info.trueSolarTime.slice(0, 5),
      correctedEngineTimeText: formatWallTime(engineParts),
      longitudeOffsetMinutes: Math.round(info.longitudeCorrectionMinutes * 10) / 10,
      equationOfTimeMinutes: Math.round(info.equationOfTimeMinutes * 10) / 10,
      standardMeridian: info.standardMeridian,
      algorithm: info.algorithm,
      dayBoundaryChanged,
      hourBoundaryChanged,
    }
  }

  const lunar = Solar.fromYmdHms(
    engineParts.year, engineParts.month, engineParts.day, engineParts.hour, engineParts.minute, 0,
  ).getLunar()
  const engine = new TaiyiPaipanEngine({
    year: engineParts.year,
    month: engineParts.month,
    day: engineParts.day,
    hour: engineParts.hour,
    minute: engineParts.minute,
    jiStyle: input.jiStyle || 'hour',
    method: input.method || 0,
  }, lunar)
  const board = engine.build()
  const doorPalaces = [8, 3, 4, 9, 2, 7, 6, 1].map<TaiyiPaipanDoorPalace>((palace) => ({
    palaceNumber: palace,
    palaceName: `${NUM_TO_LUOSHU[palace]!}${palace}`,
    direction: DOOR_DIRECTIONS[palace]!,
    element: DOOR_ELEMENTS[palace]!,
    door: board.doors[palace] || null,
    wangZhuai: engine.palaceWangZhuai(palace),
    isTaiyi: board.taiyiPalace === palace,
  }))

  const jiStyleText = { year: '年计', month: '月计', day: '日计', hour: '时计' }[input.jiStyle || 'hour']!
  const summaryLabelMap: Array<[string, string]> = [
    ['太乙落宫', `${NUM_TO_GONG[board.taiyiPalace]!}宫(${board.taiyiPalace})`],
    ['文昌天目', board.wenchang],
    ['始击', board.shiji],
    ['定目', board.dingMu],
    ['合神', board.heGod],
    ['计神', board.jiGod],
    ['太岁', board.taiSui],
    ['君基', board.kingBase],
    ['臣基', board.officerBase],
    ['民基', board.peopleBase],
    ['四神', board.fourGod],
    ['天乙', board.skyYi],
    ['地乙', board.earthYi],
    ['直符', board.zhiFu],
    ['飞符', board.flyFu],
    ['五福', board.fiveFortune],
    ['八门值事', board.doorValue],
  ]

  return {
    input: {
      requestedTime: instant.toISOString(),
      requestedTimezone: timezone,
      location: input.location?.trim() || '未填写',
      longitude: input.longitude,
      latitude: input.latitude,
      engineTime: formatWallTime(engineParts),
      engineTimeBasis: solarTime.status === 'uncorrected'
        ? '已转换为 UTC+8 墙上时钟后起局'
        : '已按真太阳时转换为 UTC+8 墙上时钟后起局',
    },
    solarTime,
    summary: {
      jiStyle: input.jiStyle || 'hour',
      jiStyleText,
      method: input.method || 0,
      methodText: { 0: '太乙统宗', 1: '太乙金镜', 2: '太乙淘金歌', 3: '太乙局' }[input.method || 0]!,
      dunType: board.dunType,
      dunTypeText: board.dunTypeText,
      juNumber: board.juNumber,
      juText: board.juText,
      sancai: board.sancai,
      accNumber: board.accNumber,
      jiyuan: board.jiyuan,
      fiveYuanJu: board.fiveYuanJu,
      taiSui: board.taiSui,
      heGod: board.heGod,
      jiGod: board.jiGod,
      taiyiPalace: board.taiyiPalace,
      taiyiPalaceName: board.taiyiPalaceName,
      taiyiHomeAway: board.taiyiHomeAway,
      wenchang: board.wenchang,
      wenchangState: board.wenchangState,
      shiji: board.shiji,
      shijiXiu: board.shijiXiu,
      dingMu: board.dingMu,
      yearXiu: board.yearXiu,
      threeDoors: board.threeDoors,
      fiveGenerals: board.fiveGenerals,
      homeAwayRelation: board.homeAwayRelation,
      victoryJudgement: board.victoryJudgement,
      yangJiu: board.yangJiu,
      baiLiu: board.baiLiu,
      yearGua: board.yearGua,
      dayGua: board.dayGua,
      hourGua: board.hourGua,
    },
    pillars: buildPillarsFromLunar(lunar, engineParts.hour),
    calendars: {
      solarText: formatWallTime(engineParts),
      lunarText: lunar.toString(),
      jieQi: lunar.getJieQi() || lunar.getPrevJieQi(true).getName(),
      dayOfficer: lunar.getZhiXing(),
      dayXiu: lunar.getXiu(),
      yearGanZhi: lunar.getYearInGanZhi(),
    },
    spirits: summaryLabelMap.map(([label, value]) => ({ label, value })),
    calculations: [
      { label: '主算', ...board.home },
      { label: '客算', ...board.away },
      { label: '定算', ...board.fixed },
    ],
    bases: [
      { label: '阳九', value: board.yangJiu },
      { label: '百六', value: board.baiLiu },
      { label: '太岁禽星', value: board.yearXiu },
      { label: '始击值宿', value: board.shijiXiu },
      { label: '三门', value: board.threeDoors },
      { label: '五将', value: board.fiveGenerals },
      { label: '主客', value: board.homeAwayRelation },
      { label: '胜负', value: board.victoryJudgement },
      { label: '值年卦', value: board.yearGua },
      { label: '值日卦', value: board.dayGua },
      { label: '值时卦', value: board.hourGua },
    ],
    chart: {
      palaces: board.palaces,
      doors: doorPalaces,
    },
    patterns: board.patterns,
    methodology: {
      engine: 'lunar-javascript 1.7.0 + Taiyi Paipan Core',
      method: '太乙统宗积年起局；局式、主客定算、神将、八门与格局同盘输出',
      calendar: 'lunar-javascript 定气历法；以立春与节气校正年月口径',
      timeBasis: 'UTC+8 排盘基准；有坐标时先做真太阳时校正',
      trueSolarTime: solarTime.statusText,
      disclaimer: '太乙神数排盘结果仅供文化研究与传统命理参考，不构成医疗、法律、财务或重大决策建议。',
    },
  }
}

export function compactTaiyiPaipanContext(result: TaiyiPaipanResult) {
  const palaceLines = result.chart.palaces.map(palace =>
    `${palace.position}(${palace.palaceNumber ?? '中'})：${palace.gods.join('、') || '无'}`)
  const doorLines = result.chart.doors.map(palace =>
    `${palace.palaceName}${palace.door ? `${palace.door}门` : '无门'} ${palace.wangZhuai}`)
  return [
    `起局：${result.input.engineTime}；计式：${result.summary.jiStyleText}；流派：${result.summary.methodText}`,
    `真太阳时：${result.solarTime.trueSolarTime || '未校正'}；${result.solarTime.statusText}`,
    `${result.summary.dunTypeText}${result.summary.juNumber}局；积数${result.summary.accNumber}；${result.summary.sancai}；纪元${result.summary.jiyuan}`,
    `四柱：${result.pillars.map(pillar => pillar.ganzhi).join(' ')}`,
    `太乙：${result.summary.taiyiPalaceName}宫；${result.summary.taiyiHomeAway}；文昌${result.summary.wenchang}；始击${result.summary.shiji}；定目${result.summary.dingMu}`,
    `主算${result.calculations[0]?.value}将${result.calculations[0]?.general}；客算${result.calculations[1]?.value}将${result.calculations[1]?.general}；定算${result.calculations[2]?.value}将${result.calculations[2]?.general}`,
    `主客：${result.summary.homeAwayRelation}；${result.summary.victoryJudgement}；${result.summary.threeDoors}；${result.summary.fiveGenerals}`,
    `十六宫：${palaceLines.join('；')}`,
    `八门旺衰：${doorLines.join('；')}`,
    `格局：${result.patterns.map(pattern => `${pattern.name}(${pattern.detail})`).join('、')}`,
  ].join('\n')
}
