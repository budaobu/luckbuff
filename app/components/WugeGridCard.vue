<template>
  <div
    class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5"
    :class="$attrs.class"
  >
    <div class="flex items-start justify-between mb-3">
      <div>
        <p class="text-[10px] text-[var(--text-faint)] mb-1 tracking-wide">{{ label }}</p>
        <p class="text-2xl font-bold text-[var(--accent)]">{{ grid.value }}</p>
      </div>
      <span
        class="text-[10px] px-2 py-0.5 rounded-full border font-medium"
        :class="fortuneClass"
      >
        {{ grid.fortune.fortune }}
      </span>
    </div>
    <p class="text-xs text-[var(--text-muted)] mb-1">{{ description }}</p>
    <p class="text-[11px] text-[var(--text-faint)] leading-relaxed">{{ grid.fortune.desc }}</p>
  </div>
</template>

<script setup lang="ts">
interface Grid {
  name: string
  value: number
  fortune: {
    fortune: string
    desc: string
  }
}

const props = defineProps<{
  grid: Grid
  label: string
  description: string
}>()

const fortuneClass = computed(() => {
  const f = props.grid.fortune.fortune
  if (f === '大吉') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
  if (f === '吉') return 'border-green-500/30 bg-green-500/10 text-green-500'
  if (f === '半吉') return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500'
  if (f === '凶') return 'border-orange-500/30 bg-orange-500/10 text-orange-500'
  if (f === '大凶') return 'border-red-500/30 bg-red-500/10 text-red-500'
  return 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'
})
</script>
