<template>
  <div class="wiki-page">
    <main class="page-inner">
      <header v-reveal class="wiki-head">
        <p class="eyebrow">Wiki</p>
        <h1>{{ $t('wiki.title') }}</h1>
        <p class="subtitle">{{ $t('wiki.description') }}</p>
      </header>

      <div class="filters">
        <label class="search">
          <UIcon name="i-heroicons-magnifying-glass" class="h-4 w-4" aria-hidden="true" />
          <input
            v-model="query"
            type="search"
            :placeholder="$t('wiki.searchPlaceholder')"
            :aria-label="$t('wiki.searchPlaceholder')"
          >
        </label>

        <div class="category-scroll" role="group" :aria-label="$t('wiki.categories')">
          <button
            type="button"
            :class="{ active: !activeCategory }"
            :aria-pressed="!activeCategory"
            @click="activeCategory = ''"
          >
            {{ $t('wiki.all') }}
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            :class="{ active: activeCategory === category.id }"
            :aria-pressed="activeCategory === category.id"
            @click="activeCategory = category.id"
          >
            {{ category.title }}
          </button>
        </div>

        <p class="count">{{ $t('wiki.count', { n: filteredEntries.length }) }}</p>
      </div>

      <template v-if="filteredGroups.length">
        <section
          v-for="group in filteredGroups"
          :key="group.id"
          v-reveal
          class="wiki-group"
        >
          <h2>{{ group.title }}</h2>
          <div class="entry-list">
            <NuxtLink
              v-for="entry in group.entries"
              :key="entry.sourcePath"
              :to="localePath(entry.sourcePath)"
              :no-prefetch="true"
              class="entry-row"
            >
              <span class="entry-main">
                <span class="entry-title">{{ entry.title }}</span>
                <span v-if="entry.excerpt" class="entry-excerpt">{{ entry.excerpt }}</span>
              </span>
              <UIcon name="i-heroicons-arrow-right" class="entry-arrow" aria-hidden="true" />
            </NuxtLink>
          </div>
        </section>
      </template>

      <div v-else class="empty-state">{{ $t('wiki.empty') }}</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { WikiEntryMeta, WikiSeo } from '~~/server/utils/wiki'

interface WikiIndexResponse {
  syncedAt: string
  total: number
  seo: WikiSeo
  entries: WikiEntryMeta[]
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const seoPath = useLocalizedSeoPath()
const query = ref('')
const activeCategory = ref('')

const { data, pending } = await useAsyncData(
  () => `wiki-index-${locale.value}`,
  () => $fetch<WikiIndexResponse>('/api/wiki'),
  { server: true, watch: [locale] },
)

const entries = computed(() => data.value?.entries || [])
const categories = computed(() => {
  const grouped = new Map<string, string>()
  for (const entry of entries.value) {
    if (entry.category && !grouped.has(entry.category)) grouped.set(entry.category, entry.categoryTitle)
  }
  return [...grouped.entries()].map(([id, title]) => ({ id, title }))
})

const filteredEntries = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return entries.value.filter((entry) => {
    if (activeCategory.value && entry.category !== activeCategory.value) return false
    if (!keyword) return true
    return [entry.title, entry.excerpt, entry.categoryTitle, ...entry.tags]
      .some(value => value.toLowerCase().includes(keyword))
  })
})

const filteredGroups = computed(() => {
  return categories.value
    .map(category => ({
      id: category.id,
      title: category.title,
      entries: filteredEntries.value.filter(entry => entry.category === category.id),
    }))
    .filter(group => group.entries.length)
})

const siteName = useRuntimeConfig().public.siteName
const pageUrl = useLocalizedSeoUrl('/wiki')
const seo = computed(() => data.value?.seo)
const seoTitle = computed(() => seo.value?.seoTitle || t('wiki.seoTitle'))
const seoDescription = computed(() => seo.value?.seoDescription || t('wiki.seoDescription'))

useSeoMeta({
  title: () => `${seoTitle.value} - ${siteName}`,
  description: seoDescription,
  keywords: () => seo.value?.keywords.join(', ') || t('wiki.seoDescription'),
  ogTitle: () => `${seoTitle.value} - ${siteName}`,
  ogDescription: seoDescription,
  ogUrl: pageUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => `${seoTitle.value} - ${siteName}`,
  twitterDescription: seoDescription,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value }],
  meta: [
    { name: 'keywords', content: () => seo.value?.keywords.join(', ') || t('wiki.seoDescription') },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${seoTitle.value} - ${siteName}`,
      description: seoDescription.value,
      url: pageUrl.value,
      inLanguage: 'zh-CN',
      keywords: seo.value?.keywords.join(', '),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: entries.value.length,
        itemListElement: entries.value.map((entry, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: entry.title,
          url: seoPath(entry.sourcePath),
        })),
      },
    }),
  }],
}))
</script>

<style scoped>
.wiki-page {
  min-height: 62vh;
  padding: 48px 0 72px;
}

.page-inner {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

.wiki-head {
  max-width: 700px;
}

.eyebrow {
  margin-bottom: 10px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 12px;
  color: var(--text-primary);
  font-family: var(--serif-font);
  font-size: clamp(2rem, 4vw, 2.6rem);
  font-weight: 600;
  line-height: 1.15;
}

.subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.7;
}

.filters {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  margin: 32px 0 28px;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--surface-card);
  color: var(--text-faint);
}

.search input {
  width: 100%;
  min-width: 0;
  padding: 9px 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-body);
  font-size: 14px;
}

.category-scroll {
  display: flex;
  align-items: center;
  gap: 7px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-scroll button,
.count {
  flex: 0 0 auto;
}

.category-scroll button {
  padding: 6px 10px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: transparent;
  color: var(--text-faint);
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  transition: color 150ms ease, background 150ms ease;
}

.category-scroll button:hover,
.category-scroll button.active {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}

.count {
  margin: 0;
  color: var(--text-placeholder);
  font-size: 12px;
}

.wiki-group + .wiki-group {
  margin-top: 30px;
}

.wiki-group h2 {
  margin: 0 0 10px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.entry-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.entry-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface-card);
  transition: border-color 150ms ease, background 150ms ease;
}

.entry-row:hover {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.entry-main {
  min-width: 0;
}

.entry-title {
  display: block;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-excerpt {
  display: -webkit-box;
  margin-top: 3px;
  overflow: hidden;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.entry-arrow {
  flex: 0 0 auto;
  width: 15px;
  height: 15px;
  margin-left: auto;
  color: var(--text-faint);
}

.empty-state {
  padding: 40px 0;
  color: var(--text-muted);
  font-size: 14px;
}

@media (max-width: 860px) {
  .wiki-page {
    padding-top: 32px;
  }

  .filters {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .count {
    order: -1;
  }

  .entry-list {
    grid-template-columns: 1fr;
  }
}
</style>
