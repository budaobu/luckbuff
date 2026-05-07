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
          <h3 class="text-sm font-semibold text-[#f5e6c0] tracking-wide">运势五维分析</h3>
          <p class="text-[11px] text-[#e8e0d0]/40 mt-0.5">各维度综合评分与解读</p>
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

const labels = ['感情运', '事业运', '财运', '健康运', '学业运']
const colors = ['#ef4444', '#f59e0b', '#c9a227', '#10b981', '#8b5cf6']

function getLevel(score: number): string {
  if (score >= 85) return '极佳'
  if (score >= 70) return '良好'
  if (score >= 55) return '平稳'
  if (score >= 40) return '偏弱'
  return '低迷'
}

function getTip(label: string, score: number): string {
  const tips: Record<string, Record<string, string>> = {
    感情运: {
      high: '桃花运势较旺，容易遇到良缘，适合主动社交、拓展人际圈。',
      mid: '感情发展平稳，需用心经营，不宜操之过急，细水长流为上。',
      low: '感情运偏弱，宜先修身养性、提升自我，等待合适时机。',
    },
    事业运: {
      high: '事业运旺，贵人相助，宜积极进取，把握上升与突破机会。',
      mid: '事业平稳发展，宜稳扎稳打，积累经验与资历，厚积薄发。',
      low: '事业运受阻，宜低调行事，避免重大变动，静待时机转机。',
    },
    财运: {
      high: '财源广进，正财偏财皆有机会，可适当投资，注意见好就收。',
      mid: '财运平稳，宜守不宜攻，量入为出，稳健理财为佳。',
      low: '财运偏弱，宜节俭理财，避免大额支出与高风险投资。',
    },
    健康运: {
      high: '身体状态良好，精力充沛，注意保持规律作息即可。',
      mid: '健康状况平稳，需注意劳逸结合，预防季节性小病。',
      low: '健康运偏弱，需注意调养身心，避免过度劳累与熬夜。',
    },
    学业运: {
      high: '学业运旺，思维敏捷吸收快，适合深造进修、考取证书。',
      mid: '学业进展平稳，需持之以恒，制定计划方能见效。',
      low: '学业运受阻，宜调整学习方法，寻求良师指点与同伴互助。',
    },
  }
  const level = score >= 70 ? 'high' : score >= 50 ? 'mid' : 'low'
  return tips[label]?.[level] ?? ''
}

const chartData = computed(() => ({
  labels,
  datasets: [
    {
      label: '运势评分',
      data: labels.map(l => props.scores[l] ?? 50),
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
          return `评分：${score}（${level}）`
        },
      },
    },
  },
}
</script>
