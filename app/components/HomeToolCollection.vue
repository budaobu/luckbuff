<template>
  <article data-reveal-child class="tool-collection arc-card">
    <div class="collection-intro">
      <NuxtLink
        :to="localePath(group.path)"
        class="collection-head group"
      >
        <span class="collection-icon">
          <UIcon :name="group.icon" class="h-5 w-5" />
        </span>
        <span class="collection-heading">
          <h3>{{ $t(group.titleKey) }}</h3>
          <p>{{ $t(group.subtitleKey) }}</p>
        </span>
      </NuxtLink>

      <NuxtLink :to="localePath(group.path)" class="collection-cta group">
        {{ $t('toolDirectories.viewAll') }}
        <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </NuxtLink>
    </div>

    <div :class="visibleItems.length === 1 ? 'collection-items collection-items-single' : 'collection-items'">
      <NuxtLink
        v-for="item in visibleItems"
        :key="`${group.id}-${item.path}`"
        :to="localePath(item.path)"
        class="collection-item"
      >
        <span class="item-icon">
          <UIcon :name="item.icon" class="h-4 w-4" />
        </span>
        <span class="item-body">
          <span class="item-title">{{ $t(item.titleKey) }}</span>
          <span v-if="item.subtitleKey" class="item-desc">{{ $t(item.subtitleKey) }}</span>
        </span>
        <UIcon name="i-heroicons-arrow-right" class="item-arrow h-4 w-4" />
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ToolDirectoryGroup } from '~/composables/useToolCategories'

const props = withDefaults(defineProps<{
  group: ToolDirectoryGroup
  maxItems?: number
}>(), {
  maxItems: 6,
})

const localePath = useLocalePath()
const visibleItems = computed(() => props.group.links.slice(0, props.maxItems))
</script>

<style scoped>
.tool-collection {
  display: grid;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--surface-card);
}

.collection-intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
  border-bottom: 1px solid var(--border-light);
}

.collection-head {
  display: flex;
  min-width: 0;
  flex: 1;
  gap: 14px;
  transition: opacity 160ms ease;
}

.collection-head:hover {
  opacity: 0.82;
}

.collection-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border: 1px solid var(--accent-border);
  border-radius: 13px;
  background: var(--accent-bg);
  color: var(--accent);
}

.collection-heading {
  min-width: 0;
}

.collection-heading h3 {
  margin: 2px 0 7px;
  color: var(--text-primary);
  font-size: 19px;
  font-weight: 600;
  line-height: 1.35;
}

.collection-heading p {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.65;
}

.collection-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  margin-top: 12px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
}

.collection-items {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 22px;
}

.collection-items-single .collection-item {
  align-items: start;
  grid-template-columns: 42px minmax(0, 1fr) 16px;
  min-height: 108px;
  padding: 20px 22px;
}

.collection-items-single .item-icon {
  width: 42px;
  height: 42px;
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}

.collection-items-single .item-title {
  font-size: 17px;
}

.collection-items-single .item-desc {
  -webkit-line-clamp: 2;
}

.collection-item {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 12px;
  min-height: 68px;
  padding: 13px 14px;
  border: 1px solid var(--border-light);
  border-radius: 13px;
  background: color-mix(in srgb, var(--surface-bg) 42%, transparent);
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;
}

.item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--surface-input);
  color: var(--text-faint);
}

.item-title {
  display: block;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.item-desc {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.item-arrow {
  color: var(--text-placeholder);
  transition: transform 160ms ease, color 160ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .collection-item:hover {
    border-color: var(--accent-border);
    background: var(--surface-card-hover);
    transform: translateY(-2px);
  }

  .collection-item:hover .item-icon {
    border-color: var(--accent-border);
    background: var(--accent-bg);
    color: var(--accent);
  }

  .collection-item:hover .item-arrow {
    color: var(--accent);
    transform: translateX(2px);
  }
}

@media (min-width: 640px) {
  .collection-items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .tool-collection {
    grid-template-columns: 300px minmax(0, 1fr);
  }

  .collection-intro {
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    border-right: 1px solid var(--border-light);
    border-bottom: 0;
  }

  .collection-items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
  }

  .collection-items-single {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1280px) {
  .collection-items {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .collection-items-single {
    grid-template-columns: 1fr;
  }
}
</style>
