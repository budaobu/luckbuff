<template>
  <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden max-w-md mx-auto">
    <!-- 顶部金色渐变线 -->
    <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />

    <div class="p-6 space-y-5">
      <!-- 标题 -->
      <div class="text-center">
        <p class="text-xs text-[var(--accent-muted)] tracking-wider mb-1">{{ $t('zwds.meihuaTitle') }}</p>
        <h2 class="text-xl font-bold text-[var(--text-primary)]">{{ benGua?.name }} → {{ bianGua?.name }}</h2>
      </div>

      <!-- 本卦 / 互卦 / 变卦 -->
      <div class="flex items-center justify-around">
        <div class="text-center">
          <p class="text-[10px] text-[var(--text-muted)] mb-1">{{ $t('zwds.benGua') }}</p>
          <p class="text-lg font-bold text-[var(--accent)]">{{ benGua?.name }}</p>
        </div>
        <div class="text-[var(--text-placeholder)]">→</div>
        <div class="text-center">
          <p class="text-[10px] text-[var(--text-muted)] mb-1">{{ $t('zwds.huGua') }}</p>
          <p class="text-lg font-bold text-[var(--accent)]">{{ huGua?.name }}</p>
        </div>
        <div class="text-[var(--text-placeholder)]">→</div>
        <div class="text-center">
          <p class="text-[10px] text-[var(--text-muted)] mb-1">{{ $t('zwds.bianGua') }}</p>
          <p class="text-lg font-bold text-[var(--accent)]">{{ bianGua?.name }}</p>
        </div>
      </div>

      <!-- 体用 + 生克 -->
      <div class="flex items-center justify-center gap-4">
        <div class="text-center">
          <p class="text-[10px] text-[var(--text-muted)]">{{ $t('zwds.tiGua') }}</p>
          <p class="text-sm font-bold text-[var(--accent)]">{{ tiGua?.name }}</p>
          <p class="text-[10px] text-[var(--text-muted)]">{{ result.tiWuxing }}</p>
        </div>
        <div class="text-center px-3 py-1.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)]">
          <p class="text-xs font-medium" :class="shengkeTextClass">{{ result.shengkeRelation }}</p>
          <p class="text-[10px]" :class="shengkeTextClass">{{ result.shengkeResult }}</p>
        </div>
        <div class="text-center">
          <p class="text-[10px] text-[var(--text-muted)]">{{ $t('zwds.yongGua') }}</p>
          <p class="text-sm font-bold text-[var(--accent)]">{{ yongGua?.name }}</p>
          <p class="text-[10px] text-[var(--text-muted)]">{{ result.yongWuxing }}</p>
        </div>
      </div>

      <!-- 爻象 -->
      <div class="flex justify-center">
        <div class="space-y-1.5">
          <div
            v-for="i in 6"
            :key="i"
            class="flex items-center gap-2"
          >
            <span class="text-[10px] text-[var(--text-faint)] w-6">{{ 7 - i }}爻</span>
            <div
              class="h-2.5 rounded"
              :class="[
                getYaoClass(6 - i),
                result.dongYao === (7 - i) ? 'ring-1 ring-[#c9a227]' : '',
              ]"
              :style="{ width: '80px' }"
            />
            <span
              v-if="result.dongYao === (7 - i)"
              class="text-[10px] text-[var(--accent)]"
            >{{ $t('zwds.dongLabel') }}</span>
          </div>
        </div>
      </div>

      <!-- 卦辞 -->
      <div class="space-y-2 text-xs text-[var(--text-muted)] leading-relaxed">
        <p>
          <span class="text-[var(--accent)]">{{ $t('zwds.benGua') }}《{{ benGua?.name }}》：</span>
          {{ benGua?.meaning }}。{{ benGua?.guaci }}
        </p>
        <p>
          <span class="text-[var(--accent)]">{{ $t('zwds.bianGua') }}《{{ bianGua?.name }}》：</span>
          {{ bianGua?.meaning }}。{{ bianGua?.guaci }}
        </p>
      </div>
    </div>

    <!-- 底部 -->
    <div class="px-5 py-3 border-t border-[var(--border-light)] text-center">
      <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('zwds.disclaimer') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MeihuaResult } from '~/types/zhouyi'
import { getGuaById, getYaoArray } from '~/utils/zhouyi/constants'

interface Props {
  result: MeihuaResult
}

const props = defineProps<Props>()
const { t } = useI18n()

const benGua = computed(() => getGuaById(props.result.benGuaId))
const bianGua = computed(() => getGuaById(props.result.bianGuaId))
const huGua = computed(() => getGuaById(props.result.huGuaId))
const tiGua = computed(() => getGuaById(props.result.tiGuaId))
const yongGua = computed(() => getGuaById(props.result.yongGuaId))

const benYaoArray = computed(() => benGua.value ? getYaoArray(benGua.value) : [])

function getYaoClass(index: number): string {
  const yao = benYaoArray.value[index]
  return yao === 1 ? 'bg-[var(--accent)]' : 'bg-transparent border-2 border-[var(--accent-border-hover)]'
}

const shengkeTextClass = computed(() => {
  switch (props.result.shengkeResult) {
    case '大吉': return 'text-emerald-400'
    case '吉': return 'text-[var(--accent)]'
    case '凶': return 'text-red-400'
    case '泄耗': return 'text-amber-400'
    default: return 'text-[var(--text-muted)]'
  }
})
</script>
