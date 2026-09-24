<template>
  <div class="wiki-entry-page">
    <main class="reading-column">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <NuxtLink
          :to="localePath('/wiki')"
          :no-prefetch="true"
          class="inline-flex items-center gap-1.5"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" aria-hidden="true" />
          {{ $t('wiki.back') }}
        </NuxtLink>
        <span aria-hidden="true">/</span>
        <span>{{ entry.categoryTitle }}</span>
      </nav>

      <article class="wiki-article">
        <header>
          <p class="category">{{ entry.categoryTitle }}</p>
          <h1>{{ entry.title }}</h1>
          <div v-if="entry.tags.length" class="tags">
            <span v-for="tag in entry.tags" :key="tag">{{ tag }}</span>
          </div>
        </header>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="wiki-content" v-html="renderedContent" />
      </article>

      <section v-if="relatedEntries.length" class="related">
        <h2>{{ $t('wiki.related') }}</h2>
        <div class="related-list">
          <NuxtLink
            v-for="item in relatedEntries"
            :key="item.sourcePath"
            :to="localePath(item.sourcePath)"
            :no-prefetch="true"
          >
            {{ item.title }}
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { marked, Renderer } from 'marked'
import type { WikiEntryDetail, WikiEntryMeta, WikiSeo } from '~~/server/utils/wiki'

interface WikiDetailResponse {
  entry: WikiEntryDetail
  entries: WikiEntryMeta[]
}

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slugSegments = computed(() => (
  Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
).map(String).filter(Boolean))

const requestPath = computed(() => `/api/wiki/${slugSegments.value.map(encodeURIComponent).join('/')}`)
const pageUrl = useLocalizedSeoUrl(() => `/wiki/${slugSegments.value.map(encodeURIComponent).join('/')}`)

const { data, error } = await useAsyncData(
  () => `wiki-entry-${locale.value}-${slugSegments.value.join('/')}`,
  async () => {
    const [entry, index] = await Promise.all([
      plainFetch<WikiEntryDetail>(requestPath.value, { query: { locale: locale.value } }),
      plainFetch<{ entries: WikiEntryMeta[] }>('/api/wiki', { query: { locale: locale.value } }),
    ])
    return { entry, entries: index.entries } satisfies WikiDetailResponse
  },
  { server: true, watch: [locale] },
)

if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Wiki entry not found', fatal: true })
}

const entry = computed(() => data.value!.entry)
const relatedEntries = computed(() => data.value!.entries
  .filter(item => item.category === entry.value.category && item.sourcePath !== entry.value.sourcePath)
  .slice(0, 6))

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const renderer = new Renderer()
renderer.html = ({ text }) => escapeHtml(text)
renderer.link = ({ href, title, tokens }) => {
  const label = renderer.parser.parseInline(tokens)
  const titleAttribute = title ? ` title="${escapeHtml(title)}"` : ''
  const safeHref = /^(https?:|mailto:|#|\/)/i.test(href) ? href : '#'
  const external = /^https?:/i.test(safeHref)
  const rel = external ? ' target="_blank" rel="noopener noreferrer"' : ''
  const localizedHref = external ? safeHref : localePath(safeHref)
  return `<a href="${escapeHtml(localizedHref)}"${titleAttribute}${rel}>${label}</a>`
}

const renderedContent = computed(() => marked.parse(entry.value.content, {
  async: false,
  renderer,
}) as string)

const siteName = useRuntimeConfig().public.siteName
const description = entry.value.description || entry.value.excerpt
const seo = computed<WikiSeo | undefined>(() => entry.value.seo)
const seoTitle = computed(() => seo.value?.seoTitle || `${entry.value.title} - ${t('wiki.title')}`)
const seoDescription = computed(() => seo.value?.seoDescription || description)

useSeoMeta({
  title: () => `${seoTitle.value} - ${siteName}`,
  description: seoDescription,
  keywords: () => seo.value?.keywords.join(', ') || entry.value.tags.join(', '),
  ogTitle: () => seoTitle.value,
  ogDescription: seoDescription,
  ogType: 'article',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: () => seoTitle.value,
  twitterDescription: seoDescription,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value }],
  meta: [
    { name: 'keywords', content: () => seo.value?.keywords.join(', ') || entry.value.tags.join(', ') },
    { property: 'article:section', content: entry.value.categoryTitle },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: seoTitle.value,
      alternativeHeadline: entry.value.title,
      description: seoDescription.value,
      articleSection: entry.value.categoryTitle,
      inLanguage: locale.value,
      url: pageUrl.value,
      keywords: seo.value?.keywords.join(', ') || entry.value.tags.join(', '),
    }),
  }],
}))
</script>

<style scoped>
.wiki-entry-page {
  min-height: 62vh;
  padding: 48px 0 72px;
}

.reading-column {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  color: var(--text-faint);
  font-size: 12px;
}

.breadcrumb a {
  color: var(--text-muted);
}

.breadcrumb a:hover {
  color: var(--accent);
}

.wiki-article {
  padding: 28px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-card);
}

.category {
  margin: 0;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

h1 {
  margin: 10px 0 0;
  color: var(--text-primary);
  font-family: var(--serif-font);
  font-size: 28px;
  font-weight: 600;
  line-height: 1.25;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.tags span {
  padding: 4px 8px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  color: var(--text-faint);
  font-size: 11px;
}

.wiki-content {
  margin-top: 26px;
  color: var(--text-body);
  font-size: 15px;
  line-height: 1.85;
}

.wiki-content :deep(h1),
.wiki-content :deep(h2),
.wiki-content :deep(h3) {
  margin: 28px 0 10px;
  color: var(--text-primary);
  font-family: var(--serif-font);
  line-height: 1.35;
}

.wiki-content :deep(h1) {
  font-size: 20px;
}

.wiki-content :deep(h2) {
  font-size: 18px;
}

.wiki-content :deep(h3) {
  font-size: 16px;
}

.wiki-content :deep(p) {
  margin: 0 0 14px;
}

.wiki-content :deep(ul),
.wiki-content :deep(ol) {
  margin: 0 0 14px;
  padding-left: 22px;
}

.wiki-content :deep(li + li) {
  margin-top: 5px;
}

.wiki-content :deep(blockquote) {
  margin: 16px 0;
  padding: 10px 16px;
  border-left: 3px solid var(--accent-border);
  background: var(--accent-bg);
  color: var(--text-muted);
}

.wiki-content :deep(table) {
  width: 100%;
  margin: 16px 0;
  border-collapse: collapse;
  font-size: 14px;
}

.wiki-content :deep(th),
.wiki-content :deep(td) {
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  text-align: left;
  vertical-align: top;
}

.wiki-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.related {
  margin-top: 34px;
}

.related h2 {
  margin: 0 0 12px;
  color: var(--text-primary);
  font-size: 16px;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.related-list a {
  overflow: hidden;
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-list a:hover {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}

@media (max-width: 700px) {
  .wiki-entry-page {
    padding-top: 32px;
  }

  .wiki-article {
    padding: 20px;
  }

  h1 {
    font-size: 24px;
  }

  .related-list {
    grid-template-columns: 1fr;
  }
}
</style>
