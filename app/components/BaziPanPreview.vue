<template>
  <div class="space-y-4">
    <!-- 四柱精简 -->
    <GlowCard :title="$t('bazi.panPreview')">
      <div class="flex justify-between text-center">
        <div v-for="(label, idx) in pillarLabels" :key="label" class="flex-1">
          <p class="text-xs text-[var(--text-muted)] mb-1">{{ label }}</p>
          <p class="text-lg font-bold" :class="idx === 2 ? 'text-[var(--accent)]' : 'text-[var(--text-body)]'">
            {{ getPillarText(idx) }}
          </p>
          <p class="text-xs text-[var(--accent-muted)] mt-1">{{ getShiShenText(idx) }}</p>
        </div>
      </div>
    </GlowCard>

    <!-- 当前大运 -->
    <GlowCard v-if="chart.currentDaYun" :title="$t('bazi.currentDayun')">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-2xl font-bold text-[var(--accent)]">
            {{ chart.currentDaYun.gan }}{{ chart.currentDaYun.zhi }}
          </p>
          <p class="text-sm text-[var(--text-muted)]">
            {{ $t('bazi.stepOfDaYun', { index: chart.currentDaYun.index }) }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg text-[var(--text-body)]">
            {{ chart.currentDaYun.ageRange[0] }}-{{ chart.currentDaYun.ageRange[1] }}{{ $t('bazi.ageUnit') }}
          </p>
          <p class="text-xs text-[var(--text-muted)]">{{ $t('bazi.currentAgeLabel', { age: chart.currentAge }) }}</p>
        </div>
      </div>
    </GlowCard>
  </div>
</template>

<script setup lang="ts">
import type { BaziChart } from '~/types/bazi'

interface Props {
  chart: BaziChart
}

const props = defineProps<Props>()

const { t } = useI18n()

const pillarLabels = computed(() => [
  t('baziPan.yearPillar'),
  t('baziPan.monthPillar'),
  t('baziPan.dayPillar'),
  t('baziPan.hourPillar'),
])

const pillars = computed(() => [
  props.chart.year,
  props.chart.month,
  props.chart.day,
  props.chart.hour,
])

function getPillarText(idx: number): string {
  const p = pillars.value[idx]
  if (!p) return '—'
  return `${p.gan}${p.zhi}`
}

function getShiShenText(idx: number): string {
  const p = pillars.value[idx]
  if (!p) return ''
  return p.shishen || ''
}
</script>
