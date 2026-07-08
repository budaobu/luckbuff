import { ephemeris, houses, time } from 'celestine'
import type {
  QizhengSiyuChart,
  QizhengSiyuPlanet,
  QizhengSiyuRemainder,
  QizhengSiyuAspect,
  QizhengSiyuHouse,
  QizhengSiyuAngle,
} from '~/types/qizheng-siyu'

const SIGN_NAMES_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

const SIGN_NAMES_ZH = [
  '白羊', '金牛', '双子', '巨蟹', '狮子', '处女',
  '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼',
]

interface DateTimeParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

function normalizeLongitude(lon: number): number {
  let v = lon % 360
  if (v < 0) v += 360
  return v
}

function signIndexOf(longitude: number): number {
  return Math.floor(normalizeLongitude(longitude) / 30) % 12
}

function degreeInSign(longitude: number): number {
  return normalizeLongitude(longitude) % 30
}

function houseOfSign(signIndex: number, ascendantSignIndex: number): number {
  return ((signIndex - ascendantSignIndex + 12) % 12) + 1
}

function distance(a: number, b: number): number {
  const diff = Math.abs(normalizeLongitude(a) - normalizeLongitude(b))
  return Math.min(diff, 360 - diff)
}

const GOVERNORS = [
  { key: 'sun', name: '日', nameEn: 'Sun', body: ephemeris.CelestialBody.Sun },
  { key: 'moon', name: '月', nameEn: 'Moon', body: ephemeris.CelestialBody.Moon },
  { key: 'mercury', name: '水', nameEn: 'Mercury', body: ephemeris.CelestialBody.Mercury },
  { key: 'venus', name: '金', nameEn: 'Venus', body: ephemeris.CelestialBody.Venus },
  { key: 'mars', name: '火', nameEn: 'Mars', body: ephemeris.CelestialBody.Mars },
  { key: 'jupiter', name: '木', nameEn: 'Jupiter', body: ephemeris.CelestialBody.Jupiter },
  { key: 'saturn', name: '土', nameEn: 'Saturn', body: ephemeris.CelestialBody.Saturn },
]

const REMAINDERS: {
  key: string
  name: string
  nameEn: string
  body?: ephemeris.CelestialBody
  derive?: (all: Map<ephemeris.CelestialBody, { longitude: number }>) => number
}[] = [
  { key: 'rahu', name: '罗睺', nameEn: 'SouthNode', body: ephemeris.CelestialBody.SouthNode },
  { key: 'ketu', name: '计都', nameEn: 'NorthNode', body: ephemeris.CelestialBody.NorthNode },
  { key: 'yuebo', name: '月孛', nameEn: 'Lilith', body: ephemeris.CelestialBody.Lilith },
  {
    key: 'ziqi',
    name: '紫炁',
    nameEn: 'Perigee',
    derive: all => normalizeLongitude((all.get(ephemeris.CelestialBody.Lilith)?.longitude ?? 0) + 180),
  },
]

const ASPECTS = [
  { name: '合相', angle: 0, orb: 8 },
  { name: '六合', angle: 60, orb: 6 },
  { name: '刑克', angle: 90, orb: 7 },
  { name: '拱相', angle: 120, orb: 7 },
  { name: '冲相', angle: 180, orb: 8 },
]

