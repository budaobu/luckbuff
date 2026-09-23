import { Body, Ecliptic, GeoVector, MoonPhase } from 'astronomy-engine'
import {
  HOROSCOPE_DATE_RANGES_ZH,
  HOROSCOPE_SIGN_ELEMENTS,
  HOROSCOPE_SIGN_NAMES_EN,
  HOROSCOPE_SIGN_NAMES_JA,
  HOROSCOPE_SIGN_NAMES_ZH,
  HOROSCOPE_SIGN_NAMES_TW,
  HOROSCOPE_SIGN_SLUGS,
  HOROSCOPE_ZODIAC_SIGNS,
  horoscopeSignIndex,
  type HoroscopeSignSlug,
} from '~~/app/utils/horoscope/signs'
import type {
  HoroscopeAspect,
  HoroscopeDay,
  HoroscopePlanetPosition,
  HoroscopeResult,
  HoroscopeScores,
  HoroscopeSign,
  HoroscopeTopicResult,
} from '~~/app/types/horoscope'

const RULERS_ZH = ['火星', '金星', '水星', '月亮', '太阳', '水星', '金星', '冥王星', '木星', '土星', '天王星', '海王星'] as const
const PLANET_BODIES = [
  { key: 'sun', body: Body.Sun, nameZh: '太阳', nameEn: 'Sun' },
  { key: 'moon', body: Body.Moon, nameZh: '月亮', nameEn: 'Moon' },
  { key: 'mercury', body: Body.Mercury, nameZh: '水星', nameEn: 'Mercury' },
  { key: 'venus', body: Body.Venus, nameZh: '金星', nameEn: 'Venus' },
  { key: 'mars', body: Body.Mars, nameZh: '火星', nameEn: 'Mars' },
  { key: 'jupiter', body: Body.Jupiter, nameZh: '木星', nameEn: 'Jupiter' },
  { key: 'saturn', body: Body.Saturn, nameZh: '土星', nameEn: 'Saturn' },
  { key: 'uranus', body: Body.Uranus, nameZh: '天王星', nameEn: 'Uranus' },
  { key: 'neptune', body: Body.Neptune, nameZh: '海王星', nameEn: 'Neptune' },
  { key: 'pluto', body: Body.Pluto, nameZh: '冥王星', nameEn: 'Pluto' },
] as const

const ASPECT_TYPES = [
  { angle: 0, type: 'conjunction', typeZh: '合相', nature: 'focal', weight: 4 },
  { angle: 60, type: 'sextile', typeZh: '六合', nature: 'harmonious', weight: 3 },
  { angle: 90, type: 'square', typeZh: '刑相', nature: 'dynamic', weight: -3 },
  { angle: 120, type: 'trine', typeZh: '拱相', nature: 'harmonious', weight: 5 },
  { angle: 180, type: 'opposition', typeZh: '冲相', nature: 'dynamic', weight: -4 },
] as const

const PLANET_WEIGHTS: Record<string, number> = {
  sun: 5, moon: 5, mercury: 3, venus: 4, mars: 4,
  jupiter: 3, saturn: 3, uranus: 2, neptune: 1, pluto: 2,
}

const DOMAIN_WEIGHTS = {
  love: { venus: 5, moon: 4, mars: 3, sun: 2, jupiter: 2, mercury: 1 },
  work: { mercury: 5, mars: 4, sun: 3, saturn: 3, jupiter: 2, uranus: 1 },
  wealth: { venus: 5, jupiter: 4, saturn: 2, mars: 2, mercury: 2, pluto: 1 },
  health: { mars: 4, sun: 3, moon: 3, saturn: 2, mercury: 1, neptune: 1 },
} as const

const COLOR_KEYS = ['crimson', 'amber', 'emerald', 'sky', 'indigo', 'violet', 'rose', 'slate', 'gold', 'teal', 'mint', 'coral'] as const
const DIRECTION_KEYS = ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast'] as const
type DisplayLocale = 'zh-CN' | 'zh-TW' | 'en' | 'ja'

