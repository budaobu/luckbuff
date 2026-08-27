<template>
  <div class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-[18%] top-[8%] h-[480px] w-[480px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
    </div>
    <div class="relative z-10 mx-auto max-w-2xl px-6 py-12">
      <div class="mb-8">
        <NuxtLink :to="localePath('/numeric-energy')" class="mb-5 inline-flex items-center gap-1 text-xs text-[var(--text-faint)] hover:text-[var(--accent)]">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" /> {{ $t('numericEnergyTopic.back') }}
        </NuxtLink>
        <span class="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">Plate Numeric Energy</span>
        <h1 class="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
          {{ $t('numericEnergy.scenarios.plate.longTitle') }}
        </h1>
        <p class="mt-2 text-sm text-[var(--text-faint)]">{{ $t('numericEnergy.scenarios.plate.description') }}</p>
        <div class="mt-4 h-px w-12 bg-[var(--accent-border-hover)]" />
      </div>
      <NumericEnergyAnalyzer scenario="plate" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('numericEnergy.scenarios.plate.seoTitle')} - ${siteName}`,
  description: t('numericEnergy.scenarios.plate.seoDescription'),
  keywords: t('numericEnergy.scenarios.plate.seoKeywords'),
  ogTitle: () => t('numericEnergy.scenarios.plate.seoOgTitle'),
  ogDescription: t('numericEnergy.scenarios.plate.seoDescription'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogUrl: 'https://www.ososn.com/tools/numeric-energy-plate',
  twitterCard: 'summary_large_image',
})
</script>
