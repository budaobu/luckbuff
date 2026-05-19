<template>
  <div class="space-y-6">
    <!-- 四柱表 -->
    <GlowCard :title="$t('baziPan.fourPillars')">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-[#e8e0d0]/50 border-b border-white/10">
              <th class="text-left py-2 px-2">　</th>
              <th class="py-2 px-2">{{ $t('baziPan.yearPillar') }}</th>
              <th class="py-2 px-2">{{ $t('baziPan.monthPillar') }}</th>
              <th class="py-2 px-2">{{ $t('baziPan.dayPillar') }}</th>
              <th class="py-2 px-2">{{ $t('baziPan.hourPillar') }}</th>
            </tr>
          </thead>
          <tbody class="text-[#e8e0d0]">
            <tr class="border-b border-white/5">
              <td class="py-2 px-2 text-[#e8e0d0]/50">{{ $t('baziPan.tianGan') }}</td>
              <td class="py-2 px-2 text-center">{{ chart.year.gan }}</td>
              <td class="py-2 px-2 text-center">{{ chart.month.gan }}</td>
              <td class="py-2 px-2 text-center font-bold text-[#c9a227]">{{ chart.day.gan }}</td>
              <td class="py-2 px-2 text-center">{{ chart.hour?.gan ?? '—' }}</td>
            </tr>
            <tr class="border-b border-white/5">
              <td class="py-2 px-2 text-[#e8e0d0]/50">{{ $t('zwdsPan.diZhi') }}</td>
              <td class="py-2 px-2 text-center">{{ chart.year.zhi }}</td>
              <td class="py-2 px-2 text-center">{{ chart.month.zhi }}</td>
              <td class="py-2 px-2 text-center">{{ chart.day.zhi }}</td>
              <td class="py-2 px-2 text-center">{{ chart.hour?.zhi ?? '—' }}</td>
            </tr>
            <tr class="border-b border-white/5">
              <td class="py-2 px-2 text-[#e8e0d0]/50">{{ $t('zwdsPan.shiShen') }}</td>
              <td class="py-2 px-2 text-center text-[#c9a227]/80">{{ chart.year.shishen }}</td>
              <td class="py-2 px-2 text-center text-[#c9a227]/80">{{ chart.month.shishen }}</td>
              <td class="py-2 px-2 text-center text-[#c9a227]">{{ $t('baziPan.riZhu') }}</td>
              <td class="py-2 px-2 text-center text-[#c9a227]/80">{{ chart.hour?.shishen ?? '—' }}</td>
            </tr>
            <tr>
              <td class="py-2 px-2 text-[#e8e0d0]/50">{{ $t('zwdsPan.cangGan') }}</td>
              <td class="py-2 px-2 text-center align-top">
                <div v-for="cg in chart.year.canggan" :key="cg.gan" class="text-xs">
                  {{ cg.gan }}<span class="text-[#e8e0d0]/40">({{ cg.type }})</span>
                </div>
              </td>
              <td class="py-2 px-2 text-center align-top">
                <div v-for="cg in chart.month.canggan" :key="cg.gan" class="text-xs">
                  {{ cg.gan }}<span class="text-[#e8e0d0]/40">({{ cg.type }})</span>
                </div>
              </td>
              <td class="py-2 px-2 text-center align-top">
                <div v-for="cg in chart.day.canggan" :key="cg.gan" class="text-xs">
                  {{ cg.gan }}<span class="text-[#e8e0d0]/40">({{ cg.type }})</span>
                </div>
              </td>
              <td class="py-2 px-2 text-center align-top">
                <div v-if="chart.hour">
                  <div v-for="cg in chart.hour.canggan" :key="cg.gan" class="text-xs">
                    {{ cg.gan }}<span class="text-[#e8e0d0]/40">({{ cg.type }})</span>
                  </div>
                </div>
                <span v-else class="text-[#e8e0d0]/30">—</span>
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
