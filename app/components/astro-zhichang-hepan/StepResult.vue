<script setup lang="ts">
import { marked } from 'marked'
import type { AstroZhichangCalcResult } from '~/types/astro-zhichang-hepan'

interface Props {
  result: AstroZhichangCalcResult
  analysis: string
  streaming: boolean
  errorMsg?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ restart: []; retry: []; share: [] }>()

const { t } = useI18n()

interface Section { title: string; html: string; isAdvice: boolean }
const sections = computed<Section[]>(() => {
  if (!props.analysis) return []
  const parts = props.analysis.split(/(?=^## )/m).filter(p => p.trim())
  return parts.map((part) => {
    const title = part.match(/^## (.+)/)?.[1]?.trim() ?? t('astroZhichangHepan.untitledSection')
    const body = part.replace(/^## .+\n?/, '').trim()
    const isAdvice = /关系优化建议|Optimization|Advice/i.test(title)
    return { title, html: marked.parse(body) as string, isAdvice }
  })
})

const PLANET_ZH: Record<string, string> = {
  Sun: '太阳', Moon: '月亮', Mercury: '水星', Venus: '金星', Mars: '火星',
  Jupiter: '木星', Saturn: '土星', Uranus: '天王星', Neptune: '海王星', Pluto: '冥王星',
}
const aspectIconMap: Record<string, string> = {
  '合相': 'i-heroicons-circle-stack',
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

function groupOverlays(overlays: AstroZhichangCalcResult['aPlanetsInB']) {
  const g: Record<number, string[]> = {}
  for (const o of overlays) {
    g[o.house] = g[o.house] ?? []
    g[o.house]!.push(PLANET_ZH[o.planet] ?? o.planet)
  }
  return g
}
const aInB = computed(() => groupOverlays(props.result.aPlanetsInB))
const bInA = computed(() => groupOverlays(props.result.bPlanetsInA))
</script>

<template>
  <div class="space-y-6">
    <div class="mb-2">
      <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">{{ $t('astroZhichangHepan.resultLabel') }}</span>
      <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">{{ $t('astroZhichangHepan.resultTitle') }}</h1>
      <p class="text-sm text-[var(--text-faint)] mt-2">
        {{ result.personA.roleLabel }} · {{ result.personA.name }}　×　{{ result.personB.roleLabel }} · {{ result.personB.name }}
      </p>
      <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
    </div>

    <!-- 上升 / MC 对比 -->
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
        <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('astroZhichangHepan.angleComparison') }}</h3>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-faint)] p-3 text-center">
          <div class="text-[10px] text-[var(--accent-muted)] tracking-wider uppercase mb-1">{{ result.personA.roleLabel }}</div>
          <div class="text-lg font-semibold text-[var(--text-primary)]">{{ result.ascendantComparison.aSignZh }}</div>
          <div class="text-xs text-[var(--text-faint)]">MC {{ result.careerFocus.personA.mcSignZh }}</div>
        </div>
        <div class="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-faint)] p-3 text-center">
          <div class="text-[10px] text-[var(--accent-muted)] tracking-wider uppercase mb-1">{{ result.personB.roleLabel }}</div>
          <div class="text-lg font-semibold text-[var(--text-primary)]">{{ result.ascendantComparison.bSignZh }}</div>
          <div class="text-xs text-[var(--text-faint)]">MC {{ result.careerFocus.personB.mcSignZh }}</div>
        </div>
      </div>
    </div>

    <!-- 跨盘相位 -->
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-link" class="w-4 h-4 text-[var(--accent-muted)]" />
        <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('astroZhichangHepan.aspectsTitle') }}</h3>
      </div>
      <div v-if="uniqueAspects.length" class="space-y-2">
        <div v-for="(a, i) in uniqueAspects.slice(0, 12)" :key="i" class="flex items-center justify-between text-xs px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-dropdown)]">
          <div class="flex items-center gap-2">
            <UIcon :name="aspectIconMap[a.aspectType] || 'i-heroicons-star'" class="w-3.5 h-3.5 text-[var(--accent-muted)]" />
            <span class="text-[var(--text-primary)]">{{ a.personA }} {{ PLANET_ZH[a.planetA] || a.planetA }} · {{ a.personB }} {{ PLANET_ZH[a.planetB] || a.planetB }}</span>
          </div>
          <div class="text-[var(--text-muted)]">{{ a.aspectType }} {{ a.orb }}°</div>
        </div>
      </div>
      <p v-else class="text-xs text-[var(--text-faint)]">{{ $t('astroZhichangHepan.noAspects') }}</p>
    </div>

    <!-- 宫位叠加 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
        <div class="text-[10px] text-[var(--accent-muted)] tracking-wider uppercase mb-2">{{ $t('astroZhichangHepan.aPlanetsInB', { a: result.personA.roleLabel, b: result.personB.roleLabel }) }}</div>
        <div class="space-y-1.5">
          <div v-for="house in 12" :key="house" class="flex items-center justify-between text-xs">
            <span class="text-[var(--text-faint)]">{{ $t('astroZhichangHepan.houseLabel', { n: house }) }}</span>
            <span class="text-[var(--text-primary)]">{{ (aInB[house] ?? []).join('、') || '—' }}</span>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
        <div class="text-[10px] text-[var(--accent-muted)] tracking-wider uppercase mb-2">{{ $t('astroZhichangHepan.bPlanetsInA', { a: result.personA.roleLabel, b: result.personB.roleLabel }) }}</div>
        <div class="space-y-1.5">
          <div v-for="house in 12" :key="house" class="flex items-center justify-between text-xs">
            <span class="text-[var(--text-faint)]">{{ $t('astroZhichangHepan.houseLabel', { n: house }) }}</span>
            <span class="text-[var(--text-primary)]">{{ (bInA[house] ?? []).join('、') || '—' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 解读卡片 -->
    <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
          <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
        </div>
        <h3 class="flex-1 min-w-0 text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('astroZhichangHepan.interpretation') }}</h3>
        <div v-if="streaming" class="flex items-center gap-1.5">
          <span class="text-xs text-[var(--accent-muted)]">{{ $t('astroZhichangHepan.interpreting') }}</span>
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
          class="group relative rounded-xl overflow-hidden"
          :class="s.isAdvice ? 'border-2 border-[var(--accent-border-hover)] bg-[var(--accent-faint)]' : 'border border-[var(--border-light)]'"
        >
          <div class="relative z-10 p-4">
            <h4 class="flex items-center gap-2 text-sm font-semibold mb-2" :class="s.isAdvice ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'">
              <UIcon v-if="s.isAdvice" name="i-heroicons-light-bulb" class="w-4 h-4" />
              {{ s.title.replace(/^##\s*/, '') }}
            </h4>
            <div class="ai-section-content" v-html="s.html" />
            <span v-if="streaming && i === sections.length - 1" class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse mt-1" />
          </div>
        </div>
      </div>

      <div v-else-if="streaming" class="flex items-center justify-center py-10">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
          </div>
          <p class="text-xs text-[var(--text-muted)]">{{ $t('astroZhichangHepan.generatingInterpretation') }}</p>
        </div>
      </div>

      <div v-else-if="errorMsg" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
          <p class="text-sm text-red-400">{{ errorMsg }}</p>
        </div>
      </div>

      <div v-if="!streaming && (analysis || errorMsg)" class="flex justify-center mt-4">
        <UButton color="warning" variant="soft" size="sm" @click="emit('retry')">
          <template #leading><UIcon name="i-heroicons-arrow-path" class="w-4 h-4" /></template>
          {{ $t('astroZhichangHepan.reinterpret') }}
        </UButton>
      </div>
    </div>

    <footer class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-4 py-3 text-[11px] text-[var(--text-faint)] leading-relaxed">
      {{ $t('astroZhichangHepan.disclaimer') }}
    </footer>

    <div class="flex gap-3 justify-center pt-2 flex-wrap">
      <UButton color="warning" variant="soft" @click="emit('share')">
        <template #leading><UIcon name="i-heroicons-share" class="w-4 h-4" /></template>
        {{ $t('common.shareResult') }}
      </UButton>
      <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)]" @click="emit('restart')">
        <template #leading><UIcon name="i-heroicons-arrow-uturn-left" class="w-4 h-4" /></template>
        {{ $t('astroZhichangHepan.recalculate') }}
      </UButton>
      <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)]" @click="() => { navigateTo('/') }">
        <template #leading><UIcon name="i-heroicons-home" class="w-4 h-4" /></template>
        {{ $t('common.backHome') }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.ai-section-content :deep(p) { margin-bottom: 0.6em; line-height: 1.75; color: var(--text-body); }
.ai-section-content :deep(p:last-child) { margin-bottom: 0; }
.ai-section-content :deep(strong) { color: var(--text-primary); font-weight: 600; }
.ai-section-content :deep(ul) { margin-left: 0; padding-left: 0; list-style: none; margin-bottom: 0.5rem; }
.ai-section-content :deep(ul li) { position: relative; padding-left: 1.1rem; margin-bottom: 0.4rem; line-height: 1.7; color: var(--text-body); }
.ai-section-content :deep(ul li::before) { content: '•'; position: absolute; left: 0; top: 0; color: var(--accent); font-size: 0.8rem; opacity: 0.8; }
.ai-section-content :deep(ol) { padding-left: 1.2rem; margin-bottom: 0.5rem; }
.ai-section-content :deep(ol li) { margin-bottom: 0.4rem; line-height: 1.7; color: var(--text-body); }
</style>
