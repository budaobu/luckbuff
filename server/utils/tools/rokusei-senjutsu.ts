import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'
import type {
  RokuseiAnnualPhase,
  RokuseiBaziPillar,
  RokuseiCyclePhase,
  RokuseiDailyPhase,
  RokuseiFateCycle,
  RokuseiMonthlyPhase,
  RokuseiSenjutsuResult,
  RokuseiSign,
  RokuseiStarId,
} from '~~/app/types/rokusei-senjutsu'

const GANS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

const CYCLE_PHASES = [
  { id: 'seed', rank: 'normal' },
  { id: 'growth', rank: 'normal' },
  { id: 'blossom', rank: 'normal' },
  { id: 'health', rank: 'small' },
  { id: 'achievement', rank: 'normal' },
  { id: 'turbulence', rank: 'middle' },
  { id: 'reunion', rank: 'normal' },
  { id: 'wealth', rank: 'normal' },
  { id: 'stability', rank: 'normal' },
  { id: 'shadow', rank: 'big' },
  { id: 'stop', rank: 'big' },
  { id: 'decline', rank: 'big' },
] as const

const STOP_INDEX = 10
const BASE_YEAR = 2026
const STAR_BASE_2026: Record<string, number> = {
  'uranus-plus': 0,
  'jupiter-minus': 1,
  'jupiter-plus': 2,
  'mercury-minus': 3,
  'mercury-plus': 4,
  'earth-minus': 5,
  'earth-plus': 6,
  'venus-minus': 7,
  'venus-plus': 8,
  'mars-minus': 9,
  'mars-plus': 10,
  'uranus-minus': 11,
}

const STAR_TABLE = [
  { id: 'earth', name: '土星人', min: 1, max: 10, void: ['戌', '亥'] },
  { id: 'venus', name: '金星人', min: 11, max: 20, void: ['申', '酉'] },
  { id: 'mars', name: '火星人', min: 21, max: 30, void: ['午', '未'] },
  { id: 'uranus', name: '天王星人', min: 31, max: 40, void: ['辰', '巳'] },
  { id: 'jupiter', name: '木星人', min: 41, max: 50, void: ['寅', '卯'] },
  { id: 'mercury', name: '水星人', min: 51, max: 60, void: ['子', '丑'] },
] as const

const OPPOSITE_STAR: Record<RokuseiStarId, RokuseiStarId> = {
  earth: 'uranus',
  uranus: 'earth',
  venus: 'jupiter',
  jupiter: 'venus',
  mars: 'mercury',
  mercury: 'mars',
}

const FATE_STAR_BY_TEN_GOD: Record<string, string> = {
  比肩: 'will',
  劫财: 'harmony',
  食神: 'play',
  伤官: 'solitude',
  偏财: 'flowing-wealth',
  正财: 'family-wealth',
  七杀: 'work',
  正官: 'institution',
  偏印: 'change',
  正印: 'learning',
}

function starByNumber(starNumber: number) {
  return STAR_TABLE.find(star => starNumber >= star.min && starNumber <= star.max)
}

function sixtyCycleNumber(ganzhi: string) {
  const gan = GANS.findIndex(item => item === ganzhi.slice(0, 1))
  const zhi = BRANCHES.findIndex(item => item === ganzhi.slice(1, 2))
  if (gan < 0 || zhi < 0) {
    throw createError({ statusCode: 500, statusMessage: '日柱干支无效' })
  }
  for (let number = 1; number <= 60; number += 1) {
    if ((number - 1) % 10 === gan && (number - 1) % 12 === zhi) return number
  }
  throw createError({ statusCode: 500, statusMessage: '日柱干支无法转换为星数' })
}

function annualPhase(typeKey: string, year: number): RokuseiCyclePhase {
  const base = STAR_BASE_2026[typeKey]
  if (base === undefined) {
    throw createError({ statusCode: 500, statusMessage: '六星类型缺少周期基准' })
  }
  const index = (((base + year - BASE_YEAR) % 12) + 12) % 12
  return { index, ...CYCLE_PHASES[index]! }
}

function dayOfYear(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1)
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.round((current - start) / 86_400_000) + 1
}

function dailyPhase(typeKey: string, date: Date, today: Date): RokuseiDailyPhase {
  const annual = annualPhase(typeKey, date.getUTCFullYear())
  const index = (annual.index + dayOfYear(date) - 1) % 12
  return {
    index,
    ...CYCLE_PHASES[index]!,
    date: date.toISOString().slice(0, 10),
    isToday: date.toISOString().slice(0, 10) === today.toISOString().slice(0, 10),
  }
}

