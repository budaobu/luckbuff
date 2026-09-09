import { calculateBaziChart } from '@openfate/bazi-engine'
import { Solar } from 'lunar-javascript'
import versesJson from '../../data/tieban/verses.json'
import tablesJson from '../../data/tieban/tables.json'
import type {
  TiebanFlowYear,
  TiebanFormulaItem,
  TiebanPaipanCalcInput,
  TiebanPaipanResult,
  TiebanVerse,
} from '~~/app/types/tieban-paipan'

const GANS = '甲乙丙丁戊己庚辛壬癸'
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const BRANCH_GROUPS: Record<string, string> = {
  子: '申子辰',
  辰: '申子辰',
  申: '申子辰',
  寅: '寅午戌',
  午: '寅午戌',
  戌: '寅午戌',
  巳: '巳酉丑',
  酉: '巳酉丑',
  丑: '巳酉丑',
  亥: '亥卯未',
  卯: '亥卯未',
  未: '亥卯未',
}
const QUARTER_MINUTES = [
  { label: '初刻', stem: '甲', value: 1 },
  { label: '一刻', stem: '乙', value: 2 },
  { label: '二刻', stem: '丙', value: 3 },
  { label: '三刻', stem: '丁', value: 4 },
  { label: '四刻', stem: '戊', value: 5 },
  { label: '五刻', stem: '己', value: 6 },
  { label: '六刻', stem: '庚', value: 7 },
  { label: '正刻', stem: '辛', value: 8 },
] as const
const LETTER_CORRECTIONS: Record<string, number> = {
  福: 1, 分: 1, 粉: 1, 方: 1, 务: 1, 勿: 1, 娼: 1, 问: 1,
  器: 2, 坷: 2, 玄: 2, 和: 2,
  忆: 3, 召: 3, 滞: 3, 桃: 3, 舌: 3, 离: 3, 誓: 3, 绍: 3,
  龙: 4, 吏: 4, 鲁: 4, 禄: 4, 动: 4, 弟: 4, 社: 4, 屯: 4,
  神: 5, 肾: 5, 物: 5, 尾: 5,
  等: 6, 亶: 6, 旦: 6, 刀: 6, 西: 6, 萨: 6, 訾: 6, 省: 6,
}

interface TiebanTables {
  month: Array<{ month: number, value: number }>
  hourBranch: Array<{ branch: string, value: number }>
  soundPairs: Array<{ range: string, groups: string[] }>
  soundValues: Array<{ sound: string, value: number }>
  dayLife: Array<{ nayin: string, stems: string[] }>
  hourFortune: Array<{ nayin: string, value: number }>
  kaoke: Array<{ group: string, condition: string, quarter: string }>
  detailedHexagrams: Array<{ quarter: string, value: number, hexagram: string }>
  natal: Array<{
    hexagram: string
    base: number
    initialValue: number
    regularValue: number
    ordinal: number
    themes: string[]
  }>
  flowStart: Array<{ branchGroup: string, gender: string, value: number }>
  flowFourSounds: Array<{ value: number, stem: string, months: string[] }>
  branchMarks: Array<{ branch: string, value: number, mark: string }>
  marks: Array<{ quarter: string, parity: string, sound: string, mark: string, letter: string }>
  flowVerses: Array<{ correction: number, letter: string, age: number, base: number, add: number }>
}

const tables = tablesJson as TiebanTables
const verseById = new Map<number, { volume: string, ages: string, text: string }>(
  versesJson.map(verse => [verse.id, verse]),
)

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

function zoneOffsetMs(wallMs: number, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(formatter.formatToParts(new Date(wallMs)).map(part => [part.type, part.value]))
  const representedMs = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  return representedMs - wallMs
}

function instantFromZoneWall(parts: { year: number, month: number, day: number, hour: number, minute: number }, timeZone: string) {
  const wallMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
  let offsetMs = zoneOffsetMs(wallMs, timeZone)
  offsetMs = zoneOffsetMs(wallMs - offsetMs, timeZone)
  return new Date(wallMs - offsetMs)
}

function parseTrueSolarTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value)
  if (!match) {
    throw createError({ statusCode: 422, statusMessage: '真太阳时校正结果无效' })
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
  return BRANCHES[Math.floor((((minutes % 1440) + 1440) % 1440) / 120)] || '子'
}

function nayinElement(nayin: string) {
  return nayin.slice(-1)
}

