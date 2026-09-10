import { GUA_64, NUMBER_MEANINGS } from './taiyi-paipan-constants'

export function mod(value: number, modulus: number) {
  return ((value % modulus) + modulus) % modulus
}

export function modOrOne(value: number, modulus: number) {
  const remainder = mod(value, modulus)
  return remainder === 0 ? modulus : remainder
}

export function rotate<T>(items: readonly T[], start: T | number): T[] {
  const index = items.indexOf(start as T)
  if (index < 0) return [...items]
  return [...items.slice(index), ...items.slice(0, index)]
}

export function cycleValue<T>(items: readonly T[], oneBasedIndex: number): T {
  return items[modOrOne(oneBasedIndex, items.length) - 1]!
}

export function chineseNumber(value: number): string {
  const digits = [...'零一二三四五六七八九']
  if (value < 10) return digits[value]!
  if (value < 20) return `十${value % 10 ? digits[value % 10]! : ''}`
  if (value < 100) {
    const tens = Math.floor(value / 10)
    const ones = value % 10
    return `${digits[tens]}十${ones ? digits[ones]! : ''}`
  }
  if (value < 1000) {
    const hundreds = Math.floor(value / 100)
    const remainder = value % 100
    if (remainder === 0) return `${digits[hundreds]}百`
    if (remainder < 10) return `${digits[hundreds]}百零${digits[remainder]!}`
    return `${digits[hundreds]}百${chineseNumber(remainder)}`
  }
  return String(value)
}

export function xunKong(ganZhi: string) {
  const gan = [...'甲乙丙丁戊己庚辛壬癸']
  const zhi = [...'子丑寅卯辰巳午未申酉戌亥']
  const sixty = Array.from({ length: 60 }, (_, index) => `${gan[index % 10]!}${zhi[index % 12]!}`)
  const index = sixty.indexOf(ganZhi)
  const xun = Math.floor(Math.max(index, 0) / 10) * 10
  const voidByXun: Record<string, string[]> = {
    甲子: ['戌', '亥'], 甲戌: ['申', '酉'], 甲申: ['午', '未'],
    甲午: ['辰', '巳'], 甲辰: ['寅', '卯'], 甲寅: ['子', '丑'],
  }
  return voidByXun[sixty[xun]!] || []
}

export function calculationMeanings(value: number) {
  const meanings: string[] = []
  if (value > 10 && value % 10 > 5) meanings.push('三才足数')
  if (value < 10) meanings.push('无天：二曜虚蚀、五纬失度')
  if (value % 10 < 5) meanings.push('无地：地气不稳')
  if (value % 10 === 0) meanings.push('无人：人事虚耗')
  const named = NUMBER_MEANINGS[value]
  if (named) meanings.push(named)
  return meanings
}

export function guaName(number: number) {
  return GUA_64[Math.max(1, number) - 1] || '未知'
}

export function formatWallTime(parts: { year: number, month: number, day: number, hour: number, minute: number }) {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')} ${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
}
