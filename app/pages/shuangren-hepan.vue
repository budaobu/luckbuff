<template>
  <TopicToolDirectory
    :category="category"
    title-key="shuangrenHepan.title"
    eyebrow="Pair Charts"
    text-namespace="shuangrenHepan"
    :recommended-label="$t('seeking.recommended')"
    :guide-count="3"
    :faq-count="4"
  />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = '/shuangren-hepan'
const category = useToolCategories().value.find(item => item.id === 'shuangren-hepan')!

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.shuangrenHepanTitle')} - ${siteName}`,
  description: t('seo.shuangrenHepanDesc'),
  keywords: t('seo.shuangrenHepanKeywords'),
  ogTitle: () => `${t('seo.shuangrenHepanOgTitle')} - ${siteName}`,
  ogDescription: t('seo.shuangrenHepanOgDesc'),
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
        name: `${t('seo.shuangrenHepanTitle')} - ${siteName}`,
        url: `https://www.ososn.com${route}`,
        description: t('seo.shuangrenHepanDesc'),
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
