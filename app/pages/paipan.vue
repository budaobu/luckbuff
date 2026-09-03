<template>
  <TopicToolDirectory
    :category="category"
    title-key="paipanTopic.title"
    eyebrow="Charting Tools"
    text-namespace="paipanTopic"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="3"
    :faq-count="4"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = '/paipan'
const category = useToolCategories().value.find(item => item.id === 'paipan')!

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.paipanTitle')} - ${siteName}`,
  description: t('seo.paipanDesc'),
  keywords: t('seo.paipanKeywords'),
  ogTitle: () => `${t('seo.paipanOgTitle')} - ${siteName}`,
  ogDescription: t('seo.paipanOgDesc'),
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
        name: `${t('seo.paipanTitle')} - ${siteName}`,
        url: `https://www.ososn.com${route}`,
        description: t('seo.paipanDesc'),
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
