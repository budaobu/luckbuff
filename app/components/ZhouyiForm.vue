<template>
  <div class="space-y-5">
    <!-- 起卦方式选择 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
        {{ $t('zhouyiForm.method') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="m in methods"
          :key="m.key"
          type="button"
          class="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200"
          :class="method === m.key
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
          @click="method = m.key"
        >
          <UIcon :name="m.icon" class="w-3.5 h-3.5" />
          {{ m.label }}
        </button>
      </div>
    </div>

    <!-- ========== 时间起卦（紧跟起卦方式） ========== -->
    <template v-if="method === 'time'">
      <DivinationTimeCard
        ref="timeCardRef"
        :label="$t('zhouyiForm.timeLabel')"
        :hint="$t('zhouyiForm.timeHint')"
      />
    </template>

    <!-- 性别 -->
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-[var(--text-muted)]">
        {{ $t('zhouyiForm.genderLabel') }}
      </label>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="g in genders"
          :key="g.key"
          type="button"
          class="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200"
          :class="gender === g.key
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
          @click="gender = g.key"
        >
          <UIcon :name="g.icon" class="w-3.5 h-3.5" />
          {{ g.label }}
        </button>
      </div>
    </div>

    <!-- 出生年份 -->
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-[var(--text-muted)]">
        {{ $t('zhouyiForm.birthYearLabel') }}
      </label>
      <UInput
        v-model.number="birthYear"
        type="number"
        :placeholder="$t('zhouyiForm.birthYearPlaceholder')"
        color="warning"
        class="w-full"
        :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
      />
    </div>

    <!-- ========== 数字起卦 ========== -->
    <template v-if="method === 'numbers'">
      <div class="space-y-1.5">
        <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
          {{ $t('zhouyiForm.firstNumber') }}
          <span class="text-[var(--accent)]">*</span>
        </label>
        <UInput
          v-model.number="numbersForm.num1"
          type="number"
          :placeholder="$t('zhouyiForm.firstNumberPlaceholder')"
          color="warning"
          class="w-full"
          :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
        />
        <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('zhouyiForm.upperGuaHint') }}</p>
      </div>

      <div class="space-y-1.5">
        <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
          {{ $t('zhouyiForm.secondNumber') }}
          <span class="text-[var(--accent)]">*</span>
        </label>
        <UInput
          v-model.number="numbersForm.num2"
          type="number"
          :placeholder="$t('zhouyiForm.secondNumberPlaceholder')"
          color="warning"
          class="w-full"
          :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
        />
        <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('zhouyiForm.lowerGuaHint') }}</p>
      </div>

      <div class="space-y-1.5">
        <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('zhouyiForm.thirdNumber') }}</label>
        <UInput
          v-model.number="numbersForm.num3"
          type="number"
          :placeholder="$t('zhouyiForm.thirdNumberPlaceholder')"
          color="warning"
          class="w-full"
          :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
        />
        <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('zhouyiForm.dongYaoHint') }}</p>
      </div>
    </template>

    <!-- ========== 测字起卦 ========== -->
    <template v-if="method === 'character'">
      <div class="space-y-1.5">
        <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
          {{ $t('zhouyiForm.charLabel') }}
          <span class="text-[var(--accent)]">*</span>
        </label>
        <UInput
          v-model="charForm.char"
          :placeholder="$t('zhouyiForm.charPlaceholder')"
          color="warning"
          class="w-full"
          maxlength="2"
          :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
        />
        <p class="text-[10px] text-[var(--text-placeholder)]">
          {{ $t('zhouyiForm.charHint') }}
        </p>
      </div>
    </template>

    <!-- 具体问题 -->
    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
          {{ $t('zhouyiForm.queryLabel') }}
          <span class="text-[var(--accent)]">*</span>
        </label>
        <QuestionInspiration @select="q => query = q" />
      </div>
      <UTextarea
        v-model="query"
        :placeholder="$t('zhouyiForm.queryPlaceholder')"
        color="warning"
        :rows="3"
        class="w-full"
        :ui="{
          base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
        }"
      />
      <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('zhouyiForm.queryHint') }}</p>
    </div>

    <UButton
      color="warning"
      size="lg"
      block
      :disabled="!isValid"
      class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
      @click="handleSubmit"
    >
      <template #leading>
        <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
      </template>
      {{ $t('zhouyiForm.submit') }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { QiguaInput } from '~/types/zhouyi'

const emit = defineEmits<{
  submit: [values: QiguaInput]
}>()

const { t } = useI18n()

const methods = [
  { key: 'time' as const, label: t('zhouyiForm.methodTime'), icon: 'i-heroicons-clock' },
  { key: 'numbers' as const, label: t('zhouyiForm.methodNumbers'), icon: 'i-heroicons-numbered-list' },
  { key: 'character' as const, label: t('zhouyiForm.methodCharacter'), icon: 'i-heroicons-pencil' },
]

const method = ref<'time' | 'numbers' | 'character'>('time')
const timeCardRef = ref<{ year: Ref<number>; month: Ref<number>; day: Ref<number>; hour: Ref<number> } | null>(null)

const genders = [
  { key: 'male' as const, label: t('zhouyiForm.genderMale'), icon: 'i-heroicons-user' },
  { key: 'female' as const, label: t('zhouyiForm.genderFemale'), icon: 'i-heroicons-user-circle' },
]
const gender = ref<'male' | 'female' | undefined>(undefined)
const birthYear = ref<number | undefined>(undefined)

// 数字起卦表单
const numbersForm = reactive({
  num1: undefined as number | undefined,
  num2: undefined as number | undefined,
  num3: undefined as number | undefined,
})

// 测字起卦表单
const charForm = reactive({
  char: '',
})

const query = ref('')

// 验证
const isValid = computed(() => {
  if (!query.value.trim()) return false

  switch (method.value) {
    case 'time':
      return true
    case 'numbers':
      return numbersForm.num1 !== undefined && numbersForm.num2 !== undefined
    case 'character':
      return charForm.char.trim().length > 0
    default:
      return false
  }
})

function handleSubmit() {
  let input: QiguaInput

  switch (method.value) {
    case 'time': {
      const card = timeCardRef.value
      input = {
        method: 'time',
        year: (card?.year as unknown as Ref<number>).value ?? new Date().getFullYear(),
        month: (card?.month as unknown as Ref<number>).value ?? new Date().getMonth() + 1,
        day: (card?.day as unknown as Ref<number>).value ?? new Date().getDate(),
        hour: (card?.hour as unknown as Ref<number>).value ?? new Date().getHours(),
        query: query.value,
        gender: gender.value,
        birthYear: birthYear.value,
      }
      break
    }
    case 'numbers': {
      input = {
        method: 'numbers',
        num1: numbersForm.num1!,
        num2: numbersForm.num2!,
        num3: numbersForm.num3,
        query: query.value,
        gender: gender.value,
        birthYear: birthYear.value,
      }
      break
    }
    case 'character': {
      input = {
        method: 'character',
        char: charForm.char.trim(),
        query: query.value,
        gender: gender.value,
        birthYear: birthYear.value,
      }
      break
    }
  }

  emit('submit', input)
}
</script>
