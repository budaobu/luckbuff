<template>
  <div class="space-y-4">
    <!-- 命宫预览 -->
    <GlowCard title="命盘预览">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-[#e8e0d0]/50 mb-1">
            命宫 {{ chart.mingGong.zhi }} · {{ chart.wuxingJu }}局 · {{ chart.yearGan }}{{ chart.yearZhi }}
          </p>
          <p class="text-2xl font-bold text-[#c9a227]">
            {{ chart.mingGong.mainStars.join('、') || '借对宫' }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-xs text-[#e8e0d0]/50">身宫</p>
          <p class="text-lg text-[#e8e0d0]">{{ chart.shenGong.zhi }}</p>
        </div>
      </div>
    </GlowCard>

    <!-- 当前大限 -->
    <GlowCard v-if="chart.currentDaXian" title="当前大限">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-2xl font-bold text-[#c9a227]">
            {{ chart.currentDaXian.gongName }}
          </p>
          <p class="text-sm text-[#e8e0d0]/60">
            {{ chart.currentDaXian.gongZhi }}宫
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg text-[#e8e0d0]">
            {{ chart.currentDaXian.ageRange[0] }}-{{ chart.currentDaXian.ageRange[1] }}岁
          </p>
          <p class="text-xs text-[#e8e0d0]/50">当前 {{ chart.currentAge }} 岁</p>
        </div>
      </div>
    </GlowCard>
  </div>
</template>

<script setup lang="ts">
import type { ZwdsChart } from '~/types/zwds'

interface Props {
  chart: ZwdsChart
}

defineProps<Props>()
</script>
