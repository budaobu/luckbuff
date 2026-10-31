import { getTranslationRetryStatus } from '~~/server/utils/insights/translate'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler((event) => {
  checkInsightsAdminAuth(event)
  return { status: getTranslationRetryStatus() }
})
