<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 py-16">
      <!-- Page 标题 -->
      <div class="text-center mb-14">
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">Tools</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('tools.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-md mx-auto">
          {{ $t('tools.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />

        <!-- 使用提示 -->
        <div class="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-sm text-[var(--text-faint)]">
          <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
          <i18n-t keypath="tools.guide" tag="span">
            <template #profileLink>
              <NuxtLink :to="localePath('/settings')" class="text-[var(--accent)] hover:underline">{{ $t('tools.profileLink') }}</NuxtLink>
            </template>
          </i18n-t>
        </div>
      </div>

      <!-- ====== 专题区块 ====== -->
      <div class="space-y-16">
        <div v-for="category in categories" :key="category.id">
          <!-- 专题标题 -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span class="w-1.5 h-5 rounded-full bg-[var(--accent)]" />
                {{ $t(category.titleKey) }}
              </h2>
              <p class="text-xs text-[var(--text-muted)] mt-1 ml-3.5">{{ $t(category.subtitleKey) }}</p>
            </div>
          </div>

          <!-- 工具卡片 grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="tool in category.tools.slice(0, 4)"
              :key="tool.path"
              class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col"
              :class="{ 'border-[var(--accent-border)]': tool.recommended }"
            >
              <!-- 推荐标签 -->
              <div v-if="tool.recommended" class="absolute top-2 right-2">
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)] font-medium">
                  {{ $t('seeking.recommended') }}
                </span>
              </div>

              <div class="p-5 flex flex-col flex-1">
                <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <UIcon :name="tool.icon" class="w-5 h-5" />
                </div>
                <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2">{{ $t(tool.titleKey) }}</h3>
                <p class="text-xs text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-3 overflow-hidden">
                  {{ $t(tool.descKey) }}
                </p>
                <UButton
                  color="warning"
                  :variant="tool.recommended ? 'solid' : 'soft'"
                  size="sm"
                  :to="localePath(tool.path)"
                  class="group/btn w-full justify-center mt-3"
                >
                  {{ $t(tool.ctaKey) }}
                  <template #trailing>
                    <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </template>
                </UButton>
              </div>
              <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

          <!-- 更多按钮 -->
          <div class="mt-5 flex justify-center">
            <NuxtLink
              :to="localePath(category.sectionPath)"
              class="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-sm text-[var(--text-muted)] transition-all duration-300 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:text-[var(--text-primary)]"
            >
              {{ $t('tools.more', { category: $t(category.titleKey) }) }}
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const categories = useToolCategories()

const siteName = 'ososn'

// ── SEO ──
useSeoMeta({
  title: () => `${t('seo.toolsTitle')} - ${siteName}`,
  description: t('seo.toolsDesc'),
  keywords: t('seo.toolsKeywords'),
  ogTitle: () => `${t('seo.toolsOgTitle')} - ${siteName}`,
  ogDescription: t('seo.toolsOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools',
  twitterCard: 'summary_large_image',
})

// JSON-LD: 每个专题作为 ItemList，整体为 WebPage
useHead(() => {
  const allTools = getAllToolsFlat()
  const itemListElement = allTools.map((tool, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: t(tool.titleKey),
    url: `https://www.ososn.com${tool.path}`,
  }))

  return {
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${t('seo.toolsTitle')} - ${siteName}`,
          url: 'https://www.ososn.com/tools',
          description: t('seo.toolsDesc'),
          mainEntity: {
            '@type': 'ItemList',
            itemListElement,
          },
        }),
      },
    ],
  }
})
</script>
