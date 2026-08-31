<template>
  <TopicToolDirectory
    :category="category"
    title-key="drawALotTopic.title"
    eyebrow="Draw a Lot"
    text-namespace="drawALotTopic"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="3"
    :faq-count="4"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = '/draw-a-lot'
const category = useToolCategories().value.find(item => item.id === 'draw-a-lot')!

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.drawALotTitle')} - ${siteName}`,
  description: t('seo.drawALotDesc'),
  keywords: t('seo.drawALotKeywords'),
  ogTitle: () => `${t('seo.drawALotOgTitle')} - ${siteName}`,
  ogDescription: t('seo.drawALotOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: `https://www.ososn.com${route}`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.drawALotTitle')} - ${siteName}`,
        url: `https://www.ososn.com${route}`,
        description: t('seo.drawALotDesc'),
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
