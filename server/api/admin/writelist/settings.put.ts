import { setWritelistAutoPublish } from '~~/server/utils/insights/writelist'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

// 切换「需审核 / 自动发布」：只写入开关值本身，不触碰队列里任何标题，
// 因此切换不会造成标题被跳过或重复处理。
export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)
  const body = await readBody<{ autoPublish?: boolean }>(event)
  const settings = setWritelistAutoPublish(body?.autoPublish === true)
  return { ok: true, settings }
})
