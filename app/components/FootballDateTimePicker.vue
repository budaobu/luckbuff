<template>
  <div>
    <label v-if="label" class="mb-2 block text-sm text-[var(--text-muted)]">
      {{ label }}
      <span v-if="required" class="text-[var(--accent)]">*</span>
    </label>

    <UModal v-model:open="open">
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        block
        class="justify-start bg-[var(--surface-input)] border border-[var(--border-light)] px-3 font-normal text-[var(--text-primary)] hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)]"
        :class="{ 'text-[var(--text-placeholder)]': !modelValue }"
        @click="open = true"
      >
        <UIcon name="i-heroicons-calendar-days" class="h-4 w-4 text-[var(--accent)]" />
        <span class="truncate">{{ triggerText }}</span>
        <UIcon name="i-heroicons-chevron-down" class="ml-auto h-4 w-4 shrink-0 text-[var(--text-faint)]" />
      </UButton>

      <template #content>
        <div class="max-h-[min(88vh,620px)] overflow-y-auto rounded-xl bg-[var(--surface-dropdown)] shadow-2xl">
          <div class="flex items-center justify-between gap-3 border-b border-[var(--border-light)] px-4 py-3">
            <div>
              <p class="text-sm font-semibold text-[var(--text-primary)]">{{ title }}</p>
              <p class="mt-0.5 text-[11px] text-[var(--text-faint)]">{{ timezone }}</p>
            </div>
            <UButton
              v-if="defaultToNow"
              color="warning"
              variant="soft"
              size="xs"
              @click="setNow"
            >
              <template #leading>
                <UIcon name="i-heroicons-clock" class="h-3.5 w-3.5" />
              </template>
              {{ $t('footballPrediction.timePicker.now') }}
            </UButton>

            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              class="-mr-1 text-[var(--text-faint)] hover:text-[var(--text-body)]"
              @click="open = false"
            >
              <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
            </UButton>
          </div>

          <AppCalendar
            v-model="calendarDate"
            color="warning"
            class="border-0 bg-transparent p-2 shadow-none"
          />

          <div class="space-y-3 border-t border-[var(--border-light)] px-4 py-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-[var(--text-faint)]">
                  {{ $t('footballPrediction.timePicker.hour') }}
                </label>
                <USelect
                  v-model="hour"
                  :items="hourItems"
                  color="warning"
                  class="w-full"
                  :ui="selectUi"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-[var(--text-faint)]">
                  {{ $t('footballPrediction.timePicker.minute') }}
                </label>
                <USelect
                  v-model="minute"
                  :items="minuteItems"
                  color="warning"
                  class="w-full"
                  :ui="selectUi"
                />
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in hourPresets"
                :key="preset"
                type="button"
                class="rounded-lg border px-3 py-1.5 text-xs transition-colors"
                :class="hour === preset
                  ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]'
                  : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--accent-border-hover)] hover:text-[var(--accent)]'"
                @click="hour = preset"
              >
                {{ String(preset).padStart(2, '0') }}:00
              </button>
            </div>

            <UButton
              color="warning"
              block
              :disabled="!modelValue"
              @click="open = false"
            >
              {{ $t('footballPrediction.timePicker.done') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import type { CalendarDate as CalendarDateType } from '@internationalized/date'

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  title?: string
  required?: boolean
  defaultToNow?: boolean
}>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  title: '',
  required: false,
  defaultToNow: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { locale } = useI18n()
const open = ref(false)
const timezone = ref('Asia/Shanghai')
const calendarDate = shallowRef<CalendarDateType>()
const hour = ref<number>()
const minute = ref<number>()

const localeTag = computed(() => locale.value === 'en' ? 'en-US' : locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN')

const hourItems = computed(() => Array.from({ length: 24 }, (_, index) => ({
  label: `${String(index).padStart(2, '0')}:00`,
  value: index,
})))

const minuteItems = computed(() => Array.from({ length: 12 }, (_, index) => {
  const value = index * 5
  return { label: String(value).padStart(2, '0'), value }
}))

const hourPresets = [15, 17, 19, 20, 21, 22]

const selectUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] text-sm',
  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl max-h-[220px]',
  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
}

const triggerText = computed(() => {
  if (!props.modelValue) return props.placeholder
  return new Intl.DateTimeFormat(localeTag.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone.value,
  }).format(new Date(props.modelValue))
})

function syncFromDate(date: Date) {
  timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
  calendarDate.value = new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  hour.value = date.getHours()
  minute.value = date.getMinutes()
}

function emitSelected() {
  if (!calendarDate.value || hour.value == null || minute.value == null) return
  const date = new Date(
    calendarDate.value.year,
    calendarDate.value.month - 1,
    calendarDate.value.day,
    hour.value,
    minute.value,
    0,
    0,
  )
  emit('update:modelValue', date.toISOString())
}

function setNow() {
  syncFromDate(new Date())
  emitSelected()
}

watch(calendarDate, () => {
  if (!calendarDate.value) return
  if (hour.value == null) hour.value = 20
  if (minute.value == null) minute.value = 0
  emitSelected()
})

watch([hour, minute], emitSelected)

watch(() => props.modelValue, (value) => {
  if (!value) return
  const date = new Date(value)
  const current = calendarDate.value
  const sameMinute = current
    && date.getFullYear() === current.year
    && date.getMonth() + 1 === current.month
    && date.getDate() === current.day
    && hour.value === date.getHours()
    && minute.value === date.getMinutes()
  if (!sameMinute) syncFromDate(date)
}, { immediate: false })

onMounted(() => {
  timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
  if (props.modelValue) {
    syncFromDate(new Date(props.modelValue))
    return
  }
  if (props.defaultToNow) {
    setNow()
  }
  else {
    calendarDate.value = new CalendarDate(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate(),
    )
  }
})
</script>
