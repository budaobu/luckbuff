<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[#c9a227]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[#8b5cf6]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-16">
      <!-- Section 标题 -->
      <div class="mb-10">
        <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">{{ $t('terms.subtitle') }}</span>
        <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
          {{ $t('terms.title') }}
        </h1>
        <div class="w-12 h-px bg-[#c9a227]/30 mt-4" />
      </div>

      <div class="space-y-8 text-sm text-[#e8e0d0]/80 leading-relaxed">
      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">{{ $t('terms.section1Title') }}</h2>
        <p>{{ $t('terms.section1Content') }}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">{{ $t('terms.section2Title') }}</h2>
        <p>{{ $t('terms.section2Content1') }}</p>
        <p class="mt-2">{{ $t('terms.section2Content2') }}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">{{ $t('terms.section3Title') }}</h2>
        <p>{{ $t('terms.section3Content') }}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">{{ $t('terms.section4Title') }}</h2>
        <p>{{ $t('terms.section4Content') }}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">{{ $t('terms.section5Title') }}</h2>
        <p>{{ $t('terms.section5Content') }}</p>
      </section>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('terms.seoTitle'),
  titleTemplate: '%s',
  description: t('terms.seoDesc'),
  ogTitle: t('terms.seoTitle'),
  ogDescription: t('terms.seoDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/terms',
  twitterCard: 'summary_large_image',
})
</script>
