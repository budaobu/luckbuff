import { useRuntimeConfig } from '#imports'
import { callAIJson } from '~~/server/utils/ai/client'
import {
  readInsightRaw,
  writeInsightTranslation,
  syncTranslationMeta,
  type InsightWriteInput,
  type TranslationLang,
} from '~~/server/utils/insights'
import { computeSourceHash } from '~~/server/utils/insights/hash'
import { glossaryPromptBlock } from '~~/server/utils/insights/glossary'
import { patchTranslationState } from '~~/server/utils/insights/translation-state'

// Per-slug mutex so rapid double-saves can't run two translations concurrently
const inflight = new Map<string, Promise<void>>()

export interface TranslationRunResult {
  zhTw: 'generated' | 'synced-meta' | 'locked-skipped' | 'unchanged'
  en: 'queued' | 'synced-meta' | 'locked-skipped' | 'unchanged'
}

// Entry point after the zh-CN source file has been written.
// zh-TW runs synchronously (OpenCC is instant); en fires async (AI call).
export function runTranslationPipeline(source: InsightWriteInput): TranslationRunResult {
  const hash = computeSourceHash(source)

  const zhTw = applyZhTw(source, hash)
  const en = applyEn(source, hash)

  return { zhTw, en }
}

// ── zh-TW: OpenCC conversion ──

// Article prose uses cn→tw (script conversion only). The wuge stroke code uses
// twp because stroke counting needs Taiwan glyph variants; for reading text,
// twp's vocabulary shifts (软件→軟體) would be wrong for a mainland-voiced blog.
let openccConverter: ((text: string) => string) | null = null

async function getConverter(): Promise<(text: string) => string> {
  if (openccConverter) return openccConverter
  const OpenCC = await import('opencc-js')
  openccConverter = OpenCC.Converter({ from: 'cn', to: 'tw' })
  return openccConverter
}

function applyZhTw(source: InsightWriteInput, hash: string): TranslationRunResult['zhTw'] {
  const existing = readInsightRaw(source.slug, 'zh-tw')

  if (existing?.locked) {
    syncTranslationMeta(source.slug, 'zh-tw', source)
    if (existing.translated_from !== hash) {
      patchTranslationState(source.slug, 'zh-tw', { status: 'locked-stale', hash: existing.translated_from ?? null })
    }
    return 'locked-skipped'
  }

  if (existing && existing.translated_from === hash) {
    syncTranslationMeta(source.slug, 'zh-tw', source)
    patchTranslationState(source.slug, 'zh-tw', { status: 'done', hash, error: null })
    return 'unchanged'
  }

  patchTranslationState(source.slug, 'zh-tw', { status: 'translating', hash })
  void convertZhTw(source, hash).catch((err) => {
    patchTranslationState(source.slug, 'zh-tw', {
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
    })
  })
  return 'generated'
}

async function convertZhTw(source: InsightWriteInput, hash: string): Promise<void> {
  const convert = await getConverter()
  const existing = readInsightRaw(source.slug, 'zh-tw')
  writeInsightTranslation({
    slug: source.slug,
    lang: 'zh-tw',
    title: convert(source.title),
    description: convert(source.description),
    category: source.category,
    tags: source.tags.map(t => convert(t)),
    publishedAt: source.publishedAt,
    updatedAt: new Date().toISOString(),
    author: convert(source.author),
    readingTime: source.readingTime,
    draft: source.draft,
    relatedTools: source.relatedTools,
    content: convert(source.content),
    translated_from: hash,
    generator: 'opencc',
    extraMeta: existing?.extraMeta,
  })
  patchTranslationState(source.slug, 'zh-tw', { status: 'done', hash, error: null })
}

// ── en: AI translation ──

const TRANSLATE_SYSTEM = `你是「命见」(MingJian Insights) 栏目的专职译者，把简体中文命理/风水/术数类文章翻译成英文。

要求：
1. 输出且仅输出一个 JSON 对象，格式：{"title": "...", "description": "...", "tags": ["..."], "content": "..."}。不要输出任何其他文字、不要用 markdown 代码围栏包裹。
2. content 完整保留原文的 Markdown 结构：标题层级、列表、引用、分隔线、图片语法、链接 URL 一律不动，只翻译文字。绝对不要增删图片或改动链接地址。
3. description 是 SEO 摘要，不超过 160 个英文字符，自然流畅，不逐字直译。
4. tags 翻译成英文 SEO 关键词，数量与原文一致。
5. 专有名词严格使用下表译法，不得自创：
${glossaryPromptBlock()}
6. 表中未覆盖的命理术语，首次出现用「拼音 (English gloss)」形式，例如 He Tu (River Chart)。
7. 语体：专业但可读，面向对中华命理感兴趣的英语读者；中文标点全部转为英文标点；人名、地名用拼音。`

interface TranslatedArticle {
  title: string
  description: string
  tags: string[]
  content: string
}

function extractMarkdownAssets(md: string): { images: number; links: string[] } {
  const images = (md.match(/!\[[^\]]*\]\([^)]*\)/g) || []).length
  const links = [...md.matchAll(/(?<!!)\[[^\]]*\]\(([^)]*)\)/g)].map(m => m[1]!)
  return { images, links: links.sort() }
}

