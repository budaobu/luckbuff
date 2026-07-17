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
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">Feng Shui Layout</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('fengshui.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-md mx-auto">
          {{ $t('fengshui.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
      </div>

      <!-- 介绍文字 -->
      <div class="max-w-2xl mx-auto mb-12">
        <p class="text-sm text-[var(--text-muted)] leading-relaxed text-center">
          {{ $t('fengshui.intro') }}
        </p>
      </div>

      <!-- 工具卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- 看风水 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-map" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolFengshuiTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolFengshuiDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/fengshui')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolFengshuiCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 玄空风水 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-table-cells" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolXuankongFengshuiTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolXuankongFengshuiDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/xuankong-fengshui')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolXuankongFengshuiCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 紫白飞星 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-squares-2x2" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('home.toolZibaifeixingTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('home.toolZibaifeixingDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/zibaifeixing')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('home.toolZibaifeixingCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 八宅风水 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-building-office-2" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('bazhai.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('seo.bazhaiDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/bazhai-fengshui')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('bazhai.submitBtn') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 办公室风水布局 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-briefcase" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('officeFengshui.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('seo.officeFengshuiDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/office-fengshui')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('officeFengshui.submitBtn') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 书房风水布局 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-academic-cap" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('studyFengshui.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('seo.studyFengshuiDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/study-fengshui')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('studyFengshui.submitBtn') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 卧室风水布局 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-moon" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('bedroomFengshui.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('seo.bedroomFengshuiDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/bedroom-fengshui')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('bedroomFengshui.submitBtn') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 厅堂风水布局 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-home" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('hallFengshui.title') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('seo.hallFengshuiDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/hall-fengshui')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('hallFengshui.submitBtn') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 风水摆件 -->
        <div class="group arc-card relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-1 flex flex-col">
          <div class="p-8 flex flex-col flex-1">
            <div class="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-gift" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[var(--text-primary)] mb-3">{{ $t('fengshui.ornamentTitle') }}</h3>
            <p class="text-sm text-[var(--text-muted)] leading-relaxed flex-1 line-clamp-4 overflow-hidden">
              {{ $t('fengshui.ornamentDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/fengshui-ornament')"
              class="group/btn w-full justify-center mt-4"
            >
              {{ $t('fengshui.ornamentCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>

      <!-- 风水布局指南 -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('fengshui.guideTitle') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-map" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('fengshui.guide1Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('fengshui.guide1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('fengshui.guide2Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('fengshui.guide2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center">
            <div class="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
              <UIcon name="i-heroicons-light-bulb" class="w-5 h-5" />
            </div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('fengshui.guide3Title') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('fengshui.guide3Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] text-center mb-6">{{ $t('fengshui.faqTitle') }}</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('fengshui.faq1Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('fengshui.faq1A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('fengshui.faq2Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('fengshui.faq2A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('fengshui.faq3Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('fengshui.faq3A') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('fengshui.faq4Q') }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('fengshui.faq4A') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const siteName = config.public.siteName as string
const siteUrl = (config.public.siteUrl as string) || 'https://www.ososn.com'

useSeoMeta({
  title: () => `${t('seo.fengshuiLayoutTitle')} - ${siteName}`,
  description: t('seo.fengshuiLayoutDesc'),
  keywords: t('seo.fengshuiLayoutKeywords'),
  ogTitle: () => `${t('seo.fengshuiLayoutOgTitle')} - ${siteName}`,
  ogDescription: t('seo.fengshuiLayoutOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}/fengshui`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.fengshuiLayoutTitle')} - ${siteName}`,
        url: `${siteUrl}/fengshui`,
        description: t('seo.fengshuiLayoutDesc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('home.toolFengshuiTitle'), url: `${siteUrl}/tools/fengshui` },
            { '@type': 'ListItem', position: 2, name: t('home.toolXuankongFengshuiTitle'), url: `${siteUrl}/tools/xuankong-fengshui` },
            { '@type': 'ListItem', position: 3, name: t('home.toolZibaifeixingTitle'), url: `${siteUrl}/tools/zibaifeixing` },
            { '@type': 'ListItem', position: 4, name: t('bazhai.title'), url: `${siteUrl}/tools/bazhai-fengshui` },
            { '@type': 'ListItem', position: 5, name: t('officeFengshui.title'), url: `${siteUrl}/tools/office-fengshui` },
            { '@type': 'ListItem', position: 6, name: t('studyFengshui.title'), url: `${siteUrl}/tools/study-fengshui` },
            { '@type': 'ListItem', position: 7, name: t('bedroomFengshui.title'), url: `${siteUrl}/tools/bedroom-fengshui` },
            { '@type': 'ListItem', position: 8, name: t('hallFengshui.title'), url: `${siteUrl}/tools/hall-fengshui` },
            { '@type': 'ListItem', position: 9, name: t('fengshui.ornamentTitle'), url: `${siteUrl}/tools/fengshui-ornament` },
          ],
        },
      }),
    },
  ],
}))
</script>
