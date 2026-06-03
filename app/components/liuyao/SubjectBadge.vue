<template>
  <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
    :class="badgeClass"
  >
    <span class="shrink-0">{{ label }}</span>
    <span v-if="team" class="truncate">{{ team.name }}</span>
    <span v-else class="text-[var(--text-placeholder)]">{{ $t('liuyaoPage.noTeamSelected') }}</span>
  </div>
</template>

<script setup lang="ts">
import type { WorldCupTeam } from '~/types/liuyao'

const props = defineProps<{
  label: '世' | '应'
  team: WorldCupTeam | null
}>()

const badgeClass = computed(() => {
  if (props.label === '世') {
    return 'bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)]'
  }
  return 'bg-[var(--surface-input)] border border-[var(--border-light)] text-[var(--text-muted)]'
})
</script>
