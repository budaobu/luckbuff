<template>
  <GlowCard :title="$t('bazi.dayunTable')">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-[#e8e0d0]/50 border-b border-white/10">
            <th class="text-left py-2 px-2">{{ $t('bazi.stepNumber') }}</th>
            <th class="py-2 px-2">{{ $t('bazi.age') }}</th>
            <th class="py-2 px-2">{{ $t('bazi.ganZhi') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="dy in dayuns"
            :key="dy.index"
            class="border-b border-white/5"
            :class="{ 'bg-[#c9a227]/10': isCurrent(dy) }"
          >
            <td class="py-2 px-2">{{ dy.index }}</td>
            <td class="py-2 px-2">{{ dy.ageRange[0] }}-{{ dy.ageRange[1] }}{{ $t('bazi.ageUnit') }}</td>
            <td class="py-2 px-2" :class="isCurrent(dy) ? 'text-[#c9a227] font-bold' : 'text-[#e8e0d0]'">
              {{ dy.gan }}{{ dy.zhi }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </GlowCard>
</template>

<script setup lang="ts">
import type { DaYun } from '~/types/bazi'

interface Props {
  dayuns: DaYun[]
  currentAge: number
}

const props = defineProps<Props>()

function isCurrent(dy: DaYun): boolean {
  return dy.ageRange[0] <= props.currentAge && dy.ageRange[1] >= props.currentAge
}
</script>
