import { calculateBaziChart } from '@openfate/bazi-engine'
import { Planets, getAyanamsa, getPlanetaryPosition } from '@prisri/jyotish'
import { Solar } from 'lunar-javascript'
import type { DiZhi } from '~/types/user'
import type {
  SukuyoCategory,
  SukuyoGroupId,
  SukuyoJudgment,
  SukuyoMansion,
  SukuyoPaipanInput,
  SukuyoPaipanResult,
  SukuyoRelation,
} from '~~/app/types/sukuyo-paipan'

const SUKUYO_SEQUENCE = [
  'mao', 'bi-net', 'zui', 'shen', 'jing', 'gui', 'liu', 'xing', 'zhang',
  'yi', 'zhen', 'jiao', 'kang', 'di', 'fang', 'xin', 'wei-tail', 'ji',
  'dou', 'nv', 'xu', 'wei-rooftop', 'shi', 'bi-wall', 'kui', 'lou', 'wei-stomach',
] as const

type SukuyoId = typeof SUKUYO_SEQUENCE[number]

const MANSIONS: Record<SukuyoId, Omit<SukuyoMansion, 'sequence'>> = {
  mao: {
    id: 'mao', name: '昴宿', nameEn: 'Pleiades Mansion', group: 'west', category: 'dual',
    ruler: 'Sun', keywordsZh: ['美感', '双面性', '坚持'], keywordsEn: ['aesthetics', 'duality', 'persistence'],
  },
  'bi-net': {
    id: 'bi-net', name: '毕宿', nameEn: 'Net Mansion', group: 'west', category: 'stable',
    ruler: 'Moon', keywordsZh: ['稳健', '积累', '耐性'], keywordsEn: ['stability', 'accumulation', 'patience'],
  },
  zui: {
    id: 'zui', name: '觜宿', nameEn: 'Beak Mansion', group: 'west', category: 'harmonious',
    ruler: 'Venus', keywordsZh: ['观察', '谈吐', '思辨'], keywordsEn: ['observation', 'speech', 'analysis'],
  },
  shen: {
    id: 'shen', name: '参宿', nameEn: 'Three Stars Mansion', group: 'west', category: 'transformative',
    ruler: 'Mercury', keywordsZh: ['独立', '开拓', '直接'], keywordsEn: ['independence', 'pioneering', 'directness'],
  },
  jing: {
    id: 'jing', name: '井宿', nameEn: 'Well Mansion', group: 'south', category: 'diligent',
    ruler: 'Moon', keywordsZh: ['认真', '研究', '条理'], keywordsEn: ['conscientiousness', 'inquiry', 'structure'],
  },
  gui: {
    id: 'gui', name: '鬼宿', nameEn: 'Ghost Mansion', group: 'south', category: 'rapid',
    ruler: 'Sun', keywordsZh: ['灵活', '多才', '直觉'], keywordsEn: ['flexibility', 'versatility', 'intuition'],
  },
  liu: {
    id: 'liu', name: '柳宿', nameEn: 'Willow Mansion', group: 'south', category: 'transformative',
    ruler: 'Mercury', keywordsZh: ['审美', '个性', '情感'], keywordsEn: ['taste', 'individuality', 'emotion'],
  },
  xing: {
    id: 'xing', name: '星宿', nameEn: 'Star Mansion', group: 'south', category: 'intense',
    ruler: 'Venus', keywordsZh: ['意志', '聚焦', '信念'], keywordsEn: ['willpower', 'focus', 'conviction'],
  },
  zhang: {
    id: 'zhang', name: '张宿', nameEn: 'Extended Net Mansion', group: 'south', category: 'intense',
    ruler: 'Sun', keywordsZh: ['抱负', '策略', '表现'], keywordsEn: ['ambition', 'strategy', 'expression'],
  },
  yi: {
    id: 'yi', name: '翼宿', nameEn: 'Wings Mansion', group: 'south', category: 'stable',
    ruler: 'Mercury', keywordsZh: ['信用', '实务', '安定'], keywordsEn: ['credibility', 'practicality', 'steadiness'],
  },
  zhen: {
    id: 'zhen', name: '轸宿', nameEn: 'Chariot Mansion', group: 'south', category: 'rapid',
    ruler: 'Moon', keywordsZh: ['适配', '细致', '机动'], keywordsEn: ['adaptability', 'attention to detail', 'mobility'],
  },
  jiao: {
    id: 'jiao', name: '角宿', nameEn: 'Horn Mansion', group: 'east', category: 'harmonious',
    ruler: 'Mars', keywordsZh: ['行动', '领导', '学习'], keywordsEn: ['action', 'leadership', 'learning'],
  },
  kang: {
    id: 'kang', name: '亢宿', nameEn: 'Neck Mansion', group: 'east', category: 'diligent',
    ruler: 'Saturn', keywordsZh: ['原则', '协调', '责任'], keywordsEn: ['principles', 'coordination', 'responsibility'],
  },
  di: {
    id: 'di', name: '氐宿', nameEn: 'Root Mansion', group: 'east', category: 'dual',
    ruler: 'Jupiter', keywordsZh: ['外交', '张力', '适应'], keywordsEn: ['diplomacy', 'tension', 'adaptability'],
  },
  fang: {
    id: 'fang', name: '房宿', nameEn: 'Room Mansion', group: 'east', category: 'harmonious',
    ruler: 'Mars', keywordsZh: ['创造', '资源', '魅力'], keywordsEn: ['creativity', 'resources', 'charisma'],
  },
  xin: {
    id: 'xin', name: '心宿', nameEn: 'Heart Mansion', group: 'east', category: 'transformative',
    ruler: 'Ketu', keywordsZh: ['洞察', '情感', '重塑'], keywordsEn: ['insight', 'emotion', 'renewal'],
  },
  'wei-tail': {
    id: 'wei-tail', name: '尾宿', nameEn: 'Tail Mansion', group: 'east', category: 'transformative',
    ruler: 'Venus', keywordsZh: ['专注', '热情', '坚持'], keywordsEn: ['focus', 'passion', 'perseverance'],
  },
  ji: {
    id: 'ji', name: '箕宿', nameEn: 'Winnowing Basket Mansion', group: 'east', category: 'intense',
    ruler: 'Saturn', keywordsZh: ['逻辑', '探求', '表达'], keywordsEn: ['logic', 'exploration', 'expression'],
  },
  dou: {
    id: 'dou', name: '斗宿', nameEn: 'Dipper Mansion', group: 'north', category: 'stable',
    ruler: 'Jupiter', keywordsZh: ['规划', '信任', '积累'], keywordsEn: ['planning', 'trust', 'accumulation'],
  },
  nv: {
    id: 'nv', name: '女宿', nameEn: 'Girl Mansion', group: 'north', category: 'diligent',
    ruler: 'Saturn', keywordsZh: ['勤勉', '细节', '完善'], keywordsEn: ['diligence', 'precision', 'refinement'],
  },
  xu: {
    id: 'xu', name: '虚宿', nameEn: 'Emptiness Mansion', group: 'north', category: 'diligent',
    ruler: 'Jupiter', keywordsZh: ['自由', '实验', '前瞻'], keywordsEn: ['freedom', 'experimentation', 'foresight'],
  },
  'wei-rooftop': {
    id: 'wei-rooftop', name: '危宿', nameEn: 'Rooftop Mansion', group: 'north', category: 'diligent',
    ruler: 'Mars', keywordsZh: ['好奇', '冒险', '应变'], keywordsEn: ['curiosity', 'risk sense', 'resourcefulness'],
  },
  shi: {
    id: 'shi', name: '室宿', nameEn: 'Encampment Mansion', group: 'north', category: 'intense',
    ruler: 'Mercury', keywordsZh: ['信念', '纪律', '攻坚'], keywordsEn: ['conviction', 'discipline', 'breakthrough'],
  },
  'bi-wall': {
    id: 'bi-wall', name: '壁宿', nameEn: 'Wall Mansion', group: 'north', category: 'stable',
    ruler: 'Ketu', keywordsZh: ['包容', '守成', '平和'], keywordsEn: ['tolerance', 'preservation', 'peace'],
  },
  kui: {
    id: 'kui', name: '奎宿', nameEn: 'Legs Mansion', group: 'west', category: 'harmonious',
    ruler: 'Mars', keywordsZh: ['沟通', '信息', '连接'], keywordsEn: ['communication', 'information', 'connection'],
  },
  lou: {
    id: 'lou', name: '娄宿', nameEn: 'Bond Mansion', group: 'west', category: 'rapid',
    ruler: 'Rahu', keywordsZh: ['敏捷', '学习', '转化'], keywordsEn: ['agility', 'learning', 'transformation'],
  },
  'wei-stomach': {
    id: 'wei-stomach', name: '胃宿', nameEn: 'Stomach Mansion', group: 'west', category: 'rapid',
    ruler: 'Venus', keywordsZh: ['直觉', '先机', '消化'], keywordsEn: ['intuition', 'timing', 'assimilation'],
  },
}

