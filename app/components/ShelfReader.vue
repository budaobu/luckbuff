<template>
  <div class="reader">
    <div class="reader-layout">
      <aside class="toc-sidebar" aria-labelledby="shelf-toc-title">
        <div class="sidebar-top">
          <NuxtLink :to="localePath('/shelf')" class="back-link">
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
            {{ $t('shelf.backToShelf') }}
          </NuxtLink>
          <button type="button" class="mobile-toc-button" @click="drawerOpen = true">
            <UIcon name="i-heroicons-list-bullet" class="h-4 w-4" />
            {{ $t('shelf.toc') }}
          </button>
        </div>
        <div class="sidebar-inner">
          <div class="sidebar-title">
            <h2 id="shelf-toc-title">{{ $t('shelf.toc') }}</h2>
            <span>{{ initial.chapters.length }}</span>
          </div>
          <nav class="toc" aria-label="章节目录">
            <div
              v-for="(chapter, chapterIndex) in initial.chapters"
              :key="`chapter-${chapterIndex}`"
              class="toc-group"
            >
              <button
                :ref="setChapterRef"
                :data-chapter-index="chapterIndex"
                type="button"
                class="toc-volume"
                :class="{ active: chapterIndex === currentChapter }"
                :aria-expanded="expandedChapters.has(chapterIndex)"
                @click="toggleChapter(chapterIndex)"
              >
                <span class="toc-volume-label">{{ chapter.title }}</span>
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="toc-chevron"
                  :class="{ open: expandedChapters.has(chapterIndex) }"
                />
              </button>
              <div
                v-if="expandedChapters.has(chapterIndex)"
                class="toc-sections"
              >
                <div v-if="sectionLoading === chapterIndex" class="toc-menu-state" role="status">
                  {{ $t('shelf.loadingChapter') }}
                </div>
                <div v-else-if="sectionErrors[chapterIndex]" class="toc-menu-state error" role="alert">
                  {{ $t('shelf.chapterError') }}
                  <button type="button" @click="toggleChapter(chapterIndex, true)">{{ $t('shelf.retry') }}</button>
                </div>
                <template v-else>
                  <button
                    v-for="(_, sectionIndex) in currentSections(chapterIndex)"
                    :key="`section-${chapterIndex}-${sectionIndex}`"
                    type="button"
                    class="toc-section"
                    :class="{ active: chapterIndex === currentChapter && sectionIndex === currentSection }"
                    :aria-current="chapterIndex === currentChapter && sectionIndex === currentSection ? 'true' : undefined"
                    @click="selectPosition(chapterIndex, sectionIndex)"
                  >
                    {{ sectionLabel(chapterIndex, sectionIndex) }}
                  </button>
                </template>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      <section class="reading-area" aria-label="当前章节">
        <header class="book-head">
          <div class="book-tags">
            <span class="tag">{{ initial.book.category || $t('shelf.classic') }}</span>
            <span>{{ initial.book.dynasty }}</span>
            <span>{{ initial.chapters.length }} {{ $t('shelf.volumeUnit') }}</span>
            <span class="position">{{ positionLabel }}</span>
          </div>
          <h1>{{ initial.book.title }}</h1>
          <p class="book-author">{{ initial.book.author || $t('shelf.unknownAuthor') }}</p>
          <p class="book-intro">{{ initial.book.intro }}</p>
        </header>

        <article class="passage">
          <p class="chapter-crumbs">
            {{ initial.book.title }} · {{ currentChapterTitle }}
          </p>
          <h2 v-if="currentHead" class="section-title">{{ currentHead }}</h2>

          <div v-if="chapterLoading" class="chapter-state" role="status">
            {{ $t('shelf.loadingChapter') }}
          </div>
          <div v-else-if="chapterError" class="chapter-state error" role="alert">
            {{ $t('shelf.chapterError') }}
            <button type="button" @click="reloadCurrent">{{ $t('shelf.retry') }}</button>
          </div>

          <div v-else class="section-body">
            <p v-for="(line, index) in currentLines" :key="`${currentChapter}-${currentSection}-${index}`">
              {{ line }}
            </p>
          </div>

          <div v-if="currentTranslation" class="translation">
            <button type="button" class="translation-toggle" :aria-expanded="translationOpen" @click="translationOpen = !translationOpen">
              <UIcon name="i-heroicons-language" class="h-4 w-4" />
              {{ $t('shelf.translation') }}
            </button>
            <div v-if="translationOpen" class="translation-body">
              {{ currentTranslation }}
            </div>
          </div>

          <div class="pager">
            <button type="button" :disabled="!hasPrevious" @click="goPrevious">
              <UIcon name="i-heroicons-chevron-left" class="h-4 w-4" />
              {{ $t('shelf.previous') }}
            </button>
            <span>{{ positionLabel }}</span>
            <button type="button" :disabled="!hasNext" @click="goNext">
              {{ $t('shelf.next') }}
              <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
            </button>
          </div>
        </article>
      </section>
    </div>

    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawerOpen" class="drawer-root">
          <button type="button" class="drawer-mask" aria-label="关闭目录" @click="drawerOpen = false" />
          <div class="drawer" role="dialog" aria-modal="true" aria-label="章节目录">
            <div class="drawer-head">
              <h2>{{ $t('shelf.toc') }}</h2>
              <button type="button" aria-label="关闭目录" @click="drawerOpen = false">
                <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
              </button>
            </div>
            <div class="drawer-body">
              <div v-for="(chapter, chapterIndex) in initial.chapters" :key="`drawer-${chapterIndex}`" class="toc-group">
                <button
                  class="drawer-volume"
                  type="button"
                  :class="{ active: chapterIndex === currentChapter }"
                  :aria-expanded="expandedChapters.has(chapterIndex)"
                  @click="toggleChapter(chapterIndex)"
                >
                  <span class="toc-volume-label">{{ chapter.title }}</span>
                  <UIcon
                    name="i-heroicons-chevron-down"
                    class="toc-chevron"
                    :class="{ open: expandedChapters.has(chapterIndex) }"
                  />
                </button>
                <div v-if="expandedChapters.has(chapterIndex)" class="toc-sections">
                  <div v-if="sectionLoading === chapterIndex" class="toc-menu-state" role="status">
                    {{ $t('shelf.loadingChapter') }}
                  </div>
                  <div v-else-if="sectionErrors[chapterIndex]" class="toc-menu-state error" role="alert">
                    {{ $t('shelf.chapterError') }}
                    <button type="button" @click="toggleChapter(chapterIndex, true)">{{ $t('shelf.retry') }}</button>
                  </div>
                  <button
                    v-for="(_, sectionIndex) in currentSections(chapterIndex)"
                    :key="`drawer-section-${chapterIndex}-${sectionIndex}`"
                    type="button"
                    class="drawer-section"
                    :class="{ active: chapterIndex === currentChapter && sectionIndex === currentSection }"
                    :aria-current="chapterIndex === currentChapter && sectionIndex === currentSection ? 'true' : undefined"
                    @click="selectPosition(chapterIndex, sectionIndex)"
                  >
                    {{ sectionLabel(chapterIndex, sectionIndex) }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { ShelfBookDetail, ShelfSection } from '~~/server/utils/shelf'

const props = defineProps<{
  initial: ShelfBookDetail
}>()

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const requestShelfChapter = $fetch as unknown as (
  url: string,
  options: { query: { chapter: number } },
) => Promise<{ sections: ShelfSection[] }>
const currentChapter = ref(props.initial.chapterIndex)
const currentSection = ref(props.initial.sectionIndex)
const chapterLoading = ref(false)
const chapterError = ref(false)
const translationOpen = ref(false)
const drawerOpen = ref(false)
const chapterRefs: Array<HTMLElement | null> = []
let loadToken = 0
const expandedChapters = reactive(new Set<number>([props.initial.chapterIndex]))
const sectionLoading = ref<number | null>(null)
const sectionErrors = reactive<Record<number, boolean>>({})

const loadedSections = reactive<Record<number, ShelfSection[]>>({
  [props.initial.chapterIndex]: props.initial.sections,
})

const currentChapterTitle = computed(() =>
  props.initial.chapters[currentChapter.value]?.title || props.initial.book.title)
const currentData = computed(() => loadedSections[currentChapter.value] || [])
const current = computed(() => currentData.value[currentSection.value])
const currentHead = computed(() => current.value?.head.trim() || '')
const currentLines = computed(() => (current.value?.text || '').split(/\r?\n/).filter(line => line.trim().length > 0))
const currentTranslation = computed(() => current.value?.translation.trim() || '')
const positionLabel = computed(() => t('shelf.sectionPosition', {
  current: currentSection.value + 1,
  total: currentData.value.length,
}))
const hasPrevious = computed(() => currentSection.value > 0 || currentChapter.value > 0)
const hasNext = computed(() =>
  currentSection.value < currentData.value.length - 1
  || currentChapter.value < props.initial.chapters.length - 1)

watch(drawerOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})

