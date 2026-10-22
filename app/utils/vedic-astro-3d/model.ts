import type {
  VedicPaipanAntarPeriod,
  VedicPaipanResult,
} from '~/types/vedic-paipan'

export type VedicAstroMode = 'd1' | 'd9' | 'd10'
export type VedicAstroDetailKind = 'planet' | 'house'

export const SIGN_CN = [
  '白羊', '金牛', '双子', '巨蟹', '狮子', '处女',
  '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼',
]

export const SIGN_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

export const PLANET_CN: Record<string, string> = {
  Sun: '太阳',
  Moon: '月亮',
  Mars: '火星',
  Mercury: '水星',
  Jupiter: '木星',
  Venus: '金星',
  Saturn: '土星',
  Rahu: '罗睺',
  Ketu: '计都',
  Uranus: '天王星',
  Neptune: '海王星',
  Pluto: '冥王星',
}

export const SIGN_LORDS = [
  '火星', '金星', '水星', '月亮', '太阳', '水星',
  '金星', '火星', '木星', '土星', '土星', '木星',
]

export const SIGN_LORDS_EN = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
]

export const NAKSHATRAS_CN = [
  '阿湿毗尼', '婆罗尼', '羯底迦', '罗希尼', '弥羯尸罗', '阿哩陀罗',
  '布那婆苏', '布湿耶', '阿湿离沙', '摩伽', '前婆罗求尼', '后婆罗求尼',
  '诃瑟多', '支多罗', '娑婆底', '毗沙迦', '阿奴罗陀', '逝瑟吒',
  '牟罗', '前阿沙陀', '后阿沙陀', '室罗婆那', '檀尼逝吒', '娑多毗沙',
  '前婆陀罗波陀', '后婆陀罗波陀', '罗婆底',
]

export const DASHA_ORDER = [
  { lord: 'Ketu', cn: '计都', years: 7, color: '#9aa0b5' },
  { lord: 'Venus', cn: '金星', years: 20, color: '#f0c987' },
  { lord: 'Sun', cn: '太阳', years: 6, color: '#ff9f43' },
  { lord: 'Moon', cn: '月亮', years: 10, color: '#c9d6ff' },
  { lord: 'Mars', cn: '火星', years: 7, color: '#ff6b6b' },
  { lord: 'Rahu', cn: '罗睺', years: 18, color: '#7d8a9e' },
  { lord: 'Jupiter', cn: '木星', years: 16, color: '#ffd166' },
  { lord: 'Saturn', cn: '土星', years: 19, color: '#6b7fa8' },
  { lord: 'Mercury', cn: '水星', years: 17, color: '#8ce99a' },
] as const

export const PLANET_COLORS: Record<string, number> = {
  Sun: 0xff9f43,
  Moon: 0xc9d6ff,
  Mars: 0xff6b6b,
  Mercury: 0x8ce99a,
  Jupiter: 0xffd166,
  Venus: 0xf0c987,
  Saturn: 0x6b7fa8,
  Rahu: 0x7d8a9e,
  Ketu: 0x9aa0b5,
  Uranus: 0x4fd8ff,
  Neptune: 0xa78bfa,
  Pluto: 0xe8b860,
}

export const DASHA_THEMES: Record<string, string> = {
  Sun: '权威、父亲、事业、自我认同',
  Moon: '情感、母亲、心境、流动',
  Mars: '行动、竞争、兄弟、土地',
  Mercury: '学习、沟通、商业、智力',
  Jupiter: '智慧、子女、信仰、扩张',
  Venus: '爱情、婚姻、艺术、享受',
  Saturn: '责任、制约、长寿、苦修',
  Rahu: '野心、异国、突破、幻象',
  Ketu: '灵性、断舍、超脱、智慧',
}

export const D9_THEMES: Record<string, string> = {
  Sun: '配偶或有权威/自信特质；关系中重视尊重与认可',
  Moon: '情感敏感、需情感连接；通过婚姻获得情感满足',
  Mars: '配偶热情、果断；关系需注意冲突与耐心',
  Mercury: '沟通是核心；配偶可能聪明、善交流',
  Jupiter: '配偶智慧宽厚；婚姻带来精神成长',
  Venus: '婚姻幸福度的核心星；其 D9 位置直接决定亲密质量',
  Saturn: '婚姻可能较晚；配偶稳重或年长',
  Rahu: '非传统婚姻模式；可能异国、跨文化',
  Ketu: '灵性向婚姻；可能有前世因缘或特殊缘分',
}

