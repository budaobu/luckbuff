<template>
  <section class="f26-entry" :aria-label="$t('fengshui2026Entry.label')">
    <NuxtLink :to="localePath('/fortune/2026')" class="f26-link">
      <UIcon name="i-heroicons-calendar-days" class="f26-icon" />
      <span class="f26-copy">
        <strong>{{ $t('fengshui2026Entry.hubTitle') }}</strong>
        <small>{{ $t('fengshui2026Entry.hubDesc') }}</small>
      </span>
      <UIcon name="i-heroicons-arrow-right" class="f26-arrow" />
    </NuxtLink>
    <NuxtLink
      :to="localePath('/insights/2026-bingwu-year-flying-star-fengshui-sector-layout-guide')"
      class="f26-link"
    >
      <UIcon name="i-heroicons-book-open" class="f26-icon" />
      <span class="f26-copy">
        <strong>{{ $t('fengshui2026Entry.articleTitle') }}</strong>
        <small>{{ $t('fengshui2026Entry.articleDesc') }}</small>
      </span>
      <UIcon name="i-heroicons-arrow-right" class="f26-arrow" />
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>

<style scoped>
.f26-entry {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 20px;
}

.f26-link {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  background: var(--surface-card);
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}

.f26-link:hover {
  border-color: var(--border-medium);
  background: var(--surface-card-hover);
}

.f26-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  color: var(--accent-muted);
}

.f26-copy {
  min-width: 0;
}

.f26-copy strong {
  display: block;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.4;
}

.f26-copy small {
  display: block;
  margin-top: 3px;
  color: var(--text-faint);
  font-size: 12px;
  line-height: 1.5;
}

.f26-arrow {
  width: 16px;
  height: 16px;
  margin-left: auto;
  flex: 0 0 auto;
  color: var(--text-faint);
}

@media (max-width: 640px) {
  .f26-entry {
    grid-template-columns: 1fr;
  }
}
</style>
