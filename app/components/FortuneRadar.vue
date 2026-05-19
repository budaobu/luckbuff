<template>
  <div class="relative rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden">
    <div class="h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/40 to-transparent" />
    <div class="relative z-10 p-6">
      <!-- 标题 -->
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6]">
          <UIcon name="i-heroicons-chart-pie" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-[#f5e6c0] tracking-wide">{{ $t('fortuneRadar.title') }}</h3>
          <p class="text-[11px] text-[#e8e0d0]/40 mt-0.5">{{ $t('fortuneRadar.subtitle') }}</p>
        </div>
      </div>

      <!-- 雷达图 + 侧边解读 -->
      <div class="flex flex-col md:flex-row gap-6 items-stretch">
        <!-- 雷达图 -->
        <div class="flex-1 w-full max-w-[280px] h-56 relative self-center">
          <Radar
            v-if="chartData"
            :data="chartData"
            :options="options"
          />
        </div>

        <!-- 侧边维度解读列表 -->
        <div class="flex-1 w-full space-y-2.5">
          <div
            v-for="(label, idx) in labels"
            :key="label"
            class="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:bg-white/[0.04]"
          >
            <div class="flex items-center gap-2.5 mb-1">
              <!-- 维度颜色点 -->
              <div
                class="w-2 h-2 rounded-full shrink-0"
                :style="{ background: colors[idx] }"
              />
              <!-- 维度名 -->
              <span class="text-xs text-[#e8e0d0]/60 w-12 shrink-0">{{ label }}</span>
              <!-- 进度条 -->
              <div class="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700 ease-out"
                  :style="{ width: `${props.scores[label] ?? 50}%`, background: colors[idx] }"
                />
              </div>
              <!-- 评分 -->
              <span
                class="text-xs font-bold w-8 text-right shrink-0"
                :style="{ color: colors[idx] }"
              >
                {{ props.scores[label] ?? 50 }}
              </span>
              <!-- 评级 -->
              <span class="text-[10px] px-1.5 py-0.5 rounded text-[#e8e0d0]/40 bg-white/[0.04] shrink-0">
                {{ getLevel(props.scores[label] ?? 50) }}
              </span>
            </div>
            <!-- 维度解读 -->
            <p class="text-xs text-[#e8e0d0]/50 leading-relaxed pl-4.5">
              {{ getTip(label, props.scores[label] ?? 50) }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="absolute inset-0 rounded-2xl border border-white/[0.06] pointer-events-none" />
    <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/10 to-transparent" />
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

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Props {
  scores: Record<string, number>
}

const props = defineProps<Props>()

const { t } = useI18n()

const labelKeys = ['relationship', 'career', 'wealth', 'health', 'study'] as const
// Map English keys to Chinese keys used in aiResult.dimensionScores
const chineseKeyMap: Record<string, string> = {
  relationship: '感情运',
  career: '事业运',
  wealth: '财运',
  health: '健康运',
  study: '学业运',
}
const labels = computed(() => labelKeys.map(k => t(`fortuneRadar.labels.${k}`)))
const colors = ['#ef4444', '#f59e0b', '#c9a227', '#10b981', '#8b5cf6']

function getLevel(score: number): string {
  if (score >= 85) return t('fortuneRadar.levels.excellent')
  if (score >= 70) return t('fortuneRadar.levels.good')
  if (score >= 55) return t('fortuneRadar.levels.stable')
  if (score >= 40) return t('fortuneRadar.levels.weak')
  return t('fortuneRadar.levels.low')
}

function getTip(label: string, score: number): string {
  // Find which english key maps to the current label (which is in the user's locale)
  const labelKey = labelKeys.find(k => chineseKeyMap[k] === label || t(`fortuneRadar.labels.${k}`) === label)
  if (!labelKey) return ''
  const level = score >= 70 ? 'high' : score >= 50 ? 'mid' : 'low'
  return t(`fortuneRadar.tips.${labelKey}.${level}`)
}

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: t('fortuneRadar.title'),
      data: labelKeys.map(k => props.scores[chineseKeyMap[k]] ?? 50),
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      borderColor: '#8b5cf6',
      pointBackgroundColor: colors,
      pointBorderColor: '#1a1612',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2,
    },
  ],
}))

const options = {
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
        font: { size: 11, weight: '500' },
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
      padding: 10,
      displayColors: false,
      callbacks: {
        label: (ctx: any) => {
          const score = ctx.raw
          const level = getLevel(score)
          return t('fortuneRadar.tooltipScoreFormat', { score, level })
        },
      },
    },
  },
}
</script>
