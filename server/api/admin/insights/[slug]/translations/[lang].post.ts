import { isValidSlug, readInsightRaw, type TranslationLang } from '~~/server/utils/insights'
import { computeSourceHash } from '~~/server/utils/insights/hash'
import { regenerateTranslation } from '~~/server/utils/insights/translate'
import { getTranslationOverview } from '~~/server/utils/insights/translation-state'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

// Force-regenerate one language from the current source. Clears any manual
// lock — callers confirm this in the UI before invoking.
export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  const slug = getRouterParam(event, 'slug') || ''
  if (!isValidSlug(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const lang = getRouterParam(event, 'lang') as TranslationLang
  if (lang !== 'en' && lang !== 'zh-tw') {
    throw createError({ statusCode: 400, statusMessage: '不支持的语言' })
  }

  const body = await readBody<{ action?: string }>(event).catch(() => null)
  if (body?.action !== 'regenerate') {
    throw createError({ statusCode: 400, statusMessage: '未知的操作' })
  }

  const source = readInsightRaw(slug, 'zh-CN')
  if (!source) throw createError({ statusCode: 404, statusMessage: '源文章不存在' })

  try {
    // zh-tw resolves before this returns; en queues async and responds immediately.
    // force: the editor confirmed discarding any manual (locked) edits.
    await regenerateTranslation(slug, lang, { force: true })
  } catch (e) {
    throw createError({ statusCode: 500, statusMessage: e instanceof Error ? e.message : '重新生成失败' })
  }

  return {
    ok: true,
    slug,
    lang,
    translations: getTranslationOverview(slug, computeSourceHash(source)),
  }
})