watch(() => route.query, async () => {
  if (import.meta.server) return
  await syncFromRoute()
})

watch(currentChapter, async () => {
  expandedChapters.add(currentChapter.value)
  await nextTick()
  chapterRefs[currentChapter.value]?.scrollIntoView({ block: 'nearest' })
})

function setChapterRef(element: unknown) {
  if (element instanceof HTMLElement) {
    chapterRefs[Number(element.getAttribute('data-chapter-index') || 0)] = element
  }
}

function routePosition() {
  const chapter = Number.parseInt(String(route.query.chapter ?? currentChapter.value), 10)
  const section = Number.parseInt(String(route.query.section ?? currentSection.value), 10)
  const maxChapter = Math.max(props.initial.chapters.length - 1, 0)
  return {
    chapter: Number.isInteger(chapter) ? Math.min(Math.max(chapter, 0), maxChapter) : currentChapter.value,
    section: Number.isInteger(section) && section >= 0 ? section : currentSection.value,
  }
}

async function syncFromRoute() {
  const position = routePosition()
  if (position.chapter === currentChapter.value) {
    currentSection.value = Math.min(position.section, Math.max(currentData.value.length - 1, 0))
    translationOpen.value = false
    return
  }

  await loadChapter(position.chapter, position.section)
}

async function loadChapter(chapterIndex: number, sectionIndex: number) {
  const token = ++loadToken
  chapterLoading.value = true
  chapterError.value = false

  try {
    if (!loadedSections[chapterIndex]) {
      const response = await requestShelfChapter(
        `/api/shelf/books/${props.initial.book.id}/chapter`,
        { query: { chapter: chapterIndex } },
      )
      if (token !== loadToken) return
      loadedSections[chapterIndex] = response.sections
    }

    currentChapter.value = chapterIndex
    currentSection.value = Math.min(sectionIndex, Math.max(loadedSections[chapterIndex]!.length - 1, 0))
    translationOpen.value = false
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch {
    if (token === loadToken) chapterError.value = true
  }
  finally {
    if (token === loadToken) chapterLoading.value = false
    drawerOpen.value = false
  }
}

async function toggleChapter(chapterIndex: number, retry = false) {
  if (!retry && expandedChapters.has(chapterIndex)) {
    expandedChapters.delete(chapterIndex)
    return
  }

  expandedChapters.add(chapterIndex)
  if (currentSections(chapterIndex).length || sectionLoading.value === chapterIndex) return

  sectionLoading.value = chapterIndex
  delete sectionErrors[chapterIndex]
  try {
    const response = await requestShelfChapter(
      `/api/shelf/books/${props.initial.book.id}/chapter`,
      { query: { chapter: chapterIndex } },
    )
    loadedSections[chapterIndex] = response.sections
  }
  catch {
    sectionErrors[chapterIndex] = true
  }
  finally {
    if (sectionLoading.value === chapterIndex) sectionLoading.value = null
  }
}

function selectPosition(chapterIndex: number, sectionIndex: number) {
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string') query[key] = value
  }
  if (chapterIndex === 0) delete query.chapter
  else query.chapter = String(chapterIndex)
  if (sectionIndex === 0) delete query.section
  else query.section = String(sectionIndex)

  void routerReplace(query)
}

