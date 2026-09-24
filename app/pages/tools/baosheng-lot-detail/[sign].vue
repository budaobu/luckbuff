<template>
  <div v-if="lot" class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-[10%] right-[18%] h-[420px] w-[420px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
    </div>

    <article class="relative z-10 mx-auto max-w-3xl px-6 py-12">
      <nav class="mb-7 flex items-center justify-between gap-4">
        <NuxtLink
          :to="localePath('/tools/baosheng-lot')"
          class="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          {{ $t('baoshengLotDetail.back') }}
        </NuxtLink>
        <span class="rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
          {{ lot.fortune.level }}
        </span>
      </nav>

      <header class="mb-8">
        <p class="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">
          Baosheng Dadi Oracle No. {{ lot.fortune.number }}
        </p>
        <h1 class="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
          {{ $t('baoshengLotDetail.title', { n: lot.fortune.number }) }}
        </h1>
        <p class="mt-3 text-sm leading-7 text-[var(--text-body)]">{{ lot.fortune.explanation }}</p>
      </header>

      <section class="mb-5 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5">
        <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('baoshengLotDetail.poem') }}</h2>
        <p class="whitespace-pre-line text-base leading-8 text-[var(--text-body)]">{{ lot.fortune.poem }}</p>
      </section>

      <section class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] p-5">
        <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('baoshengLotDetail.judgments') }}</h2>
        <dl class="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div
            v-for="judgment in lot.fortune.categoryJudgments || []"
            :key="judgment.label"
            class="rounded-xl bg-[var(--surface-card)] p-3"
          >
            <dt class="text-xs text-[var(--text-faint)]">{{ judgment.label }}</dt>
            <dd class="mt-1 text-sm font-medium text-[var(--text-body)]">{{ judgment.value }}</dd>
          </div>
        </dl>
      </section>

      <section class="mb-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
        <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('baoshengLotDetail.advice') }}</h2>
        <p class="whitespace-pre-line text-sm leading-7 text-[var(--text-body)]">{{ lot.fortune.advice }}</p>
      </section>

      <nav class="mb-8 grid grid-cols-2 gap-3" :aria-label="$t('baoshengLotDetail.navigation')">
        <NuxtLink
          v-if="lot.fortune.number > 1"
          :to="localePath(`/tools/baosheng-lots/${lot.fortune.number - 1}`)"
          class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 transition-colors hover:border-[var(--border-medium)]"
        >
          <span class="text-xs text-[var(--text-faint)]">{{ $t('baoshengLotDetail.previous') }}</span>
          <span class="mt-1 block text-sm font-medium">{{ $t('baoshengLotDetail.lotNo', { n: lot.fortune.number - 1 }) }}</span>
        </NuxtLink>
        <div v-else />
        <NuxtLink
          v-if="lot.fortune.number < lot.lotType.count"
          :to="localePath(`/tools/baosheng-lots/${lot.fortune.number + 1}`)"
          class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-right transition-colors hover:border-[var(--border-medium)]"
        >
          <span class="text-xs text-[var(--text-faint)]">{{ $t('baoshengLotDetail.next') }}</span>
          <span class="mt-1 block text-sm font-medium">{{ $t('baoshengLotDetail.lotNo', { n: lot.fortune.number + 1 }) }}</span>
        </NuxtLink>
      </nav>

      <NuxtLink
        :to="localePath('/tools/baosheng-lot')"
        class="inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        <UIcon name="i-heroicons-heart" class="mr-2 h-5 w-5" />
        {{ $t('baoshengLotDetail.draw') }}
      </NuxtLink>
    </article>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  path: '/tools/baosheng-lots/:sign(\\d+)',
})

interface LotResponse {
  lotType: { id: string; name: string; count: number }
  fortune: {
    number: number
    title: string
    level: string
    levelCode: 'upper' | 'upper-middle' | 'middle' | 'lower-middle' | 'lower' | 'unranked'
    poem: string
    explanation: string
    advice: string
    categoryJudgments?: Array<{ label: string; value: string }>
  }
  locale: string
}

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const sign = computed(() => Number(route.params.sign))
const pageUrl = useLocalizedSeoUrl(() => `/tools/baosheng-lots/${sign.value}`)

const { data: lot, error } = await useAsyncData(
  () => `baosheng-lot-${sign.value}-${locale.value}`,
  () => plainFetch<LotResponse>(`/api/tools/baosheng-lot/${sign.value}`, { query: { locale: locale.value } }),
  { server: true, watch: [locale] },
)

if (error.value || !lot.value || !Number.isInteger(sign.value) || sign.value < 1 || sign.value > 60) {
  throw createError({ statusCode: 404, statusMessage: 'Lot not found', fatal: true })
}

const judgmentSummary = computed(() => (lot.value!.fortune.categoryJudgments || [])
  .map(item => `${item.label}${item.value}`)
  .join('，')
  .slice(0, 48))

useSeoMeta({
  title: () => t('baoshengLotDetail.seoTitle', { n: lot.value!.fortune.number }),
  description: () => t('baoshengLotDetail.seoDescription', {
    n: lot.value!.fortune.number,
    poem: lot.value!.fortune.poem.replace(/\s+/g, ''),
    judgments: judgmentSummary.value,
  }),
  keywords: () => t('baoshengLotDetail.seoKeywords', { n: lot.value!.fortune.number }),
  ogTitle: () => t('baoshengLotDetail.seoTitle', { n: lot.value!.fortune.number }),
  ogDescription: () => t('baoshengLotDetail.seoDescription', {
    n: lot.value!.fortune.number,
    poem: lot.value!.fortune.poem.replace(/\s+/g, ''),
    judgments: judgmentSummary.value,
  }),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'article',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: t('baoshengLotDetail.seoTitle', { n: lot.value!.fortune.number }),
      description: t('baoshengLotDetail.seoDescription', {
        n: lot.value!.fortune.number,
        poem: lot.value!.fortune.poem.replace(/\s+/g, ''),
        judgments: judgmentSummary.value,
      }),
      url: pageUrl.value,
      articleSection: lot.value!.lotType.name,
      position: lot.value!.fortune.number,
    }),
  }],
}))
</script>