const NAKSHATRA_TO_SUKUYO: SukuyoId[] = [
  'lou', 'wei-stomach', 'mao', 'bi-net', 'zui', 'shen', 'jing', 'gui',
  'liu', 'xing', 'zhang', 'yi', 'zhen', 'jiao', 'kang', 'di', 'fang',
  'xin', 'wei-tail', 'ji', 'dou', 'nv', 'xu', 'wei-rooftop', 'shi',
  'bi-wall', 'kui',
]

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'P.Phalguni', 'U.Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
  'P.Ashadha', 'U.Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'P.Bhadrapada', 'U.Bhadrapada', 'Revati',
]

const LUNAR_MONTH_ANCHOR: Record<number, SukuyoId> = {
  1: 'shi', 2: 'kui', 3: 'wei-stomach', 4: 'bi-net', 5: 'shen', 6: 'gui',
  7: 'zhang', 8: 'jiao', 9: 'di', 10: 'xin', 11: 'dou', 12: 'xu',
}

const RELATION_CYCLE = ['荣', '衰', '安', '危', '成', '坏', '友', '亲'] as const
const GROUP_WIDTH = 360 / 27

const HOUR_MIDPOINT: Record<DiZhi, number> = {
  子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
  午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
}

function mansionById(id: SukuyoId, sequence = 0): SukuyoMansion {
  const definition = MANSIONS[id]
  if (!definition) throw createError({ statusCode: 503, statusMessage: '宿曜表数据缺失' })
  return {
    ...definition,
    sequence: sequence || SUKUYO_SEQUENCE.indexOf(id) + 1,
  }
}

