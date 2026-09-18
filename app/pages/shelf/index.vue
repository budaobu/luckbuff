<template>
  <div class="shelf-page">
    <div class="page-inner">
      <header class="shelf-head">
        <p class="eyebrow">{{ $t('shelf.eyebrow') }}</p>
        <h1>{{ $t('shelf.title') }}</h1>
        <p class="subtitle">{{ $t('shelf.description') }}</p>
      </header>

      <div v-if="error" class="source-state" role="alert">
        {{ $t('shelf.sourceError') }}
        <button type="button" :disabled="pending" @click="() => refresh()">
          {{ $t('shelf.retry') }}
        </button>
      </div>

      <template v-else>
        <div class="filters">
          <label class="search">
            <UIcon name="i-heroicons-magnifying-glass" class="h-4 w-4" aria-hidden="true" />
            <input
              v-model="query"
              type="search"
              :placeholder="$t('shelf.searchPlaceholder')"
              :aria-label="$t('shelf.searchPlaceholder')"
            >
          </label>
          <div class="category-scroll" role="group" :aria-label="$t('shelf.categories')">
            <button
              type="button"
              :class="{ active: !activeCategory }"
              :aria-pressed="!activeCategory"
              @click="activeCategory = ''"
            >
              {{ $t('shelf.all') }}
            </button>
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              :class="{ active: activeCategory === category }"
              :aria-pressed="activeCategory === category"
              @click="activeCategory = category"
            >
              {{ category }}
            </button>
          </div>
          <p class="count">{{ $t('shelf.count', { count: filteredBooks.length }) }}</p>
        </div>

        <div v-if="pending && !books.length" class="source-state">
          {{ $t('shelf.loading') }}
        </div>
        <ShelfBookcase v-else-if="filteredBooks.length" :books="filteredBooks" />
        <div v-else class="source-state">{{ $t('shelf.empty') }}</div>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShelfBook } from '~~/server/utils/shelf'

const { t } = useI18n()
const query = ref('')
const activeCategory = ref('')

const { data, error, pending, refresh } = await useAsyncData(
  'shelf-books',
  async () => {
    const response = await $fetch<{ books: ShelfBook[] }>('/api/shelf/books')
    return response.books
  },
)

const books = computed(() => data.value || [])
const categories = computed(() =>
  [...new Set(books.value.map(book => book.category).filter(Boolean))].sort((left, right) => left.localeCompare(right, 'zh-CN')))
const filteredBooks = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return books.value.filter((book) => {
    const categoryMatched = !activeCategory.value || book.category === activeCategory.value
    if (!categoryMatched) return false
    if (!keyword) return true
    return [book.title, book.author, book.category, book.intro]
      .some(value => value.toLowerCase().includes(keyword))
  })
})

const siteName = 'ososn'
const pageUrl = useLocalizedSeoUrl('/shelf')

useSeoMeta({
  title: () => `${t('shelf.seoTitle')} - ${siteName}`,
  description: () => t('shelf.seoDescription'),
  ogTitle: () => `${t('shelf.seoTitle')} - ${siteName}`,
  ogDescription: () => t('shelf.seoDescription'),
  ogUrl: pageUrl,
  ogType: 'website',
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value }],
}))
</script>

<style scoped>
.shelf-page {
  min-height: 62vh;
  padding: 48px 0 64px;
}

.page-inner {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.shelf-head {
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
  font-size: clamp(2rem, 4vw, 2.7rem);
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
  grid-template-columns: 300px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  margin: 34px 0 28px;
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

.category-scroll button {
  flex: 0 0 auto;
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
  white-space: nowrap;
}

.source-state {
  padding: 34px 0;
  color: var(--text-muted);
  font-size: 14px;
}

.source-state button {
  margin-left: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
}

@media (max-width: 900px) {
  .shelf-page {
    padding-top: 32px;
  }

  .filters {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .count {
    order: -1;
  }
}
</style>
