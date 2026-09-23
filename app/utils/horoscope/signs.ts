export const HOROSCOPE_SIGN_SLUGS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const

export type HoroscopeSignSlug = typeof HOROSCOPE_SIGN_SLUGS[number]

export const HOROSCOPE_SIGN_NAMES_ZH = [
  '白羊座',
  '金牛座',
  '双子座',
  '巨蟹座',
  '狮子座',
  '处女座',
  '天秤座',
  '天蝎座',
  '射手座',
  '摩羯座',
  '水瓶座',
  '双鱼座',
] as const

export const HOROSCOPE_SIGN_NAMES_TW = [
  '牡羊座',
  '金牛座',
  '雙子座',
  '巨蟹座',
  '獅子座',
  '處女座',
  '天秤座',
  '天蠍座',
  '射手座',
  '摩羯座',
  '水瓶座',
  '雙魚座',
] as const

export const HOROSCOPE_SIGN_NAMES_EN = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const

export const HOROSCOPE_SIGN_NAMES_JA = [
  '牡羊座',
  '牡牛座',
  '双子座',
  '蟹座',
  '獅子座',
  '乙女座',
  '天秤座',
  '蠍座',
  '射手座',
  '山羊座',
  '水瓶座',
  '魚座',
] as const

export const HOROSCOPE_DATE_RANGES_ZH = [
  '3月21日-4月19日',
  '4月20日-5月20日',
  '5月21日-6月21日',
  '6月22日-7月22日',
  '7月23日-8月22日',
  '8月23日-9月22日',
  '9月23日-10月23日',
  '10月24日-11月22日',
  '11月23日-12月21日',
  '12月22日-1月19日',
  '1月20日-2月18日',
  '2月19日-3月20日',
] as const

export const HOROSCOPE_ZODIAC_SIGNS = [
  '白羊', '金牛', '双子', '巨蟹', '狮子', '处女',
  '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼',
] as const

export const HOROSCOPE_ELEMENTS = ['fire', 'earth', 'air', 'water'] as const
export type HoroscopeElement = typeof HOROSCOPE_ELEMENTS[number]

export const HOROSCOPE_SIGN_ELEMENTS: HoroscopeElement[] = [
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water',
]

export function isHoroscopeSignSlug(value: unknown): value is HoroscopeSignSlug {
  return typeof value === 'string' && (HOROSCOPE_SIGN_SLUGS as readonly string[]).includes(value)
}

export function horoscopeSignIndex(slug: string) {
  return (HOROSCOPE_SIGN_SLUGS as readonly string[]).indexOf(slug)
}
