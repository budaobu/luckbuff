import jiaobeiLotData from '../../../app/data/jiaobei-lots-28.json'

export interface JiaobeiLot {
  number: number
  combo: string
  comboNormalized: string
  name: string
  poem: string
  explanation: string
  advice: string
  level: string
  levelCode: 'upper' | 'upper-middle' | 'middle' | 'lower-middle' | 'lower'
  story: string
  interpretation: string
}

export interface JiaobeiCalcResult {
  fortune: JiaobeiLot
  tosses: string[]
  question: string
}

const TOSS_LABELS: Record<string, Record<string, string>> = {
  '圣': { 'zh-CN': '圣杯', 'zh-TW': '聖杯', en: 'Holy' },
  '笑': { 'zh-CN': '笑杯', 'zh-TW': '笑杯', en: 'Laughing' },
  '阳': { 'zh-CN': '笑杯', 'zh-TW': '笑杯', en: 'Laughing' },
  '阴': { 'zh-CN': '阴杯', 'zh-TW': '陰杯', en: 'Yin' },
}

const LOTS: JiaobeiLot[] = jiaobeiLotData as JiaobeiLot[]

export function getJiaobeiLot(combo: string): JiaobeiLot | undefined {
  return LOTS.find(l => l.combo === combo || l.comboNormalized === combo)
}

export function drawJiaobei(): { lot: JiaobeiLot; tosses: string[] } {
  const validLots = LOTS.filter(l => l.combo.length === 3)
  const lot = validLots[Math.floor(Math.random() * validLots.length)]!
  return { lot, tosses: lot.combo.split('') }
}

export function localizeToss(toss: string, locale: string): string {
  const loc = locale === 'zh-TW' ? 'zh-TW' : (locale === 'en' ? 'en' : 'zh-CN')
  return TOSS_LABELS[toss]?.[loc] ?? toss
}

export function localizeResult(result: JiaobeiCalcResult, locale: string): JiaobeiCalcResult {
  return {
    ...result,
    tosses: result.tosses.map(t => localizeToss(t, locale)),
  }
}

export { LOTS }
