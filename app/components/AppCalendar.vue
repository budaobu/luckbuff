<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CalendarValue } from '@nuxt/ui'
import { CalendarDate } from '@internationalized/date'

interface AppCalendarProps {
  modelValue?: CalendarValue
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  variant?: 'solid' | 'outline' | 'soft' | 'subtle'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  placeholder?: string
  defaultPlaceholder?: string
  disabled?: boolean
  readonly?: boolean
  range?: boolean
  multiple?: boolean
  numberOfMonths?: number
  pagedNavigation?: boolean
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  fixedWeeks?: boolean
  minValue?: Date
  maxValue?: Date
  modelType?: 'date' | 'iso'
  ui?: Record<string, string>
  class?: string
}

const props = withDefaults(defineProps<AppCalendarProps>(), {
  color: 'warning',
  size: 'md',
  range: false,
  multiple: false,
  pagedNavigation: true,
  fixedWeeks: true,
  weekStartsOn: 0,
  modelType: 'date'
})

const emit = defineEmits<{
  'update:modelValue': [value: CalendarValue]
}>()

const { t } = useI18n()

const currentYear = computed(() => {
  return props.modelValue
    ? (Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue).year
    : new Date().getFullYear()
})

const currentMonth = computed(() => {
  return props.modelValue
    ? (Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue).month
    : new Date().getMonth() + 1
})

const years = computed(() => {
  const now = new Date().getFullYear()
  const start = now - 150
  const end = now + 50
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const yearOptions = computed(() => years.value.map(y => ({ label: String(y), value: y })))

const months = computed(() => [
  { label: t('common.month1'), value: 1 },
  { label: t('common.month2'), value: 2 },
  { label: t('common.month3'), value: 3 },
  { label: t('common.month4'), value: 4 },
  { label: t('common.month5'), value: 5 },
  { label: t('common.month6'), value: 6 },
  { label: t('common.month7'), value: 7 },
  { label: t('common.month8'), value: 8 },
  { label: t('common.month9'), value: 9 },
  { label: t('common.month10'), value: 10 },
  { label: t('common.month11'), value: 11 },
  { label: t('common.month12'), value: 12 }
])

const selectedYear = ref(currentYear.value)
const selectedMonth = ref(currentMonth.value)

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const current = Array.isArray(newVal) ? newVal[0] : newVal
    selectedYear.value = current.year
    selectedMonth.value = current.month
  }
}, { immediate: true })

function handleYearChange(year: number) {
  selectedYear.value = year
  const hasValue = !!props.modelValue
  const current = hasValue
    ? (Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue)
    : null
  const month = current ? current.month : selectedMonth.value
  const day = current ? current.day : 1
  const newDate = new CalendarDate(year, month, day)
  emit('update:modelValue', newDate as CalendarValue)
}

function handleMonthChange(month: number) {
  selectedMonth.value = month
  const hasValue = !!props.modelValue
  const current = hasValue
    ? (Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue)
    : null
  const year = current ? current.year : selectedYear.value
  const day = current ? current.day : 1
  const newDate = new CalendarDate(year, month, day)
  emit('update:modelValue', newDate as CalendarValue)
}

function onPlaceholderUpdate(value: CalendarDate) {
  selectedYear.value = value.year
  selectedMonth.value = value.month
}

const selectUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] text-sm',
  placeholder: 'text-[var(--text-placeholder)]',
  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl max-h-[240px]',
  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
}
</script>

<template>
  <div class="bg-[var(--surface-elevated)] border border-[var(--border-light)] rounded-xl shadow-2xl p-2">
    <div class="flex items-center gap-2 mb-2">
      <USelect
        :model-value="selectedYear"
        :items="yearOptions"
        color="warning"
        class="w-24"
        :ui="selectUi"
        @update:model-value="handleYearChange($event)"
      />
      <USelect
        :model-value="selectedMonth"
        :items="months"
        color="warning"
        class="w-24"
        :ui="selectUi"
        @update:model-value="handleMonthChange($event)"
      />
    </div>
    <UCalendar
      :model-value="modelValue"
      :color="color"
      :variant="variant"
      :size="size"
      :placeholder="placeholder"
      :default-placeholder="defaultPlaceholder"
      :disabled="disabled"
      :readonly="readonly"
      :range="range"
      :multiple="multiple"
      :number-of-months="numberOfMonths"
      :paged-navigation="pagedNavigation"
      :week-starts-on="weekStartsOn"
      :fixed-weeks="fixedWeeks"
      :min-value="minValue"
      :max-value="maxValue"
      :model-type="modelType"
      :ui="{
        root: '',
        header: '',
        body: '',
        grid: '',
        gridBody: '',
        heading: 'text-[var(--text-primary)] font-medium',
        headCell: 'text-[var(--text-faint)]',
        cellWeek: 'text-[var(--text-faint)]',
        cell: '',
        cellTrigger: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[selected]:bg-[var(--accent)] data-[selected]:text-[var(--surface-bg)]',
      }"
      :class="class"
      @update:placeholder="onPlaceholderUpdate($event)"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>