function localizedSignName(index: number, locale: DisplayLocale) {
  if (locale === 'en') return HOROSCOPE_SIGN_NAMES_EN[index]!
  if (locale === 'ja') return HOROSCOPE_SIGN_NAMES_JA[index]!
  if (locale === 'zh-TW') return HOROSCOPE_SIGN_NAMES_TW[index]!
  return HOROSCOPE_SIGN_NAMES_ZH[index]!
}

function localizedZodiacName(index: number, locale: DisplayLocale) {
  if (locale === 'en') return HOROSCOPE_SIGN_NAMES_EN[index]!
  if (locale === 'ja') return HOROSCOPE_SIGN_NAMES_JA[index]!
  if (locale === 'zh-TW') return HOROSCOPE_SIGN_NAMES_TW[index]!
  return HOROSCOPE_ZODIAC_SIGNS[index]!
}

function localizedZodiacShortName(index: number, locale: DisplayLocale) {
  if (locale === 'en' || locale === 'ja') return localizedZodiacName(index, locale)
  return HOROSCOPE_ZODIAC_SIGNS[index]!
}

function normalizeLongitude(value: number) {
  return ((value % 360) + 360) % 360
}

function signIndexFromLongitude(longitude: number) {
  return Math.floor(normalizeLongitude(longitude) / 30)
}

function signedAngleDelta(from: number, to: number) {
  const delta = normalizeLongitude(to - from)
  return delta > 180 ? delta - 360 : delta
}

function hash(value: string) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return Math.abs(result)
}

function clampScore(value: number) {
  return Math.max(38, Math.min(97, Math.round(value)))
}

function anchorDate(date?: string) {
  if (!date) return new Date()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, statusMessage: 'date must use YYYY-MM-DD' })
  }
  return new Date(`${date}T12:00:00+08:00`)
}

function requestDate(value?: string) {
  const date = anchorDate(value)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const read = (type: string) => parts.find(part => part.type === type)?.value
  return `${read('year')}-${read('month')}-${read('day')}`
}

function astroInstant(date: string) {
  return new Date(`${date}T12:00:00+08:00`)
}

function buildSign(index: number): HoroscopeSign {
  return {
    slug: HOROSCOPE_SIGN_SLUGS[index]!,
    name: HOROSCOPE_SIGN_NAMES_EN[index]!,
    nameZh: HOROSCOPE_SIGN_NAMES_ZH[index]!,
    nameJa: HOROSCOPE_SIGN_NAMES_JA[index]!,
    range: HOROSCOPE_DATE_RANGES_ZH[index]!,
    element: HOROSCOPE_SIGN_ELEMENTS[index]!,
    ruler: RULERS_ZH[index]!,
  }
}

function planetarySky(instant: Date) {
  const positions: HoroscopePlanetPosition[] = PLANET_BODIES.map((definition) => {
    const longitude = Ecliptic(GeoVector(definition.body, instant, true)).elon
    return {
      key: definition.key,
      nameZh: definition.nameZh,
      nameEn: definition.nameEn,
      signIndex: signIndexFromLongitude(longitude),
      degree: Number((normalizeLongitude(longitude) % 30).toFixed(2)),
      isRetrograde: definition.key === 'moon' || definition.key === 'sun'
        ? false
        : Ecliptic(GeoVector(definition.body, new Date(instant.getTime() + 86_400_000), true)).elon
            < Ecliptic(GeoVector(definition.body, instant, true)).elon,
    }
  })

  return {
    positions,
    phase: Number(MoonPhase(instant).toFixed(2)),
  }
}