const router = useRouter()
async function routerReplace(query: Record<string, string>) {
  await router.replace({ query })
}

function reloadCurrent() {
  const chapterIndex = currentChapter.value
  delete loadedSections[chapterIndex]
  void loadChapter(chapterIndex, currentSection.value)
}

function goPrevious() {
  if (currentSection.value > 0) {
    selectPosition(currentChapter.value, currentSection.value - 1)
    return
  }

  const previousChapter = currentChapter.value - 1
  const sections = loadedSections[previousChapter]
  selectPosition(previousChapter, Math.max(sections?.length ? sections.length - 1 : 0, 0))
}

function goNext() {
  if (currentSection.value < currentData.value.length - 1) {
    selectPosition(currentChapter.value, currentSection.value + 1)
    return
  }
  selectPosition(currentChapter.value + 1, 0)
}

function currentSections(chapterIndex: number) {
  return loadedSections[chapterIndex] || []
}

function sectionLabel(chapterIndex: number, sectionIndex: number) {
  const section = loadedSections[chapterIndex]?.[sectionIndex]
  const head = section?.head.trim() || section?.text.split(/\r?\n/).find(line => line.trim().length > 0)?.trim()
  const number = `${sectionIndex + 1}. `
  const label = head || '…'
  return label.length > 20 ? `${number}${label.slice(0, 20)}…` : `${number}${label}`
}

