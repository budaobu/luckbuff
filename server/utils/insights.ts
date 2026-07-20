import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const INSIGHTS_DIR = resolve(process.cwd(), 'content', 'insights')

export interface InsightFrontmatter {
  title: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  author: string
  readingTime: number
  draft: boolean
  relatedTools: string[]
}

export interface InsightListItem extends InsightFrontmatter {
  slug: string
}

export interface InsightDetail extends InsightListItem {
  content: string
}

// Split a simple inline YAML array: [a, b, "c d"]
function parseInlineArray(value: string): string[] {
  const inner = value.trim().slice(1, -1).trim()
  if (!inner) return []
  return inner
    .split(',')
    .map(s => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
}

function parseScalar(raw: string): string | number | boolean {
  let value = raw.trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+$/.test(value)) return parseInt(value, 10)
  return value
}

export function parseFrontmatter(raw: string): { meta: Record<string, any>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: {}, content: raw }

  const meta: Record<string, any> = {}
  for (const line of match[1]!.split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const rawValue = line.slice(idx + 1)
    if (rawValue.trim().startsWith('[')) {
      meta[key] = parseInlineArray(rawValue.trim())
    } else {
      meta[key] = parseScalar(rawValue)
    }
  }
  return { meta, content: match[2]!.trim() }
}

export function resolveLangSuffix(lang: string): string {
  if (lang === 'en') return 'en'
  if (lang === 'zh-TW') return 'zh-tw'
  return ''
}

function toInsight(slug: string, meta: Record<string, any>): InsightListItem {
  return {
    slug,
    title: meta.title || slug,
    description: meta.description || '',
    category: meta.category || '',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    publishedAt: meta.publishedAt || '',
    updatedAt: meta.updatedAt || '',
    author: meta.author || '',
    readingTime: typeof meta.readingTime === 'number' ? meta.readingTime : 0,
    draft: meta.draft === true,
    relatedTools: Array.isArray(meta.relatedTools) ? meta.relatedTools : [],
  }
}

export function listInsightSlugs(): string[] {
  if (!existsSync(INSIGHTS_DIR)) return []
  const slugs: string[] = []
  for (const file of readdirSync(INSIGHTS_DIR)) {
    if (!file.endsWith('.md')) continue
    // Skip locale-suffixed files (e.g. .en.md, .zh-tw.md)
    if (/\.\w{2}(-\w{2})?\.md$/.test(file)) continue
    slugs.push(file.replace(/\.md$/, ''))
  }
  return slugs
}

export function readInsight(slug: string, lang: string): InsightDetail | null {
  const langSuffix = resolveLangSuffix(lang)
  let filePath = join(INSIGHTS_DIR, langSuffix ? `${slug}.${langSuffix}.md` : `${slug}.md`)

  // Fall back to the default (Simplified Chinese) version
  if (!existsSync(filePath)) {
    filePath = join(INSIGHTS_DIR, `${slug}.md`)
    if (!existsSync(filePath)) return null
  }

  const raw = readFileSync(filePath, 'utf-8')
  const { meta, content } = parseFrontmatter(raw)
  return { ...toInsight(slug, meta), content }
}
