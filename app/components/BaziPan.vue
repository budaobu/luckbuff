<template>
  <div class="space-y-6">
    <!-- 四柱表 -->
    <GlowCard :title="$t('baziPan.fourPillars')">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-[var(--text-muted)] border-b border-[var(--border-light)]">
              <th class="text-left py-2 px-2">　</th>
              <th class="py-2 px-2">{{ $t('baziPan.yearPillar') }}</th>
              <th class="py-2 px-2">{{ $t('baziPan.monthPillar') }}</th>
              <th class="py-2 px-2">{{ $t('baziPan.dayPillar') }}</th>
              <th class="py-2 px-2">{{ $t('baziPan.hourPillar') }}</th>
            </tr>
          </thead>
          <tbody class="text-[var(--text-body)]">
            <tr class="border-b border-[var(--border-subtle)]">
              <td class="py-2 px-2 text-[var(--text-muted)]">{{ $t('baziPan.tianGan') }}</td>
              <td class="py-2 px-2 text-center">{{ chart.year.gan }}</td>
              <td class="py-2 px-2 text-center">{{ chart.month.gan }}</td>
              <td class="py-2 px-2 text-center font-bold text-[var(--accent)]">{{ chart.day.gan }}</td>
              <td class="py-2 px-2 text-center">{{ chart.hour?.gan ?? '—' }}</td>
            </tr>
            <tr class="border-b border-[var(--border-subtle)]">
              <td class="py-2 px-2 text-[var(--text-muted)]">{{ $t('zwdsPan.diZhi') }}</td>
              <td class="py-2 px-2 text-center">{{ chart.year.zhi }}</td>
              <td class="py-2 px-2 text-center">{{ chart.month.zhi }}</td>
              <td class="py-2 px-2 text-center">{{ chart.day.zhi }}</td>
              <td class="py-2 px-2 text-center">{{ chart.hour?.zhi ?? '—' }}</td>
            </tr>
            <tr class="border-b border-[var(--border-subtle)]">
              <td class="py-2 px-2 text-[var(--text-muted)]">{{ $t('zwdsPan.shiShen') }}</td>
              <td class="py-2 px-2 text-center text-[var(--accent)]">{{ chart.year.shishen }}</td>
              <td class="py-2 px-2 text-center text-[var(--accent)]">{{ chart.month.shishen }}</td>
              <td class="py-2 px-2 text-center text-[var(--accent)]">{{ $t('baziPan.riZhu') }}</td>
              <td class="py-2 px-2 text-center text-[var(--accent)]">{{ chart.hour?.shishen ?? '—' }}</td>
            </tr>
            <tr>
              <td class="py-2 px-2 text-[var(--text-muted)]">{{ $t('zwdsPan.cangGan') }}</td>
              <td class="py-2 px-2 text-center align-top">
                <div v-for="cg in chart.year.canggan" :key="cg.gan" class="text-xs">
                  {{ cg.gan }}<span class="text-[var(--text-faint)]">({{ cg.type }})</span>
                </div>
              </td>
              <td class="py-2 px-2 text-center align-top">
                <div v-for="cg in chart.month.canggan" :key="cg.gan" class="text-xs">
                  {{ cg.gan }}<span class="text-[var(--text-faint)]">({{ cg.type }})</span>
                </div>
              </td>
              <td class="py-2 px-2 text-center align-top">
                <div v-for="cg in chart.day.canggan" :key="cg.gan" class="text-xs">
                  {{ cg.gan }}<span class="text-[var(--text-faint)]">({{ cg.type }})</span>
                </div>
              </td>
              <td class="py-2 px-2 text-center align-top">
                <div v-if="chart.hour">
                  <div v-for="cg in chart.hour.canggan" :key="cg.gan" class="text-xs">
                    {{ cg.gan }}<span class="text-[var(--text-faint)]">({{ cg.type }})</span>
                  </div>
                </div>
                <span v-else class="text-[var(--text-placeholder)]">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!chart.hour" class="mt-3 text-xs text-amber-400/80">
        ⚠ {{ $t('baziPan.birthtimeUnknown') }}
      </div>
    </GlowCard>

    <!-- 大运表 -->
    <BaziDayunTable :dayuns="chart.dayuns" :current-age="chart.currentAge" />
  </div>
</template>

<script setup lang="ts">
import type { BaziChart } from '~/types/bazi'

interface Props {
  chart: BaziChart
}

defineProps<Props>()
</script>
