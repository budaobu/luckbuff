<script setup lang="ts">
import { marked } from 'marked'
import type { VedicHepanCalcResult } from '~/types/vedic-hepan'
import VedicChartSummary from '~/components/vedic/ChartSummary.vue'

interface Props {
  result: VedicHepanCalcResult
  analysis: string
  streaming: boolean
  errorMsg?: string
  interpretationTitle?: string
  resultTitle?: string
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
    const title = part.match(/^## (.+)/)?.[1]?.trim() ?? t('vedicHepan.untitledSection')
    const body = part.replace(/^## .+\n?/, '').trim()
    return { title, html: marked.parse(body) as string }
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

function planetNameZh(name: string): string {
  const map: Record<string, string> = {
    Sun: '太阳', Moon: '月亮', Mars: '火星', Mercury: '水星',
    Jupiter: '木星', Venus: '金星', Saturn: '土星', Rahu: '罗睺', Ketu: '计都',
  }
  return map[name] || name
}

const aspectIconMap: Record<string, string> = {
  '合相': 'i-heroicons-circle',
  '六合': 'i-heroicons-arrows-pointing-in',
  '刑克': 'i-heroicons-bolt-slash',
  '拱相': 'i-heroicons-arrows-pointing-out',
  '冲相': 'i-heroicons-arrows-right-left',
}

const uniqueAspects = computed(() => {
  const seen = new Set<string>()
  return props.result.crossAspects.filter((a) => {
    const key = [a.planetA, a.planetB].sort().join('-') + `-${a.aspectType}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})

const aInBGrouped = computed(() => {
  const result = props.result!
  const groups: Record<number, string[]> = {}
  for (const o of result.aPlanetsInB) {
    const list = groups[o.house] ?? []
    list.push(planetNameZh(o.planet))
    groups[o.house] = list
  }
  return groups
})

const bInAGrouped = computed(() => {
  const result = props.result!
  const groups: Record<number, string[]> = {}
  for (const o of result.bPlanetsInA) {
    const list = groups[o.house] ?? []
    list.push(planetNameZh(o.planet))
    groups[o.house] = list
  }
  return groups
})
</script>

<template>
  <div class="space-y-6">
    <div class="mb-2">
      <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">{{ $t('vedicHepan.resultLabel') }}</span>
      <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
        {{ resultTitle || $t('vedicHepan.resultTitle') }}
      </h1>
      <p class="text-sm text-[var(--text-faint)] mt-2">
        {{ result.personA.name }} · {{ result.personB.name }}
      </p>
      <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
    </div>

    <!-- 上升对比 -->
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
        <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('vedicHepan.ascendantComparison') }}</h3>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-faint)] p-3 text-center">
          <div class="text-[10px] text-[var(--accent-muted)] tracking-wider uppercase mb-1">{{ result.personA.name }}</div>
          <div class="text-lg font-semibold text-[var(--text-primary)]">{{ result.ascendantComparison.aSignZh }}</div>
          <div class="text-xs text-[var(--text-faint)]">{{ result.ascendantComparison.aSign }}</div>
        </div>
        <div class="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-faint)] p-3 text-center">
          <div class="text-[10px] text-[var(--accent-muted)] tracking-wider uppercase mb-1">{{ result.personB.name }}</div>
          <div class="text-lg font-semibold text-[var(--text-primary)]">{{ result.ascendantComparison.bSignZh }}</div>
          <div class="text-xs text-[var(--text-faint)]">{{ result.ascendantComparison.bSign }}</div>
        </div>
      </div>
    </div>

    <!-- 跨盘相位 -->
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-link" class="w-4 h-4 text-[var(--accent-muted)]" />
        <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('vedicHepan.aspectsTitle') }}</h3>
      </div>
      <div v-if="uniqueAspects.length" class="space-y-2">
        <div
          v-for="(a, i) in uniqueAspects.slice(0, 12)"
          :key="i"
          class="flex items-center justify-between text-xs px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-dropdown)]"
        >
          <div class="flex items-center gap-2">
            <UIcon :name="aspectIconMap[a.aspectType] || 'i-heroicons-star'" class="w-3.5 h-3.5 text-[var(--accent-muted)]" />
            <span class="text-[var(--text-primary)]">
              {{ result.personA.name }} {{ planetNameZh(a.planetA) }} · {{ result.personB.name }} {{ planetNameZh(a.planetB) }}
            </span>
          </div>
          <div class="text-[var(--text-muted)]">
            {{ a.aspectType }} {{ a.orb }}°
          </div>
        </div>
      </div>
      <p v-else class="text-xs text-[var(--text-faint)]">{{ $t('vedicHepan.noAspects') }}</p>
    </div>

    <!-- 宫位叠加 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
        <div class="text-[10px] text-[var(--accent-muted)] tracking-wider uppercase mb-2">{{ $t('vedicHepan.aPlanetsInB', { a: result.personA.name, b: result.personB.name }) }}</div>
        <div class="space-y-1.5">
          <div
            v-for="house in 12"
            :key="house"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-[var(--text-faint)]">{{ $t('vedicHepan.houseLabel', { n: house }) }}</span>
            <span class="text-[var(--text-primary)]">{{ (aInBGrouped[house] ?? []).join('、') || '—' }}</span>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
        <div class="text-[10px] text-[var(--accent-muted)] tracking-wider uppercase mb-2">{{ $t('vedicHepan.bPlanetsInA', { a: result.personA.name, b: result.personB.name }) }}</div>
        <div class="space-y-1.5">
          <div
            v-for="house in 12"
            :key="house"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-[var(--text-faint)]">{{ $t('vedicHepan.houseLabel', { n: house }) }}</span>
            <span class="text-[var(--text-primary)]">{{ (bInAGrouped[house] ?? []).join('、') || '—' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 本命盘摘要 -->
    <div class="space-y-4">
      <VedicChartSummary :chart="result.personA.chart" />
      <VedicChartSummary :chart="result.personB.chart" />
    </div>

    <!-- AI 解读 -->
    <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
          <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ interpretationTitle || $t('vedicHepan.interpretation') }}</h3>
        </div>
        <div v-if="streaming" class="flex items-center gap-1.5">
          <span class="text-xs text-[var(--accent-muted)]">{{ $t('vedicHepan.interpreting') }}</span>
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
            <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
          </span>
        </div>
      </div>

      <div v-if="sections.length" class="space-y-3">
        <div
          v-for="(s, i) in sections"
          :key="s.title"
          class="group relative rounded-xl border border-[var(--border-light)] overflow-hidden"
          :style="{ background: 'linear-gradient(to bottom right, var(--card-gradient-from), transparent)' }"
        >
          <div class="relative z-10 p-4">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ s.title.replace(/^##\s*/, '') }}</h4>
            <div class="ai-section-content" v-html="s.html" />
            <span
              v-if="streaming && i === sections.length - 1"
              class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse mt-1"
            />
          </div>
        </div>
      </div>

      <div v-else-if="streaming" class="flex items-center justify-center py-10">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
          </div>
          <p class="text-xs text-[var(--text-muted)]">{{ $t('vedicHepan.generatingInterpretation') }}</p>
        </div>
      </div>

      <div v-else-if="errorMsg" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
          <p class="text-sm text-red-400">{{ errorMsg }}</p>
        </div>
      </div>

      <div v-if="!streaming && (analysis || errorMsg)" class="flex justify-center mt-4">
        <UButton color="warning" variant="soft" size="sm" class="group/btn" @click="emit('retry')">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
          </template>
          {{ $t('vedicHepan.reinterpret') }}
        </UButton>
      </div>
    </div>

    <footer class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-4 py-3 text-[11px] text-[var(--text-faint)] leading-relaxed">
      {{ $t('vedicHepan.disclaimer') }}
    </footer>

    <div class="flex gap-3 justify-center pt-2 flex-wrap">
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
        {{ $t('vedicHepan.recalculate') }}
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
.ai-section-content :deep(p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
.ai-section-content :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-section-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.ai-section-content :deep(ul) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.ai-section-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.ai-section-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
