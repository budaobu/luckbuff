<template>
  <nav
    class="w-full sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300"
    style="border-color: var(--border-subtle); background-color: color-mix(in srgb, var(--surface-bg) 70%, transparent);"
  >
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:!bg-[var(--accent-bg-hover)] group-hover:!border-[var(--accent-border-hover)]"
          style="background-color: var(--accent-bg); border: 1px solid var(--accent-border);"
        >
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4 transition-transform duration-300 group-hover:scale-110" style="color: var(--accent);" />
        </div>
        <span class="text-lg font-bold tracking-tight" style="color: var(--accent);">ososn</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="localePath(item.to)"
          :no-prefetch="true"
          class="px-4 py-2 rounded-lg text-sm transition-all duration-200"
          style="color: var(--text-faint);"
          :class="route.path === localePath(item.to)
            ? 'font-medium'
            : 'hover:!text-[var(--text-primary)] hover:!bg-[var(--surface-card-hover)]'"
          :style="route.path === localePath(item.to)
            ? { color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }
            : {}"
        >
          {{ item.label }}
        </NuxtLink>

        <!-- Theme Toggle -->
        <ThemeToggle class="ml-1" />

        <!-- Language Switcher -->
        <div ref="langSwitcherRef" class="relative ml-2">
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 border"
            style="color: var(--text-faint); border-color: var(--border-light);"
            :class="{ 'hover:!text-[var(--text-primary)] hover:!bg-[var(--surface-card-hover)]': true }"
            :aria-label="t('nav.language', { lang: currentLangLabel })"
            @click="langOpen = !langOpen"
          >
            <UIcon name="i-heroicons-language" class="w-3.5 h-3.5" />
            <span>{{ currentLangLabel }}</span>
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
      </div>

      <!-- Mobile Menu Button -->
      <UButton
        class="md:hidden"
        color="neutral"
        variant="ghost"
        size="sm"
        :icon="mobileOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
        :aria-label="mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')"
        @click="mobileOpen = !mobileOpen"
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
        class="md:hidden border-t px-6 py-4 space-y-1 backdrop-blur-xl"
        style="border-color: var(--border-subtle); background-color: color-mix(in srgb, var(--surface-bg) 90%, transparent);"
      >
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="localePath(item.to)"
          :no-prefetch="true"
          class="block px-4 py-3 rounded-xl text-sm transition-all"
          :class="route.path === localePath(item.to)
            ? 'font-medium'
            : 'hover:!text-[var(--text-primary)] hover:!bg-[var(--surface-card-hover)]'"
          :style="route.path === localePath(item.to)
            ? { color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }
            : { color: 'var(--text-faint)' }"
          @click="mobileOpen = false"
        >
          {{ item.label }}
        </NuxtLink>

        <!-- Theme Toggle (Mobile) -->
        <div class="px-4 py-2">
          <ThemeToggle />
        </div>

        <div class="border-t pt-2 mt-2" style="border-color: var(--border-subtle);">
          <p class="px-4 py-2 text-xs" style="color: var(--text-placeholder);">{{ $t('language.zhCN') === '简体中文' ? '语言' : 'Language' }}</p>
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

const navItems = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.tools'), to: '/tools' },
  { label: t('nav.prophet'), to: '/prophet' },
  { label: t('nav.profiles'), to: '/settings' },
])

const languages = [
  { code: 'zh-CN', name: t('language.zhCN') },
  { code: 'zh-TW', name: t('language.zhTW') },
  { code: 'en', name: t('language.en') },
]

const currentLangLabel = computed(() => {
  return languages.find(l => l.code === locale.value)?.name || t('language.zhCN')
})

function switchLang(code: string) {
  const newPath = switchLocalePath(code)
  langOpen.value = false
  if (newPath) {
    router.push(newPath)
  }
}

// 点击外部关闭语言下拉
const langSwitcherRef = ref<HTMLElement | null>(null)

function handleDocClick(e: MouseEvent) {
  if (langSwitcherRef.value && !langSwitcherRef.value.contains(e.target as Node)) {
    langOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocClick)
})
</script>
