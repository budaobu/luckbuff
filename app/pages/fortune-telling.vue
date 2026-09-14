<template>
  <TopicToolDirectory
    :category="category"
    title-key="fortuneTelling.title"
    eyebrow="Fortune Telling"
    text-namespace="fortuneTelling"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="3"
    :faq-count="4"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = '/fortune-telling'

const pageUrl = useLocalizedSeoUrl('/fortune-telling')
const seoUrl = useLocalizedSeoPath()
const category = useToolCategories().value.find(item => item.id === 'fortune-telling')!

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.fortuneTellingTitle')} - ${siteName}`,
  description: t('seo.fortuneTellingDesc'),
  keywords: t('seo.fortuneTellingKeywords'),
  ogTitle: () => `${t('seo.fortuneTellingOgTitle')} - ${siteName}`,
  ogDescription: t('seo.fortuneTellingOgDesc'),
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
        name: `${t('seo.fortuneTellingTitle')} - ${siteName}`,
        url: pageUrl.value,
        description: t('seo.fortuneTellingDesc'),
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
