<template>
  <div class="space-y-5">
    <!-- 所问事项（合并后的必填文本框） -->
    <div>
      <label class="block text-sm text-[var(--text-muted)] mb-2">
        {{ $t('qimen.form.questionLabel') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <UTextarea
        v-model="form.question_label"
        :placeholder="$t('qimen.form.questionLabel')"
        class="w-full"
        :ui="inputUi"
        :rows="3"
      />
    </div>

    <!-- 判断目标（按钮组，修复 checkbox 全选 bug） -->
    <div>
      <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.questionGoals') }}</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="g in goalOptions"
          :key="g.value"
          type="button"
          class="py-2 rounded-lg border text-xs font-medium transition-all duration-200"
          :class="form.question_goals.includes(g.value)
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
          @click="toggleGoal(g.value)"
        >
          {{ g.label }}
        </button>
      </div>
    </div>

    <!-- 起课时间 -->
    <DivinationTimeCard
      ref="timeCardRef"
      :hint="$t('qimen.form.timeHint')"
    />

    <!-- 地点 -->
    <div>
      <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.location') }}</label>
      <UInput
        v-model="form.location"
        :placeholder="$t('qimen.form.locationPlaceholder')"
        class="w-full"
        :ui="inputUi"
      />
      <p class="mt-1.5 text-[11px] text-[var(--text-placeholder)] leading-relaxed">
        {{ $t('qimen.form.locationHint') }}
      </p>
    </div>

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

    <p v-if="!canSubmit" class="text-center text-[10px] text-[var(--text-placeholder)]">
      {{ submitHint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { QimenChartRequest, QimenGoal } from '~/types/qimen'

const emit = defineEmits<{
  submit: [payload: QimenChartRequest]
}>()

const { t } = useI18n()

const timeCardRef = ref<{ timezone: Ref<string> } | null>(null)

const form = reactive<QimenChartRequest>({
  question_type: 'other',
  question_label: '',
  question_goals: [],
  location: '',
})

function toggleGoal(value: QimenGoal) {
  const idx = form.question_goals.indexOf(value)
  if (idx >= 0) {
    form.question_goals.splice(idx, 1)
  } else {
    form.question_goals.push(value)
  }
}

const goalOptions = computed(() => [
  { value: 'can_succeed' as QimenGoal, label: t('qimen.form.goalCanSucceed') },
  { value: 'when_to_act' as QimenGoal, label: t('qimen.form.goalWhenToAct') },
  { value: 'which_direction' as QimenGoal, label: t('qimen.form.goalWhichDirection') },
  { value: 'what_to_avoid' as QimenGoal, label: t('qimen.form.goalWhatToAvoid') },
])

const canSubmit = computed(() => {
  return !!form.question_label.trim() && !!form.location.trim()
})

const submitHint = computed(() => {
  if (!form.question_label.trim()) return t('qimen.form.validation.questionRequired')
  if (!form.location.trim()) return t('qimen.form.validation.locationRequired')
  return ''
})

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

function handleSubmit() {
  if (!canSubmit.value) return

  const payload: QimenChartRequest = {
    ...form,
    question_goals: [...form.question_goals],
    timezone: timeCardRef.value?.timezone.value || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
  }

  emit('submit', payload)
}
</script>
