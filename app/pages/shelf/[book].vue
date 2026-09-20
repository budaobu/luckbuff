<template>
  <div>
    <div v-if="error" class="book-state">
      {{ error.statusCode === 404 ? $t('shelf.bookNotFound') : $t('shelf.sourceError') }}
      <NuxtLink :to="localePath('/shelf')">{{ $t('shelf.backToShelf') }}</NuxtLink>
    </div>
    <ShelfReader v-else-if="detail" :initial="detail" />
    <div v-else class="book-state">{{ $t('shelf.loading') }}</div>
  </div>
</template>

<script setup lang="ts">
import { createError } from 'h3'
import type { ShelfBookDetail } from '~~/server/utils/shelf'

const route = useRoute()
const localePath = useLocalePath()
const bookId = computed(() => Number.parseInt(String(route.params.book), 10))

if (!Number.isInteger(bookId.value) || bookId.value <= 0) {
  throw createError({ statusCode: 404, statusMessage: '书籍不存在' })
}

const { data, error, refresh } = await useAsyncData(
  `shelf-book-${bookId.value}`,
  async () => {
    const chapterQuery = Number.parseInt(String(route.query.chapter ?? '0'), 10)
    const sectionQuery = Number.parseInt(String(route.query.section ?? '0'), 10)
    return await $fetch<ShelfBookDetail>(`/api/shelf/books/${bookId.value}`, {
      query: {
        chapter: Number.isInteger(chapterQuery) ? chapterQuery : 0,
        section: Number.isInteger(sectionQuery) ? sectionQuery : 0,
      },
    })
  },
  { watch: [bookId] },
)

watch(bookId, async () => {
  if (Number.isInteger(bookId.value) && bookId.value > 0) await refresh()
})

const detail = computed(() => data.value)
const seo = computed(() => detail.value?.seo)
const pageUrl = useLocalizedSeoPath()
const siteName = 'ososn'
const title = computed(() => seo.value?.seoTitle || `${detail.value?.book.title || $t('shelf.title')} - ${$t('shelf.seoTitle')} - ${siteName}`)
const description = computed(() => seo.value?.seoDescription || detail.value?.book.intro.slice(0, 155) || $t('shelf.seoDescription'))

useSeoMeta({
  title,
  description,
  keywords: () => seo.value?.keywords.join(', ') || detail.value?.book.title,
  ogTitle: title,
  ogDescription: description,
  ogUrl: () => pageUrl(`/shelf/${bookId.value}`),
  ogType: 'book',
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl(`/shelf/${bookId.value}`) }],
  script: detail.value ? [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: detail.value.book.title,
      author: detail.value.book.author || undefined,
      inLanguage: 'zh-CN',
      numberOfPages: detail.value.chapters.length,
      description: detail.value.book.intro,
      abstract: seo.value?.seoDescription,
      keywords: seo.value?.keywords.join(', '),
      url: pageUrl(`/shelf/${bookId.value}`),
    }),
  }] : [],
}))
</script>

<style scoped>
.book-state {
  max-width: 720px;
  margin: 0 auto;
  padding: 80px 24px;
  color: var(--text-muted);
}

.book-state a {
  margin-left: 10px;
  color: var(--accent);
}
</style>
