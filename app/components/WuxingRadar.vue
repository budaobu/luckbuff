<template>
  <GlowCard :title="t('bazi.wuxingTitle')" icon="i-heroicons-chart-pie">
    <div class="h-64">
      <Radar
        v-if="chartData"
        :data="chartData"
        :options="options"
      />
    </div>
  </GlowCard>
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
import type { WuxingScore } from '~/types/bazi'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Props {
  scores: WuxingScore
}

const props = defineProps<Props>()
const { t } = useI18n()

const chartData = computed(() => ({
  labels: [
    t('bazi.wuxingWood'),
    t('bazi.wuxingFire'),
    t('bazi.wuxingEarth'),
    t('bazi.wuxingMetal'),
    t('bazi.wuxingWater'),
  ],
  datasets: [
    {
      label: t('bazi.wuxingStrength'),
      data: [props.scores['木'], props.scores['火'], props.scores['土'], props.scores['金'], props.scores['水']],
      backgroundColor: 'rgba(201, 162, 39, 0.2)',
      borderColor: '#c9a227',
      pointBackgroundColor: ['#4ade80', '#f97316', '#a3855a', '#e2c96a', '#60a5fa'],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#c9a227',
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      max: 50,
      ticks: {
        display: false,
        stepSize: 10,
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      pointLabels: {
        color: '#e8e0d0',
        font: { size: 14 },
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
    },
  },
}
</script>
