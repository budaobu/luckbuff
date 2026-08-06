import { auth } from '~~/server/utils/auth'
import type { H3Event } from 'h3'

// Reads the current Better Auth session from the request headers.
// Returns null when the request is unauthenticated.
export async function getAuthSession(event: H3Event) {
  const session = await auth.api.getSession({
    headers: toWebRequest(event).headers,
  })
  return session ?? null
}

// Throws 401 unless a session exists; returns the authenticated user id.
export async function requireAuthUser(event: H3Event) {
  const session = await getAuthSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session.user
}
