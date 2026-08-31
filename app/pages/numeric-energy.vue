<template>
  <TopicToolDirectory
    :category="category"
    title-key="numericEnergyTopic.title"
    eyebrow="Numeric Energy"
    text-namespace="numericEnergyTopic"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="3"
    :faq-count="4"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const category = useToolCategories().value.find(item => item.id === 'numeric-energy')!

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('numericEnergyTopic.seoTitle')} - ${siteName}`,
  description: t('numericEnergyTopic.seoDescription'),
  keywords: t('numericEnergyTopic.seoKeywords'),
  ogTitle: () => `${t('numericEnergyTopic.title')} | ${siteName}`,
  ogDescription: t('numericEnergyTopic.seoDescription'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/numeric-energy',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('numericEnergyTopic.seoTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/numeric-energy',
        description: t('numericEnergyTopic.seoDescription'),
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
