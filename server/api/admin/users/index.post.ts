import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db, schema } from '~~/server/utils/db'
import { checkInsightsAdminAuth, hashAdminPassword } from '~~/server/utils/insights-admin-auth'

function validateCredentials(username: unknown, password: unknown) {
  const name = typeof username === 'string' ? username.trim() : ''
  const secret = typeof password === 'string' ? password : ''
  if (name.length < 2 || name.length > 64) {
    throw createError({ statusCode: 400, statusMessage: '用户名需为 2-64 个字符' })
  }
  if (secret.length < 8 || secret.length > 256) {
    throw createError({ statusCode: 400, statusMessage: '密码需为 8-256 个字符' })
  }
  return { name, secret }
}

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)
  const body = await readBody<{ username?: unknown; password?: unknown }>(event)
  const { name, secret } = validateCredentials(body?.username, body?.password)

  const existing = db.select({ id: schema.adminUsers.id }).from(schema.adminUsers)
    .where(eq(schema.adminUsers.username, name))
    .get()
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: '用户名已存在' })
  }

  const user = db.insert(schema.adminUsers).values({
    id: randomUUID(),
    username: name,
    passwordHash: hashAdminPassword(secret),
  }).returning({
    id: schema.adminUsers.id,
    username: schema.adminUsers.username,
    createdAt: schema.adminUsers.createdAt,
    updatedAt: schema.adminUsers.updatedAt,
  }).get()

  return { user }
})
