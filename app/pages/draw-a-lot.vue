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
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">Oracle Sticks</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('drawALotTopic.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-md mx-auto">
          {{ $t('drawALotTopic.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
      </div>

      <!-- 介绍文字 -->
      <div class="max-w-2xl mx-auto mb-12">
        <p class="text-sm text-[var(--text-muted)] leading-relaxed text-center">
          {{ $t('drawALotTopic.intro') }}
        </p>
      </div>

      <!-- 工具卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="tool in tools"
          :key="tool.titleKey"
          class="group arc-card relative rounded-2xl border bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col"
          :class="tool.recommended ? 'border-[var(--accent-border)]' : 'border-[var(--border-subtle)]'"
        >
          <div v-if="tool.recommended" class="absolute top-3 right-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)] font-medium">
              {{ $t('drawALotTopic.recommended') }}
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

      <!-- 抽签指南 -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('drawALotTopic.guideTitle') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
             <UIcon name="i-heroicons-hand-raised" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('drawALotTopic.guide1Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('drawALotTopic.guide1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-gift-top" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('drawALotTopic.guide2Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('drawALotTopic.guide2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-light-bulb" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('drawALotTopic.guide3Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('drawALotTopic.guide3Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('drawALotTopic.faqTitle') }}</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('drawALotTopic.faq1Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('drawALotTopic.faq1A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('drawALotTopic.faq2Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('drawALotTopic.faq2A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('drawALotTopic.faq3Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('drawALotTopic.faq3A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('drawALotTopic.faq4Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('drawALotTopic.faq4A') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const tools = [
  {
    icon: 'i-heroicons-gift-top',
    titleKey: 'drawALot.title',
    descKey: 'drawALot.toolDesc',
    ctaKey: 'drawALot.toolCta',
    path: '/tools/guanyin-lots',
    recommended: true,
  },
  {
    icon: 'i-heroicons-currency-dollar',
    titleKey: 'wealthGodLot.title',
    descKey: 'wealthGodLot.toolDesc',
    ctaKey: 'wealthGodLot.toolCta',
    path: '/tools/5-god-of-wealth-lot',
  },
  {
    icon: 'i-heroicons-flag',
    titleKey: 'sanshanwangLot.title',
    descKey: 'sanshanwangLot.toolDesc',
    ctaKey: 'sanshanwangLot.toolCta',
    path: '/tools/3shanwang-lot',
  },
  {
    icon: 'i-heroicons-heart',
    titleKey: 'mazuLot.title',
    descKey: 'mazuLot.toolDesc',
    ctaKey: 'mazuLot.toolCta',
    path: '/tools/mazu-lot',
  },
  {
    icon: 'i-heroicons-numbered-list',
    titleKey: 'zhugeCezi.title',
    descKey: 'zhugeCezi.toolDesc',
    ctaKey: 'zhugeCezi.toolCta',
    path: '/tools/zhuge-cezi',
  },
  {
    icon: 'i-heroicons-hand-raised',
    titleKey: 'jiaobei.title',
    descKey: 'jiaobei.toolDesc',
    ctaKey: 'jiaobei.toolCta',
    path: '/tools/jiaobei',
  },
]

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.drawALotTitle')} - ${siteName}`,
  description: t('seo.drawALotDesc'),
  keywords: t('seo.drawALotKeywords'),
  ogTitle: () => `${t('seo.drawALotOgTitle')} - ${siteName}`,
  ogDescription: t('seo.drawALotOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/draw-a-lot',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.drawALotTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/draw-a-lot',
        description: t('seo.drawALotDesc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('drawALot.title'), url: 'https://www.ososn.com/tools/guanyin-lots' },
            { '@type': 'ListItem', position: 2, name: t('wealthGodLot.title'), url: 'https://www.ososn.com/tools/5-god-of-wealth-lot' },
            { '@type': 'ListItem', position: 3, name: t('sanshanwangLot.title'), url: 'https://www.ososn.com/tools/3shanwang-lot' },
           { '@type': 'ListItem', position: 4, name: t('mazuLot.title'), url: 'https://www.ososn.com/tools/mazu-lot' },
           { '@type': 'ListItem', position: 5, name: t('zhugeCezi.title'), url: 'https://www.ososn.com/tools/zhuge-cezi' },
           { '@type': 'ListItem', position: 6, name: t('jiaobei.title'), url: 'https://www.ososn.com/tools/jiaobei' },
         ],
        },
      }),
    },
  ],
}))
</script>
