<template>
  <div class="horoscope-page">
    <div class="horoscope-ambient" aria-hidden="true" />
    <div class="horoscope-container">
      <nav class="horoscope-breadcrumb" aria-label="Breadcrumb">
        <NuxtLink :to="localePath('/fortune-telling')" class="horoscope-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('tools.categoryFortuneTelling') }}
        </NuxtLink>
      </nav>

      <header v-reveal class="horoscope-hero">
        <p>{{ $t('horoscope.eyebrow') }}</p>
        <h1>{{ $t('horoscope.title') }}</h1>
        <p>{{ $t('horoscope.subtitle') }}</p>
        <dl v-if="data">
          <div><dt>{{ data.date }}</dt><dd>{{ $t(`horoscope.phases.${data.moonPhaseKey}`) }}</dd></div>
          <div><dt>{{ $t('horoscope.fields.moonSign') }}</dt><dd>{{ zodiacName(data.moonSignIndex) }}</dd></div>
          <div><dt>{{ data.generatedAt.slice(0, 10) }}</dt><dd>{{ $t('horoscope.updatedToday') }}</dd></div>
        </dl>
      </header>

      <div v-if="error" class="horoscope-error">
        <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
        {{ $t('horoscope.loadFailed') }}
      </div>

      <section v-else-if="data" v-reveal.stagger class="horoscope-grid">
        <NuxtLink
          v-for="row in data.signs"
          :key="row.sign.slug"
          :to="localePath(`/fortune-telling/horoscope/${row.sign.slug}`)"
          class="horoscope-card"
          :class="row.rank <= 3 ? 'is-top' : ''"
          data-reveal-child
        >
          <span class="horoscope-rank">#{{ row.rank }}</span>
          <span class="horoscope-name">{{ $t(`horoscope.signs.${row.sign.slug}`) }}</span>
          <small>{{ row.sign.range }}</small>
          <strong>{{ row.scores.overall }}</strong>
          <ul>
            <li><i>{{ $t('horoscope.fields.love') }}</i><b>{{ row.scores.love }}</b></li>
            <li><i>{{ $t('horoscope.fields.work') }}</i><b>{{ row.scores.work }}</b></li>
            <li><i>{{ $t('horoscope.fields.wealth') }}</i><b>{{ row.scores.wealth }}</b></li>
            <li><i>{{ $t('horoscope.fields.health') }}</i><b>{{ row.scores.health }}</b></li>
          </ul>
          <p>{{ $t(`horoscope.colors.${row.luckyColorKey}`) }} · {{ row.luckyNumber }}</p>
          <span class="horoscope-cta">{{ $t('horoscope.viewDetail') }}<UIcon name="i-heroicons-arrow-right" class="h-4 w-4" /></span>
        </NuxtLink>
      </section>

      <HoroscopeCalendarSubscriber v-if="data" :signs="data.signs.map(({ sign }) => sign)" class="horoscope-subscriber" />

      <AppFaq
        :title="$t('horoscope.faq.title')"
        :items="faqItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HoroscopeTopicResult } from '~/types/horoscope'
import { HOROSCOPE_ZODIAC_SIGNS } from '~/utils/horoscope/signs'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { data, error } = await useFetch<HoroscopeTopicResult>('/api/horoscope', {
  key: 'horoscope-topic-today',
  query: { locale },
})

function zodiacName(index: number) {
  return locale.value === 'en'
    ? ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][index]
    : locale.value === 'ja'
      ? ['牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'][index]
      : HOROSCOPE_ZODIAC_SIGNS[index]!
}

const siteName = useRuntimeConfig().public.siteName || 'ososn'
const pageUrl = useLocalizedSeoUrl('/fortune-telling/horoscope')

const faqItems = computed(() => [
  {
    question: t('horoscope.faq.q1'),
    answer: t('horoscope.faq.a1'),
  },
  {
    question: t('horoscope.faq.q2'),
    answer: t('horoscope.faq.a2'),
  },
  {
    question: t('horoscope.faq.q3'),
    answer: t('horoscope.faq.a3'),
  },
  {
    question: t('horoscope.faq.q4'),
    answer: t('horoscope.faq.a4'),
  },
])

