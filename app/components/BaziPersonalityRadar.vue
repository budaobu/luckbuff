<template>
  <div class="relative rounded-2xl bg-[var(--surface-input)] backdrop-blur-sm overflow-hidden">
    <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-purple-border)] to-transparent" />
    <div class="relative z-10 p-5">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-[var(--accent-purple-faint)] border border-[var(--accent-purple-border)] flex items-center justify-center text-[var(--accent-purple-text)]">
          <UIcon name="i-heroicons-chart-pie" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('baziPersonalityMap.radarTitle') }}</h3>
          <p class="text-[11px] text-[var(--text-faint)] mt-0.5">{{ $t('baziPersonalityMap.radarSubtitle') }}</p>
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-5 items-stretch">
        <div class="flex-1 w-full max-w-[280px] h-56 relative self-center">
          <Radar
            v-if="chartData"
            :data="chartData"
            :options="options"
          />
        </div>

        <div class="flex-1 w-full space-y-2">
          <div
            v-for="(item, idx) in dimensionItems"
            :key="item.key"
            class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 transition-colors hover:bg-[var(--surface-card-hover)]"
          >
            <div class="flex items-center gap-2 mb-1">
              <div
                class="w-2 h-2 rounded-full shrink-0"
                :style="{ background: colors[idx % colors.length] }"
              />
              <span class="text-xs text-[var(--text-muted)] w-16 shrink-0">{{ item.label }}</span>
              <div class="flex-1 h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700 ease-out"
                  :style="{ width: `${item.score}%`, background: colors[idx % colors.length] }"
                />
              </div>
              <span
                class="text-xs font-bold w-7 text-right shrink-0"
                :style="{ color: colors[idx % colors.length] }"
              >
                {{ item.score }}
              </span>
            </div>
            <p class="text-[11px] text-[var(--text-muted)] leading-relaxed pl-4">
              {{ item.tip }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="absolute inset-0 rounded-2xl border border-[var(--border-light)] pointer-events-none" />
    <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-purple-faint)] to-transparent" />
  </div>
</template>

<script setup lang="ts">
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { getDimensionMeta, getLevel, SHISHEN_DIMENSION_MAP } from '~/data/bazi-personality-map'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Props {
  scores: Record<string, number>
}

const props = defineProps<Props>()
const { t, locale } = useI18n()

const colors = [
  '#ef4444', '#f97316', '#f59e0b', '#c9a227',
  '#84cc16', '#10b981', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#d946ef',
]

const dimensionItems = computed(() => {
  const order = Object.values(SHISHEN_DIMENSION_MAP)
  return order.map((key) => {
    const meta = getDimensionMeta(key)
    const score = props.scores[key] ?? 0
    const level = getLevel(score)
    const label = meta?.labels[locale.value] || meta?.labels['zh-CN'] || key
    const tip = meta?.tips[locale.value]?.[level] || meta?.tips['zh-CN']?.[level] || ''
    return { key, label, score, tip }
  })
})

const chartData = computed(() => ({
  labels: dimensionItems.value.map(item => item.label),
  datasets: [
    {
      label: t('baziPersonalityMap.radarTitle'),
      data: dimensionItems.value.map(item => item.score),
      backgroundColor: 'rgba(139, 92, 246, 0.12)',
      borderColor: '#8b5cf6',
      pointBackgroundColor: colors,
      pointBorderColor: '#1a1612',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
    },
  ],
}))

const options: any = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: {
        display: false,
        stepSize: 20,
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.06)',
      },
      pointLabels: {
        color: '#e8e0d0',
        font: { size: 10, weight: '500' },
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 12, 9, 0.95)',
      titleColor: '#c9a227',
      bodyColor: '#e8e0d0',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      borderWidth: 1,
      padding: 8,
      displayColors: false,
      callbacks: {
        label: (ctx: any) => `${ctx.raw}`,
      },
    },
  },
}
</script>
