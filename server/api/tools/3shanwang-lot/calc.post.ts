import { drawFortune, LOT_TYPES, type DrawALotCalcResult, type FortuneLot, type LotType } from '~~/server/utils/tools/draw-a-lot-data'

function localizeFortune(fortune: FortuneLot, locale: string): DrawALotCalcResult['fortune'] {
  const loc = locale === 'zh-TW' ? 'zh-TW' : (locale === 'en' ? 'en' : 'zh-CN')
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

function localizeLotType(lotType: LotType, locale: string): DrawALotCalcResult['lotType'] {
  const loc = locale === 'zh-TW' ? 'zh-TW' : (locale === 'en' ? 'en' : 'zh-CN')
  return {
    id: lotType.id,
    name: lotType.name[loc] ?? lotType.name['zh-CN']!,
    count: lotType.count,
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ question?: string; locale?: string }>(event)
  const locale = body?.locale || 'zh-CN'
  const lotTypeId = 'sanshan'
  const question = body?.question?.trim() || ''

  if (!question) {
    throw createError({ statusCode: 400, statusMessage: '请填写所问之事' })
  }

  if (!LOT_TYPES.some(t => t.id === lotTypeId)) {
    throw createError({ statusCode: 400, statusMessage: `Unsupported lot type: ${lotTypeId}` })
  }

  const { lotType, fortune } = drawFortune(lotTypeId, locale)

  return {
    lotType: localizeLotType(lotType, locale),
    fortune: localizeFortune(fortune, locale),
    question,
  } as DrawALotCalcResult & { question: string }
})
