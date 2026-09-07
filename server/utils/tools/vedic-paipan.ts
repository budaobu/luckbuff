import {
  Observer,
  Planets,
  checkDhaiya,
  checkSadeSati,
  getChandrashtama,
  getKundli,
  getPanchangamDetails,
  getPlanetaryPosition,
} from '@prisri/jyotish'
import type {
  ArudhaPadaInfo,
  Bhava,
  Kundli,
  PlanetAspect,
  PlanetaryPosition,
  VargaChart,
} from '@prisri/jyotish'
import type { VedicPaipanPeriod, VedicPaipanResult, VedicPaipanSignPosition, VedicPaipanVarga } from '~~/app/types/vedic-paipan'

export interface VedicPaipanInput {
  birthDate: string
  birthTime: string
  gender?: 'male' | 'female' | ''
  timeUncertain?: boolean
  location: {
    name: string
    latitude: number
    longitude: number
    timezone: string
  }
}

const RASHI_KEYS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const

const RASHI_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

const RASHI_LORDS = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
]

const SPECIAL_LAGNA_KEYS = [
  'ghatikaLagna', 'horaLagna', 'bhavaLagna', 'shreeLagna', 'induLagna', 'pranapadaLagna',
] as const

const VARGA_LABELS: Record<string, string> = {
  d1: 'D1 Rasi',
  d2: 'D2 Hora',
  d3: 'D3 Drekkana',
  d4: 'D4 Chaturthamsa',
  d5: 'D5 Panchamsa',
  d6: 'D6 Shashthamsa',
  d7: 'D7 Saptamsa',
  d8: 'D8 Ashtamsa',
  d9: 'D9 Navamsa',
  d10: 'D10 Dasamsa',
  d11: 'D11 Rudramsa',
  d12: 'D12 Dwadasamsa',
  d16: 'D16 Shodasamsa',
  d20: 'D20 Vimsamsa',
  d24: 'D24 Chaturvimsamsa',
  d27: 'D27 Nakshatramsa',
  d30: 'D30 Trimsamsa',
  d40: 'D40 Khavedamsa',
  d45: 'D45 Akshavedamsa',
  d60: 'D60 Shashtiamsa',
}

function validateTimezone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date())
    return timeZone
  }
  catch {
    throw createError({ statusCode: 422, statusMessage: `无效时区：${timeZone}` })
  }
}

function zonedParts(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
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
    throw createError({ statusCode: 400, statusMessage: '出生日期或时间无效' })
  }

  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0)
  const firstOffset = zoneOffsetMinutes(new Date(naiveUtc), timeZone)
  const firstInstant = new Date(naiveUtc - firstOffset * 60000)
  const secondOffset = zoneOffsetMinutes(firstInstant, timeZone)
  const instant = secondOffset === firstOffset
    ? firstInstant
    : new Date(naiveUtc - secondOffset * 60000)

  const actual = zonedParts(instant, timeZone)
  if (actual.year !== year || actual.month !== month || actual.day !== day
    || actual.hour !== hour || actual.minute !== minute) {
    throw createError({
      statusCode: 422,
      statusMessage: `出生时间在该时区不存在或跨夏令时边界：${date} ${time} ${timeZone}`,
    })
  }
  return instant
}

function signPosition(sign: number, ascendantSign: number): VedicPaipanSignPosition {
  const normalized = ((sign - 1) % 12 + 12) % 12
  return {
    sign: normalized + 1,
    signKey: RASHI_KEYS[normalized]!,
    signName: RASHI_NAMES[normalized]!,
    house: ((normalized - (ascendantSign - 1)) % 12 + 12) % 12 + 1,
  }
}

function mapPlanet(position: PlanetaryPosition, name: string, ascendantSign: number) {
  return {
    name,
    ...signPosition(position.rashi, ascendantSign),
    longitude: position.longitude,
    degree: position.degree,
    minute: position.minute,
    second: position.second,
    signLord: position.rashiLord,
    nakshatra: position.nakshatra,
    nakshatraLord: position.nakshatraLord,
    pada: position.pada,
    dignity: position.dignity,
    isRetrograde: position.isRetrograde,
    isCombust: position.isCombust,
    isVargottama: position.isVargottama,
    speed: position.speed,
  }
}

