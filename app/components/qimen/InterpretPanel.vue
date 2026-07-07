<template>
  <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-[var(--accent)]" />
      <h3 class="text-lg font-semibold text-[var(--text-primary)]">
        {{ $t('qimen.interpretTitle') }}
      </h3>
    </div>

    <!-- 等待首个 token -->
    <div v-if="!started && !error" class="flex flex-col items-center py-8">
      <TianganDizhi size="compact" :label="$t('qimen.interpretLoading')" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-6">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p class="text-sm text-red-400">{{ error }}</p>
      <UButton color="warning" variant="soft" size="sm" class="mt-3" @click="$emit('retry')">
        <template #leading>
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
        </template>
        {{ $t('common.retry') }}
      </UButton>
    </div>

    <!-- 流式内容 -->
    <div v-else class="space-y-4">
      <div
        v-for="(section, idx) in parsedSections"
        :key="idx"
        class="border-b border-[var(--border-light)] pb-4 last:border-0"
      >
        <h4 v-if="section.title" class="text-sm font-semibold text-[var(--accent)] mb-2">
          {{ section.title }}
        </h4>
        <div
          class="text-sm text-[var(--text-body)] leading-relaxed ai-section-content max-w-none"
          v-html="renderMarkdown(section.content)"
        />
      </div>

      <!-- 光标 -->
      <div v-if="streaming" class="flex items-center gap-1">
        <span class="w-0.5 h-4 bg-[var(--accent)] animate-pulse" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{
  content: string
  streaming: boolean
  started: boolean
  error: string | null
}>()

defineEmits<{
  retry: []
}>()

// 按 "## 标题" 分段
const parsedSections = computed(() => {
  if (!props.content) return []
  const raw = props.content
  const parts = raw.split(/\n(?=##\s)/)
  return parts.map((part) => {
    const lines = part.split('\n')
    const firstLine = lines[0] ?? ''
    const titleMatch = firstLine.match(/^##\s*(.+)$/)
    const title = titleMatch?.[1]?.trim() ?? ''
    const content = lines.slice(titleMatch ? 1 : 0).join('\n').trim()
    return { title, content }
  }).filter(s => s.title || s.content)
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  try {
    return marked.parse(text, { async: false }) as string
  } catch {
    return text
  }
}
</script>

<style scoped>
/* === 分段卡片内的 markdown 样式 === */
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