function ganzhiAt(baseGanzhi: string, steps: number) {
  const ganIndex = GANS.indexOf(baseGanzhi.slice(0, 1))
  const branchIndex = BRANCHES.indexOf(baseGanzhi.slice(1))
  if (ganIndex < 0 || branchIndex < 0) return baseGanzhi
  return `${GANS[(ganIndex + steps) % 60 % 10]}${BRANCHES[(branchIndex + steps) % 12]}`
}

function makeVerse(id: number | null, requestedIds: Set<number>): TiebanVerse {
  const numericId = id ?? 0
  requestedIds.add(numericId)
  const verse = numericId > 0 ? verseById.get(numericId) : undefined
  return {
    id: numericId,
    volume: verse?.volume || '',
    ages: verse?.ages || '',
    text: verse?.text || '',
    available: !!verse,
  }
}

function buildNatalFormulas(row: NonNullable<TiebanTables['natal'][number]>, labels: string[], requestedIds: Set<number>) {
  const items: TiebanFormulaItem[] = []
  row.themes.forEach((theme, themeIndex) => {
    const ids = Array.from(theme.matchAll(/\d+/g)).map(match => Number(match[0]))
    if (!ids.length) {
      items.push({
        label: labels[themeIndex] || '条文',
        formula: `${row.base} + ${row.ordinal} + 无条`,
        verse: makeVerse(null, requestedIds),
      })
      return
    }
    for (const id of ids) {
      items.push({
        label: labels[themeIndex] || '条文',
        formula: `${row.base} + ${row.ordinal} + ${id} = ${row.base + row.ordinal + id}`,
        verse: makeVerse(row.base + row.ordinal + id, requestedIds),
      })
    }
  })
  return items
}

