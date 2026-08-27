<template>
  <div class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-[15%] top-[10%] h-[500px] w-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 mx-auto max-w-6xl px-6 py-16">
      <header class="mb-14 text-center">
        <span class="mb-3 block text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">Numeric Energy</span>
        <h1 class="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
          {{ $t('numericEnergyTopic.title') }}
        </h1>
        <p class="mx-auto mt-3 max-w-md text-sm text-[var(--text-faint)]">
          {{ $t('numericEnergyTopic.subtitle') }}
        </p>
        <div class="mx-auto mt-5 h-px w-12 bg-[var(--accent-border-hover)]" />
      </header>

      <p class="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-[var(--text-muted)]">
        {{ $t('numericEnergyTopic.intro') }}
      </p>

      <section class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="(tool, index) in numericTools"
          :key="tool.path"
          class="group arc-card relative flex flex-col overflow-hidden rounded-2xl border bg-[var(--surface-card)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)]"
          :class="index === 0 ? 'border-[var(--accent-border)]' : 'border-[var(--border-subtle)]'"
        >
          <span v-if="index === 0" class="absolute right-3 top-3 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
            {{ $t('seeking.recommended') }}
          </span>
          <div class="flex flex-1 flex-col p-7">
            <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)] transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110">
              <UIcon name="i-heroicons-calculator" class="h-7 w-7" />
            </div>
            <h3 class="mb-3 text-xl font-semibold text-[var(--text-primary)]">{{ $t(`numericEnergy.scenarios.${tool.scenario}.longTitle`) }}</h3>
            <p class="line-clamp-4 flex-1 overflow-hidden text-sm leading-relaxed text-[var(--text-muted)]">
              {{ $t(`numericEnergy.scenarios.${tool.scenario}.description`) }}
            </p>
            <UButton
              color="warning"
              size="md"
              :variant="index === 0 ? 'solid' : 'soft'"
              :to="localePath(tool.path)"
              class="group/btn mt-4 w-full justify-center"
            >
              {{ $t(`numericEnergy.scenarios.${tool.scenario}.cta`) }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </article>
      </section>

      <!-- 使用指南 -->
      <section class="mx-auto mt-16 max-w-3xl">
        <h2 class="mb-6 text-center text-lg font-semibold text-[var(--text-primary)]">{{ $t('numericEnergyTopic.guideTitle') }}</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div v-for="num in 3" :key="num" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]">
              <UIcon :name="`i-heroicons-${['squares-plus', 'calculator', 'light-bulb'][num - 1]}`" class="h-5 w-5" />
            </div>
            <h4 class="mb-1 text-sm font-semibold text-[var(--text-primary)]">{{ $t(`numericEnergyTopic.guide${num}Title`) }}</h4>
            <p class="text-xs leading-relaxed text-[var(--text-muted)]">{{ $t(`numericEnergyTopic.guide${num}Desc`) }}</p>
          </div>
        </div>
      </section>

      <!-- 常见问题 -->
      <section class="mx-auto mt-16 max-w-3xl">
        <h2 class="mb-6 text-center text-lg font-semibold text-[var(--text-primary)]">{{ $t('numericEnergyTopic.faqTitle') }}</h2>
        <div class="space-y-3">
          <div v-for="num in 4" :key="num" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="mb-2 text-sm font-semibold text-[var(--text-primary)]">{{ $t(`numericEnergyTopic.faq${num}Q`) }}</h4>
            <p class="text-xs leading-relaxed text-[var(--text-muted)]">{{ $t(`numericEnergyTopic.faq${num}A`) }}</p>
          </div>
        </div>
      </section>

      <p class="mt-12 text-center text-[11px] leading-relaxed text-[var(--text-faint)]">
        {{ $t('numericEnergy.disclaimer') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const numericTools = [
  { scenario: 'phone', path: '/tools/numeric-energy-phone' },
  { scenario: 'plate', path: '/tools/numeric-energy-plate' },
  { scenario: 'door', path: '/tools/numeric-energy-door' },
  { scenario: 'card', path: '/tools/numeric-energy-card' },
] as const

const siteName = 'ososn'
useSeoMeta({
  title: () => `${t('numericEnergyTopic.seoTitle')} - ${siteName}`,
  description: t('numericEnergyTopic.seoDescription'),
  keywords: t('numericEnergyTopic.seoKeywords'),
  ogTitle: () => `${t('numericEnergyTopic.title')} | ${siteName}`,
  ogDescription: t('numericEnergyTopic.seoDescription'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/numeric-energy',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${t('numericEnergyTopic.seoTitle')} - ${siteName}`,
      url: 'https://www.ososn.com/numeric-energy',
      description: t('numericEnergyTopic.seoDescription'),
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: numericTools.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: t(`numericEnergy.scenarios.${tool.scenario}.longTitle`),
          url: `https://www.ososn.com${tool.path}`,
        })),
      },
    }),
  }],
}))
</script>
