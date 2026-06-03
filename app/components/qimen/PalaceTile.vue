<template>
  <div
    class="relative rounded-xl border p-3 flex flex-col items-center justify-center text-center transition-all"
    :class="tileClass"
    :style="tileStyle"
  >
    <!-- 宫名 + 方向 -->
    <div class="text-[10px] text-[var(--text-faint)] mb-1">
      {{ palaceName }} · {{ direction }}
    </div>

    <!-- 天盘干（大字） -->
    <div class="text-lg font-bold text-[var(--text-primary)] leading-tight">
      {{ data.sky_stem }}
    </div>

    <!-- 地盘干（小字） -->
    <div class="text-[10px] text-[var(--text-muted)] mb-1">
      地：{{ data.earth_stem }}
    </div>

    <!-- 星 · 门 -->
    <div v-if="data.star" class="text-xs text-[var(--text-body)] mt-1">
      <span class="text-[var(--accent-muted)]">{{ data.star }}</span>
      <span v-if="data.door" class="mx-1 text-[var(--text-faint)]">·</span>
      <span v-if="data.door">{{ data.door }}</span>
    </div>

    <!-- 神 -->
    <div v-if="data.god" class="text-[10px] text-[var(--accent-muted)] mt-0.5">
      {{ data.god }}
    </div>

    <!-- 值符/值使 badge -->
    <div v-if="isZhifu || isZhishi" class="flex gap-1 mt-1.5">
      <span
        v-if="isZhifu"
        class="text-[9px] px-1.5 py-0.5 rounded border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]"
      >
        值符
      </span>
      <span
        v-if="isZhishi"
        class="text-[9px] px-1.5 py-0.5 rounded border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]"
      >
        值使
      </span>
    </div>

    <!-- 旬空标记 -->
    <div v-if="isKongwang" class="absolute inset-0 rounded-xl bg-black/20 pointer-events-none" />

    <!-- 用神高亮 -->
    <div v-if="isYongShen" class="absolute inset-0 rounded-xl border-2 border-[var(--accent)] pointer-events-none" />
  </div>
</template>

<script setup lang="ts">
import type { PalaceData } from '~/types/qimen'

const props = defineProps<{
  data: PalaceData
  zhifuPalace: number
  zhishiPalace: number
  kongwangPalaces: number[]
  yongShenPalace?: number
}>()

const { t } = useI18n()

const palaceName = computed(() => t(`qimen.palaceNames.${props.data.palace}`))
const direction = computed(() => t(`qimen.palaceDirections.${props.data.palace}`))

const isZhifu = computed(() => props.data.palace === props.zhifuPalace)
const isZhishi = computed(() => props.data.palace === props.zhishiPalace)
const isKongwang = computed(() => props.kongwangPalaces.includes(props.data.palace))
const isYongShen = computed(() => props.yongShenPalace === props.data.palace)

// 五行配色
const wuxingColorMap: Record<string, string> = {
  '坎': 'rgba(96, 165, 250, 0.08)',
  '坤': 'rgba(163, 133, 90, 0.08)',
  '震': 'rgba(74, 222, 128, 0.08)',
  '巽': 'rgba(74, 222, 128, 0.08)',
  '中': 'rgba(163, 133, 90, 0.08)',
  '乾': 'rgba(226, 201, 106, 0.08)',
  '兑': 'rgba(226, 201, 106, 0.08)',
  '艮': 'rgba(163, 133, 90, 0.08)',
  '离': 'rgba(249, 115, 22, 0.08)',
}

const tileClass = computed(() => {
  const base = 'border-[var(--border-light)] bg-[var(--surface-card)]'
  if (props.data.is_center) return `${base} opacity-70`
  return base
})

const tileStyle = computed(() => {
  const color = wuxingColorMap[palaceName.value?.charAt(0) || ''] || 'transparent'
  return {
    backgroundColor: `color-mix(in srgb, var(--surface-card) 90%, ${color})`,
    minHeight: '100px',
  }
})
</script>
