import { createError } from 'h3'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const SHELF_DIR = resolve(process.cwd(), 'content', 'shelf')
const INDEX_FILE = join(SHELF_DIR, 'index.json')
const BOOKS_DIR = join(SHELF_DIR, 'books')
const SEO_FILE = join(SHELF_DIR, 'seo.json')

export interface ShelfBook {
  id: number
  title: string
  author: string
  dynasty: string
  category: string
  intro: string
  volumeCount: number
  state: string
  sourceUrl: string
}

export interface ShelfSection {
  id: string
  head: string
  text: string
  translation: string
}

export interface ShelfChapter {
  id: string
  title: string
  sectionCount: number
}

export interface ShelfBookDetail {
  book: ShelfBook
  chapters: ShelfChapter[]
  chapterIndex: number
  sectionIndex: number
  sections: ShelfSection[]
  seo: ShelfSeoEntry
}

export interface ShelfSeoEntry {
  focusKeyword: string
  seoTitle: string
  seoDescription: string
  keywords: string[]
  matchType: 'exact' | 'enriched' | 'fallback'
}

interface StoredIndex {
  books?: unknown
}

interface StoredSection {
  id?: unknown
  head?: unknown
  text?: unknown
  translation?: unknown
}

interface StoredChapter {
  id?: unknown
  title?: unknown
  sectionCount?: unknown
  sections?: unknown
}

interface StoredBook {
  syncedAt?: unknown
  book?: unknown
  chapters?: unknown
}

interface StoredSeoEntry {
  focusKeyword?: unknown
  seoTitle?: unknown
  seoDescription?: unknown
  keywords?: unknown
  matchType?: unknown
}

interface StoredSeoIndex {
  shelf?: unknown
  books?: unknown
}

interface StoredBookInternal {
  syncedAt: string
  book: ShelfBook
  chapters: Array<{
    id: string
    title: string
    sectionCount: number
    sections: ShelfSection[]
  }>
}

interface ShelfSeoIndexInternal {
  shelf: ShelfSeoEntry
  books: Map<number, ShelfSeoEntry>
}

const indexCacheHost = globalThis as typeof globalThis & {
  __luckbuffShelfIndex?: { value: ShelfBook[] }
}

const bookCacheHost = globalThis as typeof globalThis & {
  __luckbuffShelfBooks?: Map<number, { value: StoredBookInternal }>
}

const seoCacheHost = globalThis as typeof globalThis & {
  __luckbuffShelfSeo?: { value: ShelfSeoIndexInternal }
}

