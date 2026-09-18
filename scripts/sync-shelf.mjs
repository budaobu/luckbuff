import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const UPSTREAM_ORIGIN = 'https://guanxiangzhai.com'
const OUTPUT_DIR = resolve(process.cwd(), 'content', 'shelf')
const BOOKS_DIR = join(OUTPUT_DIR, 'books')
const INDEX_FILE = join(OUTPUT_DIR, 'index.json')
const REQUEST_TIMEOUT_MS = 30_000
const CDP_EVAL_TIMEOUT_MS = 180_000
const CHAPTER_CHUNK_SIZE = 40
const CDP_PROXY = process.env.WEB_ACCESS_CDP_PROXY || 'http://localhost:3456'

const args = new Set(process.argv.slice(2))
const refresh = args.has('--refresh')
const limitArgumentIndex = process.argv.indexOf('--limit')
const limit = limitArgumentIndex > -1
  ? Number.parseInt(process.argv[limitArgumentIndex + 1] || '', 10)
  : Number.POSITIVE_INFINITY

function text(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function integer(value) {
  return typeof value === 'number' && Number.isInteger(value) ? value : null
}

async function atomicWriteJson(path, value) {
  const temporary = `${path}.tmp`
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporary, path)
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await worker(items[index], index)
    }
  })
  await Promise.all(runners)
  return results
}

