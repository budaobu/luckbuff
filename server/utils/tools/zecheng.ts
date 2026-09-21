import { calculateBaziChartResult, type BaziChartGender } from '~~/server/utils/tools/bazi-chart'
import { calcNewSchoolBazi } from '~~/server/utils/tools/new-school-bazi'
import type {
  ZechengCityRecord,
  ZechengCityResult,
  ZechengPerson,
  ZechengRankItem,
  ZechengResponse,
  ZechengTrack,
  ZechengVerdict,
} from '~/types/zecheng'
import { ZECHENG_CITIES, ZECHENG_WORLD_CITIES } from './zecheng-cities'

const FANG_GUA: Record<string, string> = {
  北: '坎', 东北: '艮', 东: '震', 东南: '巽',
  南: '离', 西南: '坤', 西: '兑', 西北: '乾',
}
const FANG_WX: Record<string, string> = {
  北: '水', 东北: '土', 东: '木', 东南: '木',
  南: '火', 西南: '土', 西: '金', 西北: '金',
}
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
const BRANCH_AZIMUTH: Record<string, number> = {
  子: 0, 丑: 30, 寅: 60, 卯: 90, 辰: 120, 巳: 150,
  午: 180, 未: 210, 申: 240, 酉: 270, 戌: 300, 亥: 330,
}
const BRANCH_YIMA: Record<string, string> = {
  子: '寅', 申: '寅', 辰: '寅',
  寅: '申', 午: '申', 戌: '申',
  巳: '亥', 酉: '亥', 丑: '亥',
  亥: '巳', 卯: '巳', 未: '巳',
}
const POSITION_NAMES = ['年', '月', '日', '时']
const XIU_DETAIL: Record<string, { yao: string, wx: '木' | '火' | '土' | '金' | '水', beast: string }> = {
  角: { yao: '木', wx: '木', beast: '蛟' },
  亢: { yao: '金', wx: '金', beast: '龙' },
  氐: { yao: '土', wx: '土', beast: '貉' },
  房: { yao: '日', wx: '火', beast: '兔' },
  心: { yao: '月', wx: '火', beast: '狐' },
  尾: { yao: '火', wx: '火', beast: '虎' },
  箕: { yao: '水', wx: '水', beast: '豹' },
  斗: { yao: '木', wx: '木', beast: '獬' },
  牛: { yao: '金', wx: '金', beast: '牛' },
  女: { yao: '土', wx: '土', beast: '蝠' },
  虚: { yao: '日', wx: '火', beast: '鼠' },
  危: { yao: '月', wx: '火', beast: '燕' },
  室: { yao: '火', wx: '火', beast: '猪' },
  壁: { yao: '水', wx: '水', beast: '猿' },
  奎: { yao: '木', wx: '木', beast: '狼' },
  娄: { yao: '金', wx: '金', beast: '狗' },
  胃: { yao: '土', wx: '土', beast: '雉' },
  昴: { yao: '日', wx: '火', beast: '鸡' },
  毕: { yao: '月', wx: '火', beast: '乌' },
  觜: { yao: '火', wx: '火', beast: '猴' },
  参: { yao: '水', wx: '水', beast: '猿' },
  井: { yao: '木', wx: '木', beast: '犴' },
  鬼: { yao: '金', wx: '金', beast: '羊' },
  柳: { yao: '土', wx: '土', beast: '獐' },
  星: { yao: '日', wx: '火', beast: '马' },
  张: { yao: '月', wx: '火', beast: '鹿' },
  翼: { yao: '火', wx: '火', beast: '蛇' },
  轸: { yao: '水', wx: '水', beast: '蚓' },
}

export interface ZechengInput {
  birth: {
    year: number
    month: number
    day: number
    hour: number
    gender: BaziChartGender
  }
  originName: string
  mode: 'compare' | 'rank'
  targetCity?: string
}

