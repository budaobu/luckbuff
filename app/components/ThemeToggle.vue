<template>
  <button
    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 border"
    :class="buttonClasses"
    :title="tooltip"
    :aria-label="tooltip"
    @click="toggleTheme"
  >
    <UIcon
      :name="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
      class="w-3.5 h-3.5 transition-transform duration-300"
      :class="{ 'rotate-12': !isDark }"
    />
    <span class="hidden sm:inline">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()

const isDark = computed(() => colorMode.value === 'dark')

const buttonClasses = computed(() => {
  const base = 'border-[var(--border-light)] hover:border-[var(--accent-border)]'
  const text = isDark.value
    ? 'text-[var(--text-faint)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)]'
    : 'text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)]'
  return `${base} ${text}`
})

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
</script>