function aspectsToSun(signIndex: number, positions: HoroscopePlanetPosition[]): HoroscopeAspect[] {
  const sunLongitude = signIndex * 30 + 15
  const result: HoroscopeAspect[] = []

  for (const position of positions) {
    if (position.key === 'sun') continue
    const planetLongitude = position.signIndex * 30 + position.degree
    const delta = Math.abs(signedAngleDelta(sunLongitude, planetLongitude))
    for (const aspect of ASPECT_TYPES) {
      const orb = Math.abs(delta - aspect.angle)
      if (orb > 6.5) continue
      const weight = PLANET_WEIGHTS[position.key] ?? 1
      result.push({
        transitKey: position.key,
        transitNameZh: position.nameZh,
        type: aspect.type,
        typeZh: aspect.typeZh,
        nature: aspect.nature,
        orb: Number(orb.toFixed(2)),
        strength: Math.round((1 - orb / 6.5) * weight * 20),
      })
      break
    }
  }

  return result.sort((a, b) => b.strength - a.strength)
}

function elementAffinity(a: number, b: number) {
  if (a === b) return 3
  const compatible: Record<string, string[]> = {
    fire: ['air'],
    earth: ['water'],
    air: ['fire'],
    water: ['earth'],
  }
  return compatible[HOROSCOPE_SIGN_ELEMENTS[a]!]?.includes(HOROSCOPE_SIGN_ELEMENTS[b]!) ? 2 : 0
}

function buildScores(
  signIndex: number,
  date: string,
  aspects: HoroscopeAspect[],
  moonSignIndex: number,
  phase: number,
) {
  const energy = aspects.reduce((total, aspect) => {
    const aspectWeight = ASPECT_TYPES.find(item => item.type === aspect.type)!.weight
    return total + aspectWeight * (PLANET_WEIGHTS[aspect.transitKey] ?? 1) * (1 - aspect.orb / 8)
  }, 0)
  const moonAffinity = elementAffinity(signIndex, moonSignIndex)
  const moonPhaseLift = Math.cos((phase / 360) * Math.PI * 2) * 4
  const seed = hash(`${signIndex}:${date}`)
  const domainSeed = (domain: string, multiplier: number) => ((hash(`${domain}:${date}:${signIndex}`) % 17) - 8) * multiplier

  const love = clampScore(64 + energy * 1.2 + moonAffinity * 2 + moonPhaseLift + domainSeed('love', 0.7))
  const work = clampScore(65 + energy * 1.3 + moonAffinity * 1.5 + domainSeed('work', 0.8))
  const wealth = clampScore(62 + energy * 1.1 + moonAffinity * 1.8 + moonPhaseLift * 0.6 + domainSeed('wealth', 0.8))
  const health = clampScore(67 + energy * 0.8 + moonAffinity * 1.4 + moonPhaseLift * 0.8 + domainSeed('health', 0.6))
  const overall = clampScore((love + work + wealth + health) / 4 + (seed % 7) - 3)

  return { overall, love, work, wealth, health } satisfies HoroscopeScores
}

function dailyResult(signIndex: number, date: string, scores: HoroscopeScores): HoroscopeDay {
  const seed = hash(`${signIndex}:${date}:daily`)
  return {
    date,
    scores,
    luckyNumber: 1 + ((seed >>> 3) % 9),
    luckyColorKey: COLOR_KEYS[(seed >>> 7) % COLOR_KEYS.length]!,
    luckyDirectionKey: DIRECTION_KEYS[(seed >>> 11) % DIRECTION_KEYS.length]!,
    loveHint: scores.love >= 78 ? 'flowing' : scores.love >= 62 ? 'steady' : 'reflect',
    workHint: scores.work >= 78 ? 'momentum' : scores.work >= 62 ? 'focus' : 'simplify',
    wealthHint: scores.wealth >= 78 ? 'opportunity' : scores.wealth >= 62 ? 'discipline' : 'review',
    healthHint: scores.health >= 78 ? 'energize' : scores.health >= 62 ? 'balance' : 'rest',
  }
}

