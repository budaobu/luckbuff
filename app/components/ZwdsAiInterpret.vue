<template>
  <div class="space-y-4">
    <!-- 标题区 -->
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227]"
      >
        <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-base font-semibold text-[#f5e6c0] tracking-wide">AI 命盘解读</h3>
      </div>
      <div v-if="streaming" class="flex items-center gap-1.5">
        <span class="text-xs text-[#c9a227]/60">解读中</span>
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9a227] opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-[#c9a227]" />
        </span>
      </div>
    </div>

    <!-- 免责声明 -->
    <div class="flex items-start gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5">
      <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-[#c9a227]/50 mt-0.5 shrink-0" />
      <p class="text-xs text-[#e8e0d0]/30 leading-relaxed">
        命盘解读基于出生时间的统计性规律，反映概率倾向，不代表确定性预言。人生走向受主观选择影响，命盘仅供参考。
      </p>
    </div>

    <!-- 加载中：命盘预览 + 动画 -->
    <div v-if="!started && streaming">
      <ZwdsPanPreview :chart="chart" class="mb-4 opacity-60" />
      <div class="flex flex-col items-center py-6">
        <TianganDizhi size="compact" label="AI 正在解读命盘..." />
      </div>
    </div>

    <!-- 结构化卡片展示（从流式 markdown 实时解析） -->
    <div v-if="sections.length > 0" class="space-y-3">
      <div
        v-for="(section, index) in sections"
        :key="section.title"
        class="group relative rounded-xl backdrop-blur-sm overflow-hidden border transition-all duration-300"
        :class="[
          section.meta?.borderColor || 'border-white/[0.06]',
          section.meta?.bgGradient || 'from-white/[0.02]',
        ]"
        :style="{ background: `linear-gradient(to bottom right, var(--tw-gradient-from), transparent)` }"
      >
        <div class="relative z-10 p-5">
          <div class="flex items-center gap-2.5 mb-3">
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center"
              :class="section.meta?.iconBg || 'bg-white/5'"
            >
              <UIcon
                :name="section.meta?.icon || 'i-heroicons-document-text'"
                class="w-4 h-4"
                :class="section.meta?.color || 'text-[#e8e0d0]/50'"
              />
            </div>
            <h4
              class="text-sm font-semibold"
              :class="section.meta?.color || 'text-[#e8e0d0]/70'"
            >
              {{ section.title }}
            </h4>
          </div>
          <div class="ai-section-content" v-html="renderSection(section.content)" />
          <!-- 流式闪烁光标：只在最后一个 section 且正在流式时显示 -->
          <span
            v-if="streaming && index === sections.length - 1"
            class="inline-block w-[2px] h-5 bg-[#c9a227] ml-0.5 align-middle animate-pulse mt-1"
          />
        </div>
      </div>
    </div>

    <!-- AI 错误 -->
    <div v-if="error" class="text-center py-8">
      <TianganDizhi size="compact" label="AI 服务暂时繁忙" />
      <p class="mt-4 text-sm text-red-400">{{ error }}</p>
      <UButton color="warning" class="mt-4" @click="$emit('retry')">
        <template #leading>
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
        </template>
        重试
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { ZwdsChart } from '~/types/zwds'

interface Props {
  chart: ZwdsChart
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

/** 紫微斗数解读章节主题映射 */
const sectionMetaMap: Record<string, SectionMeta> = {
  '命格总览': {
    icon: 'i-heroicons-star',
    color: 'text-[#c9a227]',
    borderColor: 'border-[#c9a227]/15',
    bgGradient: 'from-[#c9a227]/[0.06]',
    iconBg: 'bg-[#c9a227]/10',
  },
  '命宫解读': {
    icon: 'i-heroicons-user',
    color: 'text-[#8b5cf6]',
    borderColor: 'border-[#8b5cf6]/15',
    bgGradient: 'from-[#8b5cf6]/[0.05]',
    iconBg: 'bg-[#8b5cf6]/10',
  },
  '事业与财帛': {
    icon: 'i-heroicons-briefcase',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/15',
    bgGradient: 'from-amber-500/[0.05]',
    iconBg: 'bg-amber-500/10',
  },
  '感情与婚姻': {
    icon: 'i-heroicons-heart',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/15',
    bgGradient: 'from-rose-500/[0.05]',
    iconBg: 'bg-rose-500/10',
  },
  '健康与抗压': {
    icon: 'i-heroicons-shield-check',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/15',
    bgGradient: 'from-emerald-500/[0.05]',
    iconBg: 'bg-emerald-500/10',
  },
  '六亲与社交': {
    icon: 'i-heroicons-users',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/15',
    bgGradient: 'from-blue-500/[0.05]',
    iconBg: 'bg-blue-500/10',
  },
  '当前大限': {
    icon: 'i-heroicons-clock',
    color: 'text-violet-400',
    borderColor: 'border-violet-500/15',
    bgGradient: 'from-violet-500/[0.05]',
    iconBg: 'bg-violet-500/10',
  },
  '流年提示': {
    icon: 'i-heroicons-calendar',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/15',
    bgGradient: 'from-cyan-500/[0.05]',
    iconBg: 'bg-cyan-500/10',
  },
  '综合建议': {
    icon: 'i-heroicons-light-bulb',
    color: 'text-[#c9a227]',
    borderColor: 'border-[#c9a227]/15',
    bgGradient: 'from-[#c9a227]/[0.06]',
    iconBg: 'bg-[#c9a227]/15',
  },
}

const sections = computed(() => {
  const text = typeof props.content === 'string' ? props.content : ''
  if (!text) return []

  // 按 ## 标题分割，保留标题
  const rawSections = text.split(/\n(?=##\s)/)

  const result: { title: string; content: string; meta: SectionMeta | undefined }[] = []

  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed || !trimmed.startsWith('##')) continue

    const lines = trimmed.split('\n')
    const titleLine = lines[0].replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()

    if (titleLine) {
      result.push({
        title: titleLine,
        content,
        meta: sectionMetaMap[titleLine],
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
/* === 分段卡片内的 markdown 样式 === */
.ai-section-content :deep(p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: #e8e0d0;
}
.ai-section-content :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-section-content :deep(strong) {
  color: #f5e6c0;
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
  color: #e8e0d0;
}
.ai-section-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: #c9a227;
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
  color: #e8e0d0;
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
  background: #c9a227;
  border-radius: 3px;
  opacity: 0.8;
}
.ai-section-content :deep(blockquote) {
  margin: 0.5rem 0;
  padding: 0.6rem 0.8rem;
  background: rgba(201, 162, 39, 0.04);
  border-left: 2px solid rgba(201, 162, 39, 0.3);
  border-radius: 0 6px 6px 0;
  font-style: italic;
}
.ai-section-content :deep(h3) {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f5e6c0;
  margin-top: 0.75rem;
  margin-bottom: 0.4rem;
}
.ai-section-content :deep(h4) {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e8e0d0;
  margin-top: 0.5rem;
  margin-bottom: 0.3rem;
}
.ai-section-content :deep(code) {
  background: rgba(255, 255, 255, 0.06);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-size: 0.85em;
  color: #c9a227;
}
.ai-section-content :deep(pre) {
  background: rgba(255, 255, 255, 0.04);
  padding: 0.75rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5rem 0;
}
.ai-section-content :deep(pre code) {
  background: none;
  padding: 0;
  color: #e8e0d0;
}
</style>
