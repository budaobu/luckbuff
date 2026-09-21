import { createError } from 'h3'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const WIKI_DIR = resolve(process.cwd(), 'content', 'wiki')
const ENTRIES_DIR = join(WIKI_DIR, 'entries')
const SEO_FILE = join(WIKI_DIR, 'seo.json')
const SUPPORTED_LOCALES = new Set(['zh-CN', 'zh-TW', 'en', 'ja'])

export type WikiLocale = 'zh-CN' | 'zh-TW' | 'en' | 'ja'

export interface WikiEntryMeta {
  sourcePath: string
  sourceUrl: string
  title: string
  description: string
  category: string
  categoryTitle: string
  domain: string
  tags: string[]
  excerpt: string
  seo?: WikiSeo
}

export interface WikiSeo {
  focusKeyword: string
  seoTitle: string
  seoDescription: string
  keywords: string[]
  matchType: 'exact' | 'enriched' | 'fallback'
  measuredAt?: string
}

export interface WikiManifest {
  generated: boolean
  syncedAt: string
  source: string
  integritySource: string
  stats: Record<string, number>
  integrity: {
    checked: boolean
    missingFromLocal: string[]
    missingFromSitemap: string[]
  }
  failures: Array<{ kind: string; source: string; error: string }>
  indexSeo?: WikiSeo
  entries: WikiEntryMeta[]
}

export interface WikiEntryDetail extends WikiEntryMeta {
  content: string
}

interface StoredManifest {
  entries?: unknown
}

interface StoredManifestEntry {
  sourcePath?: unknown
}

interface StoredSeo {
  syncedAt?: unknown
  index?: unknown
  entries?: unknown
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

export function normalizeWikiLocale(value: unknown): WikiLocale {
  const locale = text(value)
  return SUPPORTED_LOCALES.has(locale) ? locale as WikiLocale : 'zh-CN'
}

function localeFileSuffix(locale: WikiLocale): string {
  if (locale === 'zh-CN') return ''
  if (locale === 'zh-TW') return '.zh-tw'
  return `.${locale}`
}

function normalizeSeo(input: unknown): WikiSeo {
  const item = (input || {}) as Record<string, unknown>
  const focusKeyword = text(item.focusKeyword)
  const seoTitle = text(item.seoTitle)
  const seoDescription = text(item.seoDescription)
  const keywords = Array.isArray(item.keywords)
    ? item.keywords.map(keyword => String(keyword).trim()).filter(Boolean)
    : []
  if (!focusKeyword || !seoTitle || !seoDescription || !keywords.length) {
    throw createError({ statusCode: 502, statusMessage: 'Local wiki SEO data is invalid' })
  }

  return {
    focusKeyword,
    seoTitle,
    seoDescription,
    keywords,
    matchType: item.matchType === 'enriched' || item.matchType === 'fallback' ? item.matchType : 'exact',
    measuredAt: text(item.syncedAt || item.measuredAt),
  }
}

function normalizeEntry(input: unknown, seo?: WikiSeo): WikiEntryMeta | null {
  const item = (input || {}) as Record<string, unknown>
  const sourcePath = text(item.sourcePath)
  const title = text(item.title)
  if (!sourcePath.startsWith('/wiki/') || !title) return null

  const normalized: WikiEntryMeta = {
    sourcePath,
    sourceUrl: text(item.sourceUrl),
    title,
    description: text(item.description),
    category: text(item.category),
    categoryTitle: text(item.categoryTitle, '未分类'),
    domain: text(item.domain),
    tags: Array.isArray(item.tags) ? item.tags.map(tag => String(tag)).filter(Boolean) : [],
    excerpt: text(item.excerpt),
  }

  const entrySeo = seo || (item.seo ? normalizeSeo(item.seo) : undefined)
  return entrySeo ? { ...normalized, seo: entrySeo } : normalized
}

async function readWikiSeoFile(locale: WikiLocale): Promise<{ index: WikiSeo; entries: Map<string, WikiSeo> }> {
  const suffix = localeFileSuffix(locale)
  const path = suffix ? join(WIKI_DIR, `seo${suffix}.json`) : SEO_FILE

  let raw: string
  try {
    raw = await readFile(path, 'utf8')
  }
  catch {
    if (suffix) return readWikiSeoFile('zh-CN')
    throw createError({
      statusCode: 503,
      statusMessage: 'Wiki SEO snapshot missing',
      message: 'Run pnpm wiki:seo to generate content/wiki/seo.json.',
    })
  }

  const parsed = JSON.parse(raw) as StoredSeo
  if (!parsed.index || typeof parsed.entries !== 'object' || parsed.entries === null) {
    throw createError({ statusCode: 502, statusMessage: 'Local wiki SEO index is invalid' })
  }

  return {
    index: normalizeSeo(parsed.index),
    entries: new Map(Object.entries(parsed.entries).map(([sourcePath, entry]) => [sourcePath, normalizeSeo(entry)])),
  }
}

const seoCacheHost = globalThis as typeof globalThis & {
  __luckbuffWikiSeo?: Map<WikiLocale, { index: WikiSeo; entries: Map<string, WikiSeo> }>
}

export async function readWikiSeo(locale: WikiLocale = 'zh-CN'): Promise<{ index: WikiSeo; entries: Map<string, WikiSeo> }> {
  const cache = seoCacheHost.__luckbuffWikiSeo ??= new Map()
  const cached = cache.get(locale)
  if (cached) return cached

  const value = await readWikiSeoFile(locale)
  cache.set(locale, value)
  return value
}

function parseEntryFile(raw: string): WikiEntryMeta | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return null
  return normalizeEntry(JSON.parse(match[1]!))
}

