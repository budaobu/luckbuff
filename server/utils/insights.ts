import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, copyFileSync, unlinkSync, renameSync } from 'node:fs'
import { resolve, join, basename, extname } from 'node:path'

const INSIGHTS_DIR = resolve(process.cwd(), 'content', 'insights')
const BACKUPS_DIR = join(INSIGHTS_DIR, '.backups')

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

// Extra keys carried by translation files ({slug}.en.md / {slug}.zh-tw.md)
export interface TranslationMeta {
  translated_from?: string
  translated_at?: string
  locked?: boolean
  generator?: string
}

export interface InsightListItem extends InsightFrontmatter {
  slug: string
}

export interface InsightDetail extends InsightListItem {
  content: string
}

// Full-fidelity read result for admin/translation pipelines — keeps translation
// meta and any unknown frontmatter keys so writes don't silently drop them
export interface InsightRaw extends InsightDetail, TranslationMeta {
  extraMeta: Record<string, unknown>
}

export const TRANSLATION_META_KEYS = ['translated_from', 'translated_at', 'locked', 'generator'] as const

const KNOWN_META_KEYS = new Set<string>([
  'title', 'description', 'category', 'tags', 'publishedAt', 'updatedAt',
  'author', 'readingTime', 'draft', 'relatedTools', ...TRANSLATION_META_KEYS,
])

export const INSIGHT_CATEGORIES = ['metaphysics-basics', 'deep-reading', 'fengshui', 'astrology', 'culture'] as const

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,99}$/

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug)
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

