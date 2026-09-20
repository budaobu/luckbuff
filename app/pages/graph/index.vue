<template>
  <div class="graph-app">
    <div class="charts-app graph-shell">
      <header v-reveal class="graph-head">
        <p class="graph-eyebrow">{{ $t('graph.eyebrow') }}</p>
        <h1 class="serif">{{ $t('graph.title') }}</h1>
        <p>{{ $t('graph.description') }}</p>
      </header>

      <div class="charts-index-head">
        <div>
          <span>{{ $t('graph.overview') }}</span>
          <strong>{{ $t('graph.count', { n: charts.length }) }}</strong>
        </div>
        <i aria-hidden="true" />
        <p>{{ $t('graph.browseHint') }}</p>
      </div>

      <div class="chips graph-chips" role="group" :aria-label="$t('graph.categories')">
        <button
          v-for="category in categoryOptions"
          :key="category"
          type="button"
          class="chip"
          :class="{ on: activeCategory === category }"
          :aria-pressed="activeCategory === category"
          @click="activeCategory = category"
        >
          <span>{{ categoryLabel(category) }}</span>
          <small>{{ category === 'all' ? charts.length : charts.filter(chart => chart.cat === category).length }}</small>
        </button>
      </div>

      <div class="charts-grid">
        <section
          v-for="group in visibleGroups"
          :key="group.title"
          v-reveal
          class="chart-group"
          :style="{ '--group-color': group.meta.color }"
        >
          <header class="chart-group-head">
            <div class="chart-group-index">{{ group.meta.no }}</div>
            <div class="chart-group-title">
              <span>{{ categoryLabel(group.title) }}</span>
              <small>{{ group.meta.sub }}</small>
            </div>
            <div class="chart-group-count">{{ String(group.charts.length).padStart(2, '0') }} {{ $t('graph.itemUnit') }}</div>
          </header>

          <div class="chart-group-grid">
            <NuxtLink
              v-for="(chart, index) in group.charts"
              :key="chart.id"
              v-reveal="{ delay: index % 4 }"
              :to="localePath(`/graph/${chart.id}`)"
              :no-prefetch="true"
              class="chart-card"
              :style="{ '--card-accent': group.meta.color, transitionDelay: `${Math.min(index, 3) * 55}ms` }"
              :aria-label="$t('graph.openAria', { title: chart.title })"
            >
              <div class="chart-card-visual" aria-hidden="true">
                <span class="cover-series">OSOSN · {{ group.meta.no }}</span>
                <span class="cover-index">{{ String(index + 1).padStart(2, '0') }}</span>
                <div class="cover-mark">{{ coverMarks[chart.id] }}</div>
                <div class="glyph" v-html="coverDiagrams[chart.id] || chart.thumb" />
                <span class="cover-seal">
                  {{ $t('graph.sealTop') }}<br>{{ $t('graph.sealBottom') }}
                </span>
              </div>
              <div class="chart-card-copy">
                <span class="badge">{{ chart.badge }}</span>
                <h3 class="serif">{{ chart.title }}</h3>
                <p>{{ chart.desc }}</p>
              </div>
              <div class="go-row">
                <span class="cat-tag">{{ $t('graph.interactiveTag') }}</span>
                <span class="go-arrow" aria-hidden="true">{{ $t('graph.enter') }} <b>›</b></span>
              </div>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import graphData from '~/data/graph-charts.json'

interface GraphChart {
  id: string
  cat: string
  badge: string
  title: string
  desc: string
  thumb: string
  fullDesc: string
  quote?: string
}

interface GraphGroup {
  no: string
  sub: string
  color: string
}

const { t } = useI18n()
const localePath = useLocalePath()
const siteName = useRuntimeConfig().public.siteName

const charts = graphData.charts as GraphChart[]
const categories = graphData.categories as string[]
const groups = graphData.groups as Record<string, GraphGroup>
const coverMarks = graphData.coverMarks as Record<string, string>
const coverDiagrams = graphData.coverDiagrams as Record<string, string>
const activeCategory = ref('all')

function categoryLabel(category: string) {
  return category === 'all' ? t('graph.all') : t(`graph.category.${category}`)
}

const categoryOptions = computed(() => ['all', ...categories])
const visibleGroups = computed(() => categories
  .map(category => ({
    title: category,
    meta: groups[category]!,
    charts: charts.filter(chart => chart.cat === category
      && (activeCategory.value === 'all' || activeCategory.value === category)),
  }))
  .filter(group => group.charts.length > 0))

const pageUrl = useLocalizedSeoUrl('/graph')
const seoPath = useLocalizedSeoPath()

useSeoMeta({
  title: () => `${t('graph.seoTitle')} - ${siteName}`,
  description: t('graph.seoDescription'),
  keywords: t('graph.keywords'),
  ogTitle: () => `${t('graph.seoTitle')} - ${siteName}`,
  ogDescription: t('graph.seoDescription'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${t('graph.seoTitle')} - ${siteName}`,
      description: t('graph.seoDescription'),
      url: pageUrl.value,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: charts.length,
        itemListElement: charts.map((chart, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: chart.title,
          url: seoPath(`/graph/${chart.id}`),
        })),
      },
    }),
  }],
}))
</script>

<style scoped>
.graph-shell {
  padding: 96px 24px 84px;
}

.graph-head {
  max-width: 760px;
  margin: 0 auto 48px;
  text-align: center;
}

.graph-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--cinnabar);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.22em;
}

.graph-head h1 {
  margin: 14px 0 12px;
  color: var(--ink);
  font-size: clamp(38px, 5vw, 56px);
  font-weight: 400;
  letter-spacing: 0.08em;
}

.graph-head p:last-child {
  margin: 0 auto;
  max-width: 620px;
  color: var(--ink-2);
  font-size: 15px;
}

.graph-chips {
  justify-content: center;
}

@media (max-width: 760px) {
  .graph-shell {
    padding: 74px 18px 64px;
  }

  .graph-head {
    margin-bottom: 34px;
  }
}
</style>

<style src="~/assets/css/graph-charts.css" />
