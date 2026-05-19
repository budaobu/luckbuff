<template>
  <div class="space-y-3">
    <!-- 顶部主标题区 -->
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] transition-transform duration-500 hover:scale-110"
      >
        <UIcon :name="icon || 'i-heroicons-sparkles'" class="w-5 h-5" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-base font-semibold text-[#f5e6c0] tracking-wide">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-[#e8e0d0]/40 mt-0.5 truncate">{{ subtitle }}</p>
      </div>
      <div v-if="streaming" class="flex items-center gap-1.5">
        <span class="text-xs text-[#c9a227]/60">{{ $t('bazi.interpreting') }}</span>
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9a227] opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-[#c9a227]" />
        </span>
      </div>
    </div>

    <!-- 分段卡片 -->
    <div v-if="hasSections" class="space-y-3">
      <div
        v-for="(section, index) in sections"
        :key="index"
        class="group relative rounded-xl bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-500"
      >
        <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent" />
        <div class="relative z-10 p-5">
          <h4
            v-if="section.title"
            class="text-sm font-semibold text-[#c9a227] tracking-wide mb-3 flex items-center gap-2"
          >
            <span class="w-1.5 h-1.5 rounded-sm bg-[#c9a227] rotate-45 opacity-80" />
            {{ section.title }}
          </h4>
          <div class="ai-content prose prose-invert prose-sm max-w-none">
            <div v-html="section.rendered" />
          </div>
        </div>
        <div class="absolute inset-0 rounded-xl border border-white/[0.06] pointer-events-none" />
        <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/10 to-transparent" />
      </div>
    </div>

    <!-- 无分段时兜底 -->
    <div
      v-else
      class="group relative rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-500"
    >
      <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent" />
      <div class="relative z-10 p-6">
        <div class="ai-content prose prose-invert prose-sm max-w-none">
          <div v-html="renderedContent" />
          <span
            v-if="streaming"
            class="inline-block w-[2px] h-5 bg-[#c9a227] ml-0.5 align-middle animate-pulse"
          />
        </div>
      </div>
      <div class="absolute inset-0 rounded-2xl border border-white/[0.06] pointer-events-none" />
      <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/15 to-transparent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface Props {
  title: string
  subtitle?: string
  icon?: string
  streaming: boolean
  content: string
}

const props = defineProps<Props>()

const renderedContent = computed(() => {
  if (!props.content) return ''
  return marked.parse(props.content, { async: false }) as string
})

interface Section {
  title: string
  content: string
  rendered: string
}

const sections = computed((): Section[] => {
  if (!props.content) return []
  const lines = props.content.split('\n')
  const result: Section[] = []
  let current: Section | null = null

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/)
    if (h2Match) {
      if (current) result.push(current)
      current = { title: h2Match[1].trim(), content: '', rendered: '' }
    } else if (current) {
      current.content += line + '\n'
    } else {
      if (!result.length) result.push({ title: '', content: '', rendered: '' })
      result[0].content += line + '\n'
    }
  }
  if (current) result.push(current)

  return result
    .map(s => ({ ...s, rendered: marked.parse(s.content.trim(), { async: false }) as string }))
    .filter(s => s.title || s.content.trim())
})

const hasSections = computed(() => sections.value.length > 1)
</script>

<style scoped>
/* === 基础排版 === */
.ai-content :deep(p) {
  margin-bottom: 0.875em;
  line-height: 1.8;
  color: #e8e0d0;
}

.ai-content :deep(strong) {
  color: #f5e6c0;
  font-weight: 600;
}

/* === h2 标题：菱形图标前缀 === */
.ai-content :deep(h2) {
  position: relative;
  padding-left: 1.25rem;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #c9a227;
  letter-spacing: 0.05em;
}

.ai-content :deep(h2)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.4rem;
  width: 0.5rem;
  height: 0.5rem;
  background: #c9a227;
  transform: rotate(45deg);
  border-radius: 1px;
  opacity: 0.8;
}

/* === h3 标题：圆点前缀 === */
.ai-content :deep(h3) {
  position: relative;
  padding-left: 1rem;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #f5e6c0;
}

.ai-content :deep(h3)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 0.35rem;
  height: 0.35rem;
  background: #c9a227;
  border-radius: 50%;
  opacity: 0.7;
}

/* === 引用块：金线 + 背景 === */
.ai-content :deep(blockquote) {
  position: relative;
  margin: 1rem 0;
  padding: 1rem 1.25rem;
  background: rgba(201, 162, 39, 0.05);
  border-left: 2px solid rgba(201, 162, 39, 0.4);
  border-radius: 0 8px 8px 0;
  font-style: italic;
}

.ai-content :deep(blockquote p) {
  margin-bottom: 0;
  color: #e8e0d0;
}

/* === 列表：自定义图标 === */
.ai-content :deep(ul) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 1rem;
}

.ai-content :deep(ul li) {
  position: relative;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
  line-height: 1.7;
  color: #e8e0d0;
}

.ai-content :deep(ul li::before) {
  content: '›';
  position: absolute;
  left: 0;
  top: -0.05rem;
  color: #c9a227;
  font-size: 1.1rem;
  font-weight: 700;
  opacity: 0.8;
}

/* === 有序列表：数字徽章 === */
.ai-content :deep(ol) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  counter-reset: item;
  margin-bottom: 1rem;
}

.ai-content :deep(ol li) {
  position: relative;
  padding-left: 1.75rem;
  margin-bottom: 0.5rem;
  line-height: 1.7;
  color: #e8e0d0;
}

.ai-content :deep(ol li::before) {
  counter-increment: item;
  content: counter(item);
  position: absolute;
  left: 0;
  top: 0.15rem;
  width: 1.1rem;
  height: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: #1a1612;
  background: #c9a227;
  border-radius: 4px;
  opacity: 0.85;
}

/* === 代码块 === */
.ai-content :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

.ai-content :deep(code) {
  background: rgba(201, 162, 39, 0.1);
  color: #c9a227;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85em;
}

.ai-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

/* === 分隔线 === */
.ai-content :deep(hr) {
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(201, 162, 39, 0.2), transparent);
  margin: 1.5rem 0;
}

/* === 链接 === */
.ai-content :deep(a) {
  color: #c9a227;
  text-decoration: none;
  border-bottom: 1px dashed rgba(201, 162, 39, 0.3);
  transition: border-color 0.2s;
}

.ai-content :deep(a:hover) {
  border-bottom-color: #c9a227;
}

/* === 流式光标动画 === */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.animate-pulse {
  animation: pulse 0.8s ease-in-out infinite;
}

.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
