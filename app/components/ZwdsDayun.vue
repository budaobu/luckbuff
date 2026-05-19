<template>
  <GlowCard :title="$t('zwds.daXianTable')">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-[#e8e0d0]/50 border-b border-white/10">
            <th class="text-left py-2 px-2">{{ $t('zwds.stepNumber') }}</th>
            <th class="py-2 px-2">{{ $t('zwds.gongWei') }}</th>
            <th class="py-2 px-2">{{ $t('zwds.age') }}</th>
            <th class="py-2 px-2">{{ $t('zwds.mainStar') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="dx in daXians"
            :key="dx.index"
            class="border-b border-white/5 transition-colors"
            :class="isCurrent(dx) ? 'bg-[#c9a227]/10' : 'hover:bg-white/[0.02]'"
          >
            <td class="py-2 px-2 text-[#e8e0d0]/60">{{ dx.index }}</td>
            <td class="py-2 px-2">
              <span :class="isCurrent(dx) ? 'text-[#c9a227] font-medium' : 'text-[#e8e0d0]'">
                {{ dx.gongName }}（{{ dx.gongZhi }}）
              </span>
            </td>
            <td class="py-2 px-2">{{ dx.ageRange[0] }}-{{ dx.ageRange[1] }}{{ $t('zwds.ageSuffix') }}</td>
            <td class="py-2 px-2 text-[#e8e0d0]/70">
              {{ dx.mainStars.join($t('zwds.starJoin')) || $t('zwds.borrowPalace') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </GlowCard>
</template>

<script setup lang="ts">
import type { ZwdsDaXian } from '~/types/zwds'

interface Props {
  daXians: ZwdsDaXian[]
  currentAge: number
}

const props = defineProps<Props>()
const { t } = useI18n()

function isCurrent(dx: ZwdsDaXian): boolean {
  return dx.ageRange[0] <= props.currentAge && dx.ageRange[1] >= props.currentAge
}
</script>
