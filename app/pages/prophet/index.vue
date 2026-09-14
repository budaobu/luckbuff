<template>
  <TopicToolDirectory
    :category="category"
    title-key="prophet.title"
    eyebrow="Prophet"
    text-namespace="prophet"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="0"
    :faq-count="0"
    :show-intro="false"
    :show-support="false"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const category = useToolCategories().value.find(item => item.id === 'prophet')!

const siteName = 'ososn'

const pageUrl = useLocalizedSeoUrl('/prophet')
const seoUrl = useLocalizedSeoPath()

useSeoMeta({
  title: () => `${t('seo.prophetTitle')} - ${siteName}`,
  description: t('seo.prophetDesc'),
  keywords: t('seo.prophetKeywords'),
  ogTitle: () => `${t('seo.prophetOgTitle')} - ${siteName}`,
  ogDescription: t('seo.prophetOgDesc'),
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
        name: `${t('seo.prophetTitle')} - ${siteName}`,
        url: pageUrl.value,
        description: t('seo.prophetDesc'),
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