function localizedHint(value: string, locale: string) {
  if (locale === 'en') {
    return {
      flowing: 'Warm connection; keep conversations open.',
      steady: 'Steady closeness grows from small honest signals.',
      reflect: 'Pause before reacting; listen for the unspoken need.',
      momentum: 'Momentum favors decisions and visible progress.',
      focus: 'Close one priority before opening another.',
      simplify: 'Cut the plan to the one task that moves today.',
      opportunity: 'Prepared choices can surface a practical gain.',
      discipline: 'Protect cash flow; delay impulse purchases.',
      review: 'Review numbers before committing new costs.',
      energize: 'Energy is usable; move without overextending.',
      balance: 'Alternate effort and recovery deliberately.',
      rest: 'Lower intensity; sleep and hydration matter most.',
    }[value] ?? value
  }
  if (locale === 'ja') {
    return {
      flowing: '交流が温かく、率直な会話が距離を縮めます。',
      steady: '小さな正直な合図が、穏やかな関係を育てます。',
      reflect: '反応は少し保留し、言葉にならない需要に耳をすくめて。',
      momentum: '決断と見える進捗に勢いがつきます。',
      focus: '新しい物事より、今の最優先を仕上げて。',
      simplify: '計画を減らし、今日動く一件だけに絞りましょう。',
      opportunity: '準備した選択に実用的な利益が生まれやすくなります。',
      discipline: '資金繰りを守り、衝動的な出費は控えめに。',
      review: '新しい支出の前に数字を見直しましょう。',
      energize: '体力を使いやすい日。伸ばしすぎないこと。',
      balance: '頑張る時間と回復する時間を交互に。',
      rest: '負荷を下げ、睡眠と水分を最優先に。',
    }[value] ?? value
  }
  if (locale === 'zh-TW') {
    return {
      flowing: '關係流動，坦誠表達能拉近距離。',
      steady: '穩定的親密感來自小而真實的回應。',
      reflect: '先緩一緩，聽懂對方沒有說出口的需要。',
      momentum: '適合推進決策，讓成果被看見。',
      focus: '先收束當前重點，再打開新任務。',
      simplify: '把計劃刪到今天真正能推進的一件。',
      opportunity: '準備好的選擇更容易帶來實際收益。',
      discipline: '守住現金流，推遲衝動消費。',
      review: '新支出前先複核數字與必要性。',
      energize: '體力可用，適合行動但別過度消耗。',
      balance: '在發力與恢復之間安排清楚節奏。',
      rest: '降低強度，優先睡眠和補水。',
    }[value] ?? value
  }
  return {
    flowing: '关系流动，坦诚表达能拉近距离。',
    steady: '稳定的亲密感来自小而真实的回应。',
    reflect: '先缓一缓，听懂对方没有说出口的需要。',
    momentum: '适合推进决策，让成果被看见。',
    focus: '先收束当前重点，再打开新任务。',
    simplify: '把计划删到今天真正能推进的一件。',
    opportunity: '准备好的选择更容易带来实际收益。',
    discipline: '守住现金流，推迟冲动消费。',
    review: '新支出前先复核数字与必要性。',
    energize: '体力可用，适合行动但别过度消耗。',
    balance: '在发力与恢复之间安排清楚节奏。',
    rest: '降低强度，优先睡眠和补水。',
  }[value] ?? value
}

function aspectTypeText(type: string, locale: DisplayLocale) {
  if (locale === 'en') return { conjunction: 'conjunction', sextile: 'sextile', square: 'square', trine: 'trine', opposition: 'opposition' }[type] ?? type
  if (locale === 'ja') return { conjunction: 'コンジャンクション', sextile: 'セクスタイル', square: 'スクエア', trine: 'トライン', opposition: 'オポジション' }[type] ?? type
  return ASPECT_TYPES.find(aspect => aspect.type === type)?.typeZh ?? type
}

function planetNameText(key: string, locale: DisplayLocale) {
  const planet = PLANET_BODIES.find(item => item.key === key)
  if (locale === 'en') return planet?.nameEn ?? key
  if (locale === 'ja') return { sun: '太陽', moon: '月', mercury: '水星', venus: '金星', mars: '火星', jupiter: '木星', saturn: '土星', uranus: '天王星', neptune: '海王星', pluto: '冥王星' }[key] ?? planet?.nameEn ?? key
  return planet?.nameZh ?? key
}

