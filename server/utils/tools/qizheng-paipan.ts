import { Body, createSwissEph, RiseTransit } from '@kuntay/swisseph'
import { calculateBaziChart } from '@openfate/bazi-engine'
import { Solar } from 'lunar-javascript'
import type { DiZhi } from '~/types/user'
import type {
  QizhengPaipanInput,
  QizhengPaipanResult,
  QizhengPalace,
  QizhengPlanet,
  QizhengRelation,
} from '~~/app/types/qizheng-paipan'

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
const HOUR_MIDPOINT: Record<DiZhi, number> = {
  子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
  午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
}

const PALACE_NAMES = [
  '命宫', '财帛宫', '兄弟宫', '田宅宫', '男女宫', '奴仆宫',
  '夫妻宫', '疾厄宫', '迁移宫', '官禄宫', '福德宫', '相貌宫',
] as const
const PALACE_SHORT = ['命', '财', '兄', '田', '男', '奴', '夫', '疾', '迁', '官', '福', '相'] as const
const SIGNS = ['白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼'] as const
const SIGN_LORDS = ['火', '金', '水', '月', '日', '水', '金', '火', '木', '土', '土', '木'] as const

const MANSION_STARTS: Array<[number, string]> = [
  [9.06465, '壁'], [22.29233784340674, '奎'], [33.87395006562897, '娄'], [46.84545006562897, '胃'],
  [59.32609395451785, '昴'], [68.37382006562896, '毕'], [83.61825006562896, '觜'], [84.59431562118452, '参'],
  [95.21443284340674, '井'], [125.63855006562896, '鬼'], [130.21575006562898, '柳'], [147.19147673229563, '星'],
  [155.60155006562897, '张'], [173.60425173229564, '翼'], [190.64855006562897, '轸'], [203.75225451007339, '角'],
  [214.41085006562898, '亢'], [224.99773284340674, '氐'], [242.84715006562897, '房'], [247.71565006562898, '心'],
  [256.07198506562895, '尾'], [271.182150065629, '箕'], [280.09812395451786, '斗'], [303.952250065629, '牛'],
  [311.644250065629, '女'], [323.288650065629, '虚'], [333.257250065629, '危'], [353.4026289545179, '室'],
]

const PLANET_BODIES = [
  { key: 'sun', name: '日', body: Body.Sun, category: '七政' },
  { key: 'moon', name: '月', body: Body.Moon, category: '七政' },
  { key: 'mercury', name: '水星', body: Body.Mercury, category: '七政' },
  { key: 'venus', name: '金星', body: Body.Venus, category: '七政' },
  { key: 'mars', name: '火星', body: Body.Mars, category: '七政' },
  { key: 'jupiter', name: '木星', body: Body.Jupiter, category: '七政' },
  { key: 'saturn', name: '土星', body: Body.Saturn, category: '七政' },
  { key: 'luohou', name: '罗睺', body: null, category: '四余' },
  { key: 'jitu', name: '计都', body: null, category: '四余' },
  { key: 'yuebo', name: '月孛', body: Body.BlackMoonLilithMean, category: '四余' },
  { key: 'ziqi', name: '紫炁', body: null, category: '四余' },
] as const

const DOMICILE_START: Record<string, number[]> = {
  日: [4], 月: [3], 水星: [2, 5], 金星: [1, 6], 火星: [0, 7],
  木星: [8, 11], 土星: [9, 10],
}

