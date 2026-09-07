export interface VedicPaipanLocation {
  name: string
  latitude: number
  longitude: number
  timezone: string
  utcOffsetMinutes: number
}

export interface VedicPaipanBirth {
  date: string
  time: string
  localText: string
  utcText: string
  gender: 'male' | 'female' | 'unknown'
  genderText: string
  location: VedicPaipanLocation
  timeUncertain: boolean
}

export interface VedicPaipanSignPosition {
  sign: number
  signKey: string
  signName: string
  house: number
}

export interface VedicPaipanNamedSignPosition extends VedicPaipanSignPosition {
  name: string
}

export interface VedicPaipanPlanet extends VedicPaipanSignPosition {
  name: string
  longitude: number
  degree: number
  minute: number
  second: number
  signLord: string
  nakshatra: string
  nakshatraLord: string
  pada: number
  dignity: 'exalted' | 'debilitated' | 'own' | 'neutral' | string
  isRetrograde: boolean
  isCombust: boolean
  isVargottama: boolean
  speed: number
}

export interface VedicPaipanAscendant extends VedicPaipanSignPosition {
  longitude: number
  degree: number
  minute: number
  second: number
  nakshatra: string
  nakshatraLord: string
  pada: number
}

export interface VedicPaipanHouse extends VedicPaipanSignPosition {
  number: number
  longitude: number
  startLongitude: number
  endLongitude: number
  signLord: string
  lordHouse: number
  planets: string[]
}

export interface VedicPaipanPeriod {
  planet: string
  startTime: string
  endTime: string
  durationYears?: number
  progressPercent?: number
}

export interface VedicPaipanDasha {
  birthNakshatra: string
  nakshatraPada: number
  currentMahadasha?: VedicPaipanPeriod
  currentAntar?: VedicPaipanPeriod
  currentPratyantar?: VedicPaipanPeriod
  mahadashas: (VedicPaipanPeriod & { antars?: VedicPaipanPeriod[] })[]
}

export interface VedicPaipanVarga {
  key: string
  label: string
  ascendant: VedicPaipanSignPosition
  planets: VedicPaipanNamedSignPosition[]
}

export interface VedicPaipanChalitPlanet {
  name: string
  signHouse: number
  house: number
  shifted: number
  isRetrograde: boolean
  isCombust: boolean
}

export interface VedicPaipanChalit {
  system: string
  planets: VedicPaipanChalitPlanet[]
  occupants: Record<string, string[]>
}

export interface VedicPaipanPanchang {
  tithiName: string
  paksha: string
  nakshatraName: string
  nakshatraLord: string
  yogaName: string
  karana: string
  varaName: string
  masaName: string
  isAdhikaMasa: boolean
  rituName: string
  samvatsara: string
  vikramSamvat: number
  shakaSamvat: number
  sunrise?: string | null
  sunset?: string | null
  moonrise?: string | null
  moonset?: string | null
  rahuKalam?: { start: string, end: string } | null
  yamagandaKalam?: { start: string, end: string } | null
  gulikaKalam?: { start: string, end: string } | null
  abhijitMuhurta?: { start: string, end: string } | null
  brahmaMuhurta?: { start: string, end: string } | null
  currentHora: string
}

export interface VedicPaipanSpecialLagna {
  key: string
  sign: number
  signKey: string
  signName: string
  degree: number
  minute: number
  second: number
  nakshatra?: string
  nakshatraLord?: string
  pada?: number
}

export interface VedicPaipanArudha {
  key: string
  sign: number
  signKey: string
  signName: string
  house: number
}

export interface VedicPaipanDrishti {
  planets: {
    planet: string
    sourceHouse: number
    aspectedHouses: { house: number, type: string }[]
    aspectedPlanets: { planet: string, house: number, type: string }[]
  }[]
  mutualAspects: {
    planet1: string
    planet2: string
    planet1AspectOnPlanet2: string
    planet2AspectOnPlanet1: string
  }[]
}

export interface VedicPaipanAshtakavarga {
  bav: Record<string, { planet: string, totalBindus: number, byHouse: number[] }>
  sav: {
    totalBindus: number
    averageBindus: number
    byHouse: number[]
    strongestHouse: number
    weakestHouse: number
    houseStrengths: { house: number, bindus: number, strength: string, category: string }[]
  }
}

export interface VedicPaipanTransit {
  asAt: string
  saturn: VedicPaipanPlanet
  moon: VedicPaipanSignPosition
  sadeSati: { status: boolean, phase?: number, phaseName?: string, description?: string }
  dhaiya: { status: boolean, type?: string, typeName?: string, description?: string }
  chandrashtama: { isActive: boolean, signName: string }
}

export interface VedicPaipanResult {
  birth: VedicPaipanBirth
  methodology: {
    engine: string
    astronomy: string
    ayanamsa: string
    houseSystem: string
    ayanamsha: number
  }
  ascendant: VedicPaipanAscendant
  planets: VedicPaipanPlanet[]
  houses: VedicPaipanHouse[]
  dasha: VedicPaipanDasha
  vargas: VedicPaipanVarga[]
  chalit: VedicPaipanChalit
  panchang: VedicPaipanPanchang
  specialLagnas: VedicPaipanSpecialLagna[]
  arudhaPadas: VedicPaipanArudha[]
  drishti: VedicPaipanDrishti
  ashtakavarga: VedicPaipanAshtakavarga
  references: {
    chandraKundli: VedicPaipanVarga
    suryaKundli: VedicPaipanVarga
  }
  transits: VedicPaipanTransit
}
