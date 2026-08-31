<template>
  <TopicToolDirectory
    :category="category"
    title-key="psychologicalTest.title"
    eyebrow="Psychological Test"
    text-namespace="psychologicalTest"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="3"
    :faq-count="4"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = '/psychological-test'
const category = useToolCategories().value.find(item => item.id === 'psychological-test')!

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.psychologicalTestTitle')} - ${siteName}`,
  description: t('seo.psychologicalTestDesc'),
  keywords: t('seo.psychologicalTestKeywords'),
  ogTitle: () => `${t('seo.psychologicalTestOgTitle')} - ${siteName}`,
  ogDescription: t('seo.psychologicalTestOgDesc'),
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
        name: `${t('seo.psychologicalTestTitle')} - ${siteName}`,
        url: `https://www.ososn.com${route}`,
        description: t('seo.psychologicalTestDesc'),
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
