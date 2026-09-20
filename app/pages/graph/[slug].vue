<template>
  <GraphChartMount
    :key="slug"
    :chart="chart"
  />
</template>

<script setup lang="ts">
import graphData from '~/data/graph-charts.json'

interface GraphChart {
  id: string
  cat: string
  badge: string
  title: string
  desc: string
  fullDesc: string
  quote?: string
}

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const siteName = useRuntimeConfig().public.siteName
const slug = computed(() => String(route.params.slug || ''))

const charts = graphData.charts as GraphChart[]
const chart = charts.find(item => item.id === slug.value)

if (!chart) {
  throw createError({ statusCode: 404, statusMessage: 'Graph not found' })
}

const pageUrl = useLocalizedSeoUrl(`/graph/${chart.id}`)

useSeoMeta({
  title: () => `${chart.title} - ${siteName}`,
  description: chart.fullDesc,
  ogTitle: () => `${chart.title} - ${siteName}`,
  ogDescription: chart.fullDesc,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'article',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: chart.title,
      description: chart.fullDesc,
      url: pageUrl.value,
      articleSection: chart.cat,
      keywords: [chart.cat, chart.badge, chart.title].join(', '),
    }),
  }],
}))
</script>
