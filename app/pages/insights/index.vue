<template>
  <div class="relative overflow-hidden">
    <div class="insights-ambient" aria-hidden="true" />

    <main class="relative z-10 mx-auto w-full max-w-7xl px-6 py-14 md:py-20">
      <header v-reveal class="insights-hero">
        <div class="insights-hero-copy">
          <p class="insights-eyebrow">Insights</p>
          <h1 class="insights-title font-serif">
            {{ $t('insights.title') }}
          </h1>
          <p class="insights-subtitle">
            {{ $t('insights.subtitle') }}
          </p>
        </div>

        <dl v-if="data" class="insights-metrics">
          <div>
            <dd>{{ data.total }}</dd>
            <dt>{{ $t('insights.articlesLabel') }}</dt>
          </div>
          <i aria-hidden="true" />
          <div>
            <dd>{{ Math.max(0, categories.length - 1) }}</dd>
            <dt>{{ $t('insights.categoriesLabel') }}</dt>
          </div>
        </dl>
      </header>

      <!-- 分类筛选 -->
      <nav
        v-if="categories.length > 1"
        class="insights-filter"
        :aria-label="$t('insights.allCategories')"
      >
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="filter-chip"
          :class="{ active: activeCategory === cat }"
          :aria-pressed="activeCategory === cat"
          @click="activeCategory = cat"
        >
          {{ cat === 'all' ? $t('insights.allCategories') : categoryLabel(cat) }}
        </button>
      </nav>

      <!-- 加载中 -->
      <div v-if="pending" class="insight-list" aria-busy="true">
        <div v-for="i in 4" :key="i" class="insight-skeleton">
          <span class="skeleton-line h-3 w-32 animate-pulse rounded-full" />
          <span class="skeleton-line mt-5 h-6 w-3/4 animate-pulse rounded-full" />
          <span class="skeleton-line mt-4 h-4 w-full animate-pulse rounded-full" />
          <span class="skeleton-line mt-2 h-4 w-2/3 animate-pulse rounded-full" />
        </div>
      </div>

      <!-- 空状态 -->
      <section v-else-if="!filteredArticles.length" class="insights-empty">
        <span class="insights-empty-icon">
          <UIcon name="i-heroicons-book-open" class="h-7 w-7" />
        </span>
        <h2>{{ $t('insights.emptyTitle') }}</h2>
        <p>{{ $t('insights.emptyDesc') }}</p>
      </section>

      <!-- 文章列表 -->
      <template v-else>
        <div v-reveal.stagger class="insight-list">
          <NuxtLink
            v-for="(article, index) in pagedArticles"
            :key="article.slug"
            :to="localePath(`/insights/${article.slug}`)"
            data-reveal-child
            class="insight-row group"
          >
            <div class="insight-main">
              <div class="insight-meta">
                <span v-if="article.category" class="insight-category">
                  {{ categoryLabel(article.category) }}
                </span>
                <span v-if="article.publishedAt" class="insight-date">
                  <UIcon name="i-heroicons-calendar-days" class="h-3.5 w-3.5" />
                  {{ formatDate(article.publishedAt) }}
                </span>
                <span v-if="article.readingTime" class="insight-date">
                  <UIcon name="i-heroicons-clock" class="h-3.5 w-3.5" />
                  {{ $t('insights.readingTime', { n: article.readingTime }) }}
                </span>
              </div>
              <h2>{{ article.title }}</h2>
              <p v-if="article.description">{{ article.description }}</p>
            </div>

            <div class="insight-aside">
              <span class="insight-index font-mono">
                {{ String((currentPage - 1) * PAGE_SIZE + index + 1).padStart(2, '0') }}
              </span>
              <span class="insight-cta">
                {{ $t('insights.readMore') }}
                <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </div>
          </NuxtLink>
        </div>

        <!-- 分页（前一页 / 后一页） -->
        <nav v-if="totalPages > 1" class="insights-pagination" aria-label="Pagination">
          <button
            type="button"
            :disabled="currentPage <= 1"
            :aria-label="$t('insights.prevPage')"
            class="pagination-button"
            @click="currentPage--"
          >
            <UIcon name="i-heroicons-chevron-left" class="h-5 w-5" />
          </button>

          <span class="pagination-status font-mono">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            type="button"
            :disabled="currentPage >= totalPages"
            :aria-label="$t('insights.nextPage')"
            class="pagination-button"
            @click="currentPage++"
          >
            <UIcon name="i-heroicons-chevron-right" class="h-5 w-5" />
          </button>
        </nav>
      </template>
    </main>
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

const PAGE_SIZE = 10
const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredArticles.value.length / PAGE_SIZE)))

const pagedArticles = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredArticles.value.slice(start, start + PAGE_SIZE)
})

// 切换分类时回到第一页
watch(activeCategory, () => { currentPage.value = 1 })

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
const siteName = useRuntimeConfig().public.siteName
const siteUrl = 'https://www.ososn.com'
const pageUrl = useLocalizedSeoUrl('/insights')

