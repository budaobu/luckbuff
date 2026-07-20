<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="text-[var(--text-muted)] hover:text-[var(--text-body)]"
          :to="localePath('/insights')"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
          </template>
          {{ $t('insights.backToList') }}
        </UButton>
      </div>

      <!-- 加载中 -->
      <div v-if="pending" class="space-y-4">
        <USkeleton class="h-10 w-3/4 rounded-xl mx-auto" />
        <USkeleton class="h-5 w-1/3 rounded-xl mx-auto" />
        <USkeleton v-for="i in 5" :key="i" class="h-24 rounded-xl" />
      </div>

      <!-- 错误/文章不存在 -->
      <div v-else-if="error || !article" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center">
        <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 text-[var(--text-faint)] mx-auto mb-4" />
        <h1 class="text-lg font-semibold text-[var(--text-primary)] mb-2">{{ $t('insights.notFoundTitle') }}</h1>
        <p class="text-sm text-[var(--text-muted)] mb-6">{{ $t('insights.notFoundDesc') }}</p>
        <UButton color="warning" variant="soft" :to="localePath('/insights')">
          <template #leading>
            <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
          </template>
          {{ $t('insights.backToList') }}
        </UButton>
      </div>

      <!-- 文章内容 -->
      <article v-else>
        <!-- 文章头 -->
        <header class="text-center mb-10">
          <div class="inline-flex items-center gap-2 mb-3">
            <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent)]" />
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase">{{ $t('insights.badge') }}</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif leading-snug">
            {{ article.title }}
          </h1>
          <div class="flex items-center justify-center gap-4 mt-4 flex-wrap text-xs text-[var(--text-faint)]">
            <span
              v-if="article.category"
              class="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent)]"
            >
              {{ categoryLabel(article.category) }}
            </span>
            <span v-if="article.publishedAt" class="flex items-center gap-1">
              <UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5" />
              {{ formatDate(article.publishedAt) }}
            </span>
            <span v-if="article.author" class="flex items-center gap-1">
              <UIcon name="i-heroicons-user" class="w-3.5 h-3.5" />
              {{ article.author }}
            </span>
            <span v-if="article.readingTime" class="flex items-center gap-1">
              <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
              {{ $t('insights.readingTime', { n: article.readingTime }) }}
            </span>
          </div>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-6" />
        </header>

        <!-- 正文 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div
            class="text-sm text-[var(--text-body)] leading-relaxed insight-content max-w-none"
            v-html="renderedContent"
          />
        </div>

        <!-- 标签 -->
        <div v-if="article.tags.length" class="flex items-center gap-2 mt-6 flex-wrap">
          <UIcon name="i-heroicons-tag" class="w-4 h-4 text-[var(--text-faint)]" />
          <span
            v-for="tag in article.tags"
            :key="tag"
            class="text-[11px] px-2.5 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-faint)]"
          >
            {{ tag }}
          </span>
        </div>

        <!-- 免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mt-6">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('insights.disclaimer') }}
          </p>
        </div>

        <!-- 底部导航 -->
        <div class="flex gap-3 justify-center mt-8 flex-wrap">
          <UButton color="warning" variant="soft" :to="localePath('/insights')">
            <template #leading>
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4" />
            </template>
            {{ $t('insights.backToList') }}
          </UButton>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface InsightDetail {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  author: string
  readingTime: number
  content: string
}

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => route.params.slug as string)

const { data: article, pending, error } = await useAsyncData(
  () => `insight-${slug.value}-${locale.value}`,
  () => $fetch<InsightDetail>(`/api/insights/${slug.value}?lang=${locale.value}`),
  { server: true, watch: [locale] }
)

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  try {
    return marked.parse(article.value.content, { async: false }) as string
  } catch {
    return article.value.content
  }
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

const pageTitle = computed(() => {
  if (!article.value) return `${t('insights.title')} - ${siteName}`
  return `${article.value.title} - ${t('insights.title')} - ${siteName}`
})

const pageDesc = computed(() => article.value?.description || t('insights.seoDesc'))

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDesc.value,
  keywords: () => (article.value ? [...article.value.tags, t('insights.title')].join(',') : t('insights.seoKeywords')),
  ogTitle: () => pageTitle.value,
  ogDescription: () => pageDesc.value,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'article',
  ogUrl: () => `https://www.ososn.com/insights/${slug.value}`,
  twitterCard: 'summary_large_image',
})

useHead(() => {
  const clean = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(clean)
    if (obj && typeof obj === 'object') {
      const result: any = {}
      for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== '') result[k] = clean(v)
      }
      return result
    }
    return obj
  }

  const schema = clean({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.value?.title,
    description: pageDesc.value,
    author: {
      '@type': 'Person',
      name: article.value?.author || undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: 'https://www.ososn.com',
    },
    datePublished: article.value?.publishedAt,
    dateModified: article.value?.updatedAt || article.value?.publishedAt,
    articleSection: article.value?.category,
    keywords: article.value?.tags.join(', '),
    url: `https://www.ososn.com/insights/${slug.value}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.ososn.com/insights/${slug.value}`,
    },
  })

  return {
    link: [
      { rel: 'canonical', href: `https://www.ososn.com/insights/${slug.value}` },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      },
    ],
  }
})
</script>

<style scoped>
.insight-content :deep(h1),
.insight-content :deep(h2),
.insight-content :deep(h3) {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}
.insight-content :deep(h1:first-child),
.insight-content :deep(h2:first-child),
.insight-content :deep(h3:first-child) {
  margin-top: 0;
}
.insight-content :deep(h4) {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-body);
  margin-top: 0.75rem;
  margin-bottom: 0.3rem;
}
.insight-content :deep(p) {
  margin-bottom: 0.7em;
  line-height: 1.8;
  color: var(--text-body);
}
.insight-content :deep(p:last-child) {
  margin-bottom: 0;
}
.insight-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.insight-content :deep(a) {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.insight-content :deep(ul),
.insight-content :deep(ol) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.insight-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.insight-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
.insight-content :deep(ol) {
  counter-reset: insight-ol;
}
.insight-content :deep(ol li) {
  position: relative;
  padding-left: 1.4rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.insight-content :deep(ol li::before) {
  counter-increment: insight-ol;
  content: counter(insight-ol) '.';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
.insight-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 1rem 0;
}
.insight-content :deep(blockquote) {
  border-left: 2px solid var(--accent-border);
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: var(--text-muted);
}
.insight-content :deep(code) {
  font-size: 0.85em;
  padding: 0.1em 0.35em;
  border-radius: 0.25rem;
  background-color: var(--accent-faint);
  color: var(--text-primary);
}
</style>
