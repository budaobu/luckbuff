<template>
  <GlowCard :title="$t('bazi.dayunChart')" icon="i-heroicons-chart-bar">
    <div class="h-64">
      <Bar
        v-if="chartData"
        :data="chartData"
        :options="options"
      />
    </div>
  </GlowCard>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import type { DaYun } from '~/types/bazi'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Props {
  dayuns: DaYun[]
}

const props = defineProps<Props>()
const { t } = useI18n()

const currentYear = new Date().getFullYear()
const currentAge = computed(() => {
  // 简化：从第一个大运推算出生年
  if (props.dayuns.length === 0) return 30
  const firstDy = props.dayuns[0]
  return currentYear - (currentYear - firstDy.ageRange[0] + firstDy.index * 10 - firstDy.ageRange[0])
})

const chartData = computed(() => ({
  labels: props.dayuns.map(d => `${d.ageRange[0]}-${d.ageRange[1]}${t('bazi.chartAgeSuffix')}\n${d.gan}${d.zhi}`),
  datasets: [
    {
      label: t('bazi.fortuneScore'),
      data: props.dayuns.map(d => d.score ?? 0),
      backgroundColor: props.dayuns.map(d => {
        const score = d.score ?? 0
        if (d.ageRange[0] <= currentAge.value && d.ageRange[1] >= currentAge.value) {
          return score >= 60 ? 'rgba(201, 162, 39, 0.9)' : 'rgba(74, 85, 104, 0.9)'
        }
        return score >= 60 ? 'rgba(201, 162, 39, 0.6)' : 'rgba(74, 85, 104, 0.6)'
      }),
      borderColor: props.dayuns.map(d => {
        const isCurrent = d.ageRange[0] <= currentAge.value && d.ageRange[1] >= currentAge.value
        return isCurrent ? '#c9a227' : 'transparent'
      }),
      borderWidth: 2,
      borderRadius: 4,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        color: '#e8e0d0',
        font: { size: 10 },
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
    },
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        color: '#e8e0d0',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(10, 10, 15, 0.9)',
      titleColor: '#c9a227',
      bodyColor: '#e8e0d0',
      borderColor: 'rgba(201, 162, 39, 0.3)',
      borderWidth: 1,
      callbacks: {
        label: (ctx: any) => {
          const dy = props.dayuns[ctx.dataIndex]
          const score = dy.score ?? 0
          const fortune = dy.fortune ?? t('bazi.fortuneUnevaluated')
          return t('bazi.fortuneTooltip', { score, fortune })
        },
      },
    },
  },
}
</script>
