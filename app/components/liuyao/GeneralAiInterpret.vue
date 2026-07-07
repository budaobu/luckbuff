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
        <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('liuyaoDivination.aiTitle') }}</h3>
        <p class="text-[11px] text-[var(--text-placeholder)] mt-0.5">{{ $t('liuyaoDivination.aiSubtitle') }}</p>
      </div>
      <div v-if="streaming" class="flex items-center gap-1.5">
        <span class="text-xs text-[var(--accent-muted)]">{{ $t('liuyaoDivination.calculating') }}</span>
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
        </span>
      </div>
    </div>

    <!-- 总体判断摘要 -->
    <div v-if="parsedSummary" class="rounded-xl border border-[var(--accent-faint)] bg-[var(--accent-faint)] p-4">
      <p class="text-[11px] text-[var(--accent-muted)] mb-1.5 tracking-wide">{{ $t('liuyaoDivination.summaryLabel') }}</p>
      <p class="text-sm text-[var(--text-primary)] font-medium leading-relaxed">{{ parsedSummary }}</p>
    </div>

    <!-- AI 分析文本 —— 以卡片形式渲染各段落 -->
    <template v-if="parsedSections.length > 0">
      <div
        v-for="(section, idx) in parsedSections"
        :key="idx"
        class="rounded-xl border bg-[var(--surface-card)] p-4 transition-all duration-300"
        :class="sectionClass(section)"
      >
        <!-- 段落标题 -->
        <div class="flex items-center gap-2 mb-2">
          <UIcon
            :name="sectionIcon(section.title)"
            class="w-3.5 h-3.5"
            :class="sectionIconColor(section.title)"
          />
          <h4 class="text-xs font-semibold tracking-wide" :class="sectionTitleColor(section.title)">
            {{ section.title }}
          </h4>
        </div>
        <!-- 段落内容 -->
        <p class="text-[13px] text-[var(--text-body)]/65 leading-relaxed">
          {{ section.content }}
        </p>
      </div>
    </template>

    <!-- 流式输出中的纯文本（尚未解析为段落的临时展示） -->
    <div
      v-if="streaming && rawAnalysisText && !parsedSections.length"
      class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4"
    >
      <p class="text-[13px] text-[var(--text-body)]/65 leading-relaxed whitespace-pre-wrap">{{ rawAnalysisText }}</p>
    </div>

    <!-- 加载中 -->
    <div v-if="!parsedSummary && !parsedSections.length && streaming" class="flex items-center justify-center py-10">
      <LiuyaoCoinSpin size="tiny" :label="$t('liuyaoDivination.calculating')" />
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
        <p class="text-sm text-red-400">{{ error }}</p>
      </div>
    </div>

    <!-- 免责声明 -->
    <p v-if="parsedSections.length > 0 && !streaming" class="text-[10px] text-[var(--text-placeholder)] text-center">
      {{ $t('liuyaoDivination.disclaimer') }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  content: string
  streaming: boolean
  started: boolean
  error: string | null
}

const props = defineProps<Props>()

interface Section {
  title: string
  content: string
}

// ===== 总体判断解析 =====
const SUMMARY_REGEX = /<!--\s*summary:\s*(.+?)\s*-->/

const parsedSummary = computed<string | null>(() => {
  if (!props.content) return null
  let match = props.content.match(SUMMARY_REGEX)
  if (!match) {
    const lines = props.content.split('\n')
    for (const line of lines) {
      if (line.includes('summary:')) {
        const m = line.match(/summary:\s*(.+)/)
        if (m) {
          match = [line, m[1]?.trim() ?? '']
          break
        }
      }
    }
  }
  return match?.[1]?.trim() ?? null
})

// ===== 分析文本段落解析 =====
const rawAnalysisText = computed(() => {
  if (!props.content) return ''
  return props.content.replace(SUMMARY_REGEX, '').trim()
})

