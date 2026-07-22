import { verifyAdminCredentials, issueAdminSession, adminAuthConfigured } from '~~/server/utils/insights-admin-auth'

const attempts = new Map<string, { count: number; resetAt: number }>()

// 10 failed attempts per 10 minutes per IP
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 })
    return false
  }
  entry.count++
  return entry.count > 10
}

export default defineEventHandler(async (event) => {
  if (!adminAuthConfigured()) {
    throw createError({ statusCode: 503, statusMessage: '后台未配置密码（INSIGHTS_ADMIN_PASSWORD）' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (rateLimited(ip)) {
    throw createError({ statusCode: 429, statusMessage: '尝试次数过多，请稍后再试' })
  }

  const body = await readBody<{ username?: string; password?: string; remember?: boolean }>(event)
  if (!body?.username || !body?.password || !verifyAdminCredentials(body.username, body.password)) {
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误' })
  }

  issueAdminSession(event, body.remember !== false)
  return { ok: true }
})
