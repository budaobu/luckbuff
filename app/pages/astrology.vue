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
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">Astrology</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('astrology.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-md mx-auto">
          {{ $t('astrology.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
      </div>

      <!-- 介绍文字 -->
      <div class="max-w-2xl mx-auto mb-12">
        <p class="text-sm text-[var(--text-muted)] leading-relaxed text-center">
          {{ $t('astrology.intro') }}
        </p>
      </div>

      <!-- 工具卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- 吠陀占星 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-globe-asia-australia" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolVedicTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolVedicDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/vedic-astro')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolVedicCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 星盘合婚配对 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-heart" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('vedicHepan.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('vedicHepan.subtitle') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/vedic-hepan')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('vedicHepan.submitBtn') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 星盘事业合伙人合盘 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-briefcase" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('vedicHepanCareer.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('vedicHepanCareer.subtitle') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/vedic-hepan-career')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('vedicHepanCareer.submitBtn') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 职场占星合盘 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-users" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('astroZhichangHepan.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('astroZhichangHepan.toolDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/astro-zhichang-hepan')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('astroZhichangHepan.toolCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 占星改运 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-globe-alt" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolAstroFortuneTuneTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolAstroFortuneTuneDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/astro-fortune-tune')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolAstroFortuneTuneCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 七政四余 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-star" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolQizhengSiyuTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolQizhengSiyuDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/qizheng-siyu')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolQizhengSiyuCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>

      <!-- 占星入门指南 -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('astrology.guideTitle') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-calendar-days" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('astrology.guide1Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('astrology.guide1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-map" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('astrology.guide2Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('astrology.guide2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-light-bulb" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('astrology.guide3Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('astrology.guide3Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('astrology.faqTitle') }}</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('astrology.faq1Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('astrology.faq1A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('astrology.faq2Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('astrology.faq2A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('astrology.faq3Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('astrology.faq3A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('astrology.faq4Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('astrology.faq4A') }}</p>
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
  title: () => `${t('seo.astrologyTitle')} - ${siteName}`,
  description: t('seo.astrologyDesc'),
  keywords: t('seo.astrologyKeywords'),
  ogTitle: () => `${t('seo.astrologyOgTitle')} - ${siteName}`,
  ogDescription: t('seo.astrologyOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/astrology',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.astrologyTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/astrology',
        description: t('seo.astrologyDesc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('home.toolVedicTitle'), url: 'https://www.ososn.com/tools/vedic-astro' },
            { '@type': 'ListItem', position: 2, name: t('vedicHepan.title'), url: 'https://www.ososn.com/tools/vedic-hepan' },
            { '@type': 'ListItem', position: 3, name: t('vedicHepanCareer.title'), url: 'https://www.ososn.com/tools/vedic-hepan-career' },
            { '@type': 'ListItem', position: 4, name: t('astroZhichangHepan.title'), url: 'https://www.ososn.com/tools/astro-zhichang-hepan' },
            { '@type': 'ListItem', position: 5, name: t('home.toolAstroFortuneTuneTitle'), url: 'https://www.ososn.com/tools/astro-fortune-tune' },
            { '@type': 'ListItem', position: 6, name: t('home.toolQizhengSiyuTitle'), url: 'https://www.ososn.com/tools/qizheng-siyu' },
          ],
        },
      }),
    },
  ],
}))
</script>
