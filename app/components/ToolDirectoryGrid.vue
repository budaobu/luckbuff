<template>
  <div v-reveal.stagger class="directory-grid">
    <NuxtLink
      v-for="tool in tools"
      :key="tool.path"
      :to="localePath(tool.path)"
      data-reveal-child
      class="directory-card arc-card group"
      :class="{ 'directory-card-recommended': tool.recommended }"
    >
      <span v-if="tool.recommended" class="directory-badge">
        {{ $t('seeking.recommended') }}
      </span>
      <span class="directory-card-body">
        <span class="directory-icon">
          <UIcon :name="tool.icon" class="h-5 w-5" />
        </span>
        <span class="directory-name">{{ $t(tool.titleKey) }}</span>
        <span class="directory-desc">{{ $t(tool.descKey) }}</span>
        <span class="directory-cta">
          {{ $t(tool.ctaKey) }}
          <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { ToolItem } from '~/composables/useToolCategories'

defineProps<{
  tools: ToolItem[]
}>()

const localePath = useLocalePath()
</script>

<style scoped>
.directory-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.directory-card {
  position: relative;
  display: flex;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--surface-card);
}

.directory-card-recommended {
  border-color: var(--accent-border);
}

.directory-badge {
  position: absolute;
  z-index: 1;
  top: 16px;
  right: 16px;
  padding: 4px 10px;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
}

.directory-card-body {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  padding: 24px;
}

.directory-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-bottom: 20px;
  border: 1px solid var(--accent-border);
  border-radius: 13px;
  background: var(--accent-bg);
  color: var(--accent);
}

.directory-name {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.45;
}

.directory-desc {
  flex: 1;
  overflow: hidden;
  margin-bottom: 22px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.directory-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
}

@media (min-width: 640px) {
  .directory-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .directory-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
