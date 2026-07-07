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
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">Character Divination</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('cezi.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-md mx-auto">
          {{ $t('cezi.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
      </div>

      <!-- 介绍文字 -->
      <div class="max-w-2xl mx-auto mb-12">
        <p class="text-sm text-[var(--text-muted)] leading-relaxed text-center">
          {{ $t('cezi.intro') }}
        </p>
      </div>

      <!-- 工具卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 梅花易数测字（推荐） -->
        <div class="group arc-card relative rounded-2xl border border-[var(--accent-border)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="absolute top-3 right-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)] font-medium">
              {{ $t('cezi.recommended') }}
            </span>
          </div>
          <div class="p-5 flex flex-col flex-1">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2">{{ $t('ceziYishu.title') }}</h3>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-3 overflow-hidden">
              {{ $t('ceziYishu.toolDesc') }}
            </p>
            <UButton
              color="warning"
              size="sm"
              :to="localePath('/tools/cezi-yishu')"
              class="group/btn w-full justify-center mt-3"
            >
              {{ $t('ceziYishu.toolCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 周易测字 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-5 flex flex-col flex-1">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-pencil-square" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2">{{ $t('ceziZhouyi.title') }}</h3>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-3 overflow-hidden">
              {{ $t('ceziZhouyi.toolDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/cezi-zhouyi')"
              class="group/btn w-full justify-center mt-3"
            >
              {{ $t('ceziZhouyi.toolCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 六爻测字 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-5 flex flex-col flex-1">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-circle-stack" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2">{{ $t('liuyaoCezi.title') }}</h3>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-3 overflow-hidden">
              {{ $t('liuyaoCezi.toolDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/liuyao-cezi')"
              class="group/btn w-full justify-center mt-3"
            >
              {{ $t('liuyaoCezi.toolCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 诸葛神数测字 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-5 flex flex-col flex-1">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-numbered-list" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2">{{ $t('zhugeCezi.title') }}</h3>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-3 overflow-hidden">
              {{ $t('zhugeCezi.toolDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/zhuge-cezi')"
              class="group/btn w-full justify-center mt-3"
            >
              {{ $t('zhugeCezi.toolCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 姓名战斗陀螺 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-5 flex flex-col flex-1">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-bolt" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2">{{ $t('ceziBattle.title') }}</h3>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-3 overflow-hidden">
              {{ $t('ceziBattle.toolDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/cezi-battle')"
              class="group/btn w-full justify-center mt-3"
            >
              {{ $t('ceziBattle.toolCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

      </div>

      <!-- 测字指南 -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('cezi.guideTitle') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-pencil" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('cezi.guide1Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('cezi.guide1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('cezi.guide2Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('cezi.guide2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-bolt" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('cezi.guide3Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('cezi.guide3Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('cezi.faqTitle') }}</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('cezi.faq1Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('cezi.faq1A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('cezi.faq2Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('cezi.faq2A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('cezi.faq3Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('cezi.faq3A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('cezi.faq4Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('cezi.faq4A') }}</p>
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
  title: () => `${t('seo.ceziTitle')} - ${siteName}`,
  description: t('seo.ceziDesc'),
  keywords: t('seo.ceziKeywords'),
  ogTitle: () => `${t('seo.ceziOgTitle')} - ${siteName}`,
  ogDescription: t('seo.ceziOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/cezi',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.ceziTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/cezi',
        description: t('seo.ceziDesc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('ceziYishu.title'), url: 'https://www.ososn.com/tools/cezi-yishu' },
            { '@type': 'ListItem', position: 2, name: t('ceziZhouyi.title'), url: 'https://www.ososn.com/tools/cezi-zhouyi' },
            { '@type': 'ListItem', position: 3, name: t('liuyaoCezi.title'), url: 'https://www.ososn.com/tools/liuyao-cezi' },
            { '@type': 'ListItem', position: 4, name: t('zhugeCezi.title'), url: 'https://www.ososn.com/tools/zhuge-cezi' },
          ],
        },
      }),
    },
  ],
}))
</script>
