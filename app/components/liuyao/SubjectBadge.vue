<template>
  <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
    :class="badgeClass"
  >
    <span class="shrink-0">{{ label }}</span>
    <span v-if="team" class="truncate">{{ team.name }}</span>
    <span v-else class="text-[#e8e0d0]/30">{{ $t('liuyaoPage.noTeamSelected') }}</span>
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
    return 'bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227]'
  }
  return 'bg-white/[0.03] border border-white/8 text-[#e8e0d0]/60'
})
</script>