function mapHouse(house: Bhava, houses: Bhava[], planets: Record<string, PlanetaryPosition>) {
  const signIndex = ((house.rashi - 1) % 12 + 12) % 12
  const signLord = Object.values(planets).find(planet => planet.rashi === house.rashi)?.rashiLord
    ?? RASHI_LORDS[signIndex]!
  const lordHouse = houses.find(item =>
    RASHI_LORDS[((item.rashi - 1) % 12 + 12) % 12] === signLord)?.number ?? 0
  const normalized = signIndex
  return {
    number: house.number,
    sign: normalized + 1,
    signKey: RASHI_KEYS[normalized]!,
    signName: RASHI_NAMES[normalized]!,
    house: house.number,
    longitude: house.longitude,
    startLongitude: house.startLongitude,
    endLongitude: house.endLongitude,
    signLord,
    lordHouse,
    planets: house.planets,
  }
}

function mapPeriod(period: any): VedicPaipanPeriod {
  return {
    planet: String(period.planet),
    startTime: new Date(period.startTime).toISOString(),
    endTime: new Date(period.endTime).toISOString(),
    durationYears: period.durationYears,
    progressPercent: period.progressPercent,
  }
}

function mapVarga(varga: VargaChart | undefined, key: string, ascendantSign: number): VedicPaipanVarga | null {
  if (!varga) return null
  const ascendant = signPosition(varga.ascendant.rashi, varga.ascendant.rashi)
  return {
    key,
    label: VARGA_LABELS[key] ?? key.toUpperCase(),
    ascendant,
    planets: Object.entries(varga.planets).map(([name, position]) => ({
      name,
      ...signPosition(position.rashi, varga.ascendant.rashi),
    })),
  }
}

function mapReferenceVarga(varga: VargaChart | undefined, key: string): VedicPaipanVarga {
  if (!varga) {
    throw createError({ statusCode: 503, statusMessage: '吠陀参考盘计算结果缺失' })
  }
  const result = mapVarga(varga, key, varga.ascendant.rashi)
  if (!result) throw createError({ statusCode: 503, statusMessage: '吠陀参考盘映射失败' })
  return result
}

function mapPanchang(panchang: any) {
  const interval = (value: any) => value
    ? { start: new Date(value.start).toISOString(), end: new Date(value.end).toISOString() }
    : null
  return {
    tithiName: panchang.tithiName,
    paksha: panchang.paksha,
    nakshatraName: panchang.nakshatraName,
    nakshatraLord: panchang.nakshatraLord,
    yogaName: panchang.yogaName,
    karana: panchang.karana,
    varaName: panchang.varaName,
    masaName: panchang.masa?.name,
    isAdhikaMasa: !!panchang.masa?.isAdhika,
    rituName: panchang.ritu,
    samvatsara: panchang.samvat?.samvatsara,
    vikramSamvat: panchang.samvat?.vikram,
    shakaSamvat: panchang.samvat?.shaka,
    sunrise: panchang.sunrise ? new Date(panchang.sunrise).toISOString() : null,
    sunset: panchang.sunset ? new Date(panchang.sunset).toISOString() : null,
    moonrise: panchang.moonrise ? new Date(panchang.moonrise).toISOString() : null,
    moonset: panchang.moonset ? new Date(panchang.moonset).toISOString() : null,
    rahuKalam: interval(panchang.rahuKalamStart && panchang.rahuKalamEnd
      ? { start: panchang.rahuKalamStart, end: panchang.rahuKalamEnd }
      : null),
    yamagandaKalam: interval(panchang.yamagandaKalam),
    gulikaKalam: interval(panchang.gulikaKalam),
    abhijitMuhurta: interval(panchang.abhijitMuhurta),
    brahmaMuhurta: interval(panchang.brahmaMuhurta),
    currentHora: panchang.currentHora,
  }
}

function mapDrishti(drishti: any) {
  const planets = Object.values(drishti.planetAspects as Record<string, PlanetAspect>).map(item => ({
    planet: item.planet,
    sourceHouse: item.sourceHouse,
    aspectedHouses: item.aspectedHouses.map(house => ({ house: house.house, type: house.type })),
    aspectedPlanets: item.aspectedPlanets.map(planet => ({
      planet: planet.planet,
      house: planet.house,
      type: planet.type,
    })),
  }))
  return {
    planets,
    mutualAspects: drishti.mutualAspects,
  }
}

