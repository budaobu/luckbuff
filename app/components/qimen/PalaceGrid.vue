<template>
  <div class="w-full">
    <!-- 3×3 洛书九宫格 -->
    <div class="grid grid-cols-3 gap-2">
      <!-- 洛书顺序：4 9 2 / 3 5 7 / 8 1 6 -->
      <template v-for="row in [0, 1, 2]" :key="row">
        <template v-for="col in [0, 1, 2]" :key="col">
          <QimenPalaceTile
            v-if="getPalace(row, col)"
            :data="getPalace(row, col)!"
            :zhifu-palace="zhifuPalace"
            :zhishi-palace="zhishiPalace"
            :kongwang-palaces="kongwangPalaces"
            :yong-shen-palace="yongShenPalace"
            class="aspect-square"
          />
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PalaceData } from '~/types/qimen'

const props = defineProps<{
  palaces: PalaceData[]
  zhifuPalace: number
  zhishiPalace: number
  kongwangPalaces: number[]
  yongShenPalace?: number
}>()

// 洛书方位映射：row * 3 + col → palace number
// 4 9 2
// 3 5 7
// 8 1 6
const luoShuMap: number[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
]

function getPalace(row: number, col: number): PalaceData | undefined {
  const palaceNum = luoShuMap[row]?.[col]
  if (!palaceNum) return undefined
  return props.palaces.find(p => p.palace === palaceNum)
}
</script>
