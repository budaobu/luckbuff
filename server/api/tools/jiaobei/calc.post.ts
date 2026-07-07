import { drawJiaobei, getJiaobeiLot, localizeResult, type JiaobeiCalcResult } from '~~/server/utils/tools/jiaobei-data'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ question?: string; locale?: string; combo?: string }>(event)
  const locale = body?.locale || 'zh-CN'
  const question = body?.question?.trim() || ''
  const requestedCombo = body?.combo?.trim()

  if (!question) {
    throw createError({ statusCode: 400, statusMessage: '请填写所问之事' })
  }

  let lot: JiaobeiCalcResult['fortune']
  let tosses: string[]

  if (requestedCombo) {
    const found = getJiaobeiLot(requestedCombo)
    if (!found) {
      throw createError({ statusCode: 400, statusMessage: `无效的筊杯组合：${requestedCombo}` })
    }
    lot = found
    tosses = found.combo.split('')
  } else {
    const drawn = drawJiaobei()
    lot = drawn.lot
    tosses = drawn.tosses
  }

  const result: JiaobeiCalcResult = {
    fortune: lot,
    tosses,
    question,
  }

  return localizeResult(result, locale)
})
