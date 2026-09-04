<template>
  <div class="relative overflow-hidden">
    <div class="directory-ambient" aria-hidden="true" />

    <div class="relative z-10 mx-auto w-full max-w-7xl px-6 py-14 md:py-16">
      <ToolDirectoryHero
        title-key="toolDirectories.chartTitle"
        subtitle-key="toolDirectories.chartSubtitle"
        count-label-key="toolDirectories.toolCount"
        :count="tools.length"
      />

      <ToolDirectoryGrid :tools="tools" class="mt-12" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const tools = useChartingTools()
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.chartTitle')} - ${siteName}`,
  description: t('seo.chartDesc'),
  keywords: t('seo.chartKeywords'),
  ogTitle: () => `${t('seo.chartOgTitle')} - ${siteName}`,
  ogDescription: t('seo.chartOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/chart',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.chartTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/chart',
        description: t('seo.chartDesc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: tools.value.map((tool, index) => ({
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

<style scoped>
.directory-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(58rem 32rem at 12% 0%, color-mix(in srgb, var(--accent) 7%, transparent), transparent 62%),
    linear-gradient(90deg, color-mix(in srgb, var(--border-light) 42%, transparent) 1px, transparent 1px);
  background-size: auto, 72px 100%;
  mask-image: linear-gradient(180deg, black, transparent 78%);
}
</style>
