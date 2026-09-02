<template>
  <div v-if="lot" class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[18%] w-[420px] h-[420px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[28%] left-[14%] w-[320px] h-[320px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[110px]" />
    </div>

    <article class="relative z-10 max-w-3xl mx-auto px-6 py-12">
      <nav class="flex items-center justify-between gap-4 mb-7">
        <NuxtLink
          :to="localePath('/tools/guanyin-lots')"
          class="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
          {{ $t('guanyinLotDetail.back') }}
        </NuxtLink>
        <span class="rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
          {{ lot.fortune.level }}
        </span>
      </nav>

      <header class="mb-8">
        <p class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Guanyin Oracle No. {{ lot.fortune.number }}</p>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('guanyinLotDetail.title', { n: lot.fortune.number }) }}
        </h1>
        <p class="mt-3 text-lg font-semibold text-[var(--text-body)]">{{ lot.fortune.title }}</p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
      </header>

      <section class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5 mb-5">
        <h2 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('guanyinLotDetail.poem') }}</h2>
        <p class="whitespace-pre-line text-base leading-8 text-[var(--text-body)]">{{ lot.fortune.poem }}</p>
      </section>

      <section class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] p-5 mb-5">
        <h2 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('guanyinLotDetail.meaning') }}</h2>
        <p class="whitespace-pre-line text-sm leading-7 text-[var(--text-body)]">{{ lot.fortune.explanation }}</p>
      </section>

      <section class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 mb-7">
        <h2 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('guanyinLotDetail.advice') }}</h2>
        <p class="whitespace-pre-line text-sm leading-7 text-[var(--text-body)]">{{ lot.fortune.advice }}</p>
      </section>

      <nav class="grid grid-cols-2 gap-3 mb-8" :aria-label="$t('guanyinLotDetail.navigation')">
        <NuxtLink
          v-if="lot.fortune.number > 1"
          :to="localePath(`/tools/guanyin-lots/${lot.fortune.number - 1}`)"
          class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 hover:border-[var(--border-medium)] transition-colors"
        >
          <span class="text-xs text-[var(--text-faint)]">{{ $t('guanyinLotDetail.previous') }}</span>
          <span class="block mt-1 text-sm font-medium">{{ $t('guanyinLotDetail.lotNo', { n: lot.fortune.number - 1 }) }}</span>
        </NuxtLink>
        <div v-else />
        <NuxtLink
          v-if="lot.fortune.number < 100"
          :to="localePath(`/tools/guanyin-lots/${lot.fortune.number + 1}`)"
          class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-right hover:border-[var(--border-medium)] transition-colors"
        >
          <span class="text-xs text-[var(--text-faint)]">{{ $t('guanyinLotDetail.next') }}</span>
          <span class="block mt-1 text-sm font-medium">{{ $t('guanyinLotDetail.lotNo', { n: lot.fortune.number + 1 }) }}</span>
        </NuxtLink>
      </nav>

      <NuxtLink
        :to="localePath('/tools/guanyin-lots')"
        class="inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
      >
        <UIcon name="i-heroicons-gift-top" class="mr-2 h-5 w-5" />
        {{ $t('guanyinLotDetail.draw') }}
      </NuxtLink>
    </article>
  </div>
</template>

<script setup lang="ts">
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
  }
  locale: string
}


const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const sign = computed(() => Number(route.params.sign))
const pageUrl = useLocalizedSeoUrl(() => `/tools/guanyin-lot/${sign.value}`)

const { data: lot, error } = await useAsyncData(
  () => `guanyin-lot-${sign.value}-${locale.value}`,
  () => $fetch<LotResponse>(`/api/tools/guanyin-lots/${sign.value}`, { query: { locale: locale.value } }),
  { server: true, watch: [locale] },
)

if (error.value || !lot.value || !Number.isInteger(sign.value) || sign.value < 1 || sign.value > 100) {
  throw createError({ statusCode: 404, statusMessage: 'Lot not found', fatal: true })
}

useSeoMeta({
  title: () => t('guanyinLotDetail.seoTitle', { n: lot.value!.fortune.number, title: lot.value!.fortune.title }),
  description: () => t('guanyinLotDetail.seoDescription', {
    n: lot.value!.fortune.number,
    title: lot.value!.fortune.title,
    meaning: lot.value!.fortune.explanation,
  }),
  keywords: () => t('guanyinLotDetail.seoKeywords', { n: lot.value!.fortune.number }),
  ogTitle: () => t('guanyinLotDetail.seoTitle', { n: lot.value!.fortune.number, title: lot.value!.fortune.title }),
  ogDescription: () => t('guanyinLotDetail.seoDescription', {
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
      headline: t('guanyinLotDetail.seoTitle', { n: lot.value!.fortune.number, title: lot.value!.fortune.title }),
      description: t('guanyinLotDetail.seoDescription', {
        n: lot.value!.fortune.number,
        title: lot.value!.fortune.title,
        meaning: lot.value!.fortune.explanation,
      }),
      url: `https://www.ososn.com/tools/guanyin-lot/${lot.value!.fortune.number}`,
      articleSection: String(lot.value!.lotType.name),
      position: lot.value!.fortune.number,
    }),
  }],
}))
</script>
