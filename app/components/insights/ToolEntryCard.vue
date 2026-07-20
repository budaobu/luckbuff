<template>
  <NuxtLink
    :to="localePath(tool.path)"
    class="group flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 transition-all duration-300 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-0.5"
  >
    <div class="shrink-0 w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
      <UIcon :name="tool.icon" class="w-6 h-6" />
    </div>
    <div class="min-w-0 flex-1">
      <div class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ t(tool.titleKey) }}</div>
      <div class="text-xs text-[var(--text-faint)] leading-relaxed line-clamp-2">{{ t(tool.descKey) }}</div>
    </div>
    <span class="shrink-0 text-xs text-[var(--accent-muted)] inline-flex items-center gap-1 transition-transform duration-300 group-hover:translate-x-0.5">
      {{ t(tool.ctaKey) }}
      <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5" />
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
export interface InsightToolCard {
  path: string
  icon: string
  titleKey: string
  descKey: string
  ctaKey: string
}

defineProps<{ tool: InsightToolCard }>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