</script>

<style scoped>
.reader {
  max-width: 1240px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

.book-head {
  display: grid;
  gap: 10px;
  max-width: 680px;
  margin-bottom: 28px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--border-subtle);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 7px 8px;
  margin: -7px -8px;
  color: var(--text-faint);
  font-size: 13px;
  transition: color 160ms ease, transform 160ms ease;
}

.back-link:hover {
  color: var(--accent);
}

.back-link:active {
  transform: scale(0.96);
}

.sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 34px;
  padding-right: 16px;
}

.book-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--text-faint);
  font-size: 12px;
}

.tag {
  padding: 3px 8px;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
}

.position {
  color: var(--text-placeholder);
  font-variant-numeric: tabular-nums;
}

h1 {
  margin: 2px 0 0;
  color: var(--text-primary);
  font-family: var(--serif-font);
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 600;
  line-height: 1.2;
  text-wrap: balance;
}

.book-author,
.book-intro {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.65;
}

.book-intro {
  text-wrap: pretty;
}

.reader-layout {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  gap: 44px;
  align-items: start;
}

.toc-sidebar {
  position: sticky;
  top: 92px;
  max-height: calc(100dvh - 116px);
  overflow: hidden;
  border-right: 1px solid var(--border-subtle);
}

.sidebar-inner {
  max-height: calc(100dvh - 170px);
  margin-top: 18px;
  padding-right: 16px;
  overflow-y: auto;
}

.sidebar-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  color: var(--text-primary);
}

.sidebar-title h2 {
  font-size: 15px;
  font-weight: 600;
}

.sidebar-title span {
  color: var(--text-placeholder);
  font-size: 12px;
}

.toc-group + .toc-group {
  margin-top: 14px;
}

.toc-volume,
.toc-section,
.drawer button,
.mobile-toc-button,
.pager button,
.translation-toggle {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.toc-volume {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--text-muted);
  font-family: var(--serif-font);
  font-size: 14px;
  line-height: 1.45;
  text-align: left;
}

.toc-volume-label {
  min-width: 0;
}

.toc-chevron {
  flex-shrink: 0;
  color: var(--text-placeholder);
  transition: transform 180ms var(--ease-out-expo), color 160ms ease;
}

.toc-chevron.open {
  transform: rotate(180deg);
  color: var(--accent);
}

.toc-sections {
  margin-top: 2px;
}

