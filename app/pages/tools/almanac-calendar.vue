<template>
  <div>
    <section class="ac-page">
      <header class="ac-head">
        <p>{{ $t('almanacCalendar.eyebrow') }}</p>
        <h1>{{ $t('almanacCalendar.title') }}</h1>
        <p>{{ $t('almanacCalendar.subtitle') }}</p>
      </header>

      <AlmanacCalendarSubscriber />

      <AppFaq
        :title="$t('almanacCalendar.faq.title')"
        :items="faqItems"
      />

      <p class="ac-disclaimer">
        {{ $t('almanacCalendar.disclaimer') }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const siteName = useRuntimeConfig().public.siteName || 'ososn'
const pageUrl = useLocalizedSeoUrl('/tools/almanac-calendar')

const faqItems = computed(() => [
  {
    question: t('almanacCalendar.faq.q1'),
    answer: t('almanacCalendar.faq.a1'),
  },
  {
    question: t('almanacCalendar.faq.q2'),
    answer: t('almanacCalendar.faq.a2'),
  },
  {
    question: t('almanacCalendar.faq.q3'),
    answer: t('almanacCalendar.faq.a3'),
  },
  {
    question: t('almanacCalendar.faq.q4'),
    answer: t('almanacCalendar.faq.a4'),
  },
])

useSeoMeta({
  title: () => `${t('seo.almanacCalendarTitle')} - ${siteName}`,
  description: t('seo.almanacCalendarDesc'),
  keywords: t('seo.almanacCalendarKeywords'),
  ogTitle: () => `${t('seo.almanacCalendarOgTitle')} - ${siteName}`,
  ogDescription: t('seo.almanacCalendarOgDesc'),
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
        name: `${t('seo.almanacCalendarTitle')} - ${siteName}`,
        url: pageUrl.value,
        description: t('seo.almanacCalendarDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('almanacCalendar.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'macOS, Windows, iOS, Android',
          url: pageUrl.value,
          description: t('seo.almanacCalendarOgDesc'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
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
.ac-page {
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
  padding: 34px 20px 64px;
}

.ac-head {
  max-width: 780px;
  margin-bottom: 24px;
}

.ac-head > p:first-child {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.ac-head h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 38px);
  line-height: 1.16;
}

.ac-head > p:nth-child(3) {
  margin: 12px 0 0;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.7;
}

.ac-disclaimer {
  margin: 16px 0 0;
  color: var(--text-faint);
  font-size: 12px;
  line-height: 1.7;
}
</style>
