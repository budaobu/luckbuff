<template>
  <div class="graph-app graph-detail-app">
    <section id="detailPanel" class="detail-panel open" :data-chart-id="chart.id">
      <div class="detail-inner">
        <NuxtLink
          id="detailBack"
          :to="localePath('/graph')"
          :no-prefetch="true"
          class="detail-back"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" aria-hidden="true" />
          {{ $t('graph.back') }}
        </NuxtLink>

        <div class="detail-head">
          <span id="detailEye" class="eyebrow">{{ chart.cat }} · {{ chart.badge }}</span>
          <h1 id="detailTitle" class="serif">{{ chart.title }}</h1>
          <p id="detailDesc">{{ chart.fullDesc }}</p>
        </div>

        <div class="detail-body">
          <div class="viz-area">
            <div id="vizCanvas" />
            <div id="liveTip" class="live-tip">——</div>
          </div>
          <div id="explainArea">
            <h2>{{ $t('graph.principle') }}</h2>
            <p>{{ chart.fullDesc }}</p>
            <blockquote v-if="chart.quote">{{ chart.quote }}</blockquote>
          </div>
        </div>
      </div>

      <AppFooter />
    </section>
  </div>
</template>

<script setup lang="ts">
import { mountGraph } from '~/utils/graph/chart-runtime'

interface GraphChart {
  id: string
  cat: string
  badge: string
  title: string
  fullDesc: string
  quote?: string
}

const props = defineProps<{ chart: GraphChart }>()
const localePath = useLocalePath()

onMounted(() => {
  mountGraph(props.chart.id, { renderIndex: false })
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.graph-detail-app :deep(.detail-panel) {
  z-index: 40;
}

.graph-detail-app :deep(.detail-inner) {
  padding-top: 96px;
}
</style>

<style src="~/assets/css/graph-charts.css" />