export async function calculateTiebanPaipan(input: TiebanPaipanCalcInput): Promise<TiebanPaipanResult> {
  if (!/^(\d{4})-(\d{2})-(\d{2})$/.test(input.birthDate)) {
    throw createError({ statusCode: 400, statusMessage: '出生日期格式必须是 YYYY-MM-DD' })
  }
  if (!/^(\d{2}):(\d{2})$/.test(input.birthTime)) {
    throw createError({ statusCode: 400, statusMessage: '出生时间格式必须是 HH:mm' })
  }
  if (input.gender !== 'male' && input.gender !== 'female') {
    throw createError({ statusCode: 400, statusMessage: '性别为必填项' })
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

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.birthDate)!
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(input.birthTime)!
  const requestedParts = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  }
  const requestedMs = Date.UTC(requestedParts.year, requestedParts.month - 1, requestedParts.day, requestedParts.hour, requestedParts.minute)
  if (requestedMs < Date.UTC(1900, 0, 1) || requestedMs > Date.UTC(2100, 11, 31, 23, 59)) {
    throw createError({ statusCode: 400, statusMessage: '出生时间须在 1900 至 2100 年之间' })
  }

  const requestedInstant = instantFromZoneWall(requestedParts, timezone)
  let engineParts = timePartsInZone(requestedInstant, 'Asia/Shanghai')
  let solarTime: TiebanPaipanResult['solarTime'] = {
    status: 'uncorrected',
    statusText: '未填地点或未解析坐标；按所选时区标准时计算，未校正。',
    requestedTimeText: `${input.birthDate} ${input.birthTime}`,
    trueSolarTimeText: null,
    correctedTimeText: null,
    longitudeOffsetMinutes: null,
    equationOfTimeMinutes: null,
    standardMeridian: null,
    algorithm: null,
    dayBoundaryChanged: false,
    hourBoundaryChanged: false,
  }

  if (input.longitude !== undefined && input.latitude !== undefined) {
    const sourceChart = calculateBaziChart({
      ...requestedParts,
      gender: input.gender,
      timezoneId: timezone,
      longitude: input.longitude,
      enableTrueSolarTime: true,
      dayBoundaryMode: 'ZI_HOUR_23',
    })
    const info = sourceChart.solarTimeInfo
    if (!info?.trueSolarDateTime) {
      throw createError({ statusCode: 422, statusMessage: '无法完成真太阳时校正，请检查地点坐标或时间' })
    }

    const trueParts = parseTrueSolarTime(info.trueSolarDateTime)
    const requestedWallMs = Date.UTC(requestedParts.year, requestedParts.month - 1, requestedParts.day, requestedParts.hour, requestedParts.minute)
    const trueWallMs = Date.UTC(trueParts.year, trueParts.month - 1, trueParts.day, trueParts.hour, trueParts.minute)
    const correctionMinutes = (trueWallMs - requestedWallMs) / 60000
    const correctedInstant = new Date(requestedInstant.getTime() + correctionMinutes * 60000)
    engineParts = timePartsInZone(correctedInstant, 'Asia/Shanghai')
    const dayBoundaryChanged = trueParts.year !== requestedParts.year
      || trueParts.month !== requestedParts.month
      || trueParts.day !== requestedParts.day
    const hourBoundaryChanged = branchFromMinutes(requestedParts.hour * 60 + requestedParts.minute)
      !== branchFromMinutes(trueParts.hour * 60 + trueParts.minute)

    solarTime = {
      status: dayBoundaryChanged || hourBoundaryChanged ? 'boundary' : 'corrected',
      statusText: dayBoundaryChanged
        ? `已启用真太阳时：${info.trueSolarTime.slice(0, 5)}；校正后跨日期边界，四柱与农历已重排。`
        : hourBoundaryChanged
          ? `已启用真太阳时：${info.trueSolarTime.slice(0, 5)}；校正后跨时辰边界。`
          : `已按地点完成真太阳时校正：${info.trueSolarTime.slice(0, 5)}；未跨边界。`,
      requestedTimeText: `${input.birthDate} ${input.birthTime}`,
      trueSolarTimeText: info.trueSolarTime.slice(0, 5),
      correctedTimeText: formatZoneTime(engineParts),
      longitudeOffsetMinutes: Math.round(info.longitudeCorrectionMinutes * 10) / 10,
      equationOfTimeMinutes: Math.round(info.equationOfTimeMinutes * 10) / 10,
      standardMeridian: info.standardMeridian,
      algorithm: info.algorithm,
      dayBoundaryChanged,
      hourBoundaryChanged,
    }
  }

  const solar = Solar.fromYmdHms(engineParts.year, engineParts.month, engineParts.day, engineParts.hour, engineParts.minute, 0)
  const lunar = solar.getLunar()
  const calendar = calculateBaziChart({
    ...engineParts,
    gender: input.gender,
    timezoneId: 'Asia/Shanghai',
    enableTrueSolarTime: false,
    dayBoundaryMode: 'ZI_HOUR_23',
  })
  const hourPillar = calendar.pillars.hour
  if (!hourPillar?.ganZhi) {
    throw createError({ statusCode: 422, statusMessage: '未能取得时柱，无法完成铁板神数排盘' })
  }
  const ganzhi = {
    year: calendar.pillars.year.ganZhi,
    month: calendar.pillars.month.ganZhi,
    day: calendar.pillars.day.ganZhi,
    hour: hourPillar.ganZhi,
  }

  const lunarMonth = Math.abs(lunar.getMonth())
  const leapMonth = lunar.getMonth() < 0
  const monthIndex = leapMonth && lunarMonth + 1 > 12 ? 1 : lunarMonth + (leapMonth ? 1 : 0)
  const lunarMonthValue = tables.month.find(row => row.month === monthIndex)?.value ?? monthIndex
  const hourBranch = ganzhi.hour.slice(1)
  const hourBranchValue = tables.hourBranch.find(row => row.branch === hourBranch)?.value ?? 0
  const innate = ((lunarMonthValue + 3 - hourBranchValue - 1) % 12 + 12) % 12 + 1
  const yearGan = ganzhi.year.slice(0, 1)
  const ganGroupIndex = GANS.indexOf(yearGan) % 5
  const ganGroup = ['甲己', '乙庚', '丙辛', '丁壬', '戊癸'][ganGroupIndex] || '甲己'
  const soundPair = tables.soundPairs.find(row => row.range.split('|').map(Number).includes(innate))
  const sound = soundPair?.groups[ganGroupIndex] || '宫'
  const soundValue = tables.soundValues.find(row => row.sound === sound)?.value ?? 5
  const dayNayinElement = nayinElement(calendar.pillars.day.naYin)
  const hourNayinElement = nayinElement(hourPillar.naYin)
  const dayStem = ganzhi.day.slice(0, 1)
  const dayLife = tables.dayLife.find(row => row.nayin === dayNayinElement)
    ?.stems[GANS.indexOf(dayStem)] || '0'
  const dayLifeValue = Number(dayLife) || 0
  const timeFortune = tables.hourFortune.find(row => row.nayin === hourNayinElement)?.value ?? 0
  const sumValue = dayLifeValue + timeFortune
  const yearGanIsYang = '甲丙戊庚壬'.includes(yearGan)
  const genderText = input.gender === 'male' ? '男' as const : '女' as const
  const kaokeGroup = (genderText === '男') === yearGanIsYang ? '阳男阴女' : '阴男阳女'
  const kaokeQuarter = tables.kaoke.find(row => row.group === kaokeGroup && row.condition === (sumValue > 6 ? '>6' : '<=6'))?.quarter === '初刻'
    ? '初刻' as const
    : '正刻' as const
  const baseValue = soundValue * 5 + dayLifeValue + timeFortune
  const fact = sumValue <= 6 ? baseValue - 1 : baseValue - 6
  const lifeNumber = fact * 30 + lunar.getDay()
  const detailedHexagram = tables.detailedHexagrams.find(row => row.quarter === kaokeQuarter && row.value === lifeNumber)
  const hexagram = detailedHexagram?.hexagram
  if (!hexagram) {
    throw createError({ statusCode: 422, statusMessage: `取数表缺少 ${kaokeQuarter} / 本命数 ${lifeNumber} 的卦象` })
  }
  const natalRow = tables.natal.find(row => row.hexagram === hexagram
    && (kaokeQuarter === '初刻' ? row.initialValue : row.regularValue) === innate)
  if (!natalRow) {
    throw createError({ statusCode: 422, statusMessage: `取数表缺少 ${hexagram} / ${kaokeQuarter} / 先天命数 ${innate} 的本命数据` })
  }

  const minuteQuarter = QUARTER_MINUTES[Math.min(Math.floor(engineParts.minute / 15), 7)]!
  const acquiredRaw = innate + lifeNumber
  const acquired = acquiredRaw % 8 || 8
  const requestedIds = new Set<number>()
  const natalLabels = ['性格', '才能前程', '财运', '兄弟个数']
  const natalFormulas = buildNatalFormulas(natalRow, natalLabels, requestedIds)
  const minuteTargetId = natalRow.base + minuteQuarter.value * 48
  makeVerse(minuteTargetId, requestedIds)

  const branchGroup = BRANCH_GROUPS[ganzhi.year.slice(1)] || ''
  const flowStart = tables.flowStart.find(row => row.branchGroup === branchGroup && row.gender === genderText)?.value ?? 0
  if (!flowStart) {
    throw createError({ statusCode: 422, statusMessage: `取数表缺少年支组 ${branchGroup} / ${genderText} 的流年起始数` })
  }
  const soundRow = tables.flowFourSounds.find(row => row.value === innate && row.stem === yearGan)
  if (!soundRow) {
    throw createError({ statusCode: 422, statusMessage: `取数表缺少先天命数 ${innate} / 年干 ${yearGan} 的流年四声表` })
  }
  const soundOffset = (13 - flowStart) % 12
  const flowYears: TiebanFlowYear[] = []

  for (let age = 1; age <= 108; age += 1) {
    const flowGanzhi = ganzhiAt(ganzhi.year, age - 1)
    const flowSound = soundRow.months[(age - 1 + soundOffset) % 12] || '?'
    const marker = tables.branchMarks.find(row => row.branch === flowGanzhi.slice(1) && row.value === acquired)?.mark || '?'
    const parity = age % 2 === 1 ? '奇数' : '偶数'
    const markRow = tables.marks.find(row => row.quarter === kaokeQuarter
      && row.parity === parity
      && row.sound === flowSound
      && row.mark === marker)
    const letter = markRow?.letter || '?'
    const sourceRow = tables.flowVerses.find(row => row.letter === letter && row.age === age)
    const correction = sourceRow?.correction ?? 0
    const correctedCorrection = correction === 0
      ? 0
      : (correction + ((age <= 10 || age >= 81) ? 2 : 3) - 1) % (age <= 10 || age >= 81 ? 6 : 20) + 1
    const correctedRow = correctedCorrection > 0
      ? tables.flowVerses.find(row => row.correction === correctedCorrection && row.age === age)
      : undefined
    const correctedLetter = correctedCorrection > 0
      ? Object.entries(LETTER_CORRECTIONS).find(([, value]) => value === correctedCorrection)?.[0] || '?'
      : ''
    const verseId = sourceRow ? sourceRow.base + sourceRow.add : null
    const correctedVerseId = correctedRow ? correctedRow.base + correctedRow.add : null

    flowYears.push({
      age,
      ganzhi: flowGanzhi,
      sound: flowSound,
      marker,
      letter,
      correction,
      correctedCorrection,
      correctedLetter,
      formula: sourceRow ? `${sourceRow.base} + ${sourceRow.add}` : '无条',
      verse: makeVerse(verseId, requestedIds),
      correctedFormula: correctedRow ? `${correctedRow.base} + ${correctedRow.add}` : '无条',
      correctedVerse: makeVerse(correctedVerseId, requestedIds),
    })
  }

  const availableCount = Array.from(requestedIds).filter(id => verseById.has(id)).length
  const missingCount = requestedIds.size - availableCount

  return {
    input: {
      requestedDate: input.birthDate,
      requestedTime: input.birthTime,
      timezone,
      location: input.location?.trim() || '未填写',
      longitude: input.longitude,
      latitude: input.latitude,
      engineTimeText: formatZoneTime(engineParts),
      engineTimeBasis: solarTime.status === 'uncorrected'
        ? '按所选时区标准时计算'
        : '按真太阳时转换到 UTC+8 后计算',
    },
    birth: {
      solarText: `${input.birthDate} ${input.birthTime}`,
      lunarText: lunar.toString(),
      lunarDetail: `${leapMonth ? '闰' : ''}${lunarMonth}月${lunar.getDay()}日 · ${lunar.getSeason()}`,
      zodiac: lunar.getYearShengXiao(),
      genderText,
      minuteQuarter: { ...minuteQuarter },
    },
    solarTime,
    pillars: (['year', 'month', 'day', 'hour'] as const).map((label) => {
      const pillar = calendar.pillars[label]!
      return {
        label,
        ganzhi: pillar.ganZhi,
        nayin: pillar.naYin,
      }
    }),
    numbers: {
      lunarMonthValue,
      hourBranchValue,
      innate,
      sound,
      soundValue,
      dayNayinElement,
      hourNayinElement,
      dayLife: dayLifeValue,
      timeFortune,
      kaokeGroup,
      kaokeQuarter,
      lifeNumber,
      acquired,
      minuteFormula: `${natalRow.base} + ${minuteQuarter.value} × 48 = ${minuteTargetId}`,
    },
    natal: {
      hexagram,
      base: natalRow.base,
      ordinal: natalRow.ordinal,
      formulas: natalFormulas,
    },
    flowYears,
    corpus: {
      status: missingCount ? 'partial' : 'available',
      availableCount,
      requestedCount: requestedIds.size,
      missingCount,
      source: '清代铁板神数公版条文与十四考取数表；社区转录未经善本校勘。',
      fidelity: '仅收录公版数据行；未使用上游代码、注解或方法综述。',
    },
    methodology: {
      engine: 'Luckbuff tieban core + @openfate/bazi-engine + lunar-javascript',
      calendar: '定气节气；农历闰月并入下月计数',
      timeBasis: solarTime.status === 'uncorrected'
        ? '按所选时区标准时计算；未做真太阳时校正'
        : '先做真太阳时校正，再按 23:00 换日重排',
      kaoke: `${kaokeGroup}；日命 ${dayLifeValue} + 时运 ${timeFortune} 定为${kaokeQuarter}`,
      corpus: '条文只用于数序检索，不用于医师、法律或投资判断。',
      disclaimer: '铁板神数结果仅供文化研究与传统命理参考，不构成任何重大决策建议。',
    },
  }
}

