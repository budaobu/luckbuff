<template>
  <div>
    <OrganizationSchema />
    <FaqSchema />
    <!-- ========== HERO ========== -->
    <section class="relative min-h-[92vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <!-- 氛围背景光晕 -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#c9a227]/[0.07] blur-[120px]" />
        <div class="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/[0.05] blur-[100px]" />
        <div class="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-[#c9a227]/[0.04] blur-[80px]" />
      </div>

      <!-- 星点装饰 -->
      <ClientOnly>
        <div class="absolute inset-0 pointer-events-none opacity-40">
          <div
            v-for="(star, i) in stars"
            :key="i"
            class="absolute rounded-full bg-[#f5e6c0]"
            :class="star.size"
            :style="{ top: star.top, left: star.left, animationDelay: star.delay }"
          />
        </div>
      </ClientOnly>

      <!-- 内容 -->
      <div class="relative z-10 max-w-3xl mx-auto">
        <div class="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c9a227]/20 bg-[#c9a227]/5 text-[#c9a227] text-xs tracking-widest uppercase">
          <span class="w-1.5 h-1.5 rounded-full bg-[#c9a227] animate-pulse" />
          {{ $t('home.badge') }}
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#f5e6c0] leading-[1.15] tracking-tight mb-6">
          {{ $t('home.title1') }}<br>
          <span class="text-[#c9a227]">{{ $t('home.title2') }}</span>
        </h1>

        <p class="text-base md:text-lg text-[#e8e0d0]/60 max-w-xl mx-auto mb-10 leading-relaxed">
          {{ $t('home.subtitle') }}
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <UButton
            size="lg"
            color="warning"
            variant="solid"
            :to="localePath('/tools')"
            class="px-8 py-3 text-base font-medium shadow-lg shadow-[#c9a227]/20 hover:shadow-[#c9a227]/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <template #leading>
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </template>
            {{ $t('common.start') }}
          </UButton>
          <UButton
            size="lg"
            color="neutral"
            variant="ghost"
            :to="localePath('/settings')"
            class="text-[#e8e0d0] hover:text-white border border-white/15 hover:border-white/30 hover:bg-white/[0.06]"
          >
            {{ $t('common.saveProfile') }}
          </UButton>
        </div>
      </div>

    </section>

    <!-- 新用户引导 Banner -->
    <section v-if="showGuideBanner" class="max-w-4xl mx-auto px-6 -mt-12 mb-20 relative z-10">
      <div class="relative rounded-2xl border border-[#c9a227]/20 bg-[#c9a227]/[0.03] backdrop-blur-sm p-5 flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#c9a227]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[#c9a227]" />
          </div>
          <div>
            <p class="text-sm text-[#f5e6c0]/90 leading-relaxed">
              <i18n-t keypath="home.guideBanner" tag="span">
                <template #saveLink>
                  <NuxtLink :to="localePath('/settings')" class="text-[#c9a227] hover:underline font-medium">{{ $t('home.saveLink') }}</NuxtLink>
                </template>
              </i18n-t>
            </p>
          </div>
        </div>
        <UButton color="neutral" variant="ghost" size="xs" icon="i-heroicons-x-mark" class="flex-shrink-0 text-[#e8e0d0]/40 hover:text-[#e8e0d0]" @click="dismissGuide" />
      </div>
    </section>

    <!-- ========== 为什么选择 ========== -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-3 block">Why ososn</span>
        <h2 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
          {{ $t('home.whyTitle') }}
        </h2>
        <div class="w-12 h-px bg-[#c9a227]/30 mx-auto mt-4" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlowCard :title="$t('home.feature1Title')" icon="i-heroicons-cpu-chip">
          {{ $t('home.feature1Desc') }}
        </GlowCard>
        <GlowCard :title="$t('home.feature2Title')" icon="i-heroicons-language">
          {{ $t('home.feature2Desc') }}
        </GlowCard>
        <GlowCard :title="$t('home.feature3Title')" icon="i-heroicons-bolt">
          {{ $t('home.feature3Desc') }}
        </GlowCard>
        <GlowCard :title="$t('home.feature4Title')" icon="i-heroicons-users">
          {{ $t('home.feature4Desc') }}
        </GlowCard>
      </div>
    </section>

    <!-- 分隔装饰 -->
    <div class="max-w-4xl mx-auto px-6">
      <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>

    <!-- ========== 推演工具 ========== -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-3 block">{{ $t('home.toolsSubtitle') }}</span>
        <h2 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
          {{ $t('home.toolsTitle') }}
        </h2>
        <div class="w-12 h-px bg-[#c9a227]/30 mx-auto mt-4" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 四柱八字 -->
        <div class="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[#c9a227]/30 hover:bg-white/[0.04] hover:-translate-y-1">
          <div class="p-7">
            <div class="w-12 h-12 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-5 transition-transform duration-500 group-hover:scale-110">
              <UIcon name="i-heroicons-calendar-days" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold text-[#f5e6c0] mb-2">{{ $t('home.toolBaziTitle') }}</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-6">
              {{ $t('home.toolBaziDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/bazi')"
              class="group/btn"
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
          <div class="p-7">
            <div class="w-12 h-12 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-5 transition-transform duration-500 group-hover:scale-110">
              <UIcon name="i-heroicons-swatch" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold text-[#f5e6c0] mb-2">{{ $t('home.toolZhouyiTitle') }}</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-6">
              {{ $t('home.toolZhouyiDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/zhouyi')"
              class="group/btn"
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
          <div class="p-7">
            <div class="w-12 h-12 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-5 transition-transform duration-500 group-hover:scale-110">
              <UIcon name="i-heroicons-star" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold text-[#f5e6c0] mb-2">{{ $t('home.toolZwdsTitle') }}</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-6">
              {{ $t('home.toolZwdsDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/zwds')"
              class="group/btn"
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
          <div class="p-7">
            <div class="w-12 h-12 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-5 transition-transform duration-500 group-hover:scale-110">
              <UIcon name="i-heroicons-trophy" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold text-[#f5e6c0] mb-2">{{ $t('home.toolLiuyaoTitle') }}</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-6">
              {{ $t('home.toolLiuyaoDesc') }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath('/tools/liu-yao')"
              class="group/btn"
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
    </section>

    <!-- 分隔装饰 -->
    <div class="max-w-4xl mx-auto px-6">
      <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>

    <!-- ========== 流年速览 ========== -->
    <section v-if="liuNianData" class="max-w-4xl mx-auto px-6 py-20">
      <div class="relative rounded-2xl border border-[#c9a227]/20 bg-[#c9a227]/[0.03] backdrop-blur-sm p-8 md:p-10 text-center">
        <div class="w-12 h-12 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mx-auto mb-5">
          <UIcon name="i-heroicons-eye" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-semibold text-[#f5e6c0] mb-3">{{ $t('home.liuNianTitle') }}</h3>
        <p class="text-base text-[#e8e0d0]/70 mb-6">{{ $t('home.liuNianText', { name: liuNianData.name, year: liuNianData.year }) }}</p>
        <UButton color="warning" variant="soft" size="sm" :to="localePath('/tools/bazi')">
          {{ $t('home.liuNianCta') }}
          <template #trailing>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </template>
        </UButton>
      </div>
    </section>

    <!-- ========== FAQ ========== -->
    <section class="max-w-3xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-3 block">{{ $t('home.faqSubtitle') }}</span>
        <h2 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
          {{ $t('home.faqTitle') }}
        </h2>
        <div class="w-12 h-px bg-[#c9a227]/30 mx-auto mt-4" />
      </div>

      <div class="space-y-3">
        <div
          v-for="(item, index) in faqItems"
          :key="index"
          class="group rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-[#c9a227]/20 hover:bg-white/[0.04]"
        >
          <button
            class="w-full flex items-center gap-4 px-6 py-5 text-left"
            @click="toggleFaq(index)"
          >
            <div
              class="flex-shrink-0 w-7 h-7 rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 flex items-center justify-center text-xs font-medium text-[#c9a227] transition-colors group-hover:border-[#c9a227]/50 group-hover:bg-[#c9a227]/20"
            >
              {{ index + 1 }}
            </div>
            <span class="flex-1 text-sm font-medium text-[#f5e6c0]/80 group-hover:text-[#f5e6c0] transition-colors">
              {{ item.label }}
            </span>
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-4 h-4 text-[#c9a227]/50 transition-transform duration-300 flex-shrink-0"
              :class="{ 'rotate-180': openFaqIndex === index }"
            />
          </button>
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[500px] opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="max-h-[500px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-show="openFaqIndex === index" class="overflow-hidden">
              <div class="px-6 pb-5 pl-[58px]">
                <p class="text-sm text-[#e8e0d0]/60 leading-relaxed">
                  {{ item.content }}
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useProfilesStore } from '~/stores/profiles'

const { t } = useI18n()
const localePath = useLocalePath()
const store = useProfilesStore()
const guideDismissed = ref(false)
const openFaqIndex = ref<number | null>(null)

function toggleFaq(index: number) {
  openFaqIndex.value = openFaqIndex.value === index ? null : index
}

const showGuideBanner = computed(() => {
  return store.list.length === 0 && !guideDismissed.value
})

function dismissGuide() {
  guideDismissed.value = true
  if (process.client) {
    localStorage.setItem('luckbuff-guide-dismissed', 'true')
  }
}

onMounted(() => {
  if (process.client) {
    guideDismissed.value = localStorage.getItem('luckbuff-guide-dismissed') === 'true'
  }
})

const liuNianData = computed(() => {
  const dp = store.defaultProfile
  if (!dp || !dp.birthDate) return null
  return {
    name: dp.name || dp.label,
    year: new Date().getFullYear(),
  }
})

// 确定性星点生成（避免 SSR hydration mismatch）
// 使用固定 seed 确保 SSR 和客户端生成相同的随机序列
const stars = Array.from({ length: 20 }, (_, i) => {
  const s = (n: number) => {
    const x = Math.sin(n * 9999) * 10000
    return x - Math.floor(x)
  }
  return {
    size: ['w-0.5 h-0.5', 'w-1 h-1', 'w-1.5 h-1.5'][Math.floor(s(i) * 3)],
    top: `${s(i + 100) * 100}%`,
    left: `${s(i + 200) * 100}%`,
    delay: `${s(i + 300) * 3}s`,
  }
})

const faqItems = computed(() => [
  { label: t('home.faq1Q'), content: t('home.faq1A') },
  { label: t('home.faq2Q'), content: t('home.faq2A') },
  { label: t('home.faq3Q'), content: t('home.faq3A') },
  { label: t('home.faq4Q'), content: t('home.faq4A') },
  { label: t('home.faq5Q'), content: t('home.faq5A') },
  { label: t('home.faq6Q'), content: t('home.faq6A') },
  { label: t('home.faq7Q'), content: t('home.faq7A') },
])

useSeoMeta({
  title: t('seo.homeTitle'),
  titleTemplate: '%s',
  description: t('seo.homeDesc'),
  ogTitle: t('seo.homeOgTitle'),
  ogDescription: t('seo.homeOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com',
  twitterCard: 'summary_large_image',
  twitterTitle: t('seo.homeTwitterTitle'),
  twitterDescription: t('seo.homeTwitterDesc'),
  twitterImage: 'https://www.ososn.com/og-image.png',
})
</script>
