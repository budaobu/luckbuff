<template>
  <TopicToolDirectory
    :category="category"
    title-key="astrology.title"
    eyebrow="Astrology"
    text-namespace="astrology"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="3"
    :faq-count="4"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const category = useToolCategories().value.find(item => item.id === 'astrology')!

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.astrologyTitle')} - ${siteName}`,
  description: t('seo.astrologyDesc'),
  keywords: t('seo.astrologyKeywords'),
  ogTitle: () => `${t('seo.astrologyOgTitle')} - ${siteName}`,
  ogDescription: t('seo.astrologyOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/astrology',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.astrologyTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/astrology',
        description: t('seo.astrologyDesc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: category.tools.map((tool, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: t(tool.titleKey),
            url: `https://www.ososn.com${tool.path}`,
          })),
        },
      }),
    },
  ],
}))
</script>
