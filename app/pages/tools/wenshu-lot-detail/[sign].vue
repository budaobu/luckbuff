<template>
  <div v-if="lot" class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-[10%] right-[18%] h-[420px] w-[420px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
    </div>

    <article class="relative z-10 mx-auto max-w-3xl px-6 py-12">
      <nav class="mb-7 flex items-center justify-between gap-4">
        <NuxtLink
          :to="localePath('/tools/wenshu-lot')"
          class="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          {{ $t('wenshuLotDetail.back') }}
        </NuxtLink>
        <span class="rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
          {{ lot.fortune.level }}
        </span>
      </nav>

      <header class="mb-8">
        <p class="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">
          Manjushri Oracle No. {{ lot.fortune.number }}
        </p>
        <h1 class="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
          {{ $t('wenshuLotDetail.title', { n: lot.fortune.number }) }}
        </h1>
        <p class="mt-3 text-lg font-semibold text-[var(--text-body)]">{{ lot.fortune.title }}</p>
      </header>

      <section class="mb-5 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5">
        <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('wenshuLotDetail.poem') }}</h2>
        <p class="whitespace-pre-line text-base leading-8 text-[var(--text-body)]">{{ lot.fortune.poem }}</p>
      </section>

      <section class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] p-5">
        <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('wenshuLotDetail.sacredMeaning') }}</h2>
        <p class="whitespace-pre-line text-sm leading-7 text-[var(--text-body)]">{{ lot.fortune.sacredMeaning }}</p>
      </section>

      <section class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
        <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('wenshuLotDetail.explanation') }}</h2>
        <p class="whitespace-pre-line text-sm leading-7 text-[var(--text-body)]">{{ lot.fortune.explanation }}</p>
      </section>

      <section class="mb-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
        <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('wenshuLotDetail.advice') }}</h2>
        <p class="whitespace-pre-line text-sm leading-7 text-[var(--text-body)]">{{ lot.fortune.advice }}</p>
      </section>

      <nav class="mb-8 grid grid-cols-2 gap-3" :aria-label="$t('wenshuLotDetail.navigation')">
        <NuxtLink
          v-if="lot.fortune.number > 1"
          :to="localePath(`/tools/wenshu-lots/${lot.fortune.number - 1}`)"
          class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 transition-colors hover:border-[var(--border-medium)]"
        >
          <span class="text-xs text-[var(--text-faint)]">{{ $t('wenshuLotDetail.previous') }}</span>
          <span class="mt-1 block text-sm font-medium">{{ $t('wenshuLotDetail.lotNo', { n: lot.fortune.number - 1 }) }}</span>
        </NuxtLink>
        <div v-else />
        <NuxtLink
          v-if="lot.fortune.number < lot.lotType.count"
          :to="localePath(`/tools/wenshu-lots/${lot.fortune.number + 1}`)"
          class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-right transition-colors hover:border-[var(--border-medium)]"
        >
          <span class="text-xs text-[var(--text-faint)]">{{ $t('wenshuLotDetail.next') }}</span>
          <span class="mt-1 block text-sm font-medium">{{ $t('wenshuLotDetail.lotNo', { n: lot.fortune.number + 1 }) }}</span>
        </NuxtLink>
      </nav>

      <NuxtLink
        :to="localePath('/tools/wenshu-lot')"
        class="inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        <UIcon name="i-heroicons-academic-cap" class="mr-2 h-5 w-5" />
        {{ $t('wenshuLotDetail.draw') }}
      </NuxtLink>
    </article>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  path: '/tools/wenshu-lots/:sign(\\d+)',
})

interface LotResponse {
  lotType: { id: string; name: string; count: number }
  fortune: {
    number: number
    title: string
    level: string
    levelCode: 'upper' | 'upper-middle' | 'middle' | 'lower-middle' | 'lower'
    poem: string
    explanation: string
    advice: string
    sacredMeaning?: string
  }
  locale: string
}

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const sign = computed(() => Number(route.params.sign))
const pageUrl = useLocalizedSeoUrl(() => `/tools/wenshu-lots/${sign.value}`)

const { data: lot, error } = await useAsyncData(
  () => `wenshu-lot-${sign.value}-${locale.value}`,
  () => plainFetch<LotResponse>(`/api/tools/wenshu-lot/${sign.value}`, { query: { locale: locale.value } }),
  { server: true, watch: [locale] },
)

if (error.value || !lot.value || !Number.isInteger(sign.value) || sign.value < 1 || sign.value > 100) {
  throw createError({ statusCode: 404, statusMessage: 'Lot not found', fatal: true })
}

useSeoMeta({
  title: () => t('wenshuLotDetail.seoTitle', { n: lot.value!.fortune.number, title: lot.value!.fortune.title }),
  description: () => t('wenshuLotDetail.seoDescription', {
    n: lot.value!.fortune.number,
    title: lot.value!.fortune.title,
    meaning: lot.value!.fortune.explanation,
  }),
  keywords: () => t('wenshuLotDetail.seoKeywords', { n: lot.value!.fortune.number, title: lot.value!.fortune.title }),
  ogTitle: () => t('wenshuLotDetail.seoTitle', { n: lot.value!.fortune.number, title: lot.value!.fortune.title }),
  ogDescription: () => t('wenshuLotDetail.seoDescription', {
    n: lot.value!.fortune.number,
    title: lot.value!.fortune.title,
    meaning: lot.value!.fortune.explanation,
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
      headline: t('wenshuLotDetail.seoTitle', { n: lot.value!.fortune.number, title: lot.value!.fortune.title }),
      description: t('wenshuLotDetail.seoDescription', {
        n: lot.value!.fortune.number,
        title: lot.value!.fortune.title,
        meaning: lot.value!.fortune.explanation,
      }),
      url: pageUrl.value,
      articleSection: lot.value!.lotType.name,
      position: lot.value!.fortune.number,
    }),
  }],
}))
</script>