function invalidShelfData(message: string) {
  return createError({ statusCode: 502, statusMessage: message })
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function integer(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) ? value : null
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function normalizeSeoEntry(input: unknown): ShelfSeoEntry {
  const item = (input || {}) as StoredSeoEntry
  const focusKeyword = text(item.focusKeyword)
  const seoTitle = text(item.seoTitle)
  const seoDescription = text(item.seoDescription)
  const keywords = stringArray(item.keywords)
  if (!focusKeyword || !seoTitle || !seoDescription || !keywords.length) {
    throw invalidShelfData('本地书架 SEO 数据格式错误')
  }

  return {
    focusKeyword,
    seoTitle,
    seoDescription,
    keywords,
    matchType: item.matchType === 'enriched' || item.matchType === 'fallback' ? item.matchType : 'exact',
  }
}

function normalizeBook(input: unknown): ShelfBook {
  const item = (input || {}) as Record<string, unknown>
  const id = integer(item.id)
  const title = text(item.title).trim()
  if (!id || !title) throw invalidShelfData('本地书架数据格式错误')

  return {
    id,
    title,
    author: text(item.author).trim(),
    dynasty: text(item.dynasty).trim(),
    category: text(item.category).trim(),
    intro: text(item.intro).trim(),
    volumeCount: integer(item.volumeCount) ?? integer(item.chapterCount) ?? 0,
    state: text(item.state).trim(),
    sourceUrl: text(item.sourceUrl, `https://guanxiangzhai.com/reader?id=${id}`),
  }
}

function normalizeStoredBook(input: unknown): StoredBookInternal {
  const item = (input || {}) as StoredBook
  const book = normalizeBook(item.book)
  if (!Array.isArray(item.chapters)) throw invalidShelfData('本地书籍目录缺失')

  const chapters = item.chapters.map((chapterInput, chapterIndex): StoredBookInternal['chapters'][number] => {
    const chapter = (chapterInput || {}) as StoredChapter
    if (!Array.isArray(chapter.sections)) throw invalidShelfData('本地章节内容缺失')
    const sections = chapter.sections.map((sectionInput, sectionIndex) => {
      const section = (sectionInput || {}) as StoredSection
      return {
        id: text(section.id, String(sectionIndex)),
        head: text(section.head),
        text: text(section.text),
        translation: text(section.translation),
      }
    })

    return {
      id: text(chapter.id, String(chapterIndex)),
      title: text(chapter.title).trim(),
      sectionCount: integer(chapter.sectionCount) ?? sections.length,
      sections,
    }
  })

  return {
    syncedAt: text(item.syncedAt),
    book: { ...book, volumeCount: chapters.length },
    chapters,
  }
}

export async function fetchShelfBooks(): Promise<ShelfBook[]> {
  if (indexCacheHost.__luckbuffShelfIndex) {
    return indexCacheHost.__luckbuffShelfIndex.value
  }

  let raw: string
  try {
    raw = await readFile(INDEX_FILE, 'utf8')
  }
  catch {
    throw createError({
      statusCode: 503,
      statusMessage: '书架快照缺失',
      message: '请先执行 pnpm shelf:sync 生成 content/shelf/index.json。',
    })
  }

  const parsed = JSON.parse(raw) as StoredIndex
  if (!Array.isArray(parsed.books)) throw invalidShelfData('本地书架索引格式错误')
  const books = parsed.books.map(normalizeBook)
  indexCacheHost.__luckbuffShelfIndex = { value: books }
  return books
}

export async function fetchShelfSeo(): Promise<ShelfSeoIndexInternal> {
  if (seoCacheHost.__luckbuffShelfSeo) {
    return seoCacheHost.__luckbuffShelfSeo.value
  }

  let raw: string
  try {
    raw = await readFile(SEO_FILE, 'utf8')
  }
  catch {
    throw createError({
      statusCode: 503,
      statusMessage: '书架 SEO 快照缺失',
      message: '请先执行 pnpm shelf:seo 生成 content/shelf/seo.json。',
    })
  }

  const parsed = JSON.parse(raw) as StoredSeoIndex
  if (!parsed.shelf || !parsed.books || typeof parsed.books !== 'object') {
    throw invalidShelfData('本地书架 SEO 索引格式错误')
  }

  const seo = {
    shelf: normalizeSeoEntry(parsed.shelf),
    books: new Map(Object.entries(parsed.books).map(([key, entry]) => {
      const bookId = Number.parseInt(key, 10)
      if (!Number.isInteger(bookId) || bookId <= 0) throw invalidShelfData('本地书架 SEO ID 无效')
      return [bookId, normalizeSeoEntry(entry)]
    })),
  }
  seoCacheHost.__luckbuffShelfSeo = { value: seo }
  return seo
}

export async function fetchShelfSeoEntry(bookId: number): Promise<ShelfSeoEntry> {
  const seo = await fetchShelfSeo()
  const entry = seo.books.get(bookId)
  if (!entry) throw invalidShelfData(`书籍 SEO 数据缺失：${bookId}`)
  return entry
}

async function loadStoredBook(bookId: number): Promise<StoredBookInternal> {
  const cache = bookCacheHost.__luckbuffShelfBooks ??= new Map()
  const cached = cache.get(bookId)
  if (cached) return cached.value

  let raw: string
  try {
    raw = await readFile(join(BOOKS_DIR, `${bookId}.json`), 'utf8')
  }
  catch {
    throw createError({ statusCode: 404, statusMessage: '书籍不存在' })
  }

  const stored = normalizeStoredBook(JSON.parse(raw))
  if (stored.book.id !== bookId) throw invalidShelfData('本地书籍 ID 不一致')
  cache.set(bookId, { value: stored })
  return stored
}

export async function fetchShelfBook(
  bookId: number,
  requestedChapterIndex = 0,
  requestedSectionIndex = 0,
): Promise<ShelfBookDetail> {
  const stored = await loadStoredBook(bookId)
  const chapterIndex = Math.min(Math.max(requestedChapterIndex, 0), Math.max(stored.chapters.length - 1, 0))
  const chapter = stored.chapters[chapterIndex]
  if (!chapter) throw createError({ statusCode: 404, statusMessage: '章节不存在' })

  const sectionIndex = Math.min(Math.max(requestedSectionIndex, 0), Math.max(chapter.sections.length - 1, 0))
  return {
    book: stored.book,
    chapters: stored.chapters.map(item => ({
      id: item.id,
      title: item.title,
      sectionCount: item.sectionCount,
    })),
    chapterIndex,
    sectionIndex,
    sections: chapter.sections,
    seo: await fetchShelfSeoEntry(bookId),
  }
}

export async function fetchShelfChapter(bookId: number, chapterIndex: number): Promise<ShelfSection[]> {
  const stored = await loadStoredBook(bookId)
  const chapter = stored.chapters[chapterIndex]
  if (!chapter) throw createError({ statusCode: 404, statusMessage: '章节不存在' })
  return chapter.sections
}
