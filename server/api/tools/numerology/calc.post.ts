interface CalcInput {
  name: string
  birthdate: string
  locale?: string
}

interface PersonalityEntry {
  标签: string[]
  符号: string
}

const PERSONALITY_MAP: Record<string, Record<number, PersonalityEntry>> = {
  'zh-CN': {
    1: { 标签: ['独立', '主动', '开创'], 符号: '起点型' },
    2: { 标签: ['协调', '敏感', '合作'], 符号: '联结型' },
    3: { 标签: ['表达', '创意', '社交'], 符号: '表达型' },
    4: { 标签: ['稳定', '秩序', '执行'], 符号: '结构型' },
    5: { 标签: ['变化', '自由', '探索'], 符号: '变化型' },
    6: { 标签: ['责任', '关怀', '和谐'], 符号: '照护型' },
    7: { 标签: ['内省', '分析', '洞察'], 符号: '思辨型' },
    8: { 标签: ['目标', '掌控', '成就'], 符号: '成就型' },
    9: { 标签: ['理想', '包容', '完成'], 符号: '完成型' },
    11: { 标签: ['直觉', '启发', '感召'], 符号: '启发型' },
    22: { 标签: ['建构', '整合', '落地'], 符号: '建构型' },
    33: { 标签: ['奉献', '滋养', '引导'], 符号: '滋养型' },
  },
  'zh-TW': {
    1: { 标签: ['獨立', '主動', '開創'], 符号: '起點型' },
    2: { 标签: ['協調', '敏感', '合作'], 符号: '聯結型' },
    3: { 标签: ['表達', '創意', '社交'], 符号: '表達型' },
    4: { 标签: ['穩定', '秩序', '執行'], 符号: '結構型' },
    5: { 标签: ['變化', '自由', '探索'], 符号: '變化型' },
    6: { 标签: ['責任', '關懷', '和諧'], 符号: '照護型' },
    7: { 标签: ['內省', '分析', '洞察'], 符号: '思辨型' },
    8: { 标签: ['目標', '掌控', '成就'], 符号: '成就型' },
    9: { 标签: ['理想', '包容', '完成'], 符号: '完成型' },
    11: { 标签: ['直覺', '啟發', '感召'], 符号: '啟發型' },
    22: { 标签: ['建構', '整合', '落地'], 符号: '建構型' },
    33: { 标签: ['奉獻', '滋養', '引導'], 符号: '滋養型' },
  },
  en: {
    1: { 标签: ['Independent', 'Proactive', 'Pioneering'], 符号: 'Initiator' },
    2: { 标签: ['Diplomatic', 'Sensitive', 'Cooperative'], 符号: 'Connector' },
    3: { 标签: ['Expressive', 'Creative', 'Social'], 符号: 'Expressor' },
    4: { 标签: ['Stable', 'Orderly', 'Diligent'], 符号: 'Builder' },
    5: { 标签: ['Adaptive', 'Freedom-loving', 'Exploratory'], 符号: 'Explorer' },
    6: { 标签: ['Responsible', 'Caring', 'Harmonious'], 符号: 'Nurturer' },
    7: { 标签: ['Introspective', 'Analytical', 'Insightful'], 符号: 'Thinker' },
    8: { 标签: ['Goal-oriented', 'Authoritative', 'Accomplished'], 符号: 'Achiever' },
    9: { 标签: ['Idealistic', 'Inclusive', 'Completing'], 符号: 'Humanitarian' },
    11: { 标签: ['Intuitive', 'Inspiring', 'Charismatic'], 符号: 'Illuminator' },
    22: { 标签: ['Constructive', 'Integrative', 'Practical'], 符号: 'Master Builder' },
    33: { 标签: ['Devoted', 'Nurturing', 'Guiding'], 符号: 'Master Teacher' },
  },
}

const LATIN_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
}

function sumOfDigits(n: number): number {
  let sum = 0
  let num = Math.abs(n)
  while (num > 0) {
    sum += num % 10
    num = Math.floor(num / 10)
  }
  return sum
}

function reduceNumber(n: number): number {
  while (n !== 11 && n !== 22 && n !== 33 && n > 9) {
    n = sumOfDigits(n)
  }
  return n
}

function normalizeBirthdate(birthdate: string): string {
  const digits = birthdate.replace(/\D/g, '')
  if (digits.length !== 8) {
    throw createError({ statusCode: 400, statusMessage: 'Birthdate must normalize to exactly 8 digits (YYYY-MM-DD format expected)' })
  }
  return digits
}

function normalizeName(name: string): string {
  return name.trim()
}

function charValue(char: string): number | null {
  const upper = char.toUpperCase()
  if (LATIN_MAP[upper] !== undefined) {
    return LATIN_MAP[upper]
  }
  const code = char.codePointAt(0)
  if (code === undefined) return null
  // Skip common punctuation and whitespace
  if (/[\s\-_'".!?,:;]/.test(char)) return null
  // Fallback: sum digits of Unicode code point, then reduce to 1-9
  const digitSum = sumOfDigits(code)
  let reduced = digitSum
  while (reduced > 9) {
    reduced = sumOfDigits(reduced)
  }
  return reduced
}

function computeNameNumber(name: string): number {
  const normalized = normalizeName(name)
  let total = 0
  for (const char of normalized) {
    const val = charValue(char)
    if (val !== null) {
      total += val
    }
  }
  return reduceNumber(total)
}

function computeLifePathNumber(normalizedBirthdate: string): number {
  let sum = 0
  for (const digit of normalizedBirthdate) {
    sum += parseInt(digit, 10)
  }
  return reduceNumber(sum)
}

function getPersonalityMap(locale: string): Record<number, PersonalityEntry> {
  if (locale === 'zh-TW') return PERSONALITY_MAP['zh-TW']!
  if (locale === 'en') return PERSONALITY_MAP.en!
  return PERSONALITY_MAP['zh-CN']!
}

function getCompositeDescription(locale: string): string {
  const desc: Record<string, string> = {
    'zh-CN': '以内在核心采用生命路径数的符号映射，以外在表达采用姓名数的符号映射',
    'zh-TW': '以內在核心採用生命路徑數的符號映射，以外在表達採用姓名數的符號映射',
    en: 'Inner core follows the Life Path Number symbolism; outer expression follows the Name Number symbolism.',
  }
  return desc[locale] ?? desc['zh-CN']!
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CalcInput>(event)

  if (!body?.name || typeof body.name !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid name' })
  }
  if (!body?.birthdate || typeof body.birthdate !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid birthdate' })
  }

  const locale = body.locale || 'zh-CN'
  const personalityMap = getPersonalityMap(locale)

  const normalizedBirthdate = normalizeBirthdate(body.birthdate)
  const lifePathNumber = computeLifePathNumber(normalizedBirthdate)
  const nameNumber = computeNameNumber(body.name)

  const lifePathPersonality = personalityMap[lifePathNumber]!
  const namePersonality = personalityMap[nameNumber]!

  // 综合标签 = 生命路径标签 + 姓名映射标签（去重）
  const combinedTags = Array.from(new Set([
    ...lifePathPersonality.标签,
    ...namePersonality.标签,
  ]))

  return {
    核心数字: {
      生命路径数: lifePathNumber,
      姓名数: nameNumber,
      主导数: lifePathNumber,
      辅助数: nameNumber,
    },
    性格: {
      生命路径: lifePathPersonality,
      姓名映射: namePersonality,
      综合: {
        标签: combinedTags,
        说明: getCompositeDescription(locale),
      },
    },
  }
})
