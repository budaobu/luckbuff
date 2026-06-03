<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-16">
      <!-- Section 标题 -->
      <div class="mb-10">
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">{{ $t('privacy.subtitle') }}</span>
        <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          {{ $t('privacy.title') }}
        </h1>
        <div class="w-12 h-px bg-[var(--accent-border)] mt-4" />
      </div>

      <div class="space-y-8 text-sm text-[var(--text-body)] leading-relaxed">
        <section>
          <h2 class="text-lg font-semibold text-[var(--accent)] mb-2">{{ $t('privacy.section1Title') }}</h2>
          <p>{{ $t('privacy.section1Content') }}</p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-[var(--accent)] mb-2">{{ $t('privacy.section2Title') }}</h2>
          <p>{{ $t('privacy.section2Content') }}</p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-[var(--accent)] mb-2">{{ $t('privacy.section3Title') }}</h2>
          <p>{{ $t('privacy.section3Content') }}</p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-[var(--accent)] mb-2">{{ $t('privacy.section4Title') }}</h2>
          <p>{{ $t('privacy.section4Content') }}</p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-[var(--accent)] mb-2">{{ $t('privacy.section5Title') }}</h2>
          <p>{{ $t('privacy.section5Content') }}</p>
        </section>

        <div class="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style="border-color: var(--border-subtle);">
          <p class="text-xs" style="color: var(--text-faint);">
            {{ $t('privacy.lastUpdated', { date: '2025-05-29' }) }}
          </p>
          <UButton color="warning" variant="soft" size="sm" :to="localePath('/')">
            <template #leading>
              <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            </template>
            {{ $t('common.backHome') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: t('privacy.seoTitle'),
  description: t('privacy.seoDesc'),
  ogTitle: t('privacy.seoTitle'),
  ogDescription: t('privacy.seoDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/privacy',
  twitterCard: 'summary_large_image',
})
</script>