async function openCdpTab() {
  const response = await fetch(`${CDP_PROXY}/new`, {
    method: 'POST',
    body: UPSTREAM_ORIGIN,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`CDP /new failed with HTTP ${response.status}`)
  const target = await response.json()
  const targetId = target.targetId || target.id
  if (!targetId) throw new Error('CDP did not return a target ID')
  await new Promise(resolve => setTimeout(resolve, 1_500))
  return targetId
}

async function cdpEval(targetId, expression) {
  const response = await fetch(`${CDP_PROXY}/eval?target=${encodeURIComponent(targetId)}`, {
    method: 'POST',
    body: expression,
    signal: AbortSignal.timeout(CDP_EVAL_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`CDP /eval failed with HTTP ${response.status}`)
  const raw = await response.text()
  let result
  try {
    result = JSON.parse(raw)
  }
  catch {
    throw new Error(`CDP eval returned non-JSON (length=${raw.length}, prefix=${raw.slice(0, 60)})`)
  }
  if (typeof result.value !== 'string') {
    throw new Error(`CDP eval malformed result keys=${Object.keys(result).join('|')} type=${typeof result.value} body=${raw.slice(0, 120)}`)
  }
  return JSON.parse(result.value)
}

function bookTocExpression(bookId) {
  return `(async () => {
  const response = await fetch('/reader?id=${bookId}', { headers: { RSC: '1' } })
  if (!response.ok) throw new Error('reader HTTP ' + response.status)
  const payload = await response.text()
  const marker = payload.indexOf('{"book":')
  if (marker < 0) throw new Error('reader payload missing')

  function extract(start) {
    let depth = 0
    let quoted = false
    let escaped = false
    for (let i = start; i < payload.length; i++) {
      const char = payload[i]
      if (quoted) {
        if (escaped) escaped = false
        else if (char === '\\\\') escaped = true
        else if (char === '"') quoted = false
        continue
      }
      if (char === '"') quoted = true
      else if (char === '{') depth += 1
      else if (char === '}') {
        depth -= 1
        if (depth === 0) return payload.slice(start, i + 1)
      }
    }
    throw new Error('unbalanced book JSON')
  }

  const book = JSON.parse(extract(marker)).book
  if (!book || !Array.isArray(book.chapters)) throw new Error('book TOC missing')
  return JSON.stringify({
    id: Number(book.id),
    chapters: book.chapters.map((chapter, index) => ({
      id: String(index),
      title: String(chapter.title || ''),
    })),
  })
})()`
}

function chapterExpression(bookId, chapterIndex, offset) {
  return `(async () => {
  const token = localStorage.getItem('token') || ''
  if (!token) throw new Error('not signed in')
    const chapterResponse = await fetch('/api/books/chapter?book=${bookId}&chapter=' + ${chapterIndex}, {
      headers: { Authorization: 'Bearer ' + token },
    })
    if (!chapterResponse.ok) throw new Error('chapter HTTP ' + chapterResponse.status)
    const chapter = await chapterResponse.json()
    if (!Array.isArray(chapter.sections)) throw new Error('chapter sections missing')
    return JSON.stringify({
      id: String(${chapterIndex}),
      sectionCount: chapter.sections.length,
      offset: ${offset},
      sections: chapter.sections.slice(${offset}, ${offset + CHAPTER_CHUNK_SIZE}).map((section, sectionIndex) => ({
        id: String(sectionIndex),
        head: String(section.head || ''),
        text: String(section.text || ''),
        translation: String(section.translation || '') === '$undefined' ? '' : String(section.translation || ''),
      })),
    })
})()`
}

async function syncBook(book, cdpTargetId) {
  const bookFile = join(BOOKS_DIR, `${book.id}.json`)
  if (!refresh) {
    try {
      const existing = JSON.parse(await readFile(bookFile, 'utf8'))
      if (existing?.book?.id === book.id && Array.isArray(existing.chapters)) {
        return existing
      }
    }
  catch {}
  }

  let toc
  try {
    toc = await cdpEval(cdpTargetId, bookTocExpression(book.id))
  }
  catch (error) {
    throw new Error(`#${book.id} 目录同步失败: ${error.message}`)
  }
  if (toc.id !== book.id || !Array.isArray(toc.chapters) || toc.chapters.length === 0) {
    throw new Error(`#${book.id} 目录无效`)
  }

  const chapters = []
  for (const chapterMeta of toc.chapters) {
    const sections = []
    try {
      let firstChunk
      let offset = 0
      do {
        firstChunk = await cdpEval(
          cdpTargetId,
          chapterExpression(book.id, Number(chapterMeta.id), offset),
        )
        if (!Array.isArray(firstChunk.sections)) throw new Error('章节分片缺失')
        sections.push(...firstChunk.sections)
        offset = firstChunk.offset + firstChunk.sections.length
      } while (offset < firstChunk.sectionCount)

      chapters.push({
        id: chapterMeta.id,
        title: chapterMeta.title,
        sectionCount: firstChunk.sectionCount,
        sections,
      })
    }
    catch (error) {
      throw new Error(`#${book.id} 第 ${Number(chapterMeta.id) + 1} 卷同步失败: ${error.message}`)
    }
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  const syncedAt = new Date().toISOString()
  const stored = {
    syncedAt,
    book: {
      ...book,
      volumeCount: chapters.length,
    },
    chapters,
  }
  await atomicWriteJson(bookFile, stored)
  return stored
}

const response = await fetch(`${UPSTREAM_ORIGIN}/api/books`, {
  signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
})
if (!response.ok) throw new Error(`HTTP ${response.status}: book list`)
const upstreamBooks = await response.json()
if (!Array.isArray(upstreamBooks)) throw new Error('书架列表格式错误')

const books = upstreamBooks.flatMap((item) => {
  const id = integer(item.id)
  if (!id || !text(item.title).trim()) return []
  return [{
    id,
    title: text(item.title).trim(),
    author: text(item.author).trim(),
    dynasty: text(item.dynasty).trim(),
    category: text(item.category).trim(),
    intro: text(item.description).trim(),
    state: text(item.state).trim(),
    sourceUrl: `${UPSTREAM_ORIGIN}/reader?id=${id}`,
  }]
}).slice(0, Number.isFinite(limit) ? limit : undefined)

await mkdir(BOOKS_DIR, { recursive: true })
const cdpTargetId = await openCdpTab()
console.log(`[shelf-sync] syncing ${books.length} books`)
const startedAt = Date.now()
const storedBooks = await mapLimit(books, 1, async (book, index) => {
  const stored = await syncBook(book, cdpTargetId)
  const sectionCount = stored.chapters.reduce((sum, chapter) => sum + chapter.sections.length, 0)
  console.log(`[shelf-sync] ${String(index + 1).padStart(3, '0')}/${books.length} #${book.id} ${book.title} (${stored.chapters.length} 卷 / ${sectionCount} 节)`)
  return {
    ...stored.book,
    chapterCount: stored.chapters.length,
    sectionCount,
  }
})

await fetch(`${CDP_PROXY}/close?target=${encodeURIComponent(cdpTargetId)}`).catch(() => {})

await atomicWriteJson(INDEX_FILE, {
  syncedAt: new Date().toISOString(),
  source: `${UPSTREAM_ORIGIN}/shelf`,
  books: storedBooks,
})
console.log(`[shelf-sync] done in ${Math.round((Date.now() - startedAt) / 1000)}s -> ${OUTPUT_DIR}`)
