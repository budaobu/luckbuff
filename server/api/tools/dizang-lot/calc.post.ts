import { drawFortune, LOT_TYPES, type DrawALotCalcResult, type FortuneLot, type LotType } from '~~/server/utils/tools/draw-a-lot-data'

function localeKey(locale: string): 'zh-CN' | 'zh-TW' | 'en' {
  return locale === 'zh-TW' ? 'zh-TW' : locale === 'en' ? 'en' : 'zh-CN'
}

function localizeFortune(fortune: FortuneLot, locale: string): DrawALotCalcResult['fortune'] {
  const loc = localeKey(locale)
  return {
    number: fortune.number,
    title: fortune.title[loc] ?? fortune.title['zh-CN']!,
    level: fortune.level[loc] ?? fortune.level['zh-CN']!,
    levelCode: fortune.levelCode,
    poem: fortune.poem[loc] ?? fortune.poem['zh-CN']!,
    explanation: fortune.explanation[loc] ?? fortune.explanation['zh-CN']!,
    advice: fortune.advice[loc] ?? fortune.advice['zh-CN']!,
    sacredMeaning: fortune.sacredMeaning?.[loc] ?? fortune.sacredMeaning?.['zh-CN'],
  }
}

function localizeLotType(lotType: LotType, locale: string): DrawALotCalcResult['lotType'] {
  const loc = localeKey(locale)
  return {
    id: lotType.id,
    name: lotType.name[loc] ?? lotType.name['zh-CN']!,
    count: lotType.count,
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ question?: string; locale?: string }>(event)
  const question = body?.question?.trim() || ''
  const locale = body?.locale || 'zh-CN'

  if (!question) {
    throw createError({ statusCode: 400, statusMessage: '请填写所问之事' })
  }
  if (!LOT_TYPES.some(type => type.id === 'dizang')) {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported lot type: dizang' })
  }

  const { lotType, fortune } = drawFortune('dizang', locale)
  return {
    lotType: localizeLotType(lotType, locale),
    fortune: localizeFortune(fortune, locale),
    question,
  } satisfies DrawALotCalcResult & { question: string }
})
