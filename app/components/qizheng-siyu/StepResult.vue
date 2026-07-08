<script setup lang="ts">
import type { QizhengSiyuChart } from '~/types/qizheng-siyu'

interface Props {
  chart: QizhengSiyuChart
  analysis: string
  streaming: boolean
  errorMsg?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ restart: []; retry: []; share: [] }>()

const { t } = useI18n()

const ascendant = computed(() => props.chart.angles.find(a => a.name === 'Ascendant'))
const midheaven = computed(() => props.chart.angles.find(a => a.name === 'Midheaven'))
</script>

<template>
  <div class="space-y-6">
    <div class="mb-2">
      <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Qizheng Siyu</span>
      <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
        {{ t('qizhengSiyu.resultTitle') }}
      </h1>
      <p class="text-sm text-[var(--text-faint)] mt-2">{{ t('qizhengSiyu.resultSubtitle') }}</p>
      <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
    </div>

    <!-- 计算口径说明 -->
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
      <div class="flex items-start gap-3">
        <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-[var(--accent-muted)] mt-0.5 shrink-0" />
        <div>
          <p class="text-xs font-medium text-[var(--text-muted)] mb-1">{{ t('qizhengSiyu.methodNoteTitle') }}</p>
          <p class="text-[11px] text-[var(--text-faint)] leading-relaxed">{{ chart.methodNote }}</p>
        </div>
      </div>
    </div>

    <!-- 四角 -->
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-faint)] p-3">
        <div class="text-[10px] text-[var(--accent-muted)] tracking-wider uppercase mb-1">{{ t('qizhengSiyu.ascendant') }}</div>
        <div class="text-base font-semibold text-[var(--text-primary)]">
          {{ ascendant?.signNameZh }} <span class="text-[var(--text-faint)] text-xs font-normal">{{ ascendant?.signNameEn }}</span>
        </div>
        <div class="text-xs text-[var(--text-muted)] mt-1">
          {{ ascendant?.degreeInSign.toFixed(1) }}°
        </div>
      </div>
      <div class="rounded-lg border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-3">
        <div class="text-[10px] text-[var(--text-faint)] tracking-wider uppercase mb-1">{{ t('qizhengSiyu.midheaven') }}</div>
        <div class="text-base font-semibold text-[var(--text-primary)]">
          {{ midheaven?.signNameZh }} <span class="text-[var(--text-faint)] text-xs font-normal">{{ midheaven?.signNameEn }}</span>
        </div>
        <div class="text-xs text-[var(--text-muted)] mt-1">
          {{ midheaven?.degreeInSign.toFixed(1) }}°
        </div>
      </div>
    </div>

    <!-- 十二宫 -->
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-[var(--accent-muted)]" />
        <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ t('qizhengSiyu.housesTitle') }}</h3>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
        <div
          v-for="h in chart.houses"
          :key="h.number"
          class="rounded-lg border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-2 text-center"
        >
          <div class="text-[10px] text-[var(--text-faint)]">{{ h.number }}{{ t('qizhengSiyu.houseSuffix') }}</div>
          <div class="text-sm font-semibold text-[var(--text-primary)]">{{ h.signNameZh }}</div>
          <div class="text-[10px] text-[var(--text-muted)]">{{ h.signNameEn }}</div>
        </div>
      </div>
    </div>

    <!-- 七政 -->
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-star" class="w-4 h-4 text-[var(--accent-muted)]" />
        <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ t('qizhengSiyu.planetsTitle') }}</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-[10px] text-[var(--text-faint)] border-b border-[var(--border-light)]">
              <th class="text-left py-2 font-medium">{{ t('qizhengSiyu.tableBody') }}</th>
              <th class="text-left py-2 font-medium">{{ t('qizhengSiyu.tableSign') }}</th>
              <th class="text-left py-2 font-medium">{{ t('qizhengSiyu.tableHouse') }}</th>
              <th class="text-left py-2 font-medium">{{ t('qizhengSiyu.tableState') }}</th>
            </tr>
          </thead>
          <tbody class="text-[var(--text-body)]">
            <tr v-for="p in chart.planets" :key="p.key" class="border-b border-[var(--border-light)] last:border-0">
              <td class="py-2 font-medium">
                {{ p.name }} <span class="text-[var(--text-faint)] text-xs">{{ p.nameEn }}</span>
              </td>
              <td class="py-2">{{ p.signNameZh }} {{ p.degreeInSign.toFixed(1) }}°</td>
              <td class="py-2">{{ p.house }}{{ t('qizhengSiyu.houseSuffix') }}</td>
              <td class="py-2">
                <span v-if="p.isRetrograde" class="text-[var(--accent)] text-xs">{{ t('qizhengSiyu.retrograde') }}</span>
                <span v-else class="text-[var(--text-faint)] text-xs">{{ t('qizhengSiyu.direct') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 四余 -->
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-moon" class="w-4 h-4 text-[var(--accent-muted)]" />
        <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ t('qizhengSiyu.remaindersTitle') }}</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-[10px] text-[var(--text-faint)] border-b border-[var(--border-light)]">
              <th class="text-left py-2 font-medium">{{ t('qizhengSiyu.tableBody') }}</th>
              <th class="text-left py-2 font-medium">{{ t('qizhengSiyu.tableSign') }}</th>
              <th class="text-left py-2 font-medium">{{ t('qizhengSiyu.tableHouse') }}</th>
            </tr>
          </thead>
          <tbody class="text-[var(--text-body)]">
            <tr v-for="r in chart.remainders" :key="r.key" class="border-b border-[var(--border-light)] last:border-0">
              <td class="py-2 font-medium">
                {{ r.name }} <span class="text-[var(--text-faint)] text-xs">{{ r.nameEn }}</span>
              </td>
              <td class="py-2">{{ r.signNameZh }} {{ r.degreeInSign.toFixed(1) }}°</td>
              <td class="py-2">{{ r.house }}{{ t('qizhengSiyu.houseSuffix') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 主要相位 -->
    <div v-if="chart.aspects.length" class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-link" class="w-4 h-4 text-[var(--accent-muted)]" />
        <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ t('qizhengSiyu.aspectsTitle') }}</h3>
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(a, i) in chart.aspects"
          :key="i"
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[var(--border-light)] bg-[var(--surface-dropdown)] text-xs text-[var(--text-body)]"
        >
          {{ a.body1Name }}-{{ a.body2Name }} {{ a.aspectName }} {{ a.orb }}°
        </span>
      </div>
    </div>

    <div v-if="errorMsg" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300/90">
      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
      {{ errorMsg }}
    </div>

    <!-- AI 流式解读 -->
    <AiStreamCard
      :title="t('qizhengSiyu.analysisTitle')"
      :streaming="streaming"
      :content="analysis"
      icon="i-heroicons-sparkles"
    />

    <!-- 流式指示 -->
    <div v-if="streaming" class="flex items-center gap-2 text-xs text-[var(--text-faint)]">
      <span class="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
      {{ t('qizhengSiyu.streaming') }}
    </div>

    <footer class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-4 py-3 text-[11px] text-[var(--text-faint)] leading-relaxed">
      {{ t('qizhengSiyu.disclaimer') }}
    </footer>

    <div class="flex gap-3 justify-center pt-2 flex-wrap">
      <UButton v-if="errorMsg" color="warning" variant="soft" @click="emit('retry')">
        <template #leading>
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
        </template>
        {{ t('common.retry') }}
      </UButton>
      <UButton color="warning" variant="soft" @click="emit('share')">
        <template #leading>
          <UIcon name="i-heroicons-share" class="w-4 h-4" />
        </template>
        {{ t('common.shareResult') }}
      </UButton>
      <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)]" @click="emit('restart')">
        <template #leading>
          <UIcon name="i-heroicons-arrow-uturn-left" class="w-4 h-4" />
        </template>
        {{ t('qizhengSiyu.restart') }}
      </UButton>
      <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)]" @click="() => { navigateTo('/') }">
        <template #leading>
          <UIcon name="i-heroicons-home" class="w-4 h-4" />
        </template>
        {{ t('common.backHome') }}
      </UButton>
    </div>
  </div>
</template>
