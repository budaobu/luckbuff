<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-[#c9a227]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 py-16">
      <!-- Section 标题 -->
      <div class="text-center mb-14">
        <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-3 block">Tools</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[#f5e6c0] tracking-tight">
          {{ $t('tools.title') }}
        </h1>
        <p class="text-sm text-[#e8e0d0]/40 mt-3 max-w-md mx-auto">
          {{ $t('tools.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[#c9a227]/30 mx-auto mt-5" />
      </div>

      <!-- 工具卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 四柱八字 -->
        <div class="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[#c9a227]/30 hover:bg-white/[0.04] hover:-translate-y-1">
          <div class="p-8">
            <div class="w-14 h-14 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-calendar-days" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[#f5e6c0] mb-3">{{ $t('home.toolBaziTitle') }}</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-8">
              {{ $t('home.toolBaziDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/bazi')"
              class="group/btn w-full justify-center"
            >
              {{ $t('home.toolBaziCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 梅花易数 -->
        <div class="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[#c9a227]/30 hover:bg-white/[0.04] hover:-translate-y-1">
          <div class="p-8">
            <div class="w-14 h-14 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-swatch" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[#f5e6c0] mb-3">{{ $t('home.toolZhouyiTitle') }}</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-8">
              {{ $t('home.toolZhouyiDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/zhouyi')"
              class="group/btn w-full justify-center"
            >
              {{ $t('home.toolZhouyiCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 紫微斗数 -->
        <div class="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[#c9a227]/30 hover:bg-white/[0.04] hover:-translate-y-1">
          <div class="p-8">
            <div class="w-14 h-14 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-star" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[#f5e6c0] mb-3">{{ $t('home.toolZwdsTitle') }}</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-8">
              {{ $t('home.toolZwdsDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/zwds')"
              class="group/btn w-full justify-center"
            >
              {{ $t('home.toolZwdsCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 六爻世界杯 -->
        <div class="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[#c9a227]/30 hover:bg-white/[0.04] hover:-translate-y-1">
          <div class="absolute top-3 right-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full border border-[#c9a227]/20 bg-[#c9a227]/5 text-[#c9a227]/70 tracking-wide">2026</span>
          </div>
          <div class="p-8">
            <div class="w-14 h-14 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-trophy" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[#f5e6c0] mb-3">{{ $t('home.toolLiuyaoTitle') }}</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-8">
              {{ $t('home.toolLiuyaoDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              :to="localePath('/tools/liu-yao')"
              class="group/btn w-full justify-center"
            >
              {{ $t('home.toolLiuyaoCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>

      <!-- 使用提示 -->
      <div class="mt-16 text-center">
        <div class="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm text-[#e8e0d0]/40">
          <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[#c9a227]/60" />
          <i18n-t keypath="tools.guide" tag="span">
            <template #profileLink>
              <NuxtLink :to="localePath('/settings')" class="text-[#c9a227] hover:underline">{{ $t('tools.profileLink') }}</NuxtLink>
            </template>
          </i18n-t>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: t('seo.toolsTitle'),
  titleTemplate: '%s',
  description: t('seo.toolsDesc'),
  ogTitle: t('seo.toolsOgTitle'),
  ogDescription: t('seo.toolsOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools',
  twitterCard: 'summary_large_image',
})
</script>
