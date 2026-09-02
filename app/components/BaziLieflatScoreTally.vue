<template>
  <BaziLieflatChartFrame
    :title="$t('baziPosterCharts.scoreChartTitle')"
    :subtitle="$t('baziPosterCharts.scoreChartSubtitle')"
    source="L15 BALLOT TALLY · AI FORTUNE SCORES"
  >
    <svg
      ref="chartRef"
      viewBox="0 0 430 350"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="`${$t('baziPosterCharts.scoreChartTitle')} · ${$t('baziPosterCharts.scoreChartSubtitle')}`"
      :data-revealed="revealed"
      tabindex="0"
      @click="replay"
      @keydown.enter.prevent="replay"
      @keydown.space.prevent="replay"
    >
      <g
        v-for="row in rows"
        :key="row.key"
        :aria-label="`${row.label}: ${row.value} / 100`"
      >
        <title>{{ row.label }} · {{ row.value }} / 100</title>
        <text
          :x="28"
          :y="row.base - 16"
          class="lf-fade"
          :fill="theme.soft"
          font-family="Inter, 'Noto Sans SC', 'PingFang SC', sans-serif"
          font-size="10"
          font-weight="700"
          letter-spacing="0.04em"
          :style="{ '--lf-delay': `${row.delay}ms` }"
        >
          {{ row.label }}
        </text>
        <line
          :x1="28"
          :y1="row.base"
          :x2="404"
          :y2="row.base"
          class="lf-fade"
          :stroke="theme.grid"
          stroke-width="0.8"
          :style="{ '--lf-delay': `${row.delay}ms` }"
        />
        <line
          v-for="tick in row.ticks"
          :key="tick.id"
          :x1="tick.x"
          :y1="row.base"
          :x2="tick.x"
          :y2="tick.y"
          class="lf-fade"
          :stroke="tick.picked ? theme.ink : theme.track"
          :stroke-width="tick.picked ? 1 : 0.7"
          :style="{ '--lf-delay': `${tick.delay}ms` }"
        />
        <circle
          v-for="marker in row.markers"
          :key="marker.id"
          :cx="marker.x"
          :cy="row.base + 5"
          r="1"
          class="lf-fade"
          :fill="theme.faint"
          :style="{ '--lf-delay': `${marker.delay}ms` }"
        />
        <text
          :x="row.valueX"
          :y="row.base - 7"
          class="lf-fade"
          :fill="theme.ink"
          font-family="Inter, 'Noto Sans SC', 'PingFang SC', sans-serif"
          font-size="12"
          font-weight="800"
          :text-anchor="row.value >= 90 ? 'end' : 'start'"
          paint-order="stroke"
          :stroke="theme.card"
          stroke-width="4"
          :style="{ '--lf-delay': `${row.delay + 450}ms` }"
        >
          {{ row.value }}
        </text>
      </g>
      <text
        x="215"
        y="340"
        class="lf-fade"
        :fill="theme.soft"
        font-family="Inter, 'Noto Sans SC', 'PingFang SC', sans-serif"
        font-size="9"
        font-weight="600"
        letter-spacing="0.1em"
        text-anchor="middle"
        :style="{ '--lf-delay': '1100ms' }"
      >
        ONE TICK = ONE POINT · DOTS MARK EVERY TENTH
      </text>
    </svg>
  </BaziLieflatChartFrame>
</template>

<script setup lang="ts">
import { useLieflatChartReveal } from '~/composables/useLieflatChartReveal'
import { baziLieflatChartTheme as theme } from '~/utils/bazi/lieflat-chart-theme'

interface ScoreItem {
  key: string
  label: string
  value: number
}

interface Props {
  items: ScoreItem[]
}

interface ScoreTick {
  id: string
  x: number
  y: number
  picked: boolean
  delay: number
}

interface ScoreMarker {
  id: string
  x: number
  delay: number
}

interface ScoreRow {
  key: string
  label: string
  value: number
  base: number
  delay: number
  valueX: number
  ticks: ScoreTick[]
  markers: ScoreMarker[]
}

const props = defineProps<Props>()
const chartRef = ref<SVGSVGElement>()
const { revealed, replay } = useLieflatChartReveal(chartRef)

function seeded(i: number, k: number) {
  return Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000
}

const rows = computed<ScoreRow[]>(() => props.items.map((item, index) => {
  const base = 60 + index * 58
  const value = Math.max(0, Math.min(100, Math.round(item.value)))
  const ticks: ScoreTick[] = Array.from({ length: 100 }, (_, tickIndex) => {
    const picked = tickIndex < value
    const height = picked ? 11 + seeded(tickIndex + 1, index + 2) * 4 : 5 + seeded(tickIndex + 1, index + 5) * 2
    return {
      id: `${item.key}-${tickIndex}`,
      x: 28 + tickIndex * 3.74,
      y: base - height,
      picked,
      delay: index * 100 + tickIndex * 5,
    }
  })
  const markers = Array.from({ length: 10 }, (_, markerIndex) => ({
    id: `${item.key}-marker-${markerIndex}`,
    x: 28 + markerIndex * 37.4,
    delay: index * 100 + markerIndex * 50,
  }))

  return {
    ...item,
    value,
    base,
    delay: index * 100,
    valueX: value >= 90 ? 402 : 28 + Math.max(value - 1, 0) * 3.74 + 10,
    ticks,
    markers,
  }
}))

</script>

<style scoped>
.lf-pop,
.lf-fade {
  opacity: 0;
  transition: opacity 0.65s ease;
  transition-delay: var(--lf-delay, 0ms);
}

svg[data-revealed='true'] .lf-fade {
  opacity: 1;
}

svg:focus-visible {
  outline: 2px solid var(--bzp-red);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .lf-pop,
  .lf-fade {
    opacity: 1;
    transition: none;
  }
}
</style>
