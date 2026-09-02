<template>
  <BaziLieflatChartFrame
    :title="$t('baziPosterCharts.dayunLineChartTitle')"
    :subtitle="$t('baziPosterCharts.dayunLineChartSubtitle')"
    source="F2 HAIRLINE LINE · DA YUN SCORES"
  >
    <svg
      ref="chartRef"
      viewBox="0 0 430 310"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="`${$t('baziPosterCharts.dayunLineChartTitle')} · ${$t('baziPosterCharts.dayunLineChartSubtitle')}`"
      :data-revealed="revealed"
      tabindex="0"
      @click="replay"
      @keydown.enter.prevent="replay"
      @keydown.space.prevent="replay"
    >
      <line
        v-for="floor in floors"
        :key="floor.id"
        :x1="floor.x"
        :y1="252"
        :x2="floor.x"
        :y2="243"
        class="lf-fade"
        :stroke="theme.track"
        stroke-width="0.8"
        :style="{ '--lf-delay': `${floor.delay}ms` }"
      />
      <line
        x1="28"
        y1="252"
        x2="402"
        y2="252"
        class="lf-fade"
        :stroke="theme.grid"
        stroke-width="1"
      />
      <path
        :d="path"
        class="lf-draw"
        fill="none"
        pathLength="1"
        :stroke="theme.ink"
        stroke-width="1.3"
      />
      <circle
        v-for="point in points"
        :key="point.id"
        :cx="point.x"
        :cy="point.y"
        :r="point.isPeak ? 5 : 3.4"
        class="lf-pop"
        :fill="point.isCurrent ? theme.card : theme.ink"
        :stroke="theme.ink"
        :stroke-width="point.isCurrent ? 1.4 : 0"
        :style="{ '--lf-delay': `${point.delay}ms` }"
      >
        <title>{{ point.title }}</title>
      </circle>
      <text
        v-for="peak in peakLabels"
        :key="peak.id"
        :x="peak.x"
        :y="peak.y - 11"
        class="lf-fade"
        :fill="theme.ink"
        font-family="Inter, 'Noto Sans SC', 'PingFang SC', sans-serif"
        font-size="11"
        font-weight="800"
        text-anchor="middle"
        paint-order="stroke"
        :stroke="theme.card"
        stroke-width="4"
        :style="{ '--lf-delay': `${peak.delay}ms` }"
      >
        {{ peak.value }}
      </text>
      <text
        v-for="label in axisLabels"
        :key="label.id"
        :x="label.x"
        :y="label.y"
        class="lf-fade"
        :fill="theme.soft"
        font-family="Inter, 'Noto Sans SC', 'PingFang SC', sans-serif"
        :font-size="label.kind === 'ganZhi' ? 10 : 8.5"
        font-weight="600"
        text-anchor="middle"
        :style="{ '--lf-delay': `${label.delay}ms` }"
      >
        {{ label.text }}
      </text>
      <text
        x="215"
        y="300"
        class="lf-fade"
        :fill="theme.soft"
        font-family="Inter, 'Noto Sans SC', 'PingFang SC', sans-serif"
        font-size="9"
        font-weight="600"
        letter-spacing="0.1em"
        text-anchor="middle"
        :style="{ '--lf-delay': '1000ms' }"
      >
        ONE DOT = ONE LUCK PERIOD · HOLLOW = CURRENT
      </text>
    </svg>
  </BaziLieflatChartFrame>
</template>

<script setup lang="ts">
import { useLieflatChartReveal } from '~/composables/useLieflatChartReveal'
import { baziLieflatChartTheme as theme } from '~/utils/bazi/lieflat-chart-theme'

interface DaYunDatum {
  index: number
  ganZhi: string
  ageRange: [number, number]
  score: number
  isCurrent: boolean
}

interface Props {
  points: DaYunDatum[]
}

interface ChartPoint {
  id: string
  x: number
  y: number
  value: number
  isCurrent: boolean
  isPeak: boolean
  delay: number
  title: string
}

const props = defineProps<Props>()
const chartRef = ref<SVGSVGElement>()
const { revealed, replay } = useLieflatChartReveal(chartRef)

const chartPoints = computed(() => props.points.map((point) => ({
  ...point,
  score: Math.max(0, Math.min(100, Math.round(point.score))),
})))

const x = (index: number) => {
  const count = Math.max(props.points.length, 1)
  return count === 1 ? 215 : 34 + index * (368 / (count - 1))
}

const mapScore = (value: number) => 248 - value * 1.7

const points = computed<ChartPoint[]>(() => {
  const values = chartPoints.value.map(point => point.score)
  const peaks: number[] = []
  for (const index of [...values.keys()].sort((a, b) => values[b]! - values[a]!)) {
    if (peaks.every(peak => Math.abs(peak - index) >= 2)) peaks.push(index)
    if (peaks.length === 2) break
  }

  return chartPoints.value.map((point, index) => ({
    id: `dayun-${point.index}`,
    x: x(index),
    y: mapScore(point.score),
    value: point.score,
    isCurrent: point.isCurrent,
    isPeak: peaks.includes(index),
    delay: 180 + index * 65,
    title: `${point.ganZhi} · ${point.ageRange[0]}-${point.ageRange[1]} · ${point.score}`,
  }))
})

const path = computed(() => points.value
  .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
  .join(' '))

const peakLabels = computed(() => points.value
  .filter(point => point.isPeak)
  .map(point => ({ ...point, id: `${point.id}-label`, delay: point.delay + 180 })))

const floors = computed(() => chartPoints.value.map((point, index) => ({
  id: `floor-${point.index}`,
  x: x(index),
  delay: index * 45,
})))

const axisLabels = computed(() => chartPoints.value.flatMap((point, index) => {
  const position = x(index)
  const labels = [{
    id: `gan-${point.index}`,
    kind: 'ganZhi',
    x: position,
    y: 272,
    text: point.ganZhi,
    delay: 180 + index * 45,
  }]

  if (index === 0 || index === Math.floor((chartPoints.value.length - 1) / 2) || index === chartPoints.value.length - 1) {
    labels.push({
      id: `age-${point.index}`,
      kind: 'age',
      x: position,
      y: 284,
      text: `${point.ageRange[0]}-${point.ageRange[1]}`,
      delay: 220 + index * 45,
    })
  }
  return labels
}))

</script>

<style scoped>
.lf-pop,
.lf-fade {
  opacity: 0;
  transition: opacity 0.7s ease;
  transition-delay: var(--lf-delay, 0ms);
}

.lf-pop {
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(0);
  transition:
    opacity 0.45s ease,
    transform 0.5s cubic-bezier(0.2, 0.7, 0.3, 1);
}

.lf-draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.15s cubic-bezier(0.4, 0, 0.2, 1);
}

svg[data-revealed='true'] .lf-pop {
  opacity: 1;
  transform: scale(1);
}

svg[data-revealed='true'] .lf-fade {
  opacity: 1;
}

svg[data-revealed='true'] .lf-draw {
  stroke-dashoffset: 0;
}

svg:focus-visible {
  outline: 2px solid var(--bzp-red);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .lf-pop,
  .lf-fade,
  .lf-draw {
    opacity: 1;
    transform: none;
    stroke-dasharray: none;
    stroke-dashoffset: 0;
    transition: none;
  }
}
</style>
