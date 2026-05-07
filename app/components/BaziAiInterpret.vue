<template>
  <div class="space-y-5">
    <!-- 免责声明 -->
    <div class="flex items-start gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5">
      <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-[#c9a227]/50 mt-0.5 shrink-0" />
      <p class="text-xs text-[#e8e0d0]/30 leading-relaxed">
        AI 解读每次表述略有差异，排盘数据（干支/十神/大运）为确定性计算。
      </p>
    </div>

    <!-- 加载中：命盘预览 + 动画 -->
    <div v-if="!aiStream.started">
      <BaziPanPreview :chart="chart" class="mb-4 opacity-60" />
      <div class="flex flex-col items-center py-6">
        <TianganDizhi size="compact" label="AI 正在解读命盘..." />
      </div>
    </div>

    <!-- 结构化结果展示 -->
    <Transition name="fade">
      <div v-if="aiResult" class="space-y-5">
        <!-- 人生总论 -->
        <div class="relative rounded-2xl bg-gradient-to-br from-[#c9a227]/[0.08] to-[#8b5cf6]/[0.04] backdrop-blur-sm overflow-hidden border border-[#c9a227]/10">
          <div class="relative z-10 p-5 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227]">
              <UIcon name="i-heroicons-star" class="w-6 h-6" />
            </div>
            <div>
              <p class="text-[11px] text-[#c9a227]/60 tracking-wider uppercase mb-1">人生总论</p>
              <p class="text-base font-semibold text-[#f5e6c0] leading-relaxed">{{ aiResult.overview }}</p>
            </div>
          </div>
        </div>

        <!-- 四维度卡片 2x2 网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DimensionCard
            title="性格特质"
            icon="i-heroicons-user"
            accent-color="#8b5cf6"
            :data="aiResult.personality"
          />
          <DimensionCard
            title="事业与财运"
            icon="i-heroicons-briefcase"
            accent-color="#c9a227"
            :data="aiResult.career"
            :extra-field="{ label: '财运走势', value: aiResult.career.wealthTrend, icon: 'i-heroicons-arrow-trending-up' }"
          />
          <DimensionCard
            title="感情与婚姻"
            icon="i-heroicons-heart"
            accent-color="#ef4444"
            :data="aiResult.relationship"
            :extra-field="{ label: '婚恋时机', value: aiResult.relationship.timing, icon: 'i-heroicons-clock' }"
          />
          <DimensionCard
            title="健康与生活"
            icon="i-heroicons-bolt"
            accent-color="#10b981"
            :data="aiResult.health"
            :extra-field="{ label: '注意时节', value: aiResult.health.seasons, icon: 'i-heroicons-calendar' }"
          />
        </div>

        <!-- 运势五维分析 -->
        <FortuneRadar :scores="aiResult.dimensionScores" />

        <!-- 大运运势图 -->
        <DayunCandlestick
          :dayuns="chart.dayuns"
          :current-age="chart.currentAge"
          :dayun-scores="aiResult.dayunScores"
        />

        <!-- 历史事件校准 -->
        <div class="relative rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />
          <div class="relative z-10 p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-9 h-9 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6]">
                <UIcon name="i-heroicons-clock" class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-[#f5e6c0] tracking-wide">历史事件校准</h3>
                <p class="text-[11px] text-[#e8e0d0]/40 mt-0.5">根据命盘推算的关键时期，供对照参考</p>
              </div>
            </div>
            <div class="space-y-2.5">
              <div
                v-for="p in aiResult.historicalPredictions"
                :key="p.year"
                class="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:bg-white/[0.04]"
              >
                <div class="shrink-0 mt-0.5">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#c9a227]/10 text-[#c9a227] text-[10px] font-bold">
                    {{ p.age }}
                  </span>
                </div>
                <div class="min-w-0">
                  <p class="text-[11px] text-[#e8e0d0]/40 mb-0.5">{{ p.year }}年</p>
                  <p class="text-sm text-[#e8e0d0]/80 leading-relaxed">{{ p.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="absolute inset-0 rounded-2xl border border-white/[0.06] pointer-events-none" />
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/10 to-transparent" />
        </div>

        <!-- 综合建议 -->
        <div class="relative rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent" />
          <div class="relative z-10 p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-9 h-9 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227]">
                <UIcon name="i-heroicons-light-bulb" class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-[#f5e6c0] tracking-wide">综合建议</h3>
                <p class="text-[11px] text-[#e8e0d0]/40 mt-0.5">基于命盘特征的实用指引</p>
              </div>
            </div>
            <div class="space-y-2.5">
              <div
                v-for="(advice, i) in aiResult.comprehensiveAdvice"
                :key="i"
                class="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:bg-white/[0.04]"
              >
                <div class="shrink-0 mt-0.5">
                  <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#c9a227]/10 text-[#c9a227] text-[10px] font-bold">
                    {{ i + 1 }}
                  </span>
                </div>
                <p class="text-sm text-[#e8e0d0]/80 leading-relaxed min-w-0">{{ advice }}</p>
              </div>
            </div>
          </div>
          <div class="absolute inset-0 rounded-2xl border border-white/[0.06] pointer-events-none" />
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/10 to-transparent" />
        </div>
      </div>
    </Transition>

    <!-- AI 错误 -->
    <div v-if="aiStream.error" class="text-center py-8">
      <TianganDizhi size="compact" label="AI 服务暂时繁忙" />
      <p class="mt-4 text-sm text-red-400">{{ aiStream.error }}</p>
      <UButton color="warning" class="mt-4" @click="$emit('retry')">
        <template #leading>
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
        </template>
        重试
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BaziChart, BaziAiResult } from '~/types/bazi'

interface Props {
  chart: BaziChart
  aiStream: {
    content: string
    streaming: boolean
    started: boolean
    error: string | null
  }
  aiResult: BaziAiResult | null
}

defineProps<Props>()
defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