export function findZechengCity(input: string): ZechengCityRecord | null {
  const value = input.trim().replace(/市$/u, '')
  if (!value) return null
  return [...ZECHENG_CITIES, ...ZECHENG_WORLD_CITIES].find(city =>
    city.name === value
    || city.fullName === value
    || city.aliases?.some(alias => alias.toLowerCase() === value.toLowerCase()),
  ) ?? null
}

function toRad(deg: number): number {
  return deg * Math.PI / 180
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radius = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function initialBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2))
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2))
    - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1))
  return Math.round(((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360)
}

function bearingToFang(deg: number): string {
  return ['北', '东北', '东', '东南', '南', '西南', '西', '西北'][Math.floor(((deg + 22.5) % 360) / 45)]!
}

function splitElements(value: string): string[] {
  return value.split(/[、,，]/u).map(item => item.trim()).filter(Boolean)
}

function findYima(branches: string[]) {
  for (let index = 0; index < branches.length; index += 1) {
    const base = branches[index]!
    const yima = BRANCH_YIMA[base]
    if (!yima) continue
    const found = branches.findIndex(branch => branch === yima)
    if (found >= 0) {
      return {
        branch: yima,
        where: `${POSITION_NAMES[index]}支三合见${POSITION_NAMES[found]}支${yima}`,
        azimuth: BRANCH_AZIMUTH[yima]!,
      }
    }
  }
  return null
}

async function buildPerson(input: ZechengInput, origin: ZechengCityRecord): Promise<ZechengPerson> {
  const hourIndex = Math.trunc(input.birth.hour)
  const hasHour = hourIndex >= 0 && hourIndex < BRANCHES.length
  const selectedHour = hasHour ? BRANCHES[hourIndex]! : null
  let year = input.birth.year
  let month = input.birth.month
  let day = input.birth.day
  let effectiveHour = selectedHour
  let solarTimeStatusText = '未提供时辰，仅排年月日三柱；时柱不入驿马账。'

  if (hasHour && selectedHour) {
    const fullChart = await calculateBaziChartResult({
      birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      birthHour: selectedHour,
      gender: input.birth.gender,
      location: {
        name: origin.name,
        longitude: origin.lng,
        latitude: origin.lat,
        timezone: 'Asia/Shanghai',
      },
    })
    const solar = fullChart.birth.solarText.split('-').map(Number)
    year = solar[0]!
    month = solar[1]!
    day = solar[2]!
    effectiveHour = fullChart.birth.effectiveHour
    solarTimeStatusText = fullChart.birth.solarTimeStatusText
  }

  const chart = calcNewSchoolBazi(year, month, day, effectiveHour, input.birth.gender)
  const branches = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour?.zhi]
    .filter((branch): branch is NonNullable<typeof branch> => Boolean(branch))
  const yima = findYima(branches)

  return {
    pillarsText: [
      chart.year.gan + chart.year.zhi,
      chart.month.gan + chart.month.zhi,
      chart.day.gan + chart.day.zhi,
      chart.hour ? chart.hour.gan + chart.hour.zhi : null,
    ].filter(Boolean).join(' '),
    favorable: splitElements(chart.xiyong),
    unfavorable: splitElements(chart.jishen),
    strength: chart.riZhuStrength,
    patternName: chart.geju,
    branches,
    hasHour,
    selectedHour,
    effectiveHour,
    solarTimeStatusText,
    yimaBranch: yima?.branch ?? null,
    yimaWhere: yima?.where ?? null,
    originName: origin.name,
    originProvince: origin.province,
    originLng: origin.lng,
    originLat: origin.lat,
  }
}

function toCityResult(city: ZechengCityRecord): ZechengCityResult {
  return {
    name: city.name,
    fullName: city.fullName,
    province: city.province,
    fenye: city.fenye,
    xiuDetail: city.fenye.xiu.map(name => ({
      name,
      ...XIU_DETAIL[name]!,
    })),
    chars: city.chars,
  }
}

