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

const pageUrl = useLocalizedSeoUrl('/cezi')
const seoUrl = useLocalizedSeoPath()
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
        name: `${t('seo.ceziTitle')} - ${siteName}`,
        url: pageUrl.value,
        description: t('seo.ceziDesc'),
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
