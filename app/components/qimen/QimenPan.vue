<template>
  <div class="w-full">
    <div class="flex items-center gap-2 mb-3">
      <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-[var(--accent)]" />
      <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('qimen.chartTitle') }}</h3>
    </div>

    <!-- 3×3 盘面（南上北下） -->
    <div class="grid grid-cols-3 gap-1.5">
      <template v-for="row in visualGrid" :key="row[0]?.gong || row.join('-')">
        <PalaceCell
          v-for="palace in row"
          :key="palace.gong"
          :palace="palace"
          :zhifu-gong="zhifuGong"
          :zhishi-gong="zhishiGong"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Palace } from '~~/server/utils/qimen/types'

const props = defineProps<{
  palaces: Palace[]
  zhifuGong: number
  zhishiGong: number
}>()

// 视觉排列（南上北下）：
// 巽4  离9  坤2
// 震3  中5  兑7
// 艮8  坎1  乾6
const visualOrder = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
]

const visualGrid = computed(() => {
  return visualOrder.map(row =>
    row.map(gong => props.palaces.find(p => p.gong === gong)!)
  )
})
</script>
