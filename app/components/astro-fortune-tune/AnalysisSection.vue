<script setup lang="ts">
import { marked } from 'marked'

interface Props {
  title: string
  html: string
  open: boolean
}
defineProps<Props>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] overflow-hidden">
    <button
      type="button"
      class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--surface-card-hover)] transition-colors"
      @click="$emit('toggle')"
    >
      <span class="text-sm font-semibold text-[var(--text-primary)]">{{ title }}</span>
      <UIcon
        name="i-heroicons-chevron-down"
        class="w-4 h-4 text-[var(--text-faint)] transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>
    <div
      v-show="open"
      class="px-4 pb-4 text-[13px] leading-relaxed text-[var(--text-body)]/75 vedic-markdown border-t border-[var(--border-light)] pt-3"
      v-html="html"
    />
  </div>
</template>

<style scoped>
.vedic-markdown :deep(h1),
.vedic-markdown :deep(h2),
.vedic-markdown :deep(h3) {
  color: var(--text-primary);
  font-weight: 600;
  margin: 0.8em 0 0.3em;
  font-size: 0.95em;
}
.vedic-markdown :deep(p) {
  margin: 0.4em 0;
}
.vedic-markdown :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.vedic-markdown :deep(ul) {
  list-style: disc;
  padding-left: 1.2em;
  margin: 0.4em 0;
}
.vedic-markdown :deep(li) {
  margin: 0.2em 0;
}
</style>
