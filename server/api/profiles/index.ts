import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { userProfiles } from '~~/server/utils/schema'
import { requireAuthUser } from '~~/server/utils/auth-session'
import type { UserProfile } from '~/types/user'

interface MergeBody {
  // Profiles currently held in browser storage, sent on first login.
  localProfiles?: UserProfile[]
}

function normalizeProfiles(input: unknown): UserProfile[] {
  if (!Array.isArray(input)) return []
  return input.filter(
    (p): p is UserProfile =>
      !!p && typeof p === 'object' && typeof (p as UserProfile).label === 'string',
  )
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  })

  if (event.method === 'GET') {
    return {
      profiles: (existing?.profiles as UserProfile[] | undefined) ?? [],
      merged: !!existing?.mergedAt,
    }
  }

  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  const body = ((await readBody<MergeBody>(event).catch(() => ({}))) ?? {}) as MergeBody
  const incoming = normalizeProfiles(body.localProfiles)

  const now = new Date()
  const stored = normalizeProfiles(existing?.profiles)

  // Merge by profile id; incoming local entries win on conflict, new ones append.
  const byId = new Map<string, UserProfile>()
  for (const p of stored) if (p.id) byId.set(p.id, p)
  for (const p of incoming) {
    const id = p.id || crypto.randomUUID()
    byId.set(id, { ...p, id })
  }
  let merged = [...byId.values()]
  if (merged.length > 0 && !merged.some(p => p.isDefault)) {
    merged = merged.map((p, i) => ({ ...p, isDefault: i === 0 }))
  }

  if (existing) {
    await db
      .update(userProfiles)
      .set({ profiles: merged, mergedAt: existing.mergedAt ?? now, updatedAt: now })
      .where(eq(userProfiles.userId, user.id))
  } else {
    await db.insert(userProfiles).values({
      id: crypto.randomUUID(),
      userId: user.id,
      profiles: merged,
      mergedAt: now,
    })
  }

  return { ok: true, count: merged.length, merged: true }
})