function mansionBySequence(sequence: number): SukuyoMansion {
  const id = SUKUYO_SEQUENCE[((sequence - 1) % 27 + 27) % 27]
  if (!id) throw createError({ statusCode: 503, statusMessage: '宿曜序号无效' })
  return mansionById(id, ((sequence - 1) % 27 + 27) % 27 + 1)
}

function relation(fromMansion: SukuyoMansion, toMansion: SukuyoMansion): SukuyoRelation {
  const offset = (toMansion.sequence - fromMansion.sequence + 27) % 27
  const role = offset === 0
    ? '命'
    : offset === 9 ? '业' : offset === 18 ? '胎' : RELATION_CYCLE[(offset % 9) - 1] ?? '荣'
  const group = role === '命' || role === '业' || role === '胎'
    ? role === '命' ? '命' : '业胎'
    : role === '荣' || role === '亲'
      ? '荣亲'
      : role === '友' || role === '衰' ? '友衰' : role === '安' || role === '坏' ? '安坏' : '危成'
  const spacing = Math.min(offset, 27 - offset)
  return {
    from: fromMansion.name,
    to: toMansion.name,
    role,
    group: group as SukuyoRelation['group'],
    distance: spacing === 0 ? null : spacing <= 4 ? '近' : spacing <= 8 ? '中' : '远',
  }
}

function validateTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date())
    return timezone
  }
  catch {
    throw createError({ statusCode: 422, statusMessage: `无效时区：${timezone}` })
  }
}

function zonedParts(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
    minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(instant)
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value ?? '0')
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour') % 24,
    minute: value('minute'),
    second: value('second'),
  }
}

function zoneOffsetMinutes(instant: Date, timeZone: string) {
  const parts = zonedParts(instant, timeZone)
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  return Math.round((asUtc - instant.getTime()) / 60000)
}

function createUtcInstant(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw createError({ statusCode: 400, statusMessage: '排盘日期或时间无效' })
  }

  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, 0)
  const firstOffset = zoneOffsetMinutes(new Date(naiveUtc), timeZone)
  const firstInstant = new Date(naiveUtc - firstOffset * 60000)
  const secondOffset = zoneOffsetMinutes(firstInstant, timeZone)
  const instant = secondOffset === firstOffset
    ? firstInstant
    : new Date(naiveUtc - secondOffset * 60000)
  const actual = zonedParts(instant, timeZone)
  if (actual.year !== year || actual.month !== month || actual.day !== day
    || actual.hour !== hour || actual.minute !== minute) {
    throw createError({ statusCode: 422, statusMessage: '出生时间在该时区不存在或跨夏令时边界' })
  }
  return instant
}

