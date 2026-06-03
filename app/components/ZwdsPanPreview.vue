<template>
  <div class="space-y-4">
    <!-- 命宫预览 -->
    <GlowCard :title="$t('zwds.panPreview')">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-[var(--text-muted)] mb-1">
            {{ $t('zwds.mingGong') }} {{ chart.mingGong.zhi }} · {{ chart.wuxingJu }}{{ $t('zwds.juLabel') }} · {{ chart.yearGan }}{{ chart.yearZhi }}
          </p>
          <p class="text-2xl font-bold text-[var(--accent)]">
            {{ chart.mingGong.mainStars.join($t('zwds.starJoin')) || $t('zwds.borrowPalace') }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-xs text-[var(--text-muted)]">{{ $t('zwds.shenGong') }}</p>
          <p class="text-lg text-[var(--text-body)]">{{ chart.shenGong.zhi }}</p>
        </div>
      </div>
    </GlowCard>

    <!-- 当前大限 -->
    <GlowCard v-if="chart.currentDaXian" :title="$t('zwds.currentDaXian')">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-2xl font-bold text-[var(--accent)]">
            {{ chart.currentDaXian.gongName }}
          </p>
          <p class="text-sm text-[var(--text-muted)]">
            {{ chart.currentDaXian.gongZhi }}{{ $t('zwds.gongLabel') }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg text-[var(--text-body)]">
            {{ chart.currentDaXian.ageRange[0] }}-{{ chart.currentDaXian.ageRange[1] }}{{ $t('zwds.ageSuffix') }}
          </p>
          <p class="text-xs text-[var(--text-muted)]">{{ $t('zwds.currentAgeLabel') }} {{ chart.currentAge }} {{ $t('zwds.ageSuffix') }}</p>
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