export const D10_THEMES: Record<string, string> = {
  Sun: '适合领导、政府、管理、权威岗位',
  Moon: '适合公共服务、护理、餐饮、水相关',
  Mars: '适合军事、工程、竞争性、体育行业',
  Mercury: '适合商业、贸易、写作、IT、沟通',
  Jupiter: '适合教育、法律、金融、咨询、宗教',
  Venus: '适合艺术、设计、美容、娱乐、奢侈品',
  Saturn: '适合工程、矿业、制造、系统化工作',
  Rahu: '适合科技、外贸、跨界、创新、异国',
  Ketu: '适合灵性、研究、幕后、专业技能',
}

export const SPECIAL_LAGNA_CN: Record<string, string> = {
  ghatikaLagna: '命息上升',
  horaLagna: '月露上升',
  bhavaLagna: '时刻上升',
  shreeLagna: '刻分上升',
  induLagna: '宫位上升',
  pranapadaLagna: '种姓上升',
}

export const MODE_NAMES: Record<VedicAstroMode, string> = {
  d1: 'D1 本命盘',
  d9: 'D9 婚姻盘',
  d10: 'D10 事业盘',
}

export const TAB_LABELS = {
  overview: '概览',
  lagna: '本命上升',
  planets: '行星宫位',
  vargas: '分盘系统',
  panchang: '五要素 Panchang',
  arudha: '映像宫 Arudha',
  ashtaka: '八分点',
  transit: '当前过运',
  drishti: '行星相位',
  dasha: '大运时间轴',
  detail: '星体/宫位详情',
} as const

export type VedicAstroTab = keyof typeof TAB_LABELS

export interface VedicAstroPlanet {
  name: string
  cn: string
  sign: number
  house: number
  longitude: number
  degreeText: string
  nakshatra: string
  nakshatraCn: string
  pada: number
  dignity: string
  dignityCn: string
  isRetrograde: boolean
  isCombust: boolean
  isVargottama: boolean
}

export interface VedicAstroDashaPeriod {
  planet: string
  cn: string
  start: Date
  end: Date
  years: number
  pratys?: VedicAstroDashaPeriod[]
}

export interface VedicAstroDasha {
  periods: VedicAstroDashaPeriod[]
  currentMaha?: VedicAstroDashaPeriod
  currentAntar?: VedicAstroDashaPeriod
  currentPraty?: VedicAstroDashaPeriod
}

export interface VedicAstroDrishti {
  from: string
  fromSign: number
  toSign: number
  strength: number
  type: string
}

export interface VedicAstroModel {
  result: VedicPaipanResult
  birthDate: Date
  lagnaSign: number
  planetMap: Record<string, VedicAstroPlanet>
  planetSigns: Record<string, number>
  planetsBySign: Record<number, VedicAstroPlanet[]>
  vargaMap: Record<string, { lagnaSign: number, planetSigns: Record<string, number>, label: string }>
  dasha: VedicAstroDasha
  arudhaByHouse: Record<number, number>
  savByHouse: number[]
  savBySign: number[]
  drishti: VedicAstroDrishti[]
}

function normalize(value: number) {
  return ((value - 1) % 12 + 12) % 12
}

export function planetName(name: string) {
  return PLANET_CN[name] || name
}

export function dignityName(value: string) {
  return value === 'exalted' ? '入庙'
    : value === 'debilitated' ? '落陷'
      : value === 'own' || value === 'moolatrikona' ? '本宫'
        : ''
}

export function nakshatraFromLongitude(longitude: number) {
  const index = Math.floor((((longitude % 360) + 360) % 360) / (360 / 27))
  return NAKSHATRAS_CN[index] || ''
}

function mapPeriod(period: NonNullable<VedicPaipanAntarPeriod>, withChildren = false): VedicAstroDashaPeriod {
  const order = DASHA_ORDER.find(item => item.lord === period.planet)
  return {
    planet: period.planet,
    cn: order?.cn || planetName(period.planet),
    start: new Date(period.startTime),
    end: new Date(period.endTime),
    years: period.durationYears ?? 0,
    pratys: withChildren ? period.pratyantars?.map(item => mapPeriod(item)) : undefined,
  }
}

function findCurrent(periods: VedicAstroDashaPeriod[], at: Date) {
  for (const maha of periods) {
    if (at < maha.start || at >= maha.end) continue
    const antars = maha.pratys || []
    for (const antar of antars) {
      if (at < antar.start || at >= antar.end) continue
      return {
        maha,
        antar,
        praty: antar.pratys?.find(item => at >= item.start && at < item.end),
      }
    }
    const antar = antars?.find(item => at >= item.start && at < item.end)
    if (!antar) return { maha, antar: undefined, praty: undefined }
    return {
      maha,
      antar,
      praty: antar.pratys?.find(item => at >= item.start && at < item.end),
    }
  }
  return { maha: undefined, antar: undefined, praty: undefined }
}

