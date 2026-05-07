<template>
  <div class="space-y-6">
    <!-- 四柱表 -->
    <GlowCard title="命盘四柱">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-[#e8e0d0]/50 border-b border-white/10">
              <th class="text-left py-2 px-2">　</th>
              <th class="py-2 px-2">年柱</th>
              <th class="py-2 px-2">月柱</th>
              <th class="py-2 px-2">日柱</th>
              <th class="py-2 px-2">时柱</th>
            </tr>
          </thead>
          <tbody class="text-[#e8e0d0]">
            <tr class="border-b border-white/5">
              <td class="py-2 px-2 text-[#e8e0d0]/50">天干</td>
              <td class="py-2 px-2 text-center">{{ chart.year.gan }}</td>
              <td class="py-2 px-2 text-center">{{ chart.month.gan }}</td>
              <td class="py-2 px-2 text-center font-bold text-[#c9a227]">{{ chart.day.gan }}</td>
              <td class="py-2 px-2 text-center">{{ chart.hour?.gan ?? '—' }}</td>
            </tr>
            <tr class="border-b border-white/5">
              <td class="py-2 px-2 text-[#e8e0d0]/50">地支</td>
              <td class="py-2 px-2 text-center">{{ chart.year.zhi }}</td>
              <td class="py-2 px-2 text-center">{{ chart.month.zhi }}</td>
              <td class="py-2 px-2 text-center">{{ chart.day.zhi }}</td>
              <td class="py-2 px-2 text-center">{{ chart.hour?.zhi ?? '—' }}</td>
            </tr>
            <tr class="border-b border-white/5">
              <td class="py-2 px-2 text-[#e8e0d0]/50">十神</td>
              <td class="py-2 px-2 text-center text-[#c9a227]/80">{{ chart.year.shishen }}</td>
              <td class="py-2 px-2 text-center text-[#c9a227]/80">{{ chart.month.shishen }}</td>
              <td class="py-2 px-2 text-center text-[#c9a227]">日主</td>
              <td class="py-2 px-2 text-center text-[#c9a227]/80">{{ chart.hour?.shishen ?? '—' }}</td>
            </tr>
            <tr>
              <td class="py-2 px-2 text-[#e8e0d0]/50 align-top">藏干</td>
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
        ⚠ 出生时辰未知，仅做七字分析，时柱推断仅供参考
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
