<template>
  <nav
    class="absolute inset-y-0 right-3 hidden xl:block"
    :aria-label="t('insights.tocTitle')"
  >
    <div class="sticky top-1/2 -translate-y-1/2">
      <div class="relative flex flex-col items-end">
        <div class="absolute inset-y-1 right-[5px] w-px bg-[var(--border-light)]/60" />
        <div
          v-for="link in links"
          :key="link.id"
          class="group relative flex items-center justify-end"
          :style="{ height: `${itemSize}px` }"
        >
          <!-- hover/active 预览卡，往正文一侧展开 -->
          <div
            class="absolute right-full top-1/2 -translate-y-1/2 mr-4 w-52 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 shadow-lg shadow-black/5 transition-all duration-200 opacity-0 translate-x-1 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0"
            :class="link.id === activeId ? '!opacity-100 !translate-x-0 border-[var(--accent-border)]' : ''"
          >
            <span
              class="block text-xs leading-snug line-clamp-2"
              :class="link.id === activeId ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-body)]'"
            >{{ link.text }}</span>
          </div>
          <button
            type="button"
            class="relative block h-[2px] rounded-full transition-all duration-200"
            :class="link.id === activeId
              ? 'w-6 bg-[var(--accent)]'
              : 'w-3 bg-[var(--border-light)] group-hover:w-5 group-hover:bg-[var(--accent-muted)]'"
            :aria-label="link.text"
            @click="emit('navigate', link.id)"
          />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
export interface InsightTocLink {
  id: string
  text: string
}

withDefaults(defineProps<{
  links: InsightTocLink[]
  activeId: string | null
  itemSize?: number
}>(), { itemSize: 22 })

const emit = defineEmits<{ navigate: [id: string] }>()

const { t } = useI18n()
</script>
