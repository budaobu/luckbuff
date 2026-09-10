import {
  calculateZibaifeixingPaipan,
  type ZibaifeixingInput,
} from '~~/server/utils/tools/zibaifeixing-paipan'

export default defineEventHandler(async (event) => {
  const body = await readBody<ZibaifeixingInput>(event)

  if (!body?.date || !Number.isInteger(body.timeIndex)) {
    throw createError({ statusCode: 400, statusMessage: '日期和时辰为必填项' })
  }

  return calculateZibaifeixingPaipan({
    date: body.date,
    timeIndex: body.timeIndex,
    location: body.location?.name ? body.location : null,
  })
})
