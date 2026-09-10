import { calculateXuankongFeixing } from '~~/server/utils/tools/xuankong-feixing'
import type { XuankongCalcInput } from '~~/app/types/xuankong-feixing'

export default defineEventHandler(async (event) => {
  const body = await readBody<XuankongCalcInput>(event)
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chart input' })
  }
  return await calculateXuankongFeixing(body)
})
