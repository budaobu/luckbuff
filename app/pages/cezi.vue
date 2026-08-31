<template>
  <TopicToolDirectory
    :category="category"
    title-key="cezi.title"
    eyebrow="Character Analysis"
    text-namespace="cezi"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="3"
    :faq-count="4"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = '/cezi'
const category = useToolCategories().value.find(item => item.id === 'cezi')!

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.ceziTitle')} - ${siteName}`,
  description: t('seo.ceziDesc'),
  keywords: t('seo.ceziKeywords'),
  ogTitle: () => `${t('seo.ceziOgTitle')} - ${siteName}`,
  ogDescription: t('seo.ceziOgDesc'),
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
        name: `${t('seo.ceziTitle')} - ${siteName}`,
        url: `https://www.ososn.com${route}`,
        description: t('seo.ceziDesc'),
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
