import { and, eq, ne } from 'drizzle-orm'
import { db, schema } from '~~/server/utils/db'
import { checkInsightsAdminAuth, hashAdminPassword } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ username?: unknown; password?: unknown }>(event)
  const username = typeof body?.username === 'string' ? body.username.trim() : undefined
  const password = typeof body?.password === 'string' ? body.password : undefined

  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少用户 ID' })
  if (username !== undefined && (username.length < 2 || username.length > 64)) {
    throw createError({ statusCode: 400, statusMessage: '用户名需为 2-64 个字符' })
  }
  if (password !== undefined && (password.length < 8 || password.length > 256)) {
    throw createError({ statusCode: 400, statusMessage: '密码需为 8-256 个字符' })
  }
  if (username === undefined && password === undefined) {
    throw createError({ statusCode: 400, statusMessage: '没有需要保存的修改' })
  }

  const existing = db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, id)).get()
  if (!existing) throw createError({ statusCode: 404, statusMessage: '用户不存在' })
  if (existing.isDefault && username !== undefined && username !== existing.username) {
    throw createError({ statusCode: 400, statusMessage: '缺省管理员不能改名' })
  }

  if (username !== undefined) {
    const existing = db.select({ id: schema.adminUsers.id }).from(schema.adminUsers)
      .where(and(eq(schema.adminUsers.username, username), ne(schema.adminUsers.id, id)))
      .get()
    if (existing) throw createError({ statusCode: 409, statusMessage: '用户名已存在' })
  }

  const updated = db.update(schema.adminUsers).set({
    ...(username !== undefined ? { username } : {}),
    ...(password !== undefined ? { passwordHash: hashAdminPassword(password) } : {}),
    updatedAt: new Date(),
  }).where(eq(schema.adminUsers.id, id)).returning({
    id: schema.adminUsers.id,
    username: schema.adminUsers.username,
    isDefault: schema.adminUsers.isDefault,
    createdAt: schema.adminUsers.createdAt,
    updatedAt: schema.adminUsers.updatedAt,
  }).get()

  if (!updated) throw createError({ statusCode: 404, statusMessage: '用户不存在' })
  return { user: updated }
})
