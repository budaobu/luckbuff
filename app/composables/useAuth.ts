import { authClient } from '~/lib/auth-client'
import { useProfilesStore } from '~/stores/profiles'
import type { UserProfile } from '~/types/user'

// Debounce timer + unsubscribe handle for the live profile sync. Module-level
// singletons so repeated useAuth() calls / component mounts don't stack up
// multiple subscriptions.
let syncTimer: ReturnType<typeof setTimeout> | null = null
let unsubscribeProfileSync: (() => void) | null = null
let isHydrating = false

// Wraps the Better Auth client and merges any locally-cached profiles into the
// account the first time a user signs in (replaces the browser-cache-only flow).
export function useAuth() {
  const session = authClient.useSession()
  const profilesStore = useProfilesStore()

  const user = computed(() => session.value?.data?.user ?? null)
  const isLoggedIn = computed(() => !!user.value)

  async function signInWithGoogle(callbackURL = '/') {
    await authClient.signIn.social({ provider: 'google', callbackURL })
  }

  async function signInWithTelegram(callbackURL = '/') {
    await authClient.signIn.oauth2({ providerId: 'telegram', callbackURL })
  }

  async function signOutUser() {
    await authClient.signOut()
  }

  // Sends the localStorage-backed profiles to the server to be merged into the
  // account's user_profiles row. Idempotent: the server merges by profile id.
  async function syncLocalProfiles(): Promise<{ ok: boolean; count?: number }> {
    if (!isLoggedIn.value) return { ok: false }
    try {
      const local = (profilesStore.list ?? []) as UserProfile[]
      const res = await $fetch<{ ok: boolean; count: number }>('/api/profiles', {
        method: 'POST',
        body: { localProfiles: local },
      })
      return { ok: res.ok, count: res.count }
    } catch {
      return { ok: false }
    }
  }

  // Pull the merged profiles back into the local store so the rest of the app
  // (which reads from the persisted Pinia store) sees the account data.
  async function hydrateProfilesFromAccount(): Promise<void> {
    if (!isLoggedIn.value) return
    try {
      const res = await $fetch<{ profiles: UserProfile[] }>('/api/profiles')
      if (Array.isArray(res.profiles)) {
        // Guard so the hydration assignment doesn't retrigger a sync-back.
        isHydrating = true
        profilesStore.list = res.profiles
        isHydrating = false
      }
    } catch {
      isHydrating = false
      // keep local cache on failure
    }
  }

  // Push the current local list to the account. Fire-and-forget; failures are
  // swallowed so a flaky connection never blocks profile edits.
  async function pushProfilesToAccount(): Promise<void> {
    if (!isLoggedIn.value) return
    try {
      await $fetch('/api/profiles', {
        method: 'POST',
        body: { localProfiles: (profilesStore.list ?? []) as UserProfile[] },
      })
    } catch {
      // keep local cache on failure
    }
  }

  // Live sync: while signed in, any add/update/remove on the profiles store is
  // debounced and written back to user_profiles. Only action mutations trigger
  // this — the hydration assignment above sets `list` directly and is also
  // guarded by `isHydrating`, so it never loops back.
  function watchProfilesForSync(): void {
    if (unsubscribeProfileSync) return
    unsubscribeProfileSync = profilesStore.$subscribe((_mutation, state) => {
      if (!isLoggedIn.value || isHydrating) return
      if (syncTimer) clearTimeout(syncTimer)
      syncTimer = setTimeout(() => {
        void state // list already read inside pushProfilesToAccount
        pushProfilesToAccount()
      }, 800)
    })
  }

  return {
    session,
    user,
    isLoggedIn,
    signInWithGoogle,
    signInWithTelegram,
    signOutUser,
    syncLocalProfiles,
    hydrateProfilesFromAccount,
    watchProfilesForSync,
  }
}
