import { timingSafeEqual, createHash, createHmac, randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'

export const ADMIN_SESSION_COOKIE = 'insights_admin_session'
const SESSION_TTL_REMEMBER = 30 * 24 * 3600 // 30 days
const SESSION_TTL_SESSION = 12 * 3600 // browser-session cookie, 12h validity

function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

function getSecret(): string {
  const config = useRuntimeConfig()
  return (config.insightsAdminPassword as string) || ''
}

export function adminAuthConfigured(): boolean {
  return Boolean(getSecret())
}

export function verifyAdminCredentials(user: string, password: string): boolean {
  const config = useRuntimeConfig()
  const expectedUser = (config.insightsAdminUser as string) || 'admin'
  const expectedPassword = getSecret()
  if (!expectedPassword) return false
  return safeEqual(user, expectedUser) && safeEqual(password, expectedPassword)
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

export function issueAdminSession(event: H3Event, remember: boolean): void {
  const maxAge = remember ? SESSION_TTL_REMEMBER : SESSION_TTL_SESSION
  const payload = JSON.stringify({
    u: ((useRuntimeConfig().insightsAdminUser as string) || 'admin'),
    exp: Math.floor(Date.now() / 1000) + maxAge,
    n: randomBytes(8).toString('base64url'),
  })
  const token = Buffer.from(payload).toString('base64url') + '.' + sign(payload)
  setCookie(event, ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(remember ? { maxAge } : {}),
  })
}

export function clearAdminSession(event: H3Event): void {
  deleteCookie(event, ADMIN_SESSION_COOKIE, { path: '/' })
}

export function checkInsightsAdminAuth(event: H3Event): void {
  if (!adminAuthConfigured()) {
    throw createError({ statusCode: 503, statusMessage: '后台未配置密码（INSIGHTS_ADMIN_PASSWORD）' })
  }

  const token = getCookie(event, ADMIN_SESSION_COOKIE)
  if (token) {
    const dot = token.lastIndexOf('.')
    if (dot > 0) {
      try {
        const payload = Buffer.from(token.slice(0, dot), 'base64url').toString('utf-8')
        const expected = token.slice(0, dot) + '.' + sign(payload)
        if (safeEqual(token, expected)) {
          const data = JSON.parse(payload)
          if (typeof data.exp === 'number' && data.exp > Date.now() / 1000) return
        }
      } catch {
        // fall through to 401
      }
    }
  }

  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}
