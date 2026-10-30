import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'
import type { H3Event } from 'h3'
import { asc, eq } from 'drizzle-orm'
import { db, sqlite, schema } from './db'

export const ADMIN_SESSION_COOKIE = 'insights_admin_session'
const SESSION_TTL_REMEMBER = 30 * 24 * 3600 // 30 days
const SESSION_TTL_SESSION = 12 * 3600 // browser-session cookie, 12h validity

type AdminUser = typeof schema.adminUsers.$inferSelect
type AdminSessionPayload = {
  id: string
  u: string
  exp: number
  n: string
}

let adminUsersReady = false
let fallbackSessionSecret: string | undefined

function ensureAdminUsers(): void {
  if (adminUsersReady) return

  // Keeps deployments working before `drizzle-kit migrate` is wired into the release flow.
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_default INTEGER DEFAULT false NOT NULL,
      created_at INTEGER DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
      updated_at INTEGER DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
    )
  `)
  const adminColumns = sqlite.prepare('PRAGMA table_info(admin_users)').all() as Array<{ name: string }>
  if (!adminColumns.some(column => column.name === 'is_default')) {
    sqlite.exec('ALTER TABLE admin_users ADD COLUMN is_default INTEGER DEFAULT false NOT NULL')
  }

  const config = useRuntimeConfig()
  const seedUser = (config.insightsAdminUser as string) || 'admin'
  const seedPassword = config.insightsAdminPassword as string
  if (!db.select({ id: schema.adminUsers.id }).from(schema.adminUsers).get() && seedPassword) {
    db.insert(schema.adminUsers).values({
      id: randomUUID(),
      username: seedUser,
      passwordHash: hashAdminPassword(seedPassword),
      isDefault: true,
    }).run()
  } else if (!db.select({ id: schema.adminUsers.id }).from(schema.adminUsers)
    .where(eq(schema.adminUsers.isDefault, true))
    .get()) {
    const oldest = db.select({ id: schema.adminUsers.id }).from(schema.adminUsers)
      .orderBy(asc(schema.adminUsers.createdAt))
      .get()
    if (oldest) {
      db.update(schema.adminUsers).set({ isDefault: true })
        .where(eq(schema.adminUsers.id, oldest.id))
        .run()
    }
  }

  adminUsersReady = true
}

export function adminAuthConfigured(): boolean {
  ensureAdminUsers()
  return db.select({ id: schema.adminUsers.id }).from(schema.adminUsers).get() !== undefined
}

export function verifyAdminCredentials(user: string, password: string): AdminUser | null {
  ensureAdminUsers()
  const adminUser = db.select().from(schema.adminUsers)
    .where(eq(schema.adminUsers.username, user))
    .get()
  if (!adminUser || !verifyAdminPassword(password, adminUser.passwordHash)) return null
  return adminUser
}

export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16).toString('base64url')
  const hash = scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 }).toString('base64url')
  return `scrypt$16384$8$1$${salt}$${hash}`
}

function verifyAdminPassword(password: string, stored: string): boolean {
  const [algorithm, n, r, p, salt, expected] = stored.split('$')
  if (algorithm !== 'scrypt' || !n || !r || !p || !salt || !expected) return false
  try {
    const actual = scryptSync(password, salt, 32, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    }).toString('base64url')
    return safeEqual(actual, expected)
  } catch {
    return false
  }
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function adminSessionSecret(passwordHash: string): string {
  const appSecret = process.env.BETTER_AUTH_SECRET
    || (useRuntimeConfig().insightsAdminPassword as string)
  if (appSecret) {
    return createHmac('sha256', appSecret).update(passwordHash).digest('base64')
  }

  // Local fallback: stable for this process, but sessions intentionally reset on restart.
  fallbackSessionSecret ||= randomBytes(32).toString('base64')
  return createHmac('sha256', fallbackSessionSecret).update(passwordHash).digest('base64')
}

export function issueAdminSession(event: H3Event, adminUser: AdminUser, remember: boolean): void {
  const maxAge = remember ? SESSION_TTL_REMEMBER : SESSION_TTL_SESSION
  const payload = JSON.stringify({
    id: adminUser.id,
    u: adminUser.username,
    exp: Math.floor(Date.now() / 1000) + maxAge,
    n: randomBytes(8).toString('base64url'),
  } satisfies AdminSessionPayload)
  const encodedPayload = Buffer.from(payload).toString('base64url')
  const token = encodedPayload + '.' + sign(encodedPayload, adminSessionSecret(adminUser.passwordHash))
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

export function getCurrentAdminUser(event: H3Event): AdminUser | null {
  return (event.context as { adminUser?: AdminUser }).adminUser ?? null
}

export function checkInsightsAdminAuth(event: H3Event): void {
  ensureAdminUsers()
  const token = getCookie(event, ADMIN_SESSION_COOKIE)
  if (token) {
    const adminUser = verifyAdminSessionToken(token)
    if (adminUser) {
      ;(event.context as { adminUser?: AdminUser }).adminUser = adminUser
      return
    }
  }

  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}

function verifyAdminSessionToken(token: string): AdminUser | null {
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null

  try {
    const encodedPayload = token.slice(0, dot)
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8')) as AdminSessionPayload
    if (typeof payload.exp !== 'number' || payload.exp <= Date.now() / 1000) return null

    const adminUser = payload.id
      ? db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, payload.id)).get()
      : db.select().from(schema.adminUsers).where(eq(schema.adminUsers.username, payload.u)).get()
    if (!adminUser) return null

    const expected = encodedPayload + '.' + sign(encodedPayload, adminSessionSecret(adminUser.passwordHash))
    if (!safeEqual(token, expected)) return null
    return adminUser
  } catch {
    return null
  }
}