function moonPhaseKey(angle: number) {
  if (angle < 22.5 || angle >= 337.5) return 'new'
  if (angle < 67.5) return 'waxing-crescent'
  if (angle < 112.5) return 'first-quarter'
  if (angle < 157.5) return 'waxing-gibbous'
  if (angle < 202.5) return 'full'
  if (angle < 247.5) return 'waning-gibbous'
  if (angle < 292.5) return 'last-quarter'
  return 'waning-crescent'
}

export function calculateHoroscopeResult(signSlug: HoroscopeSignSlug, inputDate?: string, displayLocale: DisplayLocale = 'zh-CN'): HoroscopeResult {
  const date = requestDate(inputDate)
  const signIndex = horoscopeSignIndex(signSlug)
  const sign = buildSign(signIndex)
  const instant = astroInstant(date)
  const { positions, phase } = planetarySky(instant)
  const aspects = aspectsToSun(signIndex, positions)
  const moonSignIndex = positions.find(position => position.key === 'moon')!.signIndex
  const scores = buildScores(signIndex, date, aspects, moonSignIndex, phase)
  const day = dailyResult(signIndex, date, scores)
  const compatibility = buildSign((signIndex + 5 + (hash(`${signSlug}:${date}`) % 3)) % 12)
  const strongest = aspects[0]

  const summaryZh = strongest
    ? `${sign.nameZh}今日由${strongest.transitNameZh}${strongest.typeZh}太阳主导，整体节奏偏${scores.overall >= 72 ? '顺势' : scores.overall >= 58 ? '可控' : '内收'}；月亮落在${HOROSCOPE_ZODIAC_SIGNS[moonSignIndex]}座，适合${day.workHint === 'momentum' ? '先做关键推进' : day.workHint === 'focus' ? '聚焦一件事' : '减少分叉'}。`
    : `${sign.nameZh}今日没有进入明显相位窗，月亮落在${HOROSCOPE_ZODIAC_SIGNS[moonSignIndex]}座，宜按原有节奏稳住重点。`

  return {
    sign,
    date,
    generatedAt: new Date().toISOString(),
    timeZone: 'Asia/Shanghai',
    scores: day.scores,
    luckyNumber: day.luckyNumber,
    luckyColorKey: day.luckyColorKey,
    luckyDirectionKey: day.luckyDirectionKey,
    loveHint: localizedHint(day.loveHint, displayLocale),
    workHint: localizedHint(day.workHint, displayLocale),
    wealthHint: localizedHint(day.wealthHint, displayLocale),
    healthHint: localizedHint(day.healthHint, displayLocale),
    compatibility,
    summary: displayLocale === 'en'
      ? `${sign.name} is led today by ${strongest ? `${planetNameText(strongest.transitKey, displayLocale)} ${aspectTypeText(strongest.type, displayLocale)}` : 'a quiet aspect field'}; the Moon is in ${HOROSCOPE_SIGN_NAMES_EN[moonSignIndex]}. ${localizedHint(day.workHint, displayLocale)}`
      : displayLocale === 'ja'
        ? `${sign.nameJa}は今日${strongest ? `${planetNameText(strongest.transitKey, displayLocale)}の${aspectTypeText(strongest.type, displayLocale)}` : '明確なアスペクト'}の影響を受け、月は${HOROSCOPE_SIGN_NAMES_JA[moonSignIndex]}にあります。${localizedHint(day.workHint, displayLocale)}`
        : displayLocale === 'zh-TW'
          ? `${localizedSignName(signIndex, displayLocale)}今日由${strongest ? `${planetNameText(strongest.transitKey, displayLocale)}${aspectTypeText(strongest.type, displayLocale)}太陽主導` : '沒有明顯相位主導'}，月亮落在${localizedZodiacShortName(moonSignIndex, displayLocale)}座。${localizedHint(day.workHint, displayLocale)}`
          : summaryZh,
    sky: {
      moonPhaseAngle: phase,
      moonPhaseKey: moonPhaseKey(phase),
      moonSignIndex,
      planets: positions,
      aspects,
    },
    methodology: {
      engine: 'astronomy-engine 2.1.19 (MIT)',
      zodiac: displayLocale === 'en'
        ? 'Tropical zodiac; daily anchor at 12:00 Asia/Shanghai'
        : displayLocale === 'ja'
          ? 'トロピカル黄道。毎日12:00 Asia/Shanghaiを基準'
          : displayLocale === 'zh-TW'
            ? '回歸黃道；每日 12:00 Asia/Shanghai 星象錨點'
          : '回归黄道；每日 12:00 Asia/Shanghai 星象锚点',
      scoring: displayLocale === 'en'
        ? 'Astronomical positions and aspects provide evidence; deterministic local rules generate scores; AI does not calculate data.'
        : displayLocale === 'ja'
          ? '天文位置とアスペクトを根拠に、ローカル決定論ルールで指数を生成します。AIはデータ計算に使いません。'
          : displayLocale === 'zh-TW'
            ? '天文位置與相位為證據層，本地確定性規則生成分項，AI 不參與資料計算'
          : '天文位置与相位为证据层，本地确定性规则生成分项，AI 不参与数据计算',
      disclaimer: displayLocale === 'en'
        ? 'For reflection and entertainment only; not medical, legal, or investment advice.'
        : displayLocale === 'ja'
          ? '自分整理・娯楽の参考であり、医療・法律・投資の助言ではありません。'
          : displayLocale === 'zh-TW'
            ? '運勢內容用於自我整理與娛樂參考，不構成醫療、法律或投資建議。'
          : '运势内容用于自我整理与娱乐参考，不构成医疗、法律或投资建议。',
    },
  }
}

