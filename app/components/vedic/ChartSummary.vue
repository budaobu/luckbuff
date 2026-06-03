<script setup lang="ts">
import type { VedicChart } from '~/types/vedic'

interface Props {
  chart: VedicChart
}
const props = defineProps<Props>()

const { t } = useI18n()

const currentDasha = computed(() => props.chart.dasha.find(d => d.isCurrent))
const offsetText = computed(() => {
  const o = props.chart.birthData.utcOffset
  const sign = o >= 0 ? '+' : ''
  return `UTC${sign}${o}`
})

const planetIconMap: Record<string, string> = {
  Sun: 'i-heroicons-sun',
  Moon: 'i-heroicons-moon',
  Mars: 'i-heroicons-fire',
  Mercury: 'i-heroicons-cpu-chip',
  Jupiter: 'i-heroicons-academic-cap',
  Venus: 'i-heroicons-heart',
  Saturn: 'i-heroicons-clock',
  Rahu: 'i-heroicons-arrow-trending-up',
  Ketu: 'i-heroicons-arrow-trending-down',
}

function planetIcon(graha: string): string {
  return planetIconMap[graha] ?? 'i-heroicons-star'
}

function planetName(graha: string): string {
  const translated = t(`vedic.chart.planetNames.${graha}`)
  return translated === `vedic.chart.planetNames.${graha}` ? graha : translated
}

function nakshatraName(name: string): string {
  const translated = t(`vedic.chart.nakshatraNames.${name}`)
  return translated === `vedic.chart.nakshatraNames.${name}` ? name : translated
}
</script>

<template>
  <div class="space-y-4">
    <!-- 上升 + 当前大运 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-faint)] p-4">
        <div class="flex items-center gap-1.5 text-[10px] text-[var(--accent-muted)] tracking-wider uppercase mb-1.5">
          <UIcon name="i-heroicons-arrow-up-right" class="w-3 h-3" />
          {{ $t('vedic.chart.ascendant', { lagna: $t('vedic.terms.lagna') }) }}
        </div>
        <div class="text-lg font-semibold text-[var(--text-primary)]">
          {{ chart.ascendant.signNameZh }} <span class="text-[var(--text-faint)] text-xs font-normal">{{ chart.ascendant.signName }}</span>
        </div>
        <div class="text-xs text-[var(--text-muted)] mt-1">
          {{ chart.ascendant.degree.toFixed(2) }}° · {{ nakshatraName(chart.ascendant.nakshatra) }} pada {{ chart.ascendant.nakshatraPada }}
        </div>
      </div>

      <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
        <div class="flex items-center gap-1.5 text-[10px] text-[var(--text-faint)] tracking-wider uppercase mb-1.5">
          <UIcon name="i-heroicons-clock" class="w-3 h-3" />
          {{ $t('vedic.chart.currentDasha') }}
        </div>
        <div v-if="currentDasha" class="text-lg font-semibold text-[var(--text-primary)]">
          {{ planetName(currentDasha.graha) }}
        </div>
        <div v-if="currentDasha" class="text-xs text-[var(--text-muted)] mt-1">
          {{ currentDasha.startDate }} → {{ currentDasha.endDate }}
        </div>
        <div v-else class="text-xs text-[var(--text-faint)]">—</div>
      </div>
    </div>

    <!-- 出生信息 -->
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-xs text-[var(--text-body)]/55 leading-relaxed">
      <div class="flex flex-wrap gap-x-4 gap-y-1">
        <span>{{ $t('vedic.chart.dob') }}：{{ chart.birthData.year }}-{{ String(chart.birthData.month).padStart(2, '0') }}-{{ String(chart.birthData.day).padStart(2, '0') }} {{ String(chart.birthData.hour).padStart(2, '0') }}:{{ String(chart.birthData.minute).padStart(2, '0') }}</span>
        <span>{{ chart.cityName ?? '—' }}</span>
        <span>{{ offsetText }}</span>
      </div>
      <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[var(--text-body)]/35">
        <span>{{ $t('vedic.chart.ayanamshaLabel') }}{{ chart.ayanamsha }}°</span>
        <span>{{ $t('vedic.chart.houseSystem', { system: $t('vedic.chart.houseSystemName') }) }}</span>
      </div>
    </div>

    <!-- 行星表 -->
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] overflow-hidden">
      <div class="px-4 py-2.5 border-b border-[var(--border-light)] text-[10px] tracking-wider uppercase text-[var(--text-faint)]">
        {{ $t('vedic.chart.planets') }}
      </div>
      <div class="divide-y divide-white/[0.04]">
        <div
          v-for="p in chart.planets"
          :key="p.graha"
          class="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2.5 text-xs"
        >
          <div class="flex items-center gap-2 w-20">
            <UIcon :name="planetIcon(p.graha)" class="w-3.5 h-3.5 text-[var(--accent-muted)]" />
            <span class="text-[var(--text-primary)] font-medium">{{ planetName(p.graha) }}</span>
            <UIcon v-if="p.isRetrograde" name="i-heroicons-arrow-uturn-left" class="w-3 h-3 text-[var(--accent-purple-text)]/70" :title="$t('vedic.chart.retrograde')" />
          </div>
          <div class="text-[var(--text-muted)]">
            {{ p.signNameZh }} <span class="text-[var(--text-placeholder)]">{{ p.signName }}</span> · {{ p.degree.toFixed(1) }}°
            <span class="text-[var(--text-placeholder)] ml-1">{{ nakshatraName(p.nakshatra) }}</span>
          </div>
          <div class="text-[var(--accent-muted)] text-[10px] tracking-wider">
            {{ $t('vedic.chart.house', { n: p.house }) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 大运时间轴（前 6 个） -->
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
      <div class="text-[10px] tracking-wider uppercase text-[var(--text-faint)] mb-2">
        {{ $t('vedic.chart.dashaList', { vimshottari: $t('vedic.terms.vimshottari') }) }}
      </div>
      <div class="space-y-1.5">
        <div
          v-for="d in chart.dasha.slice(0, 6)"
          :key="d.startDate + d.graha"
          class="flex items-center gap-3 text-xs"
        >
          <div
            class="w-1.5 h-1.5 rounded-full shrink-0"
            :class="d.isCurrent ? 'bg-[var(--accent)]' : 'bg-[var(--border-light)]'"
          />
          <span class="text-[var(--text-primary)] w-16">{{ planetName(d.graha) }}</span>
          <span class="text-[var(--text-muted)]">{{ d.startDate }} → {{ d.endDate }}</span>
          <span v-if="d.isCurrent" class="ml-auto text-[10px] text-[var(--accent)]">{{ $t('vedic.chart.currentTag') }}</span>
        </div>
      </div>
    </div>

    <!-- 校验提示 -->
    <div v-if="chart.timeUncertain" class="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3 text-xs text-amber-200/80">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
      {{ $t('vedic.chart.timeUncertainBanner') }}
    </div>
  </div>
</template>
