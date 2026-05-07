<template>
  <div class="space-y-4">
    <!-- 普通文字卡片（不含五行平衡） -->
    <GlowCard
      v-for="(text, title) in textAnalysis"
      :key="title"
      :title="title"
    >
      <p class="text-sm text-[#e8e0d0]/80 leading-relaxed">{{ text }}</p>
    </GlowCard>

    <!-- 五行力量分布 -->
    <WuxingAnalysis
      :wuxing-score="props.chart.wuxingScore"
      :analysis-text="analysis['五行平衡']"
    />
  </div>
</template>

<script setup lang="ts">
import type { BaziChart } from '~/types/bazi'
import { generateAnalysis } from '~/utils/bazi/analysisText'

interface Props {
  chart: BaziChart
}

const props = defineProps<Props>()

const analysis = computed(() => generateAnalysis(props.chart))

// 分离出五行平衡，其余用文字卡片展示
const textAnalysis = computed(() => {
  const { 五行平衡: _, ...rest } = analysis.value
  return rest
})

function getSummary(): string {
  return Object.entries(analysis.value).map(([k, v]) => `【${k}】${v}`).join('\n\n')
}

defineExpose({ getSummary })
</script>
