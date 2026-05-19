<template>
  <div v-if="probability" class="space-y-3">
    <!-- 推荐倾向 -->
    <div class="flex items-center gap-2 mb-1">
      <div
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
        :style="{
          background: trendBg,
          color: trendColor,
          border: `1px solid ${trendBorder}`,
        }"
      >
        <UIcon :name="trendIcon" class="w-3 h-3" />
        {{ trendText }}
      </div>
    </div>

    <!-- 三向堆叠进度条 -->
    <div class="relative w-full h-8 rounded-lg overflow-hidden flex" role="progressbar">
      <!-- 主队胜率 -->
      <div
        class="relative flex items-center justify-center transition-all duration-1000 ease-out"
        :style="{ width: `${probability.home}%`, backgroundColor: '#c9a227' }"
      >
        <span
          v-if="probability.home >= 10"
          class="text-xs font-bold text-[#0f0c09] drop-shadow-sm"
        >
          {{ probability.home.toFixed(1) }}%
        </span>
      </div>
      <!-- 平局 -->
      <div
        class="relative flex items-center justify-center transition-all duration-1000 ease-out"
        :style="{ width: `${probability.draw}%`, backgroundColor: '#6b7280' }"
      >
        <span
          v-if="probability.draw >= 10"
          class="text-xs font-bold text-white/90 drop-shadow-sm"
        >
          {{ probability.draw.toFixed(1) }}%
        </span>
      </div>
      <!-- 客队胜率 -->
      <div
        class="relative flex items-center justify-center transition-all duration-1000 ease-out"
        :style="{ width: `${probability.away}%`, backgroundColor: '#ef4444' }"
      >
        <span
          v-if="probability.away >= 10"
          class="text-xs font-bold text-white/90 drop-shadow-sm"
        >
          {{ probability.away.toFixed(1) }}%
        </span>
      </div>
    </div>

    <!-- 图例 -->
    <div class="flex items-center justify-between text-[11px]">
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-sm" style="background-color: #c9a227" />
        <span class="text-[#e8e0d0]/60">{{ homeLabel }}</span>
        <span v-if="probability.home < 10" class="text-[#c9a227] font-semibold">{{ probability.home.toFixed(1) }}%</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-sm" style="background-color: #6b7280" />
        <span class="text-[#e8e0d0]/60">{{ $t('matchProbability.drawLabel') }}</span>
        <span v-if="probability.draw < 10" class="text-[#e8e0d0]/70 font-semibold">{{ probability.draw.toFixed(1) }}%</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-sm" style="background-color: #ef4444" />
        <span class="text-[#e8e0d0]/60">{{ awayLabel }}</span>
        <span v-if="probability.away < 10" class="text-[#ef4444] font-semibold">{{ probability.away.toFixed(1) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { t } = useI18n()

interface ProbabilityData {
  home: number
  draw: number
  away: number
}

interface Props {
  probability: ProbabilityData | null
  homeLabel?: string
  awayLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  homeLabel: 'Home Win',
  awayLabel: 'Away Win',
})

// 推荐倾向
const trend = computed(() => {
  if (!props.probability) return { type: 'draw' as const, value: 0 }
  const { home, draw, away } = props.probability
  if (home >= draw && home >= away) return { type: 'home' as const, value: home }
  if (away >= draw && away >= home) return { type: 'away' as const, value: away }
  return { type: 'draw' as const, value: draw }
})

const trendText = computed(() => {
  switch (trend.value.type) {
    case 'home': return t('matchProbability.homeWin', { team: props.homeLabel })
    case 'away': return t('matchProbability.awayWin', { team: props.awayLabel })
    case 'draw': return t('matchProbability.draw')
  }
})

const trendIcon = computed(() => {
  switch (trend.value.type) {
    case 'home': return 'i-heroicons-arrow-trending-up'
    case 'away': return 'i-heroicons-arrow-trending-down'
    case 'draw': return 'i-heroicons-arrows-right-left'
  }
})

const trendBg = computed(() => {
  switch (trend.value.type) {
    case 'home': return 'rgba(201, 162, 39, 0.12)'
    case 'away': return 'rgba(239, 68, 68, 0.12)'
    case 'draw': return 'rgba(107, 114, 128, 0.12)'
  }
})

const trendColor = computed(() => {
  switch (trend.value.type) {
    case 'home': return '#c9a227'
    case 'away': return '#ef4444'
    case 'draw': return '#9ca3af'
  }
})

const trendBorder = computed(() => {
  switch (trend.value.type) {
    case 'home': return 'rgba(201, 162, 39, 0.2)'
    case 'away': return 'rgba(239, 68, 68, 0.2)'
    case 'draw': return 'rgba(107, 114, 128, 0.2)'
  }
})
</script>
