<template>
  <div class="space-y-5">
    <!-- 相关工具 CTA -->
    <section
      v-if="tools.length"
      class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5"
    >
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-heroicons-wrench-screwdriver" class="w-4 h-4 text-[var(--accent)]" />
        <h2 class="text-sm font-semibold text-[var(--text-primary)]">{{ t('insights.sidebarToolsTitle') }}</h2>
      </div>
      <div class="space-y-1.5">
        <NuxtLink
          v-for="tool in tools"
          :key="tool.path"
          :to="localePath(tool.path)"
          class="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 -mx-2.5 transition-colors duration-200 hover:bg-[var(--accent-faint)]"
        >
          <div class="shrink-0 w-9 h-9 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
            <UIcon :name="tool.icon" class="w-4.5 h-4.5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-[13px] font-medium text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent)] transition-colors">
              {{ t(tool.titleKey) }}
            </div>
            <div class="text-[11px] text-[var(--text-faint)] leading-snug line-clamp-1 mt-0.5">{{ t(tool.descKey) }}</div>
          </div>
          <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5 shrink-0 text-[var(--text-faint)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
        </NuxtLink>
      </div>
    </section>

    <!-- 相关阅读 -->
    <section
      v-if="related.length"
      class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5"
    >
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-heroicons-newspaper" class="w-4 h-4 text-[var(--accent)]" />
        <h2 class="text-sm font-semibold text-[var(--text-primary)]">{{ t('insights.sidebarRelatedTitle') }}</h2>
      </div>
      <ul class="space-y-1">
        <li v-for="a in related" :key="a.slug">
          <NuxtLink
            :to="localePath(`/insights/${a.slug}`)"
            class="group block rounded-xl px-2.5 py-2.5 -mx-2.5 transition-colors duration-200 hover:bg-[var(--accent-faint)]"
          >
            <div class="text-[13px] font-medium text-[var(--text-body)] leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
              {{ a.title }}
            </div>
            <div class="flex items-center gap-2 mt-1.5 text-[11px] text-[var(--text-faint)]">
              <span v-if="a.publishedAt">{{ formatDate(a.publishedAt) }}</span>
              <span v-if="a.readingTime" class="flex items-center gap-1">
                <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                {{ t('insights.readingTime', { n: a.readingTime }) }}
              </span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
export interface InsightToolCard {
  path: string
  icon: string
  titleKey: string
  descKey: string
}

export interface InsightRelatedArticle {
  slug: string
  title: string
  publishedAt: string
  readingTime: number
}

defineProps<{
  tools: InsightToolCard[]
  related: InsightRelatedArticle[]
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const fmtLocale = locale.value === 'en' ? 'en-US' : locale.value
  return d.toLocaleDateString(fmtLocale, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