export function calculateVedicPaipan(input: VedicPaipanInput): VedicPaipanResult {
  const timezone = validateTimezone(input.location.timezone.trim())
  const instant = createUtcInstant(input.birthDate, input.birthTime, timezone)
  const observer = new Observer(input.location.latitude, input.location.longitude, 0)
  const kundli: Kundli = getKundli(instant, observer, {
    ayanamsa: 'lahiri',
    houseSystem: 'whole_sign',
    gender: input.gender || 'other',
    includeChalit: true,
    includeSpecialLagnas: true,
    includeArudhas: true,
    includeReferenceCharts: true,
  })

  const ascendantSign = kundli.ascendant.rashi
  const planetEntries = Object.entries(kundli.planets)
  const planets = planetEntries.map(([name, position]) => mapPlanet(position, name, ascendantSign))
  const houses = kundli.houses.map(house => mapHouse(house, kundli.houses, kundli.planets))
  const vargas = Object.entries(kundli.vargas ?? {})
    .map(([key, varga]) => mapVarga(varga, key, ascendantSign))
    .filter((item): item is VedicPaipanVarga => !!item)
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }))

  const panchangRaw = getPanchangamDetails(instant, observer, {
    timezoneOffset: zoneOffsetMinutes(instant, timezone),
  })
  const now = new Date()
  const nowAyanamsha = panchangRaw.ayanamsa
  const saturnNow = getPlanetaryPosition(Planets.Saturn, now, nowAyanamsha)
  const moonNow = getPlanetaryPosition(Planets.Moon, now, nowAyanamsha)

  const gender = input.gender === 'male' || input.gender === 'female' ? input.gender : 'unknown'
  const offset = zoneOffsetMinutes(instant, timezone)
  const chalitOccupants: Record<string, string[]> = {}
  for (const planet of kundli.chalit?.planets ?? []) {
    chalitOccupants[String(planet.house)] = [
      ...(chalitOccupants[String(planet.house)] ?? []),
      planet.name,
    ]
  }

  return {
    birth: {
      date: input.birthDate,
      time: input.birthTime,
      localText: `${input.birthDate} ${input.birthTime}`,
      utcText: instant.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      gender,
      genderText: gender,
      location: {
        name: input.location.name,
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        timezone,
        utcOffsetMinutes: offset,
      },
      timeUncertain: !!input.timeUncertain,
    },
    methodology: {
      engine: '@prisri/jyotish 1.1.7',
      astronomy: 'Astronomy Engine 2.1.19',
      ayanamsa: 'Lahiri / Chitrapaksha',
      houseSystem: 'Whole Sign (Rasi)',
      ayanamsha: panchangRaw.ayanamsa,
    },
    ascendant: {
      ...signPosition(ascendantSign, ascendantSign),
      longitude: kundli.ascendant.longitude,
      degree: kundli.ascendant.degree ?? 0,
      minute: kundli.ascendant.minute ?? 0,
      second: kundli.ascendant.second ?? 0,
      nakshatra: kundli.ascendant.nakshatra,
      nakshatraLord: kundli.ascendant.nakshatraLord ?? '',
      pada: kundli.ascendant.pada,
    },
    planets,
    houses,
    dasha: {
      birthNakshatra: kundli.dasha.birthNakshatra,
      nakshatraPada: kundli.dasha.nakshatraPada,
      currentMahadasha: kundli.dasha.currentMahadasha ? mapPeriod(kundli.dasha.currentMahadasha) : undefined,
      currentAntar: kundli.dasha.currentAntar ? mapPeriod(kundli.dasha.currentAntar) : undefined,
      currentPratyantar: kundli.dasha.currentPratyantar ? mapPeriod(kundli.dasha.currentPratyantar) : undefined,
      mahadashas: kundli.dasha.mahadashas.map((mahadasha: any) => ({
        ...mapPeriod(mahadasha),
        antars: mahadasha.antars?.map(mapPeriod),
      })),
    },
    vargas,
    chalit: {
      system: kundli.chalit?.system ?? 'sripati',
      planets: (kundli.chalit?.planets ?? []).map(planet => ({
        name: planet.name,
        signHouse: planet.rashiHouse ?? planet.house,
        house: planet.house,
        shifted: planet.shifted ?? 0,
        isRetrograde: !!planet.isRetrograde,
        isCombust: !!planet.isCombust,
      })),
      occupants: chalitOccupants,
    },
    panchang: mapPanchang(panchangRaw),
    specialLagnas: SPECIAL_LAGNA_KEYS.map((key) => {
      const item = kundli.specialLagnas?.[key]
      if (!item) return null
      const normalized = ((item.rashi - 1) % 12 + 12) % 12
      return {
        key,
        sign: normalized + 1,
        signKey: RASHI_KEYS[normalized]!,
        signName: RASHI_NAMES[normalized]!,
        degree: 'degree' in item ? item.degree : 0,
        minute: 'minute' in item ? item.minute : 0,
        second: 'second' in item ? item.second : 0,
        nakshatra: 'nakshatra' in item ? item.nakshatra : undefined,
        nakshatraLord: 'nakshatraLord' in item ? item.nakshatraLord : undefined,
        pada: 'pada' in item ? item.pada : undefined,
      }
    }).filter((item): item is NonNullable<typeof item> => !!item),
    arudhaPadas: (kundli.arudhaPadas?.all ?? []).map((item: ArudhaPadaInfo) => ({
      key: item.code,
      ...signPosition(item.rashi, ascendantSign),
    })),
    drishti: mapDrishti(kundli.drishti),
    ashtakavarga: {
      bav: Object.fromEntries(Object.entries(kundli.ashtakavarga?.bav ?? {}).map(([key, item]) => [
        key,
        { planet: item.planet, totalBindus: item.totalBindus, byHouse: item.byHouse },
      ])),
      sav: {
        totalBindus: kundli.ashtakavarga?.sav.totalBindus ?? 0,
        averageBindus: kundli.ashtakavarga?.sav.averageBindus ?? 0,
        byHouse: kundli.ashtakavarga?.sav.byHouse ?? [],
        strongestHouse: kundli.ashtakavarga?.sav.strongestHouse ?? 0,
        weakestHouse: kundli.ashtakavarga?.sav.weakestHouse ?? 0,
        houseStrengths: kundli.ashtakavarga?.sav.houseStrengths ?? [],
      },
    },
    references: {
      chandraKundli: mapReferenceVarga(kundli.chandraKundli, 'Moon Chart'),
      suryaKundli: mapReferenceVarga(kundli.suryaKundli, 'Sun Chart'),
    },
    transits: {
      asAt: now.toISOString(),
      saturn: mapPlanet(saturnNow, 'Saturn', ascendantSign),
      moon: signPosition(moonNow.rashi, ascendantSign),
      sadeSati: checkSadeSati(kundli.planets.Moon!.longitude, saturnNow.longitude),
      dhaiya: checkDhaiya(kundli.planets.Moon!.longitude, saturnNow.longitude),
      chandrashtama: {
        isActive: getChandrashtama(kundli.planets.Moon!.rashi - 1, moonNow.rashi - 1).isActive,
        signName: getChandrashtama(kundli.planets.Moon!.rashi - 1, moonNow.rashi - 1).chandrashtamaRashiName,
      },
    },
  }
}

