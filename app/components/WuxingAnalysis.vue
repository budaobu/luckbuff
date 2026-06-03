<template>
  <div class="relative rounded-2xl bg-[var(--surface-input)] backdrop-blur-sm overflow-hidden">
    <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border)] to-transparent" />
    <div class="relative z-10 p-6">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
          <UIcon name="i-heroicons-circle-stack" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('bazi.wuxingTitle') }}</h3>
          <p class="text-[11px] text-[var(--text-faint)] mt-0.5">{{ $t('bazi.wuxingSubtitle') }}</p>
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-6 items-center">
        <!-- 左侧雷达图 -->
        <div class="w-full md:w-1/2 h-56">
          <Radar
            v-if="chartData"
            :data="chartData"
            :options="chartOptions"
          />
        </div>
        <!-- 右侧文字说明 -->
        <div class="w-full md:w-1/2">
          <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ analysisText }}</p>
          <!-- 五行图例 -->
          <div class="mt-4 flex flex-wrap gap-2">
            <div
              v-for="(wx, i) in wuxingLabels"
              :key="wx"
              class="inline-flex items-center gap-1.5 text-xs"
            >
              <span
                class="w-2.5 h-2.5 rounded-full"
                :style="{ background: wuxingColors[i] }"
              />
              <span class="text-[var(--text-muted)]">{{ wx }}</span>
              <span class="text-[var(--text-muted)] font-medium">{{ wuxingScore[wuxingKeys[i] as keyof WuxingScore] }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="absolute inset-0 rounded-2xl border border-[var(--border-light)] pointer-events-none" />
    <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-faint)] to-transparent" />
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
import type { WuxingScore } from '~/types/bazi'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Props {
  wuxingScore: WuxingScore
  analysisText: string
}

const props = defineProps<Props>()

const wuxingColors = ['#4ade80', '#f97316', '#a3855a', '#e2c96a', '#60a5fa']
const wuxingKeys = ['木', '火', '土', '金', '水']
const { t } = useI18n()

const wuxingLabels = computed(() => [
  t('bazi.wuxingWood'),
  t('bazi.wuxingFire'),
  t('bazi.wuxingEarth'),
  t('bazi.wuxingMetal'),
  t('bazi.wuxingWater'),
])

const chartData = computed(() => ({
  labels: wuxingLabels.value,
  datasets: [
    {
      label: t('bazi.wuxingStrength'),
      data: wuxingKeys.map(k => props.wuxingScore[k as keyof WuxingScore]),
      backgroundColor: 'rgba(201, 162, 39, 0.2)',
      borderColor: '#c9a227',
      pointBackgroundColor: wuxingColors,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#c9a227',
    },
  ],
}))

const chartOptions = {
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