function isFavorable(favorable: string[], wx: string): boolean {
  return favorable.includes(wx)
}

function isUnfavorable(unfavorable: string[], wx: string): boolean {
  return unfavorable.includes(wx)
}

function buildTracks(person: ZechengPerson, city: ZechengCityRecord, bearingDeg: number | null, sameCity: boolean): ZechengTrack[] {
  const fang = bearingDeg == null ? null : bearingToFang(bearingDeg)
  const fangWx = fang ? FANG_WX[fang]! : null
  const fangTag = !fangWx
    ? '不列'
    : isFavorable(person.favorable, fangWx)
      ? (Math.abs((bearingDeg ?? 0) % 90) < 8 ? '正合主喜' : '合喜')
      : isUnfavorable(person.unfavorable, fangWx) ? '犯忌' : '闲平'
  const fangweiTendency = !fangWx ? 0 : isFavorable(person.favorable, fangWx) ? 1 : isUnfavorable(person.unfavorable, fangWx) ? -1 : 0

  const yima = person.yimaBranch
  const yimaAzimuth = yima ? BRANCH_AZIMUTH[yima]! : null
  const yimaLinFang = !!(yimaAzimuth != null && bearingDeg != null && Math.abs(((bearingDeg - yimaAzimuth + 540) % 360) - 180) <= 30)
  const yimaTendency = !yima ? 0 : yimaLinFang ? 1 : 0.5

  const xiuWx = city.fenye.xiu.map(name => XIU_DETAIL[name]!.wx)
  const fenyeTendency = xiuWx.reduce((sum, wx) =>
    isFavorable(person.favorable, wx) ? sum + 1
      : isUnfavorable(person.unfavorable, wx) ? sum - 1 : sum, 0)
  const charTendency = Math.max(-0.8, Math.min(0.8, city.chars.reduce((sum, item) =>
    item.wx && isFavorable(person.favorable, item.wx) ? sum + 0.4
      : item.wx && isUnfavorable(person.unfavorable, item.wx) ? sum - 0.5 : sum, 0)))

  return [
    {
      key: 'fangwei',
      label: '方位账',
      weight: 40,
      tendency: fangweiTendency,
      suspended: sameCity || !fang,
      basis: sameCity
        ? `${person.originName}与目标同城，方位账记空。`
        : `自${person.originName}望${city.name}，真方位角 ${bearingDeg}°，落${fang}方${fang ? FANG_GUA[fang] : ''}位，属${fangWx ?? '—'}——${fangTag}`,
    },
    {
      key: 'yima',
      label: '驿马账',
      weight: 25,
      tendency: yimaTendency,
      suspended: false,
      basis: !yima
        ? '命局未见驿马临支，以平账论。'
        : `命带驿马（${person.yimaWhere}）${person.hasHour ? '' : '（未提供时辰，时柱不入此账）'}，${yimaLinFang ? '此城正落马方 ±30° 内——驿马临方，动则有成' : '此城不在马方，利远行迁动作常行论'}。`,
    },
    {
      key: 'fenye',
      label: '分野账',
      weight: 20,
      tendency: fenyeTendency,
      suspended: xiuWx.length === 0,
      basis: xiuWx.length === 0
        ? city.fenye.source
        : `${city.fenye.guo}地，${city.fenye.xiu.join('、')}之分——${city.fenye.xiu.map((name, index) => `${name}宿属${xiuWx[index]}（${isFavorable(person.favorable, xiuWx[index]!) ? '正合主喜' : isUnfavorable(person.unfavorable, xiuWx[index]!) ? '犯忌' : '闲平'}）`).join('、')}（${city.fenye.source}）`,
    },
    {
      key: 'ziwuxing',
      label: '字账',
      weight: 15,
      tendency: charTendency,
      suspended: city.chars.length === 0,
      basis: city.chars.length === 0
        ? '城名汉字无可核字义五行，记空不计。'
        : `${city.chars.map(item => `${item.char}${item.wx ? `（${item.basis}，属${item.wx}·${isFavorable(person.favorable, item.wx) ? '合喜' : isUnfavorable(person.unfavorable, item.wx) ? '犯忌' : '闲平'}）` : '（查无实据，不计）'}`).join('、')}`,
    },
  ]
}

