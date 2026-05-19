<template>
  <div class="space-y-6">
    <!-- 命盘十二宫格 -->
    <GlowCard :title="$t('zwdsPan.chartTitle')">
      <div class="flex flex-col items-center">
        <!-- 命盘网格：4x4，中间2x2为信息区 -->
        <div
          class="grid gap-1 w-full"
          style="grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr);"
        >
          <!-- 十二宫位 + 中心信息区（共13个元素） -->
          <template v-for="pos in panPositions" :key="pos.key">
            <!-- 中间信息区（2x2） -->
            <div
              v-if="pos.isCenter"
              class="rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col items-center justify-center p-2 text-center"
              style="grid-column: 2 / span 2; grid-row: 2 / span 2;"
            >
              <div class="text-[10px] text-[#e8e0d0]/40 mb-0.5">{{ $t('zwdsPan.wuxingBureau') }}</div>
              <div class="text-base font-bold text-[#c9a227] mb-1">{{ chart.wuxingJu }}{{ $t('zwdsPan.wuxingBureau') }}</div>
              <div class="text-[10px] text-[#e8e0d0]/40 mb-0.5">{{ $t('zwdsPan.yearPillar') }}</div>
              <div class="text-sm font-semibold text-[#f5e6c0]">{{ chart.yearGan }}{{ chart.yearZhi }}</div>
              <div class="text-[10px] text-[#e8e0d0]/30 mt-1">{{ chart.gender === 'male' ? $t('zwdsPan.sunSign') : $t('zwdsPan.moonSign') }} · {{ chart.currentAge }}{{ $t('zwdsPan.sui') }}</div>
            </div>

            <!-- 宫位格子 -->
            <div
              v-else
              class="relative rounded-lg border p-1.5 flex flex-col gap-0.5 overflow-hidden"
              :class="gongClass(pos.gong!)"
              :style="{ gridColumn: pos.col + 1, gridRow: pos.row + 1 }"
            >
              <!-- 宫名 + 地支（紧凑靠左，避免与右上角四化标记重叠） -->
              <div class="flex items-center gap-1 pr-4">
                <span
                  class="text-[10px] font-bold truncate"
                  :class="pos.gong?.isMing ? 'text-[#c9a227]' : 'text-[#e8e0d0]/70'"
                >
                  {{ pos.gong?.name }}
                </span>
                <span class="text-[9px] text-[#e8e0d0]/40 shrink-0">{{ pos.zhi }}</span>
              </div>

              <!-- 主星 -->
              <div class="flex flex-wrap gap-0.5 pr-3">
                <span
                  v-for="star in pos.gong?.mainStars"
                  :key="star"
                  class="text-[9px] px-1 py-0.5 rounded font-medium leading-none"
                  :class="isEmperorStar(star) ? 'bg-[#c9a227]/15 text-[#c9a227]' : 'bg-white/[0.04] text-[#f5e6c0]/80'"
                >
                  {{ star }}
                </span>
                <span
                  v-if="pos.gong?.mainStars.length === 0"
                  class="text-[9px] text-[#e8e0d0]/25 italic leading-none"
                >
                  {{ $t('zwdsPan.borrowLabel') }}{{ getJieDuiZhi(pos.zhi) }}
                </span>
              </div>

              <!-- 辅星 -->
              <div class="flex flex-wrap gap-0.5">
                <span
                  v-for="star in pos.gong?.auxStars.slice(0, 2)"
                  :key="star"
                  class="text-[8px] px-0.5 py-0.5 rounded text-[#e8e0d0]/50 bg-white/[0.02] leading-none"
                >
                  {{ star }}
                </span>
                <span
                  v-if="(pos.gong?.auxStars.length ?? 0) > 2"
                  class="text-[8px] text-[#e8e0d0]/30 leading-none"
                >
                  +{{ (pos.gong?.auxStars.length ?? 0) - 2 }}
                </span>
              </div>

              <!-- 命宫/身宫/大限标记（非 absolute，避免重叠） -->
              <div class="flex gap-0.5 mt-auto pt-0.5">
                <span v-if="pos.gong?.isMing" class="text-[8px] px-1 rounded bg-[#c9a227]/20 text-[#c9a227] leading-none">{{ $t('zwdsPan.lifePalace') }}</span>
                <span v-if="pos.gong?.isShen" class="text-[8px] px-1 rounded bg-[#8b5cf6]/20 text-[#8b5cf6] leading-none">{{ $t('zwdsPan.bodyPalace') }}</span>
                <span v-if="pos.gong?.isCurrentDaXian" class="text-[8px] px-1 rounded bg-emerald-500/20 text-emerald-400 leading-none">{{ $t('zwdsPan.limitPalace') }}</span>
              </div>

              <!-- 四化标记 -->
              <div v-if="pos.gong?.siHua.length" class="absolute top-1 right-1 flex flex-col gap-0.5 z-10">
                <span
                  v-for="s in pos.gong.siHua"
                  :key="s.star + s.type"
                  class="text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold leading-none"
                  :class="sihuaClass(s.type)"
                >
                  {{ s.type }}
                </span>
              </div>
            </div>
          </template>
        </div>

        <!-- 时辰未知提示 -->
        <div v-if="!hasHour" class="mt-3 text-xs text-amber-400/80">
          ⚠ {{ $t('zwdsPan.warningUnknown') }}
        </div>
      </div>
    </GlowCard>

    <!-- 大限列表 -->
    <ZwdsDayun :da-xians="chart.daXians" :current-age="chart.currentAge" />
  </div>