function traditionalJudgment(year: number, month: number, day: number): SukuyoJudgment {
  const lunar = Solar.fromYmd(year, month, day).getLunar()
  const lunarMonth = Math.abs(lunar.getMonth())
  const lunarDay = lunar.getDay()
  const anchor = LUNAR_MONTH_ANCHOR[lunarMonth]
  if (!anchor) throw createError({ statusCode: 503, statusMessage: '宿曜农历锚点缺失' })
  const anchorSequence = SUKUYO_SEQUENCE.indexOf(anchor) + 1
  const sequence = anchorSequence + lunarDay - 1
  const leapText = lunar.getMonth() < 0 ? '闰' : ''
  return {
    method: 'civil-lunar',
    mansion: mansionBySequence(sequence),
    lunarText: `${lunar.getYearInChinese()}年${leapText}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
  }
}

function calculateBoundaryRisk(position: ReturnType<typeof getPlanetaryPosition>) {
  const progress = position.longitude % GROUP_WIDTH
  const speedPerHour = Math.abs(position.speed) / 24
  if (speedPerHour <= 0) return { hours: 99, near: false }
  const toNext = (GROUP_WIDTH - progress) / speedPerHour
  const sincePrevious = progress / speedPerHour
  const hours = Math.min(toNext, sincePrevious)
  return { hours: Number(hours.toFixed(2)), near: hours <= 1.25 }
}

export function calculateSukuyoPaipan(input: SukuyoPaipanInput): SukuyoPaipanResult {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.birthDate)
  if (!match) throw createError({ statusCode: 400, statusMessage: '出生日期格式必须是 YYYY-MM-DD' })
  const year = Number(match[1]!)
  const month = Number(match[2]!)
  const day = Number(match[3]!)
  if (year < 1900 || year > 2100) {
    throw createError({ statusCode: 400, statusMessage: '出生年份需在 1900-2100' })
  }

  const location = input.location ?? null
  const timezone = validateTimezone(location?.timezone || 'Asia/Shanghai')
  const inputHour = HOUR_MIDPOINT[input.birthHour]
  if (inputHour === undefined) throw createError({ statusCode: 400, statusMessage: '出生时辰无效' })

  const bazi = calculateBaziChart({
    year,
    month,
    day,
    hour: inputHour,
    minute: 0,
    gender: input.gender,
    timezoneId: timezone,
    longitude: location?.longitude,
    enableTrueSolarTime: location?.longitude !== undefined,
    dayBoundaryMode: 'ZI_HOUR_23',
  })

  const solar = bazi.calendar.calculationSolar
  const correctedHour = solar.hour ?? inputHour
  const correctedMinute = solar.minute ?? 0
  const correctedDate = `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`
  const correctedTime = `${String(correctedHour).padStart(2, '0')}:${String(correctedMinute).padStart(2, '0')}`
  const instant = createUtcInstant(correctedDate, correctedTime, timezone)
  const ayanamsa = getAyanamsa(instant, 'lahiri')
  const moon = getPlanetaryPosition(Planets.Moon, instant, ayanamsa)
  const nakshatraIndex = Math.floor(moon.longitude / GROUP_WIDTH)
  const preciseId = NAKSHATRA_TO_SUKUYO[nakshatraIndex]
  if (!preciseId) throw createError({ statusCode: 503, statusMessage: '月亮宿度无法映射到 27 宿' })

  const progress = moon.longitude - nakshatraIndex * GROUP_WIDTH
  const boundary = calculateBoundaryRisk(moon)
  const precise: SukuyoJudgment = {
    method: 'astronomical',
    mansion: mansionById(preciseId, nakshatraIndex + 1),
    siderealLongitude: Number(moon.longitude.toFixed(4)),
    mansionDegree: Number(progress.toFixed(3)),
    nakshatra: NAKSHATRA_NAMES[nakshatraIndex] ?? moon.nakshatra,
    nakshatraStartLongitude: Number((nakshatraIndex * GROUP_WIDTH).toFixed(4)),
    pada: Math.min(4, Math.floor(progress / (GROUP_WIDTH / 4)) + 1),
    moonSpeedPerDay: Number(moon.speed.toFixed(4)),
    hoursToNextBoundary: boundary.hours,
    boundaryNear: boundary.near,
  }
  const traditional = traditionalJudgment(year, month, day)
  const preciseSequence = precise.mansion.sequence
  const neighbors = {
    previous: mansionBySequence(preciseSequence + 26),
    next: mansionBySequence(preciseSequence + 1),
    previousRelation: relation(precise.mansion, mansionBySequence(preciseSequence + 26)),
    nextRelation: relation(precise.mansion, mansionBySequence(preciseSequence + 1)),
  }

  const correctedHourBranchIndex = Math.floor(((correctedHour + 1) % 24) / 2)
  const inputHourBranchIndex = Math.floor(((inputHour + 1) % 24) / 2)
  const branchNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

  return {
    birth: {
      date: input.birthDate,
      hour: input.birthHour,
      clockText: `${input.birthDate} ${input.birthHour}时（时辰中点）`,
      trueSolarText: `${correctedDate} ${correctedTime}`,
      correctionStatus: location?.longitude !== undefined ? 'corrected' : 'uncorrected',
      dayBoundaryChanged: solar.day !== day || solar.month !== month || solar.year !== year,
      hourBoundaryChanged: correctedHourBranchIndex !== inputHourBranchIndex,
      locationName: location?.name || '未填地点',
      coordinates: location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : '未校正',
      timezone,
      genderText: input.gender === 'male' ? '男' : '女',
    },
    precise,
    traditional,
    agree: precise.mansion.id === traditional.mansion.id,
    traditionalRelation: precise.mansion.id === traditional.mansion.id ? null : relation(precise.mansion, traditional.mansion),
    neighbors,
    methodology: {
      engine: '@prisri/jyotish 1.1.7',
      astronomy: 'Astronomy Engine + Lahiri/Chitrapaksha ayanamsha',
      preciseRule: '恒星黄经月亮 ÷ 13°20′；Aśvinī 起于 0°，常规 27 宿不含牛宿',
      traditionalRule: '民用日换算农历，按朔日宿表逐日顺行；用于流行简化口径对照',
      timeRule: location?.longitude !== undefined
        ? '时辰中点 + 输入地点真太阳时校正'
        : '时辰中点；未填地点，未做真太阳时校正',
      disclaimer: '宿曜存在精确天文与农历简化等口径差异；结果用于结构化参考，不构成医疗、法律或投资建议。',
    },
    generatedAt: new Date().toISOString(),
  }
}

export function buildSukuyoPaipanContext(result: SukuyoPaipanResult) {
  const p = result.precise.mansion
  const t = result.traditional.mansion
  return [
    `体系：宿曜占星术 / 宿曜道 27宿`,
    `出生：${result.birth.clockText}；校正后 ${result.birth.trueSolarText}；${result.birth.correctionStatus === 'corrected' ? '真太阳时已校正' : '真太阳时未校正'}`,
    `地点：${result.birth.locationName} ${result.birth.coordinates} ${result.birth.timezone}`,
    `精密本命宿：${p.name} / ${p.nameEn}，第${p.sequence}位，月亮恒星黄经 ${result.precise.siderealLongitude}°，宿内 ${result.precise.mansionDegree}°，${result.precise.nakshatra} p${result.precise.pada}`,
    `精确宿属性：${p.group}-${p.category}；ruler ${p.ruler}；关键词 ${p.keywordsZh.join('/')} / ${p.keywordsEn.join('/')}`,
    `传统农历口径：${result.traditional.lunarText} ${t.name}；两口径${result.agree ? '一致' : `不一致，关系 ${result.traditionalRelation?.role}（${result.traditionalRelation?.group}）`}`,
    `边界：距宿界约 ${result.precise.hoursToNextBoundary} 小时${result.precise.boundaryNear ? '；属边界风险样本' : ''}；跨日=${result.birth.dayBoundaryChanged}；跨时辰=${result.birth.hourBoundaryChanged}`,
    `邻宿关系：前 ${result.neighbors.previous.name}=${result.neighbors.previousRelation.role}；后 ${result.neighbors.next.name}=${result.neighbors.nextRelation.role}`,
    `方法：${result.methodology.preciseRule}；${result.methodology.traditionalRule}`,
  ].join('\n')
}
