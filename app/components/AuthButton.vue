<script setup lang="ts">
const {
  user,
  isLoggedIn,
  signInWithGoogle,
  signInWithTelegram,
  signOutUser,
  syncLocalProfiles,
  hydrateProfilesFromAccount,
  watchProfilesForSync,
} = useAuth()

const route = useRoute()
const callbackURL = computed(() => route.fullPath || '/')

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

// Silently merge locally-cached profiles into the account the first time a
// user signs in, then hydrate the local store. No nav text is shown for this.
const synced = ref(false)
watch(isLoggedIn, async (loggedIn) => {
  if (!loggedIn) return
  // Mirror every profile add/update/remove to the account while signed in.
  // Independent of the one-time merge below so a failed/retried merge never
  // leaves live-sync unwired.
  watchProfilesForSync()
  if (synced.value) return
  const res = await syncLocalProfiles()
  if (res.ok) {
    synced.value = true
    await hydrateProfilesFromAccount()
  }
}, { immediate: true })

function onClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) menuOpen.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

const userInitial = computed(() => {
  const n = user.value?.name || user.value?.email || ''
  return n ? n.trim().charAt(0).toUpperCase() : ''
})

function login(provider: 'google' | 'telegram') {
  menuOpen.value = false
  if (provider === 'google') signInWithGoogle(callbackURL.value)
  else signInWithTelegram(callbackURL.value)
}
</script>

<template>
  <div ref="menuRef" class="relative">
    <!-- Logged out: single sign-in button with provider dropdown -->
    <button
      v-if="!isLoggedIn"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 border hover:!text-[var(--text-primary)] hover:!bg-[var(--surface-card-hover)]"
      style="color: var(--text-faint); border-color: var(--border-light);"
      @click.stop="menuOpen = !menuOpen"
    >
      <UIcon name="i-heroicons-user-circle" class="w-3.5 h-3.5" />
      <span>{{ $t('auth.signIn') }}</span>
      <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 transition-transform" :class="{ 'rotate-180': menuOpen }" />
    </button>

    <!-- Logged in: avatar chip only -->
    <button
      v-else
      class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-200 border hover:!border-[var(--accent-border-hover)]"
      style="color: var(--accent); background-color: var(--accent-bg); border-color: var(--accent-border);"
      :title="user?.name || user?.email || ''"
      @click.stop="menuOpen = !menuOpen"
    >
      <img v-if="user?.image" :src="user.image" :alt="user?.name || ''" class="w-full h-full rounded-full object-cover" />
      <span v-else>{{ userInitial }}</span>
    </button>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-95"
    >
      <div
        v-if="menuOpen"
        class="absolute right-0 mt-2 w-44 rounded-xl shadow-2xl overflow-hidden z-50 border"
        style="background-color: var(--surface-dropdown); border-color: var(--border-medium);"
      >
        <template v-if="!isLoggedIn">
          <button
            class="w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2.5 hover:!bg-[var(--surface-card-hover)]"
            style="color: var(--text-faint);"
            @click="login('google')"
          >
            <UIcon name="i-simple-icons-google" class="w-4 h-4" />
            {{ $t('auth.signInWithGoogle') }}
          </button>
          <button
            class="w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2.5 hover:!bg-[var(--surface-card-hover)]"
            style="color: var(--text-faint);"
            @click="login('telegram')"
          >
            <UIcon name="i-simple-icons-telegram" class="w-4 h-4" />
            {{ $t('auth.signInWithTelegram') }}
          </button>
        </template>
        <template v-else>
          <NuxtLink
            to="/settings"
            class="w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2.5 hover:!bg-[var(--surface-card-hover)]"
            style="color: var(--text-faint);"
            @click="menuOpen = false"
          >
            <UIcon name="i-heroicons-folder-open" class="w-4 h-4" />
            {{ $t('nav.profiles') }}
          </NuxtLink>
          <button
            class="w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2.5 hover:!bg-[var(--surface-card-hover)]"
            style="color: var(--text-faint);"
            @click="menuOpen = false; signOutUser()"
          >
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
            {{ $t('auth.signOut') }}
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>
