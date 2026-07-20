<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-16">
      <!-- Section 标题 -->
      <div class="text-center mb-14">
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">Insights</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('insights.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-md mx-auto">
          {{ $t('insights.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
      </div>

      <!-- 分类筛选 -->
      <div v-if="categories.length > 1" class="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          v-for="cat in categories"
          :key="cat"
          class="text-xs px-3.5 py-1.5 rounded-full border transition-all duration-300"
          :class="activeCategory === cat
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)] font-medium'
            : 'border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-faint)] hover:border-[var(--accent-border)] hover:text-[var(--text-muted)]'"
          @click="activeCategory = cat"
        >
          {{ cat === 'all' ? $t('insights.allCategories') : categoryLabel(cat) }}
        </button>
      </div>

      <!-- 加载中 -->
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="i in 4" :key="i" class="h-24 rounded-xl" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="!filteredArticles.length" class="text-center py-16">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] mb-5">
          <UIcon name="i-heroicons-book-open" class="w-8 h-8 text-[var(--accent-muted)]" />
        </div>
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-2">{{ $t('insights.emptyTitle') }}</h2>
        <p class="text-sm text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">{{ $t('insights.emptyDesc') }}</p>
      </div>

      <!-- 文章列表 -->
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="article in filteredArticles"
          :key="article.slug"
          :to="localePath(`/insights/${article.slug}`)"
          class="group block rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 transition-all duration-300 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-0.5"
        >
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span
              v-if="article.category"
              class="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent)]"
            >
              {{ categoryLabel(article.category) }}
            </span>
            <span v-if="article.publishedAt" class="text-[11px] text-[var(--text-faint)] flex items-center gap-1">
              <UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5" />
              {{ formatDate(article.publishedAt) }}
            </span>
            <span v-if="article.readingTime" class="text-[11px] text-[var(--text-faint)] flex items-center gap-1">
              <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
              {{ $t('insights.readingTime', { n: article.readingTime }) }}
            </span>
          </div>
          <h2 class="text-base font-semibold text-[var(--text-primary)] mb-1.5 group-hover:text-[var(--accent)] transition-colors duration-300">
            {{ article.title }}
          </h2>
          <p v-if="article.description" class="text-sm text-[var(--text-faint)] leading-relaxed line-clamp-2">
            {{ article.description }}
          </p>
          <div class="flex items-center justify-end mt-3">
            <span class="text-xs text-[var(--accent-muted)] inline-flex items-center gap-1 transition-transform duration-300 group-hover:translate-x-0.5">
              {{ $t('insights.readMore') }}
              <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface InsightListItem {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  author: string
  readingTime: number
}

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data, status } = await useAsyncData(
  () => `insights-list-${locale.value}`,
  () => $fetch<{ total: number; categories: string[]; articles: InsightListItem[] }>('/api/insights', {
    query: { lang: locale.value },
  }),
  { server: true, watch: [locale] }
)

const pending = computed(() => status.value === 'pending')

const activeCategory = ref('all')

const categories = computed(() => ['all', ...(data.value?.categories || [])])

const filteredArticles = computed(() => {
  const articles = data.value?.articles || []
  if (activeCategory.value === 'all') return articles
  return articles.filter(a => a.category === activeCategory.value)
})

function categoryLabel(cat: string): string {
  const key = `insights.categories.${cat}`
  const translated = t(key)
  return translated === key ? cat : translated
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const fmtLocale = locale.value === 'en' ? 'en-US' : locale.value
  return d.toLocaleDateString(fmtLocale, { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── SEO ──
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('insights.seoTitle')} - ${siteName}`,
  description: () => t('insights.seoDesc'),
  keywords: () => t('insights.seoKeywords'),
  ogTitle: () => `${t('insights.seoTitle')} - ${siteName}`,
  ogDescription: () => t('insights.seoDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/insights',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: 'https://www.ososn.com/insights' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: t('insights.title'),
        url: 'https://www.ososn.com/insights',
        description: t('insights.seoDesc'),
        publisher: {
          '@type': 'Organization',
          name: siteName,
          url: 'https://www.ososn.com',
        },
        blogPost: (data.value?.articles || []).map((a, i) => ({
          '@type': 'BlogPosting',
          position: i + 1,
          headline: a.title,
          description: a.description,
          datePublished: a.publishedAt,
          url: `https://www.ososn.com/insights/${a.slug}`,
        })),
      }),
    },
  ],
}))
</script>
