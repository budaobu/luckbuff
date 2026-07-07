<template>
  <div>
    <OrganizationSchema />
    <FaqSchema />
    <!-- ========== HERO ========== -->
    <section class="relative min-h-[92vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <!-- 氛围背景光晕 -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          class="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px]"
          style="background-color: var(--accent-faint);"
        />
        <div
          class="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[100px]"
          style="background-color: var(--accent-purple-faint);"
        />
        <div
          class="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full blur-[80px]"
          style="background-color: var(--accent-faint);"
        />
      </div>

      <!-- 玄学氛围动效 -->
      <MysticField />

      <!-- 内容 -->
      <div class="relative z-10 max-w-3xl mx-auto">
        <div
          class="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs tracking-widest uppercase"
          style="border-color: var(--accent-border); background-color: var(--accent-bg); color: var(--accent);"
        >
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: var(--accent);" />
          {{ $t('home.badge') }}
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] tracking-tight mb-6 font-serif" style="color: var(--text-primary);">
          {{ $t('home.title1') }}<br>
          <span style="color: var(--accent);">{{ $t('home.title2') }}</span>
        </h1>

        <p class="text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed" style="color: var(--text-faint);">
          {{ $t('home.subtitle') }}
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <UButton
            size="lg"
            color="warning"
            variant="solid"
            :to="localePath('/tools')"
            class="px-8 py-3 text-base font-medium transition-all duration-300 hover:-translate-y-0.5"
            style="box-shadow: 0 4px 20px var(--accent-shadow);"
            :ui="{ base: 'hover:shadow-lg' }"
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
            class="transition-all duration-200 border"
            style="color: var(--text-body); border-color: var(--border-strong);"
            :ui="{ base: 'hover:!bg-[var(--surface-card-hover)] hover:!border-[var(--border-medium)]' }"
          >
            {{ $t('common.saveProfile') }}
          </UButton>
        </div>
      </div>

    </section>

    <!-- 新用户引导 Banner -->
    <section v-if="showGuideBanner" class="max-w-4xl mx-auto px-6 -mt-12 mb-20 relative z-10">
      <div
        class="relative rounded-2xl border backdrop-blur-sm p-5 flex items-start justify-between gap-4"
        style="border-color: var(--accent-border); background-color: var(--accent-bg);"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style="background-color: var(--accent-bg);"
          >
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4" style="color: var(--accent);" />
          </div>
          <div>
            <p class="text-sm leading-relaxed" style="color: var(--text-primary);">
              <i18n-t keypath="home.guideBanner" tag="span">
                <template #saveLink>
                  <NuxtLink :to="localePath('/settings')" class="hover:underline font-medium" style="color: var(--accent);">{{ $t('home.saveLink') }}</NuxtLink>
                </template>
              </i18n-t>
            </p>
          </div>
        </div>
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-heroicons-x-mark"
          :aria-label="$t('common.close')"
          class="flex-shrink-0 transition-colors"
          style="color: var(--text-faint);"
          :ui="{ base: 'hover:!text-[var(--text-body)]' }"
          @click="dismissGuide"
        />
      </div>
    </section>

    <!-- ========== 为什么选择 ========== -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <span class="text-xs tracking-[0.2em] uppercase mb-3 block" style="color: var(--accent-muted);">Why ososn</span>
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight font-serif" style="color: var(--text-primary);">
          {{ $t('home.whyTitle') }}
        </h2>
        <div class="w-12 h-px mx-auto mt-4" style="background-color: var(--accent-faint);" />
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
      <div class="h-px bg-gradient-to-r from-transparent to-transparent" style="--tw-gradient-stops: transparent, var(--gradient-divider), transparent;" />
    </div>

    <!-- ========== 推演工具 ========== -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <span class="text-xs tracking-[0.2em] uppercase mb-3 block" style="color: var(--accent-muted);">{{ $t('home.toolsSubtitle') }}</span>
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight font-serif" style="color: var(--text-primary);">
          {{ $t('home.toolsTitle') }}
        </h2>
        <div class="w-12 h-px mx-auto mt-4" style="background-color: var(--accent-faint);" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="topic in topics"
          :key="topic.path"
          class="group arc-card relative rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-500 hover:-translate-y-1 flex flex-col"
          style="border-color: var(--border-subtle); background-color: var(--surface-card);"
          :class="{ 'hover:!border-[var(--accent-border)] hover:!bg-[var(--surface-card-hover)]': true }"
        >
          <div class="p-7 flex flex-col flex-1">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110"
              style="background-color: var(--accent-bg); border: 1px solid var(--accent-border); color: var(--accent);"
            >
              <UIcon :name="topic.icon" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold mb-2" style="color: var(--text-primary);">{{ $t(topic.titleKey) }}</h3>
            <p class="text-sm leading-relaxed flex-1 line-clamp-4 overflow-hidden" style="color: var(--text-faint);">
              {{ $t(topic.descKey) }}
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              :to="localePath(topic.path)"
              class="group/btn mt-4"
            >
              {{ $t('home.topicCta') }}
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div
            class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style="--tw-gradient-stops: transparent, var(--accent-muted), transparent;"
          />
        </div>
      </div>
    </section>

    <!-- 分隔装饰 -->
    <div class="max-w-4xl mx-auto px-6">
      <div class="h-px bg-gradient-to-r from-transparent to-transparent" style="--tw-gradient-stops: transparent, var(--gradient-divider), transparent;" />
    </div>

    <!-- ========== 流年速览 ========== -->
    <section v-if="liuNianData" class="max-w-4xl mx-auto px-6 py-20">
      <div
        class="relative rounded-2xl border backdrop-blur-sm p-8 md:p-10 text-center"
        style="border-color: var(--accent-border); background-color: var(--accent-bg);"
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
          style="background-color: var(--accent-bg); border: 1px solid var(--accent-border); color: var(--accent);"
        >
          <UIcon name="i-heroicons-eye" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-semibold mb-3" style="color: var(--text-primary);">{{ $t('home.liuNianTitle') }}</h3>
        <p class="text-base mb-6" style="color: var(--text-muted);">{{ $t('home.liuNianText', { name: liuNianData.name, year: liuNianData.year }) }}</p>
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
        <span class="text-xs tracking-[0.2em] uppercase mb-3 block" style="color: var(--accent-muted);">{{ $t('home.faqSubtitle') }}</span>
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight font-serif" style="color: var(--text-primary);">
          {{ $t('home.faqTitle') }}
        </h2>
        <div class="w-12 h-px mx-auto mt-4" style="background-color: var(--accent-faint);" />
      </div>

      <div class="space-y-3">
        <div
          v-for="(item, index) in faqItems"
          :key="index"
          class="group rounded-xl border backdrop-blur-sm overflow-hidden transition-all duration-300"
          style="border-color: var(--border-subtle); background-color: var(--surface-card);"
          :class="{ 'hover:!border-[var(--accent-border)] hover:!bg-[var(--surface-card-hover)]': true }"
        >
          <button
            class="w-full flex items-center gap-4 px-6 py-5 text-left"
            @click="toggleFaq(index)"
          >
            <div
              class="flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-medium transition-colors"
              style="border-color: var(--accent-border); background-color: var(--accent-bg); color: var(--accent);"
              :class="{ 'group-hover:!border-[var(--accent-border-hover)] group-hover:!bg-[var(--accent-bg-hover)]': true }"
            >
              {{ index + 1 }}
            </div>
            <span class="flex-1 text-sm font-medium transition-colors" style="color: var(--text-primary);"
              :class="{ 'group-hover:!text-[var(--text-primary)]': true }"
            >
              {{ item.label }}
            </span>
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-4 h-4 transition-transform duration-300 flex-shrink-0"
              style="color: var(--accent-muted);"
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
                <p class="text-sm leading-relaxed" style="color: var(--text-faint);">
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

