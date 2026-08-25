import { processNextWritelistItem } from '~~/server/utils/insights/writelist'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

// 调试入口：手动触发一次完整写作流程，无需等待 41~107 分钟的随机调度。
export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)
  const result = await processNextWritelistItem()
  return { ok: true, result }
})
