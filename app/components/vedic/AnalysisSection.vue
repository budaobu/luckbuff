<script setup lang="ts">
interface Props {
  title: string
  html: string
  open: boolean
}
defineProps<Props>()
const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] overflow-hidden transition-colors hover:border-[var(--border-medium)]">
    <button
      type="button"
      class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      @click="emit('toggle')"
    >
      <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ title }}</h3>
      <UIcon
        name="i-heroicons-chevron-down"
        class="w-4 h-4 text-[var(--text-faint)] transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>
    <Transition name="collapse">
      <div
        v-show="open"
        class="px-4 pb-4 vedic-markdown text-[13px] leading-relaxed text-[var(--text-body)]/75"
        v-html="html"
      />
    </Transition>
  </div>
</template>

<style scoped>
.vedic-markdown :deep(h1),
.vedic-markdown :deep(h2),
.vedic-markdown :deep(h3) {
  color: #f5e6c0;
  font-weight: 600;
  margin: 0.8em 0 0.3em;
  font-size: 0.95em;
}
.vedic-markdown :deep(p) {
  margin: 0.4em 0;
}
.vedic-markdown :deep(ul),
.vedic-markdown :deep(ol) {
  padding-left: 1.4em;
  margin: 0.4em 0;
}
.vedic-markdown :deep(li) {
  margin: 0.15em 0;
}
.vedic-markdown :deep(strong) {
  color: #c9a227;
  font-weight: 600;
}
.vedic-markdown :deep(em) {
  color: #e8e0d0;
}
.vedic-markdown :deep(blockquote) {
  border-left: 2px solid rgba(201, 162, 39, 0.4);
  padding-left: 0.9em;
  color: rgba(232, 224, 208, 0.55);
  margin: 0.5em 0;
}
.vedic-markdown :deep(code) {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.85em;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.1em 0.35em;
  border-radius: 0.25em;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  overflow: hidden;
  max-height: 4000px;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
