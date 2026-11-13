<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CalendarDate } from '@internationalized/date'
import { parseDate } from '@internationalized/date'
import type { CalendarDate as CalendarDateType, DateValue } from '@internationalized/date'

interface AppCalendarProps {
  modelValue?: string | DateValue
  iso?: string
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  variant?: 'solid' | 'outline' | 'soft' | 'subtle'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  placeholder?: any
  defaultPlaceholder?: any
  disabled?: boolean
  readonly?: boolean
  range?: boolean
  multiple?: boolean
  numberOfMonths?: number
  pagedNavigation?: boolean
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  fixedWeeks?: boolean
  minValue?: string | DateValue
  maxValue?: string | DateValue
  preventDeselect?: boolean
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
  preventDeselect: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'update:iso': [value: string]
}>()

const { t } = useI18n()
const { solarToLunar } = useLunar()

const selectedDate = computed(() => {
  const value = props.iso ?? props.modelValue
  if (!value) return null
  return typeof value === 'string' ? parseDate(value) : value
})

const lunarDate = computed(() => {
  if (!selectedDate.value) return ''
  return solarToLunar(selectedDate.value.year, selectedDate.value.month, selectedDate.value.day)
})

const currentYear = computed(() => selectedDate.value?.year ?? new Date().getFullYear())
const currentMonth = computed(() => selectedDate.value?.month ?? new Date().getMonth() + 1)

function toCalendarDate(value?: string | DateValue): DateValue | undefined {
  if (typeof value === 'string') return value ? parseDate(value) : undefined
  return value
}

const minDate = computed(() => toCalendarDate(props.minValue))
const maxDate = computed(() => toCalendarDate(props.maxValue))

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

watch(() => props.iso ?? props.modelValue, (newVal) => {
  if (newVal) {
    const current = selectedDate.value
    if (current) {
      selectedYear.value = current.year
      selectedMonth.value = current.month
    }
  }
}, { immediate: true })

function handleYearChange(year: number) {
  selectedYear.value = year
  const current = selectedDate.value
  const month = current ? current.month : selectedMonth.value
  const day = current ? current.day : 1
  const value = new CalendarDate(year, month, day).toString()
  emit('update:modelValue', value)
  emit('update:iso', value)
}

function handleMonthChange(month: number) {
  selectedMonth.value = month
  const current = selectedDate.value
  const year = current ? current.year : selectedYear.value
  const day = current ? current.day : 1
  const value = new CalendarDate(year, month, day).toString()
  emit('update:modelValue', value)
  emit('update:iso', value)
}

function onPlaceholderUpdate(value: CalendarDateType) {
  selectedYear.value = value.year
  selectedMonth.value = value.month
}

function onYearChange(event: Event) {
  handleYearChange(Number((event.target as HTMLSelectElement).value))
}

function onMonthChange(event: Event) {
  handleMonthChange(Number((event.target as HTMLSelectElement).value))
}

function handlePlaceholderUpdate(value: unknown) {
  if (value) {
    onPlaceholderUpdate(value as CalendarDateType)
  }
}

function handleModelValueUpdate(value: unknown) {
  const isoDate = (value as CalendarDateType).toString()
  emit('update:modelValue', value)
  emit('update:iso', isoDate)
}

</script>

<template>
  <div
    class="bg-[var(--surface-elevated)] border border-[var(--border-light)] rounded-xl shadow-2xl p-2"
    data-testid="app-calendar"
  >
    <div class="flex items-center gap-2 mb-2">
      <select
        :value="selectedYear"
        class="h-8 w-24 rounded-md bg-[var(--surface-input)] px-2 text-sm text-[var(--text-primary)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)]"
        data-testid="calendar-year-select"
        :aria-label="$t('common.calendarYear')"
        @change="onYearChange"
      >
        <option v-for="year in yearOptions" :key="year.value" :value="year.value">
          {{ year.label }}
        </option>
      </select>
      <select
        :value="selectedMonth"
        class="h-8 w-24 rounded-md bg-[var(--surface-input)] px-2 text-sm text-[var(--text-primary)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)]"
        data-testid="calendar-month-select"
        :aria-label="$t('common.calendarMonth')"
        @change="onMonthChange"
      >
        <option v-for="month in months" :key="month.value" :value="month.value">
          {{ month.label }}
        </option>
      </select>
    </div>
    <UCalendar
      :model-value="selectedDate"
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
      :min-value="minDate"
      :max-value="maxDate"
      :prevent-deselect="preventDeselect"
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
      :class="props.class"
      @update:placeholder="handlePlaceholderUpdate($event)"
      @update:model-value="handleModelValueUpdate($event)"
    />
    <div
      v-if="lunarDate"
      class="mt-1 flex items-center justify-between gap-2 border-t px-1 pt-2"
      style="border-color: var(--border-light);"
    >
      <span class="text-xs" style="color: var(--text-faint);">{{ t('common.lunarDate') }}</span>
      <span class="text-xs font-medium" style="color: var(--text-primary);">{{ lunarDate }}</span>
    </div>
  </div>
</template>
