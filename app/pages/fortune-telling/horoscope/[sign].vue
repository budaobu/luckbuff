<template>
  <div class="horoscope-detail">
    <div class="horoscope-container">
      <nav class="horoscope-breadcrumb" aria-label="Breadcrumb">
        <NuxtLink :to="localePath('/fortune-telling/horoscope')" class="horoscope-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('horoscope.title') }}
        </NuxtLink>
      </nav>

      <div v-if="error" class="horoscope-error">
        <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
        {{ $t('horoscope.loadFailed') }}
      </div>
      <template v-else-if="result">
        <header class="horoscope-detail-head">
          <div>
            <p>{{ result.date }} · {{ result.sign.range }}</p>
            <h1>{{ $t(`horoscope.signs.${slug}`) }}{{ $t('horoscope.detailSuffix') }}</h1>
          </div>
          <AppShareButton
            tool="horoscope"
            :summary="shareSummary"
            :filename="`${result.sign.slug}-horoscope-poster.png`"
          />
        </header>
        <HoroscopeResultPanel :result="result" />
      </template>
      <div v-else class="horoscope-error">{{ $t('horoscope.loading') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HoroscopeResult } from '~/types/horoscope'
import { isHoroscopeSignSlug } from '~/utils/horoscope/signs'

definePageMeta({
  validate: route => isHoroscopeSignSlug(route.params.sign),
})

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const slug = computed(() => String(route.params.sign))

const { data: result, error } = await useFetch<HoroscopeResult>(() => `/api/horoscope/${slug.value}`, {
  key: `horoscope-${slug.value}`,
  query: { locale },
})

const shareSummary = computed(() => {
  if (!result.value) return undefined
  const scores = result.value.scores
  return `${scores.overall} / ${scores.love} / ${scores.work} / ${scores.wealth} / ${scores.health}`
})

const siteName = useRuntimeConfig().public.siteName || 'ososn'
const pageUrl = useLocalizedSeoUrl(() => `/fortune-telling/horoscope/${slug.value}`)
const signName = computed(() => {
  if (locale.value === 'en') return result.value?.sign.name || t(`horoscope.signs.${slug.value}`)
  if (locale.value === 'ja') return result.value?.sign.nameJa || t(`horoscope.signs.${slug.value}`)
  return t(`horoscope.signs.${slug.value}`)
})

useSeoMeta({
  title: () => `${t('seo.horoscopeDetailTitle', { sign: signName.value })} - ${siteName}`,
  description: () => t('seo.horoscopeDetailDesc', { sign: signName.value, date: result.value?.date ?? '' }),
  keywords: () => t('seo.horoscopeDetailKeywords', { sign: signName.value }),
  ogTitle: () => `${t('seo.horoscopeDetailOgTitle', { sign: signName.value })} - ${siteName}`,
  ogDescription: () => t('seo.horoscopeDetailOgDesc', { sign: signName.value }),
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
      headline: t('seo.horoscopeDetailTitle', { sign: signName.value }),
      datePublished: result.value?.date,
      dateModified: result.value?.generatedAt,
      url: pageUrl.value,
      description: t('seo.horoscopeDetailDesc', { sign: signName.value, date: result.value?.date ?? '' }),
      mainEntityOfPage: pageUrl.value,
    }),
  }],
}))
</script>

<style scoped>
.horoscope-detail { position: relative; min-height: 100vh; background: var(--surface-bg); color: var(--text-primary); }
.horoscope-container { width: 100%; max-width: 1080px; margin: 0 auto; padding: 34px 20px 76px; }
.horoscope-breadcrumb { margin-bottom: 22px; }
.horoscope-back { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; }
.horoscope-back:hover { color: var(--accent); }
.horoscope-detail-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin-bottom: 24px; }
.horoscope-detail-head p { margin: 0; color: var(--accent); font-size: 13px; }
.horoscope-detail-head h1 { margin: 6px 0 0; font-size: clamp(27px, 4vw, 38px); line-height: 1.2; }
.horoscope-error { display: flex; align-items: center; gap: 8px; color: rgb(220 90 90); }
@media (max-width: 620px) {
  .horoscope-detail-head { align-items: flex-start; flex-direction: column; }
}
</style>
