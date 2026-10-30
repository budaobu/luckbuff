import { checkInsightsAdminAuth, getCurrentAdminUser } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)
  const user = getCurrentAdminUser(event)
  return { ok: true, user: user ? { id: user.id, username: user.username } : null }
})
