<template>
  <div class="space-y-5">
    <!-- 事件类型 -->
    <div>
      <label class="block text-sm text-[var(--text-muted)] mb-2">
        {{ $t('qimen.form.eventType') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          v-for="t in eventTypes"
          :key="t.value"
          type="button"
          class="py-2.5 px-3 rounded-xl border text-xs font-medium transition-all duration-200 text-center"
          :class="form.eventType === t.value
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
          @click="form.eventType = t.value"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- 起课时间 -->
    <DivinationTimeCard
      ref="timeCardRef"
      :label="$t('qimen.form.time')"
      :hint="timeHint"
      required
    />

    <!-- 描述 -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm text-[var(--text-muted)]">
          {{ $t('qimen.form.description') }}
        </label>
        <QuestionInspiration :extra-categories="qimenExtraCategories" @select="q => form.description = q" />
      </div>
      <UTextarea
        v-model="form.description"
        :placeholder="descriptionPlaceholder"
        class="w-full"
        :ui="inputUi"
        :rows="3"
      />
    </div>

    <!-- competition 额外字段 -->
    <template v-if="form.eventType === 'competition'">
      <div>
        <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.opponentDesc') }}</label>
        <UInput v-model="form.extra.opponentDesc" :placeholder="$t('qimen.form.opponentDescPlaceholder')" class="w-full" :ui="inputUi" />
      </div>
      <div>
        <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.myGoal') }}</label>
        <UInput v-model="form.extra.myGoal" :placeholder="$t('qimen.form.myGoalPlaceholder')" class="w-full" :ui="inputUi" />
      </div>
    </template>

    <!-- seeking 额外字段 -->
    <template v-if="form.eventType === 'seeking'">
      <div>
        <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.lastSeenTime') }}</label>
        <UInput v-model="form.extra.lastSeenTime" :placeholder="$t('qimen.form.lastSeenTimePlaceholder')" class="w-full" :ui="inputUi" />
      </div>
      <div>
        <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.lastSeenPlace') }}</label>
        <UInput v-model="form.extra.lastSeenPlace" :placeholder="$t('qimen.form.lastSeenPlacePlaceholder')" class="w-full" :ui="inputUi" />
      </div>
      <div>
        <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.targetDesc') }}</label>
        <UInput v-model="form.extra.targetDesc" :placeholder="$t('qimen.form.targetDescPlaceholder')" class="w-full" :ui="inputUi" />
      </div>
      <div>
        <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.relationship') }}</label>
        <UInput v-model="form.extra.relationship" :placeholder="$t('qimen.form.relationshipPlaceholder')" class="w-full" :ui="inputUi" />
      </div>
    </template>

    <!-- timing 额外字段 -->
    <template v-if="form.eventType === 'timing'">
      <div>
        <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.eventKind') }}</label>
        <UInput v-model="form.extra.eventKind" :placeholder="$t('qimen.form.eventKindPlaceholder')" class="w-full" :ui="inputUi" />
      </div>
      <div>
        <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.timeRange') }}</label>
        <UInput v-model="form.extra.timeRange" :placeholder="$t('qimen.form.timeRangePlaceholder')" class="w-full" :ui="inputUi" />
      </div>
      <div>
        <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.targetDirection') }}</label>
        <UInput v-model="form.extra.targetDirection" :placeholder="$t('qimen.form.targetDirectionPlaceholder')" class="w-full" :ui="inputUi" />
      </div>
    </template>

    <!-- 提交按钮 -->
    <UButton
      color="warning"
      size="lg"
      block
      :disabled="!canSubmit"
      class="shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[var(--accent-shadow-hover)] transition-all duration-300"
      @click="handleSubmit"
    >
      <template #leading>
        <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
      </template>
      {{ $t('qimen.form.submitBtn') }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { EventType } from '~~/server/utils/qimen/types'

const emit = defineEmits<{
  submit: [payload: { eventType: EventType; description?: string; extra?: Record<string, any>; questionTime: string }]
}>()

const { t } = useI18n()

const timeCardRef = ref<{ iso: Ref<string> } | null>(null)

const form = reactive({
  eventType: 'general' as EventType,
  description: '',
  extra: {} as Record<string, any>,
})

const eventTypes = computed(() => [
  { value: 'competition' as EventType, label: t('qimen.eventType.competition') },
  { value: 'decision' as EventType, label: t('qimen.eventType.decision') },
  { value: 'seeking' as EventType, label: t('qimen.eventType.seeking') },
  { value: 'timing' as EventType, label: t('qimen.eventType.timing') },
  { value: 'general' as EventType, label: t('qimen.eventType.general') },
])

const timeHint = computed(() => {
  if (form.eventType === 'seeking') {
    return t('qimen.form.timeHintSeeking')
  }
  return t('qimen.form.timeHint')
})

const descriptionPlaceholder = computed(() => {
  const map: Record<string, string> = {
    competition: t('qimen.form.descriptionPlaceholderCompetition'),
    decision: t('qimen.form.descriptionPlaceholderDecision'),
    seeking: t('qimen.form.descriptionPlaceholderSeeking'),
    timing: t('qimen.form.descriptionPlaceholderTiming'),
    general: t('qimen.form.descriptionPlaceholderGeneral'),
  }
  return map[form.eventType] || ''
})

const canSubmit = computed(() => {
  return !!form.eventType
})

const qimenExtraCategories = [
  {
    key: 'decision',
    groups: [
      { key: 'decisionTiming', questions: ['decisionTiming1', 'decisionTiming2', 'decisionTiming3', 'decisionTiming4', 'decisionTiming5', 'decisionTiming6'] },
      { key: 'decisionLayout', questions: ['decisionLayout1', 'decisionLayout2', 'decisionLayout3', 'decisionLayout4', 'decisionLayout5', 'decisionLayout6'] },
      { key: 'decisionGame', questions: ['decisionGame1', 'decisionGame2', 'decisionGame3', 'decisionGame4', 'decisionGame5', 'decisionGame6'] },
      { key: 'decisionDirection', questions: ['decisionDirection1', 'decisionDirection2', 'decisionDirection3', 'decisionDirection4', 'decisionDirection5', 'decisionDirection6'] },
    ],
  },
]

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

function handleSubmit() {
  if (!canSubmit.value) return

  const extra = Object.keys(form.extra).length > 0 ? { ...form.extra } : undefined

  emit('submit', {
    eventType: form.eventType,
    description: form.description || undefined,
    extra,
    questionTime: (timeCardRef.value?.iso as unknown as Ref<string>).value || new Date().toISOString(),
  })
}
</script>
