<template>
  <div class="bookcase">
    <section
      v-for="(shelf, shelfIndex) in shelves"
      :key="`shelf-${shelfIndex}`"
      class="shelf"
      :aria-label="`第 ${shelfIndex + 1} 层书架`"
    >
      <div class="shelf-books">
        <a
          v-for="book in shelf"
          :key="book.id"
          :href="localePath(`/shelf/${book.id}`)"
          class="book-link"
          :aria-label="`打开《${book.title}》`"
          @click.prevent="openBook(book)"
        >
          <ShelfBookCover
            :title="book.title"
            :author="book.author"
            :dynasty="book.dynasty"
            :category="book.category"
          />
        </a>
      </div>
      <div class="shelf-board" aria-hidden="true" />
    </section>
  </div>

  <Teleport to="body">
    <div v-if="openingBook" class="opening-overlay" role="status" :aria-label="`正在打开《${openingBook.title}》`">
      <div class="opening-book">
        <div class="opening-page" aria-hidden="true" />
        <div class="opening-cover">
          <ShelfBookCover
            :title="openingBook.title"
            :author="openingBook.author"
            :dynasty="openingBook.dynasty"
            :category="openingBook.category"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ShelfBook } from '~~/server/utils/shelf'

const props = defineProps<{
  books: ShelfBook[]
}>()

const localePath = useLocalePath()
const SHELF_SIZE = 12
const openingBook = ref<ShelfBook | null>(null)

const shelves = computed(() => {
  const result: ShelfBook[][] = []
  for (let index = 0; index < props.books.length; index += SHELF_SIZE) {
    result.push(props.books.slice(index, index + SHELF_SIZE))
  }
  return result
})

async function openBook(book: ShelfBook) {
  if (openingBook.value) return
  openingBook.value = book
  try {
    await nextTick()

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    await new Promise(resolve => setTimeout(resolve, reducedMotion ? 130 : 1020))
    await navigateTo(localePath(`/shelf/${book.id}`))
  }
  finally {
    openingBook.value = null
  }
}
</script>

<style scoped>
.bookcase {
  display: grid;
  gap: 38px;
}

.shelf-books {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: end;
  gap: 18px 16px;
  padding: 6px 2px 20px;
}

.book-link {
  display: block;
  border-radius: 2px 4px 4px 2px;
  outline-offset: 4px;
  transition: transform 200ms var(--ease-out-expo), filter 200ms ease;
}

.book-link:hover {
  transform: translateY(-5px);
  filter: brightness(1.04);
}

.book-link:active {
  transform: translateY(-1px) scale(0.96);
}

.shelf-board {
  height: 10px;
  border-top: 1px solid color-mix(in srgb, var(--border-strong) 70%, transparent);
  border-radius: 1px 1px 3px 3px;
  background:
    linear-gradient(90deg, transparent, color-mix(in srgb, var(--text-primary) 4%, transparent), transparent),
    linear-gradient(180deg, color-mix(in srgb, var(--surface-elevated) 92%, var(--text-primary) 5%), var(--surface-elevated));
  box-shadow: 0 8px 18px -18px rgba(0, 0, 0, 0.75);
}

.opening-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 6vw;
  background: color-mix(in srgb, var(--surface-bg) 88%, transparent);
  perspective: 1500px;
  backdrop-filter: blur(16px);
  animation: overlay-in 220ms ease-out both;
}

.opening-book {
  position: relative;
  width: min(320px, 76vw);
  aspect-ratio: 5 / 7;
  transform-style: preserve-3d;
  animation: book-zoom 920ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.opening-page,
.opening-cover {
  position: absolute;
  inset: 0;
  border-radius: 2px 4px 4px 2px;
}

.opening-page {
  border: 1px solid var(--border-light);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--surface-bg) 82%, transparent), var(--surface-elevated)),
    repeating-linear-gradient(0deg, transparent 0 25px, color-mix(in srgb, var(--border-light) 80%, transparent) 25px 26px);
  box-shadow: inset 24px 0 36px -30px rgba(0, 0, 0, 0.7);
  animation: page-reveal 680ms ease-out 140ms both;
}

.opening-cover {
  transform-origin: left center;
  transform-style: preserve-3d;
  animation: cover-open 920ms cubic-bezier(0.32, 0, 0.18, 1) 90ms both;
}

@keyframes overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes book-zoom {
  from {
    opacity: 0.2;
    transform: scale(0.64) rotateX(9deg);
  }
  to {
    opacity: 1;
    transform: scale(1.12) rotateX(0deg);
  }
}

@keyframes cover-open {
  0% {
    transform: rotateY(0deg);
  }
  62% {
    transform: rotateY(-52deg);
  }
  100% {
    transform: rotateY(-74deg);
  }
}

@keyframes page-reveal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (min-width: 720px) {
  .shelf-books {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px 22px;
    padding-bottom: 24px;
  }
}

@media (min-width: 1024px) {
  .shelf-books {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 26px;
    padding: 10px 2px 26px;
  }

  .opening-book {
    width: min(360px, 30vw);
  }
}

@media (prefers-reduced-motion: reduce) {
  .book-link,
  .opening-overlay,
  .opening-book,
  .opening-cover {
    animation: none;
    transition: none;
  }

  .opening-cover {
    transform: rotateY(-22deg);
  }
}
</style>
