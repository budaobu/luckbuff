<template>
  <div class="space-y-4">
    <!-- 标题区 -->
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]"
      >
        <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('baziZiwei.aiInterpretation') }}</h3>
      </div>
      <div v-if="streaming" class="flex items-center gap-1.5">
        <span class="text-xs text-[var(--accent-muted)]">{{ $t('baziZiwei.interpreting') }}</span>
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
        </span>
      </div>
    </div>

    <!-- 免责声明 -->
    <div class="flex items-start gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3.5 py-2.5">
      <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-[var(--accent-muted)] mt-0.5 shrink-0" />
      <p class="text-xs text-[var(--text-placeholder)] leading-relaxed">{{ $t('baziZiwei.disclaimer') }}</p>
    </div>

    <!-- 加载中：命盘预览 + 动画 -->
    <div v-if="!started && streaming">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 opacity-60">
        <BaziPanPreview :chart="baziChart" />
        <ZwdsPanPreview :chart="zwdsChart" />
      </div>
      <div class="flex flex-col items-center py-6">
        <TianganDizhi size="compact" :label="$t('baziZiwei.aiInterpreting')" />
      </div>
    </div>

    <!-- 结构化卡片展示（从流式 markdown 实时解析） -->
    <div v-if="sections.length > 0" class="space-y-3">
      <div
        v-for="(section, index) in sections"
        :key="section.title"
        class="group relative rounded-xl backdrop-blur-sm overflow-hidden border transition-all duration-300"
        :class="[
          section.meta?.borderColor || 'border-[var(--border-light)]',
          section.meta?.bgGradient || 'from-[var(--card-gradient-from)]',
        ]"
        :style="{ background: `linear-gradient(to bottom right, var(--tw-gradient-from), transparent)` }"
      >
        <div class="relative z-10 p-5">
          <div class="flex items-center gap-2.5 mb-3">
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center"
              :class="section.meta?.iconBg || 'bg-[var(--surface-card-hover)]'"
            >
              <UIcon
                :name="section.meta?.icon || 'i-heroicons-document-text'"
                class="w-4 h-4"
                :class="section.meta?.color || 'text-[var(--text-muted)]'"
              />
            </div>
            <h4
              class="text-sm font-semibold"
              :class="section.meta?.color || 'text-[var(--text-muted)]'"
            >
              {{ section.title }}
            </h4>
          </div>
          <div class="ai-section-content" v-html="renderSection(section.content)" />
          <!-- 流式闪烁光标：只在最后一个 section 且正在流式时显示 -->
          <span
            v-if="streaming && index === sections.length - 1"
            class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse mt-1"
          />
        </div>
      </div>
    </div>

    <!-- AI 错误 -->
    <div v-if="error" class="text-center py-8">
      <TianganDizhi size="compact" :label="$t('baziZiwei.aiServiceBusy')" />
      <p class="mt-4 text-sm text-red-400">{{ error }}</p>
      <UButton color="warning" class="mt-4" @click="$emit('retry')">
        <template #leading>
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
        </template>
        {{ $t('baziZiwei.retry') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { BaziChart } from '~/types/bazi'
import type { ZwdsChart } from '~/types/zwds'

const { t } = useI18n()

interface Props {
  baziChart: BaziChart
  zwdsChart: ZwdsChart
  content: string
  streaming: boolean
  started: boolean
  error: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

interface SectionMeta {
  icon: string
  color: string
  borderColor: string
  bgGradient: string
  iconBg: string
}

/** 八字+紫微综合印证章节主题映射 */
const sectionMetaMap: Record<string, SectionMeta> = {
  '两盘主轴速览': {
    icon: 'i-heroicons-bars-3-bottom-left',
    color: 'text-[var(--accent)]',
    borderColor: 'border-[var(--accent-faint)]',
    bgGradient: 'from-[var(--accent-faint)]',
    iconBg: 'bg-[var(--accent-bg)]',
  },
  '主轴印证结论': {
    icon: 'i-heroicons-scale',
    color: 'text-[var(--accent-purple-text)]',
    borderColor: 'border-[var(--accent-purple-border)]',
    bgGradient: 'from-[var(--accent-purple-faint)]',
    iconBg: 'bg-[var(--accent-purple-faint)]',
  },
  '阶段印证时间轴': {
    icon: 'i-heroicons-clock',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/15',
    bgGradient: 'from-amber-500/[0.05]',
    iconBg: 'bg-amber-500/10',
  },
  '六维度交叉对账': {
    icon: 'i-heroicons-table-cells',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/15',
    bgGradient: 'from-emerald-500/[0.05]',
    iconBg: 'bg-emerald-500/10',
  },
  '冲突清单': {
    icon: 'i-heroicons-exclamation-triangle',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/15',
    bgGradient: 'from-rose-500/[0.05]',
    iconBg: 'bg-rose-500/10',
  },
  '综合定论': {
    icon: 'i-heroicons-light-bulb',
    color: 'text-[var(--accent)]',
    borderColor: 'border-[var(--accent-faint)]',
    bgGradient: 'from-[var(--accent-faint)]',
    iconBg: 'bg-[var(--accent-bg-hover)]',
  },
  '置信度自评': {
    icon: 'i-heroicons-shield-check',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/15',
    bgGradient: 'from-blue-500/[0.05]',
    iconBg: 'bg-blue-500/10',
  },
  '免责声明': {
    icon: 'i-heroicons-information-circle',
    color: 'text-[var(--text-muted)]',
    borderColor: 'border-[var(--border-light)]',
    bgGradient: 'from-[var(--surface-card-hover)]',
    iconBg: 'bg-[var(--surface-card-hover)]',
  },
}

const sections = computed(() => {
  const text = props.content
  if (!text) return []

  const rawSections = text.split(/\n(?=##\s)/)
  const result: { title: string; content: string; meta: SectionMeta | undefined }[] = []

  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed || !trimmed.startsWith('##')) continue

    const [firstLine, ...restLines] = trimmed.split('\n') as [string, ...string[]]
    const titleLine = firstLine.replace(/^##\s*/, '').trim()
    const content = restLines.join('\n').trim()

    if (titleLine) {
      const meta = sectionMetaMap[titleLine] ?? sectionMetaMap[titleLine.split(' / ')[0] ?? '']
      result.push({
        title: titleLine,
        content,
        meta,
      })
    }
  }

  return result
})

function renderSection(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}
</script>

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
.ai-section-content :deep(ol) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  counter-reset: item;
  margin-bottom: 0.5rem;
}
.ai-section-content :deep(ol li) {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.ai-section-content :deep(ol li::before) {
  counter-increment: item;
  content: counter(item);
  position: absolute;
  left: 0;
  top: 0.1rem;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  color: #1a1612;
  background: var(--accent);
  border-radius: 3px;
  opacity: 0.8;
}
.ai-section-content :deep(blockquote) {
  margin: 0.5rem 0;
  padding: 0.6rem 0.8rem;
  background: var(--accent-bg);
  border-left: 2px solid var(--accent-border);
  border-radius: 0 6px 6px 0;
  font-style: italic;
}
.ai-section-content :deep(h3) {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0.75rem;
  margin-bottom: 0.4rem;
}
.ai-section-content :deep(h4) {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-body);
  margin-top: 0.5rem;
  margin-bottom: 0.3rem;
}
.ai-section-content :deep(code) {
  background: var(--surface-card-hover);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-size: 0.85em;
  color: var(--accent);
}
.ai-section-content :deep(pre) {
  background: var(--surface-card);
  padding: 0.75rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5rem 0;
}
.ai-section-content :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--text-body);
}
</style>
