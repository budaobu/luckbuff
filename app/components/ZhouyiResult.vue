<template>
  <div class="space-y-5">
    <!-- 起卦信息 -->
    <div ref="qiguaInfoRef">
      <GlowCard :title="t('zhouyi.castingInfo')" icon="i-heroicons-information-circle">
        <div class="space-y-1.5">
          <p class="text-xs text-[var(--text-muted)]">
            {{ t('zhouyi.castingMethod') }}{{ result.methodName }}
          </p>
          <p v-if="result.lunarDate" class="text-xs text-[var(--text-muted)]">
            {{ t('zhouyi.lunarDate') }}{{ result.lunarDate.year }}年{{ result.lunarDate.isLeap ? t('zhouyi.leapMonth') : '' }}{{ result.lunarDate.month }}月{{ result.lunarDate.day }}日 · {{ result.lunarDate.dizhi }}年
          </p>
          <pre class="text-[11px] text-[var(--text-faint)] leading-relaxed whitespace-pre-wrap font-mono">{{ result.calcDetail }}</pre>
        </div>
      </GlowCard>
    </div>

    <!-- 本卦 → 互卦 → 变卦 -->
    <div class="grid grid-cols-3 gap-3">
      <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
        <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ t('zhouyi.benGuaLabel') }}</p>
        <p class="text-lg font-bold text-[var(--text-primary)]">{{ benGua?.name }}</p>
        <p class="text-xs text-[var(--text-muted)] mt-1">{{ benGua?.meaning }}</p>
        <p class="text-[10px] text-[var(--accent-muted)] mt-1">{{ t('zhouyi.dongYaoLabel') }}{{ result.dongYao }}{{ t('zhouyi.yaoLabel') }}</p>
      </div>
      <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
        <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ t('zhouyi.huGuaLabel') }}</p>
        <p class="text-lg font-bold text-[var(--text-primary)]">{{ huGua?.name }}</p>
        <p class="text-xs text-[var(--text-muted)] mt-1">{{ huGua?.meaning }}</p>
        <p class="text-[10px] text-[var(--accent-muted)] mt-1">{{ result.timeLevels.huGua }}</p>
      </div>
      <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
        <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ t('zhouyi.bianGuaLabel') }}</p>
        <p class="text-lg font-bold text-[var(--text-primary)]">{{ bianGua?.name }}</p>
        <p class="text-xs text-[var(--text-muted)] mt-1">{{ bianGua?.meaning }}</p>
        <p class="text-[10px] text-[var(--accent-muted)] mt-1">{{ result.timeLevels.bianGua }}</p>
      </div>
    </div>

    <!-- 体用分析 -->
    <div class="grid grid-cols-2 gap-3">
      <!-- 体卦 -->
      <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-6 h-6 rounded-md bg-[var(--accent-bg)] flex items-center justify-center text-[var(--accent)]">
            <UIcon name="i-heroicons-user" class="w-3.5 h-3.5" />
          </div>
          <span class="text-xs font-medium text-[var(--text-muted)]">{{ t('zhouyi.tiGuaLabel') }}</span>
        </div>
        <p class="text-base font-bold text-[var(--text-primary)]">
          {{ getGuaById(result.tiGuaId)?.name }} · {{ result.tiWuxing }}
        </p>
        <div class="flex items-center gap-2 mt-2">
          <span class="text-[10px] px-2 py-0.5 rounded-full" :class="wangshuaiClass(result.tiWangshuai)">
            {{ result.tiWangshuai }}
          </span>
          <span class="text-[10px] text-[var(--text-faint)]">{{ t('zhouyi.seasonWuxing') }}：{{ result.seasonWuxing }}</span>
        </div>
      </div>
      <!-- 用卦 -->
      <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-6 h-6 rounded-md bg-[var(--surface-card-hover)] flex items-center justify-center text-[var(--text-muted)]">
            <UIcon name="i-heroicons-globe-alt" class="w-3.5 h-3.5" />
          </div>
          <span class="text-xs font-medium text-[var(--text-muted)]">{{ t('zhouyi.yongGuaLabel') }}</span>
        </div>
        <p class="text-base font-bold text-[var(--text-primary)]">
          {{ getGuaById(result.yongGuaId)?.name }} · {{ result.yongWuxing }}
        </p>
        <div class="flex items-center gap-2 mt-2">
          <span class="text-[10px] px-2 py-0.5 rounded-full" :class="wangshuaiClass(result.yongWangshuai)">
            {{ result.yongWangshuai }}
          </span>
          <span class="text-[10px] text-[var(--text-faint)]">{{ t('zhouyi.seasonWuxing') }}：{{ result.seasonWuxing }}</span>
        </div>
      </div>
    </div>

    <!-- 生克吉凶 -->
    <div class="rounded-xl border border-[var(--border-light)] p-4" :class="shengkeBgClass">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-scale" class="w-4 h-4" :class="shengkeIconClass" />
          <span class="text-sm font-semibold" :class="shengkeTextClass">
            {{ t('zhouyi.tiYongRelation') }}{{ result.shengkeRelation }}
          </span>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="shengkeBadgeClass">
          {{ result.shengkeResult }}
        </span>
      </div>
    </div>

    <!-- 策略建议 -->
    <GlowCard v-if="result.strategyType" :title="t('zhouyi.strategySuggestion')" icon="i-heroicons-light-bulb">
      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <span class="text-[10px] px-2 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent)]">
            {{ $t('zhouyi.strategyType') }}：{{ result.strategyType }}
          </span>
          <span class="text-[10px] px-2 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent)]">
            {{ $t('zhouyi.strategyAction') }}：{{ result.strategyAction }}
          </span>
          <span class="text-[10px] px-2 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent)]">
            {{ $t('zhouyi.jiRate') }}：{{ result.jiRate }}%
          </span>
        </div>
        <div class="rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-3">
          <p class="text-xs font-medium text-[var(--text-primary)] mb-1">{{ t('zhouyi.nextStep') }}</p>
          <p class="text-sm text-[var(--text-muted)] leading-relaxed">{{ result.strategyNextStep }}</p>
        </div>
        <p v-if="result.changePath" class="text-[11px] text-[var(--text-faint)]">
          {{ t('zhouyi.bianGuaPath') }}{{ result.changePath }}
        </p>
      </div>
    </GlowCard>

    <!-- 爻位风险 -->
    <GlowCard v-if="result.positionRisk" :title="t('zhouyi.dongYaoAnalysis')" icon="i-heroicons-bolt">
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-[var(--text-primary)]">{{ t('zhouyi.dongYaoLabel') }}{{ result.dongYao }}{{ t('zhouyi.yaoLabel') }}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full" :class="riskBadgeClass">
            {{ result.positionRisk.riskLevel }}
          </span>
          <span class="text-[10px] text-[var(--text-faint)]">{{ t('zhouyi.coefficient') }}：{{ result.positionRisk.coefficient.toFixed(3) }}</span>
        </div>
        <p v-if="result.positionRisk.warning" class="text-xs text-amber-400/80">
          {{ result.positionRisk.warning }}
        </p>
        <p v-if="yaoCi" class="text-sm text-[var(--text-muted)] leading-relaxed">
          <span class="text-[var(--accent-muted)]">{{ t('zhouyi.yaoCi') }}</span>{{ yaoCi }}
        </p>
      </div>
    </GlowCard>

    <!-- AI 断语 -->
    <ZhouyiAiInterpretation
      :content="aiStream.content"
      :streaming="aiStream.streaming"
      :started="aiStream.started"
      :error="aiStream.error"
    />

    <!-- 重试按钮 -->
    <div v-if="aiStream.error" class="flex justify-center">
      <UButton
        color="warning"
        variant="soft"
        class="group/btn"
        @click="$emit('retry')"
      >
        <template #leading>
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
        </template>
        {{ t('zhouyi.regenerateAi') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MeihuaResult } from '~/types/zhouyi'
import { getGuaById } from '~/utils/zhouyi/constants'
import { YAOCI } from '~/utils/zhouyi/yaoci'

const { t } = useI18n()

const props = defineProps<{
  result: MeihuaResult
  aiStream: {
    content: string
    streaming: boolean
    started: boolean
    error: string | null
  }
}>()

defineEmits<{
  retry: []
}>()

const qiguaInfoRef = ref<HTMLDivElement>()

defineExpose({
  shareTarget: qiguaInfoRef,
})

// 计算属性
const benGua = computed(() => getGuaById(props.result.benGuaId))
const bianGua = computed(() => getGuaById(props.result.bianGuaId))
const huGua = computed(() => getGuaById(props.result.huGuaId))
const yaoCi = computed(() => YAOCI[props.result.benGuaId]?.[props.result.dongYao] || '')

// 旺衰颜色
function wangshuaiClass(w: string) {
  switch (w) {
    case '旺': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case '相': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case '休': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    case '囚': return 'bg-red-500/10 text-red-400 border border-red-500/20'
    case '死': return 'bg-red-500/10 text-red-400 border border-red-500/20'
    default: return 'bg-[var(--surface-card-hover)] text-[var(--text-faint)] border border-[var(--border-light)]'
  }
}

// 生克吉凶样式
const shengkeBgClass = computed(() => {
  switch (props.result.shengkeResult) {
    case '大吉': return 'bg-emerald-500/5 border-emerald-500/20'
    case '吉': return 'bg-[var(--accent-faint)] border-[var(--accent-border)]'
    case '凶': return 'bg-red-500/5 border-red-500/20'
    case '泄耗': return 'bg-amber-500/5 border-amber-500/20'
    default: return 'bg-[var(--surface-card)] border-[var(--border-light)]'
  }
})

const shengkeTextClass = computed(() => {
  switch (props.result.shengkeResult) {
    case '大吉': return 'text-emerald-400'
    case '吉': return 'text-[var(--accent)]'
    case '凶': return 'text-red-400'
    case '泄耗': return 'text-amber-400'
    default: return 'text-[var(--text-muted)]'
  }
})

const shengkeIconClass = computed(() => {
  switch (props.result.shengkeResult) {
    case '大吉': return 'text-emerald-400'
    case '吉': return 'text-[var(--accent)]'
    case '凶': return 'text-red-400'
    case '泄耗': return 'text-amber-400'
    default: return 'text-[var(--text-muted)]'
  }
})

const shengkeBadgeClass = computed(() => {
  switch (props.result.shengkeResult) {
    case '大吉': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case '吉': return 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]'
    case '凶': return 'bg-red-500/10 text-red-400 border border-red-500/20'
    case '泄耗': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    default: return 'bg-[var(--surface-card-hover)] text-[var(--text-muted)] border border-[var(--border-light)]'
  }
})

// 风险等级样式
const riskBadgeClass = computed(() => {
  switch (props.result.positionRisk?.riskLevel) {
    case '高风险': return 'bg-red-500/10 text-red-400 border border-red-500/20'
    case '较差': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    case '最佳': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case '佳': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    default: return 'bg-[var(--surface-card-hover)] text-[var(--text-muted)] border border-[var(--border-light)]'
  }
})
</script>