// Quote a value only when YAML would misread it as a non-string scalar
function yamlString(value: string): string {
  if (/[:#\[\]{}"']/.test(value) || /^(true|false|null|yes|no|on|off)$/i.test(value) || /^-?[\d.]/.test(value) || value !== value.trim()) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return value
}

function yamlInlineArray(values: string[]): string {
  return `[${values.map(yamlString).join(', ')}]`
}

export function serializeFrontmatter(meta: InsightFrontmatter & TranslationMeta, content: string, extraMeta?: Record<string, unknown>): string {
  const lines = [
    '---',
    `title: ${yamlString(meta.title)}`,
    `description: ${yamlString(meta.description)}`,
    `category: ${meta.category}`,
    `tags: ${yamlInlineArray(meta.tags)}`,
    `publishedAt: ${meta.publishedAt}`,
    `updatedAt: ${meta.updatedAt}`,
    `author: ${yamlString(meta.author)}`,
    `readingTime: ${meta.readingTime}`,
    `draft: ${meta.draft}`,
  ]
  if (meta.relatedTools.length) {
    lines.push(`relatedTools: ${yamlInlineArray(meta.relatedTools)}`)
  }
  if (meta.translated_from) lines.push(`translated_from: ${yamlString(meta.translated_from)}`)
  if (meta.translated_at) lines.push(`translated_at: ${yamlString(meta.translated_at)}`)
  if (meta.locked) lines.push('locked: true')
  if (meta.generator) lines.push(`generator: ${yamlString(meta.generator)}`)
  if (extraMeta) {
    for (const [key, value] of Object.entries(extraMeta)) {
      if (KNOWN_META_KEYS.has(key)) continue
      lines.push(`${key}: ${serializeYamlValue(value)}`)
    }
  }
  lines.push('---', '')
  return lines.join('\n') + content.trim() + '\n'
}

function serializeYamlValue(value: unknown): string {
  if (Array.isArray(value)) return yamlInlineArray(value.map(v => String(v)))
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  return yamlString(String(value ?? ''))
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

// Never let a single malformed file take the whole list down
export function readInsightSafe(slug: string, lang: string): InsightDetail | null {
  try {
    return readInsight(slug, lang)
  } catch (err) {
    console.error(`[insights] failed to read ${slug}.md:`, err)
    return null
  }
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

// ── Admin write operations (default-locale files only) ──

export type TranslationLang = 'en' | 'zh-tw'

export const TRANSLATION_LANGS: TranslationLang[] = ['zh-tw', 'en']

export function translationFilePath(slug: string, lang: TranslationLang): string {
  return join(INSIGHTS_DIR, `${slug}.${lang}.md`)
}

export function hasTranslationFile(slug: string, lang: TranslationLang): boolean {
  return existsSync(translationFilePath(slug, lang))
}

// Strict read of one exact file — no locale fallback. Used by admin & pipelines.
export function readInsightRaw(slug: string, lang: 'zh-CN' | TranslationLang): InsightRaw | null {
  const filePath = lang === 'zh-CN'
    ? join(INSIGHTS_DIR, `${slug}.md`)
    : translationFilePath(slug, lang as TranslationLang)
  if (!existsSync(filePath)) return null
  const raw = readFileSync(filePath, 'utf-8')
  const { meta, content } = parseFrontmatter(raw)
  const extraMeta: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(meta)) {
    if (!KNOWN_META_KEYS.has(key)) extraMeta[key] = value
  }
  return {
    ...toInsight(slug, meta),
    content,
    translated_from: typeof meta.translated_from === 'string' ? meta.translated_from : undefined,
    translated_at: typeof meta.translated_at === 'string' ? meta.translated_at : undefined,
    locked: meta.locked === true,
    generator: typeof meta.generator === 'string' ? meta.generator : undefined,
    extraMeta,
  }
}

export interface TranslationWriteInput {
  slug: string
  lang: TranslationLang
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
  content: string
  translated_from: string
  generator: string
  locked?: boolean
  extraMeta?: Record<string, unknown>
}

export function writeInsightTranslation(input: TranslationWriteInput): void {
  const filePath = translationFilePath(input.slug, input.lang)
  if (existsSync(filePath)) backupInsightFile(filePath, `${input.slug}.${input.lang}`)
  mkdirSync(INSIGHTS_DIR, { recursive: true })
  const { slug: _s, lang: _l, extraMeta, locked, ...rest } = input
  const meta: InsightFrontmatter & TranslationMeta = {
    ...rest,
    locked: locked === true,
    translated_at: new Date().toISOString(),
  }
  const tmpPath = `${filePath}.tmp-${process.pid}`
  writeFileSync(tmpPath, serializeFrontmatter(meta, input.content, extraMeta), 'utf-8')
  renameSync(tmpPath, filePath)
}

// Sync metadata-only fields into a translation file without touching its
// translated content (publishedAt / draft / readingTime / relatedTools / category)
export function syncTranslationMeta(slug: string, lang: TranslationLang, source: InsightWriteInput): void {
  const existing = readInsightRaw(slug, lang)
  if (!existing) return
  const meta: InsightFrontmatter & TranslationMeta = {
    title: existing.title,
    description: existing.description,
    category: source.category,
    tags: existing.tags,
    publishedAt: source.publishedAt,
    updatedAt: new Date().toISOString(),
    author: existing.author,
    readingTime: source.readingTime,
    draft: source.draft,
    relatedTools: source.relatedTools,
    translated_from: existing.translated_from,
    locked: existing.locked,
    generator: existing.generator,
  }
  const filePath = translationFilePath(slug, lang)
  backupInsightFile(filePath, `${slug}.${lang}`)
  const tmpPath = `${filePath}.tmp-${process.pid}`
  writeFileSync(tmpPath, serializeFrontmatter(meta, existing.content, existing.extraMeta), 'utf-8')
  renameSync(tmpPath, filePath)
}

export function validateTranslationInput(input: Partial<TranslationWriteInput>): string | null {
  if (!input.title?.trim()) return '标题不能为空'
  if (!input.description?.trim()) return '摘要不能为空'
  if (!input.content?.trim()) return '正文不能为空'
  if (input.lang !== 'en' && input.lang !== 'zh-tw') return '不支持的语言'
  return null
}

export interface InsightWriteInput {
  slug: string
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
  content: string
}

export function validateInsightInput(input: Partial<InsightWriteInput>, isNew: boolean): string | null {
  if (isNew && (!input.slug || !isValidSlug(input.slug))) {
    return 'slug 只能包含小写字母、数字和连字符，且以字母或数字开头'
  }
  if (!input.title?.trim()) return '标题不能为空'
  if (!input.description?.trim()) return '摘要不能为空'
  if (!input.category || !(INSIGHT_CATEGORIES as readonly string[]).includes(input.category)) {
    return `分类必须是以下之一：${INSIGHT_CATEGORIES.join(' / ')}`
  }
  if (!input.publishedAt || Number.isNaN(new Date(input.publishedAt).getTime())) {
    return '发布日期格式不正确'
  }
  if (!input.content?.trim()) return '正文不能为空'
  return null
}

export function writeInsight(input: InsightWriteInput, opts: { isNew: boolean }): void {
  const filePath = join(INSIGHTS_DIR, `${input.slug}.md`)
  if (opts.isNew && existsSync(filePath)) {
    throw new Error(`已存在同名文章：${input.slug}`)
  }
  if (!opts.isNew && existsSync(filePath)) {
    backupInsight(input.slug)
  }
  mkdirSync(INSIGHTS_DIR, { recursive: true })
  const { content: _content, ...meta } = input
  const tmpPath = `${filePath}.tmp-${process.pid}`
  writeFileSync(tmpPath, serializeFrontmatter(meta, input.content), 'utf-8')
  renameSync(tmpPath, filePath)
}

export function deleteInsight(slug: string): boolean {
  const filePath = join(INSIGHTS_DIR, `${slug}.md`)
  if (!existsSync(filePath)) return false
  backupInsight(slug)
  unlinkSync(filePath)
  for (const lang of TRANSLATION_LANGS) {
    const tPath = translationFilePath(slug, lang)
    if (existsSync(tPath)) {
      backupInsightFile(tPath, `${slug}.${lang}`)
      unlinkSync(tPath)
    }
  }
  return true
}

function backupInsight(slug: string): void {
  mkdirSync(BACKUPS_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  copyFileSync(join(INSIGHTS_DIR, `${slug}.md`), join(BACKUPS_DIR, `${slug}.${stamp}.md`))
}

// Same as backupInsight but for an arbitrary insights file (translations, etc.)
function backupInsightFile(filePath: string, backupPrefix: string): void {
  mkdirSync(BACKUPS_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  copyFileSync(filePath, join(BACKUPS_DIR, `${backupPrefix}.${stamp}.md`))
}

export interface InsightBackup {
  file: string
  timestamp: string
}

export function listInsightBackups(slug: string): InsightBackup[] {
  if (!existsSync(BACKUPS_DIR)) return []
  const prefix = `${slug}.`
  return readdirSync(BACKUPS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .map(f => ({ file: f, timestamp: f.slice(prefix.length, -3).replace(/-/g, m => m) }))
    .map(b => ({ file: b.file, timestamp: b.file.slice(prefix.length, -3) }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function restoreInsightBackup(slug: string, backupFile: string): void {
  // backupFile must be a plain file name belonging to this slug — no path segments
  if (backupFile !== basename(backupFile) || !backupFile.startsWith(`${slug}.`) || !backupFile.endsWith('.md')) {
    throw new Error('非法的备份文件名')
  }
  const backupPath = join(BACKUPS_DIR, backupFile)
  if (!existsSync(backupPath)) throw new Error('备份不存在')
  const filePath = join(INSIGHTS_DIR, `${slug}.md`)
  if (existsSync(filePath)) backupInsight(slug)
  copyFileSync(backupPath, filePath)
}

export const INSIGHTS_IMAGES_DIR = resolve(process.cwd(), 'public', 'images', 'insights')

const ALLOWED_IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])

export function saveInsightImage(originalName: string, data: Buffer): string {
  const ext = extname(originalName).toLowerCase()
  if (!ALLOWED_IMAGE_EXTS.has(ext)) {
    throw new Error(`不支持的图片格式：${ext || '(无扩展名)'}，仅支持 png / jpg / webp / gif`)
  }
  if (data.length > 5 * 1024 * 1024) {
    throw new Error('图片不能超过 5MB')
  }
  mkdirSync(INSIGHTS_IMAGES_DIR, { recursive: true })
  const base = basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'image'
  let fileName = `${base}${ext}`
  let n = 1
  while (existsSync(join(INSIGHTS_IMAGES_DIR, fileName))) {
    fileName = `${base}-${n++}${ext}`
  }
  writeFileSync(join(INSIGHTS_IMAGES_DIR, fileName), data)
  return `/images/insights/${fileName}`
}