function currentTokyoDate() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map(part => [part.type, part.value]))
  return new Date(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}Z`)
}

function buildBaziPillars(chart: BaziChartResult): RokuseiBaziPillar[] {
  return chart.pillars.map(pillar => ({
    key: pillar.key,
    label: pillar.label,
    ganzhi: pillar.ganzhi,
    shishen: pillar.key === 'day' ? '日主' : pillar.shishenGan,
    voidBranches: pillar.xunKong,
  }))
}

function buildFateCycles(chart: BaziChartResult, voidBranches: string[]): RokuseiFateCycle[] {
  return chart.dayuns.map((cycle) => {
    const branch = cycle.ganzhi.slice(-1)
    return {
      index: cycle.index,
      ganzhi: cycle.ganzhi,
      fateStarId: FATE_STAR_BY_TEN_GOD[cycle.shishenGan] ?? 'unknown',
      tenGod: cycle.shishenGan,
      startYear: cycle.startYear,
      endYear: cycle.endYear,
      startAge: cycle.startAge,
      endAge: cycle.endAge,
      isFateKill: voidBranches.includes(branch),
      isCurrent: cycle.isCurrent,
    }
  })
}

export async function calculateRokuseiSenjutsu(input: {
  birthDate: string
  birthHour: string
  gender: 'male' | 'female'
  location?: {
    name: string
    longitude?: number
    latitude?: number
    timezone?: string
  } | null
}): Promise<RokuseiSenjutsuResult> {
  const chart = await calculateBaziChartResult({
    birthDate: input.birthDate,
    birthHour: input.birthHour as never,
    gender: input.gender,
    location: input.location?.name ? input.location : null,
  })

  const dayPillar = chart.pillars.find(pillar => pillar.key === 'day')
  const yearPillar = chart.pillars.find(pillar => pillar.key === 'year')
  if (!dayPillar || !yearPillar) {
    throw createError({ statusCode: 500, statusMessage: '六星排盘缺少日柱或年柱' })
  }

  const starNumber = sixtyCycleNumber(dayPillar.ganzhi)
  const matchedStar = starByNumber(starNumber)
  if (!matchedStar) {
    throw createError({ statusCode: 500, statusMessage: '星数未落入六星区间' })
  }

  const calendarYear = Number(input.birthDate.slice(0, 4))
  const yearBranchCandidates = [calendarYear, calendarYear - 1].filter(year =>
    BRANCHES[((year - 4) % 12 + 12) % 12] === yearPillar.zhi)
  const birthYear = yearBranchCandidates[0] ?? calendarYear
  const yearBranchIndex = BRANCHES.indexOf(yearPillar.zhi as never)
  const sign: RokuseiSign = yearBranchIndex % 2 === 0 ? 'plus' : 'minus'
  const typeKey = `${matchedStar.id}-${sign}`
  const isReigo = annualPhase(typeKey, birthYear).index === STOP_INDEX
  const today = currentTokyoDate()
  const currentYear = today.getUTCFullYear()

  const annualTimeline: RokuseiAnnualPhase[] = Array.from({ length: 12 }, (_, offset) => {
    const year = currentYear - 1 + offset
    return { year, ...annualPhase(typeKey, year) }
  })

  const monthly: RokuseiMonthlyPhase[] = Array.from({ length: 12 }, (_, monthOffset) => {
    const annual = annualPhase(typeKey, currentYear)
    const index = (annual.index + 8 + monthOffset) % 12
    return { month: monthOffset + 1, index, ...CYCLE_PHASES[index]! }
  })

  const daily: RokuseiDailyPhase[] = Array.from({ length: 12 }, (_, offset) => {
    const date = new Date(today)
    date.setUTCDate(date.getUTCDate() + offset)
    return dailyPhase(typeKey, date, today)
  })

  const fateCycles = buildFateCycles(chart, [...matchedStar.void])
  const oppositeStarId = OPPOSITE_STAR[matchedStar.id]
  const phase = annualPhase(typeKey, currentYear)

  return {
    input: {
      birthDate: input.birthDate,
      birthHour: input.birthHour,
      gender: input.gender,
      locationName: input.location?.name || '未填写',
    },
    bazi: {
      pillars: buildBaziPillars(chart),
      dayMaster: dayPillar.gan,
      dayunDirection: chart.dayunMeta.direction,
      dayunStartDate: chart.dayunMeta.startDate.slice(0, 10),
    },
    birth: {
      year: birthYear,
      yearBranch: yearPillar.zhi,
      starNumber,
      dayGanZhi: dayPillar.ganzhi,
      starId: matchedStar.id,
      sign,
      typeKey,
      voidBranches: [...matchedStar.void],
      isReigo,
      oppositeStarId,
    },
    annual: {
      year: currentYear,
      phase,
      oppositePhase: annualPhase(`${oppositeStarId}-${sign}`, currentYear),
      timeline: annualTimeline,
    },
    monthly,
    daily,
    fateCycles,
    activeFateCycle: fateCycles.find(cycle => cycle.isCurrent) ?? null,
    methodology: {
      calendar: chart.methodology.trueSolarTime,
      starRule: '以真太阳时校正后的日柱干支序号（甲子=1，癸亥=60）分六星。',
      signRule: '以节气校正后的年支取阴阳：子寅辰午申戌为阳（＋），丑卯巳未酉亥为阴（−）。',
      cycleRule: '十二运势按年、月、日三层循环；大杀界为阴影、停止、减退，中杀界为乱气，小杀界为健弱。',
      fateRule: '十大宿命星按八字大运十神映射；大运地支落入日柱空亡对时标记宿命大杀界。',
      disclaimer: '结果为文化娱乐参考，不构成医疗、心理、法律、财务或重大决策建议。',
      sources: ['lunar-javascript', '@openfate/bazi-engine', '@soul-atelier/bazi'],
    },
    generatedAt: new Date().toISOString(),
  }
}