useSeoMeta({
  title: () => `${t('seo.horoscopeTopicTitle')} - ${siteName}`,
  description: t('seo.horoscopeTopicDesc'),
  keywords: t('seo.horoscopeTopicKeywords'),
  ogTitle: () => `${t('seo.horoscopeTopicOgTitle')} - ${siteName}`,
  ogDescription: t('seo.horoscopeTopicOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.horoscopeTopicTitle')} - ${siteName}`,
        url: pageUrl.value,
        description: t('seo.horoscopeTopicDesc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: data.value?.signs.map((row, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: row.sign.nameZh,
            url: `${pageUrl.value}/${row.sign.slug}`,
          })) ?? [],
        },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.value.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }),
    },
  ],
}))
</script>

<style scoped>
.horoscope-page { position: relative; min-height: 100vh; overflow: hidden; background: var(--surface-bg); color: var(--text-primary); }
.horoscope-ambient { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(52rem 28rem at 8% 0%, color-mix(in srgb, var(--accent) 7%, transparent), transparent 64%); }
.horoscope-container { position: relative; z-index: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 34px 20px 74px; }
.horoscope-breadcrumb { margin-bottom: 24px; }
.horoscope-back { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; }
.horoscope-back:hover { color: var(--accent); }
.horoscope-hero { max-width: 840px; margin-bottom: 30px; }
.horoscope-hero > p:first-child { margin: 0 0 8px; color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.horoscope-hero h1 { margin: 0; font-size: clamp(28px, 4vw, 42px); line-height: 1.15; }
.horoscope-hero > p:nth-child(3) { margin: 12px 0 0; color: var(--text-muted); font-size: 15px; line-height: 1.7; }
.horoscope-hero dl { display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0 0; }
.horoscope-hero div { border: 1px solid var(--border-subtle); border-radius: 10px; background: var(--surface-card); padding: 9px 13px; }
.horoscope-hero dt { color: var(--text-faint); font-size: 11px; }
.horoscope-hero dd { margin: 2px 0 0; font-weight: 650; }
.horoscope-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
.horoscope-card { position: relative; overflow: hidden; border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 17px; text-decoration: none; transition: border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease; }
.horoscope-card:hover { border-color: var(--accent-border-hover); transform: translateY(-2px); box-shadow: 0 12px 30px -22px var(--accent-shadow-hover); }
.horoscope-card.is-top { border-color: var(--accent-border); }
.horoscope-rank { position: absolute; top: 12px; right: 12px; color: var(--text-faint); font-size: 12px; font-weight: 650; }
.horoscope-name { display: block; font-size: 19px; font-weight: 700; }
.horoscope-card small { display: block; margin-top: 3px; color: var(--text-faint); font-size: 11px; }
.horoscope-card strong { display: block; margin: 13px 0 9px; color: var(--accent); font-size: 32px; line-height: 1; }
.horoscope-card ul { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 10px; margin: 0; padding: 0; list-style: none; }
.horoscope-card li { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; }
.horoscope-card li i { font-style: normal; color: var(--text-faint); }
.horoscope-card p { margin: 12px 0 0; color: var(--text-muted); font-size: 12px; }
.horoscope-cta { display: inline-flex; align-items: center; gap: 5px; margin-top: 13px; color: var(--accent); font-size: 13px; font-weight: 600; }
.horoscope-subscriber { margin-top: 34px; }
.horoscope-error { display: flex; align-items: center; gap: 8px; color: rgb(220 90 90); }
@media (max-width: 960px) { .horoscope-grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }
@media (max-width: 720px) { .horoscope-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 480px) { .horoscope-grid { grid-template-columns: 1fr; } .horoscope-hero dl { grid-template-columns: 1fr; display: grid; } }
@media (prefers-reduced-motion: reduce) { .horoscope-card { transition: none; } .horoscope-card:hover { transform: none; } }
</style>
