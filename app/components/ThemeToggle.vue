<template>
  <button
    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 border"
    :class="buttonClasses"
    :title="mounted ? tooltip : ''"
    :aria-label="mounted ? tooltip : ''"
    @click="toggleTheme"
  >
    <UIcon
      v-if="mounted"
      :name="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
      class="w-3.5 h-3.5 transition-transform duration-300"
      :class="{ 'rotate-12': !isDark }"
    />
    <span v-if="mounted" class="hidden sm:inline">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()

// preference 存于 localStorage，SSR 阶段无法得知；挂载前保持中性渲染避免 hydration 不一致
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const isDark = computed(() => mounted.value && colorMode.value === 'dark')

const tooltip = computed(() => {
  if (colorMode.preference === 'system') {
    return t('theme.systemTooltip', { mode: isDark.value ? t('theme.dark') : t('theme.light') })
  }
  return t('theme.toggleTooltip')
})

const label = computed(() => {
  if (colorMode.preference === 'system') return t('theme.auto')
  return isDark.value ? t('theme.dark') : t('theme.light')
})

function toggleTheme() {
  const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
  const currentIndex = modes.indexOf(colorMode.preference as 'light' | 'dark' | 'system')
  const nextIndex = (currentIndex + 1) % modes.length
  colorMode.preference = modes[nextIndex]!
}

const buttonClasses = computed(() => {
  if (!mounted.value) {
    return 'border-[var(--border-light)] text-[var(--text-muted)]'
  }
  return `border-[var(--border-light)] hover:border-[var(--accent-border)] ${isDark.value ? 'text-[var(--text-faint)]' : 'text-[var(--text-muted)]'} hover:text-[var(--accent)] hover:bg-[var(--accent-bg)]`
})
</script>
