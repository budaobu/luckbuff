<script setup lang="ts">
import { marked } from 'marked'
import type { VedicChart } from '~/types/vedic'

interface Props {
  chart: VedicChart
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
    const title = part.match(/^## (.+)/)?.[1]?.trim() ?? t('vedic.result.untitledSection')
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
      <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">{{ $t('vedic.result.sectionLabel') }}</span>
      <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
        {{ $t('vedic.result.title') }}
      </h1>
      <p class="text-sm text-[var(--text-faint)] mt-2">{{ $t('vedic.result.subtitle') }}</p>
      <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
    </div>

    <VedicChartSummary :chart="chart" />

    <div v-if="errorMsg" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300/90">
      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
      {{ errorMsg }}
    </div>

    <!-- 流式 / 章节渲染 -->
    <div v-if="sections.length" class="space-y-3">
      <VedicAnalysisSection
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
      class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 vedic-markdown text-[13px] leading-relaxed text-[var(--text-body)]/75"
      v-html="rawHtml"
    />

    <!-- 流式指示 -->
    <div v-if="streaming" class="flex items-center gap-2 text-xs text-[var(--text-faint)]">
      <span class="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
      {{ $t('vedic.result.streaming') }}
    </div>

    <footer class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-4 py-3 text-[11px] text-[var(--text-faint)] leading-relaxed">
      {{ $t('vedic.result.disclaimer') }}
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
        {{ $t('vedic.result.restart') }}
      </UButton>
      <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)]" @click="navigateTo('/')">
        <template #leading>
          <UIcon name="i-heroicons-home" class="w-4 h-4" />
        </template>
        {{ $t('common.backHome') }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.vedic-markdown :deep(h1),
.vedic-markdown :deep(h2),
.vedic-markdown :deep(h3) {
  color: #f5e6c0;
  font-weight: 600;
  margin: 0.8em 0 0.3em;
  font-size: 0.95em;
}
.vedic-markdown :deep(p) {
  margin: 0.4em 0;
}
.vedic-markdown :deep(strong) {
  color: #c9a227;
  font-weight: 600;
}
</style>
