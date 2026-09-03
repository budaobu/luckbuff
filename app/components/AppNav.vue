<template>
  <nav
    class="w-full sticky top-0 isolate z-50 border-b backdrop-blur-2xl transition-colors duration-300"
    style="border-color: var(--border-subtle); background-color: color-mix(in srgb, var(--surface-bg) 78%, transparent); box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset;"
  >
    <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:h-[72px]">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <img
          src="/logo-2026-08.webp"
          alt="ososn"
          class="w-9 h-9 rounded-xl transition-transform duration-200"
          style="border: 1px solid var(--accent-border); box-shadow: 0 10px 24px -18px var(--accent-shadow-hover);"
        />
        <span class="text-[17px] font-semibold tracking-tight" translate="no" style="color: var(--accent);">ososn</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-1">
        <template v-for="item in navItems" :key="item.id">
          <!-- Dropdown: 推演工具 -->
          <div
            v-if="item.dropdown"
            ref="toolsMenuRef"
            class="relative"
            @mouseenter="toolsOpen = true"
            @mouseleave="toolsOpen = false"
          >
            <NuxtLink
              :to="localePath('/tools')"
              :no-prefetch="true"
              class="px-4 py-2 rounded-lg text-sm transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer"
              :class="isToolsActive
                ? 'font-medium'
                : 'hover:!text-[var(--text-primary)] hover:!bg-[var(--surface-card-hover)]'"
              :style="isToolsActive
                ? { color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }
                : { color: 'var(--text-faint)' }"
            >
              {{ item.label }}
              <UIcon name="i-heroicons-chevron-down" class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': toolsOpen }" />
            </NuxtLink>
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 -translate-y-1 scale-95"
            >
              <div
                v-show="toolsOpen"
                class="absolute right-0 mt-2 w-[880px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden z-50 border p-4 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-4"
                style="background-color: var(--surface-dropdown); border-color: var(--border-medium); box-shadow: var(--shadow-panel);"
              >
                <div
                  v-for="toolGroup in toolGroups"
                  :key="toolGroup.id"
                  class="min-w-0"
                  :class="toolGroup.id === 'charting'
                    ? 'md:border-r md:border-[var(--border-light)] md:pr-4'
                    : ''"
                >
                  <p class="px-1 pb-3 text-[11px] font-semibold uppercase tracking-[0.12em]" style="color: var(--text-placeholder);">
                    {{ t(toolGroup.titleKey) }}
                  </p>
                  <div :class="toolGroup.id === 'fortune-analysis' ? 'grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2' : 'grid'">
                    <NuxtLink
                      v-for="cat in toolGroup.categories"
                      :key="cat.id"
                      :to="localePath(cat.sectionPath)"
                      :no-prefetch="true"
                      class="group flex items-start gap-3 text-sm transition-all duration-200"
                      :class="toolGroup.id === 'charting'
                        ? 'h-full flex-col justify-between rounded-2xl border border-[var(--accent-border)] bg-gradient-to-br from-[var(--accent-bg)] to-[var(--surface-card)] p-5 hover:border-[var(--accent-border-hover)] hover:shadow-lg'
                        : 'h-10 flex-row items-center rounded-xl px-2.5'"
                      :style="toolGroup.id === 'charting'
                        ? { color: 'var(--text-primary)' }
                        : route.path === localePath(cat.sectionPath)
                        ? { color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }
                        : { color: 'var(--text-faint)' }"
                      @click="toolsOpen = false"
                    >
                      <span
                        :class="toolGroup.id === 'charting'
                          ? 'mb-5 h-11 w-11 rounded-xl'
                          : 'h-7 w-7 rounded-lg'"
                        class="flex items-center justify-center shrink-0 transition-colors"
                        :style="toolGroup.id === 'charting'
                          ? { backgroundColor: 'var(--surface-card)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                          : route.path === localePath(cat.sectionPath)
                          ? { backgroundColor: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                          : { backgroundColor: 'var(--surface-input)', color: 'var(--text-faint)', border: '1px solid var(--border-light)' }"
                      >
                        <UIcon :name="cat.icon || 'i-heroicons-rectangle-group'" class="w-4 h-4" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block font-medium leading-snug">{{ t(cat.titleKey) }}</span>
                        <span
                          v-if="toolGroup.id === 'charting'"
                          class="mt-2 block text-xs leading-relaxed"
                          style="color: var(--text-placeholder);"
                        >{{ t(cat.subtitleKey) }}</span>
                      </span>
                      <span
                        v-if="toolGroup.id === 'charting'"
                        class="mt-6 flex w-full items-center justify-between rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3 py-2.5"
                      >
                        <span class="truncate text-[13px] font-medium">{{ t(cat.tools[0]!.titleKey) }}</span>
                        <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 shrink-0 text-[var(--accent)] transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                      <span
                        v-if="toolGroup.id === 'fortune-analysis'"
                        class="shrink-0 text-[11px] tabular-nums"
                        style="color: var(--text-placeholder);"
                      >
                        {{ cat.tools.length }}
                      </span>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Regular Link -->
          <NuxtLink
            v-else
            :to="localePath(item.to)"
            :no-prefetch="true"
            class="px-3.5 py-2 rounded-full text-sm transition-all duration-200 inline-flex items-center gap-1.5"
            style="color: var(--text-faint);"
            :class="route.path === localePath(item.to)
              ? 'font-medium'
              : 'hover:!text-[var(--text-primary)] hover:!bg-[var(--surface-card-hover)]'"
            :style="route.path === localePath(item.to)
              ? { color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }
              : {}"
          >
            {{ item.label }}
            <span
              v-if="item.badge"
              class="text-[10px] px-1.5 py-0.5 rounded font-medium leading-none"
              :style="{ backgroundColor: 'var(--accent)', color: '#fff' }"
            >{{ item.badge }}</span>
          </NuxtLink>
        </template>

        <!-- Theme Toggle -->
        <ThemeToggle class="ml-1" />

        <!-- Language Switcher -->
        <div ref="langSwitcherRef" class="relative ml-2">
          <button
            class="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-all duration-200 border"
            style="color: var(--text-faint); border-color: var(--border-light);"
            :class="{ 'hover:!text-[var(--text-primary)] hover:!bg-[var(--surface-card-hover)]': true }"
            :aria-label="t('nav.language', { lang: currentLangLabel })"
            @click="langOpen = !langOpen"
          >
            <UIcon name="i-heroicons-language" class="w-3.5 h-3.5" />
            <span>{{ currentLangShort }}</span>
            <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 transition-transform" :class="{ 'rotate-180': langOpen }" />
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
              v-if="langOpen"
              class="absolute right-0 mt-2 w-32 rounded-xl shadow-2xl overflow-hidden z-50 border"
              style="background-color: var(--surface-dropdown); border-color: var(--border-medium);"
            >
              <button
                v-for="lang in languages"
                :key="lang.code"
                class="w-full px-4 py-2.5 text-left text-sm transition-colors"
                :class="locale === lang.code
                  ? 'font-medium'
                  : 'hover:!bg-[var(--surface-card-hover)]'"
                :style="locale === lang.code
                  ? { color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }
                  : { color: 'var(--text-faint)' }"
                @click="switchLang(lang.code)"
              >
                {{ lang.name }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Auth (Google / Telegram sign-in) -->
        <AuthButton class="ml-2" />
      </div>

      <!-- Mobile Menu Button -->
      <UButton
        class="md:hidden"
        color="neutral"
        variant="ghost"
        size="sm"
        :icon="mobileOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
        :aria-label="mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')"
        @click="() => { mobileOpen = !mobileOpen }"
      />
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileOpen"
        class="md:hidden border-t px-4 pb-6 pt-4 space-y-1 backdrop-blur-2xl"
        style="border-color: var(--border-subtle); background-color: color-mix(in srgb, var(--surface-bg) 90%, transparent);"
      >
        <template v-for="item in navItems" :key="item.id">
          <!-- Dropdown: 推演工具 -->
          <div v-if="item.dropdown">
            <button
              class="flex items-center justify-between w-full px-3 py-3 rounded-xl text-sm transition-all"
              :class="isToolsActive ? 'font-medium' : ''"
              :style="isToolsActive
                ? { color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }
                : { color: 'var(--text-faint)' }"
              @click="mobileToolsOpen = !mobileToolsOpen"
            >
              <span class="flex items-center gap-2">
                {{ item.label }}
              </span>
              <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 transition-transform" :class="{ 'rotate-180': mobileToolsOpen }" />
            </button>
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div v-show="mobileToolsOpen" class="pl-4 mt-1 space-y-3">
                <div v-for="toolGroup in toolGroups" :key="toolGroup.id">
                  <p class="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em]" style="color: var(--text-placeholder);">
                    {{ t(toolGroup.titleKey) }}
                  </p>
                  <NuxtLink
                    v-for="cat in toolGroup.categories"
                    :key="cat.id"
                    :to="localePath(cat.sectionPath)"
                    :no-prefetch="true"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                    :class="route.path === localePath(cat.sectionPath)
                      ? 'font-medium'
                      : 'hover:!bg-[var(--surface-card-hover)]'"
                    :style="route.path === localePath(cat.sectionPath)
                      ? { color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }
                      : { color: 'var(--text-faint)' }"
                    @click="mobileOpen = false; mobileToolsOpen = false"
                  >
                    <span
                      class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      :style="route.path === localePath(cat.sectionPath)
                        ? { backgroundColor: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                        : { backgroundColor: 'var(--surface-input)', color: 'var(--text-faint)', border: '1px solid var(--border-light)' }"
                    >
                      <UIcon :name="cat.icon || 'i-heroicons-rectangle-group'" class="w-4 h-4" />
                    </span>
                    <span class="truncate">{{ t(cat.titleKey) }}</span>
                  </NuxtLink>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Regular Link -->
          <NuxtLink
            v-else
            :to="localePath(item.to)"
            :no-prefetch="true"
            class="flex items-center gap-2 px-3 py-3 rounded-xl text-sm transition-all"
            :class="route.path === localePath(item.to)
              ? 'font-medium'
              : 'hover:!text-[var(--text-primary)] hover:!bg-[var(--surface-card-hover)]'"
            :style="route.path === localePath(item.to)
              ? { color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }
              : { color: 'var(--text-faint)' }"
            @click="mobileOpen = false"
          >
            {{ item.label }}
            <span
              v-if="item.badge"
              class="text-[10px] px-1.5 py-0.5 rounded font-medium leading-none"
              :style="{ backgroundColor: 'var(--accent)', color: '#fff' }"
            >{{ item.badge }}</span>
          </NuxtLink>
        </template>

        <!-- Theme Toggle (Mobile) -->
        <div class="px-3 py-2">
          <ThemeToggle />
        </div>

        <!-- Auth (Mobile) -->
        <div class="border-t pt-2 mt-2" style="border-color: var(--border-subtle);">
          <p class="px-4 py-2 text-xs" style="color: var(--text-placeholder);">{{ isLoggedIn ? (user?.name || user?.email) : t('auth.signIn') }}</p>
          <template v-if="!isLoggedIn">
            <button
              class="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-left transition-colors hover:!bg-[var(--surface-card-hover)]"
              style="color: var(--text-faint);"
              @click="mobileOpen = false; signInWithGoogle(route.fullPath || '/')"
            >
              <UIcon name="i-simple-icons-google" class="w-4 h-4" />
              {{ t('auth.signInWithGoogle') }}
            </button>
            <button
              class="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-left transition-colors hover:!bg-[var(--surface-card-hover)]"
              style="color: var(--text-faint);"
              @click="mobileOpen = false; signInWithTelegram(route.fullPath || '/')"
            >
              <UIcon name="i-simple-icons-telegram" class="w-4 h-4" />
              {{ t('auth.signInWithTelegram') }}
            </button>
          </template>
          <template v-else>
            <NuxtLink
              :to="localePath('/settings')"
              :no-prefetch="true"
              class="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-left transition-colors hover:!bg-[var(--surface-card-hover)]"
              style="color: var(--text-faint);"
              @click="mobileOpen = false"
            >
              <UIcon name="i-heroicons-folder-open" class="w-4 h-4" />
              {{ t('nav.profiles') }}
            </NuxtLink>
            <button
              class="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-left transition-colors hover:!bg-[var(--surface-card-hover)]"
              style="color: var(--text-faint);"
              @click="mobileOpen = false; signOutUser()"
            >
              <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
              {{ t('auth.signOut') }}
            </button>
          </template>
        </div>

        <div class="border-t pt-2 mt-2" style="border-color: var(--border-subtle);">
          <p class="px-4 py-2 text-xs" style="color: var(--text-placeholder);">{{ $t('nav.languageLabel') }}</p>
          <button
            v-for="lang in languages"
            :key="lang.code"
            class="block w-full px-4 py-2.5 rounded-xl text-sm text-left transition-colors"
            :class="locale === lang.code
              ? 'font-medium'
              : 'hover:!bg-[var(--surface-card-hover)]'"
            :style="locale === lang.code
              ? { color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }
              : { color: 'var(--text-faint)' }"
            @click="switchLang(lang.code); mobileOpen = false"
          >
            {{ lang.name }}
          </button>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const mobileOpen = ref(false)
const langOpen = ref(false)
const { user, isLoggedIn, signInWithGoogle, signInWithTelegram, signOutUser } = useAuth()
const toolsOpen = ref(false)
const mobileToolsOpen = ref(false)

const categories = useToolCategories()
const toolGroups = useToolGroups()

const isToolsActive = computed(() => {
  const toolPaths = categories.value.map(c => localePath(c.sectionPath))
  toolPaths.push(localePath('/tools'))
  return toolPaths.some(p => route.path === p)
})

interface NavItem {
  label: string
  to: string
  id: string
  dropdown?: boolean
  badge?: string
}

const navItems = computed<NavItem[]>(() => [
  { label: t('nav.home'), to: '/', id: 'nav-home' },
  { label: t('nav.toolsShort'), to: '/tools', dropdown: true, id: 'nav-tools-dropdown' },
  { label: t('nav.insights'), to: '/insights', id: 'nav-insights' },
])

const languages: { code: 'zh-CN' | 'zh-TW' | 'en'; name: string }[] = [
  { code: 'zh-CN', name: t('language.zhCN') },
  { code: 'zh-TW', name: t('language.zhTW') },
  { code: 'en', name: t('language.en') },
]

const currentLangLabel = computed(() => {
  return languages.find(l => l.code === locale.value)?.name || t('language.zhCN')
})

const langShortMap: Record<string, string> = {
  'zh-CN': t('languageShort.zhCN'),
  'zh-TW': t('languageShort.zhTW'),
  'en': t('languageShort.en'),
}
const currentLangShort = computed(() => langShortMap[locale.value] || '简')

function switchLang(code: 'zh-CN' | 'zh-TW' | 'en') {
  const newPath = switchLocalePath(code)
  langOpen.value = false
  if (newPath) {
    router.push(newPath)
  }
}

// 点击外部关闭语言下拉
const langSwitcherRef = ref<HTMLElement | null>(null)

// 点击外部关闭工具下拉
const toolsMenuRef = ref<HTMLElement | null>(null)

function handleDocClick(e: MouseEvent) {
  if (langSwitcherRef.value && !langSwitcherRef.value.contains(e.target as Node)) {
    langOpen.value = false
  }
  const toolsEl = Array.isArray(toolsMenuRef.value) ? toolsMenuRef.value[0] : toolsMenuRef.value
  if (toolsEl && !toolsEl.contains(e.target as Node)) {
    toolsOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocClick)
})
</script>
