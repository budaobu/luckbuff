import { getFortuneByNumber } from '~~/server/utils/tools/draw-a-lot-data'

export default defineEventHandler((event) => {
  const number = Number(getRouterParam(event, 'number'))
  const { locale } = getQuery(event)
  if (!Number.isInteger(number) || number < 1 || number > 32) {
    throw createError({ statusCode: 404, statusMessage: `Lot not found: ${number}` })
  }

  const { lotType, fortune, locale: resolvedLocale } = getFortuneByNumber('tudigong', number, String(locale || 'zh-CN'))
  const localeKey = resolvedLocale === 'zh-TW' ? 'zh-TW' : resolvedLocale === 'en' ? 'en' : 'zh-CN'

  return {
    lotType: {
      id: lotType.id,
      name: lotType.name[localeKey] ?? lotType.name['zh-CN']!,
      count: lotType.count,
    },
    fortune: {
      number: fortune.number,
      title: fortune.title[localeKey] ?? fortune.title['zh-CN']!,
      level: fortune.level[localeKey] ?? fortune.level['zh-CN']!,
      levelCode: fortune.levelCode,
      poem: fortune.poem[localeKey] ?? fortune.poem['zh-CN']!,
      explanation: fortune.explanation[localeKey] ?? fortune.explanation['zh-CN']!,
      advice: fortune.advice[localeKey] ?? fortune.advice['zh-CN']!,
      sacredMeaning: fortune.sacredMeaning?.[localeKey] ?? fortune.sacredMeaning?.['zh-CN'],
    },
    locale: resolvedLocale,
  }
})