export function calculateQizhengSiyu(
  parts: DateTimeParts,
  geo: { lat: number; lng: number; cityName: string },
): QizhengSiyuChart {
  const offsetHours = Math.round(geo.lng / 7.5) / 2
  const jd = time.toJulianDate({
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: 0,
    timezone: offsetHours,
  })

  const lst = time.localSiderealTime(jd, geo.lng)
  const jc = time.toJulianCenturies(jd)
  const obliquity = houses.meanObliquity(jc)

  const ascendant = houses.calculateAscendant(lst, obliquity, geo.lat)
  const mc = houses.calculateMidheaven(lst, obliquity, geo.lat)
  const desc = normalizeLongitude(ascendant + 180)
  const ic = normalizeLongitude(mc + 180)

  const housesResult = houses.calculateHouses(
    { latitude: geo.lat, longitude: geo.lng },
    lst,
    jc,
    'whole-sign',
  )
  const cusps = housesResult.cusps.cusps as number[]

  const all = ephemeris.getAllPositions(jd)
  const ascendantSign = signIndexOf(ascendant)

  const planets: QizhengSiyuPlanet[] = GOVERNORS.map((g) => {
    const pos = all.get(g.body)
    if (!pos) {
      throw new Error(`无法计算星体：${g.nameEn}`)
    }
    const sign = signIndexOf(pos.longitude)
    return {
      key: g.key,
      name: g.name,
      nameEn: g.nameEn,
      longitude: normalizeLongitude(pos.longitude),
      latitude: pos.latitude,
      distance: pos.distance,
      speed: pos.longitudeSpeed,
      isRetrograde: pos.isRetrograde,
      signIndex: sign,
      signNameEn: SIGN_NAMES_EN[sign],
      signNameZh: SIGN_NAMES_ZH[sign],
      degreeInSign: degreeInSign(pos.longitude),
      house: houseOfSign(sign, ascendantSign),
    }
  })

  const remainders: QizhengSiyuRemainder[] = REMAINDERS.map((r) => {
    const lon = r.derive ? r.derive(all) : all.get(r.body!)?.longitude
    if (lon === undefined) {
      throw new Error(`无法计算四余：${r.nameEn}`)
    }
    const sign = signIndexOf(lon)
    return {
      key: r.key,
      name: r.name,
      nameEn: r.nameEn,
      longitude: normalizeLongitude(lon),
      signIndex: sign,
      signNameEn: SIGN_NAMES_EN[sign],
      signNameZh: SIGN_NAMES_ZH[sign],
      degreeInSign: degreeInSign(lon),
      house: houseOfSign(sign, ascendantSign),
    }
  })

  const houseList: QizhengSiyuHouse[] = cusps.map((cusp, i) => {
    const sign = signIndexOf(cusp)
    return {
      number: i + 1,
      signIndex: sign,
      signNameEn: SIGN_NAMES_EN[sign],
      signNameZh: SIGN_NAMES_ZH[sign],
      cusp,
    }
  })

  const angleList: QizhengSiyuAngle[] = [
    { name: 'Ascendant', nameZh: '上升', longitude: ascendant, signIndex: ascendantSign, signNameEn: SIGN_NAMES_EN[ascendantSign], signNameZh: SIGN_NAMES_ZH[ascendantSign], degreeInSign: degreeInSign(ascendant) },
    { name: 'Midheaven', nameZh: '天顶', longitude: mc, signIndex: signIndexOf(mc), signNameEn: SIGN_NAMES_EN[signIndexOf(mc)], signNameZh: SIGN_NAMES_ZH[signIndexOf(mc)], degreeInSign: degreeInSign(mc) },
    { name: 'Descendant', nameZh: '下降', longitude: desc, signIndex: signIndexOf(desc), signNameEn: SIGN_NAMES_EN[signIndexOf(desc)], signNameZh: SIGN_NAMES_ZH[signIndexOf(desc)], degreeInSign: degreeInSign(desc) },
    { name: 'ImumCoeli', nameZh: '天底', longitude: ic, signIndex: signIndexOf(ic), signNameEn: SIGN_NAMES_EN[signIndexOf(ic)], signNameZh: SIGN_NAMES_ZH[signIndexOf(ic)], degreeInSign: degreeInSign(ic) },
  ]

  const allBodies = [...planets, ...remainders]
  const aspects: QizhengSiyuAspect[] = []
  for (let i = 0; i < allBodies.length; i++) {
    for (let j = i + 1; j < allBodies.length; j++) {
      const b1 = allBodies[i]
      const b2 = allBodies[j]
      const sep = distance(b1.longitude, b2.longitude)
      for (const asp of ASPECTS) {
        const orb = Math.abs(sep - asp.angle)
        if (orb <= asp.orb) {
          aspects.push({
            body1: b1.key,
            body2: b2.key,
            body1Name: b1.name,
            body2Name: b2.name,
            angle: asp.angle,
            orb: Number(orb.toFixed(2)),
            aspectName: asp.name,
          })
          break
        }
      }
    }
  }

  return {
    planets,
    remainders,
    houses: houseList,
    angles: angleList,
    aspects: aspects.slice(0, 20),
    baseCityName: geo.cityName,
    localOffsetHours: offsetHours,
    calculationMethod: 'celestine_qizheng_siyu',
    methodNote: `本次计算使用 celestine 天文算法（MIT 许可）。出生地为 ${geo.cityName}，本地平太阳时按出生地经度换算为 UT（偏移约 ${offsetHours > 0 ? '+' : ''}${offsetHours} 小时）。七政为日、月、水、金、火、木、土；四余为罗睺（平均南交点）、计都（平均北交点）、月孛（平均月球远地点，Black Moon Lilith）、紫炁（月孛对宫点，近地点参考）。宫位采用整宫制（Whole Sign）。`,
    generatedAt: new Date().toISOString(),
  }
}
