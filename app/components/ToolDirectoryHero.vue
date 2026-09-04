<template>
  <header v-reveal class="directory-hero">
    <p class="directory-eyebrow">
      {{ $t(titleKey) }}
    </p>
    <h1 class="directory-title font-serif">
      {{ $t(titleKey) }}
    </h1>
    <p class="directory-subtitle">
      {{ $t(subtitleKey) }}
    </p>

    <div class="directory-meta">
      <span>{{ count }}</span>
      <span class="directory-meta-label">{{ $t(countLabelKey) }}</span>
    </div>

    <div class="directory-guide">
      <UIcon name="i-heroicons-light-bulb" class="h-4 w-4 shrink-0 text-[var(--accent)]" />
      <i18n-t keypath="tools.guide" tag="span">
        <template #profileLink>
          <NuxtLink :to="localePath('/settings')" class="directory-guide-link">
            {{ $t('tools.profileLink') }}
          </NuxtLink>
        </template>
      </i18n-t>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  titleKey: string
  subtitleKey: string
  countLabelKey: string
  count: number
}>()

const localePath = useLocalePath()
</script>

<style scoped>
.directory-hero {
  max-width: 780px;
}

.directory-eyebrow {
  margin-bottom: 14px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.directory-title {
  margin-bottom: 16px;
  color: var(--text-primary);
  font-size: clamp(2.1rem, 4vw, 3.4rem);
  font-weight: 600;
  line-height: 1.12;
}

.directory-subtitle {
  max-width: 42em;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.7;
}

.directory-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  color: var(--text-muted);
  font-size: 14px;
}

.directory-meta > span:first-of-type {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.directory-guide {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 680px;
  margin-top: 24px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.directory-guide-link {
  color: var(--accent);
  transition: opacity 160ms ease;
}

.directory-guide-link:hover {
  opacity: 0.82;
}
</style>
