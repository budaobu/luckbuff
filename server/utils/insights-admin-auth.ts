import { timingSafeEqual, createHash } from 'node:crypto'

function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function checkInsightsAdminAuth(event: H3Event): void {
  const config = useRuntimeConfig()
  const user = config.insightsAdminUser as string
  const password = config.insightsAdminPassword as string

  if (!password) {
    throw createError({ statusCode: 503, statusMessage: '后台未配置密码（INSIGHTS_ADMIN_PASSWORD）' })
  }

  const header = getHeader(event, 'authorization') || ''
  const expectedUser = user || 'admin'
  let ok = false
  if (header.startsWith('Basic ')) {
    try {
      const decoded = Buffer.from(header.slice(6), 'base64').toString('utf-8')
      const idx = decoded.indexOf(':')
      if (idx > -1) {
        ok = safeEqual(decoded.slice(0, idx), expectedUser) && safeEqual(decoded.slice(idx + 1), password)
      }
    } catch {
      ok = false
    }
  }

  if (!ok) {
    setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="insights-admin", charset="UTF-8"')
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}