.toc-menu-state {
  margin: 2px 0 6px 12px;
  color: var(--text-placeholder);
  font-size: 12px;
  line-height: 1.4;
}

.toc-menu-state button {
  margin-left: 6px;
  color: var(--accent);
}

.drawer-volume {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.toc-section {
  display: block;
  width: calc(100% - 12px);
  margin-left: 12px;
  padding: 6px 9px;
  border-left: 1px solid var(--border-light);
  border-radius: 0 7px 7px 0;
  color: var(--text-faint);
  font-size: 13px;
  line-height: 1.45;
  text-align: left;
}

.toc-volume:hover,
.toc-section:hover,
.drawer button:hover {
  color: var(--text-primary);
  background: var(--surface-card-hover);
}

.toc-volume.active,
.toc-section.active,
.drawer button.active {
  color: var(--accent);
  background: var(--accent-bg);
}

.mobile-toc-button {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 13px;
  transition: color 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.mobile-toc-button:hover {
  border-color: var(--accent-border);
  color: var(--accent);
}

.mobile-toc-button:active {
  transform: scale(0.96);
}

.passage {
  max-width: 680px;
}

.chapter-crumbs {
  margin-bottom: 8px;
  color: var(--text-placeholder);
  font-size: 12px;
}

.section-title {
  margin: 0 0 24px;
  color: var(--text-primary);
  font-family: var(--serif-font);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.35;
}

.section-body p,
.translation-body {
  margin: 0 0 20px;
  color: var(--text-body);
  font-family: var(--serif-font);
  font-size: 19px;
  line-height: 2;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.chapter-state {
  padding: 20px 0;
  color: var(--text-muted);
  font-size: 14px;
}

.chapter-state.error button {
  margin-left: 8px;
  color: var(--accent);
}

.translation {
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid var(--border-subtle);
}

.translation-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  color: var(--text-faint);
  font-size: 13px;
}

.translation-body {
  margin-top: 14px;
  color: var(--text-muted);
  font-size: 17px;
  line-height: 1.85;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 30px;
  padding-top: 18px;
  border-top: 1px solid var(--border-subtle);
  color: var(--text-placeholder);
  font-size: 13px;
}

.pager button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 9px;
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.pager button:hover:not(:disabled) {
  background: var(--surface-card-hover);
  color: var(--text-primary);
}

.pager button:disabled {
  cursor: not-allowed;
  color: var(--text-placeholder);
  opacity: 0.45;
}

.drawer-root {
  position: fixed;
  inset: 0;
  z-index: 90;
}

.drawer-mask {
  position: absolute;
  inset: 0;
  background: var(--overlay-bg);
}

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  width: min(86vw, 340px);
  flex-direction: column;
  background: var(--surface-bg);
  box-shadow: -16px 0 42px -28px rgba(0, 0, 0, 0.75);
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.drawer-head h2 {
  white-space: nowrap;
}

.drawer-head button {
  padding: 6px;
  border-radius: 8px;
  color: var(--text-faint);
}

.drawer-body {
  flex: 1;
  padding: 14px 16px 28px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.drawer .toc-group + .toc-group {
  margin-top: 14px;
}

.drawer button {
  display: block;
  width: 100%;
  margin-bottom: 3px;
  padding: 9px 10px;
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.45;
  text-align: left;
}

.drawer-section {
  margin-left: 12px;
  font-size: 13px;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 180ms ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .reader {
    padding: 24px 20px 52px;
  }

  .reader-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .toc-sidebar {
    position: static;
    max-height: none;
    overflow: visible;
    border-right: 0;
  }

  .sidebar-top {
    padding-right: 0;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-subtle);
  }

  .sidebar-inner {
    display: none;
  }

  .mobile-toc-button {
    display: inline-flex;
  }

  .book-head {
    padding-bottom: 20px;
    margin-bottom: 24px;
  }

  .section-body p,
  .translation-body {
    font-size: 18px;
    line-height: 1.9;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reader-layout,
  .drawer-root,
  .back-link {
    transition: none;
  }
}
</style>
