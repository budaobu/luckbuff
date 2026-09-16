<template>
  <div v-if="lot" class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute right-[18%] top-[10%] h-[420px] w-[420px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
    </div>

    <article class="relative z-10 mx-auto max-w-3xl px-6 py-12">
      <nav class="mb-7 flex items-center justify-between gap-4">
        <NuxtLink :to="localePath('/tools/yuelao-lot')" class="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]">
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          {{ $t('yuelaoLotDetail.back') }}
        </NuxtLink>
        <span class="rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
          {{ lot.fortune.rank }}
        </span>
      </nav>

      <header class="mb-8">
        <p class="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">Yuelao Oracle No. {{ lot.fortune.id }}</p>
        <h1 class="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
          {{ $t('yuelaoLotDetail.title', { n: lot.fortune.id }) }}
        </h1>
      </header>

      <section class="mb-5 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5">
        <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('yuelaoLotDetail.poem') }}</h2>
        <p class="whitespace-pre-line text-lg leading-8 text-[var(--text-body)]">{{ lot.fortune.poem }}</p>
      </section>

      <section class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] p-5">
        <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('yuelaoLotDetail.source') }}</h2>
        <p class="text-sm leading-7 text-[var(--text-body)]">{{ lot.fortune.source || $t('yuelaoLotDetail.sourcePending') }}</p>
      </section>

      <section class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
        <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('yuelaoLotDetail.factTitle') }}</h2>
        <p class="text-sm leading-7 text-[var(--text-body)]">{{ $t('yuelaoLotDetail.factBody') }}</p>
      </section>

      <section class="mb-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
        <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('yuelaoLotDetail.aiTitle') }}</h2>
        <p class="text-sm leading-7 text-[var(--text-body)]">{{ $t('yuelaoLotDetail.aiBody') }}</p>
        <NuxtLink :to="localePath('/tools/yuelao-lot')" class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
          <UIcon name="i-heroicons-sparkles" class="h-4 w-4" />
          {{ $t('yuelaoLotDetail.draw') }}
        </NuxtLink>
      </section>

      <nav class="mb-8 grid grid-cols-2 gap-3" :aria-label="$t('yuelaoLotDetail.navigation')">
        <NuxtLink
          v-if="lot.fortune.id > 1"
          :to="localePath(`/tools/yuelao-lots/${lot.fortune.id - 1}`)"
          class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 transition-colors hover:border-[var(--border-medium)]"
        >
          <span class="text-xs text-[var(--text-faint)]">{{ $t('yuelaoLotDetail.previous') }}</span>
          <span class="mt-1 block text-sm font-medium">{{ $t('yuelaoLotDetail.lotNo', { n: lot.fortune.id - 1 }) }}</span>
        </NuxtLink>
        <div v-else />
        <NuxtLink
          v-if="lot.fortune.id < 100"
          :to="localePath(`/tools/yuelao-lots/${lot.fortune.id + 1}`)"
          class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-right transition-colors hover:border-[var(--border-medium)]"
        >
          <span class="text-xs text-[var(--text-faint)]">{{ $t('yuelaoLotDetail.next') }}</span>
          <span class="mt-1 block text-sm font-medium">{{ $t('yuelaoLotDetail.lotNo', { n: lot.fortune.id + 1 }) }}</span>
        </NuxtLink>
      </nav>
    </article>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  path: '/tools/yuelao-lots/:sign(\\d+)',
})

interface YuelaoLotResponse {
  lotType: { id: 'yuelao'; name: string; count: number }
  fortune: {
    id: number
    rank: string
    rankCode: 'upper' | 'upper-middle' | 'middle' | 'lower-middle' | 'lower'
    poem: string
    source: string
  }
  locale: string
}

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const sign = computed(() => Number(route.params.sign))
const pageUrl = useLocalizedSeoUrl(() => `/tools/yuelao-lots/${sign.value}`)

const { data: lot, error } = await useAsyncData(
  () => `yuelao-lot-${sign.value}-${locale.value}`,
  () => $fetch<YuelaoLotResponse>(`/api/tools/yuelao-lot/${sign.value}`, { query: { locale: locale.value } }),
  { server: true, watch: [locale] },
)

if (error.value || !lot.value || !Number.isInteger(sign.value) || sign.value < 1 || sign.value > 100) {
  throw createError({ statusCode: 404, statusMessage: 'Lot not found', fatal: true })
}

const poemSummary = computed(() => lot.value!.fortune.poem.replace(/\s+/g, '，').slice(0, 32))

useSeoMeta({
  title: () => t('yuelaoLotDetail.seoTitle', { n: lot.value!.fortune.id }),
  description: () => t('yuelaoLotDetail.seoDescription', { n: lot.value!.fortune.id, poem: poemSummary.value }),
  keywords: () => t('yuelaoLotDetail.seoKeywords', { n: lot.value!.fortune.id }),
  ogTitle: () => t('yuelaoLotDetail.seoTitle', { n: lot.value!.fortune.id }),
  ogDescription: () => t('yuelaoLotDetail.seoDescription', { n: lot.value!.fortune.id, poem: poemSummary.value }),
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
      headline: t('yuelaoLotDetail.seoTitle', { n: lot.value!.fortune.id }),
      description: t('yuelaoLotDetail.seoDescription', { n: lot.value!.fortune.id, poem: poemSummary.value }),
      url: pageUrl.value,
      articleSection: lot.value!.lotType.name,
      position: lot.value!.fortune.id,
    }),
  }],
}))
</script>