const PEACH_BLOSSOM: Record<string, string> = { 申: '酉', 子: '酉', 辰: '酉', 寅: '卯', 午: '卯', 戌: '卯', 巳: '午', 酉: '午', 丑: '午', 亥: '子', 卯: '子', 未: '子' }
const TRAVEL_HORSE: Record<string, string> = { 申: '亥', 子: '亥', 辰: '亥', 寅: '申', 午: '申', 戌: '申', 巳: '亥', 酉: '亥', 丑: '亥', 亥: '巳', 卯: '巳', 未: '巳' }
const CANOPY: Record<string, string> = { 申: '辰', 子: '辰', 辰: '辰', 寅: '戌', 午: '戌', 戌: '戌', 巳: '丑', 酉: '丑', 丑: '丑', 亥: '未', 卯: '未', 未: '未' }
const GROWTH_START: Record<string, number> = { 甲: 10, 丙: 0, 戊: 0, 庚: 6, 壬: 4, 乙: 10, 丁: 0, 己: 0, 辛: 6, 癸: 4 }
const GROWTH_NAMES = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'] as const

const ZIQI_ANCHOR_JD = 2449189.9995
const ZIQI_ANCHOR_LON = 106.5164
const ZIQI_PERIOD_DAYS = 28 * 365.2425

function normalized(value: number) {
  return ((value % 360) + 360) % 360
}

function branchIndex(longitude: number) {
  return (10 - Math.floor(normalized(longitude) / 30) + 12) % 12
}

function branch(longitude: number) {
  return BRANCHES[branchIndex(longitude)]!
}

function mansion(longitude: number) {
  const lon = normalized(longitude)
  let selected = MANSION_STARTS[MANSION_STARTS.length - 1]!
  for (const item of MANSION_STARTS) {
    if (lon >= item[0]) selected = item
  }
  return { name: selected[1], degree: lon >= selected[0] ? lon - selected[0] : lon + 360 - selected[0] }
}

function signIndex(longitude: number) {
  return Math.floor(normalized(longitude) / 30)
}

function zoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(date)
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value ?? '0')
  const asUtc = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour') % 24, value('minute'), value('second'))
  return Math.round((asUtc - date.getTime()) / 60000)
}

function formatZoned(jd: number, offsetMinutes: number) {
  const instant = new Date((jd - 2440587.5) * 86400000 + offsetMinutes * 60000)
  return instant.toISOString().slice(11, 16)
}

function decimalHourFromJd(jd: number, offsetMinutes: number) {
  const instant = new Date((jd - 2440587.5) * 86400000 + offsetMinutes * 60000)
  return instant.getUTCHours() + instant.getUTCMinutes() / 60
}

function firstEvent(swe: Awaited<ReturnType<typeof createSwissEph>>, jd: number, body: number, place: { latitude: number, longitude: number }, kind: 'rise' | 'set') {
  const result = swe.riseTransit(jd - 1, body, place, kind === 'rise' ? RiseTransit.Rise : RiseTransit.Set)
  return result.jd
}

function palaceLord(branchLon: number) {
  return SIGN_LORDS[signIndex(branchLon)]!
}

function compactRound(value: number, digits = 4) {
  return Number(value.toFixed(digits))
}

function lunarYearGanzhi(year: number) {
  return Solar.fromYmd(year, 6, 1).getLunar().getYearInGanZhi()
}

