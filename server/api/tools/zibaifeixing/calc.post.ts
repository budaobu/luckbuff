import { toLunar } from 'lunar'

type Intent = 'general' | 'wealth' | 'health' | 'love' | 'study' | 'travel' | 'renovation'

interface CalcInput {
  year: number
  month: number
  day: number
  intent?: Intent
  locale?: string
}

interface Palace {
  palaceNumber: number
  name: string
  direction: string
  yearStar: number
  monthStar: number
  dayStar: number
}

interface JieqiInfo {
  name: string
  month: number
  day: number
}

interface CalcResult {
  input: {
    year: number
    month: number
    day: number
    lunarYear: number
    lunarMonth: number
    lunarDay: number
    lunarYearBranch: string
    intent: Intent
  }
  yearCenter: number
  monthCenter: number
  dayCenter: number
  currentJieqi: {
    name: string
    date: string
  }
  palaces: Palace[]
  locale: string
}

// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 洛书九宫视觉排列（上南下北）：巽 4 / 离 9 / 坤 2 / 震 3 / 中 5 / 兑 7 / 艮 8 / 坎 1 / 乾 6
const PALACE_META: Array<{ palaceNumber: number; name: string; direction: string }> = [
  { palaceNumber: 4, name: '巽', direction: '东南' },
  { palaceNumber: 9, name: '离', direction: '南' },
  { palaceNumber: 2, name: '坤', direction: '西南' },
  { palaceNumber: 3, name: '震', direction: '东' },
  { palaceNumber: 5, name: '中', direction: '中宫' },
  { palaceNumber: 7, name: '兑', direction: '西' },
  { palaceNumber: 8, name: '艮', direction: '东北' },
  { palaceNumber: 1, name: '坎', direction: '北' },
  { palaceNumber: 6, name: '乾', direction: '西北' },
]

// 顺飞顺序：中 5 → 乾 6 → 兑 7 → 艮 8 → 离 9 → 坎 1 → 坤 2 → 震 3 → 巽 4
const LUOSHU_ORDER = [5, 6, 7, 8, 9, 1, 2, 3, 4]

// 二十四节气均值（公历月/日），用于确定日紫白所在节气段。
// 实际交节时间每年有微小浮动，这里采用民间排盘常用的均值表。
const JIEQI_TABLE: JieqiInfo[] = [
  { name: '小寒', month: 1, day: 5 },
  { name: '大寒', month: 1, day: 20 },
  { name: '立春', month: 2, day: 4 },
  { name: '雨水', month: 2, day: 19 },
  { name: '惊蛰', month: 3, day: 5 },
  { name: '春分', month: 3, day: 20 },
  { name: '清明', month: 4, day: 5 },
  { name: '谷雨', month: 4, day: 20 },
  { name: '立夏', month: 5, day: 5 },
  { name: '小满', month: 5, day: 21 },
  { name: '芒种', month: 6, day: 6 },
  { name: '夏至', month: 6, day: 21 },
  { name: '小暑', month: 7, day: 7 },
  { name: '大暑', month: 7, day: 23 },
  { name: '立秋', month: 8, day: 7 },
  { name: '处暑', month: 8, day: 23 },
  { name: '白露', month: 9, day: 7 },
  { name: '秋分', month: 9, day: 23 },
  { name: '寒露', month: 10, day: 8 },
  { name: '霜降', month: 10, day: 23 },
  { name: '立冬', month: 11, day: 7 },
  { name: '小雪', month: 11, day: 22 },
  { name: '大雪', month: 12, day: 7 },
  { name: '冬至', month: 12, day: 21 },
]

// 将任意整数映射到 1-9 循环（紫白星数没有 0，逢 0 取 9）
function mod9(n: number): number {
  return ((n - 1) % 9 + 9) % 9 + 1
}

// 年紫白入中星：三元甲子通用公式
// 上元甲子起一白、中元甲子起四绿、下元甲子起七赤；该统一公式为
//   入中星 = ((11 - 年份 mod 9) mod 9)，结果 0 时取 9
// 验证：1984（甲子·下元）→ 7；2024（甲辰）→ 3；2025（乙巳）→ 2
function getYearCenterStar(year: number): number {
  return mod9(11 - (year % 9))
}

// 月紫白入中星：按农历年支起正月，正月之后每月逆行（减 1）
// 口诀：子午卯酉八白宫，辰戌丑未五黄中，寅申巳亥二黑真
function getMonthCenterStar(lunarYearBranch: string, lunarMonth: number): number {
  let base: number
  if (['子', '午', '卯', '酉'].includes(lunarYearBranch)) {
    base = 8
  } else if (['辰', '戌', '丑', '未'].includes(lunarYearBranch)) {
    base = 5
  } else {
    // 寅、申、巳、亥
    base = 2
  }
  return mod9(base - (lunarMonth - 1))
}

