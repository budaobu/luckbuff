import { clearAdminSession } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  clearAdminSession(event)
  return { ok: true }
})
