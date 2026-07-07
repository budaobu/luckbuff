<template>
  <div>
    <label v-if="label" class="block text-sm text-[var(--text-muted)] mb-2">
      {{ label }}
      <span v-if="required" class="text-[var(--accent)]">*</span>
    </label>
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 space-y-3">
      <ClientOnly>
        <!-- 自动时间 -->
        <div v-if="mode === 'auto'" class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent)]" />
            <span class="text-sm text-[var(--text-primary)]">{{ formatTime }}</span>
          </div>
          <span class="text-[11px] text-[var(--text-faint)]">{{ timezone }}</span>
        </div>

        <!-- 自定义时间 -->
        <div v-else class="space-y-2">
          <input
            v-model="customLocalValue"
            type="datetime-local"
            class="w-full px-3 py-2 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-border-hover)]"
          >
          <div class="flex items-center justify-between text-[11px] text-[var(--text-faint)]">
            <span>{{ timezone }}</span>
            <span>{{ formattedCustomTime }}</span>
          </div>
        </div>

        <!-- 切换按钮 -->
        <div class="flex justify-end">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            size="xs"
            class="text-[var(--accent-muted)] hover:text-[var(--accent)]"
            @click="toggleMode"
          >
            {{ mode === 'auto' ? $t('common.customTime') : $t('common.autoTime') }}
          </UButton>
        </div>

        <template #fallback>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent)]" />
            <span class="text-sm text-[var(--text-faint)]">{{ $t('common.loading') }}</span>
          </div>
        </template>
      </ClientOnly>
    </div>
    <p v-if="hint" class="text-[11px] text-[var(--text-faint)] mt-1.5 leading-relaxed">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label?: string
  hint?: string
  required?: boolean
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()

const timezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai')
const nowTime = ref(new Date())
const mode = ref<'auto' | 'custom'>('auto')
const customTime = ref<Date>(new Date())

onMounted(() => {
  const timer = setInterval(() => {
    nowTime.value = new Date()
  }, 1000)
  onUnmounted(() => clearInterval(timer))
})

const activeDate = computed<Date>(() => {
  return mode.value === 'auto' ? nowTime.value : customTime.value
})

const formatTime = computed(() => {
  return nowTime.value.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timezone.value,
    hour12: false,
  })
})

const formattedCustomTime = computed(() => {
  return customTime.value.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone.value,
    hour12: false,
  })
})

function toLocalDatetimeString(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

function parseLocalDatetimeString(value: string): Date {
  return new Date(value)
}

const customLocalValue = computed({
  get: () => toLocalDatetimeString(customTime.value),
  set: (value: string) => {
    if (!value) return
    customTime.value = parseLocalDatetimeString(value)
  },
})

function toggleMode() {
  if (mode.value === 'auto') {
    customTime.value = new Date()
    mode.value = 'custom'
  } else {
    mode.value = 'auto'
  }
}

const year = computed(() => activeDate.value.getFullYear())
const month = computed(() => activeDate.value.getMonth() + 1)
const day = computed(() => activeDate.value.getDate())
const hour = computed(() => activeDate.value.getHours())
const minute = computed(() => activeDate.value.getMinutes())
const second = computed(() => activeDate.value.getSeconds())
const iso = computed(() => activeDate.value.toISOString())
const localValue = computed(() => toLocalDatetimeString(activeDate.value))

watch(iso, (value) => {
  emit('update:modelValue', value)
}, { immediate: true })

defineExpose({
  timezone,
  date: activeDate,
  year,
  month,
  day,
  hour,
  minute,
  second,
  iso,
  localValue,
})
</script>
