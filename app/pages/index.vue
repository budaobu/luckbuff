<template>
  <div>
    <OrganizationSchema />
    <FaqSchema />
    <!-- HERO -->
    <section class="home-hero">
      <div class="home-hero-background">
        <picture class="absolute inset-0 block">
          <source
            media="(max-width: 767px)"
            srcset="/hero-bg-mobile-1x-2026-08.webp"
            width="640"
            height="1138"
          >
          <img
            src="/hero-bg-2026-08.webp"
            width="1600"
            height="900"
            alt=""
            fetchpriority="high"
            decoding="async"
            class="hero-image absolute inset-0 h-full w-full object-cover"
          >
        </picture>
        <div class="home-hero-overlay" />
      </div>

      <!-- 玄学氛围动效 -->
      <MysticField />

      <div class="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[minmax(0, 1fr)_370px] lg:items-center lg:gap-12 lg:pb-24 lg:pt-28">
        <div class="hero-copy">
        <div
          data-hero-reveal="1"
          class="hero-badge"
        >
          <span class="hero-badge-dot" aria-hidden="true" />
          {{ $t('home.badge') }}
        </div>

        <h1 data-hero-reveal="2" class="hero-title font-serif">
          <span>{{ $t('home.title1') }}</span>
          <span class="hero-title-accent">{{ $t('home.title2') }}</span>
        </h1>

        <p data-hero-reveal="3" class="hero-subtitle">
          {{ $t('home.subtitle') }}
        </p>

        <div data-hero-reveal="4" class="hero-actions">
          <form class="hero-input-form" @submit.prevent="tryHumorHermit">
            <input
              v-model="heroText"
              type="text"
              class="hero-input"
              :placeholder="$t('home.heroPlaceholder')"
            />
            <button type="submit" class="hero-cta hero-cta-primary">
              <UIcon name="i-heroicons-sparkles" class="h-5 w-5" />
              {{ $t('home.heroTryBtn') }}
            </button>
          </form>
        </div>
        </div>
      <aside data-hero-reveal="5" class="hero-panel" aria-labelledby="hero-panel-title">
        <h2 id="hero-panel-title" class="hero-panel-title">
          {{ $t('home.toolsTitle') }}
        </h2>
        <div class="hero-panel-list">
          <NuxtLink
            v-for="entry in heroEntries"
            :key="entry.path"
            :to="localePath(entry.path)"
            class="hero-entry"
          >
            <span class="hero-entry-icon">
              <UIcon :name="entry.icon" class="h-4.5 w-4.5" />
            </span>
            <span class="min-w-0">
              <span class="hero-entry-title">{{ $t(entry.titleKey) }}</span>
              <span class="hero-entry-desc">{{ $t(entry.descKey) }}</span>
            </span>
            <UIcon name="i-heroicons-arrow-right" class="hero-entry-arrow h-4 w-4" />
          </NuxtLink>
        </div>
      </aside>
      </div>
    </section>

    <!-- ========== 跑马灯分隔带 ========== -->
    <div class="ticker relative border-y py-3 select-none" style="border-color: var(--border-light); background-color: var(--surface-elevated);" aria-hidden="true">
      <div class="ticker-track gap-0">
        <span v-for="n in 2" :key="n" class="flex items-center shrink-0">
          <span
            v-for="(item, i) in tickerItems"
            :key="i"
            class="flex items-center text-[11px] font-medium uppercase tracking-[0.18em]"
            style="color: var(--text-faint);"
          >
            <span class="px-5">{{ item }}</span>
            <span class="ticker-dot" />
          </span>
        </span>
      </div>
    </div>

    <!-- 新用户引导 Banner -->
    <section v-if="showGuideBanner" class="max-w-4xl mx-auto px-6 mt-10 relative z-10">
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

    <!-- WHY -->
    <section class="mx-auto w-full max-w-7xl px-6 py-20">
      <div v-reveal class="home-section-head">
        <h2 class="section-title font-serif">
          {{ $t('home.whyTitle') }}
        </h2>
      </div>

      <div v-reveal.stagger class="feature-grid">
        <article
          v-for="feature in featureItems"
          :key="feature.titleKey"
          data-reveal-child
          class="feature-item"
        >
          <div class="feature-icon">
            <UIcon :name="feature.icon" class="h-5 w-5" />
          </div>
          <h3 class="feature-title">
            {{ $t(feature.titleKey) }}
          </h3>
          <p class="feature-desc">
            {{ $t(feature.descKey) }}
          </p>
        </article>
      </div>
    </section>

    <!-- TOPICS -->
    <section class="mx-auto w-full max-w-7xl px-6 py-20">
      <div v-reveal class="home-section-head">
        <h2 class="section-title font-serif">
          {{ $t('home.toolsTitle') }}
        </h2>
      </div>

      <div v-reveal.stagger class="topic-grid">
        <NuxtLink
          v-if="featuredTopic"
          :key="featuredTopic.sectionPath"
          :to="localePath(featuredTopic.sectionPath)"
          data-reveal-child
          class="topic-card topic-card-featured"
        >
          <span class="topic-card-body">
            <div
              class="topic-icon topic-icon-featured"
              style="background-color: var(--accent-bg); border: 1px solid var(--accent-border); color: var(--accent);"
            >
              <UIcon :name="featuredTopic.icon" class="h-7 w-7" />
            </div>
            <h3 class="topic-title topic-title-featured">{{ $t(featuredTopic.titleKey) }}</h3>
            <p class="topic-desc topic-desc-featured">
              {{ $t(featuredTopic.subtitleKey) }}
            </p>
            <ul class="featured-tools">
              <li v-for="tool in featuredTopic.tools.slice(0, 3)" :key="tool.path">
                {{ $t(tool.titleKey) }}
              </li>
            </ul>
            <span class="topic-cta">
              {{ $t('home.topicCta') }}
              <UIcon name="i-heroicons-arrow-right" class="topic-cta-arrow h-4 w-4" />
            </span>
          </span>
        </NuxtLink>

        <NuxtLink
          v-for="topic in topicCards"
          :key="topic.sectionPath"
          :to="localePath(topic.sectionPath)"
          data-reveal-child
          class="topic-card"
        >
          <span class="topic-card-body">
            <div
              class="topic-icon"
              style="background-color: var(--accent-bg); border: 1px solid var(--accent-border); color: var(--accent);"
            >
              <UIcon :name="topic.icon" class="h-5.5 w-5.5" />
            </div>
            <h3 class="topic-title">{{ $t(topic.titleKey) }}</h3>
            <p class="topic-desc">{{ $t(topic.subtitleKey) }}</p>
            <span class="topic-cta">
              {{ $t('home.topicCta') }}
              <UIcon name="i-heroicons-arrow-right" class="topic-cta-arrow h-4 w-4" />
            </span>
          </span>
        </NuxtLink>

      </div>
    </section>

    <!-- YEAR -->
    <section v-if="liuNianData" class="mx-auto w-full max-w-7xl px-6 py-16">
      <div
        v-reveal
        class="year-panel"
        style="border-color: var(--accent-border); background-color: var(--accent-bg);"
      >
        <div class="year-icon"
          style="background-color: var(--accent-bg); border: 1px solid var(--accent-border); color: var(--accent);"
        >
          <UIcon name="i-heroicons-eye" class="w-6 h-6" />
        </div>
        <div class="year-content">
          <h3 class="year-title">{{ $t('home.liuNianTitle') }}</h3>
          <p class="year-desc">{{ $t('home.liuNianText', { name: liuNianData.name, year: liuNianData.year }) }}</p>
        </div>
        <NuxtLink :to="localePath('/tools/bazi')" class="topic-cta year-cta">
          {{ $t('home.liuNianCta') }}
          <UIcon name="i-heroicons-arrow-right" class="topic-cta-arrow h-4 w-4" />
        </NuxtLink>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mx-auto w-full max-w-5xl px-6 py-20">
      <div v-reveal class="home-section-head">
        <h2 class="section-title font-serif">
          {{ $t('home.faqTitle') }}
        </h2>
      </div>

      <div v-reveal.stagger class="faq-list">
        <article
          v-for="(item, index) in faqItems"
          :key="index"
          data-reveal-child
          class="faq-item"
        >
          <button
            :id="`faq-button-${index}`"
            class="faq-button"
            :aria-expanded="openFaqIndex === index"
            :aria-controls="`faq-answer-${index}`"
            @click="toggleFaq(index)"
          >
            <span class="faq-label">
              {{ item.label }}
            </span>
            <UIcon
              name="i-heroicons-chevron-down"
              class="h-4 w-4 shrink-0 transition-transform duration-200"
              style="color: var(--accent-muted);"
              :class="{ 'rotate-180': openFaqIndex === index }"
            />
          </button>
          <Transition
            enter-active-class="transition-[max-height,opacity] duration-[260ms] ease-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[500px] opacity-100"
            leave-active-class="transition-[max-height,opacity] duration-200 ease-out"
            leave-from-class="max-h-[500px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
                <div
                  v-show="openFaqIndex === index"
                  :id="`faq-answer-${index}`"
                  class="faq-answer overflow-hidden"
                >
                <p class="text-[15px] leading-relaxed" style="color: var(--text-muted);">
                  {{ item.content }}
                </p>
              </div>
          </Transition>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useProfilesStore } from '~/stores/profiles'

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const categories = useToolCategories()
const store = useProfilesStore()
const guideDismissed = ref(false)
const heroText = ref('')

