<template>
  <TopicToolDirectory
    :category="category"
    title-key="auspiciousDatetime.title"
    eyebrow="Auspicious Days"
    text-namespace="auspiciousDatetime"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="3"
    :faq-count="4"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = '/auspicious-datetime'

const pageUrl = useLocalizedSeoUrl('/auspicious-datetime')
const seoUrl = useLocalizedSeoPath()
const category = useToolCategories().value.find(item => item.id === 'auspicious-datetime')!

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.auspiciousDatetimeTitle')} - ${siteName}`,
  description: t('seo.auspiciousDatetimeDesc'),
  keywords: t('seo.auspiciousDatetimeKeywords'),
  ogTitle: () => `${t('seo.auspiciousDatetimeOgTitle')} - ${siteName}`,
  ogDescription: t('seo.auspiciousDatetimeOgDesc'),
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
        name: `${t('seo.auspiciousDatetimeTitle')} - ${siteName}`,
        url: pageUrl.value,
        description: t('seo.auspiciousDatetimeDesc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: category.tools.map((tool, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: t(tool.titleKey),
            url: seoUrl(tool.path),
          })),
        },
      }),
    },
  ],
}))
</script>
