<template>
  <BaziLieflatChartFrame
    :title="$t('baziPosterCharts.wuxingChartTitle')"
    :subtitle="$t('baziPosterCharts.wuxingChartSubtitle')"
    source="L14 HUNDRED FIELD · BAZI WUXING"
  >
    <svg
      ref="chartRef"
      viewBox="0 0 430 330"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="`${$t('baziPosterCharts.wuxingChartTitle')} · ${$t('baziPosterCharts.wuxingChartSubtitle')}`"
      :data-revealed="revealed"
      tabindex="0"
      @click="replay"
      @keydown.enter.prevent="replay"
      @keydown.space.prevent="replay"
    >
      <g
        v-for="cluster in clusters"
        :key="cluster.name"
      >
        <line
          v-for="spoke in cluster.spokes"
          :key="`spoke-${spoke.id}`"
          :x1="cluster.cx"
          :y1="cluster.cy"
          :x2="spoke.x"
          :y2="spoke.y"
          class="lf-fade"
          :stroke="theme.track"
          stroke-width="0.8"
          :style="{ '--lf-delay': `${spoke.delay}ms` }"
        />
        <circle
          v-for="dot in cluster.dots"
          :key="dot.id"
          :cx="dot.x"
          :cy="dot.y"
          :r="dot.r"
          class="lf-pop"
          :fill="cluster.shade"
          opacity="0.9"
          :style="{ '--lf-delay': `${dot.delay}ms` }"
        />
        <circle
          :cx="cluster.cx"
          :cy="cluster.cy"
          r="3"
          class="lf-pop"
          :fill="theme.ink"
          :style="{ '--lf-delay': `${cluster.delay}ms` }"
        />
        <text
          :x="cluster.cx"
          :y="cluster.labelY"
          class="lf-fade"
          :fill="theme.ink"
          font-family="Inter, 'Noto Sans SC', 'PingFang SC', sans-serif"
          font-size="11"
          font-weight="800"
          letter-spacing="0.06em"
          paint-order="stroke"
          :stroke="theme.card"
          stroke-width="4"
          text-anchor="middle"
          :style="{ '--lf-delay': `${cluster.delay + 240}ms` }"
        >
          {{ cluster.label }} · {{ cluster.count }}
        </text>
      </g>
      <text
        x="215"
        y="322"
        class="lf-fade"
        :fill="theme.soft"
        font-family="Inter, 'Noto Sans SC', 'PingFang SC', sans-serif"
        font-size="9"
        font-weight="600"
        letter-spacing="0.1em"
        text-anchor="middle"
        :style="{ '--lf-delay': '1100ms' }"
      >
        ONE DOT = ONE POINT · 100 TOTAL
      </text>
    </svg>
  </BaziLieflatChartFrame>
</template>

<script setup lang="ts">
import type { WuxingScore } from '~/types/bazi'
import { useLieflatChartReveal } from '~/composables/useLieflatChartReveal'
import { baziLieflatChartTheme as theme } from '~/utils/bazi/lieflat-chart-theme'

interface Props {
  scores: WuxingScore
}

interface FieldDot {
  id: string
  x: number
  y: number
  r: number
  delay: number
}

interface FieldCluster {
  name: string
  label: string
  count: number
  shade: string
  cx: number
  cy: number
  labelY: number
  dots: FieldDot[]
  spokes: FieldDot[]
  delay: number
}

const props = defineProps<Props>()
const { t } = useI18n()
const chartRef = ref<SVGSVGElement>()
const { revealed, replay } = useLieflatChartReveal(chartRef)

const positions = [
  { cx: 112, cy: 108, labelY: 156 },
  { cx: 248, cy: 76, labelY: 124 },
  { cx: 326, cy: 190, labelY: 238 },
  { cx: 120, cy: 234, labelY: 282 },
  { cx: 256, cy: 262, labelY: 310 },
]
const labelKeys = {
  木: 'bazi.wuxingWood',
  火: 'bazi.wuxingFire',
  土: 'bazi.wuxingEarth',
  金: 'bazi.wuxingMetal',
  水: 'bazi.wuxingWater',
} as const

function seeded(i: number, k: number) {
  return Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000
}

function exactCounts(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0)
  if (total <= 0) return values.map(() => 0)

  const counts = values.map(value => Math.floor((value / total) * 100))
  const remainders = values
    .map((value, index) => ({ index, remainder: ((value / total) * 100) - counts[index]! }))
    .sort((a, b) => b.remainder - a.remainder)

  let remaining = 100 - counts.reduce((sum, count) => sum + count, 0)
  for (const item of remainders) {
    if (remaining <= 0) break
    counts[item.index]! += 1
    remaining -= 1
  }
  return counts
}

const clusters = computed<FieldCluster[]>(() => {
  const entries = Object.entries(props.scores)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
  const counts = exactCounts(entries.map(item => item.value))

  return entries.map((entry, index) => {
    const count = counts[index] ?? 0
    const position = positions[index]!
    const dots: FieldDot[] = []
    const spokes: FieldDot[] = []

    for (let dotIndex = 0; dotIndex < count; dotIndex += 1) {
      const angle = dotIndex * 137.508 + index * 55
      const radius = 4 + Math.sqrt(dotIndex) * 4.7 + seeded(dotIndex + 1, index + 2) * 2.6
      const delay = index * 140 + dotIndex * 10
      const item: FieldDot = {
        id: `${entry.name}-${dotIndex}`,
        x: position.cx + radius * Math.cos((angle * Math.PI) / 180),
        y: position.cy + radius * Math.sin((angle * Math.PI) / 180),
        r: 1.6 + seeded(dotIndex + 2, index + 3) * 1.4,
        delay,
      }
      dots.push(item)
      if (dotIndex % 5 === 0) spokes.push({ ...item, id: `${entry.name}-spoke-${dotIndex}` })
    }

    return {
      name: entry.name,
      label: t(labelKeys[entry.name as keyof typeof labelKeys] ?? 'bazi.wuxingStrength'),
      count,
      shade: theme.ramp[index] ?? theme.ink,
      ...position,
      dots,
      spokes,
      delay: index * 140,
    }
  })
})

</script>

<style scoped>
.lf-pop {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(0);
  transition:
    opacity 0.45s ease,
    transform 0.5s cubic-bezier(0.2, 0.7, 0.3, 1);
  transition-delay: var(--lf-delay, 0ms);
}

.lf-fade {
  opacity: 0;
  transition: opacity 0.7s ease;
  transition-delay: var(--lf-delay, 0ms);
}

svg[data-revealed='true'] .lf-pop {
  opacity: 0.9;
  transform: scale(1);
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
    transform: none;
    transition: none;
  }
}
</style>
