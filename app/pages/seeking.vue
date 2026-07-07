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
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">Seeking</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('seeking.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-md mx-auto">
          {{ $t('seeking.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
      </div>

      <!-- 介绍文字 -->
      <div class="max-w-2xl mx-auto mb-12">
        <p class="text-sm text-[var(--text-muted)] leading-relaxed text-center">
          {{ $t('seeking.intro') }}
        </p>
      </div>

      <!-- 工具卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- 奇门遁甲寻物（推荐） -->
        <div class="group arc-card relative rounded-2xl border border-[var(--accent-border)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="absolute top-3 right-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)] font-medium">
              {{ $t('seeking.recommended') }}
            </span>
          </div>
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-radar" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('qimenSeeking.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('seeking.toolQimenSeekingDesc') }}
            </p>
            <UButton
              color="warning"
              size="md"
              :to="localePath('/tools/qimen-seeking')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('seeking.toolQimenSeekingCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 六爻寻物 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-circle-stack" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('liuyaoSeeking.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('seeking.toolLiuyaoSeekingDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/liuyao-seeking')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('seeking.toolLiuyaoSeekingCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 大六壬寻物 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-eye" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('liurenSeeking.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('seeking.toolLiurenSeekingDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/liuren-seeking')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('seeking.toolLiurenSeekingCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 小六壬寻物 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-hand-raised" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('xiaoLiurenSeeking.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('seeking.toolXiaoLiurenSeekingDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/xiao-liuren-seeking')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('seeking.toolXiaoLiurenSeekingCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>

      <!-- 寻物指南 -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('seeking.guideTitle') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('seeking.guide1Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('seeking.guide1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-bolt" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('seeking.guide2Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('seeking.guide2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-check-badge" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('seeking.guide3Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('seeking.guide3Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('seeking.faqTitle') }}</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('seeking.faq1Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('seeking.faq1A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('seeking.faq2Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('seeking.faq2A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('seeking.faq3Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('seeking.faq3A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('seeking.faq4Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('seeking.faq4A') }}</p>
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
  title: () => `${t('seo.seekingTitle')} - ${siteName}`,
  description: t('seo.seekingDesc'),
  keywords: t('seo.seekingKeywords'),
  ogTitle: () => `${t('seo.seekingOgTitle')} - ${siteName}`,
  ogDescription: t('seo.seekingOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/seeking',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.seekingTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/seeking',
        description: t('seo.seekingDesc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('qimenSeeking.title'), url: 'https://www.ososn.com/tools/qimen-seeking' },
            { '@type': 'ListItem', position: 2, name: t('liuyaoSeeking.title'), url: 'https://www.ososn.com/tools/liuyao-seeking' },
            { '@type': 'ListItem', position: 3, name: t('liurenSeeking.title'), url: 'https://www.ososn.com/tools/liuren-seeking' },
            { '@type': 'ListItem', position: 4, name: t('xiaoLiurenSeeking.title'), url: 'https://www.ososn.com/tools/xiao-liuren-seeking' },
          ],
        },
      }),
    },
  ],
}))
</script>