export function buildVedicPaipanContext(result: VedicPaipanResult) {
  const d1 = result.vargas.find(item => item.key === 'd1')
  const d9 = result.vargas.find(item => item.key === 'd9')
  const d10 = result.vargas.find(item => item.key === 'd10')
  return [
    `出生：${result.birth.localText} ${result.birth.location.name} ${result.birth.location.timezone}`,
    `上升：${result.ascendant.signName} ${result.ascendant.degree}°，Nakshatra ${result.ascendant.nakshatra} p${result.ascendant.pada}`,
    `行星：${result.planets.map(planet => `${planet.name} ${planet.signName} ${planet.degree}°${planet.minute}' H${planet.house} ${planet.nakshatra} p${planet.pada}${planet.isRetrograde ? ' R' : ''}${planet.isCombust ? ' C' : ''}`).join('; ')}`,
    `宫位：${result.houses.map(house => `H${house.number} ${house.signName}/L:${house.signLord}@H${house.lordHouse} [${house.planets.join('+') || '-'}]`).join('; ')}`,
    `Dasha：${result.dasha.currentMahadasha?.planet ?? '-'} / ${result.dasha.currentAntar?.planet ?? '-'} / ${result.dasha.currentPratyantar?.planet ?? '-'}`,
    `D9：Lagna ${d9?.ascendant.signName}; ${d9?.planets.map(planet => `${planet.name}-${planet.signName}/H${planet.house}`).join('; ')}`,
    `D10：Lagna ${d10?.ascendant.signName}; ${d10?.planets.map(planet => `${planet.name}-${planet.signName}/H${planet.house}`).join('; ')}`,
    `Panchang：${result.panchang.tithiName}/${result.panchang.nakshatraName}/${result.panchang.yogaName}/${result.panchang.karana}/${result.panchang.varaName}`,
    `特殊上升：${result.specialLagnas.map(item => `${item.key}-${item.signName}`).join('; ')}`,
    `Arudha：${result.arudhaPadas.map(item => `${item.key}-H${item.house}`).join('; ')}`,
    `SAV：${result.ashtakavarga.sav.byHouse.map((bindus, index) => `H${index + 1}:${bindus}`).join(',')}`,
    `当前过运：Saturn ${result.transits.saturn.signName} ${result.transits.saturn.degree}° H${result.transits.saturn.house}; SadeSati=${result.transits.sadeSati.status}; Dhaiya=${result.transits.dhaiya.status}`,
  ].join('\n')
}
