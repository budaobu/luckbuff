<template>
  <div class="space-y-4">
    <!-- 命宫预览 -->
    <GlowCard :title="$t('zwds.panPreview')">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-[#e8e0d0]/50 mb-1">
            {{ $t('zwds.mingGong') }} {{ chart.mingGong.zhi }} · {{ chart.wuxingJu }}{{ $t('zwds.juLabel') }} · {{ chart.yearGan }}{{ chart.yearZhi }}
          </p>
          <p class="text-2xl font-bold text-[#c9a227]">
            {{ chart.mingGong.mainStars.join($t('zwds.starJoin')) || $t('zwds.borrowPalace') }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-xs text-[#e8e0d0]/50">{{ $t('zwds.shenGong') }}</p>
          <p class="text-lg text-[#e8e0d0]">{{ chart.shenGong.zhi }}</p>
        </div>
      </div>
    </GlowCard>

    <!-- 当前大限 -->
    <GlowCard v-if="chart.currentDaXian" :title="$t('zwds.currentDaXian')">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-2xl font-bold text-[#c9a227]">
            {{ chart.currentDaXian.gongName }}
          </p>
          <p class="text-sm text-[#e8e0d0]/60">
            {{ chart.currentDaXian.gongZhi }}{{ $t('zwds.gongLabel') }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg text-[#e8e0d0]">
            {{ chart.currentDaXian.ageRange[0] }}-{{ chart.currentDaXian.ageRange[1] }}{{ $t('zwds.ageSuffix') }}
          </p>
          <p class="text-xs text-[#e8e0d0]/50">{{ $t('zwds.currentAgeLabel') }} {{ chart.currentAge }} {{ $t('zwds.ageSuffix') }}</p>
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

const props = defineProps<Props>()
const { t } = useI18n()
</script>
