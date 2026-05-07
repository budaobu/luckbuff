<template>
  <div class="relative rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden">
    <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent" />
    <div class="relative z-10 p-6">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227]">
          <UIcon name="i-heroicons-circle-stack" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-[#f5e6c0] tracking-wide">五行力量分布</h3>
          <p class="text-[11px] text-[#e8e0d0]/40 mt-0.5">五行平衡与喜忌分析</p>
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
          <p class="text-sm text-[#e8e0d0]/80 leading-relaxed">{{ analysisText }}</p>
          <!-- 五行图例 -->
          <div class="mt-4 flex flex-wrap gap-2">
            <div
              v-for="(wx, i) in ['木', '火', '土', '金', '水']"
              :key="wx"
              class="inline-flex items-center gap-1.5 text-xs"
            >
              <span
                class="w-2.5 h-2.5 rounded-full"
                :style="{ background: wuxingColors[i] }"
              />
              <span class="text-[#e8e0d0]/50">{{ wx }}</span>
              <span class="text-[#e8e0d0]/70 font-medium">{{ wuxingScore[wx as keyof WuxingScore] }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="absolute inset-0 rounded-2xl border border-white/[0.06] pointer-events-none" />
    <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/10 to-transparent" />
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

const chartData = computed(() => ({
  labels: ['木', '火', '土', '金', '水'],
  datasets: [
    {
      label: '五行力量',
      data: [
        props.wuxingScore['木'],
        props.wuxingScore['火'],
        props.wuxingScore['土'],
        props.wuxingScore['金'],
        props.wuxingScore['水'],
      ],
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
