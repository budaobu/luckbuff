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

      <!-- 工具卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- 黄道吉日 -->
        <div class="group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="absolute top-3 right-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent-muted)] tracking-wide">New</span>
          </div>
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-sun" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolHuangdaoTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolHuangdaoDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/huangdao')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolHuangdaoCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 奇门遁甲 -->
        <div class="group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-map" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolQimenTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolQimenDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/qimen')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolQimenCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 吠陀占星 -->
        <div class="group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="absolute top-3 right-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent-purple-border)] bg-[var(--accent-purple-faint)] text-[var(--accent-purple-text)] tracking-wide">New</span>
          </div>
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

        <!-- 六爻占卜 -->
        <div class="group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="absolute top-3 right-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent-muted)] tracking-wide">New</span>
          </div>
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-circle-stack" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolLiuyaoDivinationTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolLiuyaoDivinationDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/liuyao-divination')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolLiuyaoDivinationCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 六爻世界杯 -->
        <div class="group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="absolute top-3 right-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent-muted)] tracking-wide">2026</span>
          </div>
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-trophy" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolLiuyaoTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolLiuyaoDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/liu-yao')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolLiuyaoCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 紫微斗数 -->
        <div class="group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-star" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolZwdsTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolZwdsDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/zwds')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolZwdsCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 大六壬 -->
        <div class="group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="absolute top-3 right-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent-muted)] tracking-wide">New</span>
          </div>
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-eye" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolLiurenTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolLiurenDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/liuren')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolLiurenCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 梅花易数 -->
        <div class="group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-swatch" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolZhouyiTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolZhouyiDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/zhouyi')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolZhouyiCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 四柱八字 -->
        <div class="group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-calendar-days" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolBaziTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolBaziDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/bazi')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolBaziCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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

useHead(() => ({
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
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('home.toolHuangdaoTitle'), url: 'https://www.ososn.com/tools/huangdao' },
            { '@type': 'ListItem', position: 2, name: t('home.toolQimenTitle'), url: 'https://www.ososn.com/tools/qimen' },
            { '@type': 'ListItem', position: 3, name: t('home.toolVedicTitle'), url: 'https://www.ososn.com/tools/vedic-astro' },
            { '@type': 'ListItem', position: 4, name: t('home.toolLiuyaoDivinationTitle'), url: 'https://www.ososn.com/tools/liuyao-divination' },
            { '@type': 'ListItem', position: 5, name: t('home.toolLiuyaoTitle'), url: 'https://www.ososn.com/tools/liu-yao' },
            { '@type': 'ListItem', position: 6, name: t('home.toolZwdsTitle'), url: 'https://www.ososn.com/tools/zwds' },
            { '@type': 'ListItem', position: 7, name: t('home.toolLiurenTitle'), url: 'https://www.ososn.com/tools/liuren' },
            { '@type': 'ListItem', position: 8, name: t('home.toolZhouyiTitle'), url: 'https://www.ososn.com/tools/zhouyi' },
            { '@type': 'ListItem', position: 9, name: t('home.toolBaziTitle'), url: 'https://www.ososn.com/tools/bazi' },
          ],
        },
      }),
    },
  ],
}))
</script>
