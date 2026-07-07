<template>
  <div
    class="relative rounded-lg border p-2 flex flex-col items-center justify-center text-center min-h-[90px] transition-all"
    :class="[
      borderClass,
      bgClass,
      palace.gong === 5 ? 'opacity-80' : '',
    ]"
  >
    <!-- 宫名 + 方向 -->
    <div class="text-[10px] text-[var(--text-faint)] mb-0.5 leading-tight">
      {{ palaceName }}·{{ palace.direction }}
    </div>

    <!-- 天盘干（大字） -->
    <div class="text-base font-bold text-[var(--text-primary)] leading-tight">
      {{ ganLabel(palace.tianpan) }}
    </div>

    <!-- 地盘干（小字） -->
    <div class="text-[9px] text-[var(--text-muted)] leading-tight">
      {{ ganLabel(palace.dipan) }}
    </div>

    <!-- 星 · 门 -->
    <div class="flex items-center gap-1 mt-0.5">
      <span class="text-[10px] text-[var(--accent-muted)]">{{ palace.xing }}</span>
      <span v-if="palace.men" class="text-[9px] text-[var(--text-faint)]">·</span>
      <span v-if="palace.men" :class="menClass">{{ palace.men }}</span>
    </div>

    <!-- 神 -->
    <div class="text-[9px] text-[var(--accent-muted)] mt-0.5">
      {{ palace.shen }}
    </div>

    <!-- 值符/值使 badge -->
    <div v-if="palace.isZhiFu || palace.isZhiShi" class="flex gap-1 mt-1">
      <span
        v-if="palace.isZhiFu"
        class="text-[8px] px-1 py-px rounded border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]"
      >
        值符
      </span>
      <span
        v-if="palace.isZhiShi"
        class="text-[8px] px-1 py-px rounded border border-amber-500/30 bg-amber-500/10 text-amber-400"
      >
        值使
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Palace } from '~~/server/utils/qimen/types'

const props = defineProps<{
  palace: Palace
  zhifuGong: number
  zhishiGong: number
}>()

const { t } = useI18n()

const palaceName = computed(() => {
  const names: Record<number, string> = { 1: '坎', 2: '坤', 3: '震', 4: '巽', 5: '中', 6: '乾', 7: '兑', 8: '艮', 9: '离' }
  return names[props.palace.gong] || ''
})

const menClass = computed(() => {
  const men = props.palace.men
  if (!men) return ''
  const ji = ['生门', '开门', '休门']
  const xiong = ['死门', '惊门', '伤门']
  if (ji.includes(men)) return 'text-[10px] font-medium text-emerald-400'
  if (xiong.includes(men)) return 'text-[10px] font-medium text-red-400'
  return 'text-[10px] text-[var(--text-muted)]'
})

const borderClass = computed(() => {
  if (props.palace.isZhiFu) return 'border-[var(--accent-border)]'
  if (props.palace.isZhiShi) return 'border-amber-500/30'
  return 'border-[var(--border-light)]'
})

function ganLabel(gan: string): string {
  const map: Record<string, string> = {
    wu: '戊', ji: '己', geng: '庚', xin: '辛', ren: '壬', gui: '癸',
    yi: '乙', bing: '丙', ding: '丁',
  }
  return map[gan] || gan
}

const bgClass = computed(() => {
  const wuxingMap: Record<string, string> = {
    '坎': 'bg-blue-500/[0.04]',
    '坤': 'bg-amber-500/[0.04]',
    '震': 'bg-green-500/[0.04]',
    '巽': 'bg-green-500/[0.04]',
    '中': 'bg-amber-500/[0.04]',
    '乾': 'bg-yellow-500/[0.04]',
    '兑': 'bg-yellow-500/[0.04]',
    '艮': 'bg-amber-500/[0.04]',
    '离': 'bg-orange-500/[0.04]',
  }
  const name = palaceName.value
  return wuxingMap[name] || 'bg-[var(--surface-card)]'
})
</script>
