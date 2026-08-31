<template>
  <TopicToolDirectory
    :category="category"
    title-key="naming.title"
    eyebrow="Naming"
    text-namespace="naming"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="3"
    :faq-count="4"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = '/naming'
const category = useToolCategories().value.find(item => item.id === 'naming')!

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.namingTitle')} - ${siteName}`,
  description: t('seo.namingDesc'),
  keywords: t('seo.namingKeywords'),
  ogTitle: () => `${t('seo.namingOgTitle')} - ${siteName}`,
  ogDescription: t('seo.namingOgDesc'),
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
        name: `${t('seo.namingTitle')} - ${siteName}`,
        url: `https://www.ososn.com${route}`,
        description: t('seo.namingDesc'),
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