</template>

<script setup lang="ts">
import type { ZwdsChart, ZwdsGong, DiZhi } from '~/types/zwds'

interface Props {
  chart: ZwdsChart
  hasHour?: boolean
}

const props = defineProps<Props>()

const ZHI_ORDER: DiZhi[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']

/** 盘面位置定义（4x4网格，中间2x2为信息区） */
interface PanPos {
  key: string
  isCenter?: boolean
  zhi?: DiZhi
  row?: number
  col?: number
  gong?: ZwdsGong | null
}

const panLayout: PanPos[] = [
  { key: '巳', zhi: '巳', row: 0, col: 0 },
  { key: '午', zhi: '午', row: 0, col: 1 },
  { key: '未', zhi: '未', row: 0, col: 2 },
  { key: '申', zhi: '申', row: 0, col: 3 },
  { key: '辰', zhi: '辰', row: 1, col: 0 },
  { key: 'center', isCenter: true },
  { key: '酉', zhi: '酉', row: 1, col: 3 },
  { key: '卯', zhi: '卯', row: 2, col: 0 },
  { key: '戌', zhi: '戌', row: 2, col: 3 },
  { key: '寅', zhi: '寅', row: 3, col: 0 },
  { key: '丑', zhi: '丑', row: 3, col: 1 },
  { key: '子', zhi: '子', row: 3, col: 2 },
  { key: '亥', zhi: '亥', row: 3, col: 3 },
]

const panPositions = computed(() => {
  return panLayout.map(pos => {
    if (pos.isCenter) return { key: pos.key, isCenter: true }
    const gong = props.chart.gongs.find(g => g.zhi === pos.zhi)
    return { key: pos.key, zhi: pos.zhi!, row: pos.row!, col: pos.col!, gong: gong || null }
  })
})

function gongClass(gong: ZwdsGong | null): string {
  if (!gong) return 'border-white/[0.04] bg-white/[0.01]'
  if (gong.isMing) return 'border-[#c9a227]/30 bg-[#c9a227]/[0.04]'
  if (gong.isCurrentDaXian) return 'border-emerald-500/20 bg-emerald-500/[0.02]'
  return 'border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]'
}

function isEmperorStar(star: string): boolean {
  return star === '紫微' || star === '天府'
}

function sihuaClass(type: string): string {
  switch (type) {
    case '禄': return 'bg-[#c9a227]/20 text-[#c9a227]'
    case '权': return 'bg-red-500/20 text-red-400'
    case '科': return 'bg-[#8b5cf6]/20 text-[#8b5cf6]'
    case '忌': return 'bg-gray-500/20 text-gray-400'
    default: return 'bg-white/10 text-[#e8e0d0]'
  }
}

function getJieDuiZhi(zhi: DiZhi): DiZhi {
  const idx = ZHI_ORDER.indexOf(zhi)
  return ZHI_ORDER[(idx + 6) % 12]
}
</script>