async function readLocalizedEntryMeta(sourcePath: string, locale: WikiLocale): Promise<WikiEntryMeta | null> {
  const segments = sourcePath.slice('/wiki/'.length).split('/').filter(Boolean)
  const suffix = localeFileSuffix(locale)
  if (!segments.length || !suffix) return null

  try {
    const raw = await readFile(join(ENTRIES_DIR, `${segments.join('/')}${suffix}.md`), 'utf8')
    const meta = parseEntryFile(raw)
    return meta?.sourcePath === sourcePath ? meta : null
  }
  catch {
    return null
  }
}

export async function readWikiManifest(locale: WikiLocale = 'zh-CN'): Promise<WikiManifest> {
  let raw: string
  try {
    raw = await readFile(join(WIKI_DIR, 'index.json'), 'utf8')
  }
  catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'Wiki snapshot missing',
      message: 'Run pnpm wiki:sync to generate content/wiki/index.json.',
    })
  }

  const parsed = JSON.parse(raw) as StoredManifest
  if (!Array.isArray(parsed.entries)) {
    throw createError({ statusCode: 502, statusMessage: 'Local wiki index is invalid' })
  }

  const seo = await readWikiSeo(locale)
  const entries = await Promise.all(parsed.entries.map(async (entry) => {
    const sourcePath = text((entry as StoredManifestEntry).sourcePath)
    const baseMeta = normalizeEntry(entry, seo.entries.get(sourcePath))
    if (locale === 'zh-CN' || !baseMeta) return baseMeta
    return await readLocalizedEntryMeta(sourcePath, locale) || baseMeta
  }))
  const validEntries = entries.filter((entry): entry is WikiEntryMeta => entry !== null)
  return {
    ...(parsed as Omit<WikiManifest, 'entries'>),
    indexSeo: seo.index,
    entries: validEntries,
  }
}

function decodeSegment(value: string): string {
  try {
    return value.includes('%') ? decodeURIComponent(value) : value
  }
  catch {
    return value
  }
}

export async function readWikiEntry(pathSegments: string[], locale: WikiLocale = 'zh-CN'): Promise<WikiEntryDetail | null> {
  const segments = pathSegments.map(decodeSegment)
  if (!segments.length || segments.some(segment => !segment || segment === '.' || segment === '..' || segment.includes('\0'))) {
    return null
  }

  const sourcePath = `/wiki/${segments.join('/')}`
  const suffix = localeFileSuffix(locale)
  let raw: string
  try {
    raw = await readFile(join(ENTRIES_DIR, `${segments.join('/')}${suffix}.md`), 'utf8')
  }
  catch {
    if (suffix) {
      try {
        raw = await readFile(join(ENTRIES_DIR, `${segments.join('/')}.md`), 'utf8')
      }
      catch {
        return null
      }
    }
    else {
      return null
    }
  }

  const frontmatter = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!frontmatter) return null

  const seo = await readWikiSeo()
  const meta = normalizeEntry(JSON.parse(frontmatter[1]!), seo.entries.get(sourcePath))
  if (!meta || meta.sourcePath !== sourcePath) return null
  return { ...meta, content: frontmatter[2]!.trim() }
}
