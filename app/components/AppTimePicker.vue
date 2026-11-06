<template>
  <UPopover>
    <UButton
      type="button"
      color="neutral"
      variant="outline"
      aria-haspopup="dialog"
      :aria-required="required"
      class="w-full justify-start bg-[var(--surface-input)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)]"
      :class="{ 'text-[var(--text-placeholder)]': !modelValue }"
    >
      <UIcon name="i-heroicons-clock" class="mr-2 h-4 w-4 text-[var(--text-faint)]" />
      {{ modelValue || placeholder }}
    </UButton>
    <template #content>
      <div class="w-[220px] rounded-xl border border-[var(--border-light)] bg-[var(--surface-elevated)] p-3 shadow-2xl">
        <div class="flex items-center gap-2">
          <USelect
            v-model="selectedHour"
            :items="hourOptions"
            :placeholder="hourPlaceholder"
            color="warning"
            class="flex-1"
            :ui="selectUi"
          />
          <span class="text-sm text-[var(--text-faint)]">:</span>
          <USelect
            v-model="selectedMinute"
            :items="minuteOptions"
            :placeholder="minutePlaceholder"
            color="warning"
            class="flex-1"
            :ui="selectUi"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  hourPlaceholder?: string
  minutePlaceholder?: string
  required?: boolean
}>(), {
  modelValue: '',
  placeholder: '',
  hourPlaceholder: '',
  minutePlaceholder: '',
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const hourOptions = Array.from({ length: 24 }, (_, hour) => ({
  label: String(hour).padStart(2, '0'),
  value: String(hour).padStart(2, '0'),
}))

const minuteOptions = Array.from({ length: 60 }, (_, minute) => ({
  label: String(minute).padStart(2, '0'),
  value: String(minute).padStart(2, '0'),
}))

const selectedHour = ref<string>()
const selectedMinute = ref<string>()

watch(() => props.modelValue, (value) => {
  const [hour, minute] = value ? value.split(':') : []
  selectedHour.value = hour || undefined
  selectedMinute.value = minute || undefined
}, { immediate: true })

watch([selectedHour, selectedMinute], ([hour, minute]) => {
  const value = hour && minute ? `${hour}:${minute}` : ''
  if (value !== props.modelValue) emit('update:modelValue', value)
})

const selectUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  placeholder: 'text-[var(--text-placeholder)]',
  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl max-h-[240px]',
  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
}
</script>
