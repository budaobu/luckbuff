<script setup lang="ts">
import { computed } from 'vue'
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
  const start = currentYear.value - 100
  const end = currentYear.value + 50
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

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

const selectedYear = computed({
  get: () => currentYear.value,
  set: (year: number) => {
    if (!props.modelValue) return
    const current = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue
    const newDate = new CalendarDate(year, current.month, current.day)
    emit('update:modelValue', newDate as CalendarValue)
  }
})

const selectedMonth = computed({
  get: () => currentMonth.value,
  set: (month: number) => {
    if (!props.modelValue) return
    const current = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue
    const newDate = new CalendarDate(current.year, month, current.day)
    emit('update:modelValue', newDate as CalendarValue)
  }
})
</script>

<template>
  <div class="bg-[#0f0c09] border border-white/8 rounded-xl shadow-2xl p-2">
    <div class="flex items-center gap-2 mb-2">
      <select
        v-model="selectedYear"
        class="bg-[#1a1612] border border-white/10 text-[#f5e6c0] text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#c9a227]/50 cursor-pointer"
      >
        <option v-for="year in years" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
      <select
        v-model="selectedMonth"
        class="bg-[#1a1612] border border-white/10 text-[#f5e6c0] text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#c9a227]/50 cursor-pointer"
      >
        <option v-for="month in months" :key="month.value" :value="month.value">
          {{ month.label }}
        </option>
      </select>
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
        heading: 'text-[#f5e6c0] font-medium',
        headCell: 'text-[#e8e0d0]/40',
        cellWeek: 'text-[#e8e0d0]/40',
        cell: '',
        cellTrigger: 'text-[#f5e6c0] hover:bg-white/[0.04] data-[selected]:bg-[#c9a227] data-[selected]:text-[#1a1612]',
      }"
      :class="class"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>