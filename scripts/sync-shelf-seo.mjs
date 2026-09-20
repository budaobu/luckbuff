import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const SHELF_DIR = resolve(process.cwd(), 'content', 'shelf')
const OUTPUT_FILE = join(SHELF_DIR, 'seo.json')
const SUGGEST_ENDPOINT = 'https://suggestqueries.google.com/complete/search'
const REQUEST_TIMEOUT_MS = 10_000

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Accept: 'application/json',
}

const READING_INTENT = [
  '原文',
  '白话',
  '白话文',
  '译文',
  '注释',
  '注音',
  '注',
  '校注',
  '点校',
  '评注',
  '详析',
  '详解',
  '解译',
  '图解',
  '解',
]

const UNDELIVERABLE = /(?:pdf|txt|epub|mobi|下载|网盘|百度云)/i

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, '').toLowerCase()
}

function text(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

async function fetchSuggestions(query) {
  const response = await fetch(`${SUGGEST_ENDPOINT}?client=firefox&hl=zh-CN&q=${encodeURIComponent(query)}`, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Google suggest HTTP ${response.status}: ${query}`)
  const raw = await response.text()
  const parsed = JSON.parse(raw)
  const suggestions = Array.isArray(parsed?.[1])
    ? parsed[1].filter(item => typeof item === 'string' && item.trim()).map(item => item.trim())
    : []
  return [...new Set(suggestions)].slice(0, 10)
}

function scoreSuggestion(suggestion, book) {
  const normalizedBook = normalizeText(book.title)
  const normalizedSuggestion = normalizeText(suggestion)
  const suffix = normalizedSuggestion.slice(normalizedBook.length)

  if (!normalizedSuggestion.includes(normalizedBook)) return -1000
  if (UNDELIVERABLE.test(suggestion)) return -500

  let score = 800
  if (normalizedSuggestion === normalizedBook) score += 100
  if (READING_INTENT.some(term => suffix.includes(term))) score += 500

  const topicalTerms = [book.category, book.dynasty, book.author].filter(Boolean).map(term => normalizeText(term))
  if (topicalTerms.some(term => suffix.includes(term))) score += 180
  if (/(?:占卜|排盘|起卦|卦例|命理|风水|六爻|奇门|八字)/.test(suffix)) score += 100
  score -= Math.min(suffix.length * 8, 160)
  return score
}

function chooseSuggestion(book, suggestions) {
  const ranked = suggestions
    .map(suggestion => ({ suggestion, score: scoreSuggestion(suggestion, book) }))
    .filter(item => item.score > 0)
    .sort((left, right) => right.score - left.score || left.suggestion.length - right.suggestion.length)

  if (!ranked.length) {
    return {
      focusKeyword: book.title,
      matchType: 'fallback',
      ranked: [],
    }
  }

  return {
    focusKeyword: ranked[0].suggestion,
    matchType: normalizeText(ranked[0].suggestion) === normalizeText(book.title) ? 'exact' : 'enriched',
    ranked,
  }
}

function uniqueKeywords(values) {
  return [...new Set(values.map(value => text(value)).filter(Boolean))]
}

function truncate(value, max) {
  if (value.length <= max) return value
  const clipped = value.slice(0, max)
  const boundary = Math.max(clipped.lastIndexOf('。'), clipped.lastIndexOf('；'), clipped.lastIndexOf('，'))
  return boundary > max * 0.65 ? clipped.slice(0, boundary + 1) : `${clipped.trimEnd()}…`
}

function buildBookSeo(book, suggestions) {
  const choice = chooseSuggestion(book, suggestions)
  const focusKeyword = choice.focusKeyword
  const focusIsTitle = normalizeText(focusKeyword) === normalizeText(book.title)
  const readingPhrase = focusIsTitle
    ? `${book.title}原文全文在线阅读`
    : `${focusKeyword}｜${book.title}原文在线阅读`
  const attribution = [book.dynasty, text(book.author).replace(/^(旧题|托名|传)/, '')].filter(Boolean).join(' · ')
  const intro = text(book.intro).replace(/\s+/g, ' ').trim()

  const seoTitle = truncate(`${readingPhrase} - ososn古籍书架`, 60)
  const seoDescription = truncate(
    `在线阅读《${book.title}》原文。${intro} 本页提供卷章目录，并围绕「${focusKeyword}」组织古籍内容。`,
    158,
  )
  const keywords = uniqueKeywords([
    focusKeyword,
    book.title,
    `${book.title}原文`,
    `${book.title}白话`,
    `${book.category}古籍`,
    book.dynasty,
    book.author,
    '命理古籍',
  ]).slice(0, 8)

  return {
    focusKeyword,
    matchType: choice.matchType,
    seoTitle,
    seoDescription,
    keywords,
    suggestions: suggestions.slice(0, 10),
    topCandidates: choice.ranked.slice(0, 3).map(item => ({
      keyword: item.suggestion,
      score: item.score,
    })),
  }
}

function buildShelfSeo(suggestionGroups) {
  const focusKeyword = suggestionGroups['命理书籍'][0] || '命理书籍'
  return {
    focusKeyword,
    matchType: focusKeyword === '命理书籍' ? 'exact' : 'enriched',
    seoTitle: '命理书籍与术数古籍书架 - 156部古籍在线阅读',
    seoDescription: '浏览ososn命理书籍与术数古籍书架，在线阅读156部传统典籍。支持按四柱八字、六爻、奇门遁甲、风水、紫微斗数等分类筛选，并按卷章进入原文。',
    keywords: uniqueKeywords([
      focusKeyword,
      '命理古籍',
      '术数古籍',
      '命理书籍',
      '古籍在线阅读',
      '四柱八字古籍',
      '六爻古籍',
      '奇门遁甲古籍',
      '紫微斗数古籍',
    ]).slice(0, 9),
    suggestions: Object.fromEntries(Object.entries(suggestionGroups).map(([query, items]) => [query, items.slice(0, 10)])),
  }
}

async function atomicWriteJson(path, value) {
  const temporary = `${path}.tmp`
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporary, path)
}

const index = JSON.parse(await readFile(join(SHELF_DIR, 'index.json'), 'utf8'))
if (!Array.isArray(index.books) || !index.books.length) throw new Error('content/shelf/index.json is empty')

const shelfQueries = ['命理书籍', '命理 古籍', '术数古籍', '古籍 原文']
const shelfGroups = {}
for (const query of shelfQueries) {
  shelfGroups[query] = await fetchSuggestions(query)
  await new Promise(resolve => setTimeout(resolve, 80))
}

const books = {}
for (const [index_, book] of index.books.entries()) {
  try {
    const suggestions = await fetchSuggestions(book.title)
    books[String(book.id)] = {
      ...buildBookSeo(book, suggestions),
      query: book.title,
    }
  }
  catch (error) {
    throw new Error(`#${book.id} ${book.title}: ${error.message}`)
  }
  if ((index_ + 1) % 20 === 0) console.log(`[shelf-seo] ${index_ + 1}/${index.books.length}`)
  await new Promise(resolve => setTimeout(resolve, 70))
}

const payload = {
  syncedAt: new Date().toISOString(),
  source: {
    name: 'Google Search Suggest',
    client: 'firefox',
    locale: 'zh-CN',
    endpoint: SUGGEST_ENDPOINT,
  },
  shelf: buildShelfSeo(shelfGroups),
  books,
}

await mkdir(SHELF_DIR, { recursive: true })
await atomicWriteJson(OUTPUT_FILE, payload)

const matches = Object.values(books)
console.log(`[shelf-seo] saved ${matches.length} entries -> ${OUTPUT_FILE}`)
console.log(`[shelf-seo] exact=${matches.filter(item => item.matchType === 'exact').length}, enriched=${matches.filter(item => item.matchType === 'enriched').length}, fallback=${matches.filter(item => item.matchType === 'fallback').length}`)