export function calculateHoroscopeTopic(inputDate?: string, displayLocale: DisplayLocale = 'zh-CN'): HoroscopeTopicResult {
  const date = requestDate(inputDate)
  const instant = astroInstant(date)
  const { positions, phase } = planetarySky(instant)
  const moonSignIndex = positions.find(position => position.key === 'moon')!.signIndex
  const rows = HOROSCOPE_SIGN_SLUGS.map((slug, index) => {
    const aspects = aspectsToSun(index, positions)
    const scores = buildScores(index, date, aspects, moonSignIndex, phase)
    const day = dailyResult(index, date, scores)
    return {
      sign: buildSign(index),
      scores,
      luckyNumber: day.luckyNumber,
      luckyColorKey: day.luckyColorKey,
      summary: localizedHint(day.workHint, displayLocale),
    }
  }).sort((a, b) => b.scores.overall - a.scores.overall)
    .map((row, index) => ({ ...row, rank: index + 1 }))

  return {
    date,
    generatedAt: new Date().toISOString(),
    timeZone: 'Asia/Shanghai',
    moonPhaseAngle: phase,
    moonPhaseKey: moonPhaseKey(phase),
    moonSignIndex,
    signs: rows,
  }
}

export function calculateHoroscopeRange(
  signSlug: HoroscopeSignSlug,
  rangeDays: 1 | 3 | 7,
  types: string[],
) {
  const date = requestDate()
  const selected = new Set(types)
  const result: HoroscopeDay[] = []
  for (let offset = 0; offset < rangeDays; offset += 1) {
    const instant = astroInstant(date)
    instant.setUTCDate(instant.getUTCDate() + offset)
    const dayDate = instant.toISOString().slice(0, 10)
    const signIndex = horoscopeSignIndex(signSlug)
    const sky = planetarySky(new Date(`${dayDate}T12:00:00+08:00`))
    const aspects = aspectsToSun(signIndex, sky.positions)
    const moonSignIndex = sky.positions.find(position => position.key === 'moon')!.signIndex
    const scores = buildScores(signIndex, dayDate, aspects, moonSignIndex, sky.phase)
    const day = dailyResult(signIndex, dayDate, scores)
    result.push({
      ...day,
      luckyNumber: selected.has('lucky-number') ? day.luckyNumber : day.luckyNumber,
      luckyColorKey: selected.has('lucky-color') ? day.luckyColorKey : day.luckyColorKey,
    })
  }
  return result
}
