import { getFortuneByNumber, type FortuneLot, type LotType } from '~~/server/utils/tools/draw-a-lot-data'

function localeKey(locale: string): 'zh-CN' | 'zh-TW' | 'en' {
  return locale === 'zh-TW' ? 'zh-TW' : locale === 'en' ? 'en' : 'zh-CN'
}

function localizeFortune(fortune: FortuneLot, locale: string) {
  const loc = localeKey(locale)
  return {
    number: fortune.number,
    title: fortune.title[loc] ?? fortune.title['zh-CN']!,
    level: fortune.level[loc] ?? fortune.level['zh-CN']!,
    levelCode: fortune.levelCode,
    poem: fortune.poem[loc] ?? fortune.poem['zh-CN']!,
    explanation: fortune.explanation[loc] ?? fortune.explanation['zh-CN']!,
    advice: fortune.advice[loc] ?? fortune.advice['zh-CN']!,
  }
}

function localizeLotType(lotType: LotType, locale: string) {
  const loc = localeKey(locale)
  return {
    id: lotType.id,
    name: lotType.name[loc] ?? lotType.name['zh-CN']!,
    count: lotType.count,
  }
}

export default defineEventHandler((event) => {
  const number = Number(getRouterParam(event, 'number'))
  if (!Number.isInteger(number) || number < 1 || number > 100) {
    throw createError({ statusCode: 404, statusMessage: 'Lot not found' })
  }
  const locale = String(getQuery(event).locale || 'zh-CN')
  const { lotType, fortune } = getFortuneByNumber('guanyin', number, locale)
  return {
    lotType: localizeLotType(lotType, locale),
    fortune: localizeFortune(fortune, locale),
    locale,
  }
})
