<template>
  <div class="space-y-5">
    <!-- 所问事项 -->
    <div>
      <label class="block text-sm text-[var(--text-muted)] mb-2">
        {{ $t('liuren.form.question') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <UTextarea
        v-model="form.question"
        :placeholder="$t('liuren.form.questionPlaceholder')"
        class="w-full"
        :ui="inputUi"
        :rows="3"
      />
    </div>

    <!-- 出生年份 -->
    <div>
      <label class="block text-sm text-[var(--text-muted)] mb-2">
        {{ $t('liuren.form.birthYear') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <UInput
        v-model="birthYearInput"
        type="number"
        :placeholder="$t('liuren.form.birthYearPlaceholder')"
        class="w-full"
        :ui="inputUi"
      />
      <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
        {{ $t('liuren.form.birthYearHint') }}
      </p>
    </div>

    <!-- 起课时间 -->
    <DivinationTimeCard
      ref="timeCardRef"
      :label="$t('liuren.form.divinationTime')"
      :hint="$t('liuren.form.timeHint')"
    />

    <!-- 地点 -->
    <div>
      <label class="block text-sm text-[var(--text-muted)] mb-2">
        {{ $t('liuren.form.location') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <UInput
        v-model="form.location"
        :placeholder="$t('liuren.form.locationPlaceholder')"
        class="w-full"
        :ui="inputUi"
      />
      <p class="mt-1.5 text-[11px] text-[var(--text-placeholder)] leading-relaxed">
        {{ $t('liuren.form.locationHint') }}
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
      {{ $t('liuren.form.submitBtn') }}
    </UButton>

    <p v-if="!canSubmit" class="text-center text-[10px] text-[var(--text-placeholder)]">
      {{ submitHint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { LiurenChartRequest } from '~/types/liuren'

const emit = defineEmits<{
  submit: [payload: LiurenChartRequest]
}>()

const { t } = useI18n()

const timeCardRef = ref<{ timezone: Ref<string> } | null>(null)

const form = reactive<LiurenChartRequest>({
  question: '',
  birthYear: 0,
  location: '',
  timezone: '',
})

const birthYearInput = ref('')

const canSubmit = computed(() => {
  const by = parseInt(birthYearInput.value, 10)
  return !!form.question.trim() && !isNaN(by) && by >= 1900 && by <= 2100 && !!form.location.trim()
})

const submitHint = computed(() => {
  if (!form.question.trim()) return t('liuren.form.validation.questionRequired')
  const by = parseInt(birthYearInput.value, 10)
  if (isNaN(by) || by < 1900 || by > 2100) return t('liuren.form.validation.birthYearRequired')
  if (!form.location.trim()) return t('liuren.form.validation.locationRequired')
  return ''
})

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

function handleSubmit() {
  if (!canSubmit.value) return

  const payload: LiurenChartRequest = {
    question: form.question.trim(),
    birthYear: parseInt(birthYearInput.value, 10),
    location: form.location.trim(),
    timezone: timeCardRef.value?.timezone.value || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
  }

  emit('submit', payload)
}
</script>
