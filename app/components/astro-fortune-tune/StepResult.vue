<script setup lang="ts">
import { marked } from 'marked'
import type { AstroFortuneTuneCalcResult } from '~/types/astro-fortune-tune'

interface Props {
  result: AstroFortuneTuneCalcResult
  analysis: string
  streaming: boolean
  errorMsg?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ restart: []; retry: []; share: [] }>()

const { t } = useI18n()

interface Section {
  title: string
  html: string
}

const sections = computed<Section[]>(() => {
  if (!props.analysis) return []
  const parts = props.analysis.split(/(?=^## )/m).filter(p => p.trim())
  return parts.map(part => {
    const title = part.match(/^## (.+)/)?.[1]?.trim() ?? t('astroFortuneTune.untitledSection')
    const body = part.replace(/^## .+\n?/, '').trim()
    return {
      title,
      html: marked.parse(body) as string,
    }
  })
})

const openSections = ref<Set<number>>(new Set([0]))

watch(sections, list => {
  if (list.length && openSections.value.size === 0) {
    openSections.value = new Set([0])
  }
})

function toggle(i: number) {
  if (openSections.value.has(i)) openSections.value.delete(i)
  else openSections.value.add(i)
  openSections.value = new Set(openSections.value)
}

const rawHtml = computed(() => marked.parse(props.analysis || '') as string)
</script>

<template>
  <div class="space-y-6">
    <div class="mb-2">
      <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Astro Fortune Tune</span>
      <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
        {{ $t('astroFortuneTune.resultTitle') }}
      </h1>
      <p class="text-sm text-[var(--text-faint)] mt-2">{{ $t('astroFortuneTune.resultSubtitle') }}</p>
      <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
    </div>

    <!-- 计算口径说明 -->
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
      <div class="flex items-start gap-3">
        <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-[var(--accent-muted)] mt-0.5 shrink-0" />
        <div>
          <p class="text-xs font-medium text-[var(--text-muted)] mb-1">{{ $t('astroFortuneTune.methodNoteTitle') }}</p>
          <p class="text-[11px] text-[var(--text-faint)] leading-relaxed">{{ result.methodNote }}</p>
        </div>
      </div>
    </div>

    <!-- 出生地 vs 候选城市摘要 -->
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 space-y-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-globe-asia-australia" class="w-4 h-4 text-[var(--accent-muted)]" />
        <h3 class="text-sm font-semibold text-[var(--text-primary)]">
          {{ $t('astroFortuneTune.comparisonTitle', { city: result.baseCityName }) }}
        </h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-faint)] p-3">
          <div class="text-[10px] text-[var(--accent-muted)] tracking-wider uppercase mb-1">{{ $t('astroFortuneTune.baseAscendant') }}</div>
          <div class="text-base font-semibold text-[var(--text-primary)]">
            {{ result.baseChart.ascendant.signNameZh }} <span class="text-[var(--text-faint)] text-xs font-normal">{{ result.baseChart.ascendant.signName }}</span>
          </div>
          <div class="text-xs text-[var(--text-muted)] mt-1">
            {{ result.baseChart.ascendant.degree.toFixed(1) }}° · {{ result.baseChart.ascendant.nakshatra }} pada {{ result.baseChart.ascendant.nakshatraPada }}
          </div>
        </div>
        <div
          v-for="(c, i) in result.comparisons"
          :key="i"
          class="rounded-lg border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-3"
        >
          <div class="text-[10px] text-[var(--text-faint)] tracking-wider uppercase mb-1">
            {{ $t('astroFortuneTune.candidateLabel', { index: i + 1 }) }}
          </div>
          <div class="text-base font-semibold text-[var(--text-primary)]">
            <span v-if="c.city.resolved">
              {{ c.chart.ascendant.signNameZh }} <span class="text-[var(--text-faint)] text-xs font-normal">{{ c.chart.ascendant.signName }}</span>
            </span>
            <span v-else class="text-[var(--text-faint)]">—</span>
          </div>
          <div class="text-xs text-[var(--text-muted)] mt-1">
            {{ c.city.cityName || c.city.name }}
            <span v-if="c.city.resolved">· Δ {{ c.ascendantDeltaDeg.toFixed(1) }}°</span>
          </div>
        </div>
      </div>
      <div v-if="result.hasUnresolvedCities" class="text-[11px] text-[var(--text-faint)]">
        {{ $t('astroFortuneTune.unresolvedCitiesHint') }}
      </div>
    </div>

    <div v-if="errorMsg" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300/90">
      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
      {{ errorMsg }}
    </div>

    <!-- 流式 / 章节渲染 -->
    <div v-if="sections.length" class="space-y-3">
      <AstroFortuneTuneAnalysisSection
        v-for="(s, i) in sections"
        :key="i"
        :title="s.title"
        :html="s.html"
        :open="openSections.has(i)"
        @toggle="toggle(i)"
      />
    </div>

    <!-- fallback：流式中尚未形成 ## 标题，直接显示原始 markdown -->
    <div
      v-else-if="analysis"
      class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 ai-content text-[13px] leading-relaxed text-[var(--text-body)]/75"
      v-html="rawHtml"
    />

    <!-- 流式指示 -->
    <div v-if="streaming" class="flex items-center gap-2 text-xs text-[var(--text-faint)]">
      <span class="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
      {{ $t('astroFortuneTune.streaming') }}
    </div>

    <footer class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-4 py-3 text-[11px] text-[var(--text-faint)] leading-relaxed">
      {{ $t('astroFortuneTune.disclaimer') }}
    </footer>

    <div class="flex gap-3 justify-center pt-2 flex-wrap">
      <UButton v-if="errorMsg" color="warning" variant="soft" @click="emit('retry')">
        <template #leading>
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
        </template>
        {{ $t('common.retry') }}
      </UButton>
      <UButton color="warning" variant="soft" @click="emit('share')">
        <template #leading>
          <UIcon name="i-heroicons-share" class="w-4 h-4" />
        </template>
        {{ $t('common.shareResult') }}
      </UButton>
      <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)]" @click="emit('restart')">
        <template #leading>
          <UIcon name="i-heroicons-arrow-uturn-left" class="w-4 h-4" />
        </template>
        {{ $t('astroFortuneTune.restart') }}
      </UButton>
      <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)]" @click="() => { navigateTo('/') }">
        <template #leading>
          <UIcon name="i-heroicons-home" class="w-4 h-4" />
        </template>
        {{ $t('common.backHome') }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.ai-content :deep(h1),
.ai-content :deep(h2),
.ai-content :deep(h3) {
  color: var(--text-primary);
  font-weight: 600;
  margin: 0.8em 0 0.3em;
  font-size: 0.95em;
}
.ai-content :deep(p) {
  margin: 0.4em 0;
}
.ai-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
</style>