function tryHumorHermit() {
  const text = heroText.value.trim()
  if (text.length < 4) return
  navigateTo({ path: localePath('/tools/humor-hermit'), query: { text } })
}
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

const topics = computed(() => categories.value)
const featuredTopic = computed(() => topics.value[0])
const topicCards = computed(() => topics.value.slice(1))

const heroEntries = [
  {
    icon: 'i-heroicons-calendar-days',
    titleKey: 'home.toolBaziTitle',
    descKey: 'home.toolBaziDesc',
    path: '/tools/bazi',
  },
  {
    icon: 'i-heroicons-circle-stack',
    titleKey: 'home.toolLiuyaoDivinationTitle',
    descKey: 'home.toolLiuyaoDivinationDesc',
    path: '/tools/liuyao-divination',
  },
  {
    icon: 'i-heroicons-calendar',
    titleKey: 'home.topicAuspiciousDatetimeTitle',
    descKey: 'home.topicAuspiciousDatetimeDesc',
    path: '/auspicious-datetime',
  },
]

const featureItems = [
  { icon: 'i-heroicons-cpu-chip', titleKey: 'home.feature1Title', descKey: 'home.feature1Desc' },
  { icon: 'i-heroicons-language', titleKey: 'home.feature2Title', descKey: 'home.feature2Desc' },
  { icon: 'i-heroicons-bolt', titleKey: 'home.feature3Title', descKey: 'home.feature3Desc' },
  { icon: 'i-heroicons-users', titleKey: 'home.feature4Title', descKey: 'home.feature4Desc' },
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

const tickerItems = computed<string[]>(() => {
  const raw = tm('home.tickerItems') as unknown
  return Array.isArray(raw) ? raw.map((item) => rt(item as never)) : []
})

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
  link: [
    {
      rel: 'preload',
      as: 'image',
      imagesrcset: '/hero-bg-mobile-1x-2026-08.webp',
      media: '(max-width: 767px)',
      fetchpriority: 'high',
    },
    {
      rel: 'preload',
      as: 'image',
      href: '/hero-bg-2026-08.webp',
      media: '(min-width: 768px)',
      fetchpriority: 'high',
    },
  ],
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

<style scoped>
.home-hero {
  position: relative;
  display: flex;
  min-height: max(700px, calc(100svh - 4rem));
  overflow: hidden;
  isolation: isolate;
}

.home-hero-background {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.hero-image {
  object-position: 72% 58%;
  filter: saturate(0.86) contrast(1.04);
}

.home-hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg,
      color-mix(in srgb, var(--surface-bg) 92%, transparent) 0%,
      color-mix(in srgb, var(--surface-bg) 82%, transparent) 34%,
      color-mix(in srgb, var(--surface-bg) 32%, transparent) 72%,
      transparent 100%),
    var(--hero-overlay);
}