useSeoMeta({
  title: () => `${t('insights.seoTitle')} - ${siteName}`,
  description: () => t('insights.seoDesc'),
  keywords: () => t('insights.seoKeywords'),
  ogTitle: () => `${t('insights.seoTitle')} - ${siteName}`,
  ogDescription: () => t('insights.seoDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: t('insights.title'),
        url: pageUrl.value,
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
          url: `${siteUrl}${localePath(`/insights/${a.slug}`)}`,
        })),
      }),
    },
  ],
}))
</script>

<style scoped>
.insights-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(56rem 30rem at 10% 0%, color-mix(in srgb, var(--accent) 7%, transparent), transparent 64%),
    linear-gradient(90deg, color-mix(in srgb, var(--border-light) 38%, transparent) 1px, transparent 1px);
  background-size: auto, 78px 100%;
  mask-image: linear-gradient(180deg, black, transparent 78%);
}

.insights-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 40px;
  max-width: 900px;
  margin-bottom: 34px;
}

.insights-eyebrow {
  margin-bottom: 12px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.insights-title {
  margin-bottom: 14px;
  color: var(--text-primary);
  font-size: clamp(2.2rem, 4.2vw, 3.5rem);
  font-weight: 600;
  line-height: 1.1;
  text-wrap: balance;
}

.insights-subtitle {
  max-width: 42em;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.7;
  text-wrap: pretty;
}

.insights-metrics {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 0;
}

.insights-metrics div {
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;
}

.insights-metrics dd {
  margin: 0;
  color: var(--text-primary);
  font-size: 30px;
  font-weight: 600;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.insights-metrics dt {
  color: var(--text-faint);
  font-size: 12px;
}

.insights-metrics i {
  width: 1px;
  height: 34px;
  background: var(--border-strong);
}

.insights-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 22px 0;
  margin-bottom: 18px;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}

.filter-chip {
  padding: 8px 13px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1;
  transition: background-color 160ms var(--ease-out-expo), border-color 160ms var(--ease-out-expo), color 160ms var(--ease-out-expo);
}

.filter-chip.active {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 600;
}

@media (hover: hover) and (pointer: fine) {
  .filter-chip:hover {
    border-color: var(--accent-border);
    color: var(--text-primary);
  }
}

.filter-chip:focus-visible,
.pagination-button:focus-visible,
.insight-row:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.insight-list {
  display: grid;
  gap: 12px;
}

.insight-row,
.insight-skeleton {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 130px;
  gap: 26px;
  align-items: center;
  min-height: 154px;
  padding: 24px 28px;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--surface-card);
  box-shadow: var(--shadow-panel);
  content-visibility: auto;
  contain-intrinsic-size: auto 154px;
}

.skeleton-line {
  display: block;
  background: var(--surface-card-hover);
}

.insight-row {
  transition: transform 200ms var(--ease-out-expo), border-color 200ms var(--ease-out-expo), background-color 200ms var(--ease-out-expo), box-shadow 200ms var(--ease-out-expo);
}

@media (hover: hover) and (pointer: fine) {
  .insight-row:hover {
    border-color: var(--accent-border);
    background: var(--surface-card-hover);
    box-shadow: var(--shadow-panel-hover);
    transform: translateY(-3px);
  }
}

.insight-row:active {
  transform: scale(0.995);
}

.insight-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.insight-category {
  padding: 5px 9px;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
}

.insight-date {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-faint);
  font-size: 12px;
}

.insight-main h2 {
  margin-bottom: 9px;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  text-wrap: balance;
  transition: color 160ms var(--ease-out-expo);
}

.insight-row:hover h2 {
  color: var(--accent);
}

.insight-main p {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
  text-wrap: pretty;
}

.insight-aside {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.insight-index {
  color: var(--accent-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.insight-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
}

.insights-empty {
  max-width: 560px;
  padding: 44px;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  background: var(--surface-card);
  box-shadow: var(--shadow-panel);
}

.insights-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 18px;
  border: 1px solid var(--accent-border);
  border-radius: 16px;
  background: var(--accent-bg);
  color: var(--accent);
}

.insights-empty h2 {
  margin-bottom: 9px;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 600;
}

.insights-empty p {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.insights-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 28px;
}

.pagination-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--surface-card);
  color: var(--text-muted);
  transition: border-color 160ms var(--ease-out-expo), background-color 160ms var(--ease-out-expo), color 160ms var(--ease-out-expo), transform 160ms var(--ease-out-expo);
}

.pagination-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}

.pagination-button:not(:disabled):active {
  transform: scale(0.97);
}

.pagination-status {
  color: var(--text-faint);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 767px) {
  .insights-hero {
    grid-template-columns: 1fr;
    align-items: start;
    gap: 26px;
    margin-bottom: 28px;
  }

  .insights-metrics {
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-light);
  }

  .insight-row,
  .insight-skeleton {
    grid-template-columns: 1fr;
    align-items: start;
    min-height: 0;
    padding: 22px;
  }

  .insight-aside {
    width: 100%;
    justify-content: space-between;
    padding: 16px 0 0;
    border-top: 1px solid var(--border-light);
  }

  .insights-empty {
    padding: 30px 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .insight-row,
  .filter-chip,
  .pagination-button {
    transition: none;
  }

  .insight-row:hover,
  .insight-row:active {
    transform: none;
  }
}
</style>