function validateTranslatedStructure(sourceContent: string, translated: TranslatedArticle): string | null {
  if (!translated.title?.trim()) return 'AI 返回的 title 为空'
  if (!translated.description?.trim()) return 'AI 返回的 description 为空'
  if (!translated.content?.trim()) return 'AI 返回的 content 为空'
  if (!Array.isArray(translated.tags)) return 'AI 返回的 tags 不是数组'
  const src = extractMarkdownAssets(sourceContent)
  const out = extractMarkdownAssets(translated.content)
  if (out.images !== src.images) {
    return `图片数量不一致：源文 ${src.images} 张，译文 ${out.images} 张`
  }
  if (JSON.stringify(out.links) !== JSON.stringify(src.links)) {
    return '链接地址与源文不一致'
  }
  return null
}

function parseTranslatedArticle(raw: unknown): TranslatedArticle {
  if (!raw || typeof raw !== 'object') throw new Error('AI 返回不是对象')
  const obj = raw as Record<string, unknown>
  return {
    title: String(obj.title ?? ''),
    description: String(obj.description ?? ''),
    tags: Array.isArray(obj.tags) ? obj.tags.map(t => String(t)) : [],
    content: String(obj.content ?? ''),
  }
}

async function translateEn(slug: string, force = false): Promise<void> {
  const source = readInsightRaw(slug, 'zh-CN')
  if (!source) {
    patchTranslationState(slug, 'en', { status: 'failed', error: '源文章不存在' })
    return
  }
  const hash = computeSourceHash(source)
  const config = useRuntimeConfig()

  const user = `title: ${source.title}
description: ${source.description}
tags: ${JSON.stringify(source.tags)}
content:
${source.content}`

  const maxTokens = Math.min(32768, Math.max(4096, Math.ceil(source.content.length * 1.2)))

  try {
    const raw = await callAIJson(TRANSLATE_SYSTEM, user, { timeoutMs: 120000, maxTokens })
    const translated = parseTranslatedArticle(raw)
    const structuralError = validateTranslatedStructure(source.content, translated)
    if (structuralError) {
      patchTranslationState(slug, 'en', { status: 'failed', error: structuralError })
      return
    }

    const existing = readInsightRaw(slug, 'en')
    // Guard against a manual edit landing while the AI call was in flight.
    // force=true comes from the admin's explicit regenerate action, which is
    // confirmed in the UI as "discard manual edits".
    if (existing?.locked && !force) {
      patchTranslationState(slug, 'en', { status: 'locked-stale', hash: existing.translated_from ?? null })
      return
    }

    writeInsightTranslation({
      slug,
      lang: 'en',
      title: translated.title.trim(),
      description: translated.description.trim(),
      category: source.category,
      tags: translated.tags.map(t => t.trim()).filter(Boolean),
      publishedAt: source.publishedAt,
      updatedAt: new Date().toISOString(),
      author: 'Hermit Humor',
      readingTime: source.readingTime,
      draft: source.draft,
      relatedTools: source.relatedTools,
      content: translated.content.trim(),
      translated_from: hash,
      generator: `ai:${String(config.aiProvider || 'openai')}/${String(config.aiModel || '')}`,
      extraMeta: existing?.extraMeta,
    })
    patchTranslationState(slug, 'en', { status: 'done', hash, error: null })
  } catch (err) {
    patchTranslationState(slug, 'en', {
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

export function queueEnTranslation(slug: string, force = false): void {
  if (inflight.has(`en:${slug}`)) return
  const promise = translateEn(slug, force)
    .catch((err) => {
      patchTranslationState(slug, 'en', {
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      })
    })
    .finally(() => { inflight.delete(`en:${slug}`) })
  inflight.set(`en:${slug}`, promise)
}

function applyEn(source: InsightWriteInput, hash: string): TranslationRunResult['en'] {
  const existing = readInsightRaw(source.slug, 'en')

  if (existing?.locked) {
    syncTranslationMeta(source.slug, 'en', source)
    if (existing.translated_from !== hash) {
      patchTranslationState(source.slug, 'en', { status: 'locked-stale', hash: existing.translated_from ?? null })
    }
    return 'locked-skipped'
  }

  if (existing && existing.translated_from === hash) {
    syncTranslationMeta(source.slug, 'en', source)
    patchTranslationState(source.slug, 'en', { status: 'done', hash, error: null })
    return 'unchanged'
  }

  patchTranslationState(source.slug, 'en', { status: 'translating', hash, error: null })
  queueEnTranslation(source.slug)
  return 'queued'
}

// Manual regenerate from admin: force one language regardless of hash match,
// honoring the mutex so a queued auto-translation isn't duplicated.
export async function regenerateTranslation(slug: string, lang: TranslationLang, opts: { force?: boolean } = {}): Promise<void> {
  const source = readInsightRaw(slug, 'zh-CN')
  if (!source) throw new Error('源文章不存在')
  const hash = computeSourceHash(source)
  const input: InsightWriteInput = {
    slug,
    title: source.title,
    description: source.description,
    category: source.category,
    tags: source.tags,
    publishedAt: source.publishedAt,
    updatedAt: source.updatedAt,
    author: source.author,
    readingTime: source.readingTime,
    draft: source.draft,
    relatedTools: source.relatedTools,
    content: source.content,
  }

  if (lang === 'zh-tw') {
    patchTranslationState(slug, 'zh-tw', { status: 'translating', hash })
    await convertZhTw(input, hash)
    return
  }
  patchTranslationState(slug, 'en', { status: 'translating', hash, error: null })
  queueEnTranslation(slug, opts.force === true)
}