export function compactTiebanPaipanContext(result: TiebanPaipanResult) {
  const natalLines = result.natal.formulas.map(item => `${item.label}=${item.formula}:${item.verse.available ? item.verse.text : '缺条'}`)
  const flowLines = result.flowYears.map(item => [
    item.age,
    item.ganzhi,
    item.sound,
    item.marker,
    item.letter,
    item.formula,
    item.verse.available ? item.verse.text : '缺条',
  ].join('/'))

  return [
    `出生：${result.birth.solarText}；性别：${result.birth.genderText}；地点：${result.input.location}`,
    `真太阳时：${result.solarTime.trueSolarTimeText || '未校正'}；${result.solarTime.statusText}`,
    `四柱：${result.pillars.map(pillar => pillar.ganzhi).join(' ')}`,
    `农历：${result.birth.lunarText}；${result.birth.lunarDetail}；生肖：${result.birth.zodiac}`,
    `取数：先天${result.numbers.innate}，五音${result.numbers.sound}${result.numbers.soundValue}，日命${result.numbers.dayLife}，时运${result.numbers.timeFortune}`,
    `考刻：${result.numbers.kaokeGroup}，${result.numbers.kaokeQuarter}；本命数${result.numbers.lifeNumber}；${result.natal.hexagram}；后天命数${result.numbers.acquired}`,
    `八刻：${result.birth.minuteQuarter.label}${result.birth.minuteQuarter.stem}${result.birth.minuteQuarter.value}；公式${result.numbers.minuteFormula}`,
    `本命：${natalLines.join('；')}`,
    `流年：${flowLines.join('；')}`,
    `语料：${result.corpus.status}；可用${result.corpus.availableCount}/${result.corpus.requestedCount}；${result.corpus.fidelity}`,
  ].join('\n')
}
