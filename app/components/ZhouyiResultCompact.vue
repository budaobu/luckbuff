<template>
  <div class="rounded-2xl border border-white/8 bg-[#1a1612] overflow-hidden max-w-md mx-auto">
    <!-- 顶部金色渐变线 -->
    <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />

    <div class="p-6 space-y-5">
      <!-- 标题 -->
      <div class="text-center">
        <p class="text-xs text-[#c9a227]/60 tracking-wider mb-1">梅花易数 · 卦象结果</p>
        <h2 class="text-xl font-bold text-[#f5e6c0]">{{ benGua?.name }} → {{ bianGua?.name }}</h2>
      </div>

      <!-- 本卦 / 互卦 / 变卦 -->
      <div class="flex items-center justify-around">
        <div class="text-center">
          <p class="text-[10px] text-[#e8e0d0]/50 mb-1">本卦</p>
          <p class="text-lg font-bold text-[#c9a227]">{{ benGua?.name }}</p>
        </div>
        <div class="text-[#e8e0d0]/30">→</div>
        <div class="text-center">
          <p class="text-[10px] text-[#e8e0d0]/50 mb-1">互卦</p>
          <p class="text-lg font-bold text-[#c9a227]">{{ huGua?.name }}</p>
        </div>
        <div class="text-[#e8e0d0]/30">→</div>
        <div class="text-center">
          <p class="text-[10px] text-[#e8e0d0]/50 mb-1">变卦</p>
          <p class="text-lg font-bold text-[#c9a227]">{{ bianGua?.name }}</p>
        </div>
      </div>

      <!-- 体用 + 生克 -->
      <div class="flex items-center justify-center gap-4">
        <div class="text-center">
          <p class="text-[10px] text-[#e8e0d0]/50">体卦</p>
          <p class="text-sm font-bold text-[#c9a227]">{{ tiGua?.name }}</p>
          <p class="text-[10px] text-[#e8e0d0]/60">{{ result.tiWuxing }}</p>
        </div>
        <div class="text-center px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <p class="text-xs font-medium" :class="shengkeTextClass">{{ result.shengkeRelation }}</p>
          <p class="text-[10px]" :class="shengkeTextClass">{{ result.shengkeResult }}</p>
        </div>
        <div class="text-center">
          <p class="text-[10px] text-[#e8e0d0]/50">用卦</p>
          <p class="text-sm font-bold text-[#c9a227]">{{ yongGua?.name }}</p>
          <p class="text-[10px] text-[#e8e0d0]/60">{{ result.yongWuxing }}</p>
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
            <span class="text-[10px] text-[#e8e0d0]/40 w-6">{{ 7 - i }}爻</span>
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
              class="text-[10px] text-[#c9a227]"
            >动</span>
          </div>
        </div>
      </div>

      <!-- 卦辞 -->
      <div class="space-y-2 text-xs text-[#e8e0d0]/70 leading-relaxed">
        <p>
          <span class="text-[#c9a227]">本卦《{{ benGua?.name }}》：</span>
          {{ benGua?.meaning }}。{{ benGua?.guaci }}
        </p>
        <p>
          <span class="text-[#c9a227]">变卦《{{ bianGua?.name }}》：</span>
          {{ bianGua?.meaning }}。{{ bianGua?.guaci }}
        </p>
      </div>
    </div>

    <!-- 底部 -->
    <div class="px-5 py-3 border-t border-white/[0.06] text-center">
      <p class="text-[10px] text-[#e8e0d0]/30">由 LuckBuff 生成 · 仅供娱乐参考</p>
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

const benGua = computed(() => getGuaById(props.result.benGuaId))
const bianGua = computed(() => getGuaById(props.result.bianGuaId))
const huGua = computed(() => getGuaById(props.result.huGuaId))
const tiGua = computed(() => getGuaById(props.result.tiGuaId))
const yongGua = computed(() => getGuaById(props.result.yongGuaId))

const benYaoArray = computed(() => benGua.value ? getYaoArray(benGua.value) : [])

function getYaoClass(index: number): string {
  const yao = benYaoArray.value[index]
  return yao === 1 ? 'bg-[#c9a227]' : 'bg-transparent border-2 border-[#c9a227]/60'
}

const shengkeTextClass = computed(() => {
  switch (props.result.shengkeResult) {
    case '大吉': return 'text-emerald-400'
    case '吉': return 'text-[#c9a227]'
    case '凶': return 'text-red-400'
    case '泄耗': return 'text-amber-400'
    default: return 'text-[#e8e0d0]/70'
  }
})
</script>