// 日紫白：按节气分段起星，冬至后阳遁顺行，夏至后阴遁逆行
// 口诀：冬至一七四、雨水七四一？民间常用简表为：
//   冬至—立春：一白起，顺行
//   雨水—清明：七赤起，顺行
//   谷雨—芒种：四绿起，顺行
//   夏至—立秋：九紫起，逆行
//   处暑—寒露：三碧起，逆行
//   霜降—大雪：六白起，逆行
function getDayCenterStar(date: Date): { star: number; jieqi: { name: string; date: string } } {
  const { current, termDate } = getCurrentSolarTerm(date)
  const offset = Math.floor((date.getTime() - termDate.getTime()) / (1000 * 60 * 60 * 24))

  let startStar: number
  let forward: boolean

  if (['冬至', '小寒', '大寒', '立春'].includes(current.name)) {
    startStar = 1
    forward = true
  } else if (['雨水', '惊蛰', '春分', '清明'].includes(current.name)) {
    startStar = 7
    forward = true
  } else if (['谷雨', '立夏', '小满', '芒种'].includes(current.name)) {
    startStar = 4
    forward = true
  } else if (['夏至', '小暑', '大暑', '立秋'].includes(current.name)) {
    startStar = 9
    forward = false
  } else if (['处暑', '白露', '秋分', '寒露'].includes(current.name)) {
    startStar = 3
    forward = false
  } else {
    // 霜降、立冬、小雪、大雪
    startStar = 6
    forward = false
  }

  const star = forward ? mod9(startStar + offset) : mod9(startStar - offset)

  return {
    star,
    jieqi: {
      name: current.name,
      date: `${termDate.getFullYear()}-${String(termDate.getMonth() + 1).padStart(2, '0')}-${String(termDate.getDate()).padStart(2, '0')}`,
    },
  }
}

// 找到当前所处节气（即不大于当前日期的最后一个节气）
function getCurrentSolarTerm(date: Date): { current: JieqiInfo; termDate: Date } {
  const year = date.getFullYear()

  // 从年内最后一个节气往前找
  for (let i = JIEQI_TABLE.length - 1; i >= 0; i--) {
    const jq = JIEQI_TABLE[i]!
    const candidate = new Date(year, jq.month - 1, jq.day)
    if (candidate <= date) {
      return { current: jq, termDate: candidate }
    }
  }

  // 若当前日期在年内第一个节气之前，取上一年冬至
  const dongzhi = JIEQI_TABLE[JIEQI_TABLE.length - 1]!
  return {
    current: dongzhi,
    termDate: new Date(year - 1, dongzhi.month - 1, dongzhi.day),
  }
}

// 顺飞布宫：入中星按 LUOSHU_ORDER 依次递增
function flyForward(center: number): Record<number, number> {
  const chart: Record<number, number> = {}
  let star = center
  for (const palace of LUOSHU_ORDER) {
    chart[palace] = star
    star = mod9(star + 1)
  }
  return chart
}

function getLunarYearBranch(lunarYear: number): string {
  return DI_ZHI[((lunarYear - 4) % 12 + 12) % 12] || '子'
}

function isValidDate(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day)
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CalcInput>(event)

  if (
    body == null
    || typeof body.year !== 'number'
    || typeof body.month !== 'number'
    || typeof body.day !== 'number'
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid year/month/day' })
  }

  const year = Math.floor(body.year)
  const month = Math.floor(body.month)
  const day = Math.floor(body.day)
  const locale = body.locale || 'zh-CN'
  const allowedIntents: Intent[] = ['general', 'wealth', 'health', 'love', 'study', 'travel', 'renovation']
  const intent: Intent = allowedIntents.includes(body.intent as Intent) ? (body.intent as Intent) : 'general'

  if (year < 1890 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31 || !isValidDate(year, month, day)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
  }

  const solarDate = new Date(year, month - 1, day)
  const { lunar } = toLunar(solarDate)

  const lunarYearBranch = getLunarYearBranch(lunar.year)

  const yearCenter = getYearCenterStar(lunar.year)
  const monthCenter = getMonthCenterStar(lunarYearBranch, lunar.month)
  const { star: dayCenter, jieqi } = getDayCenterStar(solarDate)

  const yearChart = flyForward(yearCenter)
  const monthChart = flyForward(monthCenter)
  const dayChart = flyForward(dayCenter)

  const palaces: Palace[] = PALACE_META.map((meta) => {
    return {
      palaceNumber: meta.palaceNumber,
      name: meta.name,
      direction: meta.direction,
      yearStar: yearChart[meta.palaceNumber]!,
      monthStar: monthChart[meta.palaceNumber]!,
      dayStar: dayChart[meta.palaceNumber]!,
    }
  })

  return {
    input: {
      year,
      month,
      day,
      lunarYear: lunar.year,
      lunarMonth: lunar.month,
      lunarDay: lunar.day,
      lunarYearBranch,
      intent,
    },
    yearCenter,
    monthCenter,
    dayCenter,
    currentJieqi: jieqi,
    palaces,
    locale,
  } satisfies CalcResult
})
