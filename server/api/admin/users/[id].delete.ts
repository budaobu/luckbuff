import { eq } from 'drizzle-orm'
import { db, schema } from '~~/server/utils/db'
import { checkInsightsAdminAuth, getCurrentAdminUser } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler((event) => {
  checkInsightsAdminAuth(event)
  const id = getRouterParam(event, 'id')
  const current = getCurrentAdminUser(event)

  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少用户 ID' })
  const existing = db.select({ isDefault: schema.adminUsers.isDefault })
    .from(schema.adminUsers).where(eq(schema.adminUsers.id, id)).get()
  if (!existing) throw createError({ statusCode: 404, statusMessage: '用户不存在' })
  if (existing.isDefault) {
    throw createError({ statusCode: 400, statusMessage: '缺省管理员不能删除' })
  }
  if (current?.id === id) {
    throw createError({ statusCode: 400, statusMessage: '不能删除当前登录的用户' })
  }

  const count = db.select({ id: schema.adminUsers.id }).from(schema.adminUsers).all().length
  if (count <= 1) {
    throw createError({ statusCode: 400, statusMessage: '至少需要保留一个后台用户' })
  }

  const deleted = db.delete(schema.adminUsers).where(eq(schema.adminUsers.id, id))
    .returning({ id: schema.adminUsers.id })
    .get()
  if (!deleted) throw createError({ statusCode: 404, statusMessage: '用户不存在' })

  return { ok: true }
})