export function buildVedicAstroModel(result: VedicPaipanResult): VedicAstroModel {
  const lagnaSign = result.ascendant.sign - 1
  const planets = [...result.planets].sort((a, b) =>
    (a.sign - b.sign) || a.name.localeCompare(b.name),
  )

  const planetMap: Record<string, VedicAstroPlanet> = {}
  const planetSigns: Record<string, number> = {}
  const planetsBySign: Record<number, VedicAstroPlanet[]> = {}

  for (const planet of planets) {
    const sign = normalize(planet.sign)
    const model: VedicAstroPlanet = {
      name: planet.name,
      cn: planetName(planet.name),
      sign,
      house: planet.house,
      longitude: planet.longitude,
      degreeText: `${planet.degree}°${String(planet.minute).padStart(2, '0')}'`,
      nakshatra: planet.nakshatra,
      nakshatraCn: nakshatraFromLongitude(planet.longitude),
      pada: planet.pada,
      dignity: planet.dignity,
      dignityCn: dignityName(planet.dignity),
      isRetrograde: planet.isRetrograde,
      isCombust: planet.isCombust,
      isVargottama: planet.isVargottama,
    }
    planetMap[planet.name] = model
    planetSigns[planet.name] = sign
    ;(planetsBySign[sign] ||= []).push(model)
  }

  const vargaMap: VedicAstroModel['vargaMap'] = {}
  for (const varga of result.vargas) {
    const planetSignsForVarga: Record<string, number> = {}
    for (const planet of varga.planets) {
      planetSignsForVarga[planet.name] = normalize(planet.sign)
    }
    vargaMap[varga.key] = {
      lagnaSign: normalize(varga.ascendant.sign),
      planetSigns: planetSignsForVarga,
      label: varga.label,
    }
  }

  const periods = result.dasha.mahadashas.map(item => mapPeriod({
    ...item,
    pratyantars: item.antars?.flatMap(antar => antar.pratyantars || []),
  }, false))
  for (const [index, source] of result.dasha.mahadashas.entries()) {
    periods[index] = {
      planet: periods[index]!.planet,
      cn: periods[index]!.cn,
      start: periods[index]!.start,
      end: periods[index]!.end,
      years: periods[index]!.years,
      pratys: source.antars?.map(antar => mapPeriod(antar, true)),
    }
  }
  const now = new Date(result.transits.asAt)
  const current = findCurrent(periods, now)

  const arudhaByHouse: Record<number, number> = {}
  for (const item of result.arudhaPadas) {
    if (item.house >= 1 && item.house <= 12) arudhaByHouse[item.house] = normalize(item.sign)
  }

  const savByHouse = Array.from({ length: 12 }, (_, index) => result.ashtakavarga.sav.byHouse[index] || 0)
  const savBySign = Array.from({ length: 12 }, (_, signIndex) => {
    const house = result.houses.find(item => item.sign === signIndex + 1)
    return house ? (savByHouse[house.number - 1] || 0) : 0
  })

  const drishti: VedicAstroDrishti[] = []
  for (const item of result.drishti.planets) {
    const sourceSign = planetSigns[item.planet]
    if (sourceSign === undefined) continue
    for (const target of item.aspectedHouses) {
      const targetSign = normalize(result.houses[target.house - 1]?.sign || 1)
      drishti.push({
        from: item.planet,
        fromSign: sourceSign,
        toSign: targetSign,
        strength: target.type === '7th' ? 1 : 0.75,
        type: target.type,
      })
    }
  }

  return {
    result,
    birthDate: new Date(`${result.birth.date}T${result.birth.time}:00`),
    lagnaSign,
    planetMap,
    planetSigns,
    planetsBySign,
    vargaMap,
    dasha: {
      periods,
      currentMaha: current.maha,
      currentAntar: current.antar,
      currentPraty: current.praty,
    },
    arudhaByHouse,
    savByHouse,
    savBySign,
    drishti,
  }
}

export function signOfHouse(model: VedicAstroModel, house: number) {
  return normalize(model.result.houses[house - 1]?.sign || 1)
}

export function houseOfSign(model: VedicAstroModel, sign: number) {
  return model.result.houses[sign]?.number || sign + 1
}

export function fmtDate(date: Date) {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function fmtDateShort(date: Date) {
  return date.toLocaleDateString('zh-CN', { year: '2-digit', month: '2-digit', day: '2-digit' })
}
