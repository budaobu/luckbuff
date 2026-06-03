<script setup lang="ts">
import type { VedicDimension } from '~/types/vedic'

interface Props {
  modelValue: VedicDimension[]
}
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [VedicDimension[]] }>()

const { t } = useI18n()

interface DimOption {
  key: VedicDimension
  icon: string
  label: string
  desc: string
}

const dims = computed<DimOption[]>(() => [
  { key: 'core', icon: 'i-heroicons-sparkles', label: t('vedic.dim.coreLabel'), desc: t('vedic.dim.coreDesc') },
  { key: 'career', icon: 'i-heroicons-briefcase', label: t('vedic.dim.careerLabel'), desc: t('vedic.dim.careerDesc') },
  { key: 'love', icon: 'i-heroicons-heart', label: t('vedic.dim.loveLabel'), desc: t('vedic.dim.loveDesc') },
  { key: 'annual', icon: 'i-heroicons-calendar', label: t('vedic.dim.annualLabel'), desc: t('vedic.dim.annualDesc') },
])

function isSelected(key: VedicDimension): boolean {
  return props.modelValue.includes(key)
}

function toggle(key: VedicDimension) {
  if (isSelected(key)) {
    if (props.modelValue.length <= 1) return
    emit('update:modelValue', props.modelValue.filter(d => d !== key))
  } else {
    emit('update:modelValue', [...props.modelValue, key])
  }
}
</script>

<template>
  <div class="grid grid-cols-2 gap-2.5">
    <button
      v-for="d in dims"
      :key="d.key"
      type="button"
      class="text-left rounded-xl border p-3 transition-all duration-200"
      :class="isSelected(d.key)
        ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--text-primary)]'
        : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-body)]'"
      @click="toggle(d.key)"
    >
      <div class="flex items-center gap-2">
        <UIcon :name="d.icon" class="w-4 h-4 shrink-0" :class="isSelected(d.key) ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]'" />
        <span class="text-sm font-medium">{{ d.label }}</span>
        <UIcon
          v-if="isSelected(d.key)"
          name="i-heroicons-check-circle-solid"
          class="w-3.5 h-3.5 text-[var(--accent)] ml-auto"
        />
      </div>
      <p class="text-[11px] text-[var(--text-body)]/35 mt-1.5 leading-snug">{{ d.desc }}</p>
    </button>
  </div>
</template>