function verdictFromTracks(tracks: ZechengTrack[]): ZechengVerdict {
  const active = tracks.filter(track => !track.suspended)
  const totalWeight = active.reduce((sum, track) => sum + track.weight, 0)
  const weighted = active.reduce((sum, track) => sum + track.tendency * track.weight, 0) / (totalWeight || 1)
  const score = Math.max(8, Math.min(96, Math.round(50 + weighted * 46)))
  const grade: ZechengVerdict['grade'] = score >= 65 ? '吉' : score >= 55 ? '中平' : score >= 45 ? '平' : '下'
  return {
    grade,
    gradeWord: grade === '吉' ? '宜往' : grade === '中平' ? '可游' : grade === '平' ? '慎行' : '非宜',
    score,
  }
}

function rankCities(person: ZechengPerson, origin: ZechengCityRecord): Array<ZechengRankItem & { city: ZechengCityRecord }> {
  return ZECHENG_CITIES
    .filter(city => city.name !== origin.name)
    .map((city) => {
      const bearing = initialBearing(person.originLat, person.originLng, city.lat, city.lng)
      const fang = bearingToFang(bearing)
      const tracks = buildTracks(person, city, bearing, false)
      const verdict = verdictFromTracks(tracks)
      return {
        city,
        name: city.name,
        province: city.province,
        score: verdict.score,
        grade: verdict.grade,
        gradeWord: verdict.gradeWord,
        fang,
        xiu: city.fenye.xiu,
        brief: `${fang}方${FANG_GUA[fang]}位 · ${city.fenye.xiu.join('')}之分${city.fenye.extended ? '（权推）' : ''}`,
      }
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'zh-Hans-CN'))
}

export async function calculateZecheng(input: ZechengInput): Promise<ZechengResponse> {
  const origin = findZechengCity(input.originName)
  if (!origin) {
    throw createError({ statusCode: 400, statusMessage: '请选择可解析坐标的出生太极点' })
  }

  const person = await buildPerson(input, origin)
  if (input.mode === 'rank') {
    const ranked = rankCities(person, origin)
    return {
      mode: 'rank',
      person,
      top: ranked.slice(0, 10).map(({ city: _city, ...item }) => item),
      poolSize: ranked.length,
    }
  }

  const city = findZechengCity(input.targetCity ?? '')
  if (!city) {
    throw createError({ statusCode: 400, statusMessage: '请填写可识别的目标城市' })
  }

  const sameCity = city.name === origin.name
  const bearingDeg = sameCity ? 0 : initialBearing(person.originLat, person.originLng, city.lat, city.lng)
  const fang = sameCity ? null : bearingToFang(bearingDeg)
  const tracks = buildTracks(person, city, bearingDeg, sameCity)
  const verdict = verdictFromTracks(tracks)
  const ranked = rankCities(person, origin)
  const rankPosition = ranked.findIndex(item => item.city.name === city.name)

  return {
    mode: 'compare',
    person,
    city: toCityResult(city),
    bearingDeg: sameCity ? null : bearingDeg,
    fang,
    distanceKm: sameCity ? 0 : haversineKm(person.originLat, person.originLng, city.lat, city.lng),
    sameCity,
    tracks,
    totalWeight: tracks.filter(track => !track.suspended).reduce((sum, track) => sum + track.weight, 0),
    verdict,
    rank: rankPosition >= 0 ? { position: rankPosition + 1, poolSize: ranked.length } : null,
  }
}
