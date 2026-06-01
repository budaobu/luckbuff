<template>
  <div class="inline-flex items-center gap-1 text-[11px]"
  >
    <UIcon :name="icon" class="w-3 h-3" :class="iconColorClass" />
    <span class="text-[var(--text-muted)]">{{ label }}</span>
    <span class="font-medium text-[var(--text-primary)]">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
  label: string
  value: string
  color: 'amber' | 'rose' | 'emerald' | 'sky' | 'violet' | 'orange'
}>()

const colorMap: Record<string, string> = {
  amber: 'text-amber-400',
  rose: 'text-rose-400',
  emerald: 'text-emerald-400',
  sky: 'text-sky-400',
  violet: 'text-violet-400',
  orange: 'text-orange-400',
}

const iconColorClass = computed(() => colorMap[props.color] || 'text-[var(--text-muted)]')
</script>
