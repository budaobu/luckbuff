import {
  isValidSlug,
  readInsightRaw,
  writeInsightTranslation,
  validateTranslationInput,
  type TranslationLang,
} from '~~/server/utils/insights'
import { computeSourceHash } from '~~/server/utils/insights/hash'
import { getTranslationOverview, patchTranslationState } from '~~/server/utils/insights/translation-state'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

// Manual edit of a translation. Saving locks the version so later source
// changes never silently overwrite human wording.
export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  const slug = getRouterParam(event, 'slug') || ''
  if (!isValidSlug(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const lang = getRouterParam(event, 'lang') as TranslationLang
  if (lang !== 'en' && lang !== 'zh-tw') {
    throw createError({ statusCode: 400, statusMessage: '不支持的语言' })
  }

  const source = readInsightRaw(slug, 'zh-CN')
  if (!source) throw createError({ statusCode: 404, statusMessage: '源文章不存在' })

  const existing = readInsightRaw(slug, lang)
  if (!existing) throw createError({ statusCode: 404, statusMessage: '该语言版本不存在，请先生成' })

  const body = await readBody<Record<string, unknown>>(event)
  const input = {
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    tags: Array.isArray(body.tags) ? body.tags.map(t => String(t).trim()).filter(Boolean) : [],
    content: String(body.content || ''),
    lang,
  }

  const err = validateTranslationInput(input)
  if (err) throw createError({ statusCode: 400, statusMessage: err })

  const sourceHash = computeSourceHash(source)
  const generator = existing.generator && !existing.generator.endsWith('+manual')
    ? `${existing.generator}+manual`
    : (existing.generator || 'manual')

  writeInsightTranslation({
    slug,
    lang,
    title: input.title,
    description: input.description,
    category: existing.category,
    tags: input.tags,
    publishedAt: existing.publishedAt,
    updatedAt: new Date().toISOString(),
    author: existing.author,
    readingTime: existing.readingTime,
    draft: existing.draft,
    relatedTools: existing.relatedTools,
    content: input.content,
    translated_from: existing.translated_from || sourceHash,
    generator,
    locked: true,
    extraMeta: existing.extraMeta,
  })

  const stillCurrent = (existing.translated_from || sourceHash) === sourceHash
  patchTranslationState(slug, lang, {
    status: stillCurrent ? 'done' : 'locked-stale',
    hash: existing.translated_from || sourceHash,
    locked: true,
    error: null,
  })

  return {
    ok: true,
    slug,
    lang,
    translations: getTranslationOverview(slug, sourceHash),
  }
})