const topics = [
  {
    icon: 'i-heroicons-sparkles',
    titleKey: 'home.topicFortuneTellingTitle',
    descKey: 'home.topicFortuneTellingDesc',
    path: '/fortune-telling',
  },
  {
    icon: 'i-heroicons-heart',
    titleKey: 'home.topicDoubleChartTitle',
    descKey: 'home.topicDoubleChartDesc',
    path: '/shuangren-hepan',
  },
  {
    icon: 'i-heroicons-calendar',
    titleKey: 'home.topicAuspiciousDatetimeTitle',
    descKey: 'home.topicAuspiciousDatetimeDesc',
    path: '/auspicious-datetime',
  },
  {
    icon: 'i-heroicons-magnifying-glass',
    titleKey: 'home.topicSeekingTitle',
    descKey: 'home.topicSeekingDesc',
    path: '/seeking',
  },
  {
    icon: 'i-heroicons-pencil-square',
    titleKey: 'home.topicNamingTitle',
    descKey: 'home.topicNamingDesc',
    path: '/naming',
  },
  {
    icon: 'i-heroicons-pencil',
    titleKey: 'home.topicCeziTitle',
    descKey: 'home.topicCeziDesc',
    path: '/cezi',
  },
  {
    icon: 'i-heroicons-gift-top',
    titleKey: 'home.topicDrawALotTitle',
    descKey: 'home.topicDrawALotDesc',
    path: '/draw-a-lot',
  },
  {
    icon: 'i-heroicons-beaker',
    titleKey: 'home.topicPsychologicalTestTitle',
    descKey: 'home.topicPsychologicalTestDesc',
    path: '/psychological-test',
  },
]

const faqItems = computed(() => [
  { label: t('home.faq1Q'), content: t('home.faq1A') },
  { label: t('home.faq2Q'), content: t('home.faq2A') },
  { label: t('home.faq3Q'), content: t('home.faq3A') },
  { label: t('home.faq4Q'), content: t('home.faq4A') },
  { label: t('home.faq5Q'), content: t('home.faq5A') },
  { label: t('home.faq6Q'), content: t('home.faq6A') },
  { label: t('home.faq7Q'), content: t('home.faq7A') },
])

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.homeTitle')} - ${siteName}`,
  description: t('seo.homeDesc'),
  keywords: t('seo.homeKeywords'),
  ogTitle: () => `${t('seo.homeOgTitle')} - ${siteName}`,
  ogDescription: t('seo.homeOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com',
  twitterCard: 'summary_large_image',
  twitterTitle: () => `${t('seo.homeTwitterTitle')} - ${siteName}`,
  twitterDescription: t('seo.homeTwitterDesc'),
  twitterImage: 'https://www.ososn.com/og-image.png',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: `${t('seo.homeTitle')} - ${siteName}`,
        url: 'https://www.ososn.com',
        description: t('seo.homeDesc'),
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.ososn.com/tools',
          'query-input': 'required name=search_term_string',
        },
      }),
    },
  ],
}))
</script>
