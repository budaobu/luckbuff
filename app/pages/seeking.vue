<template>
  <TopicToolDirectory
    :category="category"
    title-key="seeking.title"
    eyebrow="Seeking"
    text-namespace="seeking"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="3"
    :faq-count="4"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = '/seeking'
const category = useToolCategories().value.find(item => item.id === 'seeking')!

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.seekingTitle')} - ${siteName}`,
  description: t('seo.seekingDesc'),
  keywords: t('seo.seekingKeywords'),
  ogTitle: () => `${t('seo.seekingOgTitle')} - ${siteName}`,
  ogDescription: t('seo.seekingOgDesc'),
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
        name: `${t('seo.seekingTitle')} - ${siteName}`,
        url: `https://www.ososn.com${route}`,
        description: t('seo.seekingDesc'),
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
