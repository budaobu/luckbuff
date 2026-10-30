import { asc } from 'drizzle-orm'
import { db, schema } from '~~/server/utils/db'
import { checkInsightsAdminAuth, getCurrentAdminUser } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler((event) => {
  checkInsightsAdminAuth(event)
  const current = getCurrentAdminUser(event)
  const users = db.select({
    id: schema.adminUsers.id,
    username: schema.adminUsers.username,
    isDefault: schema.adminUsers.isDefault,
    createdAt: schema.adminUsers.createdAt,
    updatedAt: schema.adminUsers.updatedAt,
  }).from(schema.adminUsers).orderBy(asc(schema.adminUsers.createdAt)).all()

  return { users, currentUserId: current?.id ?? null }
})