.hero-copy {
  max-width: 680px;
  text-align: left;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-self: start;
  margin-bottom: 24px;
  padding: 7px 14px;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 12px;
  line-height: 1.4;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--accent);
}

.hero-title {
  margin-bottom: 22px;
  color: var(--text-primary);
  font-size: clamp(2.3rem, 5.1vw, 4.65rem);
  font-weight: 600;
  line-height: 1.1;
  text-wrap: balance;
}

.hero-title span,
.hero-title-accent {
  display: block;
}

.hero-title-accent {
  color: var(--accent);
}

.hero-subtitle {
  max-width: 36em;
  margin-bottom: 36px;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.7;
  text-wrap: pretty;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 50px;
  padding: 0 22px;
  border-radius: 14px;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 500;
  transition:
    transform 160ms cubic-bezier(0.23, 1, 0.32, 1),
    background-color 160ms cubic-bezier(0.23, 1, 0.32, 1),
    border-color 160ms cubic-bezier(0.23, 1, 0.32, 1),
    box-shadow 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.hero-cta-primary {
  border: 1px solid color-mix(in srgb, var(--accent) 78%, transparent);
  background: var(--accent);
  color: #17130c;
  box-shadow: 0 18px 42px -28px var(--accent-shadow-hover);
}

.hero-cta-secondary {
  border: 1px solid var(--border-strong);
  background: color-mix(in srgb, var(--surface-bg) 52%, transparent);
  color: var(--text-body);
}

.hero-input-form {
  display: flex;
  gap: 0.5rem;
  width: min(28rem, 100%);
}

.hero-input {
  flex: 1;
  min-width: 0;
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-strong);
  background: color-mix(in srgb, var(--surface-bg) 68%, transparent);
  color: var(--text-body);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.hero-input::placeholder {
  color: var(--text-placeholder);
}

.hero-input:focus {
  border-color: var(--accent-border-hover);
}

@media (hover: hover) and (pointer: fine) {
  .hero-cta:hover {
    transform: translateY(-2px);
  }

  .hero-cta-primary:hover {
    filter: brightness(1.06);
    box-shadow: 0 22px 48px -28px var(--accent-shadow-hover);
  }

  .hero-cta-secondary:hover {
    border-color: var(--accent-border);
    background: var(--surface-card-hover);
  }
}

.hero-cta:active {
  transform: scale(0.98);
}

.hero-panel {
  padding: 20px;
  border: 1px solid var(--border-medium);
  border-radius: 20px;
  background: color-mix(in srgb, var(--surface-bg) 74%, transparent);
  box-shadow: 0 28px 80px -52px rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(18px);
}

.hero-panel-title {
  margin-bottom: 14px;
  padding: 0 4px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.hero-panel-list {
  display: grid;
  gap: 6px;
}

.hero-entry {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 16px;
  align-items: start;
  gap: 12px;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 14px;
  transition:
    background-color 160ms cubic-bezier(0.23, 1, 0.32, 1),
    border-color 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.hero-entry-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--accent-border);
  border-radius: 12px;
  background: var(--accent-bg);
  color: var(--accent);
}

.hero-entry-title {
  display: block;
  margin-bottom: 4px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.hero-entry-desc {
  display: -webkit-box;
  overflow: hidden;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (hover: hover) and (pointer: fine) {
  .hero-entry:hover {
    border-color: var(--accent-border);
    background: var(--surface-card-hover);
  }

  .hero-entry:hover .hero-entry-arrow {
    transform: translateX(3px);
  }
}

.hero-entry-arrow {
  margin-top: 10px;
  color: var(--accent-muted);
  transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.home-section-head {
  max-width: 760px;
}

.section-title {
  color: var(--text-primary);
  font-size: clamp(1.6rem, 2.6vw, 2.35rem);
  font-weight: 600;
  line-height: 1.25;
  text-wrap: balance;
}

.feature-grid {
  display: grid;
  gap: 32px 56px;
  margin-top: 52px;
}

.feature-item {
  padding-top: 28px;
  border-top: 1px solid var(--border-light);
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  margin-bottom: 18px;
  border: 1px solid var(--accent-border);
  border-radius: 12px;
  background: var(--accent-bg);
  color: var(--accent);
}

.feature-title {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.45;
}

.feature-desc {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
  text-wrap: pretty;
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-flow: dense;
  gap: 14px;
  margin-top: 52px;
}

.topic-card {
  position: relative;
  display: flex;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--surface-card);
  transition:
    transform 200ms cubic-bezier(0.23, 1, 0.32, 1),
    border-color 200ms cubic-bezier(0.23, 1, 0.32, 1),
    background-color 200ms cubic-bezier(0.23, 1, 0.32, 1);
}

.topic-card-featured {
  grid-column: span 2;
  grid-row: span 2;
}

.topic-card-body {
  position: relative;
  z-index: 10;
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  padding: 24px;
}

.topic-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-bottom: 20px;
  border-radius: 13px;
}

.topic-icon-featured {
  width: 50px;
  height: 50px;
  margin-bottom: 24px;
}

.topic-title {
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.4;
}

.topic-title-featured {
  font-size: clamp(1.5rem, 2.2vw, 2.1rem);
}

.topic-desc {
  flex: 1;
  overflow: hidden;
  margin-bottom: 20px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.topic-desc-featured {
  max-width: 34em;
  margin-bottom: 28px;
  font-size: 15px;
  -webkit-line-clamp: 4;
}

.featured-tools {
  display: grid;
  gap: 10px;
  margin-bottom: 28px;
}

.featured-tools li {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: color-mix(in srgb, var(--surface-bg) 48%, transparent);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.topic-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  align-self: start;
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
}

.topic-cta-arrow {
  transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

@media (hover: hover) and (pointer: fine) {
  .topic-card:hover {
    border-color: var(--accent-border-hover);
    background: var(--surface-card-hover);
    transform: translateY(-3px);
  }

  .topic-card:hover .topic-cta-arrow {
    transform: translateX(3px);
  }
}

.topic-card:active {
  transform: scale(0.995);
}

.year-panel {
  display: grid;
  gap: 20px;
  padding: 28px;
  border-radius: 20px;
}

.year-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
}

.year-title {
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.year-desc {
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.65;
  text-wrap: pretty;
}

.year-cta {
  align-self: start;
}

.faq-list {
  overflow: hidden;
  margin-top: 44px;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--surface-card);
}

.faq-item {
  border-bottom: 1px solid var(--border-light);
}

.faq-item:last-child {
  border-bottom: 0;
}

.faq-button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16px;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 22px 24px;
  text-align: left;
  transition: background-color 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.faq-label {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.55;
}

.faq-answer {
  padding: 0 24px 24px;
}

@media (hover: hover) and (pointer: fine) {
  .faq-button:hover {
    background: var(--surface-card-hover);
  }
}

.hero-cta:focus-visible,
.hero-entry:focus-visible,
.topic-card:focus-visible,
.year-cta:focus-visible,
.faq-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.ticker-dot {
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: var(--accent-muted);
}

@media (min-width: 768px) {
  .hero-subtitle {
    font-size: 17px;
  }

  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .topic-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .hero-panel {
    max-width: 370px;
    justify-self: end;
  }

  .year-panel {
    grid-template-columns: 48px minmax(0, 1fr) auto;
    align-items: center;
    padding: 32px;
  }
}

@media (max-width: 767px) {
  .home-hero {
    min-height: calc(100svh - 4rem);
  }

  .hero-image {
    object-position: 48% 62%;
  }

  .home-hero-overlay {
    background:
      linear-gradient(180deg,
        color-mix(in srgb, var(--surface-bg) 62%, transparent) 0%,
        color-mix(in srgb, var(--surface-bg) 78%, transparent) 48%,
        color-mix(in srgb, var(--surface-bg) 98%, transparent) 100%),
      var(--hero-overlay);
  }

  .hero-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .hero-panel {
    width: 100%;
  }

  .topic-grid {
    grid-template-columns: 1fr;
  }

  .topic-card-featured {
    grid-column: auto;
    grid-row: auto;
  }

  .topic-card-body {
    padding: 22px;
  }

  .year-panel {
    padding: 24px;
  }
}
</style>
