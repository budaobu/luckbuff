<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 py-16">
      <!-- Section 标题 -->
      <div class="text-center mb-14">
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">Naming</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('naming.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-md mx-auto">
          {{ $t('naming.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
      </div>

      <!-- 介绍文字 -->
      <div class="max-w-2xl mx-auto mb-12">
        <p class="text-sm text-[var(--text-muted)] leading-relaxed text-center">
          {{ $t('naming.intro') }}
        </p>
      </div>

      <!-- 工具卡片 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        <!-- 三才五格起名（推荐） -->
        <div class="group arc-card relative rounded-2xl border border-[var(--accent-border)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="absolute top-3 right-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)] font-medium">
              {{ $t('naming.recommended') }}
            </span>
          </div>
          <div class="p-5 flex flex-col flex-1">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2">{{ $t('sancaiWuge.title') }}</h3>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-3 overflow-hidden">
              {{ $t('naming.toolSancaiWugeDesc') }}
            </p>
            <UButton
              color="warning"
              size="sm"
              :to="localePath('/tools/sancai-wuge')"
              class="group/btn w-full justify-center mt-3"
            >
              {{ $t('naming.toolSancaiWugeCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 八字起名 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-5 flex flex-col flex-1">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-fire" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2">{{ $t('baziNaming.title') }}</h3>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-3 overflow-hidden">
              {{ $t('naming.toolBaziNamingDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/bazi-naming')"
              class="group/btn w-full justify-center mt-3"
            >
              {{ $t('naming.toolBaziNamingCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 五格剖象法 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-5 flex flex-col flex-1">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2">{{ $t('wuge.title') }}</h3>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-3 overflow-hidden">
              {{ $t('naming.toolWugeDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/wuge')"
              class="group/btn w-full justify-center mt-3"
            >
              {{ $t('naming.toolWugeCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 姓名测试打分 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-5 flex flex-col flex-1">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-star" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2">{{ $t('home.toolNameScoreTitle') }}</h3>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-3 overflow-hidden">
              {{ $t('naming.toolNameScoreDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/name-score')"
              class="group/btn w-full justify-center mt-3"
            >
              {{ $t('naming.toolNameScoreCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 姓名灵数 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-5 flex flex-col flex-1">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-numbered-list" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2">{{ $t('numerology.title') }}</h3>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-3 overflow-hidden">
              {{ $t('home.toolNumerologyDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/numerology')"
              class="group/btn w-full justify-center mt-3"
            >
              {{ $t('home.toolNumerologyCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

      </div>

      <!-- 起名指南 -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('naming.guideTitle') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-book-open" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('naming.guide1Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('naming.guide1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-pencil" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('naming.guide2Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('naming.guide2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-check-badge" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('naming.guide3Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('naming.guide3Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('naming.faqTitle') }}</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('naming.faq1Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('naming.faq1A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('naming.faq2Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('naming.faq2A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('naming.faq3Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('naming.faq3A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('naming.faq4Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('naming.faq4A') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.namingTitle')} - ${siteName}`,
  description: t('seo.namingDesc'),
  keywords: t('seo.namingKeywords'),
  ogTitle: () => `${t('seo.namingOgTitle')} - ${siteName}`,
  ogDescription: t('seo.namingOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/naming',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.namingTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/naming',
        description: t('seo.namingDesc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('sancaiWuge.title'), url: 'https://www.ososn.com/tools/sancai-wuge' },
            { '@type': 'ListItem', position: 2, name: t('baziNaming.title'), url: 'https://www.ososn.com/tools/bazi-naming' },
            { '@type': 'ListItem', position: 3, name: t('wuge.title'), url: 'https://www.ososn.com/tools/wuge' },
            { '@type': 'ListItem', position: 4, name: t('home.toolNameScoreTitle'), url: 'https://www.ososn.com/tools/name-score' },
            { '@type': 'ListItem', position: 5, name: t('numerology.title'), url: 'https://www.ososn.com/tools/numerology' },
          ],
        },
      }),
    },
  ],
}))
</script>