export async function calculateQizhengPaipan(input: QizhengPaipanInput): Promise<QizhengPaipanResult> {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.birthDate)
  if (!match) throw createError({ statusCode: 400, statusMessage: '出生日期格式必须是 YYYY-MM-DD' })
  const year = Number(match[1]!)
  const month = Number(match[2]!)
  const day = Number(match[3]!)
  if (year < 1900 || year > 2100) throw createError({ statusCode: 400, statusMessage: '出生年份需在 1900-2100' })

  const location = input.location ?? null
  const timezone = location?.timezone || 'Asia/Shanghai'
  const inputHour = HOUR_MIDPOINT[input.birthHour]
  const bazi = calculateBaziChart({
    year, month, day, hour: inputHour, minute: 0, gender: input.gender,
    timezoneId: timezone,
    longitude: location?.longitude,
    enableTrueSolarTime: location?.longitude !== undefined,
    dayBoundaryMode: 'ZI_HOUR_23',
  })

  const solar = bazi.calendar.calculationSolar
  const trueHour = solar.hour ?? inputHour
  const trueMinute = solar.minute ?? 0
  const naiveUtc = Date.UTC(solar.year, solar.month - 1, solar.day, trueHour, trueMinute, solar.second ?? 0)
  const probeDate = new Date(naiveUtc)
  const offset = zoneOffsetMinutes(probeDate, timezone)
  const utcDate = new Date(naiveUtc - offset * 60000)
  const utcHour = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600

  const swe = await createSwissEph()
  try {
    const jd = swe.julianDay(utcDate.getUTCFullYear(), utcDate.getUTCMonth() + 1, utcDate.getUTCDate(), utcHour)
    const place = { latitude: location?.latitude ?? 31.23, longitude: location?.longitude ?? 121.47 }
    const sun = swe.calc(jd, Body.Sun)
    const moon = swe.calc(jd, Body.Moon)
    const northNode = swe.calc(jd, Body.NorthNodeMean)
    const luohouLon = normalized(northNode.longitude + 180)

    const rawLongitudes: Record<string, number> = {
      sun: sun.longitude,
      moon: moon.longitude,
      mercury: swe.calc(jd, Body.Mercury).longitude,
      venus: swe.calc(jd, Body.Venus).longitude,
      mars: swe.calc(jd, Body.Mars).longitude,
      jupiter: swe.calc(jd, Body.Jupiter).longitude,
      saturn: swe.calc(jd, Body.Saturn).longitude,
      luohou: luohouLon,
      jitu: northNode.longitude,
      yuebo: swe.calc(jd, Body.BlackMoonLilithMean).longitude,
      ziqi: normalized(ZIQI_ANCHOR_LON + ((jd - ZIQI_ANCHOR_JD) * 360 / ZIQI_PERIOD_DAYS)),
    }

    const sunrise = firstEvent(swe, jd, Body.Sun, place, 'rise')
    const sunset = firstEvent(swe, jd, Body.Sun, place, 'set')
    const moonrise = firstEvent(swe, jd, Body.Moon, place, 'rise')
    const moonset = firstEvent(swe, jd, Body.Moon, place, 'set')
    const birthHourLocal = decimalHourFromJd(jd, offset)
    const riseHour = sunrise === null ? 6 : decimalHourFromJd(sunrise, offset)
    const setHour = sunset === null ? 18 : decimalHourFromJd(sunset, offset)
    const isDay = riseHour <= birthHourLocal && birthHourLocal <= setHour

    const planets: QizhengPlanet[] = PLANET_BODIES.map((definition) => {
      const lon = rawLongitudes[definition.key]!
      const position = definition.body === null ? null : swe.calc(jd, definition.body)
      const speed = position?.longitudeSpeed ?? (definition.key === 'luohou' || definition.key === 'jitu' || definition.key === 'ziqi' ? 0 : 0.053)
      const houseIndex = signIndex(lon)
      const status: string[] = []
      if (definition.category === '七政') {
        if (DOMICILE_START[definition.name]?.includes(houseIndex)) status.push('旺地')
        else if (DOMICILE_START[definition.name]?.includes((houseIndex + 6) % 12)) status.push('失地')
      }
      if (speed < 0) status.push('逆行')
      return {
        key: definition.key,
        name: definition.name,
        category: definition.category,
        longitude: compactRound(lon),
        branch: branch(lon),
        branchDegree: compactRound(lon % 30, 2),
        mansion: mansion(lon).name,
        mansionDegree: compactRound(mansion(lon).degree, 2),
        latitude: compactRound(position?.latitude ?? 0),
        distance: position ? compactRound(position.distance, 8) : null,
        speed: compactRound(speed),
        isRetrograde: speed < 0,
        status,
      }
    })

    const houses = swe.houses(jd, place.latitude, place.longitude, 'W')
    const lifeIndex = branchIndex(houses.ascendant)
    const bodyIndex = branchIndex(moon.longitude)
    const lifeBranch = BRANCHES[lifeIndex]!
    const bodyBranch = BRANCHES[bodyIndex]!

    const yearBranch = bazi.pillars.year.branch
    const keyShensha = [
      { name: '桃花', branch: PEACH_BLOSSOM[yearBranch]!, note: '人缘、审美与情感吸引' },
      { name: '驿马', branch: TRAVEL_HORSE[yearBranch]!, note: '迁移、出差与节奏变化' },
      { name: '华盖', branch: CANOPY[yearBranch]!, note: '研究、孤独感与专注力' },
    ]
    const growthIndex = (BRANCHES.indexOf(bazi.pillars.day.branch as DiZhi) - (GROWTH_START[bazi.pillars.day.stem] ?? 0) + 12) % 12
    keyShensha.push({ name: GROWTH_NAMES[growthIndex]!, branch: bazi.pillars.day.branch, note: '日主十二长生状态' })

    const lifeHead = ((10 - lifeIndex + 12) % 12) * 30
    const palaces: QizhengPalace[] = Array.from({ length: 12 }, (_, index) => {
      const branchIdx = (lifeIndex - index + 12) % 12
      const head = ((10 - branchIdx + 12) % 12) * 30
      const branchName = BRANCHES[branchIdx]!
      const stars = planets.filter(item => item.branch === branchName).map(item => item.name)
      const shensha = [
        ...keyShensha.filter(item => item.branch === branchName).map(item => item.name),
        ...[bazi.pillars.year, bazi.pillars.month, bazi.pillars.day, bazi.pillars.hour]
          .filter((pillar): pillar is NonNullable<typeof pillar> => !!pillar)
          .flatMap(pillar => pillar.voidBranches.filter(item => item === branchName).map(() => '空亡')),
      ]
      return {
        name: PALACE_NAMES[index]!,
        shortName: PALACE_SHORT[index]!,
        branch: branchName,
        headLongitude: head,
        lord: palaceLord(head),
        stars,
        shensha: Array.from(new Set(shensha)),
      }
    })
    const relations: QizhengRelation[] = []
    for (let i = 0; i < planets.length; i += 1) {
      for (let j = i + 1; j < planets.length; j += 1) {
        const first = planets[i]!
        const second = planets[j]!
        const angularDistance = Math.abs(((first.longitude - second.longitude + 540) % 360) - 180)
        const members = [first.name, second.name]
        if (first.branch === second.branch) {
          relations.push({ type: '同宫', label: `${first.name}・${second.name} 同宫`, members, orb: compactRound(Math.abs(first.longitude - second.longitude), 2) })
        }
        else if (Math.abs(180 - angularDistance) <= 1.5) {
          relations.push({ type: '对照', label: `${first.name} 对照 ${second.name}`, members, orb: compactRound(180 - angularDistance, 2) })
        }
        else if (Math.abs(angularDistance - 60) <= 1.5) {
          relations.push({ type: '三合', label: `${first.name} 三合 ${second.name}`, members, orb: compactRound(Math.abs(angularDistance - 60), 2) })
        }
        else if (Math.abs(angularDistance - 90) <= 1.5) {
          relations.push({ type: '四正', label: `${first.name} 四正刑 ${second.name}`, members, orb: compactRound(Math.abs(angularDistance - 90), 2) })
        }
      }
    }

    const currentYear = new Date().getFullYear()
    const birthAge = currentYear - year
    const dayuns = bazi.daYun.cycles.map(cycle => ({
      label: `${cycle.startYear}-${cycle.endYear} ${cycle.ganZhi}`,
      detail: `${cycle.startAge}-${cycle.endAge}岁 · ${cycle.stemTenGod} / ${cycle.branchTenGod}`,
      isCurrent: currentYear >= cycle.startYear && currentYear <= cycle.endYear,
    }))
    const flowYears = Array.from({ length: 20 }, (_, offset) => {
      const flowYear = currentYear + offset
      const age = flowYear - year
      const palaceIndex = ((age % 12) + 12) % 12
      return {
        year: flowYear,
        age,
        palace: PALACE_NAMES[palaceIndex]!,
        shortName: PALACE_SHORT[palaceIndex]!,
        ganzhi: lunarYearGanzhi(flowYear),
        isCurrent: offset === 0,
      }
    })

    const lunar = Solar.fromYmdHms(solar.year, solar.month, solar.day, trueHour, trueMinute, 0).getLunar()
    const offsetText = offset >= 0 ? `UTC+${(offset / 60).toFixed(2).replace(/\.00$/, '')}` : `UTC${(offset / 60).toFixed(2)}`
    const coordinates = location ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : '默认上海'

    return {
      basic: {
        solarText: `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')} ${String(trueHour).padStart(2, '0')}:${String(trueMinute).padStart(2, '0')}`,
        trueSolarText: bazi.solarTimeInfo?.trueSolarTime ?? `${String(trueHour).padStart(2, '0')}:${String(trueMinute).padStart(2, '0')}`,
        lunarText: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${input.birthHour}时`,
        zodiac: bazi.calendar.zodiac,
        locationName: location?.name || '未填地点（按上海基准）',
        timezone: `${timezone} · ${offsetText}`,
        coordinates,
        genderText: input.gender === 'male' ? '男' : '女',
        dayNight: isDay ? '昼生' : '夜生',
        sunrise: sunrise === null ? '—' : formatZoned(sunrise, offset),
        sunset: sunset === null ? '—' : formatZoned(sunset, offset),
        moonrise: moonrise === null ? '—' : formatZoned(moonrise, offset),
        moonset: moonset === null ? '—' : formatZoned(moonset, offset),
        timeBasis: bazi.solarTimeInfo ? '时辰中点 + 真太阳时' : '时辰中点',
      },
      pillars: [
        { key: 'year', label: '年柱', ganzhi: bazi.pillars.year.ganZhi, nayin: bazi.pillars.year.naYin },
        { key: 'month', label: '月柱', ganzhi: bazi.pillars.month.ganZhi, nayin: bazi.pillars.month.naYin },
        { key: 'day', label: '日柱', ganzhi: bazi.pillars.day.ganZhi, nayin: bazi.pillars.day.naYin },
        { key: 'hour', label: '时柱', ganzhi: bazi.pillars.hour?.ganZhi ?? '—', nayin: bazi.pillars.hour?.naYin ?? '—' },
      ],
      jieqi: {
        previous: `${lunar.getPrevJie().getName()} ${lunar.getPrevJie().getSolar().toYmdHms().slice(5, 16)}`,
        next: `${lunar.getNextJie().getName()} ${lunar.getNextJie().getSolar().toYmdHms().slice(5, 16)}`,
      },
      liming: {
        lifePalace: lifeBranch,
        lifeLord: palaceLord(lifeHead),
        bodyPalace: bodyBranch,
        bodyLord: palaceLord(((10 - bodyIndex + 12) % 12) * 30),
        basis: '地平上升宫安命；太阴所在安身',
      },
      planets,
      palaces,
      relations,
      keyShensha,
      dayuns,
      flowYears,
      methodology: {
        engine: 'Swiss Ephemeris 2.10.03 + @openfate/bazi-engine 1.1.2',
        astronomy: '黄道回归制；默认黄道回回归宿度；罗计为南北交点反向命名',
        method: '时辰中点起盘，地平上升宫安命，太阴所在安身',
        time: location?.longitude ? '输入地点经度真太阳时校正' : '未填地点，按东经 121.47 基准',
        disclaimer: '七政四余存在盘制与流派差异；本结果仅作为结构化排盘证据，不构成人生决策依据。',
      },
      generatedAt: new Date().toISOString(),
    }
  }
  finally {
    swe.dispose()
  }
}

export type { QizhengPaipanInput, QizhengPaipanResult }