const parsedSections = computed<Section[]>(() => {
  const text = rawAnalysisText.value
  if (!text) return []

  const sections: Section[] = []

  // 方法 1：先尝试标准 ## 标题格式
  const parts = text.split(/^(##\s+.+)$/m)
  for (let i = 0; i < parts.length; i++) {
    const part = (parts[i] || '').trim()
    if (!part) continue
    if (part.startsWith('## ')) {
      const title = part.slice(3).trim()
      const content = (parts[i + 1] || '').trim()
      if (content) {
        sections.push({ title, content })
      }
      i++ // skip content, already consumed
    }
  }

  // 方法 2：如果没有 ## 格式，尝试通过空行或换行分段
  if (sections.length === 0) {
    const paragraphs = text.split(/\n\n+/)
    for (const para of paragraphs) {
      const trimmed = para.trim()
      if (!trimmed) continue
      const firstNewline = trimmed.indexOf('\n')
      if (firstNewline > 0) {
        const title = trimmed.slice(0, firstNewline).trim()
        const content = trimmed.slice(firstNewline + 1).trim()
        if (title && content) {
          sections.push({ title, content })
        }
      } else if (trimmed.length > 10) {
        sections.push({ title: '综合分析', content: trimmed })
      }
    }
  }

  if (sections.length === 0 && text.length > 0) {
    sections.push({ title: '综合分析', content: text })
  }

  return sections
})

// ===== 段落样式映射 =====
const SECTION_STYLES: Record<string, { icon: string; iconColor: string; titleColor: string; border: string }> = {
  // 中文标题
  '卦象总览': { icon: 'i-heroicons-book-open', iconColor: 'text-emerald-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-emerald-400/10' },
  '世应分析': { icon: 'i-heroicons-users', iconColor: 'text-amber-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-amber-400/10' },
  '世应旺衰': { icon: 'i-heroicons-arrow-trending-up', iconColor: 'text-amber-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-amber-400/10' },
  '动爻解读': { icon: 'i-heroicons-bolt', iconColor: 'text-orange-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-orange-400/10' },
  '动爻生克': { icon: 'i-heroicons-bolt', iconColor: 'text-orange-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-orange-400/10' },
  '动爻分析': { icon: 'i-heroicons-bolt', iconColor: 'text-orange-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-orange-400/10' },
  '用神分析': { icon: 'i-heroicons-heart', iconColor: 'text-rose-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-rose-400/10' },
  '官鬼分析': { icon: 'i-heroicons-fire', iconColor: 'text-red-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-red-400/10' },
  '时间参与': { icon: 'i-heroicons-clock', iconColor: 'text-sky-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-sky-400/10' },
  '月建日辰': { icon: 'i-heroicons-calendar', iconColor: 'text-sky-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-sky-400/10' },
  '卦象意象': { icon: 'i-heroicons-sparkles', iconColor: 'text-violet-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-violet-400/10' },
  '综合判断': { icon: 'i-heroicons-scale', iconColor: 'text-[var(--accent)]', titleColor: 'text-[var(--accent)]', border: 'border-[var(--accent-faint)]' },
  '结论': { icon: 'i-heroicons-flag', iconColor: 'text-[var(--accent)]', titleColor: 'text-[var(--accent)]', border: 'border-[var(--accent-faint)]' },
  '最终结论': { icon: 'i-heroicons-flag', iconColor: 'text-[var(--accent)]', titleColor: 'text-[var(--accent)]', border: 'border-[var(--accent-faint)]' },
  // 英文标题
  'Hexagram Overview': { icon: 'i-heroicons-book-open', iconColor: 'text-emerald-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-emerald-400/10' },
  'Self-Response Analysis': { icon: 'i-heroicons-users', iconColor: 'text-amber-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-amber-400/10' },
  'Self-Response Strength': { icon: 'i-heroicons-arrow-trending-up', iconColor: 'text-amber-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-amber-400/10' },
  'Moving Lines Interpretation': { icon: 'i-heroicons-bolt', iconColor: 'text-orange-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-orange-400/10' },
  'Moving Line Interactions': { icon: 'i-heroicons-bolt', iconColor: 'text-orange-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-orange-400/10' },
  'Useful God Analysis': { icon: 'i-heroicons-heart', iconColor: 'text-rose-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-rose-400/10' },
  'Officer (Guān-Guǐ)': { icon: 'i-heroicons-fire', iconColor: 'text-red-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-red-400/10' },
  'Official-Ghost Direction': { icon: 'i-heroicons-fire', iconColor: 'text-red-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-red-400/10' },
  'Synthesis': { icon: 'i-heroicons-scale', iconColor: 'text-[var(--accent)]', titleColor: 'text-[var(--accent)]', border: 'border-[var(--accent-faint)]' },
  'Conclusion': { icon: 'i-heroicons-flag', iconColor: 'text-[var(--accent)]', titleColor: 'text-[var(--accent)]', border: 'border-[var(--accent-faint)]' },
}

const DEFAULT_STYLE = { icon: 'i-heroicons-document-text', iconColor: 'text-[var(--text-faint)]', titleColor: 'text-[var(--text-muted)]', border: 'border-[var(--border-light)]' }

function getStyle(title: string) {
  for (const [key, style] of Object.entries(SECTION_STYLES)) {
    if (title.includes(key) || key.includes(title)) return style
  }
  return DEFAULT_STYLE
}

function sectionIcon(title: string) { return getStyle(title).icon }
function sectionIconColor(title: string) { return getStyle(title).iconColor }
function sectionTitleColor(title: string) { return getStyle(title).titleColor }
function sectionClass(section: Section) { return getStyle(section.title).border }
</script>
